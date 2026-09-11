# v0.5.3 — LCARS interface update (design branch)

- Ship → loadout → variation detail with collapsible run history and multiple flights per setup.
- Compare two matching flights within a variation, or matching runs across variations.
- Copy notes into new variations, archive/restore without deleting evidence, and select a setup before importing the next run.
- Backend regression coverage for repeated flights, matching conditions, overlap rejection and persistence.
- Compact title with opposing LCARS frames and locally bundled Antonio font.
- Fixed desktop frame with independent content scrolling.
- Bottom-aligned Exit and credits, colored sidebar spacer, and varied navigation colors.
- Ship profiles precede analysis, with clear reference-only naming guidance.
- Published download remains v0.5.1 until a v0.5.3 release is packaged and published.

# v0.5.1 — Shutdown fix and security hardening

- Add Exit Shakedown and automatic shutdown 15 seconds after the last browser disconnects; finish queued saves and stop parser workers.
- Stop unused launches after five minutes; preserve refresh and multiple-tab sessions.
- Private one-time launcher session; remove token from public HTML.
- Isolated parser with input, memory and time limits.
- Transactional persistence with recovery after write errors.
- Add security regression tests and document remaining validation.

# v0.5.0 — Ship workspaces and space patrol comparisons

- Isolate ships and group variations by loadout.
- Structured patrol catalog, difficulty and Solo/Group matching, randomized-enemy markers.
- Require explicit space-patrol confirmation; preserve legacy records for review.
- Add weapon/ability and pet-source mean damage, DPS and deltas.

# v0.4.0 — STO Shakedown

- Rename product and retain LCARS appearance.
- Add ship profiles, loadouts, and variations with migration backup.
- Combine rotated files chronologically with overlap handling.
- Edit saved run labels/variation; explain comparison exclusions; missing evidence is not zero damage.
- Refresh quick-start and GitHub documentation; portable launcher opens browser and uses bundled runtime.

# Changelog

## 0.3.0 — 2026-09-07

- Stronger LCARS-inspired interface: black background, broad segmented color bands, curved rails, and clear section shortcuts.
- Creator credit and fan-project disclaimer above Local Workspace.
- Quick comparison checklist in the welcome page and downloadable START-HERE.txt shipped with the app.
- Windows portable packaging includes an official Node runtime and its license; no Node or Codex installation required for that download.
- Account inventory is documented as later work; no unsupported equipment inference is added to the demo.

## 0.2.1 — 2026-09-07

- Fixed the Windows command launcher to locate Node in standard installation folders and Codex's bundled runtime when it is absent from PATH.
- Added a Node 22+ check and a `Start.cmd --check-runtime` diagnostic.
- Added a clear message when the ZIP has not been fully extracted.
- When the app is already running, the launcher opens it instead of attempting to bind the same port again.

## 0.2.0 — 2026-09-07

### Added
- Survivability section: incoming hull/shield damage, damage source breakdown, healing received by source and layer, self/owned versus external healing, largest individual damage record, and incoming pressure timeline.
- Defensive-only players can be inspected and saved.
- Build comparisons include incoming damage layers and healing received per second.
- Subtle LCARS colors and rounded framing; readable tables remain the focus.
- Visible version sourced from package.json, Windows command launcher, user guide, metric definitions, and developer/release notes.

### Compatibility
- Existing settings, builds, and runs remain intact. v0.1 records have no detailed survivability data; comparisons display “Not recorded” when any included run lacks it.
- Parser schema is version 2. No automatic recomputation or rewriting of saved evidence.

### Known limits
- Death counting is not validated and is not shown. No buffs/debuffs, resistance estimates, effective-healing estimates, or survival score.
- Encounter boundaries and totals have not been independently cross-validated against an established parser. This is a feedback preview.

## 0.1.0 — 2026-09-07

- Initial local combat-log analysis and versioned build evidence workflow.
- User-selected folder, encounter and full-log views, player and owned-source damage breakdowns, local persistence, and descriptive comparisons.
- Shipyard welcome guide, walkthrough, full-log explanations, and duplicate/overlapping-evidence protection.
