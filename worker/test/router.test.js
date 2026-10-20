import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createECDH } from 'node:crypto';
import { makeEnv, mockFetch, req, BASE } from './helpers.js';
import worker, { runCron } from '../src/index.js';
import { b64uEncode } from '../src/util.js';
import { cacheClear as memClear } from '../src/util.js';

const cacheClear = () => { memClear(); globalThis.caches.default._store?.clear(); };

const call = (env, r) => worker.fetch(r, env);

async function paired() {
  const env = makeEnv();
  const r = await call(env, req('/pair', { method: 'POST' }));
  const { key } = await r.json();
  return { env, key };
}

function fakeSub() {
  const ua = createECDH('prime256v1');
  ua.generateKeys();
  return { endpoint: 'https://web.push.apple.com/QAbc', keys: { p256dh: b64uEncode(ua.getPublicKey()), auth: b64uEncode(new Uint8Array(16).fill(7)) } };
}

test('pairing: first returns key, second 409', async () => {
  const env = makeEnv();
  const r1 = await call(env, req('/pair', { method: 'POST' }));
  assert.equal(r1.status, 200);
  const { key } = await r1.json();
  assert.match(key, /^[A-Za-z0-9_-]{43}$/);
  const r2 = await call(env, req('/pair', { method: 'POST' }));
  assert.equal(r2.status, 409);
});

test('auth: 401 without/with wrong key, 200 with key; query key only for /widget', async () => {
  const { env, key } = await paired();
  assert.equal((await call(env, req('/status'))).status, 401);
  assert.equal((await call(env, req('/status', { key: key + 'x' }))).status, 401);
  assert.equal((await call(env, req(`/status?k=${key}`))).status, 401);
  const r = await call(env, req('/status', { key }));
  assert.equal(r.status, 200);
  const s = await r.json();
  assert.equal(s.paired, true);
  assert.equal(s.connections.pushSubscribed, false);
  assert.equal(s.lastBackup, null);
  assert.equal((await call(env, req(`/widget?k=${key}`))).status, 404); // authorized, just empty
  assert.equal((await call(env, req('/nope', { key }))).status, 404);
});

test('CORS preflight and headers', async () => {
  const env = makeEnv();
  const r = await call(env, new Request(BASE + '/status', {
    method: 'OPTIONS',
    headers: { Origin: 'https://ishirj.github.io', 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'x-life-key,content-type' },
  }));
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://ishirj.github.io');
  assert.match(r.headers.get('Access-Control-Allow-Headers'), /X-Life-Key/);
  assert.match(r.headers.get('Access-Control-Allow-Methods'), /DELETE/);
  const bad = await call(env, new Request(BASE + '/status', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }));
  assert.equal(bad.headers.get('Access-Control-Allow-Origin'), null);
  const local = await call(env, new Request(BASE + '/vapid', { headers: { Origin: 'http://localhost:8765' } }));
  assert.equal(local.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8765');
  const { publicKey } = await local.json();
  assert.equal(publicKey.length, 87); // 65 bytes base64url
});

test('config: merge, secrets masked, webcal converted', async () => {
  const { env, key } = await paired();
  let r = await call(env, req('/config', { method: 'PUT', key, body: {
    calendars: [{ id: 'school', name: 'School', url: 'webcal://p01-caldav.icloud.com/x.ics', color: '#123456' }],
    ms: { clientId: 'cid', clientSecret: 'sec' },
  } }));
  let c = await r.json();
  assert.equal(c.ms.clientSecret, '********');
  assert.equal(c.calendars[0].url, 'https://p01-caldav.icloud.com/x.ics');
  // Partial update keeps secret when masked value is sent back.
  r = await call(env, req('/config', { method: 'PUT', key, body: { ms: { clientSecret: '********', tenant: 'consumers' }, google: { clientId: 'g' } } }));
  c = await r.json();
  const stored = env.LIFE.json('config');
  assert.equal(stored.ms.clientSecret, 'sec');
  assert.equal(stored.ms.tenant, 'consumers');
  assert.equal(stored.google.clientId, 'g');
  assert.equal(c.calendars.length, 1);
  assert.ok(!JSON.stringify(await (await call(env, req('/config', { key }))).json()).includes('sec"'));
});

