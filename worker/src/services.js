// Data sources: ICS calendars, Outlook (Graph) mail/calendar, Gmail ingest, health (Apple ingest + Google Health).
import { kvGet, cacheGet, cachePut, looseNumber, DEFAULT_TZ, fetchT, responseText } from './util.js';
import { expandIcs } from './ics.js';
import { getAccessToken, ReauthError } from './oauth.js';
import { localToUtc, utcToLocal, parseYmd, fmtDate, todayIn, ianaToWindows, dayNum, fromDayNum } from './tz.js';

const GRAPH = 'https://graph.microsoft.com/v1.0';
const GH = 'https://health.googleapis.com/v4/users/me/dataTypes';

export const tzOf = (config) => config?.tz || DEFAULT_TZ;

function errorEntry(source, e) {
  if (e instanceof ReauthError) return { source, code: 'reauth', message: e.message };
  return { source, message: String(e?.message || e) };
}

// ---------------- ICS calendars ----------------
export const normalizeIcsUrl = (u) => String(u || '').trim().replace(/^webcals?:\/\//i, 'https://');

const ICS_MAX = 5 * 1024 * 1024;
async function fetchIcs(url) {
  const ck = `ics:${url}`;
  const hit = await cacheGet(ck);
  if (hit != null) return hit;
  if (!/^https?:\/\//i.test(url)) throw new Error('calendar link must start with https://');
  let res;
  try {
    res = await fetchT(url, { headers: { Accept: 'text/calendar, */*', 'User-Agent': 'life-sync/1.0' } }, 10000);
  } catch (e) {
    throw new Error(e?.name === 'TimeoutError' ? 'calendar took too long to answer' : 'calendar unreachable');
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let text;
  try { text = await responseText(res, ICS_MAX); } catch { throw new Error('calendar feed too large (max 5 MB)'); }
  if (!/BEGIN:VCALENDAR/i.test(text)) throw new Error('not an iCalendar feed');
  await cachePut(ck, text, 15 * 60);
  return text;
}

export async function getCalendar(config, from, to) {
  const tz = tzOf(config);
  const events = [];
  const errors = [];
  await Promise.all((config.calendars || []).map(async (c) => {
    try {
      const text = await fetchIcs(normalizeIcsUrl(c.url));
      events.push(...expandIcs(text, { from, to, tz, cal: c.id }));
    } catch (e) {
      errors.push({ cal: c.id, message: String(e?.message || e) });
    }
  }));
  events.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return { events, errors };
}

// ---------------- Outlook via Graph ----------------
async function graph(env, config, path, headers = {}) {
  const token = await getAccessToken('ms', env, config);
  const res = await fetchT(path.startsWith('http') ? path : GRAPH + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...headers },
  }, 15000);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(`Graph ${res.status}: ${data?.error?.code || ''} ${data?.error?.message || ''}`.trim());
    e.status = res.status;
    throw e;
  }
  return data;
}

