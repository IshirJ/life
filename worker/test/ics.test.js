import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandIcs, unfold, parseLine, unescapeText } from '../src/ics.js';
import { localToUtc, resolveTz } from '../src/tz.js';

const TZ = 'America/New_York';
const crlf = (s) => s.trim().split('\n').map((l) => l.replace(/^\s{4}/, '')).join('\r\n');

// Outlook / Exchange published calendar (Windows TZIDs).
const OUTLOOK = crlf(`
    BEGIN:VCALENDAR
    METHOD:PUBLISH
    PRODID:Microsoft Exchange Server 2010
    VERSION:2.0
    X-WR-CALNAME:Calendar
    BEGIN:VTIMEZONE
    TZID:Eastern Standard Time
    BEGIN:STANDARD
    DTSTART:16010101T020000
    TZOFFSETFROM:-0400
    TZOFFSETTO:-0500
    RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=1SU;BYMONTH=11
    END:STANDARD
    BEGIN:DAYLIGHT
    DTSTART:16010101T020000
    TZOFFSETFROM:-0500
    TZOFFSETTO:-0400
    RRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=2SU;BYMONTH=3
    END:DAYLIGHT
    END:VTIMEZONE
    BEGIN:VEVENT
    DESCRIPTION:\\n
    RRULE:FREQ=WEEKLY;UNTIL=20261104T140000Z;INTERVAL=1;BYDAY=MO,WE,FR;WKST=SU
    EXDATE;TZID=Eastern Standard Time:20261023T100000
    UID:040000008200E00074C5B7101A82E00800000000ABC
    SUMMARY;LANGUAGE=en-US:ISE 4404 Lecture
    DTSTART;TZID=Eastern Standard Time:20261019T100000
    DTEND;TZID=Eastern Standard Time:20261019T105000
    CLASS:PUBLIC
    PRIORITY:5
    TRANSP:OPAQUE
    STATUS:CONFIRMED
    SEQUENCE:0
    LOCATION;LANGUAGE=en-US:Durham Hall 171\\, Blacksburg
    BEGIN:VALARM
    DESCRIPTION:REMINDER
    TRIGGER;RELATED=START:-PT15M
    ACTION:DISPLAY
    END:VALARM
    END:VEVENT
    BEGIN:VEVENT
    RECURRENCE-ID;TZID=Eastern Standard Time:20261021T100000
    UID:040000008200E00074C5B7101A82E00800000000ABC
    SUMMARY:ISE 4404 Lecture (moved)
    DTSTART;TZID=Eastern Standard Time:20261021T140000
    DTEND;TZID=Eastern Standard Time:20261021T145000
    LOCATION:Goodwin
      Hall 155
    END:VEVENT
    BEGIN:VEVENT
    UID:allday-1
    SUMMARY:Halloween
    DTSTART;VALUE=DATE:20261031
    DTEND;VALUE=DATE:20261101
    END:VEVENT
    BEGIN:VEVENT
    UID:cancelled-1
    SUMMARY:Cancelled thing
    STATUS:CANCELLED
    DTSTART;TZID=Pacific Standard Time:20261020T090000
    DTEND;TZID=Pacific Standard Time:20261020T100000
    END:VEVENT
    BEGIN:VEVENT
    UID:pst-1
    SUMMARY:West coast call
    DTSTART;TZID=Pacific Standard Time:20261020T090000
    DTEND;TZID=Pacific Standard Time:20261020T093000
    END:VEVENT
    BEGIN:VEVENT
    UID:dubai-1
    SUMMARY:Call with dad
    DTSTART;TZID=Arabian Standard Time:20261022T200000
    DTEND;TZID=Arabian Standard Time:20261022T203000
    END:VEVENT
    END:VCALENDAR
`);

