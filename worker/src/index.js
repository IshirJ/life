// life-sync: single-user backend for the Life home-screen app.
import {
  json, err, withCors, corsHeaders, safeEqual, kvGet, kvPut, readJson, readText, readBody, HttpError,
  b64uEncode, b64uDecode, randomBytes, DEFAULT_TZ, safeIso, cacheDel, utf8, APP_URL,
} from './util.js';
import { getVapid, sendPush } from './webpush.js';
import { oauthStart, oauthCallback, safeReturn, disconnect } from './oauth.js';
import {
  getCalendar, getMail, outlookCalendar, ingestHealth, getHealth, normalizeIcsUrl, tzOf,
} from './services.js';
import { isValidTz, parseYmd } from './tz.js';
import { searchFood } from './food.js';
import { SyncHub } from './hub.js';
import { getImages, imageUsed, getBus, getBusStops, aiFood, aiTest, aiStt, jarvisAsk, postReel, listReels, deleteReels, ingestJobs, listJobs, logScreen, getScreen } from './extras.js';

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
  for (const k of ['unsplashKey', 'geminiKey']) if (out[k]) out[k] = MASK;
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
  if (body.jarvisVoice != null) { const v = String(body.jarvisVoice); if (v === 'jarvis' || /^[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural$/.test(v)) next.jarvisVoice = v; else if (!v) delete next.jarvisVoice; }
  for (const k of ['unsplashKey', 'geminiKey', 'geminiModel']) {
    if (body[k] == null || body[k] === MASK) continue;
    const v = String(body[k]).trim().slice(0, 120);
    if (v) next[k] = v; else delete next[k];
  }
  if (body.healthPrefer === 'apple' || body.healthPrefer === 'google') next.healthPrefer = body.healthPrefer;
  return next;
}

// ---------- schedule / cron ----------
// E2E reminders carry {iv, ct} (AES-GCM over {title, body}); stored and pushed as-is, never read here.
function cleanEnc(e) {
  if (!e || typeof e !== 'object' || typeof e.iv !== 'string' || typeof e.ct !== 'string') return undefined;
  if (e.iv.length > 64 || e.ct.length > 3000 || !/^[A-Za-z0-9+/=_-]+$/.test(e.iv + e.ct)) return undefined;
  return { iv: e.iv, ct: e.ct };
}
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
      enc: cleanEnc(it?.enc),
    }))
    .filter((it) => it.id && Number.isFinite(it.at) && it.at > now - DUE_WINDOW)
    .sort((a, b) => a.at - b.at)
    .slice(0, 300)
    .map((it) => ({ ...it, at: new Date(it.at).toISOString() }));
}

// Sent-set key: id + time, so a recurring reminder can reuse its id on different days.
const sentKey = (it) => `${it.id}|${it.at}`;
const memSent = new Set(); // per-isolate guard against KV read-after-write lag

/* Leave-for-class alerts, worked out live every minute from real NMG departures at your stop:
   get ready (bus − 45 min), finish packing (bus − 15 min), leave now (bus − walk − 1 min).
   Each alert uses the latest prediction at the moment it's sent, so a late bus moves the later alerts. */
