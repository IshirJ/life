// SyncHub: one Durable Object that holds the synced Life database and the notebooks index.
// Unlike KV, a Durable Object is strongly consistent (every read sees the last write), so two devices
// can never overwrite each other from a stale copy. It also keeps a live WebSocket to each open
// device and tells the others the moment something changes.

const CHUNK = 1_000_000; // characters per stored piece (SQLite-backed storage caps values at ~2 MB)
const MAX_DOC = 20 * 1024 * 1024;

export class SyncHub {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
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

  async writeDoc(text, m) {
    const n = Math.max(1, Math.ceil(text.length / CHUNK));
    const puts = {};
    for (let i = 0; i < n; i++) puts[`doc:${i}`] = text.slice(i * CHUNK, (i + 1) * CHUNK);
    await this.ctx.storage.put(puts);
    for (let i = n; i < (m.n || 0); i++) await this.ctx.storage.delete(`doc:${i}`);
    m.n = n;
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
      if (!body.doc || typeof body.doc !== 'object' || !(Array.isArray(body.doc.entries) || (body.doc.e2e === 1 && typeof body.doc.ct === 'string'))) return Response.json({ error: 'doc with entries required' }, { status: 400 });
      const m = await this.ensure();
      if (Number(body.base || 0) !== m.ver) return Response.json({ error: 'conflict', ver: m.ver }, { status: 409 });
      const next = { ver: m.ver + 1, ts: Date.now(), n: m.n };
      await this.writeDoc(JSON.stringify(body.doc), next);
      await this.ctx.storage.put('meta', next);
      this.broadcast({ t: 'ver', ver: next.ver, from: device });
      return Response.json({ ok: true, ver: next.ver, ts: next.ts });
    }

    if (path === '/sync/notes' && method === 'GET') {
      await this.ensure();
      return Response.json((await this.ctx.storage.get('nbindex')) || { books: {}, pages: {} });
    }

    // Apply notebook item metadata; returns which ones were accepted (newer than what's stored).
    if (path === '/sync/notes/apply' && method === 'POST') {
      await this.ensure();
      const { items = [] } = await request.json();
      const idx = (await this.ctx.storage.get('nbindex')) || { books: {}, pages: {} };
      const ok = [];
      for (const it of items) {
        const kind = it.kind === 'book' ? 'books' : it.kind === 'page' ? 'pages' : null;
        if (!kind || typeof it.id !== 'string' || it.id.length > 64) continue;
        const u = Number(it.u) || Date.now(), cur = idx[kind][it.id];
        if (cur && cur.u > u) continue;
        idx[kind][it.id] = it.deleted ? { u, d: 1 } : { u };
        ok.push(it.id);
      }
      await this.ctx.storage.put('nbindex', idx);
      if (ok.length) this.broadcast({ t: 'notes' }, null);
      return Response.json({ ok: true, accepted: ok, index: idx });
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
      const { text } = await request.json().catch(() => ({}));
      const t = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 500);
      if (!t) return Response.json({ error: 'text required' }, { status: 400 });
      const j = (await this.ctx.storage.get('jarvis')) || { q: [], log: [], seen: 0 };
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      j.q.push({ id, text: t, at: Date.now() }); j.q = j.q.slice(-20);
      j.log.push({ id, text: t, at: Date.now(), state: 'queued' }); j.log = j.log.slice(-40);
      await this.ctx.storage.put('jarvis', j);
      this.broadcast({ t: 'jarvis' }, null);
      return Response.json({ ok: true, id });
    }
    if (path === '/jarvis/next' && method === 'GET') {
      const j = (await this.ctx.storage.get('jarvis')) || { q: [], log: [], seen: 0 };
      const first = Date.now() - j.seen > 60000;
      j.seen = Date.now();
      // a running JARVIS can restart itself too (in case the laptop's launcher isn't running)
      if (url.searchParams.get('v') === '2' && j.wake && j.wake.mode === 'restart' && Date.now() - j.wake.at < 120000) { delete j.wake; await this.ctx.storage.put('jarvis', j); this.broadcast({ t: 'jarvis' }, null); return Response.json({ restart: true }); }
      const stop = j.stop && Date.now() - j.stop < 60000;
      if (j.stop) { delete j.stop; j.q = []; }
      const busy = url.searchParams.get('busy') === '1';   // laptop still working: only hand over a stop
      const next = stop || busy ? null : (j.q.shift() || null);
      if (next) { const l = j.log.find((x) => x.id === next.id); if (l) l.state = 'running'; }
      if (stop) { for (const l of j.log) if (l.state === 'running' || l.state === 'queued') { l.state = 'error'; l.reply = 'Stopped.'; l.done = Date.now(); } await this.ctx.storage.put('jarvis', j); this.broadcast({ t: 'jarvis' }, null); return Response.json({ stop: true }); }
      if (next || first) { await this.ctx.storage.put('jarvis', j); this.broadcast({ t: 'jarvis' }, null); }
      else this.seenMem = Date.now();
      return Response.json(next || {});
    }
    if (path === '/jarvis/reply' && method === 'POST') {
      const b = await request.json().catch(() => ({}));
      const j = (await this.ctx.storage.get('jarvis')) || { q: [], log: [], seen: 0 };
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
      const b = await request.json().catch(() => ({}));
      const mode = ['start', 'restart', 'stop'].includes(b.mode) ? b.mode : 'start';
      const j = (await this.ctx.storage.get('jarvis')) || { q: [], log: [], seen: 0 };
      if (mode === 'stop') j.stop = Date.now(); else j.wake = { mode, at: Date.now() };
      await this.ctx.storage.put('jarvis', j);
      this.broadcast({ t: 'jarvis' }, null);
      return Response.json({ ok: true });
    }
    if (path === '/jarvis/wake' && method === 'GET') {
      this.launcherMem = Date.now();
      const j = (await this.ctx.storage.get('jarvis')) || { q: [], log: [], seen: 0 };
      const w = j.wake && Date.now() - j.wake.at < 120000 ? j.wake : null;
      if (j.wake) { delete j.wake; await this.ctx.storage.put('jarvis', j); }
      if (w) this.broadcast({ t: 'jarvis' }, null);
      return Response.json(w ? { mode: w.mode } : {});
    }
    if (path === '/jarvis/log' && method === 'GET') {
      const j = (await this.ctx.storage.get('jarvis')) || { q: [], log: [], seen: 0 };
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
