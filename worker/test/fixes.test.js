// Regression tests for the security/bug review fixes (one block per finding).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createECDH } from 'node:crypto';
import { makeEnv, mockFetch, req, BASE, FakeWS } from './helpers.js';
import worker, { runCron, cleanSchedule, redactPreview } from '../src/index.js';
import { getVapid, trimPayload } from '../src/webpush.js';
import { b64uEncode, cacheClear as memClear, safeIso, readJson } from '../src/util.js';
import { logScreen, cleanActions, isYouTube } from '../src/extras.js';
import { expandIcs } from '../src/ics.js';

const cacheClear = () => { memClear(); globalThis.caches.default._store?.clear(); };
const call = (env, r) => worker.fetch(r, env);
async function paired(env = makeEnv()) {
  const { key } = await (await call(env, req('/pair', { method: 'POST' }))).json();
  return { env, key };
}
function fakeSub() {
  const ua = createECDH('prime256v1');
  ua.generateKeys();
  return { endpoint: 'https://web.push.apple.com/QAbc', keys: { p256dh: b64uEncode(ua.getPublicKey()), auth: b64uEncode(new Uint8Array(16).fill(7)) } };
}
const jarvis = (env) => env._hubCtx.storage.get('jarvis');

// ---- 1. /pair ----
test('pair: concurrent first calls give exactly one key', async () => {
  const env = makeEnv();
  const rs = await Promise.all([1, 2, 3, 4].map(() => call(env, req('/pair', { method: 'POST' }))));
  assert.deepEqual(rs.map((r) => r.status).sort(), [200, 409, 409, 409]);
  const { key } = await rs.find((r) => r.status === 200).json();
  assert.equal(await env.LIFE.get('key'), key);
});

test('pair: a stale "no key" KV read cannot pair a second time; optional PAIR_SECRET', async () => {
  const { env } = await paired();
  const real = env.LIFE.map.get('key');
  env.LIFE.map.delete('key');   // simulate an edge location that still sees no key
  assert.equal((await call(env, req('/pair', { method: 'POST' }))).status, 409);
  env.LIFE.map.set('key', real);
  // an existing deployment (key in KV, nothing in the DO yet) stays paired
  const env2 = makeEnv({ key: 'k'.repeat(43) });
  assert.equal((await call(env2, req('/pair', { method: 'POST' }))).status, 409);
  const env3 = makeEnv();
  env3.PAIR_SECRET = 's3cret';
  assert.equal((await call(env3, req('/pair', { method: 'POST' }))).status, 403);
  assert.equal((await call(env3, req('/pair', { method: 'POST', headers: { 'X-Pair-Secret': 's3cret' } }))).status, 200);
});

// ---- 2. JARVIS stop ----
test('jarvis: a stale stop does not drop commands queued after it', async () => {
  const { env, key } = await paired();
  await call(env, req('/jarvis/wake', { method: 'POST', key, body: { mode: 'stop' } }));
  const j = await jarvis(env);
  j.stop = Date.now() - 5 * 60000;   // laptop was off; stop is old now
  await env._hubCtx.storage.put('jarvis', j);
  const { id } = await (await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: 'open spotify' } }))).json();
  const next = await (await call(env, req('/jarvis/next', { key }))).json();
  assert.equal(next.id, id);
  assert.equal(next.text, 'open spotify');
  const log = await (await call(env, req('/jarvis/log', { key }))).json();
  assert.equal(log.log.find((l) => l.id === id).state, 'running');
});

test('jarvis: a fresh stop is handed over, then the command sent after it runs (not marked Stopped)', async () => {
  const { env, key } = await paired();
  const { id: a } = await (await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: 'long task' } }))).json();
  await call(env, req('/jarvis/next', { key }));
  await call(env, req('/jarvis/wake', { method: 'POST', key, body: { mode: 'stop' } }));
  await new Promise((r) => setTimeout(r, 5));
  const { id: b } = await (await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: 'new task' } }))).json();
  assert.deepEqual(await (await call(env, req('/jarvis/next?busy=1', { key }))).json(), { stop: true });
  const next = await (await call(env, req('/jarvis/next', { key }))).json();
  assert.equal(next.id, b);
  const log = (await (await call(env, req('/jarvis/log', { key }))).json()).log;
  assert.equal(log.find((l) => l.id === a).reply, 'Stopped.');
  assert.equal(log.find((l) => l.id === b).state, 'running');
});

