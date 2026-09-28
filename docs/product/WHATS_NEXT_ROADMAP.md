# What's next — project handoff roadmap

**Snapshot:** 28 September 2026 — end of day  
**Purpose:** a calm restart point after completing the rules-truth vertical architecture and tightening the Special Hands truth-to-user path.  
**Live authority:** issue #105 remains the programme map; this file is the dated handoff companion, not a second backlog.

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

The production baseline before this docs-only housekeeping branch is `381f4a1f7b98a5aa5521e7b5f9c129415d77712a`.

## Major programme completed today — #399 rules truth

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

## User-facing truth path tightened today

Two small but important Special Hands improvements also landed:

- **#432 / PR #445** — scorer special-hand and fishing results link to the exact owning Guide treatment rather than merely the concept page;
- **#433 / PR #446** — the Guide can compare 2–3 exact treatments locally while preserving exact profile ownership and remembered rules state.

This is useful evidence that the source/treatment/runtime/reference model is producing practical user-facing value rather than remaining an internal architecture exercise.

## NEXT deliberate batch — #440 truth corpus expansion

#440's start gate is now satisfied. #399C/D are on `main`, MCR has proved the second family, and #399 is complete.

The next job is therefore **not** another architecture redesign. It is to populate the architecture with more of the reviewed knowledge already in the repository.

Work in bounded, reviewable batches through the existing corpus/query surface.

Suggested order:

1. remaining Classical special-hand truth across BMJA / Western T&M / Club / Buzzard;
2. broader Classical rule/evidence subjects beyond special hands;
3. remaining MCR evidence/treatments;
4. Riichi corpus during its fresh preflight/implementation programme;
5. later Hong Kong / Taiwanese / Zung Jung / American-NMJL-style / club variants as those profiles become implementation-ready.

Guardrails:

- do not redesign the storage/query contract simply because migration is larger;
- do not copy executable scoring arithmetic or qualification truth into a second facts database;
- do not infer relationships from similar names;
- keep unresolved/conflicted/secondary-only evidence explicit;
- retain exact profile/version identity;
- keep copyright-sensitive source text out of the corpus; store project-authored claims + locators/provenance instead;
- migrate in batches small enough to review and roll back independently.

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

## Riichi — architecture gate passed; fresh preflight remains the next Riichi action

The EMA Riichi 2025 source/correctness corpus is complete. Runtime implementation is not started.

#399 is no longer a blocker: its readiness gate passed. But that does **not** make #262 the immediate next action.

The next Riichi action is the already-planned fresh preflight against the current production system:

```text
fresh Riichi preflight
→ optional bounded A0 grammar/runtime seam
→ #262 scoring core
→ optional neutral B0 state seam
→ #263 settlement/progression/finalisation
→ #264 public integration
→ experienced EMA/European Riichi review before 1.0
```

The preflight should verify actual current gaps around `riichi-han-fu`, multi-winner outcomes, honba, riichi pot and profile-owned table state. Add only seams proved necessary by that evidence.

Broad Riichi research should reopen only for an exact source/fixture contradiction.

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
- **#412 Public What's New** — a curated player-facing milestone history above the technical changelog;
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

There were no open PRs when this housekeeping pass began. Today's #399 and #432/#433 branches have been added to the high-confidence merged deletion queue. The available ChatGPT GitHub connector still does not expose safe ref deletion, so #398 remains the honest mechanical cleanup queue rather than pretending those refs were removed.

## Tomorrow restart order

Unless new evidence changes the priority:

1. **Confirm clean production baseline** after this docs-only housekeeping PR is merged.
2. **Start #440 in a bounded first batch** from exact current `main`; use the existing truth corpus/query/integrity architecture rather than redesigning it.
3. Keep **#407** available as a later consumer of the shared profile × dimension substrate, not as a distraction from the chosen #440 batch.
4. Use **#429** or **#412** when a bounded product-facing task is useful.
5. Keep **#434** at N0 evidence/architecture and **#447** parked unless priority deliberately changes.
6. Continue #253 / #89 / #246 / MCR review in parallel.
7. When Riichi becomes the chosen family task, begin with the **fresh preflight**, not direct #262 implementation.

## Things not to do on restart

- Do not reopen #386 without a concrete regression.
- Do not restart the completed rules-platform migration or old integration train.
- Do not reopen #399 as a bulk-migration umbrella; #440 owns the expansion.
- Do not build a second rules-facts database for #296, #405, #251 or SEO.
- Do not let learner/reference prose become scoring authority.
- Do not make AI calculate rules or invent missing material evidence.
- Do not jump straight into Riichi runtime implementation without its fresh preflight.
- Do not encode an NMJL annual card in code, fixtures, screenshots or hidden data.
- Do not pull #447 forward merely because automated ingestion is attractive; let real migration/onboarding evidence shape it.
- Do not make accounts/network services a dependency for ordinary free table play.
- Do not implement an old open issue merely because it exists; confirm that it still serves the live product.

## Definition of a good restart

A good restart should not require reconstructing the September issue tree.

Read, in order:

1. this file;
2. issue #105;
3. issue #440 for the next bounded batch;
4. only the current `main` code/tests and authority documents needed by that batch.

Then do one bounded thing.