test('cron: sends only due + unsent items, writes KV only when needed', async () => {
  const { env, key } = await paired();
  const now = Date.parse('2026-10-19T14:00:30Z');
  const iso = (ms) => new Date(ms).toISOString();
  await env.LIFE.put('sub', JSON.stringify(fakeSub()));
  await env.LIFE.put('schedule', JSON.stringify({ items: [
    { id: 'old', at: iso(now - 45 * 60000), title: 'too old', body: '' },
    { id: 'due1', at: iso(now - 60000), title: 'Due 1', body: 'b' },
    { id: 'due2', at: iso(now), title: 'Due 2', body: 'b' },
    { id: 'future', at: iso(now + 5 * 60000), title: 'Later', body: '' },
  ] }));
  await env.LIFE.put('sent', JSON.stringify({ [`due2|${iso(now)}`]: now - 1000, 'ancient|x': now - 9 * 86400000 }));
  await getVapidReady(env);
  const f = mockFetch(() => new Response(null, { status: 201 }));
  try {
    env.LIFE.writes = [];
    let r = await runCron(env, now);
    assert.equal(r.sent, 1);
    assert.equal(f.calls.length, 1);
    assert.deepEqual(env.LIFE.writes, ['sent']);
    const sent = env.LIFE.json('sent');
    assert.ok(sent[`due1|${iso(now - 60000)}`]);
    assert.ok(!sent['ancient|x'], 'pruned >8 days');

    // Second run in the same minute: nothing new → no fetch, no KV write.
    env.LIFE.writes = [];
    r = await runCron(env, now + 20000);
    assert.equal(r.sent, 0);
    assert.equal(f.calls.length, 1);
    assert.deepEqual(env.LIFE.writes, []);

    // Nothing due at all → no sent read needed, no writes.
    r = await runCron(env, now + 3 * 60000);
    assert.deepEqual(env.LIFE.writes, []);

    // Future item becomes due → sent.
    r = await runCron(env, now + 5 * 60000);
    assert.equal(r.sent, 1);
    assert.deepEqual(env.LIFE.writes, ['sent']);
  } finally { f.restore(); }
});

test('cron: 410 from push service deletes subscription; 5xx retried', async () => {
  const env = makeEnv();
  const now = Date.parse('2026-10-19T14:00:00Z');
  await env.LIFE.put('sub', JSON.stringify(fakeSub()));
  await env.LIFE.put('schedule', JSON.stringify({ items: [{ id: 'a', at: new Date(now).toISOString(), title: 'A', body: '' }] }));
  await getVapidReady(env);
  let status = 503;
  const f = mockFetch(() => new Response(null, { status }));
  try {
    env.LIFE.writes = [];
    await runCron(env, now);
    assert.deepEqual(env.LIFE.writes, []); // 503 → not marked, retry next minute
    status = 410;
    await runCron(env, now + 60000);
    assert.equal(env.LIFE.map.has('sub'), false);
    assert.deepEqual(env.LIFE.writes, []);
  } finally { f.restore(); }
});

async function getVapidReady(env) {
  await worker.fetch(req('/vapid'), env);
}

test('schedule PUT drops past items, caps 300; push test endpoint', async () => {
  const { env, key } = await paired();
  const now = Date.now();
  const items = [{ id: 'p', at: new Date(now - 3600e3).toISOString(), title: 'past', body: '' }];
  for (let i = 0; i < 350; i++) items.push({ id: `i${i}`, at: new Date(now + (i + 1) * 60e3).toISOString(), title: 't', body: 'b' });
  const r = await call(env, req('/schedule', { method: 'PUT', key, body: { items } }));
  assert.equal((await r.json()).count, 300);
  assert.equal(env.LIFE.json('schedule').items[0].id, 'i0');

  assert.equal((await call(env, req('/push/test', { method: 'POST', key }))).status, 400);
  await call(env, req('/push/subscription', { method: 'PUT', key, body: { subscription: fakeSub() } }));
  const f = mockFetch(() => new Response(null, { status: 201 }));
  try {
    const t = await (await call(env, req('/push/test', { method: 'POST', key }))).json();
    assert.equal(t.status, 201);
  } finally { f.restore(); }
  await call(env, req('/push/subscription', { method: 'DELETE', key }));
  assert.equal(env.LIFE.map.has('sub'), false);
});