test('jarvis: commands trimmed off a full queue are marked dropped, not left queued', async () => {
  const { env, key } = await paired();
  const ids = [];
  for (let i = 0; i < 22; i++) ids.push((await (await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: `c${i}` } }))).json()).id);
  const j = await jarvis(env);
  assert.equal(j.q.length, 20);
  assert.equal(j.q[0].id, ids[2]);
  for (const id of ids.slice(0, 2)) {
    const l = j.log.find((x) => x.id === id);
    assert.equal(l.state, 'error'); assert.match(l.reply, /Dropped/);
  }
});

// ---- 3. notebooks ----
test('notes: an item without data is rejected and the index does not move', async () => {
  const { env, key } = await paired();
  const r = await (await call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [{ kind: 'page', id: 'p1', u: 10 }] } }))).json();
  assert.deepEqual(r.rejected, ['p1']);
  assert.equal(r.index.pages.p1, undefined);
  assert.equal([...env.LIFE.map.keys()].filter((k) => k.startsWith('nb:')).length, 0);
});

test('notes: content is in KV before the index changes (other devices never see a 404)', async () => {
  const { env, key } = await paired();
  const orig = env.HUB.get;
  env.HUB.get = (id) => {
    const stub = orig(id);
    return { fetch: async (r) => {
      if (new URL(r.url).pathname === '/sync/notes/apply') {
        const body = JSON.parse(await r.clone().text());
        for (const it of body.items) if (!it.deleted) assert.ok(env.LIFE.map.get(`nb:pages:${it.id}@${it.u}`), 'content written first');
      }
      return stub.fetch(r);
    } };
  };
  await call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [{ kind: 'page', id: 'p1', u: 10, data: { id: 'p1', s: 1 } }] } }));
  const got = await (await call(env, req('/sync/notes/item?kind=page&id=p1', { key }))).json();
  assert.equal(got.s, 1);
});

test('notes: a slower, older save cannot leave old content behind the newer index entry', async () => {
  const { env, key } = await paired();
  const put = (u, s) => call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [{ kind: 'book', id: 'b1', u, data: { id: 'b1', s } }] } }));
  await put(20, 'new');
  await put(10, 'old');   // arrives late
  assert.equal((await (await call(env, req('/sync/notes/item?kind=book&id=b1', { key }))).json()).s, 'new');
  await put(30, 'newest');
  assert.equal((await (await call(env, req('/sync/notes/item?kind=book&id=b1', { key }))).json()).s, 'newest');
  assert.deepEqual([...env.LIFE.map.keys()].filter((k) => k.startsWith('nb:')), ['nb:books:b1@30'], 'replaced versions removed');
});

test('notes: data saved by the old version (unversioned key) is still readable and replaced cleanly', async () => {
  const env = makeEnv({ 'nb:index': JSON.stringify({ books: {}, pages: { p9: { u: 5 } } }), 'nb:pages:p9': JSON.stringify({ id: 'p9', s: 'legacy' }) });
  const { key } = await paired(env);
  assert.equal((await (await call(env, req('/sync/notes/item?kind=page&id=p9', { key }))).json()).s, 'legacy');
  await call(env, req('/sync/notes', { key, method: 'PUT', body: { items: [{ kind: 'page', id: 'p9', u: 6, data: { id: 'p9', s: 'v2' } }] } }));
  assert.equal((await (await call(env, req('/sync/notes/item?kind=page&id=p9', { key }))).json()).s, 'v2');
  assert.equal(env.LIFE.map.has('nb:pages:p9'), false);
});

// ---- 4. key rotation ----
test('key rotate closes open live connections', async () => {
  const { env, key } = await paired();
  const a = new FakeWS(), b = new FakeWS();
  env._hubCtx.sockets.push(a, b);
  await call(env, req('/key/rotate', { method: 'POST', key, body: {} }));
  assert.equal(a.closed.code, 4001); assert.equal(b.closed.code, 4001);
});

test('websocket: correct key in the subprotocol is accepted and gets hello', async () => {
  const { env, key } = await paired();
  const r = await call(env, req('/sync/ws?d=phone1', { headers: { Upgrade: 'websocket', 'Sec-WebSocket-Protocol': `life, ${key}` } }));
  assert.equal(r.status, 101);
  const server = env._hubCtx.sockets[0];
  assert.equal(server.att.device, 'phone1');
  assert.equal(JSON.parse(server.sent[0]).t, 'hello');
});