export async function outlookUnread(env, config) {
  const sel = '$select=id,subject,from,receivedDateTime,bodyPreview,webLink,isRead';
  let list;
  try {
    // Graph requires $orderby properties to also appear (first) in $filter.
    const filter = encodeURIComponent('receivedDateTime ge 1900-01-01T00:00:00Z and isRead eq false');
    const d = await graph(env, config, `/me/mailFolders/inbox/messages?$filter=${filter}&$orderby=receivedDateTime%20desc&$top=15&${sel}`);
    list = d.value || [];
  } catch (e) {
    if (e instanceof ReauthError || e.status !== 400) throw e;
    // Fallback: newest 50, filter unread client-side.
    const d = await graph(env, config, `/me/mailFolders/inbox/messages?$orderby=receivedDateTime%20desc&$top=50&${sel}`);
    list = (d.value || []).filter((m) => !m.isRead).slice(0, 15);
  }
  return list.map((m) => ({
    id: m.id,
    source: 'outlook',
    from: m.from?.emailAddress?.name || m.from?.emailAddress?.address || '',
    subject: m.subject || '(no subject)',
    preview: (m.bodyPreview || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    date: m.receivedDateTime,
    link: m.webLink || '',
    unread: true,
  }));
}

export async function getMail(env, config) {
  const items = [];
  const errors = [];
  const [msTok, gmail] = await Promise.all([kvGet(env, 'ms_token'), kvGet(env, 'gmail')]);
  if (msTok) {
    try {
      const ck = 'mail:outlook';
      let o = await cacheGet(ck);
      if (!o) { o = await outlookUnread(env, config); await cachePut(ck, o, 60); }
      items.push(...o);
    } catch (e) { errors.push(errorEntry('outlook', e)); }
  }
  for (const g of gmail?.items || []) items.push({ ...g, source: 'gmail', unread: true });
  items.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  return { items: items.slice(0, 30), errors };
}

export async function outlookCalendar(env, config, from, to) {
  const tz = tzOf(config);
  const f = parseYmd(from), t = parseYmd(to);
  const start = new Date(localToUtc(f.y, f.m, f.d, 0, 0, 0, tz)).toISOString();
  const end = new Date(localToUtc(t.y, t.m, t.d + 1, 0, 0, 0, tz)).toISOString();
  const pref = { Prefer: `outlook.timezone="${ianaToWindows(tz)}"` };
  let url = `/me/calendarView?startDateTime=${start}&endDateTime=${end}&$top=100&$orderby=start/dateTime`
    + '&$select=id,subject,start,end,isAllDay,location,isCancelled';
  const events = [];
  for (let page = 0; url && page < 5; page++) {
    const d = await graph(env, config, url, pref);
    for (const e of d.value || []) {
      if (e.isCancelled) continue;
      events.push({
        id: e.id,
        cal: 'outlook',
        title: e.subject || '(No title)',
        allDay: !!e.isAllDay,
        start: e.isAllDay ? String(e.start?.dateTime).slice(0, 10) : String(e.start?.dateTime).slice(0, 16),
        end: e.isAllDay ? String(e.end?.dateTime).slice(0, 10) : String(e.end?.dateTime).slice(0, 16),
        location: e.location?.displayName || '',
      });
    }
    url = d['@odata.nextLink'] || null;
  }
  return events;
}

// ---------------- Health ----------------
const FIELDS = ['steps', 'activeKcal', 'sleepMin', 'restingHr', 'weightLb', 'kcal', 'protein', 'carbs', 'fat'];
const ALIASES = {
  steps: ['steps', 'stepCount', 'step_count'],
  activeKcal: ['activeKcal', 'active', 'activeEnergy', 'active_kcal', 'activeCalories'],
  sleepMin: ['sleepMin', 'sleepMinutes', 'sleep', 'sleep_min'],
  restingHr: ['restingHr', 'restingHeartRate', 'resting_hr', 'rhr'],
  weightLb: ['weightLb', 'weight', 'weight_lb', 'weightLbs'],
  kcal: ['kcal', 'calories', 'dietaryEnergy', 'energy', 'dietary_kcal'],
  protein: ['protein', 'proteinG'],
  carbs: ['carbs', 'carbohydrates', 'carbsG'],
  fat: ['fat', 'totalFat', 'fatG'],
};
// Weight takes the latest sample; resting HR averages; everything else sums.
const LAST = new Set(['weightLb']);
const AVG = new Set(['restingHr']);

// A Shortcut may send a number, "2,345", a list, or newline-joined samples.
function numbersOf(v) {
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v.flatMap(numbersOf);
  if (typeof v === 'object') return numbersOf(v.value ?? v.quantity);
  if (typeof v === 'string' && /\n/.test(v)) return v.split(/\n+/).flatMap(numbersOf);
  const n = looseNumber(v);
  return n == null ? [] : [n];
}

function toDateKey(v, tz) {
  if (!v) return todayIn(tz);
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    // Bare date strings ("Oct 19, 2026") parse as local midnight of the runtime (UTC) — keep the civil date.
    if (!/\d{1,2}:\d{2}/.test(s)) { const d = new Date(t); return fmtDate({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }); }
    return fmtDate(utcToLocal(t, tz));
  }
  return null;
}

