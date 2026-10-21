import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createECDH, hkdfSync, createDecipheriv, createPublicKey, verify } from 'node:crypto';
import { encryptPayload, vapidJwt, getVapid, sendPush } from '../src/webpush.js';
import { b64uEncode, b64uDecode } from '../src/util.js';
import { makeEnv, mockFetch } from './helpers.js';

// Independent RFC 8291 decryptor built on node:crypto (not WebCrypto) to cross-check.
function decrypt(body, uaEcdh, authSecret) {
  const buf = Buffer.from(body);
  const salt = buf.subarray(0, 16);
  const rs = buf.readUInt32BE(16);
  const idlen = buf[20];
  const asPublic = buf.subarray(21, 21 + idlen);
  const ct = buf.subarray(21 + idlen);
  assert.equal(rs, 4096);
  assert.equal(idlen, 65);
  const uaPublic = uaEcdh.getPublicKey();
  const ecdhSecret = uaEcdh.computeSecret(asPublic);
  const keyInfo = Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic]);
  const ikm = Buffer.from(hkdfSync('sha256', ecdhSecret, authSecret, keyInfo, 32));
  const cek = Buffer.from(hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16));
  const nonce = Buffer.from(hkdfSync('sha256', ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12));
  const tag = ct.subarray(ct.length - 16);
  const d = createDecipheriv('aes-128-gcm', cek, nonce);
  d.setAuthTag(tag);
  const padded = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  let end = padded.length - 1;
  while (end >= 0 && padded[end] === 0) end--;
  assert.equal(padded[end], 2, 'last-record delimiter');
  return padded.subarray(0, end).toString('utf8');
}

function fakeSubscription() {
  const ua = createECDH('prime256v1');
  ua.generateKeys();
  const auth = Buffer.from(crypto.getRandomValues(new Uint8Array(16)));
  return {
    ua, auth,
    sub: { endpoint: 'https://fcm.googleapis.com/fcm/send/abc123', keys: { p256dh: b64uEncode(ua.getPublicKey()), auth: b64uEncode(auth) } },
  };
}

function verifyJwt(jwt, publicKeyB64u) {
  const [h, p, s] = jwt.split('.');
  const pub = b64uDecode(publicKeyB64u);
  assert.equal(pub.length, 65);
  const key = createPublicKey({
    key: { kty: 'EC', crv: 'P-256', x: b64uEncode(pub.slice(1, 33)), y: b64uEncode(pub.slice(33, 65)) },
    format: 'jwk',
  });
  const sig = Buffer.from(b64uDecode(s));
  assert.equal(sig.length, 64, 'ES256 signature is raw r||s');
  return verify('sha256', Buffer.from(`${h}.${p}`), { key, dsaEncoding: 'ieee-p1363' }, sig);
}

test('aes128gcm encrypt → independent decrypt round trip', async () => {
  const { ua, auth, sub } = fakeSubscription();
  const msg = JSON.stringify({ title: 'Hi', body: 'Take your meds 💊', url: '/x', tag: 't' });
  const body = await encryptPayload(new TextEncoder().encode(msg), sub.keys.p256dh, sub.keys.auth);
  assert.equal(decrypt(body, ua, auth), msg);
});

test('RFC 8291 appendix A test vector', async () => {
  // Keys from RFC 8291 §5 / Appendix A.
  const asPriv = 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw';
  const asPub = 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
  const uaPub = 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4';
  const authS = 'BTBZMqHH6r4Tts7J_aSIgg';
  const salt = b64uDecode('DGv6ra1nlYgDCS1FRnbzlw');
  const pubBytes = b64uDecode(asPub);
  const jwk = { kty: 'EC', crv: 'P-256', d: asPriv, x: b64uEncode(pubBytes.slice(1, 33)), y: b64uEncode(pubBytes.slice(33)), ext: true };
  const privateKey = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const publicKey = await crypto.subtle.importKey('raw', pubBytes, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
  const body = await encryptPayload(new TextEncoder().encode('When I grow up, I want to be a watermelon'), uaPub, authS, { salt, localKeyPair: { privateKey, publicKey } });
  assert.equal(b64uEncode(body),
    'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');
});

test('VAPID JWT verifies with the published public key', async () => {
  const env = makeEnv();
  const v = await getVapid(env);
  assert.ok(env.LIFE.json('vapid').privateJwk);
  const jwt = await vapidJwt(v.privateJwk, 'https://fcm.googleapis.com');
  assert.ok(verifyJwt(jwt, v.publicKey));
  const payload = JSON.parse(Buffer.from(b64uDecode(jwt.split('.')[1])).toString());
  assert.equal(payload.aud, 'https://fcm.googleapis.com');
  assert.equal(payload.sub, 'https://ishirj.github.io/life/');
  const now = Math.floor(Date.now() / 1000);
  assert.ok(payload.exp > now + 11 * 3600 && payload.exp <= now + 12 * 3600 + 5);
  const header = JSON.parse(Buffer.from(b64uDecode(jwt.split('.')[0])).toString());
  assert.equal(header.alg, 'ES256');
});

test('sendPush sets headers, body decrypts, 410 deletes sub', async () => {
  const env = makeEnv();
  const { ua, auth, sub } = fakeSubscription();
  await env.LIFE.put('sub', JSON.stringify(sub));
  let status = 201;
  const f = mockFetch(() => new Response(null, { status }));
  try {
    const r = await sendPush(env, sub, { title: 'T', body: 'B', url: '/u', tag: 'g' });
    assert.equal(r.status, 201);
    const { url, init } = f.calls[0];
    assert.equal(url, sub.endpoint);
    assert.equal(init.headers.TTL, '86400');
    assert.equal(init.headers.Urgency, 'high');
    assert.equal(init.headers['Content-Encoding'], 'aes128gcm');
    const m = /^vapid t=([^,]+), k=(.+)$/.exec(init.headers.Authorization);
    assert.ok(m);
    assert.ok(verifyJwt(m[1], m[2]));
    assert.deepEqual(JSON.parse(decrypt(init.body, ua, auth)), { title: 'T', body: 'B', url: '/u', tag: 'g' });
    status = 410;
    await sendPush(env, sub, { title: 'x' });
    assert.equal(env.LIFE.map.has('sub'), false);
  } finally { f.restore(); }
});

test('encrypted reminder: enc passes through unchanged inside the push payload', async () => {
  const env = makeEnv();
  const { ua, auth, sub } = fakeSubscription();
  const f = mockFetch(() => new Response(null, { status: 201 }));
  try {
    await sendPush(env, sub, { title: 'Life', body: '', tag: 't', enc: { iv: 'aXZ2', ct: 'Y3Q=' } });
    assert.deepEqual(JSON.parse(decrypt(f.calls[0].init.body, ua, auth)), { title: 'Life', body: '', tag: 't', enc: { iv: 'aXZ2', ct: 'Y3Q=' } });
  } finally { f.restore(); }
});
