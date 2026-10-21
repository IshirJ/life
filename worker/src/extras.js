// Extras: Unsplash photos, Blacksburg Transit departures, Gemini (food photos + reel guides),
// job emails from Gmail, social-media pause log. All free services; keys live in the server config.
import { kvGet, kvPut, json, err, readJson, HttpError, cacheGet, cachePut, fetchT, responseText, safeIso } from './util.js';
import { todayIn } from './tz.js';

const DAY = 864e5;
const clip = (v, n) => String(v ?? '').slice(0, n);

// ---------------- Unsplash ----------------
// The app asks for a topic ("forest morning", "healthy food"); the server searches once a week per topic
// and keeps the answer, so the free 50-requests-an-hour limit is never close.
export async function getImages(env, config, url) {
  const q = clip(url.searchParams.get('q'), 60).trim().toLowerCase();
  if (q.length < 2) return err(400, 'q required');
  const o = ['landscape', 'portrait', 'squarish'].includes(url.searchParams.get('o')) ? url.searchParams.get('o') : 'landscape';
  const key = `img:${o}:${q}`;
  const hit = await kvGet(env, key);
  if (hit && Date.now() - hit.at < 7 * DAY) return json({ photos: hit.photos, cached: true });
  if (!config.unsplashKey) return json({ photos: hit?.photos || [], error: 'no_key' });
  const api = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=${o}&per_page=12&content_filter=high`;
  let r;
  try { r = await fetchT(api, { headers: { Authorization: `Client-ID ${config.unsplashKey}`, 'Accept-Version': 'v1' } }, 10000); }
  catch { return json({ photos: hit?.photos || [], error: 'unsplash unreachable' }); }
  if (!r.ok) return json({ photos: hit?.photos || [], error: r.status === 403 || r.status === 429 ? 'rate' : `unsplash ${r.status}` });
  const d = await r.json();
  const photos = (d.results || []).map((p) => ({
    id: p.id,
    raw: p.urls?.raw,                  // resized on the fly by adding w=…&q=… (imgix); keeps ixid for view tracking
    color: p.color,
    blur: p.blur_hash || null,
    alt: clip(p.alt_description || p.description, 140),
    name: clip(p.user?.name, 80),
    user: p.user?.links?.html || '',
    link: p.links?.html || '',
    dl: p.links?.download_location || '',
  })).filter((p) => p.raw);
  await kvPut(env, key, { at: Date.now(), photos });
  return json({ photos });
}
// Unsplash asks apps to report when a photo is actually used.
export async function imageUsed(request, env, config) {
  const { dl } = await readJson(request, 2000);
  if (!config.unsplashKey || typeof dl !== 'string' || !dl.startsWith('https://api.unsplash.com/photos/')) return json({ ok: false });
  const seen = (await cacheGet('imgseen:' + dl)) || null;
  if (!seen) { await fetchT(dl, { headers: { Authorization: `Client-ID ${config.unsplashKey}` } }, 8000).catch(() => {}); await cachePut('imgseen:' + dl, 1, 86400); }
  return json({ ok: true });
}

// ---------------- Blacksburg Transit ----------------
// HTTPS first (the service publishes https links); plain http only if https can't be reached at all.
const BT_HOSTS = ['https://www.bt4uclassic.org', 'http://www.bt4uclassic.org'];
const BT_PATH = '/webservices/bt4u_webservice.asmx';
const BT_MAX = 512 * 1024;
async function btFetch(op) {
  let last;
  for (const h of BT_HOSTS) {
    try {
      const r = await fetchT(`${h}${BT_PATH}/${op}`, {}, 3000);
      return { ok: r.ok, status: r.status, text: r.ok ? await responseText(r, BT_MAX, true) : '' };
    } catch (e) { last = e; }
  }
  return { ok: false, status: 0, error: last?.name === 'TimeoutError' ? 'timeout' : 'unreachable', text: '' };
}
const tag = (xml, t) => [...xml.matchAll(new RegExp(`<${t}>([^<]*)</${t}>`, 'g'))].map((m) => m[1]);
export async function getBus(url) {
  const route = clip(url.searchParams.get('route'), 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const stop = clip(url.searchParams.get('stop'), 8).replace(/\D/g, '');
  if (!route || !stop) return err(400, 'route and stop required');
  const ck = `bus:${route}:${stop}`;
  const hit = await cacheGet(ck);
  if (hit) return json(hit);
  const r = await btFetch(`GetNextDepartures?routeShortName=${route}&stopCode=${stop}`);
  if (!r.ok) return json({ route, stop, deps: [], error: r.error ? `BT ${r.error}` : `BT ${r.status}` });
  const xml = r.text;
  const times = tag(xml, 'AdjustedDepartureTime'), names = tag(xml, 'StopName');
  // one malformed time must not sink the whole answer
  const out = { route, stop, stopName: names[0] || '', deps: times.map((t) => safeIso(t)).filter(Boolean).slice(0, 8), at: Date.now() };
  await cachePut(ck, out, 20);
  return json(out);
}
export async function getBusStops(url) {
  const route = clip(url.searchParams.get('route'), 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!route) return err(400, 'route required');
  const ck = `busstops:${route}`;
  const hit = await cacheGet(ck);
  if (hit) return json(hit);
  const r = await btFetch(`GetScheduledStopCodes?routeShortName=${route}`);
  const xml = r.ok ? r.text : '';
  const codes = tag(xml, 'StopCode'), names = tag(xml, 'StopName');
  const out = { route, stops: codes.map((c, i) => ({ code: c, name: names[i] || c })) };
  if (out.stops.length) await cachePut(ck, out, 6 * 3600);
  return json(out);
}

// ---------------- AI output is untrusted: coerce + clamp everything ----------------
export function num(v, lo, hi, dp = 0) {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
  const c = Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
  return dp ? +c.toFixed(dp) : Math.round(c);
}
const str = (v, n = 80) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n).trim();
export function cleanFood(x) {
  return {
    name: str(x.name), grams: num(x.grams, 0, 3000), kcal: num(x.kcal, 0, 5000),
    protein: num(x.protein, 0, 500, 1), fat: num(x.fat, 0, 500, 1), carbs: num(x.carbs, 0, 500, 1),
    confidence: ['high', 'medium', 'low'].includes(str(x.confidence, 10).toLowerCase()) ? str(x.confidence, 10).toLowerCase() : '',
  };
}
const ACTION_TYPES = ['add_task', 'add_reminder', 'log_food', 'tick_habit', 'complete', 'start_focus', 'set_bus_stop', 'needs_laptop'];
const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
// Only known action types and fields, with sane values; anything else is dropped.
export function cleanActions(list) {
  const out = [];
  for (const a of Array.isArray(list) ? list : []) {
    if (out.length >= 5) break;
    if (!a || typeof a !== 'object' || !ACTION_TYPES.includes(a.type)) continue;
    const o = { type: a.type };
    const title = str(a.title);
    if (title) o.title = title;
    if (typeof a.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a.due.trim()) && !Number.isNaN(Date.parse(a.due.trim()))) o.due = a.due.trim();
    if (typeof a.time === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(a.time.trim())) o.time = a.time.trim().padStart(5, '0');
    if (a.urgency != null) o.urgency = num(a.urgency, 0, 3);
    if (a.type === 'log_food') {
      for (const [k, hi] of [['kcal', 5000], ['protein', 500], ['fat', 500], ['carbs', 500], ['grams', 3000]]) if (a[k] != null) o[k] = num(a[k], 0, hi, k === 'kcal' || k === 'grams' ? 0 : 1);
      const meal = str(a.meal, 20).toLowerCase();
      if (MEALS.includes(meal)) o.meal = meal;
    }
    if (a.type === 'start_focus' && a.minutes != null) o.minutes = num(a.minutes, 1, 600);
    if (a.type === 'set_bus_stop') {
      const route = str(a.route, 8).toUpperCase().replace(/[^A-Z0-9]/g, ''), stop = str(a.stop, 8).replace(/\D/g, '');
      if (route) o.route = route;
      if (stop) o.stop = stop;
    }
    out.push(o);
  }
  return out;
}

// ---------------- Gemini (free tier) ----------------
const GEM = 'https://generativelanguage.googleapis.com';
function gemModel(config) { return clip(config.geminiModel || 'gemini-2.5-flash', 60).replace(/[^a-z0-9.\-]/gi, ''); }
// Free-tier quotas differ per model (some new models have none), so on a quota/model error try the next one.
const GEM_FALLBACK = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-flash-latest'];
function gemHint(status, msg) {
  const m = String(msg || '');
  if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(m)) return 'Your Gemini key isn’t valid. Copy it again from aistudio.google.com/apikey and paste it in Settings → Connections → AI.';
  if (status === 403) return 'Gemini refused this key (403). Make sure the Generative Language API is enabled for the key’s project, or create a new key in AI Studio.';
  if (status === 504) return 'Gemini took too long to answer. Try again, or describe the food instead.';
  if (status === 429) return 'Gemini’s free limit is used up for now. Try again in a minute (or tomorrow if it’s the daily limit).';
  if (/location is not supported/i.test(m)) return 'Gemini isn’t available from the server’s region right now.';
  return `Gemini ${status}: ${clip(m, 200)}`;
}
async function gemini(config, parts, schema, model) {
  if (!config.geminiKey) throw new HttpError(400, 'Add your free Gemini key in Life → Settings → Connections → AI');
  const body = { contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json', ...(schema ? { responseSchema: schema } : {}) } };
  // no "thinking" on 2.5 models: food and reels don't need it, and it made photo answers slow
  const payload = (m) => JSON.stringify(/2\.5/.test(m) ? { ...body, generationConfig: { ...body.generationConfig, thinkingConfig: { thinkingBudget: 0 } } } : body);
  const call = async (m) => {
    try {
      return await fetch(`${GEM}/v1beta/models/${m}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiKey }, body: payload(m), signal: AbortSignal.timeout(35000) });
    } catch (e) { return new Response(JSON.stringify({ error: { message: e?.name === 'TimeoutError' ? 'took too long' : String(e?.message || e) } }), { status: 504 }); }
  };
  const tries = model ? [model] : [...new Set([gemModel(config), ...GEM_FALLBACK])];
  let last = null;
  for (const m of tries) {
    let r = await call(m);
    if (r.status === 503) { await new Promise((ok) => setTimeout(ok, 900)); r = await call(m); }
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      const text = (d.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('').trim();
      const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, '');
      try { return JSON.parse(clean); } catch { last = new HttpError(502, d.candidates?.[0]?.finishReason === 'SAFETY' ? 'Gemini blocked this photo. Try another angle or describe it instead.' : 'Gemini’s answer wasn’t readable. Try again.'); continue; }
    }
    const msg = d?.error?.message || '';
    last = new HttpError(r.status === 429 ? 429 : 502, gemHint(r.status, msg));
    // a bad key won't work on any model: stop now
    if (r.status === 400 && /API key/i.test(msg)) break;
    if (r.status === 403 || r.status === 504) break;
    if (!(r.status === 404 || r.status === 429 || (r.status === 400 && /model/i.test(msg)) || r.status >= 500)) break;
  }
  throw last;
}
export async function aiTest(config) {
  const out = await gemini(config, [{ text: 'Reply with {"ok":true}' }], { type: 'OBJECT', properties: { ok: { type: 'BOOLEAN' } }, required: ['ok'] });
  return json({ ok: !!out.ok });
}
const FOOD_SCHEMA = { type: 'OBJECT', properties: { items: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
  name: { type: 'STRING' }, grams: { type: 'NUMBER' }, kcal: { type: 'NUMBER' }, protein: { type: 'NUMBER' }, fat: { type: 'NUMBER' }, carbs: { type: 'NUMBER' }, confidence: { type: 'STRING' } },
  required: ['name', 'grams', 'kcal', 'protein', 'fat', 'carbs'] } }, note: { type: 'STRING' } }, required: ['items'] };