const leaveSent = new Set();
export async function runLeave(env, now = Date.now()) {
  const plan = await kvGet(env, 'leave');
  if (!plan || !plan.on || !Array.isArray(plan.classes)) return { sent: 0 };
  const soon = plan.classes.filter((t) => t > now && t - now < 110 * 60000);
  if (!soon.length) return { sent: 0 };
  const sub = await kvGet(env, 'sub');
  if (!sub) return { sent: 0 };
  let deps = [];
  try { const r = await getBus(new URL(`https://x/bus?route=${encodeURIComponent(plan.route)}&stop=${encodeURIComponent(plan.stop)}`)); const b = await r.json(); deps = (b.deps || []).map((x) => Date.parse(x)).filter(Number.isFinite); } catch { deps = []; }
  const fmt = (t) => new Date(t).toLocaleTimeString('en-US', { timeZone: plan.tz, hour: 'numeric', minute: '2-digit' });
  const sentObj = (await kvGet(env, 'leaveSent')) || {};
  let sent = 0, dirty = false;
  for (const cls of soon) {
    const latest = cls - (plan.ride + plan.buffer) * 60000;
    const ok = deps.filter((d) => d <= latest && d > now);
    const live = ok.length > 0, bus = live ? Math.max(...ok) : latest;
    const leave = bus - (plan.walk + 1) * 60000;
    const route = plan.route, est = live ? '' : ' (estimated: no live time yet)';
    const kinds = [
      ['ready', bus - 45 * 60000, 'Start getting ready', `${route} at ${fmt(bus)}${est} for your ${fmt(cls)} class. Leave by ${fmt(leave)}.`],
      ['pack', bus - 15 * 60000, 'Finish packing', `Leave in ${Math.max(1, Math.round((leave - now) / 60000))} min (${fmt(leave)}) for the ${fmt(bus)} ${route}.`],
      ['walk', leave, 'Leave now', `${route} at ${fmt(bus)} from ${plan.stopName || 'your stop'}. ${plan.walk} min walk.`],
    ];
    for (const [k, at, title, body] of kinds) {
      const key = `${cls}:${k}`;
      if (now < at || now > at + 4 * 60000 || sentObj[key] || leaveSent.has(key)) continue;
      if (k === 'walk' && !live && deps.length) continue;   // wait for a real prediction for the one that matters most
      try { const r = await sendPush(env, sub, { title, body, tag: `leave-${cls}`, url: '/life/' }); if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) { sentObj[key] = now; leaveSent.add(key); dirty = true; if (r.ok) sent++; } } catch (e) { console.error('leave push', e); }
    }
  }
  if (dirty) { for (const [k, ts] of Object.entries(sentObj)) if (ts < now - 2 * 864e5) delete sentObj[k]; await kvPut(env, 'leaveSent', sentObj); }
  return { sent };
}

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

  // Every send is isolated: one bad reminder can't abort the run, and whatever was delivered is
  // always recorded (finally), so the next minute never repeats it.
  let sent = 0;
  let wrote = false;
  try {
    for (const it of pending) {
      let r;
      try {
        r = await sendPush(env, sub, { title: it.title, body: it.body, url: it.url, tag: it.tag || it.id, enc: it.enc });
      } catch (e) {
        console.error('cron push failed', it.id, e);
        r = { status: 400, ok: false };   // unexpected: treat as permanent so it can't loop every minute
      }
      if (r.status === 404 || r.status === 410) break; // subscription gone (sendPush deleted it)
      // Mark as done on success or permanent client error; retry next minute on 5xx/429/network.
      if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) {
        sentObj[sentKey(it)] = now;
        memSent.add(sentKey(it));
        if (r.ok) sent++;
      }
    }
  } finally {
    if (pending.some((it) => sentObj[sentKey(it)])) {
      for (const [k, ts] of Object.entries(sentObj)) if (ts < now - SENT_KEEP) delete sentObj[k];
      await kvPut(env, 'sent', sentObj);
      wrote = true;
    }
  }
  return { sent, wrote };
}