test('backup rotation over 3 slots', async () => {
  const { env, key } = await paired();
  for (let i = 1; i <= 4; i++) {
    const r = await call(env, req('/backup', { method: 'PUT', key, body: `backup-${i}`, headers: { 'Content-Type': 'text/plain' } }));
    assert.equal(r.status, 200);
  }
  const meta = await (await call(env, req('/backup/list', { key }))).json();
  assert.deepEqual(meta.map((m) => m.slot), [0, 2, 1]);
  const latest = await call(env, req('/backup', { key }));
  assert.equal(await latest.text(), 'backup-4');
  assert.ok(latest.headers.get('X-Backup-Ts'));
  assert.equal(await (await call(env, req('/backup?slot=2', { key }))).text(), 'backup-3');
  const st = await (await call(env, req('/status', { key }))).json();
  assert.equal(st.lastBackup, meta[0].ts);
});

test('widget put/get via query key', async () => {
  const { env, key } = await paired();
  await call(env, req('/widget', { method: 'PUT', key, body: { summary: { kcalLeft: 812, protein: 120 } } }));
  const w = await (await call(env, req(`/widget?k=${encodeURIComponent(key)}`))).json();
  assert.equal(w.kcalLeft, 812);
  assert.ok(w._updated);
  const big = await call(env, req('/widget', { method: 'PUT', key, body: { summary: { x: 'a'.repeat(21000) } } }));
  assert.equal(big.status, 413);
});

test('health ingest: shortcut-style strings, lists, merge per date', async () => {
  const { env, key } = await paired();
  let r = await call(env, req('/ingest/health', { method: 'POST', key, body: {
    date: '2026-10-18', steps: '8,412', kcal: '1,950.4 kcal', protein: '140\n25', weight: '171.2\n170.8', sleepHours: '7.5',
  } }));
  assert.equal((await r.json()).accepted, 1);
  r = await call(env, req('/ingest/health', { method: 'POST', key, body: { days: [{ date: '2026-10-18', carbs: 210 }, { date: '2026-10-17', steps: 5000 }] } }));
  const h = env.LIFE.json('health');
  assert.deepEqual(
    (({ steps, kcal, protein, weightLb, sleepMin, carbs, source }) => ({ steps, kcal, protein, weightLb, sleepMin, carbs, source }))(h.days['2026-10-18']),
    { steps: 8412, kcal: 1950, protein: 165, weightLb: 170.8, sleepMin: 450, carbs: 210, source: 'apple' },
  );
  assert.equal(h.days['2026-10-17'].steps, 5000);
});

test('health GET merges Apple + Google (mocked), reauth on invalid_grant', async () => {
  cacheClear();
  const { env, key } = await paired();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
  await env.LIFE.put('health', JSON.stringify({ days: { [today]: { date: today, steps: 100, kcal: 1800, source: 'apple' } }, updated: 1 }));
  await env.LIFE.put('g_token', JSON.stringify({ refresh_token: 'r1' }));
  await env.LIFE.put('config', JSON.stringify({ google: { clientId: 'c', clientSecret: 's' } }));
  const [y, m, d] = today.split('-').map(Number);
  let grant = 'ok';
  const f = mockFetch((url, init) => {
    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      return grant === 'ok'
        ? Response.json({ access_token: 'at', expires_in: 3600 })
        : Response.json({ error: 'invalid_grant' }, { status: 400 });
    }
    if (url.includes('dailyRollUp')) {
      const body = JSON.parse(init.body);
      assert.equal(body.windowSizeDays, 1);
      return Response.json({ rollupDataPoints: [{ civilStartTime: { date: { year: y, month: m, day: d } }, steps: { countSum: '9876' } }] });
    }
    if (url.includes('/sleep/dataPoints')) {
      assert.match(decodeURIComponent(url), /sleep\.interval\.civil_end_time >= "/);
      const endIso = new Date(Date.UTC(y, m - 1, d, 11, 0)).toISOString();
      const startIso = new Date(Date.UTC(y, m - 1, d, 4, 0)).toISOString();
      return Response.json({ dataPoints: [{ sleep: { interval: { startTime: startIso, endTime: endIso } } }] });
    }
    return new Response('nope', { status: 404 });
  });
  try {
    let h = await (await call(env, req('/health?days=7', { key }))).json();
    assert.deepEqual(h.errors, []);
    const t = h.days.find((x) => x.date === today);
    assert.equal(t.steps, 9876);       // google preferred for steps
    assert.equal(t.kcal, 1800);        // apple nutrition kept
    assert.equal(t.sleepMin, 420);
    assert.equal(t.apple.steps, 100);
    assert.ok(h.sources.google);

    cacheClear();
    grant = 'bad';
    h = await (await call(env, req('/health?days=7', { key }))).json();
    assert.deepEqual(h.errors.map((e) => [e.source, e.code]), [['google', 'reauth']]);
    assert.equal(h.days.find((x) => x.date === today).steps, 100);
  } finally { f.restore(); cacheClear(); }
});

