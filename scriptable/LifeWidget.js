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

async function load() {
  const req = new Request(`${WORKER_URL.replace(/\/+$/, '')}/widget?k=${encodeURIComponent(LIFE_KEY)}`);
  req.timeoutInterval = 10;
  const data = await req.loadJSON();
  if (req.response && req.response.statusCode >= 400) throw new Error((data && data.error) || `HTTP ${req.response.statusCode}`);
  return data || {};
}

const num = (n) => (n == null || isNaN(Number(n)) ? null : Number(n));
const fmtNum = (n) => (num(n) == null ? '–' : Math.round(num(n)).toLocaleString());
const fmtK = (n) => (num(n) == null ? '–' : num(n) >= 10000 ? (num(n) / 1000).toFixed(1) + 'k' : fmtNum(n));

// "14:05" → "2:05 PM"; "Tue 14:05" → "Tue 2:05 PM"; ISO → time
function fmtTime(t) {
  if (!t) return '';
  const m = /^(?:(\w{3}) )?(\d{1,2}):(\d{2})$/.exec(String(t));
  if (m) {
    const h = +m[2], ap = h < 12 ? 'AM' : 'PM', h12 = h % 12 || 12;
    return `${m[1] ? m[1] + ' ' : ''}${h12}:${m[3]} ${ap}`;
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
  t.lineLimit = lines || 1;
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
  const f = Math.max(0, Math.min(1, frac || 0));
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
  const ts = data.updated || data._updated;
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
  const left = num(data.kcalLeft), goal = num(data.kcalGoal || data.kcalTarget), eaten = num(data.kcal);
  const over = left != null && left < 0;
  txt(s, over ? 'KCAL OVER' : 'KCAL LEFT', 9, C.muted, 'cap');
  txt(s, left == null ? '–' : fmtNum(Math.abs(left)), bigSize, over ? C.accent : C.ink, 'num');
  s.addSpacer(4);
  bar(s, goal ? (eaten != null ? eaten : goal - (left || 0)) / goal : 0, width, C.accent);
  s.addSpacer(6);
  const pr = s.addStack();
  pr.centerAlignContent();
  txt(pr, 'Protein', 10, C.muted);
  pr.addSpacer();
  txt(pr, `${fmtNum(data.protein)}${data.proteinGoal || data.proteinTarget ? ' / ' + fmtNum(data.proteinGoal || data.proteinTarget) : ''} g`, 10, C.ink, 'bold');
  if (compact) return s;
  s.addSpacer(3);
  bar(s, (data.proteinGoal || data.proteinTarget) ? num(data.protein) / num(data.proteinGoal || data.proteinTarget) : 0, width, C.sage);
  return s;
}

function nextBlock(parent, data, lines) {
  const s = parent.addStack();
  s.layoutVertically();
  const ev = data.nextEvent;
  txt(s, 'NEXT', 9, C.muted, 'cap');
  s.addSpacer(2);
  if (ev && ev.title) {
    txt(s, ev.title, 14, C.ink, 'bold', lines || 2);
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
  if (data.due != null) items.push([`${fmtNum(data.due)}`, 'due', data.due > 0 ? C.accent : C.ink]);
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

function build(data, family) {
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
    const ev = data.nextEvent;
    if (ev && ev.title) {
      txt(w, ev.title, 11, C.ink, 'bold');
      txt(w, fmtTime(ev.time), 10, C.accent, 'bold');
    } else if (data.due != null) {
      txt(w, `${fmtNum(data.due)} due today`, 11, data.due ? C.accent : C.muted, 'bold');
    }
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
  txt(w, String(msg || 'Check WORKER_URL and LIFE_KEY at the top of the script.'), 11, C.muted, null, 4);
  return w;
}

const family = config.runsInWidget ? (config.widgetFamily || 'small') : 'medium';
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