// ---------- device sync ----------
// Everything goes through one Durable Object (see hub.js) so all devices see the same version instantly.
const hubStub = (env) => env.HUB.get(env.HUB.idFromName('main'));
const hubCall = (env, path, init) => hubStub(env).fetch(new Request('https://hub' + path, init));
async function hub(env, request, device, path) {
  // forward the normalised path (so /sync/ and /sync reach the same handler)
  const target = new URL(request.url);
  if (path) target.pathname = path;
  if (request.headers.get('Upgrade') === 'websocket') {   // pass the upgrade through untouched
    const h = new Headers(request.headers);
    if (device) h.set('X-Life-Device', device);
    return hubStub(env).fetch(new Request(target.toString(), { method: request.method, headers: h }));
  }
  // byte cap with headroom over the Durable Object's 20M-character limit (non-ASCII text is >1 byte/char)
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await readText(request, MAX_SYNC_BYTES);
  return hubStub(env).fetch(new Request(target.toString(), { method: request.method, headers: request.headers, body }));
}
// The whole Life database is one document with a version number. A device sends the version it built on;
// if someone else saved in between it gets 409 and merges first (merging happens on the device).
const MAX_SYNC = 20 * 1024 * 1024;
const MAX_SYNC_BYTES = 28 * 1024 * 1024;
// Notebooks sync item by item (pages can be big): an index of {id: updated} in the Durable Object plus the
// content in KV. Content is written under a per-version key (nb:pages:ID@U) BEFORE the index moves, so a
// device told about a change can always fetch exactly that version, and two devices saving the same item
// can't leave older content behind newer metadata (a KV key is written once and never overwritten).
const nbKind = (it) => (it.kind === 'book' ? 'books' : 'pages');
async function inBatches(list, n, fn) { for (let i = 0; i < list.length; i += n) await Promise.all(list.slice(i, i + n).map(fn)); }
async function putNotes(request, env) {
  const body = await readJson(request, MAX_SYNC);
  const items = [], rejected = [];
  for (const it of Array.isArray(body.items) ? body.items.slice(0, 200) : []) {
    if (!(it && typeof it.id === 'string' && it.id && it.id.length <= 64 && (it.kind === 'book' || it.kind === 'page'))) continue;
    if (!it.deleted && it.data == null) { rejected.push(it.id); continue; }   // a page with no content can't be accepted
    items.push({ kind: it.kind, id: it.id, u: Number(it.u) || Date.now(), deleted: !!it.deleted, data: it.data });
  }
  const meta = items.map(({ kind, id, u, deleted }) => ({ kind, id, u, deleted }));
  const chk = items.length ? await (await hubCall(env, '/sync/notes/check', { method: 'POST', body: JSON.stringify({ items: meta }) })).json() : { ok: [] };
  const newer = new Set(chk.ok || []);
  const ck = (it) => `${nbKind(it)}:${it.id}`;
  const todo = items.filter((it) => newer.has(ck(it)));
  // 1) content first
  await inBatches(todo.filter((it) => !it.deleted), 10, (it) => env.LIFE.put(`nb:${ck(it)}@${it.u}`, JSON.stringify(it.data)));
  // 2) then the index (this is what tells other devices)
  const r = await hubCall(env, '/sync/notes/apply', { method: 'POST', body: JSON.stringify({ items: todo.map(({ kind, id, u, deleted }) => ({ kind, id, u, deleted, v: deleted ? 0 : 1 })) }) });
  const res = await r.json();
  const prev = res.prev || {};
  // 3) tidy up: replaced versions and the old unversioned key go; content of a save that lost a race goes
  const dels = [];
  for (const it of todo) {
    const k = ck(it);
    if (k in prev) {
      const p = prev[k];
      if (p && !p.d && !p.v) dels.push(`nb:${k}`);
      if (p && p.v && p.u !== it.u) dels.push(`nb:${k}@${p.u}`);
    } else if (!it.deleted && res.index?.[nbKind(it)]?.[it.id]?.u !== it.u) dels.push(`nb:${k}@${it.u}`);
  }
  await inBatches(dels, 10, (k) => env.LIFE.delete(k));
  return json({ ok: true, index: res.index, ...(rejected.length ? { rejected } : {}) });
}
async function getNotesItem(env, url) {
  const kind = url.searchParams.get('kind') === 'book' ? 'books' : 'pages';
  const id = url.searchParams.get('id') || '';
  if (!id || id.length > 64) return err(404, 'not found');
  const { entry } = await (await hubCall(env, `/sync/notes/meta?kind=${kind}&id=${encodeURIComponent(id)}`)).json();
  if (entry?.d) return err(404, 'not found');
  const v = await env.LIFE.get(entry?.v ? `nb:${kind}:${id}@${entry.u}` : `nb:${kind}:${id}`);
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
  else text = (await readText(request, 20000)).slice(0, 20000);
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
  let bytes;
  try { bytes = await readBody(request, MAX_BACKUP); } catch (e) {
    if (e instanceof HttpError && e.status === 413) throw new HttpError(413, 'backup too large (max 20 MB)');
    throw e;
  }
  const text = new TextDecoder().decode(bytes);
  const size = bytes.length;
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

// ---------- rate limits ----------
// Per key, generous for one person (a fast voice conversation is ~3 AI calls a turn), but enough to stop a
// leaked key from draining the free Workers AI / Gemini allowance.
const LIMITS = {
  ai: [{ win: 60e3, limit: 60 }, { win: 864e5, limit: 1500 }],
  voice: [{ win: 60e3, limit: 120 }, { win: 864e5, limit: 3000 }],
  cmd: [{ win: 60e3, limit: 60 }, { win: 864e5, limit: 2000 }],
};
function limitGroup(method, path) {
  if (method === 'POST' && (/^\/ai\/(food|stt|test)$/.test(path) || path === '/jarvis/ask' || path === '/jarvis/tts' || path === '/reels')) return 'ai';
  if (path === '/jarvis/voice' && (method === 'GET' || method === 'POST')) return 'voice';
  if (method === 'POST' && path === '/jarvis/cmd') return 'cmd';
  return null;
}
async function keyTag(key) {
  return b64uEncode(new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(key))).slice(0, 9));
}
async function rateLimit(env, key, group) {
  try {
    const tag = await keyTag(key);
    const rules = LIMITS[group].map((r) => ({ b: `${group}:${tag}`, ...r }));
    const r = await (await hubCall(env, '/_/rl', { method: 'POST', body: JSON.stringify({ rules }) })).json();
    if (r.ok === false) return err(429, 'too many requests, try again shortly', {}, { 'Retry-After': String(r.retry || 60) });
  } catch (e) { console.error('rate limit check failed', e); }   // fail open: never lock the owner out
  return null;
}