export function normalizeHealthDay(raw, tz) {
  const date = toDateKey(raw.date ?? raw.day, tz);
  if (!date) return null;
  const out = { date };
  for (const f of FIELDS) {
    let nums = [];
    for (const a of ALIASES[f]) if (raw[a] != null) { nums = numbersOf(raw[a]); break; }
    if (f === 'weightLb' && !nums.length && raw.weightKg != null) nums = numbersOf(raw.weightKg).map((k) => k * 2.20462);
    if (f === 'sleepMin' && !nums.length && raw.sleepHours != null) nums = numbersOf(raw.sleepHours).map((h) => h * 60);
    if (!nums.length) continue;
    let v = LAST.has(f) ? nums[nums.length - 1]
      : AVG.has(f) ? nums.reduce((a, b) => a + b, 0) / nums.length
        : nums.reduce((a, b) => a + b, 0);
    v = f === 'weightLb' ? Math.round(v * 10) / 10 : Math.round(v);
    out[f] = v;
  }
  return out;
}

export async function ingestHealth(env, body, config, now = Date.now()) {
  const tz = tzOf(config);
  const list = Array.isArray(body) ? body : Array.isArray(body.days) ? body.days : [body];
  const store = (await kvGet(env, 'health')) || { days: {}, updated: null };
  let n = 0;
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const d = normalizeHealthDay(raw, tz);
    if (!d || Object.keys(d).length < 2) continue;
    store.days[d.date] = { ...(store.days[d.date] || {}), ...d, source: 'apple', updated: now };
    n++;
  }
  // Keep the last 90 days.
  const t = parseYmd(todayIn(tz, now));
  const cutoff = fmtDate(fromDayNum(dayNum(t.y, t.m, t.d) - 90));
  for (const k of Object.keys(store.days)) if (k < cutoff) delete store.days[k];
  store.updated = now;
  if (n) await env.LIFE.put('health', JSON.stringify(store));
  return { ok: true, accepted: n, dates: Object.keys(store.days).length };
}

// --- Google Health API (v4) ---
const civil = (ymd) => ({ date: { year: ymd.y, month: ymd.m, day: ymd.d }, time: { hours: 0, minutes: 0, seconds: 0, nanos: 0 } });

async function googleFetch(env, config, url, init = {}) {
  const token = await getAccessToken('google', env, config);
  const res = await fetchT(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(init.headers || {}) },
  }, 15000);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google Health ${res.status}: ${data?.error?.status || ''} ${data?.error?.message || ''}`.trim());
  return data;
}

export async function googleSteps(env, config, startYmd, endYmdExcl) {
  const data = await googleFetch(env, config, `${GH}/steps/dataPoints:dailyRollUp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ range: { start: civil(startYmd), end: civil(endYmdExcl) }, windowSizeDays: 1 }),
  });
  const out = {};
  for (const p of data.rollupDataPoints || []) {
    const dt = p.civilStartTime?.date;
    const v = looseNumber(p.steps?.countSum ?? p.steps?.count);
    if (dt && v != null) out[fmtDate({ y: dt.year, m: dt.month, d: dt.day })] = Math.round(v);
  }
  return out;
}

// Convert a time-ish value (RFC 3339 string, {seconds}, or civil {date,time}) → UTC ms (civil interpreted in tz).
function toMs(v, tz) {
  if (v == null) return null;
  if (typeof v === 'string') { const t = Date.parse(v); return Number.isNaN(t) ? null : t; }
  if (typeof v === 'object') {
    if (v.seconds != null) return Number(v.seconds) * 1000;
    if (v.date?.year) {
      const t = v.time || {};
      return localToUtc(v.date.year, v.date.month, v.date.day, t.hours || 0, t.minutes || 0, t.seconds || 0, tz);
    }
  }
  return null;
}

