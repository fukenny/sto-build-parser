# STO Shakedown v0.6.0 — Electron desktop tester preview

Shakedown now opens in its own desktop window, with the existing LCARS interface and analysis workflow. Node and Electron are bundled; no separate runtime installation is needed.

## Download and start

Download `sto-shakedown-v0.6.0-electron-windows-x64.zip`, extract the entire ZIP into a writable folder, and launch **Shakedown.exe**. Keep the package files together. This is an unsigned portable Windows x64 tester build, not an installer.

Close your old app, back up its `data` folder, and copy that folder beside the new EXE before starting. Saved data stays there between sessions. Keep your backup.

## Checks completed

All 21 automated tests passed, covering calculations, saved-data integrity, malformed input, parser limits, and API protections. Additional packaged-app checks passed for renderer isolation, unauthorized access rejection, external popup/direct-navigation blocking, inert HTML in ship names, and backend shutdown/data preservation after window close and renderer crash. The dependency audit reported zero known vulnerabilities at the time checked.

These are internal checks, not an independent security audit or a guarantee. See [the detailed report](https://github.com/fukenny/sto-build-parser/blob/0.6.0/docs/SECURITY-CHECK-0.6.0.md) for scope and remaining work: startup/shutdown failure paths, interrupted saves, clean-machine testing, signing, and further security review. The release package contains the same application code checked, with updated documentation.

Please test log selection, analysis, saving, comparisons, closing/reopening, and folder browsing. Report the version, steps, and error message; avoid sharing private launch/session URLs or personal data.

Development is moving quickly right now. As Shakedown matures, releases will become less frequent and bundle larger, more thoroughly tested updates.
