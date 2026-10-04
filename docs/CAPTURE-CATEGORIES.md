# Equipment category evidence

The initial prototype incorrectly guessed several numeric bag IDs. Corrected labels use the saved Elston baseline (`beam-broadside-baseline-matches.json`), resolved Sunnyside Cannon capture, and the user's in-game equipment screenshots. These are observed mappings, not a fully decoded game enum.

| Slot ID | Display category |
|---|---|
| 53 / 54 | Fore / aft weapons |
| 65 | Deflector |
| 60 | Impulse engines |
| 62 | Warp / singularity core |
| 58 | Shield |
| 72 | Universal console slots |
| 69 | Engineering console slots |
| 71 | Science console slots |
| 68 | Tactical console slots |
| 73 | Devices |
| 74 | Hangars |
| 61 | Vanity slipstream |

A universal console in an engineering slot stays under Engineering console slots. Item names do not override the saved slot category. IDs 55–57, 59, 66, 80 and all other unmapped IDs remain unverified; empty records alone do not establish a category. No records are discarded, and raw bag/slot/item IDs remain unchanged in saved snapshots. Existing snapshots receive corrected headings when rendered without a data migration.
