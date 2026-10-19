// Life — home-screen widget for the Scriptable app (iOS).
// Setup: install Scriptable, create a new script, paste this file, set the two constants,
// then add a Scriptable widget to your home screen and choose this script.
// The Life app pushes a small summary to the worker (PUT /widget); this script reads it.

const WORKER_URL = 'https://life-sync.YOUR-SUBDOMAIN.workers.dev';
const LIFE_KEY = 'PASTE-YOUR-LIFE-KEY-HERE';
const APP_URL = 'https://ishirj.github.io/life/';

const BG = new Color('#131311');
const ACCENT = new Color('#D9552E');
const CREAM = new Color('#F2EDE3');
const MUTED = new Color('#F2EDE3', 0.55);

// Expected summary fields (all optional):
// { kcalLeft, kcalTarget, protein, proteinTarget, steps, due,
//   nextEvent: { title, time }   // time: "HH:MM" or ISO string
// }
async function load() {
  const req = new Request(`${WORKER_URL.replace(/\/+$/, '')}/widget?k=${encodeURIComponent(LIFE_KEY)}`);
  req.timeoutInterval = 10;
  const data = await req.loadJSON();
  if (req.response && req.response.statusCode >= 400) {
    throw new Error(data && data.error ? data.error : `HTTP ${req.response.statusCode}`);
  }
  return data;
}

const fmtNum = (n) => (n == null || isNaN(Number(n)) ? '–' : Math.round(Number(n)).toLocaleString());

function fmtTime(t) {
  if (!t) return '';
  if (/^\d{1,2}:\d{2}$/.test(t)) return t;
  const d = new Date(t);
  if (isNaN(d)) return String(t);
  const f = new DateFormatter();
  f.dateFormat = 'HH:mm';
  return f.string(d);
}

function text(stack, str, size, color, weight) {
  const t = stack.addText(String(str));
  t.font = weight === 'bold' ? Font.boldSystemFont(size) : weight === 'mono' ? Font.boldMonospacedSystemFont(size) : Font.systemFont(size);
  t.textColor = color;
  t.lineLimit = 1;
  t.minimumScaleFactor = 0.6;
  return t;
}

function build(data, family) {
  const w = new ListWidget();
  w.backgroundColor = BG;
  w.url = APP_URL;
  w.setPadding(14, 14, 12, 14);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);

  const big = family !== 'small';
  text(w, 'KCAL LEFT', 10, MUTED, 'bold');
  text(w, fmtNum(data.kcalLeft), big ? 40 : 34, ACCENT, 'mono');
  if (data.protein != null) {
    text(w, `Protein ${fmtNum(data.protein)}${data.proteinTarget ? ' / ' + fmtNum(data.proteinTarget) : ''} g`, 12, CREAM);
  }
  w.addSpacer(6);

  if (data.nextEvent && data.nextEvent.title) {
    const row = w.addStack();
    row.centerAlignContent();
    text(row, fmtTime(data.nextEvent.time), 12, ACCENT, 'bold');
    row.addSpacer(6);
    text(row, data.nextEvent.title, 12, CREAM);
  }

  if (big) {
    const row = w.addStack();
    if (data.due != null) { text(row, `${fmtNum(data.due)} due`, 12, CREAM); row.addSpacer(12); }
    if (data.steps != null) text(row, `${fmtNum(data.steps)} steps`, 12, CREAM);
  } else if (data.due != null) {
    text(w, `${fmtNum(data.due)} due`, 11, CREAM);
  }

  if (family === 'large' && Array.isArray(data.events)) {
    w.addSpacer(8);
    for (const e of data.events.slice(0, 6)) {
      const r = w.addStack();
      text(r, fmtTime(e.time), 11, ACCENT, 'bold');
      r.addSpacer(6);
      text(r, e.title, 11, CREAM);
    }
  }

  w.addSpacer();
  const f = new DateFormatter();
  f.dateFormat = 'HH:mm';
  const ts = data._updated ? new Date(data._updated) : new Date();
  text(w, `updated ${f.string(ts)}`, 9, MUTED);
  return w;
}

function errorWidget(msg) {
  const w = new ListWidget();
  w.backgroundColor = BG;
  w.url = APP_URL;
  w.setPadding(14, 14, 14, 14);
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  text(w, 'Life', 16, ACCENT, 'bold');
  w.addSpacer(4);
  const t = w.addText(String(msg || 'Could not load'));
  t.font = Font.systemFont(11);
  t.textColor = MUTED;
  t.lineLimit = 3;
  return w;
}

const family = config.runsInWidget ? config.widgetFamily : 'medium';
let widget;
try {
  widget = build(await load(), family || 'small');
} catch (e) {
  widget = errorWidget(e.message);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}
Script.complete();