// Find the first object (depth-first) that looks like an interval with start+end.
function findInterval(o, depth = 0) {
  if (!o || typeof o !== 'object' || depth > 6) return null;
  const keys = Object.keys(o);
  const sk = keys.find((k) => /^(start(Time)?|civilStartTime|start_time)$/i.test(k));
  const ek = keys.find((k) => /^(end(Time)?|civilEndTime|end_time)$/i.test(k));
  if (sk && ek) return { s: o[sk], e: o[ek], civilS: o.civilStartTime, civilE: o.civilEndTime };
  for (const k of keys) {
    const r = findInterval(o[k], depth + 1);
    if (r) return r;
  }
  return null;
}
function findMinutesAsleep(o, depth = 0) {
  if (!o || typeof o !== 'object' || depth > 6) return null;
  for (const [k, v] of Object.entries(o)) {
    if (/minutes.?asleep|asleep.?minutes/i.test(k)) { const n = looseNumber(v); if (n != null) return n; }
  }
  for (const v of Object.values(o)) { const r = findMinutesAsleep(v, depth + 1); if (r != null) return r; }
  return null;
}

export function parseGoogleSleep(pages, tz, times = null) {
  const out = {};
  for (const data of pages) {
    const points = data.dataPoints || data.sleepDataPoints || Object.values(data).find(Array.isArray) || [];
    for (const p of points) {
      const iv = findInterval(p);
      if (!iv) continue;
      const s = toMs(iv.s, tz) ?? toMs(iv.civilS, tz);
      const e = toMs(iv.e, tz) ?? toMs(iv.civilE, tz);
      if (s == null || e == null || e <= s) continue;
      const mins = findMinutesAsleep(p) ?? Math.round((e - s) / 60000);
      const key = iv.civilE?.date?.year ? fmtDate({ y: iv.civilE.date.year, m: iv.civilE.date.month, d: iv.civilE.date.day }) : fmtDate(utcToLocal(e, tz));
      out[key] = (out[key] || 0) + Math.round(mins);
      // bedtime and wake time of the night's main (longest) sleep, local HH:MM, for the circadian rhythm card
      if (times && (!times[key] || e - s > times[key].len)) {
        const a = utcToLocal(s, tz), b = utcToLocal(e, tz), hm = (x) => `${String(x.h).padStart(2, '0')}:${String(x.mi).padStart(2, '0')}`;
        times[key] = { len: e - s, bed: hm(a), wake: hm(b) };
      }
    }
  }
  return out;
}

export async function googleSleep(env, config, startYmd, times = null) {
  const tz = tzOf(config);
  const filter = `sleep.interval.civil_end_time >= "${fmtDate(startYmd)}T00:00:00"`; // sleep can only be filtered by its END time
  const pages = [];
  let token = '';
  for (let i = 0; i < 5; i++) {
    // encodeURIComponent (spaces as %20, not '+') for the filter expression.
    let qs = `filter=${encodeURIComponent(filter)}&pageSize=100`;
    if (token) qs += `&pageToken=${encodeURIComponent(token)}`;
    const data = await googleFetch(env, config, `${GH}/sleep/dataPoints?${qs}`);
    pages.push(data);
    token = data.nextPageToken;
    if (!token) break;
  }
  const points = pages.reduce((n, d) => n + ((d.dataPoints || Object.values(d).find(Array.isArray) || []).length), 0);
  const res = parseGoogleSleep(pages, tz, times);
  if (points > 0 && !Object.keys(res).length) throw new Error('unrecognised sleep response shape');
  return res;
}

