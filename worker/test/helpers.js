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
  async put(key, value) { this.writes.push(key); this.map.set(key, String(value)); }
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

export function makeEnv(init) { return { LIFE: new MockKV(init) }; }

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
