# locked-in-room

A focus room with reminders: the Lamplight Study timer and room scene, plus Reminder Bell in a side drawer.

Open `index.html` in a browser. There's nothing to install. Your data stays in that browser's local storage.

Each browser keeps its own copy, and so does each address you open the page from, so `localhost:8123` and a double-clicked `index.html` are two separate rooms. Stick to one. To back up or move everything, open Settings in the top-right corner and use "Download backup", then "Restore from a backup" in the other room. Restoring replaces what's there.

`node check.mjs` checks the page for duplicate or missing element ids, and tests the reminder, timer-length, stats and backup rules.
