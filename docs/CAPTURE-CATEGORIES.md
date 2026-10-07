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
| 61 | Vanity Impulse |
| 59 | Vanity Shields |
| 66 | Vanity Deflector (provisional; no populated slot verified) |
| 80 | Active Duty Officers |

A universal console in an engineering slot stays under Engineering console slots. Item names do not override the saved slot category. IDs 55–57 and all other unmapped IDs remain unverified; empty records alone do not establish a category. No records are discarded, and raw bag/slot/item IDs remain unchanged in saved snapshots. Existing snapshots receive corrected headings when rendered without a data migration.

Category 80 was identified by the user on October 7, 2026, matching saved-capture officer names against the in-game Active Space Duty roster (Beckett Mariner, Shorfooth, Kel the Retributor, and Jacob Alan Wald). This confirms the category in that capture, not specialties or active effects.

October 7 follow-up: user screenshots place the vanity slipstream item in the Visuals Impulse slot and the 8472 Counter-Command Vanity Shield in category 59. Category 66 is provisionally grouped with vanity slots, explicitly unverified. Hangar Pets follows fore/aft weapons; Active Duty Officers is last.
