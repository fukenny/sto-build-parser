# Development and releases

Node.js 22+, no external packages. Run `node --test` and `node --check public/app.js`. Start with `node server.mjs`; use `PORT` and `STO_DATA_DIR` for isolated testing. The server binds loopback only and checks Host, Origin, and a per-process request token. User/log strings are escaped before HTML rendering.

Modules: `lib/parser.mjs` streams logs, `lib/comparison.mjs` aggregates saved evidence, `server.mjs` owns local persistence/API, and `public/` owns the browser UI. Tests cover damage/heal classification, ownership, gap segmentation, full-log totals, overlapping evidence, API access checks, and schema compatibility.

## Version policy

The package.json version is the single source of truth for the visible app version. Parser schema version is independent: change it when the persisted measurement contract changes. Preserve old fields and represent unavailable new metrics as null rather than fabricated zeros.

For releases: update package.json and CHANGELOG.md, run tests, inspect the UI with real logs, commit, and create a matching annotated `vX.Y.Z` tag. Build a source ZIP with `git archive` from that tag. Never zip the working folder, which may contain private `data/` and logs. Check archive contents before sharing. Tag v0.1.0 identifies the final pre-survivability prototype; v0.2.0 adds schema-2 measurements.

## Preview validation boundary

Synthetic tests validate the implemented contract; successful parsing of real logs is not independent accuracy certification. Compare identical completed encounters against an established parser, accounting for its timing denominator, before claiming parity. Death counting and nuanced feedback/ownership cases need more real examples. No source from other parsers is included; integration and licensing remain separate decisions.

## Portable Windows build (v0.4+)

After committing release changes, run `powershell -File scripts/Build-Portable.ps1`.
The script exports committed source, downloads Node 24.19.0 win-x64 from
nodejs.org, checks SHA256 against the official sums, and includes node.exe,
its license, and provenance. Output: `../sto-shakedown-vVERSION-windows-x64.zip`.
It does not include personal data, logs, or Git metadata. GitHub source archives
alone do not contain the runtime. Test Start.cmd --check-runtime with a PATH
containing only Windows system directories and run tests with the packaged Node.
Workspace schema 2 introduces profiles/loadouts; parser measurement schema remains 2.
