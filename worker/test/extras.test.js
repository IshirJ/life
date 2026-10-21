import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, mockFetch, req } from './helpers.js';
import worker from '../src/index.js';
import { cacheClear } from '../src/util.js';
const call = (env, r) => worker.fetch(r, env);
async function paired() { const env = makeEnv(); const { key } = await (await call(env, req('/pair', { method: 'POST' }))).json(); return { env, key }; }

test('config keeps unsplash/gemini keys masked', async () => {
  const { env, key } = await paired();
  let c = await (await call(env, req('/config', { method: 'PUT', key, body: { unsplashKey: 'abc', geminiKey: 'g1', geminiModel: 'gemini-x' } }))).json();
  assert.equal(c.unsplashKey, '********'); assert.equal(c.geminiKey, '********'); assert.equal(c.geminiModel, 'gemini-x');
  c = await (await call(env, req('/config', { method: 'PUT', key, body: { unsplashKey: '********' } }))).json();
  assert.equal(env.LIFE.json('config').unsplashKey, 'abc');
});

test('bus departures parsed from BT XML and cached', async () => {
  cacheClear();
  const { env, key } = await paired();
  let n = 0;
  const f = mockFetch((url) => { n++; assert.match(url, /GetNextDepartures\?routeShortName=NMG&stopCode=1411/);
    return new Response('<DocumentElement><NextDepartures><StopName>Main/Red Maple Nbnd</StopName><AdjustedDepartureTime>2026-10-20T22:25:00-04:00</AdjustedDepartureTime></NextDepartures></DocumentElement>'); });
  try {
    const b = await (await call(env, req('/bus?route=nmg&stop=1411', { key }))).json();
    assert.equal(b.deps[0], '2026-10-21T02:25:00.000Z'); assert.equal(b.stopName, 'Main/Red Maple Nbnd');
    await call(env, req('/bus?route=NMG&stop=1411', { key }));
    assert.equal(n, 1);
  } finally { f.restore(); }
});

test('images: no key → empty with error, key → searched once then cached', async () => {
  cacheClear();
  const { env, key } = await paired();
  let b = await (await call(env, req('/img?q=forest', { key }))).json();
  assert.equal(b.error, 'no_key');
  await call(env, req('/config', { method: 'PUT', key, body: { unsplashKey: 'K' } }));
  let n = 0;
  const f = mockFetch((url, init) => { n++; assert.equal(init.headers.Authorization, 'Client-ID K');
    return Response.json({ results: [{ id: 'p1', urls: { raw: 'https://images.unsplash.com/x?ixid=1' }, user: { name: 'A', links: { html: 'u' } }, links: { html: 'l', download_location: 'https://api.unsplash.com/photos/p1/download' } }] }); });
  try {
    b = await (await call(env, req('/img?q=Forest', { key }))).json();
    assert.equal(b.photos[0].id, 'p1');
    b = await (await call(env, req('/img?q=forest', { key }))).json();
    assert.equal(b.cached, true); assert.equal(n, 1);
  } finally { f.restore(); }
});

test('ai food: Gemini JSON mapped to items', async () => {
  const { env, key } = await paired();
  await call(env, req('/config', { method: 'PUT', key, body: { geminiKey: 'G' } }));
  const f = mockFetch((url, init) => {
    assert.match(url, /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.5-flash:generateContent/);
    assert.equal(init.headers['x-goog-api-key'], 'G');
    const body = JSON.parse(init.body); assert.ok(body.contents[0].parts.some((p) => p.inline_data));
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ items: [{ name: 'Dal', grams: 200, kcal: 230.4, protein: 12.33, fat: 6, carbs: 30 }] }) }] } }] });
  });
  try {
    const b = await (await call(env, req('/ai/food', { method: 'POST', key, body: { image: 'data:image/jpeg;base64,AAAA', text: 'lunch' } }))).json();
    assert.deepEqual(b.items[0], { name: 'Dal', grams: 200, kcal: 230, protein: 12.3, fat: 6, carbs: 30, confidence: '' });
  } finally { f.restore(); }
});

