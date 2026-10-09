# Capture hotfix validation — October 9, 2026

The freshly downloaded 0.6.8 Capture.ps1 carried a Zone.Identifier stream with ZoneId=3 and reproduced `AuthorizationManager check failed.` Windows PowerShell launched it successfully with a process-only execution-policy setting.

Read-only schema discovery against running GameClient.exe SHA-256 `767205C5B74A34B55BAED0BD1411FA41FF7205758A3CF99E802EA43C530CCE62` reached address-space-end. Verified the offsets consumed by the reader in SavedEntityData, PuppetMaster, EntityLoadout, LoadoutItem, ItemDef, Message, Item, AlgoItemProps, and ItemPowerDefRef. Research output remains local under build/hotfix-validation.

The original name scan stopped collecting Fenster at 512 matches. Raising the bounded capacity found 884 matches and resolved U.S.S. CV Elston, ID 155752726. Live capture of Beam Carrier Advanced Valkyrie returned 38 saved entries, including four fore weapons, three aft weapons, and two Advanced Valkyrie hangars. Weapon property records resolved with marks, quality codes, and modifier definitions; unavailable properties stayed unavailable. The earlier entered name Beam Carrier x2 Advanced Valkrie was present in text but did not resolve to a populated saved record.

All 33 automated tests passed. New Windows integration tests exercise download-marked entry and helper scripts, discovery past 512 matches in real process memory, and explicit capacity-limit reporting. Existing import persistence, rollback, combat analysis, and application lifecycle tests pass.

The extracted 0.6.8.1 ZIP passed an additional live API workflow using its bundled Node runtime, an initially absent data folder, and ZoneId=3 on every bundled capture script: capture 38 entries, generate preview markup, import into test data, restart, verify the identical saved snapshot, and shut down. The packaged Electron executable also started its renderer and backend; its hidden launch did not expose a main-window handle, so this was not a visual UI verification.

This validates one live character/loadout and the checked client fingerprint, not every ship or independent historical save fidelity.
