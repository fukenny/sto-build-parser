# 0.6.7.2 local desktop preview

New captures show mark, supported rarity labels, and recognized modifiers beneath each item name. Duplicate modifiers are counted (for example, [Dmg]x2). IDs remain visible. Equipment snapshots retain these observed properties after import and restart.

The reader matches exact 64-bit item IDs and internal definitions, checks record stability during reads, and requires matching candidate property values to agree. Limited scans and conflicting candidates do not provide a value. These safeguards do not prove every agreeing cached record is current. Review the capture against STO before saving. Properties describe the capture-time observation, not a historical record of upgrades or re-engineering when a named loadout was saved.

Supported labels currently include Mk I–XV when a valid progression level exists; Very Rare, Ultra Rare, and Epic from verified quality codes; and Acc, CrtH, CrtD, Dmg, Ac/Dm, Arc, and Cap modifiers. Other properties remain recorded internally but are not guessed into modifier labels. Items without supported instance properties (including many fixed consoles, devices, hangars, and doffs) display details unavailable. Missing does not mean Common, Mk 0, or no modifiers. Older snapshots remain unchanged and show “Not recorded in this capture”; make a new capture to obtain details.

Also includes the requested Active Duty Officers category label, Discord footer link, removal of Download Instructions, Arc/Epic wording, and Log Folder numbering 00/01/02. Only the exact Discord invite is allowed to open externally from Electron; other new windows stay blocked.

Delete-all-local-data is recorded in ROADMAP.md only. No data deletion action is implemented. No descriptions, effects, icons, or accordion redesign are included.

Launch Shakedown.exe from the complete extracted Electron package. This is not a GitHub release. Close the previous version and copy its backed-up data folder beside the new EXE if you want to use existing data.