// ---------- time zone (X-Life-TZ from the app) ----------
const tzSaved = new Map(); // per-isolate: tz already written, so KV isn't rewritten on every request
async function applyTz(env, cfg, hdr) {
  if (!hdr || !isValidTz(hdr) || cfg.tz === hdr) return cfg;
  const next = { ...cfg, tz: hdr };
  if (tzSaved.get('tz') !== hdr) {
    tzSaved.set('tz', hdr);
    await kvPut(env, 'config', next);
  }
  return next;
}

// ---------- Gmail previews: no one-time codes or links stored on the server ----------
const SECRETY = /\b(code|otp|passcode|password|verif\w*|sign[\s-]?in|log[\s-]?in|reset|2fa|one[\s-]?time|security|authenticat\w*|pin)\b/i;
export function redactPreview(t) {
  let s = String(t ?? '').replace(/https?:\/\/\S+/gi, '[link]');
  if (SECRETY.test(s) || SECRETY.test(String(t ?? ''))) s = s.replace(/\b(?=[A-Z0-9-]*\d)[A-Z0-9][A-Z0-9-]{3,11}\b/gi, '••••');
  return s;
}

// ---------- OAuth start without the key in the URL ----------
const OAUTH_TOKEN_TTL = 600;
async function oauthBegin(request, env, url, provider) {
  const b = await readJson(request, 4000);
  const token = b64uEncode(randomBytes(24));
  await env.LIFE.put(`oauths:${token}`, JSON.stringify({ p: provider, r: safeReturn(b.return || APP_URL), t: Date.now() }), { expirationTtl: OAUTH_TOKEN_TTL });
  return json({ url: `${url.origin}/oauth/${provider}/start?s=${token}` });
}
async function takeOauthToken(env, token, provider) {
  if (!token || token.length > 64) return null;
  const k = `oauths:${token}`;
  const v = await kvGet(env, k);
  if (!v) return null;
  await env.LIFE.delete(k);   // single use
  if (v.p !== provider || Date.now() - v.t > OAUTH_TOKEN_TTL * 1000) return null;
  return v;
}

