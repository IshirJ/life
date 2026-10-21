// Extras: Unsplash photos, Blacksburg Transit departures, Gemini (food photos + reel guides),
// job emails from Gmail, social-media pause log. All free services; keys live in the server config.
import { kvGet, kvPut, json, err, readJson, HttpError, cacheGet, cachePut } from './util.js';

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
  const r = await fetch(api, { headers: { Authorization: `Client-ID ${config.unsplashKey}`, 'Accept-Version': 'v1' } });
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
  if (!seen) { await fetch(dl, { headers: { Authorization: `Client-ID ${config.unsplashKey}` } }).catch(() => {}); await cachePut('imgseen:' + dl, 1, 86400); }
  return json({ ok: true });
}

// ---------------- Blacksburg Transit ----------------
const BT = 'http://www.bt4uclassic.org/webservices/bt4u_webservice.asmx';
const tag = (xml, t) => [...xml.matchAll(new RegExp(`<${t}>([^<]*)</${t}>`, 'g'))].map((m) => m[1]);
export async function getBus(url) {
  const route = clip(url.searchParams.get('route'), 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const stop = clip(url.searchParams.get('stop'), 8).replace(/\D/g, '');
  if (!route || !stop) return err(400, 'route and stop required');
  const ck = `bus:${route}:${stop}`;
  const hit = await cacheGet(ck);
  if (hit) return json(hit);
  const r = await fetch(`${BT}/GetNextDepartures?routeShortName=${route}&stopCode=${stop}`);
  if (!r.ok) return json({ route, stop, deps: [], error: `BT ${r.status}` });
  const xml = await r.text();
  const times = tag(xml, 'AdjustedDepartureTime'), names = tag(xml, 'StopName');
  const out = { route, stop, stopName: names[0] || '', deps: times.map((t) => new Date(t).toISOString()).filter((t) => t !== 'Invalid Date').slice(0, 8), at: Date.now() };
  await cachePut(ck, out, 20);
  return json(out);
}
export async function getBusStops(url) {
  const route = clip(url.searchParams.get('route'), 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!route) return err(400, 'route required');
  const ck = `busstops:${route}`;
  const hit = await cacheGet(ck);
  if (hit) return json(hit);
  const r = await fetch(`${BT}/GetScheduledStopCodes?routeShortName=${route}`);
  const xml = r.ok ? await r.text() : '';
  const codes = tag(xml, 'StopCode'), names = tag(xml, 'StopName');
  const out = { route, stops: codes.map((c, i) => ({ code: c, name: names[i] || c })) };
  if (out.stops.length) await cachePut(ck, out, 6 * 3600);
  return json(out);
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
    const r = await call(m);
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
export async function aiFood(request, config) {
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
  const out = await gemini(config, parts, FOOD_SCHEMA);
  const items = (out.items || []).slice(0, 12).map((x) => ({ name: clip(x.name, 80), grams: Math.round(+x.grams || 0), kcal: Math.round(+x.kcal || 0), protein: +(+x.protein || 0).toFixed(1), fat: +(+x.fat || 0).toFixed(1), carbs: +(+x.carbs || 0).toFixed(1), confidence: clip(x.confidence, 10) }));
  return json({ items, note: clip(out.note, 200) });
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
    const r = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; facebookexternalhit/1.1)', Accept: 'text/html' }, redirect: 'follow' });
    if (!r.ok) return '';
    const html = (await r.text()).slice(0, 400000);
    const get = (p) => (new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']*)`, 'i').exec(html) || [])[1] || '';
    return [get('og:title'), get('og:description'), get('description')].filter(Boolean).join('\n').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').slice(0, 4000);
  } catch { return ''; }
}
async function uploadToGemini(config, stream, mime, size) {
  const start = await fetch(`${GEM}/upload/v1beta/files`, { method: 'POST', headers: { 'x-goog-api-key': config.geminiKey, 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start', 'X-Goog-Upload-Header-Content-Length': String(size), 'X-Goog-Upload-Header-Content-Type': mime, 'Content-Type': 'application/json' }, body: JSON.stringify({ file: { display_name: 'life-reel' } }) });
  const up = start.headers.get('x-goog-upload-url');
  if (!up) throw new HttpError(502, `Gemini upload ${start.status}`);
  const fin = await fetch(up, { method: 'POST', headers: { 'Content-Length': String(size), 'X-Goog-Upload-Offset': '0', 'X-Goog-Upload-Command': 'upload, finalize' }, body: stream });
  const f = (await fin.json().catch(() => ({}))).file;
  if (!f?.uri) throw new HttpError(502, 'Gemini upload failed');
  for (let i = 0; i < 30 && f.state === 'PROCESSING'; i++) {            // videos take a few seconds to be ready
    await new Promise((res) => setTimeout(res, 2000));
    const s = await fetch(`${GEM}/v1beta/${f.name}`, { headers: { 'x-goog-api-key': config.geminiKey } }).then((x) => x.json()).catch(() => ({}));
    f.state = s.state || f.state;
  }
  if (f.state === 'FAILED') throw new HttpError(502, 'Gemini could not read that video');
  return f;
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
    if (/youtu\.?be/.test(link)) parts.push({ file_data: { file_uri: link, mime_type: 'video/*' } });
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
    const id = clip(m.id, 40);
    if (!id) continue;
    if (!cur.items[id]) added++;
    cur.items[id] = { id, from: clip(m.from, 120), domain: clip(m.domain, 80), subject: clip(m.subject, 200), date: m.date ? new Date(m.date).toISOString() : '', label: clip(m.label, 80) };
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
export async function logScreen(request, env) {
  const b = await readJson(request, 2000);
  const app = clip(b.app || 'social', 30).toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const ev = ['paused', 'opened', 'skipped'].includes(b.event) ? b.event : 'paused';
  const day = new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10);
  const s = (await kvGet(env, 'screen')) || { days: {} };
  const d = (s.days[day] ||= {});
  const k = `${app}:${ev}`;
  d[k] = (d[k] || 0) + 1;
  for (const k2 of Object.keys(s.days).sort().slice(0, -60)) delete s.days[k2];
  await kvPut(env, 'screen', s);
  return json({ ok: true });
}
export async function getScreen(env) { return json((await kvGet(env, 'screen')) || { days: {} }); }