// ---- 5. invalid dates ----
test('invalid dates: bus, jobs and gmail ingest skip or default instead of 500', async () => {
  cacheClear();
  const { env, key } = await paired();
  const f = mockFetch(() => new Response('<x><StopName>S</StopName><AdjustedDepartureTime>garbage</AdjustedDepartureTime><AdjustedDepartureTime>2026-10-20T22:25:00-04:00</AdjustedDepartureTime></x>'));
  try {
    const r = await call(env, req('/bus?route=NMG&stop=1411', { key }));
    assert.equal(r.status, 200);
    assert.deepEqual((await r.json()).deps, ['2026-10-21T02:25:00.000Z']);
  } finally { f.restore(); cacheClear(); }
  let r = await call(env, req('/ingest/jobs', { method: 'POST', key, body: { items: [{ id: 't1', subject: 'x', date: 'not a date' }, null, 5] } }));
  assert.equal(r.status, 200);
  assert.equal(env.LIFE.json('jobmail').items.t1.date, '');
  r = await call(env, req('/ingest/gmail', { method: 'POST', key, body: { items: [{ id: 'g1', date: 'nope' }, null] } }));
  assert.equal(r.status, 200);
  assert.ok(Date.parse(env.LIFE.json('gmail').items[0].date));
  assert.equal(safeIso('2026-13-45'), '');
  assert.equal(safeIso(8.7e15), '');
});

// ---- 6. error messages ----
test('unhandled errors return generic text (details only in the log)', async () => {
  const { env, key } = await paired();
  env.HUB.get = () => ({ fetch: async () => { throw new Error('secret internal detail'); } });
  const orig = console.error; const logged = [];
  console.error = (...a) => logged.push(a.join(' '));
  try {
    const r = await call(env, req('/sync', { key }));
    assert.equal(r.status, 500);
    const t = await r.text();
    assert.ok(!t.includes('secret'));
    assert.deepEqual(JSON.parse(t), { error: 'internal error' });
    assert.ok(logged.some((l) => l.includes('secret internal detail')));
  } finally { console.error = orig; }
});

// ---- 7. outbound fetch limits ----
function bigStream(total, chunk = 65536) {
  let sent = 0;
  const s = new ReadableStream({ pull(c) { if (sent >= total) { c.close(); return; } const n = Math.min(chunk, total - sent); sent += n; c.enqueue(new Uint8Array(n).fill(65)); } });
  return { s, sent: () => sent };
}
test('outbound: ICS feeds are size-capped and every fetch carries a timeout signal', async () => {
  cacheClear();
  const { env, key } = await paired();
  await env.LIFE.put('config', JSON.stringify({ calendars: [{ id: 'big', name: 'B', url: 'https://cal.example/big.ics' }, { id: 'ftp', name: 'F', url: 'ftp://x/y.ics' }] }));
  const big = bigStream(50 * 1024 * 1024);
  const f = mockFetch(() => new Response(big.s));
  try {
    const r = await (await call(env, req('/calendar?from=2026-10-20&to=2026-10-20', { key }))).json();
    assert.deepEqual(r.errors.map((e) => e.cal).sort(), ['big', 'ftp']);
    assert.match(r.errors.find((e) => e.cal === 'big').message, /too large/);
    assert.ok(big.sent() < 7 * 1024 * 1024, 'stopped reading early');
    assert.ok(f.calls.every((c) => c.init.signal), 'timeout signal set');
  } finally { f.restore(); cacheClear(); }
});

test('outbound: reel page captions read at most ~400 KB', async () => {
  const { env, key } = await paired();
  await call(env, req('/config', { method: 'PUT', key, body: { geminiKey: 'G' } }));
  const big = bigStream(30 * 1024 * 1024);
  const f = mockFetch((url) => (url.startsWith('https://generativelanguage') ? Response.json({ candidates: [{ content: { parts: [{ text: '{"kind":"other","title":"t","summary":"s"}' }] } }] }) : new Response(big.s)));
  try {
    const r = await call(env, req('/reels', { method: 'POST', key, body: { url: 'https://www.instagram.com/reel/x' } }));
    assert.equal(r.status, 422);   // no og: tags in the junk page
    assert.ok(big.sent() < 1024 * 1024);
  } finally { f.restore(); }
});

