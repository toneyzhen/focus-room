# Focus Room

A quiet desk to work at: a focus timer on the monitor, your top three priorities, a brain dump diary, and reminders on the chalkboard. Formerly Locked In Room.

Open `index.html` in a browser. There's nothing to install. Your data stays in that browser's local storage.

Each browser keeps its own copy, and so does each address you open the page from, so `localhost:8123` and a double-clicked `index.html` are two separate rooms. Stick to one. To back up or move everything, open Settings in the top-right corner and use "Download backup", then "Restore from a backup" in the other room. Restoring replaces what's there.

`node check.mjs` checks the page for duplicate or missing element ids, and tests the reminder, timer-length, stats and backup rules.
