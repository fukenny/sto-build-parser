# STO Build Parser

A local Windows prototype for answering: **Did this change improve my ship?**

## Run

Requires Node.js 22 or newer. No packages or build step are needed.

Run `node server.mjs` from this folder, then open http://127.0.0.1:4317.
On Windows, `Start-STO-Build-Parser.ps1` starts the app and opens the browser. It also recognizes the Node runtime bundled with Codex on this development machine.

1. Choose **Log folder**, browse or paste your own GameClient folder, and click **Use this folder**. No installation path is hardcoded.
2. Import a combat log. Select an encounter and then your character; the highest-damage player is never assumed to be you.
3. Create a named build version with ship name, equipment, and change notes.
4. Save the selected encounter under that version with an encounter/difficulty label.
5. Repeat for another version and compare the same character and conditions.

The welcome page explains each step with direct navigation buttons and a worked Milwaukee example. **Combat selection** offers individual detected encounters or **Entire log**, which includes every valid record in the selected file. Enemy names in encounter labels are clues, not opponent filters. Entire-log DPS uses first-to-last record time, including idle gaps, and a file may span several missions or equipment changes. It cannot recover combat stored in other rotated files. Save only unchanged-build sessions under a distinct label. The app rejects overlapping saved encounters and mixing full-log evidence with individual encounters in a comparison.

## Included

- Configurable, remembered folder with native Windows browse dialog and manual path entry.
- Read-only import of rotated or unrotated combat logs, up to 512 MB per file.
- Encounter segmentation, player selection, hull/shield damage, owned pet/summon attribution, incoming damage, and logged outgoing healing.
- Ability contributions and event counts (not activation counts).
- Persistent build versions and run summaries, duplicate encounter protection.
- Same-player, same-ship, same-context comparison with equal-weight run means, ranges, standard deviation, and descriptive contribution changes.
- Local-only server on loopback, session request token, origin/host checks, escaped log text, and atomic state writes.

## Measurement limits

This is an initial independently implemented parser, not a certified replacement for existing parsers. Validate against a trusted parser before making costly equipment decisions.

Encounters split at a gap greater than 60 seconds between valid log records. Long pauses can split fights and adjacent fights can merge; file rotation can cut an encounter. Inspect timestamps and targets. Detection does not establish map, difficulty, or completion.

DPS = outgoing hull + shield damage / full detected encounter duration (minimum one second). Other parsers may use player-active time. Negative magnitudes are not universally healing: negative shield magnitude with negative secondary magnitude represents shield damage. Hull HitPoints healing and shield healing are classified separately. Self-damage and `*` feedback events are excluded from outgoing offense. Owned sources are grouped as pets/summons, not specifically hangar pets. Unowned NPC damage is not guessed into player totals.

Malformed records are counted and skipped. The final line in an actively written log may be incomplete; reimport after the fight. A growing file is read at its size when import begins. Saved summaries do not update automatically. A modified/extended encounter has a different content hash; users should save completed runs only.

Comparisons are descriptive, not statistical confidence or causal recommendations. Equipment, ship identity, and encounter labels are user supplied. Logs cannot establish all equipped items, button presses, firing arcs, piloting intent, or effective healing. No automatic AI diagnoses, live monitoring, cross-file stitching, map recognition, equipment database, or installer yet.

## Data

`data/state.json` stores folder choice, build notes, and selected run summaries. Back up this folder to preserve your work. Raw logs are read in place and never changed. Data and all `.log` files are excluded from Git. There are no cloud calls in the app. Do not expose the server to a network.

## Development

`node --test` runs synthetic parser, comparison, and API tests. Real user logs are not included in the repository.

Architecture: Node standard-library server, streaming parser, JSON persistence, and plain HTML/CSS/JS frontend. No dependencies. Port can be set with `PORT`; test data location with `STO_DATA_DIR`.

Research references: [OSCR](https://github.com/STOCD/OSCR) and [STO-CLARE](https://github.com/raman78/STO-CLARE). OSCR is GPL-3.0; no source is vendored or imported here. A reuse/license decision remains open before integrating another parser. Star Trek styling is original CSS with no official assets.

## Next milestones

1. Cross-check encounter boundaries and damage totals against trusted parser output for the same runs.
2. Add editable build/run metadata and backup/export UI.
3. Establish Milwaukee beam-array vs. Hyper-Dual DBB experiments with controlled repeat runs.
4. Improve cross-file encounter handling, map recognition, and live folder monitoring.
5. Consider grounded explanations only after the measurements are validated.