// Daily resting heart rate: a "daily" record type, filtered on its civil date.
// Parsing walks each point for a beatsPerMinute value and a {year,month,day} date, so small shape
// differences between API revisions don't silently drop the number.
function findKey(o, re, depth = 0) {
  if (!o || typeof o !== 'object' || depth > 6) return undefined;
  for (const [k, v] of Object.entries(o)) if (re.test(k) && (typeof v !== 'object' || v === null)) return v;
  for (const v of Object.values(o)) { const r = findKey(v, re, depth + 1); if (r !== undefined) return r; }
  return undefined;
}
function findDate(o, depth = 0) {
  if (!o || typeof o !== 'object' || depth > 6) return null;
  if (o.year && o.month && o.day && typeof o.year === 'number') return o;
  if (o.date && typeof o.date === 'object' && o.date.year) return o.date;
  for (const v of Object.values(o)) { const r = findDate(v, depth + 1); if (r) return r; }
  return null;
}
export function parseGoogleRhr(pages) {
  const out = {}, cnt = {};
  for (const data of pages) {
    const points = data.dataPoints || Object.values(data).find(Array.isArray) || [];
    for (const p of points) {
      const v = looseNumber(findKey(p, /^beatsPerMinute$/i));
      const dt = findDate(p);
      if (v == null || !dt || v < 20 || v > 220) continue;
      const key = fmtDate({ y: dt.year, m: dt.month, d: dt.day });
      out[key] = (out[key] || 0) + v; cnt[key] = (cnt[key] || 0) + 1;
    }
  }
  for (const k of Object.keys(out)) out[k] = Math.round(out[k] / cnt[k]);
  return out;
}

export async function googleRhr(env, config, startYmd) {
  const filter = `daily_resting_heart_rate.date >= "${fmtDate(startYmd)}"`;
  const pages = [];
  let token = '';
  for (let i = 0; i < 3; i++) {
    let qs = `filter=${encodeURIComponent(filter)}&pageSize=100`;
    if (token) qs += `&pageToken=${encodeURIComponent(token)}`;
    let data;
    try { data = await googleFetch(env, config, `${GH}/daily-resting-heart-rate/dataPoints?${qs}`); }
    catch (e) {
      // if this API revision rejects the date filter, fall back to the newest page without one
      if (i || !/FILTER|400/.test(String(e?.message))) throw e;
      data = await googleFetch(env, config, `${GH}/daily-resting-heart-rate/dataPoints?pageSize=100`);
      pages.push(data); break;
    }
    pages.push(data);
    token = data.nextPageToken;
    if (!token) break;
  }
  return parseGoogleRhr(pages);
}

