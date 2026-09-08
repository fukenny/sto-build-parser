**Development branch:** security hardening is implemented here but not yet released. Start through the launcher; a plain localhost URL no longer grants access. See [implementation and validation](docs/SECURITY-HARDENING.md).

# STO Shakedown

Test your Star Trek Online ship builds using space-patrol combat logs.

[Security review and planned fixes](docs/SECURITY-REVIEW-2026-09-08.md) — findings remain open in v0.5.0.

## Download for Windows

### [Download STO Shakedown v0.5.0 — Windows portable ZIP](https://github.com/fukenny/sto-build-parser/releases/download/v0.5.0/sto-shakedown-v0.5.0-windows-x64.zip)

**Free fan-project preview · Windows x64 · No Node, npm, or Codex installation needed.**

1. Download the ZIP using the link above.
2. Right-click it and choose **Extract All**. Choose a writable folder, such as Documents.
3. Open the extracted folder and double-click **Start.cmd**. With file extensions hidden, this appears as **Start** (Windows Command Script).
4. Your normal browser opens STO Shakedown. Keep the launcher window open while using it. If the browser does not open, visit **http://127.0.0.1:4317**.

The ZIP includes the runtime and instructions. GitHub's **Code → Download ZIP** and **Source code** downloads are for developers and do not include the runtime.

[Release and download details](https://github.com/fukenny/sto-build-parser/releases/latest) · [Report a problem](https://github.com/fukenny/sto-build-parser/issues)

## Your first patrol comparison

1. In STO chat, enter **/combatlog 1** before playing a patrol.
2. In Shakedown, choose **Log folder** and select the GameClient folder containing your combat logs. Use your installation's location; it is not assumed.
3. In **Ship profiles**, create your ship, a loadout, and a **Baseline** variation with equipment notes. You can do this before or after flying.
4. In **Analyze a run**, select a completed log. Ctrl-select adjacent logs if the fight was split between files. Select the combat stretch and **your character**.
5. Review damage and survivability. Select the variation actually equipped, patrol category, mission, difficulty, and Solo/Group. Confirm this is a complete space patrol and save.
6. Save more unchanged runs to the same variation. After changing equipment, create a new variation and collect comparable runs.
7. In **Compare builds**, choose the ship, loadout, both variations, character, and matching patrol conditions. Compare overall results, weapons, and pets.

Logs and saved data stay on your computer. This preview reports observations, not proof that an equipment change caused a result. See the included **START-HERE.txt** for more details.

**Updating:** close the old app first. Back up its **data** folder and copy it into the new extracted app folder before starting. Older saved runs need their patrol settings confirmed using **Edit label / version**.

## v0.5.0: space patrol testing

Choose **Current ship workspace** to isolate a ship. Ship profiles groups its variations under loadouts; Compare limits choices to one loadout.

Saving now requires **Patrol category → Space patrol → Difficulty → Solo / Group**, plus confirmation that the selection is one complete space patrol with unchanged equipment and no ground combat. Solo is the default. The catalog uses 27 space patrol entries from the supplied in-game screenshots; Jupiter Station Showdown is excluded. An asterisk identifies known randomized enemy groups. Hard / Normal in Mirror patrol names remains separate from difficulty.

**Existing runs are preserved.** Use Edit label / version on each older run to confirm its structured patrol conditions before comparing. Older labels are not guessed into missions or Solo/Group. Correction backups are retained.

Comparison now includes mean damage and encounter DPS by weapon/ability and combined pet source. Missing sources contribute zero across matching runs; missing ability data remains unavailable. Identical pet names are combined. Advanced/Elite rank and hangar counts are not inferred: document two Advanced versus mixed Advanced/Elite in variation notes. Comparisons require matching player, loadout, patrol, difficulty, party, and combat scope.

The app does not automatically detect ground records or prove mission completeness. Import only space-patrol selections and confirm them yourself. Random enemies and group composition may affect results.

## About STO Shakedown

A local Windows combat parser for testing STO ship builds through damage and survivability. Created by Kenneth Solans, with an LCARS-inspired interface and an independent [fan-project notice](COPYRIGHT.md).

## Start without installing software

Use the **Windows x64 portable ZIP**, extract it completely into a writable folder, and double-click **Start.cmd**. Node is included; no Node, npm, Codex, or additional installation is needed. The interface opens in your existing browser. Keep the launcher window open while using the app.

GitHub's automatic **source-code ZIP** is for developers and requires Node 22+. The portable ZIP is built separately. Close any previous copy before starting an updated version. Back up and copy your old `data` folder into the new app folder to retain your workspace.

## Workflow

1. Enable `/combatlog 1` in STO, then choose your own GameClient log folder.
2. In **Ship profiles**, create or reuse a ship and named loadout, then create a **Baseline** variation with equipment notes. This can happen before or after flying.
3. Import a completed log. For a fight split across rotated files, Ctrl-select the adjacent files and analyze them together.
4. Select the combat stretch and your character. Inspect damage and survivability.
5. Attach the run to the variation actually equipped. Reuse the mission/difficulty label from the suggestions.
6. Save additional unchanged runs to the same variation. Create a new variation only when you change equipment.
7. Compare baseline and candidate under the same character and conditions. Several runs help reveal normal variation; one DPS increase is not proof.

Example: **Milwaukee → Beam Broadside → Baseline / Elite Valkyrie test**, with several runs per variation. Saved runs can be relabeled or moved using **Edit label / version**. Missing comparison evidence displays the available labels rather than inventing zero damage.

[Quick start](START-HERE.txt) · [User guide](docs/USER-GUIDE.md) · [Metrics](docs/METRICS.md) · [Changelog](CHANGELOG.md) · [Development](docs/DEVELOPMENT.md)

## Capabilities and limits

- Configurable local folder; raw logs are read in place and never uploaded or modified.
- Hull/shield damage, weapon/ability contributions, owned pets/summons, incoming damage sources, damage timeline, and explicit healing received.
- Ship profiles, loadouts, variations, saved evidence, and descriptive comparisons.
- Single-file imports up to 512 MB; combined imports up to 12 files / 128 MB total. Combined records sort by timestamp and suppress exact cross-file overlap while preserving within-file repeat counts. Missing events cannot be recovered.
- Encounters split after more than 60 seconds without valid records. **Entire log** covers all selected files and idle gaps, potentially multiple missions. Check timestamps and keep the build unchanged. Do not mix entire-log sessions with individual encounters in a comparison.
- DPS uses hull plus shield damage divided by encounter duration, minimum one second. Other parsers may use different durations. Healing may include overhealing; no validated death count or survival rating.
- Equipment and mission labels remain manual. No complete account inventory, buff activation tracking, automatic recommendations, or live monitoring.

## Privacy and upgrades

`data/state.json` holds settings, build notes, and summaries. The v0.4 migration retains saved run IDs and evidence, groups each ship's legacy versions under a loadout named after its first version, and names that first variation Baseline. A pre-migration backup is saved locally. Editing a saved run also creates a backup. Data, logs, runtimes, and build artifacts are excluded from Git and release source archives.

The server binds only to 127.0.0.1 and checks request tokens and origin/host headers. There are no cloud or AI calls. Each user runs their own local copy.

## Development

Node standard-library server, vanilla HTML/CSS/JS, JSON persistence, no npm dependencies. Run `node server.mjs` or `npm start`. Run `npm test`. Set `PORT` or `STO_DATA_DIR` for isolated testing.

Research references: [OSCR](https://github.com/STOCD/OSCR) and [STO-CLARE](https://github.com/raman78/STO-CLARE). No source from those projects is vendored. The parser still needs wider cross-validation on real encounters.