// iCloud-style feed (IANA TZIDs, monthly BYDAY, UTC times, DURATION).
const ICLOUD = crlf(`
    BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//Apple Inc.//macOS 15.0//EN
    CALSCALE:GREGORIAN
    BEGIN:VTIMEZONE
    TZID:America/New_York
    BEGIN:DAYLIGHT
    TZOFFSETFROM:-0500
    RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
    DTSTART:20070311T020000
    TZNAME:EDT
    TZOFFSETTO:-0400
    END:DAYLIGHT
    BEGIN:STANDARD
    TZOFFSETFROM:-0400
    RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
    DTSTART:20071104T020000
    TZNAME:EST
    TZOFFSETTO:-0500
    END:STANDARD
    END:VTIMEZONE
    BEGIN:VEVENT
    UID:club-2tu
    DTSTART;TZID=America/New_York:20260908T180000
    DTEND;TZID=America/New_York:20260908T190000
    RRULE:FREQ=MONTHLY;BYDAY=2TU
    SUMMARY:Club meeting
    END:VEVENT
    BEGIN:VEVENT
    UID:rent-lastfri
    DTSTART;VALUE=DATE:20260130
    DTEND;VALUE=DATE:20260131
    RRULE:FREQ=MONTHLY;BYDAY=-1FR
    SUMMARY:Rent due
    END:VEVENT
    BEGIN:VEVENT
    UID:break
    DTSTART;VALUE=DATE:20261126
    DTEND;VALUE=DATE:20261129
    SUMMARY:Thanksgiving break\\, PR trip
    DESCRIPTION:Line1\\nLine2
    END:VEVENT
    BEGIN:VEVENT
    UID:utc-weekly
    DTSTART:20261023T140000Z
    DURATION:PT1H
    RRULE:FREQ=WEEKLY;COUNT=3
    SUMMARY:UTC-anchored weekly
    END:VEVENT
    BEGIN:VEVENT
    UID:local-daily
    DTSTART;TZID=America/New_York:20261030T083000
    DTEND;TZID=America/New_York:20261030T090000
    RRULE:FREQ=DAILY;INTERVAL=1;COUNT=5
    EXDATE;TZID=America/New_York:20261031T083000,20261102T083000
    SUMMARY:Morning run
    END:VEVENT
    BEGIN:VEVENT
    UID:floating
    DTSTART:20261105T120000
    DTEND:20261105T130000
    SUMMARY:Floating lunch
    END:VEVENT
    BEGIN:VEVENT
    UID:bymonthday
    DTSTART;VALUE=DATE:20260115
    RRULE:FREQ=MONTHLY;BYMONTHDAY=15,-1
    SUMMARY:Pay day
    END:VEVENT
    BEGIN:VEVENT
    UID:yearly-bday
    DTSTART;VALUE=DATE:20001104
    RRULE:FREQ=YEARLY
    SUMMARY:Birthday
    END:VEVENT
    END:VCALENDAR
`);

const byTitle = (evs, t) => evs.filter((e) => e.title === t);

test('line helpers', () => {
  assert.equal(unfold('A:abc\r\n def\r\n\tghi'), 'A:abcdefghi');
  const p = parseLine('DTSTART;TZID="America/New_York":20261019T100000');
  assert.equal(p.name, 'DTSTART');
  assert.equal(p.params.TZID, 'America/New_York');
  assert.equal(p.value, '20261019T100000');
  assert.equal(unescapeText('a\\, b\\; c\\nd\\\\e'), 'a, b; c\nd\\e');
  assert.equal(resolveTz('Eastern Standard Time'), 'America/New_York');
  assert.equal(resolveTz('/mozilla.org/20070129_1/America/Chicago'), 'America/Chicago');
  assert.equal(resolveTz('India Standard Time'), 'Asia/Kolkata');
});

test('Outlook: weekly BYDAY + UNTIL + EXDATE + RECURRENCE-ID across DST', () => {
  const evs = expandIcs(OUTLOOK, { from: '2026-10-19', to: '2026-11-13', tz: TZ, cal: 'school' });
  const lec = byTitle(evs, 'ISE 4404 Lecture');
  // Wed 21 is overridden, Fri 23 is EXDATE'd; Nov 2 is after DST ends but still 10:00 local.
  // UNTIL is 14:00Z = 09:00 EST on Nov 4, so the 10:00 EST Nov 4 instance is excluded.
  assert.deepEqual(lec.map((e) => e.start),
    ['2026-10-19T10:00', '2026-10-26T10:00', '2026-10-28T10:00', '2026-10-30T10:00', '2026-11-02T10:00']);
  assert.equal(lec[0].end, '2026-10-19T10:50');
  assert.equal(lec[0].location, 'Durham Hall 171, Blacksburg');
  assert.equal(lec[0].cal, 'school');
  assert.ok(lec[0].id.startsWith('040000008200E00074C5B7101A82E00800000000ABC_'));
  const moved = byTitle(evs, 'ISE 4404 Lecture (moved)');
  assert.equal(moved.length, 1);
  assert.equal(moved[0].start, '2026-10-21T14:00');
  assert.equal(moved[0].location, 'Goodwin Hall 155');
  assert.ok(!evs.some((e) => e.title === 'Cancelled thing'));
  const west = byTitle(evs, 'West coast call')[0];
  assert.equal(west.start, '2026-10-20T12:00'); // 09:00 PT → 12:00 ET
  const dad = byTitle(evs, 'Call with dad')[0];
  assert.equal(dad.start, '2026-10-22T12:00'); // 20:00 Dubai (UTC+4) → 12:00 EDT
  const hw = byTitle(evs, 'Halloween')[0];
  assert.deepEqual([hw.allDay, hw.start, hw.end], [true, '2026-10-31', '2026-11-01']);
  // sorted
  const starts = evs.map((e) => e.start);
  assert.deepEqual(starts, [...starts].sort());
});

