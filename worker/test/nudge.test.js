// Coaching nudges: skipped at send time when today's numbers already show you're on track.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv } from './helpers.js';
import { condCheck } from '../src/index.js';
const M = 60000;

test('nudges: meal/protein/steps conditions read today and skip when on track', async () => {
  const env = makeEnv(); const now = Date.parse('2026-11-03T19:00:00Z');
  const items = [{ id: 'a', cond: { kcalBelow: 600 } }, { id: 'b', cond: { proteinBelow: 120 } }, { id: 'c', cond: { stepsBelow: 7000 } }, { id: 'd' }];
  let calls = 0;
  const out = await condCheck(env, items, now, async () => { calls++; return { date: '2026-11-03', kcal: 900, protein: 80, steps: 4000 }; });
  assert.equal(calls, 1);
  assert.deepEqual(out.map((x) => [x.id, !!x.skip]), [['a', true], ['b', false], ['c', false], ['d', false]]);
});

test('nudges: "stand up" only fires when steps barely moved in the last hour', async () => {
  const env = makeEnv(); const t0 = Date.parse('2026-11-03T15:50:00Z');
  const it = [{ id: 'mv', cond: { moveBelow: 250 } }];
  let r = await condCheck(env, it, t0, async () => ({ date: '2026-11-03', steps: 3000 }));
  assert.equal(r[0].skip, true);                                       // first check of the day only records the count
  r = await condCheck(env, it, t0 + 60 * M, async () => ({ date: '2026-11-03', steps: 3100 }));
  assert.equal(!!r[0].skip, false);                                    // +100 steps in an hour: nudge
  r = await condCheck(env, it, t0 + 120 * M, async () => ({ date: '2026-11-03', steps: 4200 }));
  assert.equal(r[0].skip, true);                                       // walked: no nudge
  r = await condCheck(env, it, t0 + 180 * M, async () => ({ date: '2026-11-03' }));
  assert.equal(r[0].skip, true);                                       // no step data: never nag blind
});
