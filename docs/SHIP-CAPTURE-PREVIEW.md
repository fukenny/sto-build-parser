# 0.6.8 development preview: capture a saved ship loadout

Open Shipyard and choose **Capture my ship**. In STO, enter space and save the loadout. Enter your character name and the exact saved loadout name in Shakedown, then choose **Read saved loadout**.

Review the detected ship and equipment. STO can retain older records; the newest record is not proof of ship ownership. Select the record that matches your setup, choose a ship profile/loadout (or create them), enter a new variation name, confirm, and import.

The variation retains an equipment snapshot. Choose **Analyze a new run** from that variation to select it for your next combat log. Logs do not establish which equipment you flew; verify the setup for each run. Existing variations and runs are not overwritten.

This is a local experiment, not a public release. It supports the particular STO executable verified during development and refuses other builds. It requires Windows PowerShell and a running 64-bit STO client. The reader opens the process for query/read only, never writes game memory, and stops after a bounded timeout. No capture is sent to a remote service.

Readable equipment names and item IDs are included when resolvable. Empty saved slots remain visible. New captures include mark, rarity, and recognized modifier labels where exact item ID and definition matches agree. These are item properties observed now, not historical values at the loadout save time. Static items without supported properties and conflicting or incomplete reads remain unavailable. Older snapshots are not retroactively enriched; capture again to record these fields. Traits, bridge officer assignments, icons and automatic ship/loadout ownership are not verified. Bag labels are experimental. Capture is a point-in-time view and does not monitor equipment changes.

Extract the complete package into its own folder. To use existing Shakedown data, close the old app and copy its backed-up data folder beside the new Shakedown.exe. Keep the original installation and backup.