test('jobs ingest merges by thread id', async () => {
  const { env, key } = await paired();
  await call(env, req('/ingest/jobs', { method: 'POST', key, body: { items: [{ id: 't1', from: 'Amazon', subject: 'Thanks for applying', date: '2026-10-01T00:00:00Z', label: 'Job applications' }] } }));
  const r = await (await call(env, req('/ingest/jobs', { method: 'POST', key, body: { items: [{ id: 't1', from: 'Amazon', subject: 'Interview', date: '2026-10-02T00:00:00Z', label: 'Assessments & Interviews' }, { id: 't2', subject: 'x' }] } }))).json();
  assert.equal(r.added, 1); assert.equal(r.total, 2);
  const j = await (await call(env, req('/jobs', { key }))).json();
  assert.equal(j.items.find((x) => x.id === 't1').label, 'Assessments & Interviews');
});

test('jarvis relay: queue → laptop picks up → reply in log', async () => {
  const { env, key } = await paired();
  const { id } = await (await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: '  open   excel ' } }))).json();
  const next = await (await call(env, req('/jarvis/next', { key }))).json();
  assert.equal(next.text, 'open excel');
  assert.deepEqual(await (await call(env, req('/jarvis/next', { key }))).json(), {});
  await call(env, req('/jarvis/reply', { method: 'POST', key, body: { id, reply: 'Excel is open.' } }));
  const log = await (await call(env, req('/jarvis/log', { key }))).json();
  assert.equal(log.log[0].reply, 'Excel is open.'); assert.equal(log.log[0].state, 'done'); assert.ok(log.seen > 0);
});

test('sync accepts an end-to-end encrypted document', async () => {
  const { env, key } = await paired();
  const r = await call(env, req('/sync', { method: 'PUT', key, body: { base: 0, doc: { e2e: 1, v: 1, iv: 'x', ct: 'y' } } }));
  assert.equal(r.status, 200);
  const g = await (await call(env, req('/sync', { key }))).json();
  assert.equal(g.doc.e2e, 1);
  const s = await (await call(env, req('/sync/status', { key }))).json();
  assert.equal(s.encrypted, true);
});

test('screen pauses counted per day', async () => {
  const { env, key } = await paired();
  await call(env, req('/screen', { method: 'POST', key, body: { app: 'Instagram', event: 'paused' } }));
  await call(env, req('/screen', { method: 'POST', key, body: { app: 'Instagram', event: 'paused' } }));
  const s = await (await call(env, req('/screen', { key }))).json();
  const day = Object.values(s.days)[0];
  assert.equal(day['instagram:paused'], 2);
});

test('ai: falls back to another model when the free quota is zero, and reports a bad key plainly', async () => {
  const { env, key } = await paired();
  await call(env, req('/config', { method: 'PUT', key, body: { geminiKey: 'G' } }));
  const seen = [];
  let f = mockFetch((url) => {
    seen.push(url.match(/models\/([^:]+)/)[1]);
    if (seen.length === 1) return Response.json({ error: { message: 'Quota exceeded, limit: 0' } }, { status: 429 });
    return Response.json({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] });
  });
  try {
    const r = await call(env, req('/ai/test', { method: 'POST', key, body: {} }));
    assert.equal(r.status, 200); assert.deepEqual(await r.json(), { ok: true });
    assert.deepEqual(seen, ['gemini-2.5-flash', 'gemini-2.5-flash-lite']);
  } finally { f.restore(); }
  f = mockFetch(() => Response.json({ error: { message: 'API key not valid. Please pass a valid API key.' } }, { status: 400 }));
  try {
    const r = await call(env, req('/ai/test', { method: 'POST', key, body: {} }));
    assert.equal(r.status, 502); assert.match((await r.json()).error, /key isn’t valid/);
  } finally { f.restore(); }
});

