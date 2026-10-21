// Minimal-but-robust iCalendar (RFC 5545) parser + recurrence expander.
import {
  resolveTz, localToUtc, utcToLocal, dayNum, fromDayNum, weekday, daysInMonth,
  fmtDate, fmtLocal, parseYmd,
} from './tz.js';

const MAX_INSTANCES = 2000;
const MAX_ITER = 50000;          // recurrence periods per event
const FEED_BUDGET = 200000;      // recurrence periods per feed, across all events
const WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

// ---- lexing ----
export function unfold(text) {
  return String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
}

export function parseLine(line) {
  let inQ = false;
  let colon = -1;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQ = !inQ;
    else if (c === ':' && !inQ) { colon = i; break; }
  }
  if (colon < 0) return null;
  const head = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const segs = [];
  let cur = '';
  inQ = false;
  for (const c of head) {
    if (c === '"') inQ = !inQ;
    if (c === ';' && !inQ) { segs.push(cur); cur = ''; } else cur += c;
  }
  segs.push(cur);
  const params = {};
  for (const s of segs.slice(1)) {
    const eq = s.indexOf('=');
    if (eq > 0) params[s.slice(0, eq).toUpperCase()] = s.slice(eq + 1).replace(/^"|"$/g, '');
  }
  return { name: segs[0].toUpperCase(), params, value };
}

export function unescapeText(v) {
  return String(v ?? '').replace(/\\([\\;,nN])/g, (_, c) => (c === 'n' || c === 'N' ? '\n' : c));
}

// Split into VEVENT property maps (ignores nested VALARM etc.).
export function parseEvents(text) {
  const lines = unfold(text).split('\n');
  const events = [];
  const stack = [];
  let ev = null;
  for (const raw of lines) {
    if (!raw) continue;
    const p = parseLine(raw);
    if (!p) continue;
    if (p.name === 'BEGIN') {
      const comp = p.value.trim().toUpperCase();
      stack.push(comp);
      if (comp === 'VEVENT') ev = { props: {} };
      continue;
    }
    if (p.name === 'END') {
      const comp = stack.pop();
      if (comp === 'VEVENT' && ev) { events.push(ev.props); ev = null; }
      continue;
    }
    if (ev && stack[stack.length - 1] === 'VEVENT') {
      (ev.props[p.name] ||= []).push(p);
    }
  }
  return events;
}

// ---- values ----
// Returns { allDay, dn (day number for all-day), y,m,d,h,mi,s (wall clock), tz, utc }
export function parseDateValue(prop, defaultTz, valueOverride) {
  if (!prop) return null;
  const v = String(valueOverride ?? prop.value).trim();
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(v);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (m[4] == null || (prop.params.VALUE || '').toUpperCase() === 'DATE') {
    return { allDay: true, y, m: mo, d, dn: dayNum(y, mo, d) };
  }
  const h = +m[4], mi = +m[5], s = +(m[6] || 0);
  let tz;
  if (m[7]) tz = 'UTC';
  else tz = resolveTz(prop.params.TZID) || defaultTz; // floating → user zone
  const utc = localToUtc(y, mo, d, h, mi, s, tz);
  return { allDay: false, y, m: mo, d, h, mi, s, tz, utc };
}

// ISO-8601 duration → { ms, days } (days used for all-day arithmetic).
export function parseDuration(v) {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(v || '').trim());
  if (!m) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const days = (+(m[2] || 0)) * 7 + (+(m[3] || 0));
  const secs = (+(m[4] || 0)) * 3600 + (+(m[5] || 0)) * 60 + (+(m[6] || 0));
  return { ms: sign * (days * 86400 + secs) * 1000, days: sign * days };
}

