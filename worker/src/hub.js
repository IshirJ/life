// SyncHub: one Durable Object that holds the synced Life database and the notebooks index.
// Unlike KV, a Durable Object is strongly consistent (every read sees the last write), so two devices
// can never overwrite each other from a stale copy. It also keeps a live WebSocket to each open
// device and tells the others the moment something changes.

const CHUNK = 1_000_000; // characters per stored piece (SQLite-backed storage caps values at ~2 MB)
const MAX_DOC = 20 * 1024 * 1024;
const QMAX = 20;          // queued JARVIS commands kept
const STOP_FRESH = 60000; // a stop older than this is not handed to the laptop

// JSON body that is always an object (a body of `null`, a number or bad JSON becomes {}).
async function body(request) {
  const b = await request.json().catch(() => null);
  return b && typeof b === 'object' && !Array.isArray(b) ? b : {};
}
const emptyJarvis = () => ({ q: [], log: [], seen: 0 });

export class SyncHub {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.rl = new Map();
    this._lock = Promise.resolve();
  }

  // Run fn with no other locked section interleaving (awaits on KV/crypto open the DO's input gate,
  // so plain sequential code isn't enough for check-then-write sequences that touch KV).
  locked(fn) {
    const run = this._lock.then(fn, fn);
    this._lock = run.catch(() => {});
    return run;
  }

  async meta() { return (await this.ctx.storage.get('meta')) || null; }

  // First use: bring over whatever the old KV-based sync had stored.
  async ensure() {
    let m = await this.meta();
    if (m) return m;
    m = { ver: 0, ts: 0, n: 0 };
    try {
      const old = await this.env.LIFE.get('sync:meta');
      const doc = await this.env.LIFE.get('sync:doc');
      if (old && doc) {
        const om = JSON.parse(old);
        m = { ver: om.ver || 1, ts: om.ts || Date.now(), n: 0 };
        await this.writeDoc(doc, m);
      }
      const idx = await this.env.LIFE.get('nb:index');
      if (idx) await this.ctx.storage.put('nbindex', JSON.parse(idx));
    } catch { /* start empty */ }
    await this.ctx.storage.put('meta', m);
    return m;
  }

  // Chunks and `meta` go in ONE put, which storage applies atomically: a reader never sees new chunks
  // under the old version (or a truncated document). Leftover chunks past the new count are removed
  // afterwards; readers ignore them because meta.n says how many to read.
  async writeDoc(text, next) {
    const old = (await this.meta())?.n || 0;
    const n = Math.max(1, Math.ceil(text.length / CHUNK));
    const puts = {};
    for (let i = 0; i < n; i++) puts[`doc:${i}`] = text.slice(i * CHUNK, (i + 1) * CHUNK);
    next.n = n;
    puts.meta = next;
    await this.ctx.storage.put(puts);
    const extra = [];
    for (let i = n; i < old; i++) extra.push(`doc:${i}`);
    if (extra.length) await this.ctx.storage.delete(extra);
  }

  async readDoc(m) {
    if (!m.n) return null;
    const keys = Array.from({ length: m.n }, (_, i) => `doc:${i}`);
    const got = await this.ctx.storage.get(keys);
    return keys.map((k) => got.get(k) || '').join('');
  }

  broadcast(msg, except) {
    const s = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(s); } catch { /* closed */ }
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname, method = request.method;
    const device = request.headers.get('X-Life-Device') || '';

    if (path === '/sync/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
      const pair = new WebSocketPair();
      this.ctx.acceptWebSocket(pair[1], [device || 'device']);
      pair[1].serializeAttachment({ device });
      const m = await this.ensure();
      pair[1].send(JSON.stringify({ t: 'hello', ver: m.ver, devices: this.ctx.getWebSockets().length }));
      return new Response(null, { status: 101, webSocket: pair[0], headers: { 'Sec-WebSocket-Protocol': 'life' } });
    }

    if (path === '/sync' && method === 'GET') {
      const m = await this.ensure();
      const have = url.searchParams.get('have');
      if (have != null && Number(have) === m.ver) return Response.json({ ver: m.ver, ts: m.ts, same: true });
      const doc = await this.readDoc(m);
      return new Response(`{"ver":${m.ver},"ts":${m.ts},"doc":${doc || 'null'}}`, { headers: { 'Content-Type': 'application/json' } });
    }

    if (path === '/sync' && method === 'PUT') {
      const text = await request.text();
      if (text.length > MAX_DOC) return Response.json({ error: 'body too large' }, { status: 413 });
      let body;
      try { body = JSON.parse(text); } catch { return Response.json({ error: 'invalid JSON' }, { status: 400 }); }
      if (!body || typeof body !== 'object' || !body.doc || typeof body.doc !== 'object' || !(Array.isArray(body.doc.entries) || (body.doc.e2e === 1 && typeof body.doc.ct === 'string'))) return Response.json({ error: 'doc with entries required' }, { status: 400 });
      const m = await this.ensure();
      if (Number(body.base || 0) !== m.ver) return Response.json({ error: 'conflict', ver: m.ver }, { status: 409 });
      const next = { ver: m.ver + 1, ts: Date.now(), n: m.n };
      await this.writeDoc(JSON.stringify(body.doc), next);
      this.broadcast({ t: 'ver', ver: next.ver, from: device });
      return Response.json({ ok: true, ver: next.ver, ts: next.ts });
    }

    if (path === '/sync/notes' && method === 'GET') {
      await this.ensure();
      return Response.json((await this.ctx.storage.get('nbindex')) || { books: {}, pages: {} });
    }

    // One notebook item's index entry (used to find which stored version of its content to read).
    if (path === '/sync/notes/meta' && method === 'GET') {
      await this.ensure();
      const kind = url.searchParams.get('kind') === 'books' ? 'books' : 'pages';
      const idx = (await this.ctx.storage.get('nbindex')) || { books: {}, pages: {} };
      return Response.json({ entry: idx[kind]?.[url.searchParams.get('id') || ''] || null });
    }

    // Which of these items are newer than what's stored (nothing is changed).
    if (path === '/sync/notes/check' && method === 'POST') {
      await this.ensure();
      const { items } = await body(request);
      const idx = (await this.ctx.storage.get('nbindex')) || { books: {}, pages: {} };
      const ok = [];
      for (const it of Array.isArray(items) ? items : []) {
        const kind = it?.kind === 'book' ? 'books' : it?.kind === 'page' ? 'pages' : null;
        if (!kind || typeof it.id !== 'string' || it.id.length > 64) continue;
        const cur = idx[kind][it.id];
        if (!(cur && cur.u > (Number(it.u) || 0))) ok.push(`${kind}:${it.id}`);
      }
      return Response.json({ ok });
    }

    // Apply notebook item metadata; returns which ones were accepted (newer than what's stored) and the
    // entry each one replaced. The caller has already written the content, so devices told about the
    // change can fetch it straight away.
    if (path === '/sync/notes/apply' && method === 'POST') {
      await this.ensure();
      const { items } = await body(request);
      const idx = (await this.ctx.storage.get('nbindex')) || { books: {}, pages: {} };
      const ok = [], prev = {};
      for (const it of Array.isArray(items) ? items : []) {
        const kind = it?.kind === 'book' ? 'books' : it?.kind === 'page' ? 'pages' : null;
        if (!kind || typeof it.id !== 'string' || it.id.length > 64) continue;
        const u = Number(it.u) || Date.now(), cur = idx[kind][it.id];
        if (cur && cur.u > u) continue;
        prev[`${kind}:${it.id}`] = cur || null;
        idx[kind][it.id] = it.deleted ? { u, d: 1 } : it.v ? { u, v: 1 } : { u };
        ok.push(it.id);
      }
      if (ok.length) await this.ctx.storage.put('nbindex', idx);
      if (ok.length) this.broadcast({ t: 'notes' }, null);
      return Response.json({ ok: true, accepted: ok, prev, index: idx });
    }

    // ---- internal calls from the worker (never routed from outside) ----
    // First-time pairing. Serialised here so two simultaneous /pair calls can't both get a key, and
    // remembered here so an edge location with a stale "no key" KV read can't pair a second time.
    if (path === '/_/pair' && method === 'POST') {
      return this.locked(async () => {
        if (await this.ctx.storage.get('paired')) return Response.json({ error: 'already paired' }, { status: 409 });
        if (await this.env.LIFE.get('key')) {
          await this.ctx.storage.put('paired', true);
          return Response.json({ error: 'already paired' }, { status: 409 });
        }
        const { key } = await body(request);
        if (typeof key !== 'string' || key.length < 32) return Response.json({ error: 'bad key' }, { status: 400 });
        await this.env.LIFE.put('key', key);
        await this.ctx.storage.put('paired', true);
        return Response.json({ key });
      });
    }
    // Key rotated: drop every live connection that was opened with the old key.
    if (path === '/_/close' && method === 'POST') {
      let n = 0;
      for (const ws of this.ctx.getWebSockets()) { try { ws.close(4001, 'key changed'); n++; } catch { /* already closed */ } }
      return Response.json({ closed: n });
    }
    // The push signing key is created once, here, so two first requests can't each make a different one.
    if (path === '/_/vapid' && method === 'POST') {
      return this.locked(async () => {
        let v = await this.ctx.storage.get('vapid');
        if (!v) {
          const kv = await this.env.LIFE.get('vapid');
          try { v = kv ? JSON.parse(kv) : null; } catch { v = null; }
          if (!v?.privateJwk || !v?.publicKey) {
            const { v: fresh } = await body(request);
            if (!fresh?.privateJwk || !fresh?.publicKey) return Response.json({ error: 'bad key' }, { status: 400 });
            v = fresh;
            await this.env.LIFE.put('vapid', JSON.stringify(v));
          }
          await this.ctx.storage.put('vapid', v);
        }
        return Response.json({ v });
      });
    }
    // Fixed-window rate limit kept in memory (one instance serves every request, so the count is exact;
    // it resets if the object is evicted, which only ever makes it more lenient).
    if (path === '/_/rl' && method === 'POST') {
      const { rules } = await body(request);
      const now = Date.now();
      let retry = 0;
      const hits = [];
      for (const r of Array.isArray(rules) ? rules : []) {
        const k = `${r.b}|${r.win}`;
        let w = this.rl.get(k);
        if (!w || now - w.t >= r.win) w = { t: now, n: 0 };
        if (w.n >= r.limit) retry = Math.max(retry, w.t + r.win - now);
        hits.push([k, w]);
      }
      if (!retry) for (const [k, w] of hits) { w.n++; this.rl.set(k, w); }
      if (this.rl.size > 500) for (const [k, w] of this.rl) if (now - w.t > 86400000) this.rl.delete(k);
      return Response.json(retry ? { ok: false, retry: Math.ceil(retry / 1000) } : { ok: true });
    }

    if (path === '/sync/status' && method === 'GET') {
      const m = await this.ensure();
      const doc = await this.readDoc(m);
      let entries = 0, tombs = 0;
      let encd = false;
      try { const d = JSON.parse(doc || 'null'); encd = d?.e2e === 1; entries = d?.entries?.length || 0; tombs = Object.keys(d?.tomb || {}).length; } catch { /* ignore */ }
      return Response.json({ ver: m.ver, ts: m.ts, entries, tombs, encrypted: encd, bytes: (doc || '').length, devices: this.ctx.getWebSockets().length });
    }

    // JARVIS relay: the app queues a typed command, the laptop picks it up and posts the reply.
    if (path === '/jarvis/cmd' && method === 'POST') {
      const { text } = await body(request);
      const t0 = String(text || '').replace(/\s+/g, ' ').trim(), t = t0.slice(0, t0.startsWith('__say:') ? 1500 : 500);
      if (!t) return Response.json({ error: 'text required' }, { status: 400 });
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      j.q.push({ id, text: t, at: Date.now() });
      j.log.push({ id, text: t, at: Date.now(), state: 'queued' });
      if (j.q.length > QMAX) {
        // too many waiting: the oldest are dropped, and their log entries say so instead of "queued" forever
        const dropped = new Set(j.q.slice(0, -QMAX).map((x) => x.id));
        j.q = j.q.slice(-QMAX);
        for (const l of j.log) if (dropped.has(l.id) && l.state === 'queued') { l.state = 'error'; l.reply = 'Dropped: too many commands were waiting.'; l.done = Date.now(); }
      }
      j.log = j.log.slice(-40);
      await this.ctx.storage.put('jarvis', j);
      this.broadcast({ t: 'jarvis' }, null);
      return Response.json({ ok: true, id });
    }
    if (path === '/jarvis/next' && method === 'GET') {
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      const first = Date.now() - j.seen > 60000;
      j.seen = Date.now();
      // a running JARVIS can restart itself too (in case the laptop's launcher isn't running)
      if (url.searchParams.get('v') === '2' && j.wake && j.wake.mode === 'restart' && Date.now() - j.wake.at < 120000) { delete j.wake; await this.ctx.storage.put('jarvis', j); this.broadcast({ t: 'jarvis' }, null); return Response.json({ restart: true }); }
      // The queue was emptied when the stop was posted, so anything queued now was sent after it and is kept.
      const stopAt = j.stop || 0;
      const stop = stopAt && Date.now() - stopAt < STOP_FRESH;
      if (stopAt) delete j.stop;
      if (stop) {
        for (const l of j.log) if ((l.state === 'running' || l.state === 'queued') && (l.at || 0) <= stopAt) { l.state = 'error'; l.reply = 'Stopped.'; l.done = Date.now(); }
        await this.ctx.storage.put('jarvis', j); this.broadcast({ t: 'jarvis' }, null);
        return Response.json({ stop: true });
      }
      const busy = url.searchParams.get('busy') === '1';   // laptop still working: only hand over a stop
      const next = busy ? null : (j.q.shift() || null);
      if (next) { const l = j.log.find((x) => x.id === next.id); if (l) l.state = 'running'; }
      if (next || first || stopAt) { await this.ctx.storage.put('jarvis', j); this.broadcast({ t: 'jarvis' }, null); }
      else this.seenMem = Date.now();
      return Response.json(next || {});
    }
    if (path === '/jarvis/reply' && method === 'POST') {
      const b = await body(request);
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      const l = j.log.find((x) => x.id === String(b.id || ''));
      if (l) { l.reply = String(b.reply || '').slice(0, 1500); l.state = b.state === 'error' ? 'error' : 'done'; l.done = Date.now(); }
      j.seen = Date.now();
      await this.ctx.storage.put('jarvis', j);
      this.broadcast({ t: 'jarvis' }, null);
      return Response.json({ ok: true });
    }
    // Phone → "start / restart JARVIS" or "stop what you're doing". The launcher on the laptop (always on,
    // tiny) picks up wake; the running bridge picks up stop with its next poll.
    if (path === '/jarvis/wake' && method === 'POST') {
      const b = await body(request);
      const mode = ['start', 'restart', 'stop'].includes(b.mode) ? b.mode : 'start';
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      if (mode === 'stop') {
        j.stop = Date.now(); j.q = [];
        // the phone sees it stopped right away, even if the laptop is asleep
        for (const l of j.log) if (l.state === 'running' || l.state === 'queued') { l.state = 'error'; l.reply = 'Stopped.'; l.done = Date.now(); }
      } else j.wake = { mode, at: Date.now() };
      await this.ctx.storage.put('jarvis', j);
      this.broadcast({ t: 'jarvis' }, null);
      return Response.json({ ok: true });
    }
    if (path === '/jarvis/wake' && method === 'GET') {
      this.launcherMem = Date.now();
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      const w = j.wake && Date.now() - j.wake.at < 120000 ? j.wake : null;
      if (j.wake) { delete j.wake; await this.ctx.storage.put('jarvis', j); }
      if (w) this.broadcast({ t: 'jarvis' }, null);
      return Response.json(w ? { mode: w.mode } : {});
    }
    // live progress lines from the laptop for the command it's working on
    if (path === '/jarvis/step' && method === 'POST') {
      const b = await body(request);
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      const l = j.log.find((x) => x.id === String(b.id || ''));
      if (l && l.state === 'running') {
        const lines = (Array.isArray(b.lines) ? b.lines : [b.line]).map((x) => String(x || '').replace(/\s+/g, ' ').trim().slice(0, 160)).filter(Boolean);
        l.steps = [...(l.steps || []), ...lines].slice(-40);
        j.seen = Date.now();
        await this.ctx.storage.put('jarvis', j);
        this.broadcast({ t: 'jarvis' }, null);
      }
      return Response.json({ ok: true });
    }
    if (path === '/jarvis/log' && method === 'GET') {
      const j = (await this.ctx.storage.get('jarvis')) || emptyJarvis();
      return Response.json({ log: j.log, seen: Math.max(j.seen || 0, this.seenMem || 0), queued: j.q.length, launcher: this.launcherMem || 0, waking: j.wake ? j.wake.mode : null });
    }

    return Response.json({ error: 'not found' }, { status: 404 });
  }

  // Devices only listen; a "ping" keeps the line open through proxies.
  async webSocketMessage(ws, msg) {
    if (msg === 'ping') { try { ws.send('pong'); } catch { /* closed */ } }
  }
  async webSocketClose(ws, code) { try { ws.close(code, 'bye'); } catch { /* already closed */ } }
  async webSocketError() { /* the device will reconnect */ }
}
