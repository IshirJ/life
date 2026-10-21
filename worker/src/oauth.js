// OAuth for Microsoft Graph (Outlook) and Google Health, plus access-token caching.
import {
  ALLOWED_ORIGINS, APP_URL, b64uEncode, b64uDecode, hmacSha256, utf8, fromUtf8, randomBytes,
  safeEqual, kvGet, kvPut, cacheGet, cachePut, cacheDel, redirect, fetchT,
} from './util.js';

export const MS_SCOPE = 'offline_access User.Read Mail.Read Calendars.Read';
export const GOOGLE_SCOPE = [
  'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
  'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
  'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
].join(' ');

const PROVIDERS = {
  ms: {
    tokenKey: 'ms_token',
    label: 'outlook',
    authUrl: (cfg) => `https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant || 'common')}/oauth2/v2.0/authorize`,
    tokenUrl: (cfg) => `https://login.microsoftonline.com/${encodeURIComponent(cfg.tenant || 'common')}/oauth2/v2.0/token`,
    scope: MS_SCOPE,
    extra: { response_mode: 'query', prompt: 'select_account' },
  },
  google: {
    tokenKey: 'g_token',
    label: 'google',
    authUrl: () => 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: () => 'https://oauth2.googleapis.com/token',
    scope: GOOGLE_SCOPE,
    extra: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
  },
};

export class ReauthError extends Error {
  constructor(source, message) { super(message || 'reauth required'); this.source = source; this.code = 'reauth'; }
}

// Only redirect back to the app's own origins (no open redirect).
export function safeReturn(url) {
  try {
    const u = new URL(url);
    if (ALLOWED_ORIGINS.includes(u.origin)) return u.origin + u.pathname + u.search;
  } catch { /* fallthrough */ }
  return APP_URL;
}

async function signState(key, obj) {
  const body = b64uEncode(utf8(JSON.stringify(obj)));
  const sig = b64uEncode(await hmacSha256(utf8(key), utf8(body)));
  return `${body}.${sig}`;
}
async function verifyState(key, state) {
  const [body, sig] = String(state || '').split('.');
  if (!body || !sig) return null;
  const expect = b64uEncode(await hmacSha256(utf8(key), utf8(body)));
  if (!safeEqual(sig, expect)) return null;
  try {
    const obj = JSON.parse(fromUtf8(b64uDecode(body)));
    if (Date.now() - obj.t > 20 * 60 * 1000) return null;
    return obj;
  } catch { return null; }
}

// GET /oauth/{ms|google}/start?s=ONE-TIME-TOKEN (or the old ?k=KEY&return=URL)
export async function oauthStart(provider, request, env, lifeKey, config, retOverride) {
  const url = new URL(request.url);
  const ret = safeReturn(retOverride || url.searchParams.get('return') || APP_URL);
  const p = PROVIDERS[provider];
  const cfg = config[provider] || {};
  if (!cfg.clientId || !cfg.clientSecret) return redirect(`${ret}#error=${provider}_not_configured`);
  const state = await signState(lifeKey, { r: ret, n: b64uEncode(randomBytes(12)), p: provider, t: Date.now() });
  const qs = new URLSearchParams({
    client_id: cfg.clientId,
    response_type: 'code',
    redirect_uri: `${url.origin}/oauth/${provider}/callback`,
    scope: p.scope,
    state,
    ...p.extra,
  });
  return redirect(`${p.authUrl(cfg)}?${qs}`);
}

// GET /oauth/{ms|google}/callback?code&state
export async function oauthCallback(provider, request, env, lifeKey, config) {
  const url = new URL(request.url);
  const st = await verifyState(lifeKey, url.searchParams.get('state'));
  if (!st || st.p !== provider) return new Response('Invalid or expired state. Start the connection again from the app.', { status: 400 });
  const ret = safeReturn(st.r);
  const p = PROVIDERS[provider];
  const cfg = config[provider] || {};
  const e = url.searchParams.get('error');
  if (e) return redirect(`${ret}#error=${encodeURIComponent(e)}`);
  const code = url.searchParams.get('code');
  if (!code) return redirect(`${ret}#error=missing_code`);
  const form = new URLSearchParams({
    client_id: cfg.clientId || '',
    client_secret: cfg.clientSecret || '',
    code,
    redirect_uri: `${url.origin}/oauth/${provider}/callback`,
    grant_type: 'authorization_code',
  });
  if (provider === 'ms') form.set('scope', p.scope);
  let res;
  try {
    res = await fetchT(p.tokenUrl(cfg), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: form,
    }, 15000);
  } catch (e) {
    console.error('oauth code exchange failed', e);
    return redirect(`${ret}#error=token_unreachable`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.refresh_token) {
    const why = data.error || (data.access_token ? 'no_refresh_token' : `token_${res.status}`);
    return redirect(`${ret}#error=${encodeURIComponent(why)}`);
  }
  const ts = Date.now();
  await kvPut(env, p.tokenKey, { refresh_token: data.refresh_token, ts });
  if (data.access_token) await cachePut(atKey(provider, ts, cfg), data.access_token, Math.max(60, (data.expires_in || 3600) - 120));
  return redirect(`${ret}#connected=${provider === 'ms' ? 'outlook' : 'google'}`);
}

// Cached access tokens are tied to the connection (its refresh-token record's ts): once the user
// disconnects (record deleted) or reconnects (new ts), an old cached token is never used again,
// even in another isolate whose memory cache still holds it.
// The OAuth app credentials are part of the key too, so changing them in Settings drops the old token.
function credTag(cfg) {
  let h = 5381;
  for (const c of `${cfg?.clientId || ''}\n${cfg?.clientSecret || ''}`) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return h.toString(36);
}
const atKey = (provider, ts, cfg) => `at:${provider}:${ts || 0}:${credTag(cfg)}`;

// Disconnect: forget the refresh token and this isolate's cached access token.
export async function disconnect(provider, env, config) {
  const p = PROVIDERS[provider];
  const tok = await kvGet(env, p.tokenKey);
  await env.LIFE.delete(p.tokenKey);
  if (tok) await cacheDel(atKey(provider, tok.ts, config?.[provider]));
}

// Get a usable access token, refreshing if needed. Throws ReauthError when the grant is dead.
export async function getAccessToken(provider, env, config) {
  const p = PROVIDERS[provider];
  const tok = await kvGet(env, p.tokenKey);
  if (!tok?.refresh_token) throw new ReauthError(p.label, 'not connected');
  const ck = atKey(provider, tok.ts, config[provider]);
  const cached = await cacheGet(ck);
  if (cached) return cached;
  const cfg = config[provider] || {};
  const form = new URLSearchParams({
    client_id: cfg.clientId || '',
    client_secret: cfg.clientSecret || '',
    refresh_token: tok.refresh_token,
    grant_type: 'refresh_token',
  });
  if (provider === 'ms') form.set('scope', p.scope);
  const res = await fetchT(p.tokenUrl(cfg), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: form,
  }, 15000);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    if (data.error === 'invalid_grant' || data.error === 'interaction_required') throw new ReauthError(p.label, data.error);
    throw new Error(`${p.label} token refresh failed: ${data.error || res.status}`);
  }
  // Only write KV when the refresh token actually rotated (same connection, so the same ts).
  if (data.refresh_token && data.refresh_token !== tok.refresh_token) {
    await kvPut(env, p.tokenKey, { refresh_token: data.refresh_token, ts: tok.ts || 0 });
  }
  await cachePut(ck, data.access_token, Math.max(60, (data.expires_in || 3600) - 120));
  return data.access_token;
}
