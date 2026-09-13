# v0.6.0 EXE launcher test build

Extract the complete ZIP to a new writable folder (for example Documents), then double-click **Shakedown.exe**. Keep its accompanying files and runtime folder. Node is included. No command window is needed; the interface still opens in your default browser.

To test with your existing ships and runs: exit the older version, back up its data folder, then copy that folder into the extracted 0.6.0 folder before launching. The original installation is not modified. This build remains portable; AppData migration and an installer are later work.

Use Exit Shakedown for immediate shutdown, or close the last app browser tab and wait 15 seconds. A second launch from the same folder shows an already-running message. Different copies use different local ports and independent data folders. Do not run old and new copies against a shared data folder.

Please test:
- Double-click launch with no command window, including from a path containing spaces.
- A second double-click while it is running.
- Import, analyze, save, close, and reopen; confirm your saved data remains.
- Exit Shakedown and browser-tab closure both stop the background server.
- Close/reopen while another application uses port 4317.

This is an unsigned Windows x64 test build. Windows may show an unrecognized-publisher warning. Signing and installer distribution are not implemented yet. The launcher uses Windows .NET Framework; the bundled Node runtime powers the server and isolated parser processes.

Developer checks: Shakedown.exe --check-runtime validates the runtime can start. Shakedown.exe --smoke-test starts the actual server without opening a browser, uses a separate build/launcher-smoke-data directory, and checks startup and automatic shutdown.
