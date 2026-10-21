// Life — home-screen widget for the Scriptable app (iOS).
// Setup: install Scriptable, create a new script, paste this file, set the two constants,
// then add a Scriptable widget (small, medium or large) to your Home Screen and choose this script.
// The Life app sends a small summary to your server every few minutes while you use it; this script reads it.

const WORKER_URL = 'https://life-sync.YOUR-SUBDOMAIN.workers.dev';
const LIFE_KEY = 'PASTE-YOUR-LIFE-KEY-HERE';
const APP_URL = 'https://ishirj.github.io/life/';

const C = {
  bg: new Color('#161513'),
  bg2: new Color('#201E1B'),
  ink: new Color('#F2EDE3'),
  muted: new Color('#F2EDE3', 0.55),
  faint: new Color('#F2EDE3', 0.12),
  accent: new Color('#F06D44'),
  sage: new Color('#86CFA0'),
  blue: new Color('#6FC3F0'),
};

// Written without backticks or double pipes so it survives copy-paste on iPhone.
function or(a, b) { return a ? a : b; }

async function load() {
  // the key goes in a header, not the address, so it never ends up in logs
  const req = new Request(WORKER_URL.replace(/\/+$/, '') + '/widget');
  req.headers = { 'X-Life-Key': LIFE_KEY };
  req.timeoutInterval = 10;
  const data = await req.loadJSON();
  if (req.response && req.response.statusCode >= 400) throw new Error(or(data && data.error, 'HTTP ' + req.response.statusCode));
  return or(data, {});
}

const num = (n) => (n == null ? null : isNaN(Number(n)) ? null : Number(n));
const fmtNum = (n) => (num(n) == null ? '–' : Math.round(num(n)).toLocaleString());
const fmtK = (n) => (num(n) == null ? '–' : num(n) >= 10000 ? (num(n) / 1000).toFixed(1) + 'k' : fmtNum(n));

// "14:05" → "2:05 PM"; "Tue 14:05" → "Tue 2:05 PM"; ISO → time
function fmtTime(t) {
  if (!t) return '';
  const m = /^(?:(\w{3}) )?(\d{1,2}):(\d{2})$/.exec(String(t));
  if (m) {
    const h = +m[2], ap = h < 12 ? 'AM' : 'PM', h12 = or(h % 12, 12);
    return (m[1] ? m[1] + ' ' : '') + h12 + ':' + m[3] + ' ' + ap;
  }
  const d = new Date(t);
  if (isNaN(d)) return String(t);
  const f = new DateFormatter();
  f.useShortTimeStyle();
  f.useNoDateStyle();
  return f.string(d);
}

function txt(stack, str, size, color, style, lines) {
  const t = stack.addText(String(str));
  t.font = style === 'num' ? Font.boldRoundedSystemFont(size)
    : style === 'bold' ? Font.semiboldSystemFont(size)
    : style === 'cap' ? Font.semiboldSystemFont(size)
    : Font.systemFont(size);
  t.textColor = color;
  t.lineLimit = or(lines, 1);
  t.minimumScaleFactor = 0.7;
  return t;
}

// thin rounded progress bar as an image (stacks can't draw bars themselves)
function bar(stack, frac, width, color) {
  const h = 6, dc = new DrawContext();
  dc.size = new Size(width, h);
  dc.opaque = false;
  dc.respectScreenScale = true;
  const track = new Path();
  track.addRoundedRect(new Rect(0, 0, width, h), h / 2, h / 2);
  dc.addPath(track);
  dc.setFillColor(C.faint);
  dc.fillPath();
  const f = Math.max(0, Math.min(1, or(frac, 0)));
  if (f > 0) {
    const p = new Path();
    p.addRoundedRect(new Rect(0, 0, Math.max(h, width * f), h), h / 2, h / 2);
    dc.addPath(p);
    dc.setFillColor(color);
    dc.fillPath();
  }
  const img = stack.addImage(dc.getImage());
  img.imageSize = new Size(width, h);
  return img;
}

function header(w, data) {
  const r = w.addStack();
  r.centerAlignContent();
  txt(r, 'LIFE', 10, C.accent, 'cap');
  r.addSpacer();
  const ts = or(data.updated, data._updated);
  if (ts) {
    const f = new DateFormatter();
    f.useShortTimeStyle();
    f.useNoDateStyle();
    txt(r, f.string(new Date(ts)), 9, C.muted);
  }
}