export function parseRRule(v) {
  const r = {};
  for (const part of String(v || '').split(';')) {
    const [k, val] = part.split('=');
    if (k && val != null) r[k.toUpperCase()] = val;
  }
  if (!r.FREQ) return null;
  const list = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : null);
  return {
    freq: r.FREQ.toUpperCase(),
    interval: Math.max(1, parseInt(r.INTERVAL || '1', 10) || 1),
    count: r.COUNT ? parseInt(r.COUNT, 10) : null,
    until: r.UNTIL || null,
    byday: list(r.BYDAY)?.map((s) => {
      const mm = /^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/i.exec(s);
      return mm ? { n: mm[1] ? parseInt(mm[1], 10) : 0, wd: WD[mm[2].toUpperCase()] } : null;
    }).filter(Boolean) || null,
    bymonthday: list(r.BYMONTHDAY)?.map(Number).filter((n) => n && Math.abs(n) <= 31) || null,
    bymonth: list(r.BYMONTH)?.map(Number).filter((n) => n >= 1 && n <= 12) || null,
    bysetpos: list(r.BYSETPOS)?.map(Number).filter(Boolean) || null,
    wkst: WD[(r.WKST || 'MO').toUpperCase()] ?? 1,
  };
}

// ---- recurrence: produce candidate day numbers per period ----
function monthDays(y, m, rule, startDate) {
  const dim = daysInMonth(y, m);
  let days = null;
  if (rule.bymonthday) {
    days = rule.bymonthday.map((n) => (n > 0 ? n : dim + 1 + n)).filter((n) => n >= 1 && n <= dim);
  }
  if (rule.byday) {
    const byd = new Set();
    for (const { n, wd } of rule.byday) {
      const all = [];
      for (let d = 1; d <= dim; d++) if (weekday(dayNum(y, m, d)) === wd) all.push(d);
      if (!n) all.forEach((d) => byd.add(d));
      else {
        const pick = n > 0 ? all[n - 1] : all[all.length + n];
        if (pick) byd.add(pick);
      }
    }
    days = days ? days.filter((d) => byd.has(d)) : [...byd];
  }
  if (!days) days = startDate.d <= dim ? [startDate.d] : [];
  return [...new Set(days)].sort((a, b) => a - b).map((d) => dayNum(y, m, d));
}