test('mail: Outlook (mocked Graph) merged with Gmail ingest', async () => {
  cacheClear();
  const { env, key } = await paired();
  await env.LIFE.put('config', JSON.stringify({ ms: { clientId: 'c', clientSecret: 's' } }));
  await env.LIFE.put('ms_token', JSON.stringify({ refresh_token: 'r1' }));
  await call(env, req('/ingest/gmail', { method: 'POST', key, body: { items: [
    { id: 'g1', from: 'A', subject: 'Gm', preview: 'p', date: '2026-10-19T10:00:00Z', link: 'https://mail.google.com/x' },
  ] } }));
  env.LIFE.writes = [];
  const f = mockFetch((url) => {
    if (url.includes('/oauth2/v2.0/token')) return Response.json({ access_token: 'at', refresh_token: 'r2', expires_in: 3600 });
    if (url.startsWith('https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages')) {
      assert.match(decodeURIComponent(url), /isRead eq false/);
      return Response.json({ value: [{ id: 'o1', subject: 'Ol', from: { emailAddress: { name: 'Prof', address: 'p@vt.edu' } }, receivedDateTime: '2026-10-19T12:00:00Z', bodyPreview: 'hi', webLink: 'https://outlook' }] });
    }
    return new Response('x', { status: 404 });
  });
  try {
    const m = await (await call(env, req('/mail', { key }))).json();
    assert.deepEqual(m.items.map((i) => [i.id, i.source]), [['o1', 'outlook'], ['g1', 'gmail']]);
    assert.equal(m.items[0].from, 'Prof');
    assert.deepEqual(env.LIFE.writes, ['ms_token']); // refresh token rotated → one write
  } finally { f.restore(); cacheClear(); }
});