// calories block: big number + bar + protein bar
function foodBlock(parent, data, width, bigSize, compact) {
  const s = parent.addStack();
  s.layoutVertically();
  const left = num(data.kcalLeft), goal = num(or(data.kcalGoal, data.kcalTarget)), eaten = num(data.kcal);
  const over = left != null && left < 0;
  txt(s, over ? 'KCAL OVER' : 'KCAL LEFT', 9, C.muted, 'cap');
  txt(s, left == null ? '–' : fmtNum(Math.abs(left)), bigSize, over ? C.accent : C.ink, 'num');
  s.addSpacer(4);
  bar(s, goal ? (eaten != null ? eaten : goal - or(left, 0)) / goal : 0, width, C.accent);
  s.addSpacer(6);
  const pr = s.addStack();
  pr.centerAlignContent();
  txt(pr, 'Protein', 10, C.muted);
  pr.addSpacer();
  const pg = or(data.proteinGoal, data.proteinTarget);
  txt(pr, fmtNum(data.protein) + (pg ? ' / ' + fmtNum(pg) : '') + ' g', 10, C.ink, 'bold');
  if (compact) return s;
  s.addSpacer(3);
  bar(s, pg ? num(data.protein) / num(pg) : 0, width, C.sage);
  return s;
}

function nextBlock(parent, data, lines) {
  const s = parent.addStack();
  s.layoutVertically();
  const ev = data.nextEvent;
  txt(s, 'NEXT', 9, C.muted, 'cap');
  s.addSpacer(2);
  if (ev && ev.title) {
    txt(s, ev.title, 14, C.ink, 'bold', or(lines, 2));
    s.addSpacer(2);
    txt(s, fmtTime(ev.time), 11, C.accent, 'bold');
  } else {
    txt(s, 'Nothing else today', 13, C.muted, null, 2);
  }
  return s;
}

function statsRow(parent, data) {
  const r = parent.addStack();
  r.centerAlignContent();
  const items = [];
  if (data.due != null) items.push([fmtNum(data.due), 'due', data.due > 0 ? C.accent : C.ink]);
  if (data.steps != null) items.push([fmtK(data.steps), 'steps', C.ink]);
  if (data.sleepMin != null) items.push([(data.sleepMin / 60).toFixed(1) + 'h', 'sleep', C.ink]);
  items.slice(0, 3).forEach(([v, l, col], i) => {
    if (i) r.addSpacer(10);
    txt(r, v, 12, col, 'num');
    r.addSpacer(3);
    txt(r, l, 11, C.muted);
  });
  return r;
}


// next bus: minutes from now (worked out when the widget draws, so it stays right between refreshes)
function busInfo(data) {
  const b = data.bus;
  if (!b || !Array.isArray(b.deps)) return null;
  const now = Date.now();
  const deps = b.deps.map((t) => Date.parse(t)).filter((t) => t > now - 30000);
  if (!deps.length) return { route: b.route, name: b.name, none: true };
  return { route: b.route, name: b.name, at: deps[0], min: Math.max(0, Math.round((deps[0] - now) / 60000)), then: deps[1] };
}
function busText(bi, short) {
  if (!bi) return '';
  if (bi.none) return bi.route + ' · none listed';
  return bi.route + ' ' + (bi.min === 0 ? 'now' : bi.min + 'm') + (short ? '' : ' · ' + fmtTime(new Date(bi.at).toISOString()));
}
function urgentLine(parent, data, size) {
  const u = data.urgent;
  if (!u || !u.title) return;
  const r = parent.addStack();
  r.centerAlignContent();
  txt(r, '!'.repeat(Math.max(1, Math.min(3, u.level || 1))) + ' ', size, u.level >= 3 ? new Color('#FF3B30') : C.accent, 'bold');
  txt(r, u.title, size, C.ink, 'bold');
}
function busLine(parent, data, size) {
  const bi = busInfo(data);
  if (!bi) return;
  const r = parent.addStack();
  r.centerAlignContent();
  txt(r, '🚌 ', size, C.ink);
  txt(r, busText(bi), size, bi.min != null && bi.min <= 5 ? C.accent : C.sage, 'bold');
  if (bi.name) { r.addSpacer(6); txt(r, bi.name, size - 1, C.muted); }
}