// ---- 8. request body caps ----
test('bodies: Content-Length over the cap is refused before reading; streamed bodies are capped', async () => {
  let pulled = 0;
  const stream = new ReadableStream({ pull(c) { pulled++; c.enqueue(new Uint8Array(1024)); } });
  const r1 = new Request(BASE + '/x', { method: 'POST', body: stream, duplex: 'half', headers: { 'Content-Length': '5000000' } });
  await assert.rejects(readJson(r1, 1000), (e) => e.status === 413);
  assert.ok(pulled <= 1, "not read (one eager pull by the Request constructor is fine)");
  const endless = new ReadableStream({ pull(c) { pulled++; c.enqueue(new Uint8Array(1024)); } });
  await assert.rejects(readJson(new Request(BASE + '/x', { method: 'POST', body: endless, duplex: 'half' }), 10_000), (e) => e.status === 413);
  assert.ok(pulled < 20);
  const { env, key } = await paired();
  const v = await call(env, new Request(BASE + '/jarvis/voice?id=a1', { method: 'POST', headers: { 'X-Life-Key': key }, body: new Uint8Array(4_000_001) }));
  assert.equal(v.status, 413);
  const b = await call(env, new Request(BASE + '/backup', { method: 'PUT', headers: { 'X-Life-Key': key }, body: 'x'.repeat(20 * 1024 * 1024 + 1) }));
  assert.equal(b.status, 413);
});

// ---- 9-11. small crashes ----
test('voice GET with a tiny file, null/number JSON bodies, trailing slashes', async () => {
  const { env, key } = await paired();
  await call(env, new Request(BASE + '/jarvis/voice?id=t1', { method: 'POST', headers: { 'X-Life-Key': key }, body: new Uint8Array([1]) }));
  const g = await call(env, req('/jarvis/voice?id=t1', { key }));
  assert.equal(g.status, 200); assert.equal(g.headers.get('content-type'), 'audio/mpeg');
  for (const [m, p] of [['PUT', '/config'], ['PUT', '/push/subscription'], ['POST', '/ingest/gmail'], ['PUT', '/schedule'], ['POST', '/ingest/health'], ['POST', '/screen']]) {
    for (const body of ['null', '42', '"s"']) {
      const r = await call(env, req(p, { method: m, key, body, headers: { 'Content-Type': 'application/json' } }));
      assert.equal(r.status, 400, `${m} ${p} ${body}`);
    }
  }
  for (const p of ['/jarvis/cmd', '/jarvis/reply', '/jarvis/wake', '/jarvis/step']) {
    const r = await call(env, req(p, { method: 'POST', key, body: 'null', headers: { 'Content-Type': 'application/json' } }));
    assert.ok(r.status < 500, p);
  }
  assert.equal((await call(env, req('/sync/', { key }))).status, 200);
  assert.equal((await call(env, req('/jarvis/log/', { key }))).status, 200);
  assert.equal((await call(env, req('/sync/status/', { key }))).status, 200);
});

// ---- 12. cron ----
test('cron: a broken subscription never throws, is recorded once, and is not re-sent', async () => {
  const env = makeEnv();
  const now = Date.parse('2026-10-19T14:00:00Z');
  await env.LIFE.put('sub', JSON.stringify({ endpoint: 'https://web.push.apple.com/x', keys: { p256dh: 'AAAA', auth: 'BBBB' } }));
  await env.LIFE.put('schedule', JSON.stringify({ items: [{ id: 'a', at: new Date(now).toISOString(), title: 'A', body: '' }, { id: 'b', at: new Date(now).toISOString(), title: 'B', body: '' }] }));
  const f = mockFetch(() => new Response(null, { status: 201 }));
  const orig = console.error; console.error = () => {};
  try {
    const r = await runCron(env, now);
    assert.equal(r.wrote, true);
    assert.equal(f.calls.length, 0);
    const sent = env.LIFE.json('sent');
    assert.equal(Object.keys(sent).length, 2);
  } finally { f.restore(); console.error = orig; }
});

test('cron: earlier deliveries are recorded even if a later send blows up unexpectedly', async () => {
  const env = makeEnv();
  const now = Date.parse('2026-10-19T15:00:00Z');
  await env.LIFE.put('sub', JSON.stringify(fakeSub()));
  await env.LIFE.put('schedule', JSON.stringify({ items: [{ id: 'ok1', at: new Date(now).toISOString(), title: 'A', body: '' }, { id: 'boom', at: new Date(now).toISOString(), title: 'B', body: '' }] }));
  await getVapid(env);
  let n = 0;
  const f = mockFetch(() => { n++; if (n === 2) throw new Error('socket hang up'); return new Response(null, { status: 201 }); });
  const orig = console.error; console.error = () => {};
  try {
    const r = await runCron(env, now);
    assert.equal(r.sent, 1);
    assert.ok(env.LIFE.json('sent')[`ok1|${new Date(now).toISOString()}`]);
    await runCron(env, now + 60000);
    assert.equal(f.calls.filter((c) => c.url.includes('push.apple')).length, 3, 'ok1 not repeated; boom retried once');
  } finally { f.restore(); console.error = orig; }
});

