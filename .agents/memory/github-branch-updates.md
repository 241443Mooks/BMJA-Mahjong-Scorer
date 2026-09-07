---
name: GitHub branch updates
description: Safe connector fallback when shell Git cannot authenticate to this repository.
---

If a normal `git push` fails because the workspace HTTPS credential is invalid,
use the installed GitHub connector rather than requesting or exposing a token.
Build Git Data API objects only after confirming the remote branch still points
to the local commit's parent, and require the uploaded tree hash to equal the
local tree before advancing the remote ref.

**Why:** The connector can remain healthy when shell Git authentication is
stale. The code-execution shell may add carriage returns to line-oriented output
and silently cap a single captured output near 80 KB; either issue can corrupt
an API-built tree unless guarded.

**How to apply:** Try ordinary push first. On authentication failure, strip
carriage returns from parsed Git output, split large base64 payloads into
byte-aligned chunks, verify every final tree hash and ref, then synchronize the
local branch to the connector-created remote commit.