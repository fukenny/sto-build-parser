# Changelog

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