test('push subscription keys are validated', async () => {
  const { env, key } = await paired();
  const bad = { endpoint: 'https://web.push.apple.com/x', keys: { p256dh: 'AAAA', auth: 'BBBB' } };
  assert.equal((await call(env, req('/push/subscription', { method: 'PUT', key, body: { subscription: bad } }))).status, 400);
  assert.equal((await call(env, req('/push/subscription', { method: 'PUT', key, body: { subscription: fakeSub() } }))).status, 200);
});

test('push payload always fits one record; encrypted reminders pass enc through', () => {
  const p = trimPayload({ title: 'Life', body: 'é'.repeat(1000), enc: { iv: 'a'.repeat(16), ct: 'b'.repeat(3000) } });
  assert.ok(new TextEncoder().encode(JSON.stringify(p)).length <= 4096 - 17);
  const small = trimPayload({ title: 'Life', body: '', enc: { iv: 'aaaa', ct: 'bbbb' } });
  assert.deepEqual(small.enc, { iv: 'aaaa', ct: 'bbbb' });
  const now = Date.now();
  const items = cleanSchedule([{ id: 'x', at: new Date(now + 60000).toISOString(), title: 'Life', body: '', enc: { iv: 'aXY', ct: 'Q2==' } }, { id: 'y', at: new Date(now + 60000).toISOString(), enc: { iv: '<script>', ct: 1 } }], now);
  assert.deepEqual(items[0].enc, { iv: 'aXY', ct: 'Q2==' });
  assert.equal(items[1].enc, undefined);
});

// ---- 13. atomic doc write ----
test('sync doc: chunks and version written in one storage put; shrinking removes extra chunks', async () => {
  const { env, key } = await paired();
  const st = env._hubCtx.storage;
  const big = { entries: Array.from({ length: 3000 }, (_, i) => ({ id: 'e' + i, t: 'x'.repeat(600) })) };
  await call(env, req('/sync', { key, method: 'PUT', body: { base: 0, doc: big } }));
  const last = st.puts.find((k) => k.includes('meta') && k.includes('doc:1'));
  assert.ok(last, 'meta and chunks in the same put');
  await call(env, req('/sync', { key, method: 'PUT', body: { base: 1, doc: { entries: [] } } }));
  assert.equal(st.m.has('doc:1'), false);
  assert.deepEqual((await (await call(env, req('/sync', { key }))).json()).doc, { entries: [] });
});

// ---- 14. bus over https with fallback ----
test('bus: https first, http only when https is unreachable', async () => {
  cacheClear();
  const { env, key } = await paired();
  const f = mockFetch((url) => { if (url.startsWith('https:')) throw new TypeError('tls'); return new Response('<x><AdjustedDepartureTime>2026-10-20T22:25:00-04:00</AdjustedDepartureTime></x>'); });
  try {
    const b = await (await call(env, req('/bus?route=HWA&stop=1200', { key }))).json();
    assert.equal(b.deps.length, 1);
    assert.deepEqual(f.calls.map((c) => c.url.split(':')[0]), ['https', 'http']);
    assert.ok(f.calls.every((c) => c.init.signal));
  } finally { f.restore(); cacheClear(); }
});

// ---- 15. OAuth disconnect ----
test('oauth disconnect: a cached access token is not used afterwards', async () => {
  cacheClear();
  const { env, key } = await paired();
  await env.LIFE.put('config', JSON.stringify({ ms: { clientId: 'c', clientSecret: 's' } }));
  await env.LIFE.put('ms_token', JSON.stringify({ refresh_token: 'r1', ts: 1 }));
  let tokenCalls = 0;
  const f = mockFetch((url) => {
    if (url.includes('/oauth2/v2.0/token')) { tokenCalls++; return Response.json({ access_token: 'at' + tokenCalls, expires_in: 3600 }); }
    return Response.json({ value: [] });
  });
  try {
    let r = await (await call(env, req('/outlook/calendar?from=2026-10-20&to=2026-10-20', { key }))).json();
    assert.deepEqual(r.errors, []);
    r = await (await call(env, req('/outlook/calendar?from=2026-10-20&to=2026-10-20', { key }))).json();
    assert.equal(tokenCalls, 1, 'token cached while connected');
    // new client id in Settings → old cached token not reused
    await call(env, req('/config', { method: 'PUT', key, body: { ms: { clientId: 'c2' } } }));
    await call(env, req('/outlook/calendar?from=2026-10-20&to=2026-10-20', { key }));
    assert.equal(tokenCalls, 2);
    await call(env, req('/oauth/ms', { method: 'DELETE', key }));
    const before = f.calls.length;
    r = await (await call(env, req('/outlook/calendar?from=2026-10-20&to=2026-10-20', { key }))).json();
    assert.equal(r.errors[0].code, 'reauth');
    assert.equal(f.calls.length, before, 'no Graph call with the old token');
  } finally { f.restore(); cacheClear(); }
});