test('oauth start redirects with signed state; callback stores refresh token', async () => {
  cacheClear();
  const { env, key } = await paired();
  await env.LIFE.put('config', JSON.stringify({ ms: { clientId: 'cid', clientSecret: 's', tenant: 'common' } }));
  const r = await call(env, req(`/oauth/ms/start?k=${key}&return=${encodeURIComponent('https://ishirj.github.io/life/')}`));
  assert.equal(r.status, 302);
  const loc = new URL(r.headers.get('Location'));
  assert.equal(loc.origin + loc.pathname, 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  assert.equal(loc.searchParams.get('redirect_uri'), `${BASE}/oauth/ms/callback`);
  assert.equal(loc.searchParams.get('scope'), 'offline_access User.Read Mail.Read Calendars.Read');
  const state = loc.searchParams.get('state');
  const f = mockFetch(() => Response.json({ access_token: 'a', refresh_token: 'rt', expires_in: 3600 }));
  try {
    const cb = await call(env, req(`/oauth/ms/callback?code=abc&state=${encodeURIComponent(state)}`));
    assert.equal(cb.status, 302);
    assert.equal(cb.headers.get('Location'), 'https://ishirj.github.io/life/#connected=outlook');
    assert.equal(env.LIFE.json('ms_token').refresh_token, 'rt');
    const bad = await call(env, req(`/oauth/ms/callback?code=abc&state=${encodeURIComponent(state.slice(0, -2) + 'xx')}`));
    assert.equal(bad.status, 400);
  } finally { f.restore(); cacheClear(); }
  // start without key → 401
  assert.equal((await call(env, req('/oauth/google/start'))).status, 401);
});

test('calendar route fetches ICS (mocked) and reports per-calendar errors', async () => {
  cacheClear();
  const { env, key } = await paired();
  await env.LIFE.put('config', JSON.stringify({ calendars: [
    { id: 'a', name: 'A', url: 'https://cal.example/a.ics' },
    { id: 'b', name: 'B', url: 'https://cal.example/b.ics' },
  ] }));
  const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:1\r\nDTSTART:20261020T150000Z\r\nDTEND:20261020T160000Z\r\nSUMMARY:Test\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  const f = mockFetch((url) => (url.endsWith('a.ics') ? new Response(ics) : new Response('gone', { status: 404 })));
  try {
    const r = await (await call(env, req('/calendar?from=2026-10-20&to=2026-10-20', { key }))).json();
    assert.deepEqual(r.events.map((e) => [e.cal, e.title, e.start, e.end]), [['a', 'Test', '2026-10-20T11:00', '2026-10-20T12:00']]);
    assert.deepEqual(r.errors, [{ cal: 'b', message: 'HTTP 404' }]);
    await call(env, req('/calendar?from=2026-10-20&to=2026-10-20', { key }));
    assert.equal(f.calls.filter((c) => c.url.endsWith('a.ics')).length, 1, 'cached');
    assert.equal((await call(env, req('/calendar?from=bad&to=2026-10-20', { key }))).status, 400);
  } finally { f.restore(); cacheClear(); }
});

test('sync: versioned document with conflict detection', async () => {
  const { env, key } = await paired();
  let r = await call(env, req('/sync', { key }));
  assert.deepEqual(await r.json(), { ver: 0, ts: 0, doc: null });
  r = await call(env, req('/sync', { key, method: 'PUT', body: { base: 0, doc: { entries: [{ id: 'a', u: 1 }] } } }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ver, 1);
  r = await call(env, req('/sync', { key, method: 'PUT', body: { base: 0, doc: { entries: [] } } }));
  assert.equal(r.status, 409);
  assert.equal((await r.json()).ver, 1);
  r = await call(env, req('/sync', { key }));
  const d = await r.json();
  assert.equal(d.ver, 1);
  assert.equal(d.doc.entries[0].id, 'a');
  r = await call(env, req('/sync', { key, method: 'PUT', body: { base: 1, doc: { nope: 1 } } }));
  assert.equal(r.status, 400);
});

test('sync: notebooks index, items, newer-wins and deletes', async () => {
  const { env, key } = await paired();
  let r = await call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [
    { kind: 'book', id: 'b1', u: 10, data: { id: 'b1', title: 'Math' } },
    { kind: 'page', id: 'p1', u: 10, data: { id: 'p1', strokes: [] } },
  ] } }));
  assert.equal(r.status, 200);
  let idx = (await r.json()).index;
  assert.equal(idx.books.b1.u, 10);
  r = await call(env, req('/sync/notes/item?kind=book&id=b1', { key }));
  assert.equal((await r.json()).title, 'Math');
  // older write is ignored
  await call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [{ kind: 'book', id: 'b1', u: 5, data: { id: 'b1', title: 'Old' } }] } }));
  r = await call(env, req('/sync/notes/item?kind=book&id=b1', { key }));
  assert.equal((await r.json()).title, 'Math');
  // delete leaves a tombstone
  r = await call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [{ kind: 'page', id: 'p1', u: 20, deleted: true }] } }));
  idx = (await r.json()).index;
  assert.equal(idx.pages.p1.d, 1);
  r = await call(env, req('/sync/notes/item?kind=page&id=p1', { key }));
  assert.equal(r.status, 404);
});

test('inbox: shortcuts post text, app reads and clears it', async () => {
  const { env, key } = await paired();
  let r = await call(env, req('/inbox', { key, method: 'POST', body: { text: '  40g   protein ' } }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).saved, '40g protein');
  r = await call(env, req('/inbox', { key, method: 'POST', body: 'task email Bansal', headers: { 'Content-Type': 'text/plain' } }));
  assert.equal(r.status, 200);
  assert.equal((await call(env, req('/inbox', { method: 'POST', body: { text: 'x' } }))).status, 401);
  assert.equal((await call(env, req('/inbox', { key, method: 'POST', body: { text: '' } }))).status, 400);
  r = await call(env, req('/inbox', { key }));
  const list = await r.json();
  assert.deepEqual(list.map((x) => x.text), ['40g protein', 'task email Bansal']);
  r = await call(env, req('/inbox', { key, method: 'DELETE', body: { ids: [list[0].id] } }));
  assert.equal((await r.json()).left, 1);
});