// Free fallback: Llama 3.2 Vision for photos, Llama 3.3 70B for text. Both run on Cloudflare's free daily allowance.
const FOOD_JSON = 'Reply ONLY with JSON: {"items":[{"name":string,"grams":number,"kcal":number,"protein":number,"fat":number,"carbs":number,"confidence":"high"|"medium"|"low"}],"note":string}.';
function firstJson(t) {
  if (t && typeof t === 'object') return t;
  const s = String(t || ''), a = s.indexOf('{'), z = s.lastIndexOf('}');
  if (a < 0 || z <= a) return null;
  try { return JSON.parse(s.slice(a, z + 1)); } catch { return null; }
}
async function foodWorkersAI(env, image, text) {
  const ask = `You are a careful nutrition logger. Identify each separate food or drink ${image ? 'in the photo' : 'described'}${text ? ` (the person says: "${text}")` : ''}. Estimate the eaten portion in grams and its calories, protein, fat and carbs for that portion using standard nutrition databases (USDA; IFCT for Indian dishes). Short plain names. ${FOOD_JSON}`;
  let r;
  try {
    if (image) {
      const bin = Uint8Array.from(atob(image.slice(image.indexOf(',') + 1)), (c) => c.charCodeAt(0));
      const M = '@cf/meta/llama-3.2-11b-vision-instruct';
      const run = () => env.AI.run(M, { messages: [{ role: 'user', content: ask }], image: [...bin], max_tokens: 700 });
      try { r = await run(); }
      catch (e) {
        // Meta's licence must be accepted once per account before the vision model will answer
        if (!/agree/i.test(String(e?.message || e))) throw e;
        await env.AI.run(M, { prompt: 'agree' }).catch(() => {});
        r = await run();
      }
    } else {
      r = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages: [{ role: 'system', content: FOOD_JSON }, { role: 'user', content: ask }], max_tokens: 700 });
    }
  } catch (e) {
    console.error('workers-ai food', e);
    throw new HttpError(429, 'Gemini’s free limit is used up and the backup AI is busy too. Try again in a few minutes.');
  }
  const out = firstJson(r?.response ?? r);
  if (!out) throw new HttpError(502, 'The backup AI’s answer wasn’t readable. Try again.');
  return out;
}
export async function aiFood(request, config, env) {
  const b = await readJson(request, 4_000_000);
  const parts = [];
  if (b.image) {
    // cheap check (a regex over a 300 KB string can blow the free plan's CPU limit)
    const img = String(b.image), comma = img.indexOf(','), head = img.slice(0, Math.max(0, comma));
    const mt = /^data:(image\/(?:jpeg|png|webp|heic));base64$/.exec(head);
    if (!mt || comma < 0) return err(400, 'image must be a base64 data URL');
    parts.push({ inline_data: { mime_type: mt[1], data: img.slice(comma + 1) } });
  }
  const text = clip(b.text, 600).trim();
  if (!parts.length && !text) return err(400, 'image or text required');
  parts.push({ text: `You are a careful nutrition logger. Identify each separate food or drink ${parts.length ? 'in the photo' : 'described'}${text ? ` (the person says: "${text}")` : ''}. Estimate the eaten portion in grams and its calories, protein, fat and carbs for that portion, using standard nutrition databases (USDA, IFCT for Indian dishes). Prefer realistic home or restaurant portions. Use short plain names. confidence is high, medium or low. If nothing edible is visible, return an empty list with a note.` });
  let out, via = 'gemini';
  try { out = await gemini(config, parts, FOOD_SCHEMA); }
  catch (e) {
    // Gemini's free quota used up (or Gemini down / no key): fall back to Cloudflare's free Workers AI models
    if (!env?.AI || (e?.status && e.status !== 429 && e.status < 500 && config.geminiKey)) throw e;
    out = await foodWorkersAI(env, b.image ? String(b.image) : '', text);
    via = 'workers-ai';
  }
  const items = (Array.isArray(out?.items) ? out.items : []).slice(0, 12).filter((x) => x && typeof x === 'object').map(cleanFood);
  return json({ items, note: clip(out?.note, 200).trim(), via });
}

