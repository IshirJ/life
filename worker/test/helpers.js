// Test helpers: in-memory KV, Cache API stub, fetch mocking.
export class MockKV {
  constructor(init = {}) {
    this.map = new Map(Object.entries(init));
    this.writes = [];
    this.deletes = [];
  }
  async get(key, type) {
    const v = this.map.get(key);
    if (v == null) return null;
    return type === 'json' ? JSON.parse(v) : v;
  }
  async put(key, value) { this.writes.push(key); this.map.set(key, value instanceof ArrayBuffer || ArrayBuffer.isView(value) ? value : String(value)); }
  async delete(key) { this.deletes.push(key); this.map.delete(key); }
  json(key) { const v = this.map.get(key); return v == null ? null : JSON.parse(v); }
}

// Minimal caches.default stub (Node has no Cache API).
if (typeof globalThis.caches === 'undefined') {
  const store = new Map();
  globalThis.caches = {
    default: {
      async match(req) { const r = store.get(req.url); return r ? r.clone() : undefined; },
      async put(req, resp) { store.set(req.url, resp.clone()); },
      _store: store,
    },
  };
}

import { SyncHub } from '../src/hub.js';
// In-memory stand-in for a Durable Object's storage + namespace.
class MockStorage {
  constructor() { this.m = new Map(); this.writes = 0; }
  async get(k) { if (Array.isArray(k)) { const r = new Map(); for (const x of k) if (this.m.has(x)) r.set(x, structuredClone(this.m.get(x))); return r; } return this.m.has(k) ? structuredClone(this.m.get(k)) : undefined; }
  async put(k, v) { if (typeof k === 'object') { for (const [a, b] of Object.entries(k)) { this.m.set(a, structuredClone(b)); this.writes++; } return; } this.m.set(k, structuredClone(v)); this.writes++; }
  async delete(k) { this.m.delete(k); }
}
export function makeEnv(init) {
  const env = { LIFE: new MockKV(init) };
  const ctx = { storage: new MockStorage(), sockets: [], acceptWebSocket(ws) { this.sockets.push(ws); }, getWebSockets() { return this.sockets; } };
  let obj = null;
  env.HUB = { idFromName: () => 'main', get: () => ({ fetch: (req) => (obj ||= new SyncHub(ctx, env)).fetch(req) }) };
  env._hubCtx = ctx;
  return env;
}

// Replace global fetch with a handler; returns { calls, restore }.
export function mockFetch(handler) {
  const orig = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push({ url, init });
    return handler(url, init);
  };
  return { calls, restore: () => { globalThis.fetch = orig; } };
}

export const BASE = 'https://life-sync.test.workers.dev';
export function req(path, { method = 'GET', key, body, headers = {} } = {}) {
  const h = { ...headers };
  if (key) h['X-Life-Key'] = key;
  if (body !== undefined && typeof body !== 'string') h['Content-Type'] = 'application/json';
  return new Request(BASE + path, {
    method, headers: h, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}