test('iCloud: monthly 2TU / -1FR, all-day, UTC weekly across DST, EXDATE list, floating', () => {
  const evs = expandIcs(ICLOUD, { from: '2026-10-01', to: '2026-11-30', tz: TZ, cal: 'icloud' });
  assert.deepEqual(byTitle(evs, 'Club meeting').map((e) => e.start), ['2026-10-13T18:00', '2026-11-10T18:00']);
  assert.deepEqual(byTitle(evs, 'Rent due').map((e) => [e.start, e.end, e.allDay]),
    [['2026-10-30', '2026-10-31', true], ['2026-11-27', '2026-11-28', true]]);
  const br = byTitle(evs, 'Thanksgiving break, PR trip');
  assert.deepEqual([br[0].start, br[0].end], ['2026-11-26', '2026-11-29']);
  // UTC-anchored: 14:00Z is 10:00 EDT before Nov 1 and 09:00 EST after.
  assert.deepEqual(byTitle(evs, 'UTC-anchored weekly').map((e) => [e.start, e.end]),
    [['2026-10-23T10:00', '2026-10-23T11:00'], ['2026-10-30T10:00', '2026-10-30T11:00'], ['2026-11-06T09:00', '2026-11-06T10:00']]);
  // Daily COUNT=5 from Oct 30 (30,31,1,2,3) minus EXDATE 31 & Nov 2; Nov 1 is DST-end day.
  assert.deepEqual(byTitle(evs, 'Morning run').map((e) => e.start),
    ['2026-10-30T08:30', '2026-11-01T08:30', '2026-11-03T08:30']);
  assert.equal(byTitle(evs, 'Floating lunch')[0].start, '2026-11-05T12:00');
  assert.deepEqual(byTitle(evs, 'Pay day').map((e) => e.start), ['2026-10-15', '2026-10-31', '2026-11-15', '2026-11-30']);
  assert.deepEqual(byTitle(evs, 'Birthday').map((e) => e.start), ['2026-11-04']);
});

test('range filtering is inclusive of the "to" day and respects the zone', () => {
  const evs = expandIcs(ICLOUD, { from: '2026-11-06', to: '2026-11-06', tz: TZ });
  assert.deepEqual(evs.map((e) => e.title), ['UTC-anchored weekly']);
  // Same feed viewed from Dubai: 14:00Z → 18:00 local.
  const dxb = expandIcs(ICLOUD, { from: '2026-11-06', to: '2026-11-06', tz: 'Asia/Dubai' });
  assert.equal(dxb.find((e) => e.title === 'UTC-anchored weekly').start, '2026-11-06T18:00');
});

test('DST helpers: gap and overlap', () => {
  // 2026-03-08 02:30 does not exist in New York → shifted to 03:30 EDT (07:30Z)
  assert.equal(new Date(localToUtc(2026, 3, 8, 2, 30, 0, TZ)).toISOString(), '2026-03-08T07:30:00.000Z');
  // 2026-11-01 01:30 is ambiguous → first (EDT, 05:30Z)
  assert.equal(new Date(localToUtc(2026, 11, 1, 1, 30, 0, TZ)).toISOString(), '2026-11-01T05:30:00.000Z');
  assert.equal(new Date(localToUtc(2026, 11, 2, 9, 0, 0, TZ)).toISOString(), '2026-11-02T14:00:00.000Z');
});

test('instance cap and unbounded daily rule terminate', () => {
  const ics = crlf(`
    BEGIN:VCALENDAR
    BEGIN:VEVENT
    UID:x
    DTSTART:20000101T120000Z
    RRULE:FREQ=DAILY
    SUMMARY:Daily since 2000
    END:VEVENT
    END:VCALENDAR
  `);
  const evs = expandIcs(ics, { from: '2026-01-01', to: '2036-12-31', tz: 'UTC' });
  assert.equal(evs.length, 2000);
  assert.equal(evs[0].start, '2026-01-01T12:00');
});
