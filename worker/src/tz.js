// Time zone helpers built on Intl.DateTimeFormat. All "local" values are wall-clock parts.

// Windows (Outlook/Exchange) time zone names → IANA. Covers the common ~50.
export const WINDOWS_TZ = {
  'Dateline Standard Time': 'Etc/GMT+12',
  'UTC-11': 'Etc/GMT+11',
  'Hawaiian Standard Time': 'Pacific/Honolulu',
  'Alaskan Standard Time': 'America/Anchorage',
  'Pacific Standard Time': 'America/Los_Angeles',
  'Pacific Standard Time (Mexico)': 'America/Tijuana',
  'US Mountain Standard Time': 'America/Phoenix',
  'Mountain Standard Time': 'America/Denver',
  'Mountain Standard Time (Mexico)': 'America/Mazatlan',
  'Central Standard Time': 'America/Chicago',
  'Central Standard Time (Mexico)': 'America/Mexico_City',
  'Canada Central Standard Time': 'America/Regina',
  'Central America Standard Time': 'America/Guatemala',
  'Eastern Standard Time': 'America/New_York',
  'US Eastern Standard Time': 'America/Indiana/Indianapolis',
  'Eastern Standard Time (Mexico)': 'America/Cancun',
  'SA Pacific Standard Time': 'America/Bogota',
  'Atlantic Standard Time': 'America/Halifax',
  'Venezuela Standard Time': 'America/Caracas',
  'SA Western Standard Time': 'America/La_Paz',
  'Pacific SA Standard Time': 'America/Santiago',
  'Newfoundland Standard Time': 'America/St_Johns',
  'E. South America Standard Time': 'America/Sao_Paulo',
  'Argentina Standard Time': 'America/Argentina/Buenos_Aires',
  'Greenland Standard Time': 'America/Godthab',
  'UTC': 'UTC',
  'Coordinated Universal Time': 'UTC',
  'GMT Standard Time': 'Europe/London',
  'Greenwich Standard Time': 'Atlantic/Reykjavik',
  'W. Europe Standard Time': 'Europe/Berlin',
  'Central Europe Standard Time': 'Europe/Budapest',
  'Romance Standard Time': 'Europe/Paris',
  'Central European Standard Time': 'Europe/Warsaw',
  'W. Central Africa Standard Time': 'Africa/Lagos',
  'GTB Standard Time': 'Europe/Bucharest',
  'FLE Standard Time': 'Europe/Kiev',
  'E. Europe Standard Time': 'Europe/Chisinau',
  'Egypt Standard Time': 'Africa/Cairo',
  'South Africa Standard Time': 'Africa/Johannesburg',
  'Israel Standard Time': 'Asia/Jerusalem',
  'Turkey Standard Time': 'Europe/Istanbul',
  'Arabic Standard Time': 'Asia/Baghdad',
  'Arab Standard Time': 'Asia/Riyadh',
  'Russian Standard Time': 'Europe/Moscow',
  'E. Africa Standard Time': 'Africa/Nairobi',
  'Iran Standard Time': 'Asia/Tehran',
  'Arabian Standard Time': 'Asia/Dubai',
  'Afghanistan Standard Time': 'Asia/Kabul',
  'Pakistan Standard Time': 'Asia/Karachi',
  'West Asia Standard Time': 'Asia/Tashkent',
  'India Standard Time': 'Asia/Kolkata',
  'Sri Lanka Standard Time': 'Asia/Colombo',
  'Nepal Standard Time': 'Asia/Kathmandu',
  'Bangladesh Standard Time': 'Asia/Dhaka',
  'SE Asia Standard Time': 'Asia/Bangkok',
  'China Standard Time': 'Asia/Shanghai',
  'Singapore Standard Time': 'Asia/Singapore',
  'W. Australia Standard Time': 'Australia/Perth',
  'Taipei Standard Time': 'Asia/Taipei',
  'Tokyo Standard Time': 'Asia/Tokyo',
  'Korea Standard Time': 'Asia/Seoul',
  'Cen. Australia Standard Time': 'Australia/Adelaide',
  'AUS Central Standard Time': 'Australia/Darwin',
  'E. Australia Standard Time': 'Australia/Brisbane',
  'AUS Eastern Standard Time': 'Australia/Sydney',
  'Tasmania Standard Time': 'Australia/Hobart',
  'New Zealand Standard Time': 'Pacific/Auckland',
};

