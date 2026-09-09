# Security hardening branch

Included in v0.5.1. The superseded v0.5.0 ZIP has the findings in the [original review](SECURITY-REVIEW-2026-09-08.md).

## Private launch session

Start.cmd starts the server and opens a URL containing a random 256-bit bootstrap secret in its fragment. The server also prints this private launch URL for manual fallback. Do not share that URL or terminal output. The bootstrap expires five minutes after startup and can be exchanged once, with an exact local Origin, for an API token. The browser immediately removes the fragment and keeps its API token in tab sessionStorage, allowing refreshes. Public HTML contains neither credential. Requests to the public homepage alone no longer grant workspace access.

Use the already authenticated tab while the launcher is running. If that tab is lost or startup expires, close the launcher and start again. The alternative PowerShell launcher delegates to Start.cmd so both use this flow. Do not run as administrator. Application data continues to use the existing data folder and inherited filesystem permissions; no OS-account isolation or ACL migration is claimed. Same-user malware, browser extensions with sufficient permissions, or access to private launcher output remain outside this protection. A second Windows-user test is pending.

## Isolated, bounded imports

The server forks a parser child with a 256 MiB V8 old-space heap limit and a 60-second deadline. This is not a Windows sandbox or a total process/RSS memory limit. The child runs with the user's permissions. Unexpected exit, timeout and validation failures produce an import error; the server and saved data remain available. Child processes stop when their parent disconnects.

Limits also include 16,384 characters per record, 500,000 valid records per parser, 100 players per combat aggregation, 2,000 ability/source entries per player, 50,000 incoming timeline buckets, and 250,000 unique records for combined imports. Result serialization is capped at 32 MiB before IPC. Existing input byte limits remain. Invalid date/time components and extreme numeric magnitudes are skipped. These conservative limits can reject unusually large legitimate sessions; select smaller completed logs. They have not been calibrated against every patrol or full-day log.

## Recoverable saves

Mutations execute serially on a clone of the latest committed state. The clone is written to a temporary file and renamed before becoming the live state. A failed transaction leaves the old state intact and does not poison the queue. This also prevents rollback from undoing another concurrent successful update. Existing raw logs and data format are preserved.

## Validation

- All 15 automated tests pass, including one-time startup exchange, invalid bootstrap/origin rejection, failed save rollback and subsequent recovery, concurrent mutations, resource-limit errors, timeout, and successful import after rejected input.
- A 42,060-record real log produced identical direct and isolated-parser results. No personal logs are checked in.
- Browser startup exchanged the private credential successfully and cleared the URL fragment.
- Existing parser/comparison and API regressions continue to pass.

Still pending: testing under a second Windows login, clean-VM process/network observation, broad legitimate-log limit calibration, security-product scans and an independent review. This branch is not a security certification and does not include a Python migration or a new public binary release.
