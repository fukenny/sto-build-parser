# Security validation — v0.6.5

Date: 2026-09-22. Windows x64. Tests used isolated temporary data, never the user's workspace saves.

## Results

- PASS: 27 automated tests, run with packaged-backend Node 24.21.0. Coverage includes bootstrap/session authorization, Origin/Host restrictions, folder/path validation, isolated parser bounds/timeouts, escaping, atomic save rollback, backups, and saved-run workflows.
- PASS: npm audit on the complete installed dependency tree: 0 known advisories. Electron pinned to 44.4.3. The earlier 44.3.0 was upgraded before packaging. Audit is not a full Chromium CVE scanner.
- PASS: downloaded Node 24.21.0 archive matched the SHA-256 published by nodejs.org. Runtime provenance is bundled. Electron downloaded through its pinned installer/checksum process.
- PASS: packaged Electron renderer sandbox, context isolation, webSecurity enabled; Node integration disabled. require/process/window.electron absent in the renderer.
- PASS: unauthenticated API and incorrect Host rejected; invalid bootstrap rejected; geolocation denied; external window creation and navigation blocked.
- PASS: HTML-shaped ship name treated as text; no script execution.
- PASS: normal window close and forced renderer crash preserve committed data and stop the backend. Simulations also cover missing-runtime startup and hung-backend process-tree shutdown.
- PASS: packaged folder chooser/cancel, fixed data-directory opening and backup snapshot controls.
- PASS: four-theme flyout, keyboard dismissal, theme persistence across reload/backend restart, removed-theme fallback, and unchanged sidebar height when choices open.
- PASS: Defender 4.18.26080.4-0 targeted release-folder scan with remediation disabled returned exit 0 and "found no threats". Defender was enabled; signature timestamp 2026-09-22 02:52 local.

## Limits

No independent penetration test, clean-machine/second-Windows-user test, signing certificate, or guaranteed protection against same-user malware. Parser isolation is a bounded child process, not an OS sandbox. Saved files inherit normal local filesystem permissions. No automatic updater or data migration. This report does not claim that all vulnerabilities are absent.

## Sources

Electron runtime release: https://releases.electronjs.org/release/v44.4.3
Node provenance: runtime/PROVENANCE.txt inside the package.
