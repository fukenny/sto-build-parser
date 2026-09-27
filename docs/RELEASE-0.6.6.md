# STO Shakedown v0.6.6 — Tour Shipyard

- New optional Tour Shipyard button on Your ships and individual ship profiles.
- Highlights real controls and explains reference ship names, loadouts, Baseline variations, equipment changes, and saving matching combat evidence.
- Adapts to empty and existing shipyards. Back, Next, Finish, Close, Escape, and keyboard focus return are supported.
- Uses the selected LCARS theme, with an alert-colored launch button. Header and navigation remain unchanged.
- Tours are read-only: they do not create ships or change saved data.

## Download and update

Download `sto-shakedown-v0.6.6-electron-windows-x64.zip` and extract the entire folder. Launch Shakedown.exe. The .sha256 file is an optional checksum text file.

Close the old version and back up its data folder. Extract this version to a new folder and copy data beside the new Shakedown.exe before launching. Keep the old copy until your saved ships and runs are verified. No automatic data migration. Windows x64, unsigned portable alpha; no separate Node installation required.

## Validation

27 automated tests and targeted browser checks for empty/existing shipyards, profile tours, navigation, dismissal, focus return, and narrow-window layout. See SECURITY-CHECK-0.6.6.md for final release checks and limitations.
