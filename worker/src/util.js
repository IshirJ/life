// Shared helpers: encoding, JSON responses, CORS, auth, KV + cache helpers.

export const ALLOWED_ORIGINS = [
  'https://ishirj.github.io',
  'http://localhost:8765',
  'http://127.0.0.1:8765',
];
export const APP_URL = 'https://ishirj.github.io/life/';
export const DEFAULT_TZ = 'America/New_York';

const enc = new TextEncoder();
const dec = new TextDecoder();
export const utf8 = (s) => enc.encode(s);
export const fromUtf8 = (b) => dec.decode(b);

// ---- base64url ----
export function b64uEncode(bytes) {
  if (bytes instanceof ArrayBuffer) bytes = new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64uDecode(str) {
  str = String(str).replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function concatBytes(...arrs) {
  const len = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}

export function randomBytes(n) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

// Constant-time string compare (length leak only via the final check).
export function safeEqual(a, b) {
  const x = utf8(String(a ?? ''));
  const y = utf8(String(b ?? ''));
  const len = Math.max(x.length, y.length);
  let diff = x.length ^ y.length;
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function hmacSha256(keyBytes, dataBytes) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, dataBytes));
}

// ---- responses ----
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}
export const err = (status, error, extra = {}) => json({ error, ...extra }, status);

export function redirect(url, status = 302) {
  return new Response(null, { status, headers: { Location: url, 'Cache-Control': 'no-store' } });
}

export function corsHeaders(origin) {
  const h = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Life-Key',
    'Access-Control-Expose-Headers': 'X-Backup-Ts',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

// Re-wrap a response with CORS headers (headers on redirects/fetched responses can be immutable).
export function withCors(resp, origin) {
  const r = new Response(resp.body, resp);
  for (const [k, v] of Object.entries(corsHeaders(origin))) r.headers.set(k, v);
  // basic hardening for every response
  r.headers.set('X-Content-Type-Options', 'nosniff');
  r.headers.set('Referrer-Policy', 'no-referrer');
  r.headers.set('X-Frame-Options', 'DENY');
  if (!r.headers.has('Cache-Control')) r.headers.set('Cache-Control', 'no-store');
  return r;
}

// ---- KV JSON helpers ----
export async function kvGet(env, key) {
  const v = await env.LIFE.get(key);
  if (v == null) return null;
  try { return JSON.parse(v); } catch { return null; }
}
export const kvPut = (env, key, value) => env.LIFE.put(key, JSON.stringify(value));

// ---- small cache layer: in-memory (per isolate) + Cache API (best effort; no-op on workers.dev) ----
const mem = new Map();
const CACHE_HOST = 'https://life-sync.internal/';

export async function cacheGet(name) {
  const m = mem.get(name);
  if (m && m.exp > Date.now()) return m.value;
  if (m) mem.delete(name);
  try {
    if (typeof caches !== 'undefined' && caches.default) {
      const r = await caches.default.match(new Request(CACHE_HOST + encodeURIComponent(name)));
      if (r) {
        const exp = Number(r.headers.get('X-Exp') || 0);
        if (exp > Date.now()) {
          const value = await r.json();
          mem.set(name, { value, exp });
          return value;
        }
      }
    }
  } catch { /* cache is best effort */ }
  return undefined;
}

export async function cachePut(name, value, ttlSec) {
  const exp = Date.now() + ttlSec * 1000;
  mem.set(name, { value, exp });
  if (mem.size > 200) mem.delete(mem.keys().next().value);
  try {
    if (typeof caches !== 'undefined' && caches.default) {
      await caches.default.put(
        new Request(CACHE_HOST + encodeURIComponent(name)),
        new Response(JSON.stringify(value), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${ttlSec}`, 'X-Exp': String(exp) },
        }),
      );
    }
  } catch { /* ignore */ }
}

export function cacheClear() { mem.clear(); }

export async function readJson(request, maxBytes = 1_000_000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'body too large');
  if (!text.trim()) return {};
  try { return JSON.parse(text); } catch { throw new HttpError(400, 'invalid JSON'); }
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Parse a loosely-formatted number ("2,345", " 71.5 kg", 12) → number | undefined.
export function looseNumber(v) {
  if (v == null || v === '') return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  const m = String(v).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}
