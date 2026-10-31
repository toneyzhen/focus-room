// Run with `node check.mjs`. Two apps share this page's ids, so catch clashes and dangling lookups.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const used = [...html.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]);

assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'duplicate ids');
assert.deepEqual(used.filter((id) => !ids.includes(id)), [], 'lookups with no matching element');
assert.ok(html.includes("STORAGE_KEY = 'lockedInRoom.reminders.v1'"), "sharing Reminder Bell's key lets its tab undo checkmarks");
console.log(`ok: ${ids.length} ids, ${new Set(used).size} looked up`);