// ---- 16. AI outputs validated ----
test('jarvis ask: Workers AI fallback actions are filtered and clamped', async () => {
  const { env, key } = await paired();   // no Gemini key → falls back to Workers AI
  const acts = [{ type: 'rm_rf', title: 'x' }, { type: 'log_food', title: 'Pizza', kcal: 99999, protein: '-5', grams: 'lots', meal: 'brunch' },
    { type: 'add_task', title: 'T'.repeat(500), due: '2026-10-21', time: '25:99', urgency: 9, evil: '<img>' },
    ...Array.from({ length: 6 }, () => ({ type: 'add_task', title: 'more' }))];
  env.AI = { run: async () => ({ response: 'Sure! ' + JSON.stringify({ reply: 'Done.', actions: acts }) }) };
  const r = await (await call(env, req('/jarvis/ask', { method: 'POST', key, body: { text: 'log pizza' } }))).json();
  assert.equal(r.via, 'workers-ai');
  assert.equal(r.actions.length, 5);
  assert.deepEqual(r.actions[0], { type: 'log_food', title: 'Pizza', kcal: 5000, protein: 0, grams: 0 });
  assert.equal(r.actions[1].title.length, 80);
  assert.equal(r.actions[1].due, '2026-10-21');
  assert.equal(r.actions[1].time, undefined);
  assert.equal(r.actions[1].urgency, 3);
  assert.equal(r.actions[1].evil, undefined);
  assert.deepEqual(cleanActions('nope'), []);
});

test('ai food: numbers coerced and clamped, strings trimmed', async () => {
  const { env, key } = await paired();
  await call(env, req('/config', { method: 'PUT', key, body: { geminiKey: 'G' } }));
  const f = mockFetch(() => Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ items: [{ name: ' ' + 'n'.repeat(200), grams: 1e9, kcal: -4, protein: 'NaN', fat: '12.34', carbs: Infinity, confidence: 'HIGH' }, 'junk'] }) }] } }] }));
  try {
    const b = await (await call(env, req('/ai/food', { method: 'POST', key, body: { text: 'x' } }))).json();
    assert.equal(b.items.length, 1);
    assert.deepEqual(b.items[0], { name: 'n'.repeat(80), grams: 3000, kcal: 0, protein: 0, fat: 12.3, carbs: 0, confidence: 'high' });
  } finally { f.restore(); }
});

// ---- 17. rate limits ----
test('rate limit: generous per-minute cap on JARVIS commands, 429 with Retry-After past it', async () => {
  const { env, key } = await paired();
  let last;
  for (let i = 0; i < 61; i++) last = await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: `c${i}` } }));
  assert.equal(last.status, 429);
  assert.ok(Number(last.headers.get('Retry-After')) > 0);
  // other groups are separate; reading the log is never limited
  assert.equal((await call(env, req('/jarvis/log', { key }))).status, 200);
  const v = await call(env, new Request(BASE + '/jarvis/voice?id=z', { method: 'POST', headers: { 'X-Life-Key': key }, body: new Uint8Array([1, 2]) }));
  assert.equal(v.status, 200);
});

// ---- 18. youtube ----
test('reels: only real YouTube hosts are sent to Gemini as video links', () => {
  assert.equal(isYouTube('https://www.youtube.com/shorts/abc'), true);
  assert.equal(isYouTube('https://youtu.be/abc'), true);
  assert.equal(isYouTube('https://m.youtube.com/watch?v=1'), true);
  assert.equal(isYouTube('https://evil.com/youtube'), false);
  assert.equal(isYouTube('https://youtube.com.evil.com/x'), false);
  assert.equal(isYouTube('https://notyoutu.be/x'), false);
});