// lock-screen widgets (iOS 16+): rectangular, inline, circular
function lockWidget(data, family) {
  const w = new ListWidget();
  w.url = APP_URL;
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
  const bi = busInfo(data), u = data.urgent;
  if (family === 'accessoryInline') {
    const parts = [];
    if (bi) parts.push(busText(bi, true));
    if (u && u.title) parts.push('!'.repeat(u.level || 1) + ' ' + u.title);
    else if (num(data.kcalLeft) != null) parts.push(fmtNum(data.kcalLeft) + ' kcal left');
    w.addText(parts.join(' · ') || 'Life');
    return w;
  }
  if (family === 'accessoryCircular') {
    const s = w.addStack(); s.layoutVertically(); s.centerAlignContent();
    const t1 = s.addText(bi && !bi.none ? (bi.min === 0 ? 'now' : String(bi.min)) : '–'); t1.font = Font.boldRoundedSystemFont(20); t1.centerAlignText();
    const t2 = s.addText(bi ? bi.route : 'bus'); t2.font = Font.semiboldSystemFont(10); t2.centerAlignText();
    return w;
  }
  // rectangular
  const a = w.addText(bi ? '🚌 ' + busText(bi) : 'No bus stop set'); a.font = Font.semiboldSystemFont(13); a.lineLimit = 1;
  if (u && u.title) { const b = w.addText('!'.repeat(u.level || 1) + ' ' + u.title); b.font = Font.boldSystemFont(13); b.lineLimit = 1; }
  const c = w.addText((num(data.kcalLeft) != null ? fmtNum(data.kcalLeft) + ' kcal left' : '') + (data.due ? ' · ' + data.due + ' due' : '')); c.font = Font.systemFont(11); c.lineLimit = 1;
  return w;
}

function build(data, family) {
  if (String(family).indexOf('accessory') === 0) return lockWidget(data, family);
  const w = new ListWidget();
  const g = new LinearGradient();
  g.colors = [C.bg2, C.bg];
  g.locations = [0, 1];
  w.backgroundGradient = g;
  w.url = APP_URL;
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  if (family === 'small') {
    w.setPadding(14, 14, 14, 14);
    header(w, data);
    w.addSpacer(6);
    foodBlock(w, data, 127, 30, true);
    w.addSpacer();
    if (data.urgent && data.urgent.title) urgentLine(w, data, 11);
    else {
      const ev = data.nextEvent;
      if (ev && ev.title) {
        txt(w, ev.title, 11, C.ink, 'bold');
        txt(w, fmtTime(ev.time), 10, C.accent, 'bold');
      } else if (data.due != null) {
        txt(w, fmtNum(data.due) + ' due today', 11, data.due ? C.accent : C.muted, 'bold');
      }
    }
    busLine(w, data, 10);
    w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);
    return w;
  }

  // medium and large share the top row
  w.setPadding(14, 16, 14, 16);
  header(w, data);
  w.addSpacer(8);
  const top = w.addStack();
  top.topAlignContent();
  foodBlock(top, data, 132, 32);
  top.addSpacer(16);
  const right = top.addStack();
  right.layoutVertically();
  nextBlock(right, data, family === 'large' ? 2 : 2);
  right.addSpacer();
  w.addSpacer();
  statsRow(w, data);
  w.addSpacer(4);
  busLine(w, data, 11);
  urgentLine(w, data, 11);
  w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);

  if (family === 'large') {
    w.addSpacer(12);
    const divider = w.addStack();
    bar(divider, 0, 290, C.faint);
    w.addSpacer(10);
    txt(w, 'TODAY', 9, C.muted, 'cap');
    w.addSpacer(6);
    const evs = Array.isArray(data.events) ? data.events.slice(0, 5) : [];
    if (!evs.length) txt(w, 'No more classes or meetings today', 12, C.muted);
    for (const e of evs) {
      const r = w.addStack();
      r.centerAlignContent();
      const tcol = r.addStack();
      tcol.size = new Size(64, 0);
      txt(tcol, fmtTime(e.time), 11, C.accent, 'bold');
      r.addSpacer(8);
      txt(r, e.title, 13, C.ink);
      r.addSpacer();
      w.addSpacer(6);
    }
    w.addSpacer();
  }
  return w;
}

function errorWidget(msg) {
  const w = new ListWidget();
  w.backgroundColor = C.bg;
  w.url = APP_URL;
  w.setPadding(14, 14, 14, 14);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  txt(w, 'LIFE', 10, C.accent, 'cap');
  w.addSpacer(6);
  txt(w, 'Couldn’t load', 14, C.ink, 'bold');
  w.addSpacer(2);
  txt(w, String(or(msg, 'Check WORKER_URL and LIFE_KEY at the top of the script.')), 11, C.muted, null, 4);
  return w;
}

const family = config.runsInWidget ? or(config.widgetFamily, 'small') : 'medium';
let widget;
try {
  widget = build(await load(), family);
} catch (e) {
  widget = errorWidget(e.message);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}
Script.complete();
