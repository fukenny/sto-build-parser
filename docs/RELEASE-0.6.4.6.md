# STO Shakedown v0.6.4.6 — LCARS themes and desktop polish

- Four local themes: Shakedown (original amber/yellow), Lower Decks, TNG, and Voyager.
- Color Theme Select opens four choices to the right over the content, without expanding the sidebar. Choices persist between launches.
- Consistent color roles for navigation, panel frames, active tabs, and alerts. Fonts and workspace behavior are preserved.
- New STO Shakedown app-window and Windows EXE icon; credits now read Solans Labs.
- Electron updated to 44.4.3 and bundled Node to 24.21.0 for current maintenance and upstream security fixes.
- Every shared package now has its own version; builds refuse to overwrite an existing versioned ZIP.

## Install or update

Download sto-shakedown-v0.6.4.6-electron-windows-x64.zip. Extract all files into a NEW writable folder and open Shakedown.exe. This is a portable Windows x64 app, not an installer. Node and Electron are bundled.

Before updating: close the old app, back up its data folder, then COPY that folder beside the new Shakedown.exe. Keep the old folder and backup until you confirm your ships and saved runs in the new version. Updates do not automatically migrate data. Original combat logs remain in their existing log folder.

The separate .sha256 file is a checksum text file, not another application download. Windows may cache an older icon when reusing paths; extracting into the new versioned folder avoids that ambiguity.

## Validation

27 automated tests passed on Node 24.21.0. Browser checks covered four themes, navigation, keyboard behavior, persistence, fallback, and flyout placement without sidebar growth. Packaged Electron checks covered isolation, denied permissions, unauthorized API requests, blocked external navigation/popups, escaped user text, normal/crash shutdown, saved data, folder selection, and backup controls. Windows Defender's targeted release-folder scan found no threats. npm audit reported zero known vulnerabilities.

These are internal checks, not an independent security certification. The app remains unsigned; code signing, automatic updates, and automatic data migration are not included.
