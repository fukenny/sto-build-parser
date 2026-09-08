# STO Shakedown code security review — 2026-09-08

Reviewed commit: 252dab92d5ec4a3109e89149b58770f95c6fb01f (v0.5.0 application plus download documentation). Runtime used for probes: Node 24.19.0. This is a focused source review with isolated synthetic tests, not an independent penetration test, antivirus certification, or current Node-CVE audit.

During the review, no application code, real logs, real workspace data, releases, or GitHub content was changed. This report was subsequently published separately; the findings below remain unfixed in v0.5.0. Test files are under ignored build/. The audit server used a random loopback port and a separate data directory; it was stopped afterward.

## 1. Local clients can obtain the API token and access the workspace

**Medium if untrusted local users are in scope; otherwise an explicit trust limitation.** References: server.mjs:148, server.mjs:51, server.mjs:58.

GET / supplies the API token without authenticating a user or launcher session. A non-browser process can fetch that page, read its token, omit Origin, and invoke the API. The server does not distinguish operating-system users. Loopback limits network reachability but is not per-user authentication.

Reproduced: a separate non-browser client fetched the token, selected a different synthetic combat-log folder, read state, and created a build. No real data was touched. Cross-account access was not exercised under a second Windows login; the absence of an OS identity check is established by source. Same-user malicious code usually already has filesystem access, so that case does not by itself constitute a new privilege escalation. Shared Windows machines or running Shakedown elevated make the distinction more consequential.

Impact: potential disclosure/modification of workspace data and invoking the application's limited file-reading operations as the server's user. This is not a demonstrated ability to read arbitrary files as raw bytes, execute arbitrary commands, or access the app from the Internet. A normal remote webpage cannot simply reproduce the test because browser same-origin rules and the API Origin checks apply.

Recommendation: explicitly define the local-user threat model. For user isolation, establish the UI session through a trusted launcher with a private bootstrap secret or OS-authenticated per-user IPC; do not make the authority-granting token obtainable from the public root page. Keep least-privilege execution and existing browser protections.

## 2. Crafted logs can amplify memory use beyond the input-size limits

**Medium availability risk; user-assisted import required.** References: lib/parser.mjs:50, lib/parser.mjs:97, lib/parser.mjs:98, lib/parser.mjs:135; server.mjs:84.

The parser limits input bytes but not line length, unique players, abilities, source identities, accumulated objects, or parse time. Single-file processing maintains segmented and whole-file aggregates simultaneously. Combined imports additionally retain raw records and per-file results. Parsing runs in the server process, so fatal heap exhaustion can terminate the application.

Reproduced in a child process with a deliberately bounded 128 MiB V8 heap: a 5,437,780-byte synthetic log containing 60,000 unique player identities caused fatal heap exhaustion, exit 134. This is well below the advertised input-size limit. The default-heap failure threshold was NOT tested; this result must not be described as a 5 MB log crashing every standard installation.

Recommendation: bound record length and aggregation cardinality, validate timestamps/numeric ranges, add work/time limits, and isolate parsing in a resource-limited child process that can fail without killing the UI/server. Reject over-budget input with a clear error. A Python translation alone would not remove this design issue.

## 3. A failed write permanently rejects the save queue until restart

**Low security relevance; confirmed persistence/reliability defect.** References: server.mjs:35 and server.mjs:98.

The save queue chains only success callbacks. After writeFile or rename rejects, future saves chain onto the rejected promise and never execute. State mutations occur before persistence succeeds, so subsequent reads display records absent from disk.

Reproduced in audit-only data: obstructed state.json.tmp with a directory, triggered one failed save, removed the obstruction, retried. The retry still failed; disk held one build while in-memory state held three. An ordinary filesystem failure can trigger this without an attacker. The API did report failure; this is not a false success response.

Recommendation: recover the queue after failure while reporting each failed operation, and apply state changes transactionally or roll them back so unsaved records are not presented as durable.

## Checks that held

- Missing API token rejected.
- Foreign and null Origin rejected even with a valid token.
- Wrong Host rejected using a raw HTTP client.
- Cross-origin preflight rejected; no permissive CORS header.
- Attempts to fetch data/state.json, server.mjs, and encoded traversal paths did not return those files.
- Analyze rejected a filename containing parent-directory traversal.
- Request bodies over the application limit rejected.
- Source review found escaping at the inspected log/build-name HTML insertion points and restrictive script CSP; no successful script-injection path identified. No live-browser adversarial XSS test was performed in this review.
- Child-process invocations use fixed folder-picker code and do not interpolate log content into commands. No arbitrary-command endpoint identified.
- Runtime source binds to 127.0.0.1. No application log-upload or external-fetch path identified; release/build scripts intentionally use network access and are separate from application runtime.
- Existing 13 automated tests passed.

## Evidence and limits

The probe harness and synthetic input are retained locally under the ignored build directory and are not included in this publication. No personal logs or workspace data are published. The reproduction conditions and observed results are described above. The initial harness Host probe was corrected to use node:http because fetch did not send the intended Host override; the raw HTTP test passed.

Not covered: fresh-VM packet/process monitoring, testing under a second Windows user, Windows security-product scanning, third-party binary internals, current CVE applicability, exhaustive fuzzing, code signing, or an independent reviewer. No high/critical remote-code-execution finding was established by this review. That is not proof of absence.

## Planned remediation — not yet implemented

1. **Private session startup:** remove the token from unauthenticated HTML. Have the trusted launcher pass a fresh, unpredictable bootstrap secret to the browser using a URL fragment, exchange it for a session, and clear the fragment immediately. Serve only a non-sensitive shell before authentication. Do not publish a bootstrap endpoint that simply hands out the secret. Retain Host, Origin and frame protections. Use per-user data permissions and never require elevation. This separates ordinary local HTTP clients from the app session; it does not defend against malware already running with the same user's full privileges. For stronger isolation, consider OS-authenticated per-user IPC with a desktop UI.
   **Acceptance:** an independent local client cannot get workspace data or write changes by fetching the public homepage; normal startup still works; a second Windows account cannot bootstrap a session; browser-origin tests remain passing.

2. **Bounded, isolated imports:** impose record-length, entity-count, accumulated-data and time limits. Parse in a child process with a memory budget; return a clear error when that process exceeds its budget or exits unexpectedly. Keep the server responsive and preserve prior saved data. Validate numeric/date ranges and test limits against representative legitimate logs before selecting production thresholds.
   **Acceptance:** malformed and high-cardinality fixtures fail safely, a later normal import succeeds, the server remains available, and legitimate fixtures retain their previous measurements.

3. **Recoverable, transactional saves:** keep the write queue usable after a rejected operation, propagate that error to the caller, and serialize each mutation with its disk commit. Commit a cloned candidate state using temporary-file/rename, then update the live state only after success. Avoid whole-state rollback that could discard a concurrent successful change.
   **Acceptance:** simulate a failed write, remove the obstruction, save successfully without restart, and verify memory matches disk. Test concurrent requests and restart persistence.

Suggested sequence: fix saves first, isolate and limit imports next, then complete private session startup and Windows user-isolation tests. Publish a new version and matching test results after the fixes are verified. A language migration is not required for these corrections.
