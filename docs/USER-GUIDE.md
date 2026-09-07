# User guide · v0.2.1 preview

## Install and start

1. Node.js 22 or newer is required. The launcher checks PATH, standard installation folders, and Codex's bundled runtime. If none is available, install Node from https://nodejs.org.
2. Extract the source ZIP into a writable folder, such as Documents. Keep all files and subfolders together.
3. Double-click `Start.cmd` on Windows. Open http://127.0.0.1:4317 in your browser and keep the command window open. No npm install is needed.
4. To stop, press Ctrl+C in that window. You can also run `node server.mjs` directly. The PowerShell launcher is an alternative for users whose script policy allows it.

This is a local app, not a hosted website or standalone installer. Each tester runs their own copy. Your localhost link only works on your computer. The GitHub repository is private; people without access cannot download it. A source ZIP can be shared separately without changing repository visibility.

## Your first experiment

Open Welcome for the guided steps. Enable logging in STO with `/combatlog 1`, then select the folder that contains your combatlog*.log files. Steam and standalone installations may use different locations.

Import a completed log. Select a combat stretch and your character. Enemy names in the selector help identify the stretch; they do not filter damage to one enemy. “Entire log” includes every recorded stretch and the idle gaps between them. A rotated file may contain only part of a mission. Use individual encounters for comparisons when possible.

Inspect damage contributions and the Survivability section. Create a build version with your ship, equipment, and notes, then return to the analysis and save that run. Enter the same mission/difficulty label for comparable runs. Do not change equipment within a saved run.

Collect several baseline runs, change one item, and create a new build version. Repeat similar content with similar team conditions. Compare versions using the same character and label. Three runs per version is a starting point, not a guarantee of statistical confidence.

## Reading survivability

- Hull and shield damage taken are logged incoming amounts directed at the selected player. Their pets' incoming damage is not added to them.
- Healing received includes all recorded sources and may include overhealing. Self/owned sources are identified by the logged owner; external sources include teammates and other entities.
- Only explicitly targeted healing contributes to received totals. Some self-healing effects omit their target; their outgoing amount is disclosed separately as unspecified-target healing and is not assumed to be healing received.
- The pressure chart includes empty time buckets. Hover or keyboard-focus a bar to read its amount. Bar width is adaptive; the separately reported peak always uses a one-second bucket aligned to encounter start.
- Largest damage record is one hull OR shield record. It is not necessarily the largest complete attack.
- Deaths, resistance, buff uptime, and effective healing are not inferred. Lower incoming damage does not automatically mean a better defensive build.

## Updates and backups

Copy the `data` folder somewhere safe before updating. Extract new app files over the old app while it is stopped; preserve `data/state.json`. Never replace your data with another person's data folder. Old saved runs remain valid historical evidence; missing new metrics show “Not recorded.” New imports contain the new metrics. Existing saved evidence is not automatically replaced.

## Feedback

Report the app version, what you selected, what you expected, and what happened. For calculation issues, include the encounter times, chosen player, and which metric disagrees. Do not send your whole data folder: it contains paths, player identifiers, and build notes. Share a combat log only if you are comfortable sharing the identifiers it contains.