test('jarvis wake + stop: phone can start JARVIS and stop a running task', async () => {
  const { env, key } = await paired();
  await call(env, req('/jarvis/wake', { method: 'POST', key, body: { mode: 'start' } }));
  assert.deepEqual(await (await call(env, req('/jarvis/wake', { key }))).json(), { mode: 'start' });
  assert.deepEqual(await (await call(env, req('/jarvis/wake', { key }))).json(), {});
  await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: 'check my calendar' } }));
  await call(env, req('/jarvis/next', { key }));
  await call(env, req('/jarvis/wake', { method: 'POST', key, body: { mode: 'stop' } }));
  assert.deepEqual(await (await call(env, req('/jarvis/next', { key }))).json(), { stop: true });
  const log = await (await call(env, req('/jarvis/log', { key }))).json();
  assert.equal(log.log[0].state, 'error'); assert.equal(log.log[0].reply, 'Stopped.');
});

test('jarvis busy poll does not hand over the next command', async () => {
  const { env, key } = await paired();
  await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: 'one' } }));
  assert.deepEqual(await (await call(env, req('/jarvis/next?busy=1', { key }))).json(), {});
  assert.equal((await (await call(env, req('/jarvis/next', { key }))).json()).text, 'one');
});

test('key rotate: old key stops working, new one works', async () => {
  const { env, key } = await paired();
  const { key: nk } = await (await call(env, req('/key/rotate', { method: 'POST', key, body: {} }))).json();
  assert.ok(nk && nk !== key);
  assert.equal((await call(env, req('/jarvis/log', { key }))).status, 401);
  assert.equal((await call(env, req('/jarvis/log', { key: nk }))).status, 200);
});

test('jarvis restart reaches a running JARVIS through next', async () => {
  const { env, key } = await paired();
  await call(env, req('/jarvis/wake', { method: 'POST', key, body: { mode: 'restart' } }));
  assert.deepEqual(await (await call(env, req('/jarvis/next?v=2', { key }))).json(), { restart: true });
  assert.deepEqual(await (await call(env, req('/jarvis/wake', { key }))).json(), {});
});

test('jarvis steps attach to the running command; stop marks it at once', async () => {
  const { env, key } = await paired();
  const { id } = await (await call(env, req('/jarvis/cmd', { method: 'POST', key, body: { text: 'do a thing' } }))).json();
  await call(env, req('/jarvis/next', { key }));
  await call(env, req('/jarvis/step', { method: 'POST', key, body: { id, lines: ['[router] web', 'opening Opera'] } }));
  let log = await (await call(env, req('/jarvis/log', { key }))).json();
  assert.deepEqual(log.log[0].steps, ['[router] web', 'opening Opera']);
  await call(env, req('/jarvis/wake', { method: 'POST', key, body: { mode: 'stop' } }));
  log = await (await call(env, req('/jarvis/log', { key }))).json();
  assert.equal(log.log[0].state, 'error'); assert.equal(log.log[0].reply, 'Stopped.');
});

test('jarvis voice: laptop uploads mp3, phone downloads it', async () => {
  const { env, key } = await paired();
  const r = await call(env, new Request('https://x/jarvis/voice?id=abc123', { method: 'POST', headers: { 'X-Life-Key': key }, body: new Uint8Array([73, 68, 51, 1, 2, 3]) }));
  assert.equal(r.status, 200);
  const g = await call(env, req('/jarvis/voice?id=abc123', { key }));
  assert.equal(g.headers.get('content-type'), 'audio/mpeg'); assert.equal((await g.arrayBuffer()).byteLength, 6);
});

test('ai stt: audio goes to Gemini and text comes back; jarvis voice saved in config', async () => {
  const { env, key } = await paired();
  await call(env, req('/config', { method: 'PUT', key, body: { geminiKey: 'G', jarvisVoice: 'en-US-AndrewMultilingualNeural' } }));
  const f = mockFetch((url, init) => { const b = JSON.parse(init.body); assert.equal(b.contents[0].parts[0].inline_data.mime_type, 'audio/wav');
    return Response.json({ candidates: [{ content: { parts: [{ text: '{"text":"what time is it"}' }] } }] }); });
  try {
    const r = await (await call(env, req('/ai/stt', { method: 'POST', key, body: { audio: 'data:audio/wav;base64,UklGRg==' } }))).json();
    assert.equal(r.text, 'what time is it');
  } finally { f.restore(); }
  const c = await (await call(env, req('/config', { key }))).json();
  assert.equal(c.jarvisVoice, 'en-US-AndrewMultilingualNeural');
});
