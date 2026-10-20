// life-sync: single-user backend for the Life home-screen app.
import {
  json, err, withCors, corsHeaders, safeEqual, kvGet, kvPut, readJson, HttpError,
  b64uEncode, randomBytes, DEFAULT_TZ,
} from './util.js';
import { getVapid, sendPush } from './webpush.js';
import { oauthStart, oauthCallback } from './oauth.js';
import {
  getCalendar, getMail, outlookCalendar, ingestHealth, getHealth, normalizeIcsUrl, tzOf,
} from './services.js';
import { isValidTz, parseYmd } from './tz.js';
import { searchFood } from './food.js';

const MIN = 60 * 1000;
const DUE_WINDOW = 30 * MIN;
const SENT_KEEP = 8 * 24 * 60 * MIN;
const MAX_BACKUP = 20 * 1024 * 1024;
const BACKUP_SLOTS = 3;

// ---------- auth ----------
async function authorize(request, env, url, allowQuery) {
  const key = await env.LIFE.get('key');
  if (!key) return null;
  const given = request.headers.get('X-Life-Key') || (allowQuery ? url.searchParams.get('k') : null);
  return given && safeEqual(given, key) ? key : null;
}

// ---------- config ----------
const MASK = '********';
function maskConfig(c) {
  const out = JSON.parse(JSON.stringify(c || {}));
  for (const p of ['ms', 'google']) if (out[p]?.clientSecret) out[p].clientSecret = MASK;
  if (out.fdcKey) out.fdcKey = MASK;
  out.tz ||= DEFAULT_TZ;
  out.calendars ||= [];
  return out;
}

function mergeConfig(cur, body) {
  const next = { ...cur };
  if (Array.isArray(body.calendars)) {
    next.calendars = body.calendars
      .filter((c) => c && c.url)
      .slice(0, 20)
      .map((c, i) => ({
        id: String(c.id || `cal${i + 1}`).slice(0, 40),
        name: String(c.name || `Calendar ${i + 1}`).slice(0, 80),
        url: normalizeIcsUrl(c.url),
        color: String(c.color || '#D9552E').slice(0, 20),
      }));
  }
  for (const p of ['ms', 'google']) {
    if (body[p] && typeof body[p] === 'object') {
      const merged = { ...(cur[p] || {}) };
      for (const k of ['clientId', 'clientSecret', 'tenant']) {
        const v = body[p][k];
        if (v == null || v === MASK) continue;
        if (k === 'tenant' && p !== 'ms') continue;
        merged[k] = String(v).trim();
      }
      next[p] = merged;
    }
  }
  if (body.tz != null) {
    if (!isValidTz(body.tz)) throw new HttpError(400, 'invalid tz');
    next.tz = body.tz;
  }
  if (body.fdcKey != null && body.fdcKey !== MASK) {
    const k = String(body.fdcKey).trim().slice(0, 100);
    if (k) next.fdcKey = k; else delete next.fdcKey;
  }
  if (body.healthPrefer === 'apple' || body.healthPrefer === 'google') next.healthPrefer = body.healthPrefer;
  return next;
}

// ---------- schedule / cron ----------
function cleanSchedule(items, now) {
  if (!Array.isArray(items)) throw new HttpError(400, 'items must be an array');
  return items
    .map((it) => ({
      id: String(it?.id ?? '').slice(0, 100),
      at: Date.parse(it?.at),
      title: String(it?.title ?? '').slice(0, 120),
      body: String(it?.body ?? '').slice(0, 500),
      url: it?.url ? String(it.url).slice(0, 500) : undefined,
      tag: it?.tag ? String(it.tag).slice(0, 100) : undefined,
    }))
    .filter((it) => it.id && Number.isFinite(it.at) && it.at > now - DUE_WINDOW)
    .sort((a, b) => a.at - b.at)
    .slice(0, 300)
    .map((it) => ({ ...it, at: new Date(it.at).toISOString() }));
}

// Sent-set key: id + time, so a recurring reminder can reuse its id on different days.
const sentKey = (it) => `${it.id}|${it.at}`;
const memSent = new Set(); // per-isolate guard against KV read-after-write lag

