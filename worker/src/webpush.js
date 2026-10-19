// Web Push: RFC 8291 (aes128gcm message encryption) + RFC 8292 (VAPID), WebCrypto only.
import { b64uEncode, b64uDecode, concatBytes, hmacSha256, randomBytes, utf8, kvGet, kvPut } from './util.js';

// Apple rejects placeholder contacts (BadJwtToken); use the app's real https URL.
const VAPID_SUB = 'https://ishirj.github.io/life/';
const RS = 4096;
let vapidMem = null; // per-isolate cache of the KV `vapid` record

// ---- VAPID key management ----
export async function getVapid(env) {
  if (vapidMem && vapidMem.env === env) return vapidMem.v;
  let v = await kvGet(env, 'vapid');
  if (!v?.privateJwk || !v?.publicKey) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const privateJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    const publicKey = b64uEncode(await crypto.subtle.exportKey('raw', kp.publicKey));
    v = { privateJwk, publicKey, created: Date.now() };
    await kvPut(env, 'vapid', v);
  }
  vapidMem = { env, v };
  return v;
}

export async function vapidJwt(privateJwk, aud, nowSec = Math.floor(Date.now() / 1000)) {
  const header = b64uEncode(utf8(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64uEncode(utf8(JSON.stringify({ aud, exp: nowSec + 12 * 3600, sub: VAPID_SUB })));
  const key = await crypto.subtle.importKey('jwk', { ...privateJwk, key_ops: ['sign'] },
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  // WebCrypto ECDSA output is raw r||s (64 bytes) — exactly what JWS ES256 requires.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, utf8(`${header}.${payload}`));
  return `${header}.${payload}.${b64uEncode(sig)}`;
}

// HKDF (RFC 5869) with a single output block, built on HMAC-SHA-256.
async function hkdf(salt, ikm, info, len) {
  const prk = await hmacSha256(salt, ikm);
  const okm = await hmacSha256(prk, concatBytes(info, new Uint8Array([1])));
  return okm.slice(0, len);
}

/**
 * Encrypt a payload for a PushSubscription (RFC 8291, aes128gcm, single record).
 * @param {Uint8Array} plaintext
 * @param {string} p256dh base64url uncompressed P-256 point from subscription.keys.p256dh
 * @param {string} auth   base64url 16-byte secret from subscription.keys.auth
 * @param {object} [opts] { salt, localKeyPair } for deterministic tests
 */
export async function encryptPayload(plaintext, p256dh, auth, opts = {}) {
  const uaPublic = b64uDecode(p256dh);
  const authSecret = b64uDecode(auth);
  const salt = opts.salt || randomBytes(16);
  const local = opts.localKeyPair || await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, local.privateKey, 256));

  // IKM = HKDF(auth_secret, ecdh_secret, "WebPush: info\0" || ua_public || as_public, 32)
  const keyInfo = concatBytes(utf8('WebPush: info\0'), uaPublic, asPublic);
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32);
  const cek = await hkdf(salt, ikm, utf8('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, utf8('Content-Encoding: nonce\0'), 12);

  if (plaintext.length + 17 > RS) throw new Error('payload too large');
  const padded = concatBytes(plaintext, new Uint8Array([2])); // last-record delimiter, no padding
  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, aesKey, padded));

  const header = new Uint8Array(16 + 4 + 1 + asPublic.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, RS);
  header[20] = asPublic.length;
  header.set(asPublic, 21);
  return concatBytes(header, ct);
}

/**
 * Send a Web Push message. Returns { status, ok }. Deletes KV `sub` on 404/410.
 */
export async function sendPush(env, subscription, payload) {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return { status: 0, ok: false, error: 'no subscription' };
  }
  const vapid = await getVapid(env);
  const aud = new URL(subscription.endpoint).origin;
  const jwt = await vapidJwt(vapid.privateJwk, aud);
  const body = await encryptPayload(utf8(JSON.stringify(trimPayload(payload))), subscription.keys.p256dh, subscription.keys.auth);
  let res;
  try {
    res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `vapid t=${jwt}, k=${vapid.publicKey}`,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        TTL: '86400',
        Urgency: 'high',
      },
      body,
    });
  } catch (e) {
    return { status: 0, ok: false, error: String(e?.message || e) };
  }
  if (res.status === 404 || res.status === 410) await env.LIFE.delete('sub');
  const ok = res.status >= 200 && res.status < 300;
  let reason;
  if (!ok) { try { reason = (await res.text()).slice(0, 300); } catch {} }
  return { status: res.status, ok, ...(reason ? { reason } : {}), host: new URL(subscription.endpoint).host };
}

function trimPayload(p) {
  return {
    title: String(p.title ?? 'Life').slice(0, 120),
    body: String(p.body ?? '').slice(0, 1000),
    url: String(p.url ?? '').slice(0, 500) || undefined,
    tag: p.tag ? String(p.tag).slice(0, 100) : undefined,
  };
}
