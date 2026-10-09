# v0.6.8.1 — Ship capture hotfix

- Start the bundled reader from downloaded ZIPs using a process-only PowerShell execution policy. Persistent Windows policy and downloaded-file markers are unchanged.
- Support STO executable SHA-256 `767205C5B74A34B55BAED0BD1411FA41FF7205758A3CF99E802EA43C530CCE62`, after rediscovering its ship, saved-loadout, and item schemas and checking live output.
- Increase the bounded name-match capacity from 512 to 8,192. A busy session can contain hundreds of copies of a character name before the actual ship reference. Report capacity exhaustion explicitly.
- Improve unresolved-record messages so reader failures do not simply tell users to enter space or save again.

Extract into a new folder and launch Shakedown.exe. Starting with no data folder is supported. To retain existing work, close Shakedown and copy your backed-up data folder beside the new executable.

Capture remains experimental and read-only. Review the detected ship and equipment before importing. Unknown client builds remain blocked; cached records and unavailable item details retain the existing warnings.
