// Leave-for-class alerts: right bus, right three moments, each sent once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createECDH } from 'node:crypto';
import { makeEnv, mockFetch } from './helpers.js';
import { runLeave } from '../src/index.js';
import { getVapid } from '../src/webpush.js';
import { b64uEncode, cacheClear as memClear } from '../src/util.js';
const cacheClear = () => { memClear(); globalThis.caches.default._store?.clear(); };
function fakeSub() { const ua = createECDH('prime256v1'); ua.generateKeys(); return { endpoint: 'https://web.push.apple.com/QAbc', keys: { p256dh: b64uEncode(ua.getPublicKey()), auth: b64uEncode(new Uint8Array(16).fill(7)) } }; }
const M = 60000;

test('leave: picks the latest bus that still makes class, alerts at -45, -15 and leave time, once each', async () => {
  const env = makeEnv(); cacheClear();
  const cls = Date.parse('2026-10-23T15:00:00Z');                 // 11:00 ET
  const deps = [cls - 40 * M, cls - 18 * M, cls - 10 * M];          // 10:20, 10:42, 10:50 → 10:42 is the last that makes it (ride 12 + buffer 3)
  await env.LIFE.put('sub', JSON.stringify(fakeSub())); await getVapid(env);
  await env.LIFE.put('leave', JSON.stringify({ on: true, route: 'NMG', stop: '1411', walk: 7, ride: 12, buffer: 3, tz: 'America/New_York', classes: [cls] }));
  const xml = '<x>' + deps.map((d) => `<AdjustedDepartureTime>${new Date(d).toISOString()}</AdjustedDepartureTime>`).join('') + '<StopName>Red Maple</StopName></x>';
  const f = mockFetch((u) => String(u).includes('push.apple') ? new Response(null, { status: 201 }) : new Response(xml, { status: 200 }));
  const pushes = () => f.calls.filter((c) => c.url.includes('push.apple')).length;
  try {
    const bus = cls - 18 * M;
    await runLeave(env, bus - 50 * M); assert.equal(pushes(), 0, 'nothing before -45');
    await runLeave(env, bus - 45 * M); assert.equal(pushes(), 1, 'get ready');
    await runLeave(env, bus - 44 * M); assert.equal(pushes(), 1, 'not repeated');
    await runLeave(env, bus - 15 * M); assert.equal(pushes(), 2, 'finish packing');
    await runLeave(env, bus - 8 * M); assert.equal(pushes(), 3, 'leave now = bus - walk - 1');
    await runLeave(env, bus - 7 * M); assert.equal(pushes(), 3, 'not repeated');
    const sent = env.LIFE.json('leaveSent');
    assert.deepEqual(Object.keys(sent).sort(), [`${cls}:pack`, `${cls}:ready`, `${cls}:walk`]);
  } finally { f.restore(); }
});

test('leave: off, no classes soon, or no subscription → no bus lookups, no pushes', async () => {
  const env = makeEnv(); cacheClear();
  const now = Date.parse('2026-10-23T12:00:00Z');
  await env.LIFE.put('sub', JSON.stringify(fakeSub()));
  await env.LIFE.put('leave', JSON.stringify({ on: true, route: 'NMG', stop: '1411', walk: 7, ride: 12, buffer: 3, tz: 'America/New_York', classes: [now + 5 * 3600e3] }));
  const f = mockFetch(() => new Response('', { status: 200 }));
  try { const r = await runLeave(env, now); assert.equal(r.sent, 0); assert.equal(f.calls.length, 0); } finally { f.restore(); }
});
