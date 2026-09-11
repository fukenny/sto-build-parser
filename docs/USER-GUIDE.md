## v0.5.0: space patrol testing

Choose **Current ship workspace** to isolate a ship. Ship profiles groups its variations under loadouts; Compare limits choices to one loadout.

Saving now requires **Patrol category → Space patrol → Difficulty → Solo / Group**, plus confirmation that the selection is one complete space patrol with unchanged equipment and no ground combat. Solo is the default. The catalog uses 27 space patrol entries from the supplied in-game screenshots; Jupiter Station Showdown is excluded. An asterisk identifies known randomized enemy groups. Hard / Normal in Mirror patrol names remains separate from difficulty.

**Existing runs are preserved.** Use Edit label / version on each older run to confirm its structured patrol conditions before comparing. Older labels are not guessed into missions or Solo/Group. Correction backups are retained.

Comparison now includes mean damage and encounter DPS by weapon/ability and combined pet source. Missing sources contribute zero across matching runs; missing ability data remains unavailable. Identical pet names are combined. Advanced/Elite rank and hangar counts are not inferred: document two Advanced versus mixed Advanced/Elite in variation notes. Comparisons require matching player, loadout, patrol, difficulty, party, and combat scope.

The app does not automatically detect ground records or prove mission completeness. Import only space-patrol selections and confirm them yourself. Random enemies and group composition may affect results.

STO SHAKEDOWN v0.4.0 - QUICK START
Created by Kenneth Solans

1. Extract the complete Windows x64 portable ZIP into a writable folder.
   Double-click Start.cmd. It includes Node and opens your existing browser.
   No Node, npm, Codex, or other software installation is needed.
   Use Exit Shakedown to stop immediately. Closing all Shakedown tabs stops the server after 15 seconds; keep the launcher open while using the app.
2. Before flying, type /combatlog 1 in STO chat.
3. Choose Log folder in Shakedown and select your own GameClient folder.
4. Open Ship profiles. Enter your ship, a loadout (Beam Broadside), and a
   variation (Baseline). Add equipment notes and save the variation.
   You may do this BEFORE OR AFTER flying; describe what was actually equipped.
5. Analyze a run: select a completed log. If a fight crossed file rotation,
   hold Ctrl and select the adjacent files, then Analyze selected logs.
6. Choose your combat stretch and YOUR character. Enemy names are clues.
   Entire log includes all selected files, fights and idle gaps; it can span
   missions. Check timestamps and targets before choosing and saving.
7. Review damage contributions and survivability: hull/shield damage taken,
   incoming sources, spikes, and explicit healing received.
8. Save the run to the correct ship / loadout / variation. Reuse the SAME
   mission/difficulty label from the suggestions for comparable runs.
9. If nothing changed, save additional runs to that SAME variation.
   When equipment changes, create a new variation under the same loadout.
10. Compare the baseline and candidate with the same character and conditions.
    Collect several runs each. One higher DPS run does not prove improvement.

CORRECTIONS
In Ship profiles, each saved run has Edit label / version. Correct a mission
label or move a run to the right variation without importing it again.
A backup is kept before corrections and the first workspace migration.

EXAMPLE
Milwaukee > Beam Broadside > Baseline: three unchanged runs.
Milwaukee > Beam Broadside > Elite Valkyrie: three runs after swapping pets.
A different build concept, such as Torpedoes, gets a different loadout.

LIMITS
Combined import: 1-12 files, 128 MB total when combining; single log: 512 MB.
Records merge chronologically. Exact repeated records across files are
counted once, preserving the highest repeat count within any single file.
Missing events cannot be recovered. A gap longer than 60 seconds still splits
encounters. Entire log can include such gaps: use a distinct session label.
Save completed fights only. Do not count a fragment and its combined fight
as independent runs. Healing may include overhealing. No death score yet.
Equipment notes are manual; the log is not a complete ship/account inventory.

UPDATING / SHARING
Close the old app first. Back up its data folder, extract the new portable
ZIP, then copy the data folder into the new app folder before starting it.
Share only the clean portable ZIP; never share your data or raw logs.
GitHub's source-code ZIP does not contain the bundled Node runtime.

Independent fan project, not affiliated with or endorsed by Cryptic Studios
or the owners of Star Trek. Related marks belong to their owners.
Please preserve Kenneth Solans' creator credit; do not claim this as your own.
More: docs/USER-GUIDE.md, docs/METRICS.md, CHANGELOG.md.


## Ship profile names are reference labels

Follow Log folder → Ship profiles → Analyze a run → Compare builds. Type a recognizable ship profile name, then create its loadout and variation. This profile is not linked to a ship in STO and does not detect the ship you flew or filter the log list. Select logs recorded while flying that ship and equipment setup, choose the correct combat stretch and character, then save it to the matching variation. If a file contains runs from different ships, select only the appropriate combat stretch.