// ---------- router ----------
async function route(request, env, url) {
  const method = request.method;
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Public routes
  if (path === '/' && method === 'GET') return json({ ok: true, name: 'life-sync' });
  if (path === '/pair' && method === 'POST') {
    // Optional extra lock for fresh deploys: set PAIR_SECRET and send it as X-Pair-Secret.
    if (env.PAIR_SECRET && !safeEqual(request.headers.get('X-Pair-Secret') || '', env.PAIR_SECRET)) return err(403, 'pairing secret required');
    if (await env.LIFE.get('key')) return err(409, 'already paired');
    // The Durable Object decides, one request at a time, so only the first caller ever gets a key.
    const r = await hubCall(env, '/_/pair', { method: 'POST', body: JSON.stringify({ key: b64uEncode(randomBytes(32)) }) });
    const d = await r.json();
    return r.ok ? json({ key: d.key }) : err(r.status, d.error || 'pairing failed');
  }
  if (path === '/vapid' && method === 'GET') {
    const v = await getVapid(env);
    return json({ publicKey: v.publicKey });
  }

  // OAuth: start uses a one-time ?s= token (or the old ?k= key), callback is authenticated by the signed state.
  const oauth = /^\/oauth\/(ms|google)\/(start|callback)$/.exec(path);
  if (oauth && method === 'GET') {
    const [, provider, step] = oauth;
    const lifeKey = await env.LIFE.get('key');
    if (!lifeKey) return err(401, 'not paired');
    const config = (await kvGet(env, 'config')) || {};
    if (step === 'start') {
      const s = url.searchParams.get('s');
      if (s) {
        const t = await takeOauthToken(env, s, provider);
        if (!t) return err(401, 'link expired, start again from the app');
        return oauthStart(provider, request, env, lifeKey, config, t.r);
      }
      if (!(await authorize(request, env, url, true))) return err(401, 'unauthorized');
      return oauthStart(provider, request, env, lifeKey, config);
    }
    return oauthCallback(provider, request, env, lifeKey, config);
  }

  if (path === '/sync/ws') {
    const protos = (request.headers.get('Sec-WebSocket-Protocol') || '').split(',').map((x) => x.trim());
    const key = await env.LIFE.get('key');
    if (!key || !protos.some((p) => safeEqual(p, key))) return err(401, 'unauthorized');
    const device = (url.searchParams.get('d') || '').slice(0, 40);
    return hub(env, request, device, path);
  }
  const allowQuery = path === '/widget' && method === 'GET';
  const authKey = await authorize(request, env, url, allowQuery);
  if (!authKey) return err(401, 'unauthorized');

  // Replace a leaked key. The device that asks gets the new key; every other place must be updated by hand.
  // Live connections opened with the old key are closed (devices reconnect with whatever key they hold).
  if (path === '/key/rotate' && method === 'POST') {
    const key = b64uEncode(randomBytes(32));
    await env.LIFE.put('key', key);
    try { await hubCall(env, '/_/close', { method: 'POST' }); } catch (e) { console.error('closing sockets failed', e); }
    return json({ key });
  }
  const oauthB = /^\/oauth\/(ms|google)\/begin$/.exec(path);
  if (oauthB && method === 'POST') return oauthBegin(request, env, url, oauthB[1]);

  const group = limitGroup(method, path);
  if (group) { const limited = await rateLimit(env, authKey, group); if (limited) return limited; }

  const tzHdr = request.headers.get('X-Life-TZ');
  let cfgP = null;
  const config = () => (cfgP ||= (async () => applyTz(env, (await kvGet(env, 'config')) || {}, tzHdr))());
  if (tzHdr) await config();

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
      if (!validSubKeys(subscription.keys)) return err(400, 'subscription keys are not valid');
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
    case 'PUT /leave': {
      // leave-for-class alerts: class START TIMES only (no titles) + bus/walk settings
      const b = await readJson(request, 20000);
      const n = (v, lo, hi, d) => { const x = Number(v); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d; };
      const plan = { on: b.on !== false, route: String(b.route || 'NMG').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8), stop: String(b.stop || '1411').replace(/\D/g, '').slice(0, 8),
        stopName: String(b.stopName || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 40), walk: n(b.walk, 1, 30, 7), ride: n(b.ride, 1, 60, 12), buffer: n(b.buffer, 0, 20, 3),
        tz: /^[A-Za-z_\/+-]{1,40}$/.test(b.tz || '') ? b.tz : 'America/New_York',
        classes: (Array.isArray(b.classes) ? b.classes : []).map(Number).filter((t) => Number.isFinite(t) && t > Date.now() - 36e5 && t < Date.now() + 8 * 864e5).sort((x, y) => x - y).slice(0, 60) };
      await kvPut(env, 'leave', plan);
      return json({ ok: true, classes: plan.classes.length });
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
      const items = body.items.slice(0, 50).filter((m) => m && typeof m === 'object').map((m) => ({
        id: String(m.id ?? ''),
        from: String(m.from ?? '').slice(0, 200),
        subject: String(m.subject ?? '').slice(0, 300),
        preview: redactPreview(String(m.preview ?? '').slice(0, 300)),
        date: safeIso(m.date, new Date().toISOString()),
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
      // live bus times for the widget (cached 20 s server-side)
      let bus = null;
      const bc = Array.isArray(w.summary?.busCfg) ? w.summary.busCfg[0] : null;
      if (bc && bc.route && bc.stop) {
        try {
          const r = await Promise.race([
            getBus(new URL(`https://x/bus?route=${encodeURIComponent(bc.route)}&stop=${encodeURIComponent(bc.stop)}`)),
            new Promise((_, no) => setTimeout(() => no(new Error('bus timeout')), 5000)),
          ]);
          const b = await r.json();
          bus = { route: b.route, stop: b.stop, name: bc.name || b.stopName || '', deps: (b.deps || []).filter((t) => Date.parse(t) > Date.now() - 30000).slice(0, 3) };
        } catch { /* bus is optional */ }
      }
      return json({ ...w.summary, bus, _updated: w.ts });
    }
    case 'POST /inbox':
      return postInbox(request, env);
    case 'GET /inbox':
      return json((await kvGet(env, 'inbox')) || []);
    case 'DELETE /inbox':
      return deleteInbox(request, env);
    case 'GET /img':
      return getImages(env, await config(), url);
    case 'POST /img/used':
      return imageUsed(request, env, await config());
    case 'GET /bus':
      return getBus(url);
    case 'GET /bus/stops':
      return getBusStops(url);
    case 'POST /jarvis/ask':
      return jarvisAsk(request, await config(), env);
    case 'POST /ai/stt':
      return aiStt(request, await config(), env);
    case 'POST /ai/test':
      return aiTest(await config());
    case 'POST /ai/food':
      return aiFood(request, await config(), env);
    case 'POST /reels':
      return postReel(request, env, await config());
    case 'GET /reels':
      return listReels(env);
    case 'DELETE /reels':
      return deleteReels(request, env);
    case 'POST /ingest/jobs':
      return ingestJobs(request, env);
    case 'GET /jobs':
      return listJobs(env);
    case 'POST /screen':
      return logScreen(request, env, tzOf(await config()));
    case 'GET /screen':
      return getScreen(env);
    case 'POST /jarvis/voice': {
      // the laptop's spoken reply (MP3, same voice as on the laptop) so the phone can play it
      const id = (url.searchParams.get('id') || '').replace(/[^a-z0-9]/gi, '').slice(0, 40);
      let buf;
      try { buf = await readBody(request, 4_000_000); } catch (e) {
        if (e instanceof HttpError && e.status === 413) return err(413, 'audio too large');
        throw e;
      }
      if (!id || !buf.byteLength) return err(400, 'id and audio required');
      await env.LIFE.put(`jvoice:${id}`, buf, { expirationTtl: 3600 });
      return json({ ok: true });
    }
    case 'POST /jarvis/tts': {
      // server-side voice (Cloudflare Workers AI, free allowance) for replies the laptop didn't voice
      if (!env.AI) return err(501, 'voice not available');
      const b = await readJson(request, 20_000);
      const text = String(b.text || '').trim().slice(0, 600);
      if (!text) return err(400, 'text required');
      const female = /Ava|Sonia|Jenny|Aria|female/i.test(String(b.voice || ''));
      const out = await env.AI.run('@cf/deepgram/aura-1', { text, speaker: female ? 'luna' : 'helios' }, { returnRawResponse: true });
      const buf = out instanceof Response ? await out.arrayBuffer() : out instanceof ReadableStream ? await new Response(out).arrayBuffer() : out;
      return new Response(buf, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
    }
    case 'GET /jarvis/voice': {
      const id = (url.searchParams.get('id') || '').replace(/[^a-z0-9]/gi, '').slice(0, 40);
      const a = id && await env.LIFE.get(`jvoice:${id}`, 'arrayBuffer');
      if (!a || !a.byteLength) return err(404, 'no audio');
      const type = a.byteLength >= 4 && String.fromCharCode(...new Uint8Array(a, 0, 4)) === 'RIFF' ? 'audio/wav' : 'audio/mpeg';
      return new Response(a, { headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=3600' } });
    }
    case 'POST /jarvis/cmd':
    case 'GET /jarvis/next':
    case 'POST /jarvis/reply':
    case 'GET /jarvis/log':
    case 'POST /jarvis/wake':
    case 'POST /jarvis/step':
    case 'GET /jarvis/wake':
      return hub(env, request, '', path);
    case 'GET /sync':
    case 'PUT /sync':
    case 'GET /sync/notes':
    case 'GET /sync/status':
      return hub(env, request, '', path);
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
      await disconnect('ms', env, await config());
      await cacheDel('mail:outlook');
      return json({ ok: true });
    case 'DELETE /oauth/google':
      await disconnect('google', env, await config());
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
      if (resp.status === 101) return resp;
    } catch (e) {
      if (e instanceof HttpError) resp = err(e.status, e.message);
      else {
        // details stay in the logs; the client only learns that something failed
        console.error('unhandled error', request.method, url.pathname, e?.stack || e);
        resp = err(500, 'internal error');
      }
    }
    return withCors(resp, origin);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runCron(env, event.scheduledTime || Date.now()));
    ctx.waitUntil(runLeave(env, event.scheduledTime || Date.now()).catch((e) => console.error('leave', e)));
  },
};

// p256dh: uncompressed P-256 point (65 bytes, 0x04 first); auth: 16 bytes.
function validSubKeys(k) {
  try {
    const p = b64uDecode(String(k.p256dh)), a = b64uDecode(String(k.auth));
    return p.length === 65 && p[0] === 4 && a.length === 16;
  } catch { return false; }
}

export { mergeConfig, cleanSchedule, SyncHub };
