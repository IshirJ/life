// Job emails: Gemini reads each email once; unread inbox mail that isn't a job is remembered and never re-sent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv } from './helpers.js';
import { listJobs } from '../src/extras.js';

test('jobs: classifies labelled and unread inbox mail once, keeps job inbox mail, skips the rest', async () => {
  const env = makeEnv();
  await env.LIFE.put('jobmail', JSON.stringify({ items: { a: { id: 'a', from: 'Deloitte Careers', domain: 'myworkday.com', subject: 'Invitation to interview', date: '2026-10-20T10:00:00.000Z', label: 'Assessments & Interviews' } } }));
  await env.LIFE.put('gmail', JSON.stringify({ items: [
    { id: 'b', from: 'PwC <talent@pwc.com>', subject: 'Your HireVue assessment', preview: 'Please complete by Oct 30', date: '2026-10-22T10:00:00.000Z' },
    { id: 'c', from: 'Chipotle <hi@chipotle.com>', subject: 'BOGO today', preview: '', date: '2026-10-22T10:00:00.000Z' }] }));
  let calls = 0;
  const ai = async (cfg, parts) => { calls++; const t = parts[0].text;
    const items = [];
    t.split('\n').forEach((l) => { const m = /^(\d+)\. .*subject: (.*?)( \| preview|$)/.exec(l); if (!m) return;
      const s = m[2]; items.push({ i: +m[1], job: !/BOGO/.test(s), company: /HireVue/.test(s) ? 'PwC' : 'Deloitte', role: '', stage: /HireVue/.test(s) ? 'Assessment' : /interview/i.test(s) ? 'Interview' : 'Other', when: /HireVue/.test(s) ? '2026-10-30' : '' }); });
    return { items }; };
  const r1 = await (await listJobs(env, { geminiKey: 'k' }, Date.parse('2026-10-23T22:00:00Z'), ai)).json();
  assert.equal(calls, 1);
  const by = Object.fromEntries(r1.items.map((x) => [x.id, x]));
  assert.equal(by.a.ai.stage, 'Interview');
  assert.equal(by.b.ai.stage, 'Assessment'); assert.equal(by.b.ai.when, '2026-10-30');
  assert.ok(!by.c, 'promo mail is not a job');
  await listJobs(env, { geminiKey: 'k' }, Date.parse('2026-10-23T22:01:00Z'), ai);
  assert.equal(calls, 1, 'nothing sent twice');
});
