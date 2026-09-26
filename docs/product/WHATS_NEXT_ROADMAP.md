# What's next — project handoff roadmap

**Snapshot:** 26 September 2026  
**Purpose:** a calm restart point after the September rules-platform, Special Hands and public-IA work.  
**Live authority:** issue #105 remains the programme map; this file is the dated handoff companion, not a permanent second backlog.

## Where Mahjong Reference is now

The project has moved well beyond the original British scorer:

- five public rules profiles are live: British / BMJA-style, Western — Thompson & Maloney, Club, Buzzard 2000 and MCR / WMO 2006 `0.1`;
- the shared rules platform, parity/replay harness and caller cutover are live on `main`;
- Buzzard and MCR are production profiles; MCR still needs experienced-player review before a future `1.0`;
- the Special Hands Guide exposes the current executable Classical knowledge as 71 learner-facing entries backed by 146 exact profile-local treatments;
- the public information architecture has been simplified around Score a hand, Track a game, Learn, Rules and Help;
- Home is now a front door, About tells the project story, Rules is family-first, Features and How It Works have distinct jobs, and `/under-the-hood` explains the trust/reasoning model;
- Classical hand entry now makes **Add a group** and **Add remaining tiles** peer actions.

That last point is the current engineering hinge.

## Current programme — hybrid evidence-first hand entry

Parent: **#386**

Product principle:

> **Enter what you know. Add the rest. Let Mahjong Reference interpret only what it can prove, and ask for what remains materially unknown.**

The work should stay sliced. Do not turn this into one broad scorer/UI rewrite.

### A — restore hybrid entry prominence — COMPLETE

Delivered by #390 / PR #392.

- known groups and unresolved tiles can be entered as separate evidence;
- Remaining tiles is no longer hidden as an edge-case control;
- no new scoring inference was introduced in this slice.

### B — pure Classical unresolved-tile interpreter — IN REVIEW

Issue #391 / PR #396.

The interpreter should:

- preserve exact profile identity;
- keep explicit groups authoritative;
- enumerate deterministic zero/one/many lawful Classical candidates;
- preserve physical-tile and structural-slot accounting, including Kongs;
- validate candidates through the selected compiled runtime;
- fail closed for unresolved Goulash blank ambiguity;
- not score, rank or choose a candidate by final score;
- keep MCR outside the Classical seam.

**Restart action:** review the actual PR #396 diff and proof before merging. Do not merge it merely because the branch is green.

### C — complete-winner hybrid scoring — NEXT BUILD

Only after B is accepted.

Bounded outcome:

```text
explicit groups + unresolved tiles
        ↓
Classical interpreter
        ↓
0 / 1 / many lawful candidates
        ↓
ask only unresolved material facts
        ↓
project selected/resolved candidate into the existing exact scorer
        ↓
score + auditable explanation
```

Important boundaries:

- do not copy scoring arithmetic into the interpreter or UI;
- do not silently choose the highest-scoring structural candidate unless an exact profile/source policy proves that behaviour;
- inferred groups must remain distinguishable from player-entered groups in explanations;
- visibility/exposure and winning context are questions only when the evidence cannot derive them;
- current all-explicit manual entry remains an authority path.

Create a fresh child issue/contract against the exact post-#396 `main` before implementation.

### D — partial / 13-tile / fishing interpretation

After complete winners are trustworthy, extend the same evidence model to:

- partial losing hands;
- 13-tile/fishing evidence;
- bounded local structures that can be proved from entered tiles;
- existing fishing authority rather than a second fishing engine.

Never reconstruct unseen tiles.

### E — interaction consolidation

Only after the domain path is proven:

- make the final scorer read naturally as **enter what you know; add the rest**;
- stop asking users to diagnose `ordinary` versus `special layout` before they can enter evidence;
- preserve an explicit/manual path where useful;
- prove the final phone-width workflow at ~390px and with keyboard navigation.

## Small repo/product loose ends

These are deliberately smaller than the hybrid programme and can be handled opportunistically.

### 404 work

- PR #286 remains open for #255: visitor-facing 404 recovery copy/navigation.
- #288 is a separate static-hosting/HTTP boundary: preserve valid `/game/<profile>` entry URLs while giving genuinely unknown URLs real not-found semantics.

Do not collapse #255 and #288 into one vague 404 job.

### British learning path

#378 is now unblocked by the navigation work.

Clarify the ownership split:

