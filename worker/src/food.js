// Food search: USDA FoodData Central + Open Food Facts, merged and ranked.
import { cacheGet, cachePut } from './util.js';

const FDC = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const OFF = 'https://world.openfoodfacts.org/cgi/search.pl';
const TIMEOUT_MS = 6000;
const CACHE_TTL = 24 * 60 * 60;
const MAX_ITEMS = 60;
const UA = 'LifeApp/1.0 (personal use)';

const r1 = (n) => Math.round(n * 10) / 10;
const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// Cache key never includes the API key.
export function cacheKeyFor(url) {
  const u = new URL(url);
  u.searchParams.delete('api_key');
  return `food:${u.toString()}`;
}

// "CHEERIOS, OAT CEREAL" → "Cheerios, Oat Cereal" when ≥70% of letters are uppercase.
export function cleanName(s) {
  let t = String(s || '').replace(/\s+/g, ' ').trim();
  const letters = t.replace(/[^A-Za-z]/g, '');
  const upper = t.replace(/[^A-Z]/g, '');
  if (letters.length && upper.length / letters.length >= 0.7) {
    t = t.toLowerCase().replace(/(^|[\s(/\-&,.])([a-z])/g, (_, p, c) => p + c.toUpperCase());
  }
  return t;
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...headers }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    const e = new Error(`HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

// Fetch → map, caching the mapped result for 24 h keyed by URL (sans api key).
async function cached(url, headers, mapFn) {
  const ck = cacheKeyFor(url);
  const hit = await cacheGet(ck);
  if (hit !== undefined) return hit;
  const items = mapFn(await getJson(url, headers));
  await cachePut(ck, items, CACHE_TTL);
  return items;
}

// ---------- USDA ----------
function fdcEnergy(nutrients) {
  const byNum = (n) => nutrients.find((x) => String(x.nutrientNumber) === n && num(x.value) != null);
  const byId = (id) => nutrients.find((x) => Number(x.nutrientId) === id && num(x.value) != null);
  const kcalOf = (x) => (x && /kj/i.test(x.unitName || '') ? num(x.value) / 4.184 : num(x?.value));
  for (const n of ['208', '957', '958']) { const x = byNum(n); if (x) return kcalOf(x); }
  for (const id of [1008, 2047, 2048]) { const x = byId(id); if (x) return kcalOf(x); }
  const kj = byNum('268') || byId(1062);
  return kj ? num(kj.value) / 4.184 : null;
}

export function mapFdc(data) {
  const out = [];
  for (const f of data?.foods || []) {
    const ns = Array.isArray(f.foodNutrients) ? f.foodNutrients : [];
    const k = fdcEnergy(ns);
    if (k == null) continue;
    const g = (n) => num(ns.find((x) => String(x.nutrientNumber) === n)?.value) ?? 0;
    const branded = f.dataType === 'Branded';
    const brandRaw = branded ? (f.brandName || f.brandOwner || '') : '';
    const brand = brandRaw ? cleanName(brandRaw) : null;
    let name = cleanName(f.description);
    if (!name) continue;
    if (brand && !name.toLowerCase().includes(brand.toLowerCase())) name = `${brand} ${name}`;
    const unit = String(f.servingSizeUnit || '').toLowerCase();
    const ss = num(f.servingSize);
    out.push({
      id: `fdc:${f.fdcId}`,
      name,
      brand,
      per100: { k: Math.round(k), p: r1(g('203')), f: r1(g('204')), c: r1(g('205')) },
      servingG: ss > 0 && ['g', 'grm', 'ml', 'mlt'].includes(unit) ? r1(ss) : null,
      servingText: f.householdServingFullText ? String(f.householdServingFullText).trim() : null,
      src: branded ? 'USDA branded' : 'USDA',
    });
  }
  return out;
}

// ---------- Open Food Facts ----------
export function mapOff(data) {
  const out = [];
  for (const p of data?.products || []) {
    const n = p.nutriments || {};
    const k = num(n['energy-kcal_100g']) ?? (num(n.energy_100g) != null ? num(n.energy_100g) / 4.184 : null);
    const name = cleanName(p.product_name);
    if (k == null || !name || !p.code) continue;
    const brand = String(p.brands || '').split(',')[0].trim() || null;
    const sq = num(p.serving_quantity);
    out.push({
      id: `off:${p.code}`,
      name,
      brand: brand ? cleanName(brand) : null,
      per100: { k: Math.round(k), p: r1(num(n.proteins_100g) ?? 0), f: r1(num(n.fat_100g) ?? 0), c: r1(num(n.carbohydrates_100g) ?? 0) },
      servingG: sq > 0 ? r1(sq) : null,
      servingText: p.serving_size ? String(p.serving_size).trim() : null,
      src: 'Open Food Facts',
    });
  }
  return out;
}

// ---------- ranking ----------
const SRC_TIER = { USDA: 0, 'USDA branded': 1, 'Open Food Facts': 2 };

function matchTier(name, q) {
  const n = name.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  const words = n.split(/[^a-z0-9]+/).filter(Boolean);
  const qw = q.split(/[^a-z0-9]+/).filter(Boolean);
  if (qw.length && qw.every((w) => words.some((x) => x.startsWith(w)))) return 2;
  return 3;
}

export function rankItems(items, q) {
  const ql = q.toLowerCase().trim();
  const seen = new Set();
  return items
    .map((it, i) => ({ it, m: matchTier(it.name, ql), s: SRC_TIER[it.src] ?? 3, i }))
    .sort((a, b) => a.m - b.m || a.s - b.s || a.i - b.i)
    .map((x) => x.it)
    .filter((it) => {
      const key = `${it.name.toLowerCase()}|${(it.brand || '').toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_ITEMS);
}

export async function searchFood(config, q, page = 1) {
  const qs = encodeURIComponent(q);
  const key = encodeURIComponent(config?.fdcKey || 'DEMO_KEY');
  const fdcUrl = `${FDC}?api_key=${key}&query=${qs}&pageSize=40&pageNumber=${page}`
    + '&dataType=Branded,Foundation,Survey%20(FNDDS),SR%20Legacy';
  const offUrl = `${OFF}?search_terms=${qs}&search_simple=1&json=1&page_size=30&page=${page}`
    + '&fields=code,product_name,brands,nutriments,serving_quantity,serving_size';

  const errors = [];
  const errEntry = (source, e) => {
    if (source === 'usda' && (e.status === 429 || e.status === 403)) {
      return { source, code: 'rate', message: `USDA rate limit or key rejected (HTTP ${e.status}); add your own FoodData Central key` };
    }
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') return { source, message: 'timed out' };
    return { source, message: String(e?.message || e) };
  };
  const [fdc, off] = await Promise.all([
    cached(fdcUrl, {}, mapFdc).catch((e) => { errors.push(errEntry('usda', e)); return []; }),
    cached(offUrl, { 'User-Agent': UA }, mapOff).catch((e) => { errors.push(errEntry('off', e)); return []; }),
  ]);
  return { items: rankItems([...fdc, ...off], q), errors };
}
