# STO Shakedown v0.6.3 — Easier analysis and backups

## New in 0.6.3

- Click table column headings to sort numbers or names. Click again to reverse order; expanded details stay with their item.
- Log folder settings now includes **Open data folder** and **Back up saved data**.
- Each backup is a separate state.json snapshot under data/backups. It contains saved ships, loadouts, variations, runs and settings, not original combat logs. Copy backups to another drive for protection against disk failure.
- Missing-runtime startup errors now exit cleanly. Normal shutdown still finishes pending writes; an unresponsive backend gets a bounded process-tree shutdown after 12 seconds. Unsaved work can be lost during forced shutdown.

## Also included since 0.6.0

- Expandable damage, incoming-damage, healing and comparison tables, with larger item names.
- Per-target weapon damage and hit statistics; duplicate Combat details removed, overall hit metrics shown once.
- Outgoing damage chart in Run Briefing, incoming damage under Survivability.
- Explorer-style combat-log selection: choose a log file and Shakedown uses its containing folder. Example Steam location included.
- Existing LCARS header, navigation and outer frame preserved.

## Download and update

Download **sto-shakedown-v0.6.3-electron-windows-x64.zip**, extract all files into a writable folder, and launch **Shakedown.exe**. This is an unsigned portable Windows x64 application, not an installer. Node and Electron are bundled.

Close the previous app, back up its data folder, then COPY that folder beside the new Shakedown.exe before starting. Keep your old copy. Reanalyze original logs to populate newly added target details.

To restore a snapshot, close Shakedown, preserve the current data/state.json, and copy a backup state.json into data. Backup creation does not automatically restore or overwrite the active save.

## Validation

27 automated tests passed. Browser checks covered sorting, drilldown pairing, keyboard controls and backup creation. Simulated launcher tests covered missing runtime and hung-backend shutdown. These checks are not an independent security audit; publisher signing and power-loss-during-save validation remain outstanding.

Development is rapid right now. As Shakedown matures, updates will become less frequent and bundle larger, more thoroughly tested releases.
