# Electron desktop — 0.6.8.1 capture hotfix

Shipyard has **Capture my ship**. Run STO, save your loadout in space, enter the character and exact saved-loadout names, review the equipment, and confirm a new variation. This hotfix addresses downloaded-script startup, the validated October 9 STO client, and character-name search capacity. See resources/app/docs/RELEASE-0.6.8.1.md for details. Starting fresh without an existing data folder is supported.

Extract the entire ZIP into a new writable folder, then open Shakedown.exe. Shakedown now opens in its own window, not your browser. Keep all the files in the package together.

To test your existing data, close the older app, back up its data folder, and COPY that data folder beside the new Shakedown.exe before starting. This portable test build saves to that folder. It does not automatically migrate or alter your older installation.

Closing the window or choosing Exit Shakedown shuts down the local server after pending writes complete. A second launch focuses the existing window. The LCARS navigation and header are unchanged.

Test import, analysis, save, comparison, folder browsing, resize, closing/reopening, and a second launch. Node and Electron are bundled. No separate Node installation is needed.

This is an unsigned test ZIP, not an installer. Publisher signing, automatic updates, and AppData migration are future work. Windows may show an unknown-publisher warning.
