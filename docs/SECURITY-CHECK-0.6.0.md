# Electron 0.6.0 checks — 2026-09-14

Tested the existing Electron ZIP in a separately extracted copy with synthetic ship data. No user data or OLDDATA was changed. This is a focused internal check, not a penetration test or security certification.

Package: `sto-shakedown-v0.6.0-electron-windows-x64.zip`

SHA256: `342D2F666478257529FFE096AF737746DB012C0DC14A4C679DDD7A5236BF12B5`

## Passed

- All 21 automated source tests passed, including malformed/oversized log rejection, parser timeout and recovery, failed-write rollback, serialized writes, API authorization, cross-origin rejection, bootstrap-secret replay rejection, path traversal rejection, and saved-run workflows.
- Live npm audit returned zero known vulnerabilities across the 13 dependency entries. This does not establish that Electron or the app has no vulnerabilities.
- Packaged Electron reported sandbox and context isolation enabled, Node integration disabled, and web security enabled. Renderer `require`, `process`, and `window.electron` were undefined.
- Packaged API rejected unauthenticated access, an invalid Host, and an invalid bootstrap secret.
- Renderer geolocation permission was denied. Other permission types were not individually exercised; the source installs blanket deny handlers.
- A requested external popup did not create another window. Direct external navigation stayed at the local origin.
- A ship name containing an HTML image/onerror payload saved without executing its script.
- Closing the window stopped the local backend and preserved the saved test state byte-for-byte.
- Relaunching loaded that state. Forcing the renderer to crash also stopped the backend and preserved the state byte-for-byte.
- Package app-directory inspection found the expected application/runtime/test/documentation files, with no personal data directory there.

## Findings and remaining checks

- Authenticode reports **NotSigned**. Publisher signing is still outstanding.
- Source review: backend spawn errors call `fail()` but do not mark the backend exited; the disconnected-backend branch of `stop()` can leave quitting unresolved. Reproduce missing-runtime startup and harden this path before broader distribution. This was not triggered in the packaged runtime tests.
- Shutdown has no bounded fallback for a backend that stops responding. Test a deliberately hung backend separately.
- Redirect chains and subframe navigation were not exercised. The launcher explicitly guards `will-navigate`, but does not install an explicit `will-redirect` guard.
- Forced renderer crash was tested after saving completed. Process termination/power loss during an active write, disk-full conditions, and OS shutdown remain untested. Failed-write rollback tests do not substitute for those scenarios.
- No clean-machine/standard-user installation, antivirus scan, independent penetration test, or full Electron advisory/fuse review was completed in this pass.
- Data remains beside the portable EXE; this is not an installer or automatic migration test.

## Assessment

The exercised checks passed. Keep this an unsigned, limited tester build; address startup/shutdown failure handling and complete the remaining release checks before treating it as a public production release. The ZIP was not rebuilt or published by this check.