function applySetPos(cands, rule) {
  if (!rule.bysetpos || !cands.length) return cands;
  const out = [];
  for (const p of rule.bysetpos) {
    const c = p > 0 ? cands[p - 1] : cands[cands.length + p];
    if (c != null) out.push(c);
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

function periodCandidates(rule, i, start) {
  const sdn = start.dn;
  const monthOk = (dn) => !rule.bymonth || rule.bymonth.includes(fromDayNum(dn).m);
  let c = [];
  switch (rule.freq) {
    case 'DAILY': {
      const dn = sdn + i * rule.interval;
      const dt = fromDayNum(dn);
      let ok = monthOk(dn);
      if (ok && rule.bymonthday) {
        const dim = daysInMonth(dt.y, dt.m);
        ok = rule.bymonthday.some((n) => (n > 0 ? n : dim + 1 + n) === dt.d);
      }
      if (ok && rule.byday) ok = rule.byday.some((b) => b.wd === weekday(dn));
      c = ok ? [dn] : [];
      break;
    }
    case 'WEEKLY': {
      const ws = sdn - ((weekday(sdn) - rule.wkst + 7) % 7); // week start containing DTSTART
      const base = ws + i * 7 * rule.interval;
      const wds = rule.byday ? rule.byday.map((b) => b.wd) : [weekday(sdn)];
      for (let k = 0; k < 7; k++) if (wds.includes(weekday(base + k))) c.push(base + k);
      c = c.filter(monthOk);
      break;
    }
    case 'MONTHLY': {
      const idx = (start.y * 12 + start.m - 1) + i * rule.interval;
      const y = Math.floor(idx / 12), m = (idx % 12) + 1;
      if (rule.bymonth && !rule.bymonth.includes(m)) return [];
      c = monthDays(y, m, rule, start);
      break;
    }
    case 'YEARLY': {
      const y = start.y + i * rule.interval;
      if (rule.bymonth) {
        for (const m of [...rule.bymonth].sort((a, b) => a - b)) {
          const r2 = (rule.byday || rule.bymonthday) ? rule : { ...rule, bymonthday: [start.d] };
          c.push(...monthDays(y, m, r2, start));
        }
      } else if (rule.byday && !rule.bymonthday) {
        // nth weekday of the year (rare)
        const first = dayNum(y, 1, 1), last = dayNum(y, 12, 31);
        for (const { n, wd } of rule.byday) {
          const all = [];
          for (let dn = first; dn <= last; dn++) if (weekday(dn) === wd) all.push(dn);
          if (!n) c.push(...all);
          else { const p = n > 0 ? all[n - 1] : all[all.length + n]; if (p != null) c.push(p); }
        }
      } else if (rule.bymonthday) {
        c = monthDays(y, start.m, rule, start);
      } else if (start.d <= daysInMonth(y, start.m)) {
        c = [dayNum(y, start.m, start.d)];
      }
      c = [...new Set(c)].sort((a, b) => a - b);
      break;
    }
    default:
      return [];
  }
  return applySetPos(c, rule);
}

// ---- main entry ----
/**
 * Expand an ICS document into event instances overlapping [from, to] (inclusive dates, user zone).
 * @returns {Array<{id,cal,title,start,end,allDay,location}>}
 */
export function expandIcs(text, { from, to, tz, cal = '' }) {
  const fromD = parseYmd(from), toD = parseYmd(to);
  if (!fromD || !toD) throw new Error('from/to must be YYYY-MM-DD');
  const rangeStartDn = dayNum(fromD.y, fromD.m, fromD.d);
  const rangeEndDn = dayNum(toD.y, toD.m, toD.d) + 1; // exclusive
  const rangeStart = localToUtc(fromD.y, fromD.m, fromD.d, 0, 0, 0, tz);
  const rangeEnd = localToUtc(toD.y, toD.m, toD.d + 1, 0, 0, 0, tz);

  const raw = parseEvents(text);
  const masters = [];
  const overrides = new Map(); // uid → [{key, dn, ev}]

  for (const p of raw) {
    const first = (n) => p[n]?.[0];
    const uid = first('UID')?.value?.trim() || `noid-${masters.length}-${first('DTSTART')?.value}`;
    const start = parseDateValue(first('DTSTART'), tz);
    if (!start) continue;
    let end = parseDateValue(first('DTEND'), tz);
    const dur = parseDuration(first('DURATION')?.value);
    let durMs = 0, durDays = 1;
    if (start.allDay) {
      if (end?.allDay) durDays = Math.max(1, end.dn - start.dn);
      else if (dur) durDays = Math.max(1, dur.days || Math.round(dur.ms / 86400000));
    } else if (end && !end.allDay) durMs = Math.max(0, end.utc - start.utc);
    else if (dur) durMs = Math.max(0, dur.ms);
    else if (end?.allDay) durMs = Math.max(0, localToUtc(end.y, end.m, end.d, 0, 0, 0, tz) - start.utc);

    const ev = {
      uid,
      title: unescapeText(first('SUMMARY')?.value || '(No title)'),
      location: unescapeText(first('LOCATION')?.value || ''),
      cancelled: (first('STATUS')?.value || '').trim().toUpperCase() === 'CANCELLED',
      start, durMs, durDays,
      rrule: parseRRule(first('RRULE')?.value),
      exdates: [],
      rdates: [],
    };
    for (const ex of p.EXDATE || []) {
      for (const v of ex.value.split(',')) {
        const d = parseDateValue(ex, start.tz || tz, v);
        if (d) ev.exdates.push(d);
      }
    }
    for (const rd of p.RDATE || []) {
      for (const v of rd.value.split(',')) {
        const d = parseDateValue(rd, start.tz || tz, v);
        if (d) ev.rdates.push(d);
      }
    }
    const rid = first('RECURRENCE-ID');
    if (rid) {
      const r = parseDateValue(rid, start.tz || tz);
      if (r) {
        if (!overrides.has(uid)) overrides.set(uid, []);
        overrides.get(uid).push({ rid: r, ev });
        continue;
      }
    }
    masters.push(ev);
  }

  const out = [];
  const budget = { left: FEED_BUDGET };
  const emit = (ev, inst, recurring) => {
    if (out.length >= MAX_INSTANCES || ev.cancelled) return;
    if (inst.allDay) {
      const endDn = inst.dn + ev.durDays;
      if (!(inst.dn < rangeEndDn && endDn > rangeStartDn)) return;
      out.push({
        id: recurring ? `${ev.uid}_${fmtDate(fromDayNum(inst.dn))}` : ev.uid,
        cal, title: ev.title, allDay: true,
        start: fmtDate(fromDayNum(inst.dn)),
        end: fmtDate(fromDayNum(endDn)), // exclusive (iCal convention)
        location: ev.location,
      });
    } else {
      const endUtc = inst.utc + ev.durMs;
      const overlaps = ev.durMs > 0
        ? inst.utc < rangeEnd && endUtc > rangeStart
        : inst.utc >= rangeStart && inst.utc < rangeEnd;
      if (!overlaps) return;
      out.push({
        id: recurring ? `${ev.uid}_${new Date(inst.utc).toISOString().replace(/[-:]|\.\d+/g, '')}` : ev.uid,
        cal, title: ev.title, allDay: false,
        start: fmtLocal(utcToLocal(inst.utc, tz)),
        end: fmtLocal(utcToLocal(endUtc, tz)),
        location: ev.location,
      });
    }
  };

  for (const ev of masters) {
    if (ev.cancelled) continue;
    const ovs = overrides.get(ev.uid) || [];
    const dnOf = (x) => (x.allDay ? x.dn : dayNumOfUtc(x.utc, ev.start.tz || tz));
    const same = (a, b) => (a.allDay || b.allDay ? dnOf(a) === dnOf(b) : a.utc === b.utc);
    const isOverridden = (inst) => ovs.some(({ rid }) => same(inst, rid));
    const excluded = (inst) => ev.exdates.some((x) => same(inst, x));

    if (!ev.rrule && !ev.rdates.length) {
      if (!isOverridden(ev.start)) emit(ev, ev.start, false);
      continue;
    }
    for (const inst of expandRule(ev, rangeEnd, rangeEndDn, rangeStartDn, budget)) {
      if (out.length >= MAX_INSTANCES) break;
      if (excluded(inst) || isOverridden(inst)) continue;
      emit(ev, inst, true);
    }
  }
  // Overrides (moved/edited instances) are emitted as their own events.
  for (const [uid, list] of overrides) {
    for (const { rid, ev } of list) {
      const id = rid.allDay ? `${uid}_${fmtDate(rid)}` : `${uid}_${new Date(rid.utc).toISOString().replace(/[-:]|\.\d+/g, '')}`;
      const before = out.length;
      emit(ev, ev.start, false);
      if (out.length > before) out[out.length - 1].id = id;
    }
  }
  out.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return out;
}

// Generator of instances {allDay, dn} or {utc} in chronological order until past range end.
// First period worth generating for a rule with no COUNT: periods that end well before the range can't
// produce visible instances, so an old daily rule doesn't walk years of days one by one. (With COUNT,
// every instance from DTSTART must be counted, so no skipping.)
function firstPeriod(rule, st, rangeStartDn, spanDays) {
  if (rule.count != null) return 0;
  const target = rangeStartDn - spanDays - 2;   // an instance starting here could still overlap the range
  if (target <= st.dn) return 0;
  const t = fromDayNum(target);
  let i;
  switch (rule.freq) {
    case 'DAILY': i = Math.floor((target - st.dn) / rule.interval); break;
    case 'WEEKLY': i = Math.floor((target - st.dn) / (7 * rule.interval)) - 1; break;
    case 'MONTHLY': i = Math.floor(((t.y * 12 + t.m) - (st.y * 12 + st.m) - 1) / rule.interval); break;
    case 'YEARLY': i = Math.floor((t.y - st.y - 1) / rule.interval); break;
    default: i = 0;
  }
  return Math.max(0, i);
}

function* expandRule(ev, rangeEnd, rangeEndDn, rangeStartDn = -Infinity, budget = { left: Infinity }) {
  const s = ev.start;
  const rule = ev.rrule;
  const startDn = s.allDay ? s.dn : dayNum(s.y, s.m, s.d);
  const st = { ...s, dn: startDn };
  const mk = (dn) => {
    if (s.allDay) return { allDay: true, dn };
    const dt = fromDayNum(dn);
    return { allDay: false, utc: localToUtc(dt.y, dt.m, dt.d, s.h, s.mi, s.s, s.tz) };
  };
  const past = (inst) => (inst.allDay ? inst.dn >= rangeEndDn : inst.utc >= rangeEnd);

  let until = null;
  if (rule?.until) {
    const u = parseDateValue({ value: rule.until, params: {} }, s.tz || 'UTC');
    if (u) until = u;
  }
  const afterUntil = (inst) => {
    if (!until) return false;
    if (until.allDay || inst.allDay) {
      const dn = inst.allDay ? inst.dn : dayNumOfUtc(inst.utc, s.tz);
      const udn = until.allDay ? until.dn : dayNumOfUtc(until.utc, s.tz);
      return dn > udn;
    }
    return inst.utc > until.utc;
  };

  // Merge RDATEs (simple: yielded in order alongside rule instances).
  const rdates = ev.rdates
    .map((r) => (s.allDay ? { allDay: true, dn: r.allDay ? r.dn : dayNumOfUtc(r.utc, s.tz) } : r.allDay ? mk(r.dn) : { allDay: false, utc: r.utc }))
    .sort((a, b) => (a.utc ?? a.dn) - (b.utc ?? b.dn));
  const key = (i) => (i.allDay ? i.dn : i.utc);
  const seen = new Set();
  let ri = 0;
  function* flushRdates(upTo) {
    while (ri < rdates.length && (upTo == null || key(rdates[ri]) <= upTo)) {
      const r = rdates[ri++];
      if (!seen.has(key(r))) { seen.add(key(r)); yield r; }
    }
  }

  let count = 0;
  const first = mk(startDn);
  // DTSTART is always the first instance.
  seen.add(key(first));
  count++;
  yield* flushRdates(key(first) - 1);
  yield first;
  if (!rule) { yield* flushRdates(null); return; }
  if (rule.count != null && count >= rule.count) { yield* flushRdates(null); return; }

  const spanDays = s.allDay ? ev.durDays : Math.ceil(ev.durMs / 86400000) + 1;
  const i0 = Number.isFinite(rangeStartDn) ? firstPeriod(rule, st, rangeStartDn, spanDays) : 0;
  for (let i = i0; i < i0 + MAX_ITER && budget.left-- > 0; i++) {
    const cands = periodCandidates(rule, i, st);
    let stop = false;
    for (const dn of cands) {
      if (dn < startDn) continue;
      const inst = mk(dn);
      if (seen.has(key(inst))) continue;
      if (afterUntil(inst)) { stop = true; break; }
      if (past(inst)) { stop = true; break; }
      seen.add(key(inst));
      count++;
      yield* flushRdates(key(inst));
      yield inst;
      if (rule.count != null && count >= rule.count) { stop = true; break; }
    }
    if (stop) break;
    // safety: an empty period that starts beyond the range end ends iteration
    if (!cands.length && periodStartDn(rule, i, st) > rangeEndDn) break;
  }
  yield* flushRdates(null);
}

function periodStartDn(rule, i, st) {
  switch (rule.freq) {
    case 'DAILY': return st.dn + i * rule.interval;
    case 'WEEKLY': return st.dn + i * 7 * rule.interval - 7;
    case 'MONTHLY': {
      const idx = (st.y * 12 + st.m - 1) + i * rule.interval;
      return dayNum(Math.floor(idx / 12), (idx % 12) + 1, 1);
    }
    default: return dayNum(st.y + i * rule.interval, 1, 1);
  }
}

function dayNumOfUtc(utc, tz) {
  const l = utcToLocal(utc, tz || 'UTC');
  return dayNum(l.y, l.m, l.d);
}
