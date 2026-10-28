# What's next — project handoff roadmap

**Snapshot:** 28 October 2026 (current handoff; earlier architectural snapshots retained below)
**Purpose:** current restart point after truth-corpus closeout, Riichi preflight and recent product-assurance work.
**Live authority:** issue #105 remains the programme map; this file is the dated handoff companion, not a second backlog.

## 28 October 2026 — evidence-led product focus (supersedes 26 October ordering)

**Authority:** [live programme map #105](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/105), production `main@3f68b860`. The user has deliberately narrowed the near-term product question: **is Mahjong Reference a dependable, mobile-first scoring and game-tracking companion?** Avoid treating the larger Encyclopaedia or personalised learning platform as an automatic next release.

- **First measurement slice:** [#556](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/556) / [draft #557](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/557) restricts PostHog collection to the production hostname, preserves `ruleset_selected` semantics and documents measurement/privacy limits. It is **draft, unmerged, undeployed and incomplete**: meaningful hand-score and game-completion events are not implemented. Live recalculation of partial hands, game Undo/reconfirmation and automatic recovery make naive completion/resume events misleading. Define and test durable event boundaries separately; do not add artificial user actions solely for analytics.
- **Evidence caveat:** earlier all-host PostHog views included localhost and Cloudflare previews. Production-only last-30-day pageviews at the 27 October review: Home 198, Game 133, Hand 64, Rules Comparison 7. These are pageviews, **not completed tasks, proven demand or reliable retention**. Mobile accounted for 555 of 673 production pageviews in the device breakdown. Avoid overinterpreting development/owner QA.
- **Near-term priority:** finish and review the small production-only analytics foundation, agree genuine completion event definitions, run [#253](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/253) production/mobile/recovery QA and use [#89](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/89) table feedback to fix proven scoring friction. Observe aggregate outcomes for 2–4 weeks after trustworthy instrumentation ships.
- **Reference scope held for decision:** [#541](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/541) and stacked [#553](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/553) remain draft and require owner approval. Coordinate [#554](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/554)/[#555](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/555) as a **bounded evidence-led scope/release decision**, not a mandate for site-wide expansion. Preserve completed work without automatically shipping it.
- **Independent tracks:** Riichi [#494](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/494) remains the prerequisite before #262; MCR remains provisional. Public What's New remains at its existing October player milestone; no new player-facing merge has occurred since test-only #536 on 23 October.
- **Branch cleanup:** [#398](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/398) tracks eight reverified exact-head merged candidates; protect all eight current draft PR heads including #557, stacked bases and unique/ambiguous work. No deletion.

## 26 October 2026 — historical handoff (supersedes the 3 October priority snapshot below)

**Authority:** live programme tracker #105 and current `main`. The sections below preserve the earlier architectural context; this section is the current product handoff.

- **Reference release gate:** Draft #541 integrates the rules reference, comparison and Encyclopaedia; draft #553 is stacked on #541 for selected-rules learning. Both are unmerged. Coordinate #554 (read-only whole-site walkthrough) and #555 (owner release decision) before any merge. Five public Encyclopaedia articles and 36 displayed comparison questions in the draft do not prove full coverage. #552 owns Encyclopaedia discovery planning; do not duplicate it or turn this review into a broad redesign.
- **10 October field validation (#89):** three real tables used the app; players valued it. Repeated full-hand calculation and end-of-hand scrolling were major friction, including for experienced players. Terminology, identifying winds/flowers/seasons and progression clarity also need attention.
- **Merged:** #521 preserves finished games as dated local, read-only ledgers with print/save and second-tab protection. #525 makes hand outcome/winner explicit, records directly after deterministic settlement validation, leaves settlement details optional and supports Undo. #517/#518 improved player entry and contextual hand scoring. #527 adds the compact Previous games homepage card, #528 uses plain-language tile-group labels, and #529 opens final standings at completion and offers Start a new game.
- **Not cloud storage:** previous games persist in the same browser/profile/device subject to site-data clearing and browser limitations. Important records should be exported.
- **Next product QA:** formal end-to-end production verification #253, including the full calculator → record → undo → next hand journey, finished-game history and browser-process restart recovery. Owner phone feedback is positive, but does not satisfy the formal #253 gate.
- **Next bounded UX:** #519 terminology and #522 Previous games homepage card are implemented by merged #528/#527; do not reopen them. Investigate wind/flower/season reference assistance and seating/progression clarity using #89 evidence before creating implementation contracts.
- **Public What's New:** the October “Revisit your finished games” milestone is merged through #530 and live. Maintain curated outcome-level history, not one entry per PR; minor polish alone does not warrant publication.
- **Independent rules work:** #494 has a bounded Codex handoff dated 22 October and remains unimplemented; Riichi proceeds #494 → #262 → #263 → #264, with experienced-player validation before stable release. MCR remains provisional.

## Where Mahjong Reference is now

Mahjong Reference is a multi-ruleset Table Companion rather than the original British-only scorer.

Production `main` has:

- five public rules profiles: British / BMJA-style, Western — Thompson & Maloney, Club, Buzzard 2000 and MCR / WMO 2006 `0.1`;
- the shared rules platform, permanent parity/replay harness and current caller cutover;
- rules-aware one-hand scoring and whole-game tracking;
- settlement, balances, East/Wind progression, history, recovery and printable records;
- the completed Classical hybrid evidence-first hand-entry model;
- a task-first mobile hand calculator and state-safe canonical Share action;
- a concept-first Special Hands Guide with 71 learner entries backed by 146 exact current Classical treatments;
- exact scorer-result → Guide-treatment deep links and local comparison of 2–3 exact treatments;
- the completed #399 machine-readable rules-truth architecture, with typed source/evidence/treatment records, fail-closed integrity gates and Classical + MCR proof;
- the shared #406 profile × dimension contract for #296/#405 projections.

Historical 3 October production baseline: `718bdc496983a249ef714d090872075116fce6a0`. Current 26 October `main`: `3f68b860f6e31c59f2597e765e3d15c56d883ac1` (last merge: test-only PR #536 on 23 October).

## Completed architecture programme — #399 rules truth

**#399 is closed complete.**

Delivered slices:

- **A / PR #438** — Truth Model v0 and authority contract;
- **B / PR #439** — Classical Special Hands source → treatment → runtime proof;
- **C / PR #441** — canonical typed/sharded truth corpus + query surface;
- **D / PR #442** — fail-closed integrity and reverse-impact validation;
- **E / PR #443** — MCR second-family proof;
- **F / PR #444** — pre-Riichi readiness audit, PASS.

The proved authority chain is:

```text
real source
→ source record
→ evidence claim
→ canonical semantic identity
→ exact profile treatment
→ executable profile/runtime
→ downstream projection / decision trace
```

The important boundary is that #399 proved this **vertically**. It did not turn into the bulk migration it was designed to avoid.

## User-facing truth path tightened after the architecture work

Two small but important Special Hands improvements also landed:

- **#432 / PR #445** — scorer special-hand and fishing results link to the exact owning Guide treatment rather than merely the concept page;
- **#433 / PR #446** — the Guide can compare 2–3 exact treatments locally while preserving exact profile ownership and remembered rules state.

This is useful evidence that the source/treatment/runtime/reference model is producing practical user-facing value rather than remaining an internal architecture exercise.

## Completed bounded truth-corpus expansion — #440

#440 is complete and closed. Final closeout records **317 semantic subjects, 380 evidence claims, 378 exact-profile treatments and zero unknown treatment states**. Classical and MCR expansion reached the deliberately bounded closeout; unresolved and source-blocked material remains explicit rather than guessed. #399 remains historical and complete.

## #405 / #296 projection substrate — foundation complete, stream not current priority

The first shared engineering slice is already done: **#406 / PR #417 is complete and #406 is now closed**.

The shared contract includes:

- a reviewed 37-dimension catalogue;
- exact profile × dimension projection;
- distinct runtime/implementation and source/evidence states;
- explicit present / absent / unknown / not-applicable semantics;
- #296 relationship vocabulary;
- calibrated BMJA, T&M, Club/OTB, Buzzard and MCR examples.

#407 is therefore technically unblocked when the ruleset-report stream is deliberately resumed.

Preferred shape remains:

```text
runtime/profile truth + reviewed evidence
                  ↓
      shared dimension/value contract
             ↙              ↘
       #296 comparator      #405 profile report
```

Do not build a separate report facts database.

## Riichi — fresh preflight complete; #494 is the next prerequisite

The EMA Riichi 2025 source/correctness corpus is complete and runtime implementation has not started. Required fresh preflight **#491 is complete** against `main@718bdc496983a249ef714d090872075116fce6a0`:

```text
A — scoring/runtime: SMALL GAP → #494
B — neutral table-state: PASS; no B0 prerequisite currently required
→ #494 grammar-extensible compiled-runtime registration seam
→ #262 scoring core
→ #263 settlement/progression/finalisation
→ #264 selectable product integration + Riichi-owned persisted strategy state
→ experienced EMA/European Riichi review before 1.0
```

#494 is a small neutral registration change; it must not implement Riichi rules. The current profile/resolver/schema supports `riichi-han-fu`; the remaining gap is the production compiled-runtime registry's Classical/MCR-only dispatch assumption. Do not describe #491 as future work or insert a B0 issue without new evidence.

## American / NMJL-style — #434

#434 remains an evidence/architecture programme at **N0**, not a runtime build.

Product boundary:

> **Use the annual card; do not become the annual card.**

N0 should establish:

- source-backed general American/NMJL mechanics;
- the annual-card/external-evidence boundary;
- Joker physical evidence without invented represented identity;
- winner-only score semantics using the player-supplied printed card value;
- settlement/progression evidence;
- whether the existing target-catalogue grammar can support a card-external/manual-target path honestly.

Do not reproduce, transcribe, OCR, scrape or encode a current annual NMJL card.

## Ruleset compiler / authoring pipeline — #447 PARKED

#447 captures the longer-term goal: ingest source documents, extract structured claims, identify conflicts/gaps and help assemble an auditable candidate ruleset without hours of manual setup.

That is a good future direction, but it is **not the next batch**. It should be informed by actual #440 migration pain and future family onboarding rather than being designed speculatively now.

## Small bounded product work

Useful independent/lighter slices remain:

- **#429 MCR scorer UX** — results are visually noisy and too many information boxes are required; preflight exact materiality before changing UI;
- **#412 Public What's New** — the curated player-facing milestone history is live; maintain periodically when material player outcomes change, not as a new feature task;
- **#378 British learning-path ownership** — Gameplay Basics versus Scoring Guide;
- **#393 contact/feedback** — keep account-free and low-friction;
- **#288 static-route/real-404 boundary** — separate from the merged visitor-facing 404 UI.

## Parallel production confidence work

Keep these moving without allowing them to become another broad engineering programme:

- **#253 production QA / launch stability**;
- **#89 real-table validation on 10 October 2026**;
- **#246 analytics observation** under the existing privacy boundary;
- experienced-player **MCR review** before stable `1.0`;
- search visibility logging when a durable milestone occurs.

Use real table evidence from 10 October to reprioritise product friction; do not protect an old roadmap from better evidence.

## Branch housekeeping

Issue **#398** owns mechanical branch pruning.

Rules:

- delete only branches proven merged;
- preserve any branch with an open PR;
- preserve deliberately retained unique parked work identified by #167;
- never force a branch to `main` as a substitute for deletion;
- if merge status is ambiguous, leave it.

At the start of the 23 October review there were no open PRs; draft #531 is now open for this roadmap correction. No branches were deleted: the available connector has no safe ref-deletion operation, and branch names alone do not prove merge status. #398 now records seven verified current tips matching merged PR heads (#524–#530). Preserve `main`, open-PR heads, unique/unmerged work, #167 parking-lot branches and ambiguous refs. In particular, `docs/2026-10-03-eod-housekeeping` **is present** with a unique README commit and must not be deleted without review; `codex/issue-520` has post-merge work. Reverify immediately before any manual deletion.

## Current next-step position

Unless new evidence changes the priority:

1. Reference release review: **#554 read-only visitor/content audit + #555 owner decision** for draft #541/#553; preserve stacked PRs until approved.
2. Product validation: **#253 formal current-production QA**, then evidence-led follow-up from the **completed 10 October #89 real-table session**; continue #246 analytics observation and experienced-player MCR review.
3. Riichi: **#494 → #262 → #263 → #264 → experienced EMA/European player review**.
4. Suitable independent bounded work: **#429** MCR evidence UX. **#412** What's New is already live; maintain it only when a meaningful player-facing milestone warrants an entry.
5. Keep **#434** at American/NMJL-style N0 evidence + architecture.
6. Keep **#447 parked** until real ruleset onboarding/migration pain provides evidence for the authoring workflow.
7. #407 remains technically available but is not automatically next. #167 remains the parking-lot index.

## Things not to do on restart

- Do not reopen #386 without a concrete regression.
- Do not restart the completed rules-platform migration or old integration train.
- Do not reopen #399 as a bulk-migration umbrella; #440 owns the expansion.
- Do not build a second rules-facts database for #296, #405, #251 or SEO.
- Do not let learner/reference prose become scoring authority.
- Do not make AI calculate rules or invent missing material evidence.
- Do not skip #494 before #262; #491 is already complete and B passed without a B0 prerequisite.
- Do not encode an NMJL annual card in code, fixtures, screenshots or hidden data.
- Do not pull #447 forward merely because automated ingestion is attractive; let real migration/onboarding evidence shape it.
- Do not make accounts/network services a dependency for ordinary free table play.
- Do not implement an old open issue merely because it exists; confirm that it still serves the live product.

## Definition of a good restart

A good restart should not require reconstructing the September issue tree.

Read, in order:

1. this file;
2. issue #105;
3. the exact active issue from the current programme map (currently #554/#555 reference release review, #253 validation or #494 Riichi prerequisite, by chosen track);
4. only the current `main` code/tests and authority documents needed by that batch.

Then do one bounded thing.
