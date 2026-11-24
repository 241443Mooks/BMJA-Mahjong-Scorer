# Issue #147 · private typed interpretation preview

Draft PR #563 contains a typed-only preview for standalone British (BMJA 1.0) non-winning grouped hands in normal mode. It uses the existing hand-entry workspace and scorer. The private preview served the first approved live evaluation. Each subsequent deployment requires approval for the exact candidate commit.

## Verification completed offline

- Each of the 26 corpus cases has its own test against expected evidence, with explicit expectations for unsupported information and acceptance readiness. The expected proposals passed all 26 checks. In an empty British hand, cases 01–06, 09–16 and 26 were ready. Cases 07–08 preserved unknown exposure. Cases 17–20 and 24–25 needed tile clarification. Cases 21–23 left unsupported loose tiles, a Flower, or winner context unresolved and retained any supported group.
- Additional tests reject guessed exposure and tile identity, fabricated source spans, unrelated clarification, and dropped evidence in a mixed case. Reordered groups can pass.
- The UI regression exercises a queued manual edit racing with acceptance. The stale update preserves the review and existing group. Retrying applies the proposal and preserves the working picker. A fifth physical copy is rejected.
- A UI fixture adds the same exposed Pung of 3 Circles through review and then through manual entry. With a previously entered concealed Pung of 1 Characters, both paths show **10 points, 10 base, 0 doubles**. This exercises the existing British runtime from the normal scorer surface.
- Worker tests cover application JWT signature, issuer, audience, expiration, request validation, alternate-host rejection, missing secret, and quota persistence across object instances. Wrangler can bundle the separate Worker and assets in dry-run mode.
- The local Chromium preview loaded the typed panel and existing manual scorer. A submitted synthetic description produced the unavailable state and preserved the entered Pung and its **8-point** score. The screenshot in the work session shows the keyless local path.

The offline fixtures check the evaluator and scoring integration. The live baseline below measures interpretation through the private API.

## Live baseline and interpretation failures

The first live run used commit `8d86b8bb5c95a9fa46f546ba19557e46b25d0b25` with `gpt-5.4-mini-2026-03-17`. The [original per-case report](VOICE_147_BASELINE.jsonl) is preserved byte for byte. It records the diagnostics and numeric usage without raw request or model output bodies. It establishes which fields, source spans and readiness checks differed from the original [26 cases](../../artifacts/mahjong-scorer/voice-dev/evaluation.json). It cannot establish exactly which unmatched text the model returned or why it chose it.

All 26 requests received HTTP 200 from the preview and OpenAI. Exact evidence and acceptance passed in 19 cases. Readiness matched in 22 cases. All 11 expected clarification cases stayed blocked, and 4 of the 15 expected-ready cases were incorrectly blocked. Four cases had unsupported guesses and five had omissions or unexpected unresolved fragments. OpenAI latency was 1,237 ms p50 and 1,687 ms p95. The total estimated API cost was $0.017721.

| Case | Expected | Observed in the saved diagnostics |
| --- | --- | --- |
| 09 | Ready exposed Pung using spoken aliases with filler | All five spoken facts matched and the source span passed. An unexpected unresolved fragment blocked acceptance. |
| 13 | Ready concealed Pung of 4 Characters from “closed pong, four cracks” | Kind and exposure matched. Tile family, identity and rank were missing. The group was ambiguous, its source failed the expected span check, and there was an extra unresolved fragment. |
| 15 | Ready concealed Pung of 6 Bamboo with the group name last | Tile and exposure matched. The group type was missing, the source span did not support the whole group, and a second unsupported group and ambiguity blocked acceptance. |
| 16 | Ready exposed Green Dragon Pung after an explicit correction | All expected facts and the source span matched. The retained ambiguity was the sole blocker. |
| 17 | Exposed Pung with unknown tile after an incompatible honour name | Kind and exposure matched. The proposal supplied an unsupported tile family and identity. The ambiguity flag still blocked acceptance. |
| 19 | Exposed Chow with unknown tile after an invalid sequence | Kind and exposure matched. The proposal supplied an unsupported tile family, identity and rank. The structural Chow check blocked acceptance. |
| 21 | Unresolved loose tiles without a group | A group was inferred without a stated group type and the expected loose-tile span was missing from the unresolved evidence. Acceptance stayed blocked. |