// Calories burned per day (total, incl. resting) — dailyRollUp; ranges are limited to 14 days.
export async function googleCalories(env, config, startYmd, endYmdExcl) {
  const data = await googleFetch(env, config, `${GH}/total-calories/dataPoints:dailyRollUp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ range: { start: civil(startYmd), end: civil(endYmdExcl) }, windowSizeDays: 1 }),
  });
  const out = {};
  for (const p of data.rollupDataPoints || []) {
    const dt = p.civilStartTime?.date;
    const v = looseNumber(findKey(p, /kcal|calories/i));
    if (dt && v != null && v > 0) out[fmtDate({ y: dt.year, m: dt.month, d: dt.day })] = Math.round(v);
  }
  return out;
}

// The most recent heart-rate sample (what the Fitbit app shows as "Heart rate"), from the last 30 minutes.
export async function googleLatestHr(env, config, now = Date.now()) {
  const since = new Date(now - 30 * 60000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const filter = `heart_rate.sample_time.physical_time >= "${since}"`;
  let best = null, token = '';
  for (let i = 0; i < 3; i++) {
    let qs = `filter=${encodeURIComponent(filter)}&pageSize=1000`;
    if (token) qs += `&pageToken=${encodeURIComponent(token)}`;
    const data = await googleFetch(env, config, `${GH}/heart-rate/dataPoints?${qs}`);
    for (const p of data.dataPoints || []) {
      const bpm = looseNumber(findKey(p, /^beatsPerMinute$/i));
      const t = Date.parse(findKey(p, /^physicalTime$/i) || '');
      if (bpm != null && !Number.isNaN(t) && (!best || t > best.t)) best = { bpm: Math.round(bpm), t };
    }
    token = data.nextPageToken;
    if (!token) break;
  }
  return best;
}

const OPTIONAL_PARTS = new Set(['restingHr', 'calories', 'heartRate']);
export async function getHealth(env, config, days = 30, now = Date.now(), fresh = false) {
  const tz = tzOf(config);
  days = Math.max(1, Math.min(90, Number(days) || 30));
  const today = parseYmd(todayIn(tz, now));
  const todayDn = dayNum(today.y, today.m, today.d);
  const startYmd = fromDayNum(todayDn - days + 1);
  const startKey = fmtDate(startYmd);
  const errors = [];
  const [apple, gTok] = await Promise.all([kvGet(env, 'health'), kvGet(env, 'g_token')]);

  let google = null;
  if (gTok) {
    const ck = `gh:${days}:${fmtDate(today)}`;
    google = fresh ? null : await cacheGet(ck);
    if (!google) {
      google = { steps: {}, sleep: {}, rhr: {}, ts: now };
      let any = false;
      try { google.steps = await googleSteps(env, config, startYmd, fromDayNum(todayDn + 1)); any = true; }
      catch (e) { errors.push(errorEntry('google', e)); }
      if (!errors.some((x) => x.code === 'reauth')) {
        try { google.sleepT = {}; google.sleep = await googleSleep(env, config, startYmd, google.sleepT); any = true; }
        catch (e) { errors.push({ ...errorEntry('google', e), part: 'sleep' }); }
        try { google.rhr = await googleRhr(env, config, startYmd); any = true; }
        catch (e) { errors.push({ ...errorEntry('google', e), part: 'restingHr' }); }
        try { google.kcal = await googleCalories(env, config, fromDayNum(todayDn - Math.min(days, 14) + 1), fromDayNum(todayDn + 1)); any = true; }
        catch (e) { errors.push({ ...errorEntry('google', e), part: 'calories' }); }
        try { google.hr = await googleLatestHr(env, config, now); }
        catch (e) { errors.push({ ...errorEntry('google', e), part: 'heartRate' }); }
      }
      if (any && !errors.some((x) => !OPTIONAL_PARTS.has(x.part))) await cachePut(ck, google, 3 * 60);
      if (!any) google = null;
    }
  }

  const preferGoogle = (config.healthPrefer || 'google') === 'google';
  const map = {};
  for (const [date, d] of Object.entries(apple?.days || {})) {
    if (date < startKey) continue;
    const { source, updated, date: _date, ...vals } = d;
    map[date] = { date, ...vals, apple: vals };
  }
  if (google) {
    const dates = new Set([...Object.keys(google.steps || {}), ...Object.keys(google.sleep || {}), ...Object.keys(google.rhr || {}), ...Object.keys(google.kcal || {})]);
    for (const date of dates) {
      if (date < startKey) continue;
      const g = {};
      if (google.steps?.[date] != null) g.steps = google.steps[date];
      if (google.sleep?.[date] != null) g.sleepMin = google.sleep[date];
      if (google.sleepT?.[date]) { g.bed = google.sleepT[date].bed; g.wake = google.sleepT[date].wake; }
      if (google.rhr?.[date] != null) g.restingHr = google.rhr[date];
      if (google.kcal?.[date] != null) g.burnKcal = google.kcal[date];
      const cur = map[date] || { date };
      for (const [k, v] of Object.entries(g)) if (preferGoogle || cur[k] == null) cur[k] = v;
      cur.google = g;
      map[date] = cur;
    }
  }
  return {
    days: Object.values(map).sort((a, b) => (a.date < b.date ? 1 : -1)),
    sources: { apple: apple?.updated || null, google: google ? google.ts : null },
    latestHr: google?.hr || null,
    errors,
  };
}