export async function runCron(env, now = Date.now()) {
  const schedule = await kvGet(env, 'schedule');
  const items = schedule?.items || [];
  const due = items.filter((it) => {
    const t = Date.parse(it.at);
    return t <= now && t > now - DUE_WINDOW;
  });
  if (!due.length) return { sent: 0, wrote: false };
  const sub = await kvGet(env, 'sub');
  if (!sub) return { sent: 0, wrote: false };
  const sentObj = (await kvGet(env, 'sent')) || {};
  const pending = due.filter((it) => !sentObj[sentKey(it)] && !memSent.has(sentKey(it)));
  if (!pending.length) return { sent: 0, wrote: false };

  let sent = 0;
  for (const it of pending) {
    const r = await sendPush(env, sub, { title: it.title, body: it.body, url: it.url, tag: it.tag || it.id });
    if (r.status === 404 || r.status === 410) break; // subscription gone (sendPush deleted it)
    // Mark as done on success or permanent client error; retry next minute on 5xx/429/network.
    if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) {
      sentObj[sentKey(it)] = now;
      memSent.add(sentKey(it));
      if (r.ok) sent++;
    }
  }
  let wrote = false;
  if (Object.keys(sentObj).length && pending.some((it) => sentObj[sentKey(it)])) {
    for (const [k, ts] of Object.entries(sentObj)) if (ts < now - SENT_KEEP) delete sentObj[k];
    await kvPut(env, 'sent', sentObj);
    wrote = true;
  }
  return { sent, wrote };
}

// ---------- device sync ----------
// The whole Life database is one document with a version number. A device sends the version it built on;
// if someone else saved in between it gets 409 and merges first (merging happens on the device).
const MAX_SYNC = 20 * 1024 * 1024;
async function getSync(env) {
  const meta = (await kvGet(env, 'sync:meta')) || { ver: 0, ts: 0 };
  if (!meta.ver) return json({ ver: 0, ts: 0, doc: null });
  const doc = await env.LIFE.get('sync:doc');
  return new Response(`{"ver":${meta.ver},"ts":${meta.ts},"doc":${doc || 'null'}}`, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
async function putSync(request, env) {
  const body = await readJson(request, MAX_SYNC);
  if (!body.doc || typeof body.doc !== 'object' || !Array.isArray(body.doc.entries)) throw new HttpError(400, 'doc with entries required');
  const meta = (await kvGet(env, 'sync:meta')) || { ver: 0, ts: 0 };
  if (Number(body.base || 0) !== meta.ver) return json({ error: 'conflict', ver: meta.ver }, 409);
  const next = { ver: meta.ver + 1, ts: Date.now() };
  await env.LIFE.put('sync:doc', JSON.stringify(body.doc));
  await kvPut(env, 'sync:meta', next);
  return json({ ok: true, ...next });
}
// Notebooks sync item by item (pages can be big): an index of {id: updated} plus one key per book/page.
async function getNotesIndex(env) { return (await kvGet(env, 'nb:index')) || { books: {}, pages: {} }; }
async function putNotes(request, env) {
  const body = await readJson(request, MAX_SYNC);
  const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
  const idx = await getNotesIndex(env);
  for (const it of items) {
    const kind = it.kind === 'book' ? 'books' : it.kind === 'page' ? 'pages' : null;
    if (!kind || !it.id || typeof it.id !== 'string' || it.id.length > 64) continue;
    const u = Number(it.u) || Date.now();
    const cur = idx[kind][it.id];
    if (cur && cur.u > u) continue; // the server already has something newer
    if (it.deleted) { idx[kind][it.id] = { u, d: 1 }; await env.LIFE.delete(`nb:${kind}:${it.id}`); }
    else { idx[kind][it.id] = { u }; await env.LIFE.put(`nb:${kind}:${it.id}`, JSON.stringify(it.data)); }
  }
  await kvPut(env, 'nb:index', idx);
  return json({ ok: true, index: idx });
}
async function getNotesItem(env, url) {
  const kind = url.searchParams.get('kind') === 'book' ? 'books' : 'pages';
  const id = url.searchParams.get('id') || '';
  const v = await env.LIFE.get(`nb:${kind}:${id}`);
  if (v == null) return err(404, 'not found');
  return new Response(v, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

// ---------- quick-capture inbox ----------
// Siri / Action button / share-sheet Shortcuts POST short text here; the app picks it up next time it opens.
const INBOX_MAX = 300;
async function postInbox(request, env) {
  const ct = request.headers.get('Content-Type') || '';
  let text = '';
  if (ct.includes('json')) { const b = await readJson(request, 20000); text = b.text ?? b.input ?? ''; }
  else text = (await request.text()).slice(0, 20000);
  text = String(text).replace(/\s+/g, ' ').trim().slice(0, 2000);
  if (!text) throw new HttpError(400, 'text required');
  const list = (await kvGet(env, 'inbox')) || [];
  const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, at: Date.now() };
  list.push(item);
  await kvPut(env, 'inbox', list.slice(-INBOX_MAX));
  return json({ ok: true, saved: text });
}
async function deleteInbox(request, env) {
  const b = await readJson(request, 50000);
  const ids = new Set(Array.isArray(b.ids) ? b.ids.map(String) : []);
  const list = ((await kvGet(env, 'inbox')) || []).filter((x) => !ids.has(x.id));
  await kvPut(env, 'inbox', list);
  return json({ ok: true, left: list.length });
}

// ---------- backup ----------
async function putBackup(request, env) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BACKUP) throw new HttpError(413, 'backup too large (max 20 MB)');
  const text = await request.text();
  const size = new TextEncoder().encode(text).length;
  if (size > MAX_BACKUP) throw new HttpError(413, 'backup too large (max 20 MB)');
  if (!size) throw new HttpError(400, 'empty backup');
  const meta = (await kvGet(env, 'backup:meta')) || [];
  const slot = meta.length ? (meta[0].slot + 1) % BACKUP_SLOTS : 0;
  await env.LIFE.put(`backup:${slot}`, text);
  const ts = Date.now();
  const next = [{ slot, ts, size }, ...meta.filter((m) => m.slot !== slot)].slice(0, BACKUP_SLOTS);
  await kvPut(env, 'backup:meta', next);
  return json({ ok: true, slot, ts, size });
}

async function getBackup(env, url) {
  const meta = (await kvGet(env, 'backup:meta')) || [];
  const s = url.searchParams.get('slot');
  const entry = s != null ? meta.find((m) => String(m.slot) === s) : meta[0];
  if (!entry) return err(404, 'no backup');
  const text = await env.LIFE.get(`backup:${entry.slot}`);
  if (text == null) return err(404, 'no backup');
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Backup-Ts': String(entry.ts), 'Cache-Control': 'no-store' },
  });
}