The candidate instructions now require explicit group names, explain common tile vocabulary, validate the whole Chow sequence, apply clear corrections only to the relevant field, and distinguish unresolved evidence from filler. The Worker withholds groups without a supported name, structurally impossible Chow tiles, and proposed tiles for already unresolved Wind or Dragon naming conflicts. Both group sources and unresolved fragments must be verbatim. The Worker preserves remaining evidence for review and never derives a replacement tile or group. The prompt still handles semantic interpretation of conflicting names and corrections, which need live verification.

## Candidate comparison

After approval, run the unchanged 26-case corpus and the separate [10-case holdout](../../artifacts/mahjong-scorer/voice-dev/evaluation-holdout.json). The holdout includes terminology, filler, trailing group names, corrections, ambiguous honours, an in-range but non-consecutive Chow, loose tiles, and mixed supported and unsupported evidence. Its inputs are absent from the prompt and the original corpus.

```sh
node artifacts/mahjong-scorer/voice-dev/evaluate.mjs https://<approved-preview-host> > candidate-26.jsonl
# Wait 60 seconds between runs to stay within the rolling per-tester limit.
node artifacts/mahjong-scorer/voice-dev/evaluate.mjs https://<approved-preview-host> --holdout > candidate-holdout.jsonl
```

Each run is complete when its summary reports the intended attempt count, even if it exits non-zero for evidence mismatches. Use separate reports and record the candidate commit. Compare exact evidence, readiness, cases with unsupported guesses, provider latency and estimated cost. Count incorrectly blocked and unexpectedly ready cases separately. The two runs require 36 attempts, so start them with sufficient daily and lifetime quota available. The candidate has offline verification only until it is approved and the live reports are collected.

## Owner setup before private deployment

1. Choose a dedicated unused Cloudflare-proxied hostname, for example `voice-preview.<your-zone>`. Use the separate Worker `mahjong-typed-private-preview` and its dedicated asset build and Durable Object. Verify the selected account, zone and Worker name are distinct from production resources. Check that no existing DNS record, Worker route, origin or Cache Rule on that hostname can serve or cache content outside this Worker.
2. In **Cloudflare Zero Trust → Access → Applications**, create a **Self-hosted** application for that exact hostname, with the path left blank so the policy covers the page, API and static assets. Use a short session such as one hour, long enough for the suite. Add an **Allow** policy whose **Include → Emails** contains only the owner’s individually named email address. Select the approved identity provider. Check every applicable and inherited policy for this hostname and all its paths. The effective Allow policy must be restricted to that email. Everyone, broad group or domain grants, Bypass, and Service Auth must be absent. Record the app's **Application Audience (AUD) Tag** and the team issuer URL, for example `https://<team>.cloudflareaccess.com`.
3. In a dedicated OpenAI project, have the owner select or create a project key restricted to writing Responses and allow the pinned `gpt-5.4-mini-2026-03-17` snapshot for Responses with Structured Outputs and standard processing. Confirm the account's rate, pricing and data-retention settings and configure a project budget alert. Use synthetic Mahjong descriptions for this first test. OpenAI receives each description with `store: false`; provider abuse-monitoring retention is governed by the project settings. The app keeps description and proposal in memory for review and sends no transcript or output to Worker logs, storage or caches.
4. From the repository root, initialise artwork, install dependencies and build the dedicated asset directory. Reuse the ignored owner config beside the template if already prepared. Otherwise, copy the template. In that copy set `vars.PREVIEW_HOST` and `routes[0].pattern` to the same exact hostname, set `vars.ACCESS_ISSUER` to the team URL without a trailing slash, and set `vars.ACCESS_AUD` to the application's AUD tag. The checked-in template intentionally uses a reserved invalid hostname.

   ```sh
   git submodule update --init --depth 1
   pnpm install --frozen-lockfile
   pnpm --filter @workspace/mahjong-scorer run build:voice-preview
   cd artifacts/mahjong-scorer/voice-preview
   # For a fresh checkout only, copy and fill the ignored config.
   test -f wrangler.owner.jsonc || cp wrangler.jsonc wrangler.owner.jsonc
   # Confirm the owner config contains the approved values before the dry run.
   npx wrangler@4.166.0 deploy --dry-run --config wrangler.owner.jsonc
   ```