// ---- 20. VAPID ----
test('vapid: concurrent first calls agree on one key', async () => {
  const env = makeEnv();
  const [a, b, c] = await Promise.all([getVapid(env), getVapid(env), call(env, req('/vapid')).then((r) => r.json())]);
  assert.equal(a.publicKey, b.publicKey);
  assert.equal(a.publicKey, c.publicKey);
  assert.equal(env.LIFE.json('vapid').publicKey, a.publicKey);
});

// ---- 21. time zone ----
test('screen time uses the local day of the given zone (DST-aware)', async () => {
  const env = makeEnv();
  const now = Date.parse('2026-11-05T04:30:00Z');   // 23:30 Nov 4 in New York (EST, UTC-5)
  await logScreen(new Request(BASE + '/screen', { method: 'POST', body: '{"app":"instagram"}' }), env, 'America/New_York', now);
  await logScreen(new Request(BASE + '/screen', { method: 'POST', body: '{"app":"instagram"}' }), env, 'Asia/Kolkata', now);
  const s = env.LIFE.json('screen');
  assert.equal(s.days['2026-11-04']['instagram:paused'], 1);
  assert.equal(s.days['2026-11-05']['instagram:paused'], 1);
});

test('X-Life-TZ header: allowed by CORS, used and saved; invalid zones ignored', async () => {
  cacheClear();
  const { env, key } = await paired();
  const pre = await call(env, new Request(BASE + '/status', { method: 'OPTIONS', headers: { Origin: 'https://ishirj.github.io' } }));
  assert.match(pre.headers.get('Access-Control-Allow-Headers'), /X-Life-TZ/);
  await call(env, req('/status', { key, headers: { 'X-Life-TZ': 'Not/AZone' } }));
  assert.equal(env.LIFE.json('config'), null);
  const st = await (await call(env, req('/status', { key, headers: { 'X-Life-TZ': 'Asia/Dubai' } }))).json();
  assert.equal(st.tz, 'Asia/Dubai');
  assert.equal(env.LIFE.json('config').tz, 'Asia/Dubai');
  // calendar wall-clock times follow it
  await env.LIFE.put('config', JSON.stringify({ tz: 'Asia/Dubai', calendars: [{ id: 'a', name: 'A', url: 'https://cal.example/tz.ics' }] }));
  const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:1\r\nDTSTART:20261020T150000Z\r\nDTEND:20261020T160000Z\r\nSUMMARY:T\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  const f = mockFetch(() => new Response(ics));
  try {
    const r = await (await call(env, req('/calendar?from=2026-10-20&to=2026-10-20', { key, headers: { 'X-Life-TZ': 'America/Chicago' } }))).json();
    assert.equal(r.events[0].start, '2026-10-20T10:00');
  } finally { f.restore(); cacheClear(); }
});

// ---- 22. ICS cost ----
test('ics: an old count-less daily rule is expanded quickly and correctly', () => {
  const ics = 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:old\r\nDTSTART;TZID=America/New_York:20000103T090000\r\nDTEND;TZID=America/New_York:20000103T100000\r\nRRULE:FREQ=DAILY;BYDAY=MO,WE,FR\r\nSUMMARY:Standup\r\nEND:VEVENT\r\n'
    + 'BEGIN:VEVENT\r\nUID:wk\r\nDTSTART:19990104T140000Z\r\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU\r\nSUMMARY:Biweekly\r\nEND:VEVENT\r\n'
    + 'BEGIN:VEVENT\r\nUID:mo\r\nDTSTART;VALUE=DATE:19950131\r\nRRULE:FREQ=MONTHLY;BYMONTHDAY=-1\r\nSUMMARY:Month end\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n';
  const t0 = Date.now();
  const ev = expandIcs(ics, { from: '2026-10-19', to: '2026-11-01', tz: 'America/New_York' });
  assert.ok(Date.now() - t0 < 500, 'fast');
  assert.deepEqual(ev.filter((e) => e.title === 'Standup').map((e) => e.start.slice(0, 10)),
    ['2026-10-19', '2026-10-21', '2026-10-23', '2026-10-26', '2026-10-28', '2026-10-30']);
  assert.ok(ev.filter((e) => e.title === 'Standup').every((e) => e.start.endsWith('T09:00')));
  // 1999-01-04 is a Monday; every other Tuesday from 1999-01-05
  const bi = ev.filter((e) => e.title === 'Biweekly').map((e) => e.start.slice(0, 10));
  for (const d of bi) assert.equal(((Date.parse(d) - Date.parse('1999-01-05')) / 864e5) % 14, 0);
  assert.equal(bi.length, 1);
  assert.deepEqual(ev.filter((e) => e.title === 'Month end').map((e) => e.start), ['2026-10-31']);
});