// ---------- router ----------
async function route(request, env, url) {
  const method = request.method;
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Public routes
  if (path === '/' && method === 'GET') return json({ ok: true, name: 'life-sync' });
  if (path === '/pair' && method === 'POST') {
    if (await env.LIFE.get('key')) return err(409, 'already paired');
    const key = b64uEncode(randomBytes(32));
    await env.LIFE.put('key', key);
    return json({ key });
  }
  if (path === '/vapid' && method === 'GET') {
    const v = await getVapid(env);
    return json({ publicKey: v.publicKey });
  }

  // OAuth: start uses ?k=, callback is authenticated by the signed state.
  const oauth = /^\/oauth\/(ms|google)\/(start|callback)$/.exec(path);
  if (oauth && method === 'GET') {
    const [, provider, step] = oauth;
    const lifeKey = await env.LIFE.get('key');
    if (!lifeKey) return err(401, 'not paired');
    const config = (await kvGet(env, 'config')) || {};
    if (step === 'start') {
      if (!(await authorize(request, env, url, true))) return err(401, 'unauthorized');
      return oauthStart(provider, request, env, lifeKey, config);
    }
    return oauthCallback(provider, request, env, lifeKey, config);
  }

  const allowQuery = path === '/widget' && method === 'GET';
  if (!(await authorize(request, env, url, allowQuery))) return err(401, 'unauthorized');

  const config = async () => (await kvGet(env, 'config')) || {};

  switch (`${method} ${path}`) {
    case 'GET /status': {
      const [cfg, ms, g, gmail, health, sub, sched, bmeta] = await Promise.all(
        ['config', 'ms_token', 'g_token', 'gmail', 'health', 'sub', 'schedule', 'backup:meta'].map((k) => kvGet(env, k)),
      );
      return json({
        ok: true,
        paired: true,
        connections: {
          outlookMail: !!ms?.refresh_token,
          googleHealth: !!g?.refresh_token,
          gmailUpdated: gmail?.updated || null,
          healthUpdated: health?.updated || null,
          pushSubscribed: !!sub?.endpoint,
        },
        calendars: (cfg?.calendars || []).map(({ id, name, color }) => ({ id, name, color })),
        scheduleCount: sched?.items?.length || 0,
        lastBackup: bmeta?.[0]?.ts || null,
        tz: tzOf(cfg),
      });
    }
    case 'GET /config':
      return json(maskConfig(await config()));
    case 'PUT /config': {
      const body = await readJson(request);
      const next = mergeConfig(await config(), body);
      await kvPut(env, 'config', next);
      return json(maskConfig(next));
    }
    case 'PUT /push/subscription': {
      const { subscription } = await readJson(request);
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return err(400, 'subscription must include endpoint and keys.p256dh/auth');
      }
      if (!/^https:\/\//.test(subscription.endpoint)) return err(400, 'endpoint must be https');
      await kvPut(env, 'sub', { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } });
      return json({ ok: true });
    }
    case 'DELETE /push/subscription':
      await env.LIFE.delete('sub');
      return json({ ok: true });
    case 'POST /push/test': {
      const sub = await kvGet(env, 'sub');
      if (!sub) return err(400, 'no push subscription');
      const r = await sendPush(env, sub, { title: 'Life', body: 'Notifications are working.', tag: 'life-test' });
      return json({ ok: r.ok, status: r.status, host: r.host, ...(r.error ? { error: r.error } : {}), ...(r.reason ? { reason: r.reason } : {}) });
    }
    case 'PUT /schedule': {
      const body = await readJson(request, 2_000_000);
      const items = cleanSchedule(body.items, Date.now());
      await kvPut(env, 'schedule', { items, updated: Date.now() });
      return json({ ok: true, count: items.length });
    }
    case 'GET /schedule':
      return json((await kvGet(env, 'schedule')) || { items: [] });
    case 'GET /calendar':
    case 'GET /outlook/calendar': {
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      if (!parseYmd(from) || !parseYmd(to) || to < from) return err(400, 'from/to must be YYYY-MM-DD with from <= to');
      const cfg = await config();
      if (path === '/calendar') return json(await getCalendar(cfg, from, to));
      try {
        return json({ events: await outlookCalendar(env, cfg, from, to), errors: [] });
      } catch (e) {
        return json({ events: [], errors: [{ cal: 'outlook', ...(e.code === 'reauth' ? { code: 'reauth' } : {}), message: String(e.message || e) }] });
      }
    }
    case 'GET /food/search': {
      const q = (url.searchParams.get('q') || '').trim().slice(0, 100);
      if (q.length < 2) return err(400, 'q must be at least 2 characters');
      const page = Math.max(1, Math.min(20, parseInt(url.searchParams.get('page'), 10) || 1));
      return json(await searchFood(await config(), q, page));
    }
    case 'GET /mail':
      return json(await getMail(env, await config()));
    case 'POST /ingest/gmail': {
      const body = await readJson(request);
      if (!Array.isArray(body.items)) return err(400, 'items must be an array');
      const items = body.items.slice(0, 50).map((m) => ({
        id: String(m.id ?? ''),
        from: String(m.from ?? '').slice(0, 200),
        subject: String(m.subject ?? '').slice(0, 300),
        preview: String(m.preview ?? '').slice(0, 300),
        date: m.date ? new Date(m.date).toISOString() : new Date().toISOString(),
        link: String(m.link ?? ''),
      })).filter((m) => m.id);
      await kvPut(env, 'gmail', { items, updated: Date.now() });
      return json({ ok: true, count: items.length });
    }
    case 'POST /ingest/health':
      return json(await ingestHealth(env, await readJson(request), await config()));
    case 'GET /health':
      return json(await getHealth(env, await config(), url.searchParams.get('days') || 30, Date.now(), url.searchParams.get('fresh') === '1'));
    case 'PUT /widget': {
      const body = await readJson(request);
      if (!body.summary || typeof body.summary !== 'object') return err(400, 'summary object required');
      const s = JSON.stringify(body.summary);
      if (s.length > 20 * 1024) return err(413, 'summary too large (max 20 KB)');
      await kvPut(env, 'widget', { summary: body.summary, ts: Date.now() });
      return json({ ok: true });
    }
    case 'GET /widget': {
      const w = await kvGet(env, 'widget');
      if (!w) return err(404, 'no widget data yet');
      return json({ ...w.summary, _updated: w.ts });
    }
    case 'POST /inbox':
      return postInbox(request, env);
    case 'GET /inbox':
      return json((await kvGet(env, 'inbox')) || []);
    case 'DELETE /inbox':
      return deleteInbox(request, env);
    case 'GET /sync':
      return getSync(env);
    case 'PUT /sync':
      return putSync(request, env);
    case 'GET /sync/notes':
      return json(await getNotesIndex(env));
    case 'PUT /sync/notes':
      return putNotes(request, env);
    case 'GET /sync/notes/item':
      return getNotesItem(env, url);
    case 'PUT /backup':
      return putBackup(request, env);
    case 'GET /backup':
      return getBackup(env, url);
    case 'GET /backup/list':
      return json((await kvGet(env, 'backup:meta')) || []);
    case 'DELETE /oauth/ms':
      await env.LIFE.delete('ms_token');
      return json({ ok: true });
    case 'DELETE /oauth/google':
      await env.LIFE.delete('g_token');
      return json({ ok: true });
    default:
      return err(404, 'not found');
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    let resp;
    try {
      resp = await route(request, env, url);
    } catch (e) {
      resp = e instanceof HttpError ? err(e.status, e.message) : err(500, 'internal error', { message: String(e?.message || e) });
    }
    return withCors(resp, origin);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCron(env, event.scheduledTime || Date.now()));
  },
};

export { mergeConfig, cleanSchedule };