const fmtCache = new Map();
function formatter(tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    fmtCache.set(tz, f);
  }
  return f;
}

export function isValidTz(tz) {
  try { formatter(tz); return true; } catch { return false; }
}

// Map an ICS TZID (IANA, Windows name, "/mozilla.org/..." prefix, quoted) → IANA, or null.
export function resolveTz(tzid) {
  if (!tzid) return null;
  let t = String(tzid).trim().replace(/^"|"$/g, '');
  if (WINDOWS_TZ[t]) return WINDOWS_TZ[t];
  const m = t.match(/([A-Za-z_]+\/[A-Za-z_+\-0-9]+(?:\/[A-Za-z_+\-0-9]+)?)$/); // strip vendor prefixes
  if (isValidTz(t)) return t;
  if (m && isValidTz(m[1])) return m[1];
  if (/^(GMT|UTC|Z)$/i.test(t)) return 'UTC';
  // "(UTC-05:00) Eastern Time (US & Canada)" style names
  const lower = t.toLowerCase();
  if (lower.includes('eastern time')) return 'America/New_York';
  if (lower.includes('central time')) return 'America/Chicago';
  if (lower.includes('mountain time')) return 'America/Denver';
  if (lower.includes('pacific time')) return 'America/Los_Angeles';
  return null;
}

// Reverse lookup (IANA → Windows) for Graph's Prefer: outlook.timezone header.
export function ianaToWindows(tz) {
  for (const [w, i] of Object.entries(WINDOWS_TZ)) if (i === tz) return w;
  return tz;
}

// Wall-clock parts of a UTC instant in a zone.
export function utcToLocal(ms, tz) {
  const parts = {};
  for (const p of formatter(tz).formatToParts(new Date(ms))) parts[p.type] = p.value;
  return {
    y: +parts.year, m: +parts.month, d: +parts.day,
    h: +parts.hour % 24, mi: +parts.minute, s: +parts.second,
  };
}

// Offset (ms) of a zone at a UTC instant: local - utc.
export function tzOffset(ms, tz) {
  const l = utcToLocal(ms, tz);
  return Date.UTC(l.y, l.m - 1, l.d, l.h, l.mi, l.s) - Math.floor(ms / 1000) * 1000;
}

// Wall-clock in a zone → UTC ms. Gap times (spring forward) shift forward; ambiguous pick the first.
export function localToUtc(y, m, d, h = 0, mi = 0, s = 0, tz = 'UTC') {
  const guess = Date.UTC(y, m - 1, d, h, mi, s);
  if (tz === 'UTC') return guess;
  const o1 = tzOffset(guess - 0, tz);
  let t = guess - o1;
  const o2 = tzOffset(t, tz);
  if (o2 !== o1) {
    const t2 = guess - o2;
    // Choose the candidate that round-trips; otherwise (gap) the later one.
    t = tzOffset(t2, tz) === o2 ? t2 : Math.max(t, t2);
  }
  return t;
}

// ---- civil day numbers (days since 1970-01-01) ----
export const dayNum = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000);
export function fromDayNum(n) {
  const dt = new Date(n * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}
export const weekday = (n) => ((n % 7) + 7 + 4) % 7; // 0 = Sunday (1970-01-01 was Thursday)
export const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

const p2 = (n) => String(n).padStart(2, '0');
export const fmtDate = ({ y, m, d }) => `${y}-${p2(m)}-${p2(d)}`;
export const fmtLocal = (l) => `${fmtDate(l)}T${p2(l.h)}:${p2(l.mi)}`;

export function parseYmd(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

// Today's civil date in a zone.
export const todayIn = (tz, now = Date.now()) => fmtDate(utcToLocal(now, tz));
