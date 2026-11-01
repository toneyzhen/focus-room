// Run with `node check.mjs`. Two apps share this page's ids, so catch clashes and dangling lookups.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const used = [...html.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]);

assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'duplicate ids');
assert.deepEqual(used.filter((id) => !ids.includes(id)), [], 'lookups with no matching element');
assert.ok(html.includes("STORAGE_KEY = 'lockedInRoom.reminders.v1'"), "sharing Reminder Bell's key lets its tab undo checkmarks");
assert.ok(!/(loadJSON|saveJSON)\('ssr_/.test(html) && !html.includes("e.key === 'ssr_"), "sharing Lamplight's keys lets its tab change the timer and stats");

// The page has no modules, so lift the rules out of it by name. Each ends at the first line that is just `  }`.
const source = (name) => {
  const found = html.match(new RegExp(`^  function ${name}\\b[\\s\\S]*?^  }`, 'm'));
  assert.ok(found, `function ${name} not found in index.html`);
  return found[0];
};
const names = ['pad', 'todayKey', 'nowHHMM', 'skipDateFor', 'rawMinutesDiff', 'sortKey', 'describeCountdown', 'isDue', 'parseDuration'];
const rulesAt = (when) => {
  class FakeDate extends Date {
    constructor(...args) { args.length ? super(...args) : super(when); }
  }
  return new Function('Date', 'MISSED', `${names.map(source).join('\n')}\nreturn { ${names.join(', ')} };`)(FakeDate, -1e6);
};

// Ordinary dates, so a clock change can't shift the expected minutes.
const evening = rulesAt('2026-10-20T19:20:00');
const nextMorning = rulesAt('2026-10-21T00:30:00');
const nextDay = rulesAt('2026-10-21T19:20:00');

// A time already past when it's set means tomorrow, not overdue.
const tomorrowMorning = { time: '08:00', skipDate: evening.skipDateFor('08:00'), repeat: false, lastFiredKey: null };
assert.equal(tomorrowMorning.skipDate, '2026-10-20');
assert.ok(evening.sortKey(tomorrowMorning) > 0, 'a just-set past time must not be overdue');
assert.equal(nextMorning.sortKey(tomorrowMorning), 450, 'it counts down normally the next day');
assert.equal(evening.skipDateFor('19:20'), null, 'the current minute still rings now');
assert.equal(evening.skipDateFor('23:00'), null);
assert.ok(nextDay.sortKey(tomorrowMorning) < 0, 'it can be overdue the next day');

// Overdue, and a one-time reminder left over from the day it rang.
const rangToday = { time: '08:00', repeat: false, lastFiredKey: 'once', firedDate: '2026-10-20' };
assert.ok(evening.sortKey(rangToday) < 0);
assert.equal(evening.describeCountdown(evening.sortKey(rangToday)), 'overdue 11h 20m');
assert.equal(nextDay.sortKey(rangToday), -1e6);
assert.equal(nextDay.describeCountdown(-1e6), 'missed');

// Ringing: this minute always, and anything skipped since the last check.
assert.ok(evening.isDue('19:20', '19:20', '19:20'), 'a reminder set for this minute rings');
assert.ok(evening.isDue('15:00', '14:58', '15:05'), 'a time slept through rings on waking');
assert.ok(!evening.isDue('14:58', '14:58', '15:05'), 'the last check already handled its own minute');
assert.ok(!evening.isDue('15:06', '14:58', '15:05'), 'a later time waits');
assert.ok(!evening.isDue('08:00', '19:20', '19:20'), 'opening the page does not ring earlier times');
assert.ok(evening.isDue('07:00', '', '08:00'), 'a new day checks from midnight');

// Typing a timer length.
assert.equal(evening.parseDuration('25'), 1500);
assert.equal(evening.parseDuration('1:30'), 90);
assert.equal(evening.parseDuration('0:01'), 1);
assert.equal(evening.parseDuration(' 1.5 '), 90);
for (const bad of ['', 'abc', '1:2:3', 'a:b']) assert.equal(evening.parseDuration(bad), null, `"${bad}" should be refused`);

console.log(`ok: ${ids.length} ids, ${new Set(used).size} looked up, rules pass`);