- `/gameplay-basics` — how a first British game physically proceeds;
- `/guide` — how British scoring works;
- Special Hands — multi-profile special-hand discovery;
- `/scoring-examples` — worked British scoring examples today.

This is content/IA cleanup, not a rules rewrite.

### Contact and feedback

Parent #393.

Sequence:

1. #394 — choose and configure the durable public `@smooks.co.uk` email identity;
2. #395 — build `/contact` and the contextual feedback form after the destination is settled.

Keep feedback low-friction, account-free and private; do not send users into GitHub as the product support flow.

## Parallel validation and trust work

These should continue without becoming another giant implementation programme.

- **#253 production QA** — finish the remaining live/responsive/static-route checks.
- **#89 real-table validation — 10 October 2026** — use real play to expose friction that automated tests cannot.
- **MCR experienced-player review** — terminology/table flow gate before any `1.0` promotion.
- **#246 analytics** — observe real paths/funnels under the existing privacy boundary rather than adding more tracking.
- **Search visibility** — record durable milestones in `SEARCH_VISIBILITY_LOG.md`; do not create a noisy rank diary.

## Next major rules family — EMA Riichi 2025

The source/correctness corpus is ready. The runtime is not.

Do **not** jump directly into #262 from the old plan. First run a fresh preflight against the current shared platform after the hybrid work has reached a sensible stopping point.

Preflight questions:

1. Is `riichi-han-fu` genuinely executable in the current platform?
2. Is a bounded A0 grammar/runtime seam needed before #262?
3. Can current neutral outcome/state contracts express multi-ron, honba, riichi pot and Riichi-owned table state?
4. Is a bounded neutral B0 needed before #263?

Then follow the existing dependency order:

```text
fresh Riichi preflight
→ optional A0
→ #262 scoring core
→ optional neutral B0
→ #263 settlement/progression/finalisation
→ #264 public integration
→ experienced EMA/European Riichi review before 1.0
```

Broad Riichi research is already complete. Reopen research only for an exact source/fixture contradiction.

## Structured knowledge and comparison — after the current product seam

The Special Hands Guide has already proved that executable rules truth can drive learner-facing knowledge without a second score database.

The next larger knowledge jobs should converge rather than fork:

- **#296** owns profile-by-dimension rules comparison;
- **#251** owns canonical concepts and profile-specific treatments;
- Riichi executable identity remains the main gate before broad cross-family #251A2 canonicalisation;
- **#250 SEO consolidation** remains downstream of a real #251 public concept architecture/corpus and a fresh Search Console audit.

Do not treat the 626 source-local inventory rows as 626 pages.

## Commercial and experimental streams — deliberately not immediate

These are designed enough to resume when evidence/capacity justifies them, but they should not crowd the current core path.

- **Plus #206** — optional cloud memory/accounts/billing; free table play remains account-free and local-first.
- **Voice #147** — prove speech → structured evidence → deterministic scorer before connecting it to paid metering.
- **i18n #215** — English-first foundation then a bounded Spanish pilot when prioritised.
- **OpenSEO #345** — explicitly held until revenue or stronger acquisition need justifies the paid data balance.

## Restart order

When returning to the project, use this order unless new user evidence changes the priority:

1. **Review PR #396** against #391; merge only if the interpreter contract and proof are genuinely satisfied.
2. **Create the bounded #386C contract** from the exact resulting `main`.
3. **Finish/resolve the small stale PR #286** rather than leaving it indefinitely open.
4. **Continue #253 / real-table validation / analytics observation** in parallel.
5. **Build #386C → D → E** one slice at a time.
6. Then choose between the next evidence-led product need and the **fresh Riichi preflight**; do not assume an old roadmap outranks what real users reveal.

## Things not to do on restart

- Do not restart the completed rules-platform migration or resurrect `integration/rules-platform-v1` as an active train.
- Do not build a second rules-facts database for guides, comparison or SEO.
- Do not merge profile treatments because names look similar.
- Do not let AI calculate Mahjong rules or fill missing material evidence.
- Do not make accounts/network services a dependency for ordinary free table play.
- Do not start a broad Riichi implementation without the fresh current-code preflight.
- Do not broaden #386 into MCR or other scoring grammars just to make one universal interpreter.
- Do not create work merely because an old issue is open; first decide whether it is still aligned with the live product.

## Definition of a good restart

A good restart does not require remembering September's entire issue tree.

Read, in order:

1. this file;
2. issue #105;
3. parent #386 and the exact next child issue;
4. the current `main` implementation/tests touched by that child.

Then do one bounded thing.
