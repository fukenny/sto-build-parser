# STO Shakedown 0.6.8 — Equipment capture

Download **sto-shakedown-v0.6.8-electron-windows-x64.zip** under Assets, extract the entire ZIP, and open **Shakedown.exe**. This is the standalone Windows desktop app. GitHub's Source code ZIPs are not the packaged app. The .sha256 file is an optional checksum.

## New
- Capture saved STO loadouts into Shakedown variations while STO is running. Review and confirm ship and equipment before importing.
- Supported marks, rarities, and recognized modifiers are saved with the equipment snapshot.
- Fore weapons, aft weapons, and Hangar Pets appear first; vanity slots are grouped and Active Duty Officers appear last.
- IDs and technical diagnostics are available under Capture details. Missing fields are not guessed; conflicting records remain flagged.
- Discord footer link, clearer log-folder wording, and corrected section numbering.

Equipment capture builds a reference profile. It does not change combat-log analysis or comparison calculations, and it does not automatically determine which setup you flew. Assign runs to the correct variation yourself.

## Experimental limitations
The read-only memory reader supports the verified STO client build and refuses unsupported versions. Cached loadouts may remain in memory. Item properties reflect capture time, not historical loadout-save values. Many fixed consoles, devices, hangars, and doffs lack supported detailed properties. Vanity Deflector category 66 is provisional. Traits, bridge officer assignments, and effect descriptions are not captured.

## Updating
Close the old app, back up its data folder, extract this ZIP into a new folder, then copy data beside the new Shakedown.exe before starting. Keep the old installation and backup. Older equipment captures do not gain new details automatically; make a new capture.

## Validation
31 automated tests passed, plus live capture/import/reload/variation-selection checks and packaged Electron launch, isolation, and shutdown checks. Broader ship/loadout combinations still need tester feedback. This is an unsigned alpha desktop ZIP, not an installer or security certification.

Development is moving quickly during alpha testing. As Shakedown matures toward production, releases will become less frequent and bundle larger, more thoroughly tested updates.

Independent fan project by Solans Labs. Not affiliated with Cryptic Studios or the owners of Star Trek.