// ---- OAuth (contract 2 + callback hardening) ----
test('oauth begin: one-time start link without the key; old ?k= still works', async () => {
  cacheClear();
  const { env, key } = await paired();
  await env.LIFE.put('config', JSON.stringify({ google: { clientId: 'gid', clientSecret: 's' } }));
  assert.equal((await call(env, req('/oauth/google/begin', { method: 'POST', body: {} }))).status, 401);
  const { url } = await (await call(env, req('/oauth/google/begin', { method: 'POST', key, body: { return: 'https://ishirj.github.io/life/?x=1' } }))).json();
  assert.ok(url.startsWith(`${BASE}/oauth/google/start?s=`));
  assert.ok(!url.includes(key));
  const path = url.slice(BASE.length);
  const r = await call(env, req(path));
  assert.equal(r.status, 302);
  const loc = new URL(r.headers.get('Location'));
  assert.equal(loc.searchParams.get('client_id'), 'gid');
  assert.equal((await call(env, req(path))).status, 401, 'single use');
  // token for another provider is refused
  const { url: u2 } = await (await call(env, req('/oauth/google/begin', { method: 'POST', key, body: {} }))).json();
  assert.equal((await call(env, req(u2.slice(BASE.length).replace('/google/', '/ms/')))).status, 401);
  // callback: tampered, wrong provider, expired states are rejected; off-list return falls back to the app
  const state = loc.searchParams.get('state');
  const f = mockFetch(() => Response.json({ access_token: 'a', refresh_token: 'rt', expires_in: 3600 }));
  try {
    assert.equal((await call(env, req(`/oauth/ms/callback?code=c&state=${encodeURIComponent(state)}`))).status, 400);
    const [body, sig] = state.split('.');
    const forged = b64uEncode(new TextEncoder().encode(JSON.stringify({ r: 'https://evil.example/', p: 'google', t: Date.now() })));
    assert.equal((await call(env, req(`/oauth/google/callback?code=c&state=${encodeURIComponent(forged + '.' + sig)}`))).status, 400);
    const ok = await call(env, req(`/oauth/google/callback?code=c&state=${encodeURIComponent(body + '.' + sig)}`));
    assert.equal(ok.headers.get('Location'), 'https://ishirj.github.io/life/?x=1#connected=google');
  } finally { f.restore(); cacheClear(); }
  const realNow = Date.now;
  try {
    const { url: u3 } = await (await call(env, req('/oauth/google/begin', { method: 'POST', key, body: { return: 'https://evil.example/' } }))).json();
    const st = new URL((await call(env, req(u3.slice(BASE.length)))).headers.get('Location')).searchParams.get('state');
    assert.equal(JSON.parse(Buffer.from(st.split('.')[0], 'base64url')).r, 'https://ishirj.github.io/life/');
    Date.now = () => realNow() + 21 * 60000;
    assert.equal((await call(env, req(`/oauth/google/callback?code=c&state=${encodeURIComponent(st)}`))).status, 400);
  } finally { Date.now = realNow; }
});

// ---- laptop report #25: Gmail previews ----
test('gmail previews: one-time codes and links are not stored', async () => {
  assert.equal(redactPreview('Your verification code is 482913. It expires soon.'), 'Your verification code is ••••. It expires soon.');
  assert.equal(redactPreview('Reset your password: https://x.com/r?t=abc'), 'Reset your password: [link]');
  assert.equal(redactPreview('Lunch at 1230 in room 2040?'), 'Lunch at 1230 in room 2040?');
  const { env, key } = await paired();
  await call(env, req('/ingest/gmail', { method: 'POST', key, body: { items: [{ id: 'g', subject: 's', preview: 'Sign-in code: AB12CD https://t.co/x', date: '2026-10-19T10:00:00Z' }] } }));
  assert.equal(env.LIFE.json('gmail').items[0].preview, 'Sign-in code: •••• [link]');
});

test('health ingest accepts a bare array of days', async () => {
  const { env, key } = await paired();
  const r = await (await call(env, req('/ingest/health', { method: 'POST', key, body: [{ date: '2026-10-18', steps: 10 }, { date: '2026-10-17', steps: 20 }] }))).json();
  assert.equal(r.accepted, 2);
});