5. **Approval gate.** Obtain explicit owner approval for the exact draft commit, Cloudflare account and preview hostname, owner-only Access policy, OpenAI project, and the bounded paid run. Before deploying, require the owner to confirm that the effective Access Allow policy names only their individual email and that no Everyone grant, broader Allow, Bypass, or Service Auth applies to the preview hostname or its paths. Hold deployment until that confirmation and explicit deployment approval are both received. The commands below are for the owner or authorised Cloudflare operator after approval only.

   ```sh
   # From artifacts/mahjong-scorer/voice-preview
   npx wrangler@4.166.0 whoami
   npx wrangler@4.166.0 deploy --config wrangler.owner.jsonc
   npx wrangler@4.166.0 secret put OPENAI_API_KEY --config wrangler.owner.jsonc
   ```

   Enter the project key directly at the Wrangler secret prompt. The API fails closed until the secret exists. Keep the key only in the encrypted Worker secret. Keep it out of chat, shell arguments, shell environment, config vars, env files and the frontend. Keep Workers observability disabled and check that account-level log export and observability do not capture request or response bodies.

The Worker validates the signed Access application JWT before it serves assets or handles the API. The deployment disables `workers.dev` and version preview URLs. The Worker checks the exact HTTPS host and requires the API's same-origin POST with uncompressed JSON. Each request is limited to 4 KiB and 2,000 UTF-16 code units of description. The Worker reserves a call atomically before contacting OpenAI, spends one reservation on any attempt that reaches that step, makes a single upstream request with a 30-second timeout and caps output at 2,000 tokens. The single SQLite-backed Durable Object enforces 5 calls per tester and 10 across all testers in a rolling minute, 80 per tester and 90 across all testers per UTC day (temporarily increased for the 26-case baseline plus 10-case holdout comparison), and 100 total across the life of this preview. It stores counters, timestamps and hashed Access subject IDs. The global lifetime cap stays in place across Worker versions. An OpenAI budget alert is a notification. The enforced attempt caps are in the Worker.

## First approved test

1. In a signed-out session verify `/voice-test`, a known `/assets/...` URL and a POST to `/__voice/interpret` all require Access. Repeat with an identity outside the allowlist. In the Worker settings confirm both alternate preview URL types are disabled. Sign in as an authorised tester and verify the page and its assets load. Verify an authenticated cross-origin POST is denied and an authenticated oversized body receives `413`. Run the quota tests locally to avoid consuming the live budget for rate-limit checks.
2. On `/voice-test`, retain British rules and the East/East non-winning normal hand defaults. Manually enter the default concealed Pung of 1 Characters. Type `pong of three dots` and select **Interpret**. Capture the source, proposed 3 Circles artwork, **Exposure unknown**, and the disabled **Accept groups**. The previously entered group should still show 8 points. Confirm exposure as **Exposed** in the review, or choose **Edit**, type `exposed pong of three dots` and interpret again to exercise correction. Capture review before acceptance.
3. Select **Accept groups**. Capture both groups, the working picker and the breakdown. Check for **10 points, 10 base, 0 doubles**. Remove only the added group and re-create it using the manual selector for an exposed Pung of 3 Circles. Verify the same score and breakdown lines. Record the reviewed commit, model and any discrepancies. Capture screenshots with synthetic descriptions and omit Access badges, headers, tokens and tester identity.
4. From the repository root on a tester's machine with `cloudflared` installed, sign in to the same Access app and run all cases. The evaluator retrieves the Access token through `cloudflared` in memory. It makes one request per fixture, waits at least 12.5 seconds between requests, reports each case and exits non-zero if any case fails. Supply a final argument such as `07` to rerun a specific case. Leave five minutes or more for the full run and reserve enough of the tester's daily allowance for 26 calls plus the browser walkthrough.

   ```sh
   cloudflared access login https://<approved-preview-host>
   node artifacts/mahjong-scorer/voice-dev/evaluate.mjs https://<approved-preview-host>
   ```

   The JSON lines report exact evidence and source coverage, correctly preserved unresolved facts, omitted facts, incorrect guesses, readiness, failure reasons, round-trip and provider latency, and usage where returned. The final line reports provider p50/p95 and estimated USD for metered responses. Estimates use standard text rates of $0.75 uncached input, $0.075 cached input and $4.50 output per million tokens. Check pricing and reconcile with the dedicated project's actual usage after the run, including failed or timed-out attempts with no usage returned. Save the metrics report and the opted-in synthetic screenshots for owner review. The runner does not write raw descriptions or responses. [OpenAI model and pricing](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
5. Report every live failure by case ID and cause. Review cases that passed exact evidence but correctly require manual clarification, and record any user journey differences as findings before approving the next slice.

Existing scope limits include other rules profiles, winners, tracked games, special layouts, remaining or blank tiles, and unsupported bonus or context descriptions. Edit currently means revising and re-interpreting the description or explicitly confirming missing exposure before acceptance. The build has a large-bundle warning.