// Reel → guide. Accepts a link (YouTube works directly; Instagram/TikTok use the public caption when the
// page shares it) or the video itself (shared from Photos / a screen recording).
const REEL_SCHEMA = { type: 'OBJECT', properties: {
  kind: { type: 'STRING', enum: ['recipe', 'workout', 'other'] }, title: { type: 'STRING' }, summary: { type: 'STRING' },
  servings: { type: 'NUMBER' }, ingredients: { type: 'ARRAY', items: { type: 'STRING' } }, steps: { type: 'ARRAY', items: { type: 'STRING' } },
  perServing: { type: 'OBJECT', properties: { kcal: { type: 'NUMBER' }, protein: { type: 'NUMBER' }, fat: { type: 'NUMBER' }, carbs: { type: 'NUMBER' } } },
  exercises: { type: 'ARRAY', items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, sets: { type: 'NUMBER' }, reps: { type: 'STRING' }, notes: { type: 'STRING' } } } },
  tips: { type: 'ARRAY', items: { type: 'STRING' } }, tags: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['kind', 'title', 'summary'] };
const REEL_PROMPT = 'Turn this short video into a clean, organised guide. If it is a recipe: list ingredients with amounts, numbered steps, servings, and estimate calories/protein/fat/carbs per serving. If it is a workout: list each exercise with sets, reps and form notes. Otherwise: summarise the key points as steps or tips. Keep it faithful to the video; do not invent steps that are not shown or said. Short title (max 60 chars).';
async function pageMeta(link) {
  try {
    if (!/^https?:\/\//i.test(link)) return '';
    const r = await fetchT(link, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; facebookexternalhit/1.1)', Accept: 'text/html' }, redirect: 'follow' }, 8000);
    if (!r.ok) return '';
    const html = await responseText(r, 400000, true);   // never buffers more than 400 KB of a page
    const get = (p) => (new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']*)`, 'i').exec(html) || [])[1] || '';
    return [get('og:title'), get('og:description'), get('description')].filter(Boolean).join('\n').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').slice(0, 4000);
  } catch { return ''; }
}
async function uploadToGemini(config, stream, mime, size) {
  const start = await fetchT(`${GEM}/upload/v1beta/files`, { method: 'POST', headers: { 'x-goog-api-key': config.geminiKey, 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start', 'X-Goog-Upload-Header-Content-Length': String(size), 'X-Goog-Upload-Header-Content-Type': mime, 'Content-Type': 'application/json' }, body: JSON.stringify({ file: { display_name: 'life-reel' } }) }, 15000);
  const up = start.headers.get('x-goog-upload-url');
  if (!up) throw new HttpError(502, `Gemini upload ${start.status}`);
  const fin = await fetchT(up, { method: 'POST', headers: { 'Content-Length': String(size), 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' }, body: stream }, 120000);
  const f = (await fin.json().catch(() => ({}))).file;
  if (!f?.uri) throw new HttpError(502, 'Gemini upload failed');
  for (let i = 0; i < 30 && f.state === 'PROCESSING'; i++) {            // videos take a few seconds to be ready
    await new Promise((res) => setTimeout(res, 2000));
    const s = await fetchT(`${GEM}/v1beta/${f.name}`, { headers: { 'x-goog-api-key': config.geminiKey } }, 8000).then((x) => x.json()).catch(() => ({}));
    f.state = s.state || f.state;
  }
  if (f.state === 'FAILED') throw new HttpError(502, 'Gemini could not read that video');
  return f;
}
const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtu.be']);
export function isYouTube(link) {
  try { const u = new URL(link); return (u.protocol === 'https:' || u.protocol === 'http:') && YT_HOSTS.has(u.hostname.toLowerCase()); } catch { return false; }
}
export async function postReel(request, env, config) {
  const ct = (request.headers.get('Content-Type') || '').toLowerCase();
  let parts = [], source = '', link = '';
  if (ct.startsWith('video/') || ct === 'application/octet-stream') {
    const size = Number(request.headers.get('Content-Length') || 0);
    if (!size || size > 95 * 1024 * 1024) return err(413, 'video must be under 95 MB');
    if (!config.geminiKey) return err(400, 'Add your free Gemini key in Life → Settings → Connections → AI');
    const f = await uploadToGemini(config, request.body, ct.startsWith('video/') ? ct.split(';')[0] : 'video/mp4', size);
    parts.push({ file_data: { mime_type: f.mimeType || 'video/mp4', file_uri: f.uri } });
    source = 'video';
  } else {
    const b = ct.includes('json') ? await readJson(request, 20000) : { url: (await request.text()).trim() };
    link = (String(b.url || b.text || '').match(/https?:\/\/\S+/) || [])[0] || '';
    if (!link) return err(400, 'send a link or a video');
    source = link;
    if (isYouTube(link)) parts.push({ file_data: { file_uri: link, mime_type: 'video/*' } });
    else {
      const meta = await pageMeta(link);
      if (!meta) return err(422, 'That page doesn’t share its caption. Save the reel (or screen-record it) and share the video instead.');
      parts.push({ text: `Caption and description of the video at ${link}:\n${meta}` });
    }
  }
  parts.push({ text: REEL_PROMPT });
  const g = await gemini(config, parts, REEL_SCHEMA);
  const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: Date.now(), source: clip(source, 400), ...g };
  const list = (await kvGet(env, 'reels')) || [];
  list.push(item);
  await kvPut(env, 'reels', list.slice(-100));
  return json({ ok: true, title: item.title, kind: item.kind });
}
export async function listReels(env) { return json((await kvGet(env, 'reels')) || []); }
export async function deleteReels(request, env) {
  const b = await readJson(request, 50000);
  const ids = new Set((b.ids || []).map(String));
  const list = ((await kvGet(env, 'reels')) || []).filter((x) => !ids.has(x.id));
  await kvPut(env, 'reels', list);
  return json({ ok: true, left: list.length });
}

// ---------------- Job emails (subjects only, never the body) ----------------
export async function ingestJobs(request, env) {
  const b = await readJson(request, 2_000_000);
  if (!Array.isArray(b.items)) return err(400, 'items must be an array');
  const cur = (await kvGet(env, 'jobmail')) || { items: {} };
  let added = 0;
  for (const m of b.items.slice(0, 3000)) {
    if (!m || typeof m !== 'object') continue;
    const id = clip(m.id, 40);
    if (!id) continue;
    if (!cur.items[id]) added++;
    cur.items[id] = { id, from: clip(m.from, 120), domain: clip(m.domain, 80), subject: clip(m.subject, 200), date: safeIso(m.date), label: clip(m.label, 80) };
  }
  const all = Object.values(cur.items).sort((x, y) => (y.date || '').localeCompare(x.date || '')).slice(0, 4000);
  cur.items = Object.fromEntries(all.map((x) => [x.id, x]));
  cur.updated = Date.now();
  await kvPut(env, 'jobmail', cur);
  return json({ ok: true, added, total: all.length });
}
export async function listJobs(env) {
  const cur = (await kvGet(env, 'jobmail')) || { items: {} };
  return json({ items: Object.values(cur.items), updated: cur.updated || null });
}

// ---------------- Social media pauses (sent by the iPhone Shortcut) ----------------
// The day is the user's local calendar day (X-Life-TZ, else the saved tz, else America/New_York).
export async function logScreen(request, env, tz = 'America/New_York', now = Date.now()) {
  const b = await readJson(request, 2000);
  const app = clip(b.app || 'social', 30).toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const ev = ['paused', 'opened', 'skipped'].includes(b.event) ? b.event : 'paused';
  const day = todayIn(tz, now);
  const s = (await kvGet(env, 'screen')) || { days: {} };
  const d = (s.days[day] ||= {});
  const k = `${app}:${ev}`;
  d[k] = (d[k] || 0) + 1;
  for (const k2 of Object.keys(s.days).sort().slice(0, -60)) delete s.days[k2];
  await kvPut(env, 'screen', s);
  return json({ ok: true });
}
export async function getScreen(env) { return json((await kvGet(env, 'screen')) || { days: {} }); }

// Speech to text for JARVIS on the phone (iPhone home-screen apps can't use the browser's own recogniser reliably).
export async function aiStt(request, config, env) {
  const b = await readJson(request, 3_000_000);
  const a = String(b.audio || ''), comma = a.indexOf(','), head = a.slice(0, Math.max(0, comma));
  const mt = /^data:(audio\/(?:wav|x-wav|mp3|mpeg|aac|ogg|flac|webm|mp4));base64$/.exec(head);
  if (!mt || comma < 0) return err(400, 'audio must be a base64 data URL');
  // 1) Cloudflare Workers AI Whisper (free daily allowance, no key, very reliable)
  if (env?.AI) {
    try {
      const r = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: a.slice(comma + 1), language: 'en' });
      const t = clip(r?.text || '', 500).trim();
      if (t) return json({ text: t, via: 'whisper' });
    } catch { /* fall through to Gemini */ }
  }
  const out = await gemini(config, [{ inline_data: { mime_type: mt[1] === 'audio/x-wav' ? 'audio/wav' : mt[1], data: a.slice(comma + 1) } },
    { text: 'Transcribe exactly what the speaker says, in English, as one line of plain text with normal punctuation. It is a short voice command for a personal assistant named Jarvis. If there is no clear speech, return an empty string.' }],
    { type: 'OBJECT', properties: { text: { type: 'STRING' } }, required: ['text'] });
  return json({ text: clip(out.text, 500).trim() });
}

// JARVIS on the phone when the laptop is off: answers questions and turns Life requests into actions the
// phone carries out (the phone owns the data; the server never stores it). Gemini first, Workers AI as backup.
const ASK_SCHEMA = { type: 'OBJECT', properties: {
  reply: { type: 'STRING' },
  actions: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
    type: { type: 'STRING', enum: ['add_task', 'add_reminder', 'log_food', 'tick_habit', 'complete', 'start_focus', 'set_bus_stop', 'needs_laptop'] },
    title: { type: 'STRING' }, due: { type: 'STRING' }, time: { type: 'STRING' }, urgency: { type: 'NUMBER' },
    kcal: { type: 'NUMBER' }, protein: { type: 'NUMBER' }, fat: { type: 'NUMBER' }, carbs: { type: 'NUMBER' }, grams: { type: 'NUMBER' }, meal: { type: 'STRING' },
    minutes: { type: 'NUMBER' }, route: { type: 'STRING' }, stop: { type: 'STRING' } }, required: ['type'] } } },
  required: ['reply'] };
export async function jarvisAsk(request, config, env) {
  const b = await readJson(request, 60_000);
  const text = clip(b.text, 600).trim();
  if (!text) return err(400, 'text required');
  const ctx = clip(typeof b.context === 'string' ? b.context : JSON.stringify(b.context || {}), 12000);
  const sys = `You are JARVIS, Ishir's personal assistant inside his Life app, answering on his phone (his laptop is offline).
Be brief and natural (1-3 short sentences, spoken aloud). Today and his data: ${ctx}
If he asks to add a task/reminder, log food, tick a habit, mark something done, start a focus timer or change a bus stop, return the matching action(s) with fields filled (dates as YYYY-MM-DD, times as HH:MM 24h, urgency 0-3, food macros estimated for the stated portion) and confirm in the reply.
For "complete", put the item's title (as in his data) in title. If the request needs his laptop (open/close apps, Spotify, files, browsing, typing on the computer), return a needs_laptop action and say the laptop is offline.
Never invent data he didn't give you; answer questions about his day only from the data above.`;
  try {
    const out = await gemini(config, [{ text: sys + '\n\nIshir: ' + text }], ASK_SCHEMA);
    return json({ reply: str(out?.reply, 800), actions: cleanActions(out?.actions), via: 'gemini' });
  } catch (e) {
    if (!env?.AI) throw e;
    const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{ role: 'system', content: sys + ' Reply as JSON: {"reply": "...", "actions": [...]}.' }, { role: 'user', content: text }], max_tokens: 400 });
    let o = {}; try { o = JSON.parse(String(r?.response || '').replace(/^[^{]*/, '').replace(/[^}]*$/, '')); } catch { o = { reply: String(r?.response || '').slice(0, 600) }; }
    if (!o || typeof o !== 'object') o = {};
    return json({ reply: str(o.reply, 800), actions: cleanActions(o.actions), via: 'workers-ai' });
  }
}
