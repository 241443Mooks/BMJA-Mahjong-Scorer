# Atlas Buzzard reconciliation — 25 September 2026

Status: **authoritative Sol reconciliation contract for #362; source/runtime preconditions complete after #365**  
Base: `159cd770fe5b25d3115edfa30e519f9b45f317e2`  
Scope: final reconciliation of the Buzzard Atlas warnings and the reviewed Three-Dragon / Four-Wind relationships after #360, #361 and #365.

This document supersedes the conservative Buzzard conclusions in `CLASSICAL_ATLAS_CONCEPT_AUDIT_V1.md` where they conflict. It does not alter score values, exposure rules, settlement arithmetic or profile identity. Exact treatment truth remains `profile id + profile version + executable pattern id`.

## Evidence boundary

Primary source authority is the retained 13-page Buzzard 2000 PDF snapshot recorded in `BUZZARD_2000_RULE_EVIDENCE.md` (SHA-256 `76b7548f8a8708473340a65bfaf810c99188b95a37311ce6127676588f20b0a5`).

Relevant locators:

- retained PDF p.11: Thirteen Odd Majors, Original Hand, completed Four-Wind hand, Three Dragons;
- retained PDF pp.11–12: incomplete Four-Wind / Three-Dragon non-winner limit consequences;
- `BUZZARD_2000_RULE_EVIDENCE.md` §D–§E: durable repo ledger for those page-bound facts;
- issue #220: implemented runtime/table contract for the two non-winner profile-score results;
- PR #364 / #361: source-correct Buzzard Three Dragons winner predicate;
- PR #366 / #365: source-complete Buzzard Three Winds winner predicate.

Learner content may paraphrase these facts but must keep source locators and runtime links structured. It must not copy configured-limit values into learner prose as authority.

---

## 1. Thirteen Odd Majors — resolved shared structural concept

### Source/runtime finding

Buzzard defines the hand as the suited 1 and 9 from each suit, all four Winds, all three Dragons, plus a pair of any one of those thirteen required tile types.

`buzzard-2000@0.1:thirteen-unique-wonders` reuses canonical `thirteen-unique-wonders`, whose detector requires those thirteen terminal/honour identities plus exactly one duplicate in a complete 14-tile winning collection.

### Decision

**Resolved. Exact structural equivalence is proved for the current Classical corpus.**

Required projection:

- move `buzzard-2000@0.1:thirteen-unique-wonders` from standalone unresolved ownership into learner entry `thirteen-unique-wonders`;
- retain local/source name `Thirteen Odd Majors`;
- retain Buzzard configured-limit score model as treatment-local runtime truth;
- reuse the existing structured Thirteen Unique Wonders example for Buzzard;
- add `Thirteen Odd Majors` to local-name/search data;
- delete/deprecate standalone owner `thirteen-odd-majors-buzzard` so there is no duplicate browse card.

Evidence binding:

```json
{
  "kind": "repo-evidence",
  "path": "docs/rules/BUZZARD_2000_RULE_EVIDENCE.md",
  "locator": "§D Limit hands / retained PDF p.11 — Thirteen Odd Majors",
  "supports": ["exact-tile-qualification", "local-name", "configured-limit-membership", "concept-membership"],
  "status": "source-verified"
}
```

---

## 2. Original Hand — resolved event relationship

### Source/runtime finding

Buzzard defines Original Hand as East's originally dealt hand already being complete for Mahjong. The source also records historical naming including Hand from Heaven / Natural Winning.

`buzzard-2000@0.1:heavens-blessing` reuses canonical `heavens-blessing`, which requires:

- winning hand;
- `winningMethod === initial-deal`;
- East seat;
- fourteen playing tiles;
- no bonus replacement state.

The source directly supports East + original deal + already complete. The fourteen-playing-tile and no-bonus-replacement checks are implementation consequences of requiring the winning hand to be the **originally dealt** hand, not extra historical rules invented by the learner layer.

### Decision

**Resolved for the current executable event predicate.**

This proves a reviewed current-product event relationship, not universal equivalence between every Mahjong tradition using Heaven/Original-Hand terminology.

Required projection:

- replace BMJA-only learner owner `heavens-blessing-bmja` plus Buzzard standalone unresolved owner `original-hand-buzzard` with one reviewed event family/topic, suggested ID `heavens-blessing-original-hand`;
- treatments:
  - `bmja@1.0:heavens-blessing` — local name `Heaven's Blessing`;
  - `buzzard-2000@0.1:heavens-blessing` — local name `Original Hand`;
- include Buzzard aliases `Hand from Heaven` and `Natural Winning` as sourced local/search names where the schema permits;
- reuse `example-heavens-blessing-existing` as the shared event-sequence example;
- retain the BMJA evidence caveat/status exactly as already documented; stronger Buzzard evidence must not silently upgrade BMJA provenance.

Buzzard evidence binding:

```json
{
  "kind": "repo-evidence",
  "path": "docs/rules/BUZZARD_2000_RULE_EVIDENCE.md",
  "locator": "§D Limit hands / retained PDF p.11 — Original Hand",
  "supports": ["east-seat", "original-deal-event", "already-complete-hand", "local-names", "configured-limit-membership"],
  "status": "source-verified"
}
```

---

## 3. Three-Dragon family — resolved family/topic, not equivalence

Current exact winner treatments after #361:

- `bmja@1.0:three-great-scholars`;
- `western-tm@0.1:three-great-scholars`;
- `outside-the-box@0.1:club-three-great-scholars`;
- `buzzard-2000@0.1:buzzard-three-dragons-winner`.

Reviewed relationships:

- **BMJA + T&M** — shared narrower Three Great Scholars concept: all three Dragon Pung/Kongs plus a fourth Pung/Kong and pair.
- **Club - Bramhall 2026** — related-but-materially-different: all three Dragon Pung/Kongs; fourth meld may be Chow/Pung/Kong; fourth meld and pair must use the same numbered suit.
- **Buzzard 2000 winner** — broader completed winner: all three Dragon Pung/Kongs plus any otherwise lawful fourth ordinary set and pair.
- **Buzzard non-winner consequence** — separate #220 profile-score result; not a special-hand detector.

Structured learner link:

```json
{
  "kind": "profile-score-result",
  "profile": "buzzard-2000@0.1",
  "resultId": "buzzard.incomplete-three-dragon-limit",
  "relationship": "same-source-family-non-winner-consequence",
  "authority": "issue-220-runtime"
}
```

### Decision

Create one reviewed family/topic for teaching this relationship, suggested ID `three-dragon-specials-family`, while preserving exact treatment identity and materially different variants. The family/topic must not imply equivalence among all four treatments. Every exact treatment still has exactly one primary learner owner.

---

## 4. Three Winds / fourth-Wind pair — resolved after #365

### Source/runtime finding

Buzzard's completed Four-Wind-family winner requires:

- Pung/Kong of three distinct Winds;
- pair of the fourth Wind;
- one final ordinary Chow/Pung/Kong;
- a complete winning hand.

PR #366 / issue #365 tightened canonical `three-winds-and-fourth-wind-pair` to the existing complete grouped-shape guard. Positive Chow, Pung and Kong variants pass; incomplete, extra-group, duplicate-Wind-pair, missing-Wind, malformed, second-pair, loose-tile and remaining-tile shapes fail. Pattern ID remains stable.

The source separately permits an incomplete Four-Wind-family non-winner limit consequence. #220 already represents that as a profile score result rather than another special-hand detector.

Structured learner link:

```json
{
  "kind": "profile-score-result",
  "profile": "buzzard-2000@0.1",
  "resultId": "buzzard.incomplete-four-wind-limit",
  "relationship": "same-source-family-non-winner-consequence",
  "authority": "issue-220-runtime"
}
```

### Decision

**Resolved.** Remove `buzzard-2000@0.1:three-winds-and-fourth-wind-pair` from generic unresolved status.

Keep it related-but-materially-different from `four-blessings`: Four Blessings requires all four Winds as Pung/Kongs; Buzzard Three Winds + pair requires three Wind Pung/Kongs, pairs the fourth, and uses a separate fifth set.

---

## 5. Final #359 unresolved-state decision

After #360, #361 and #365, every one of the original nine generic Atlas warnings has a source/runtime resolution.

Expected final `unresolvedTreatmentReferenceIds` for that nine-item integrity programme: **zero**.

Zero is evidence-derived, not cosmetic. If generation or validation reveals a new contradiction, retain a precise note rather than forcing the list empty.

---

## 6. Required structured implementation delta

1. Add an explicit supersession pointer in `CLASSICAL_ATLAS_CONCEPT_AUDIT_V1.md` to this reconciliation contract for the affected Buzzard cases.
2. Update `ATLAS_V02_LEARNER_CONTENT_PROOF.json`:
   - merge Buzzard Thirteen Odd Majors into `thirteen-unique-wonders`;
   - replace `heavens-blessing-bmja` + `original-hand-buzzard` with reviewed event family/topic;
   - reconcile the Three-Dragon family/topic and structured #220 result link;
   - reconcile Buzzard Three Winds and add structured #220 Four-Wind result link.
3. Update `ATLAS_V02_EVIDENCE_BINDINGS_BATCH1.json` with page-bound Buzzard evidence and reviewed relationship statuses.
4. Update `ATLAS_V02_FINAL_CONTENT_MANIFEST.json` ownership and clear the resolved #359 treatment IDs from `unresolvedTreatmentReferenceIds`.
5. Regenerate `artifacts/mahjong-scorer/src/guide/atlas-v02-content.json` via `atlas:generate`; never hand-edit generated output.
6. Preserve exactly 146 current Classical treatment identities, each with one primary learner owner.
7. Add search regressions for `Thirteen Odd Majors`, `Original Hand`, `Hand from Heaven`, `Natural Winning`, `Three Dragons`, and `Three Winds`.
8. Add a structured knowledge regression proving `buzzard.incomplete-three-dragon-limit` and `buzzard.incomplete-four-wind-limit` are profile-score-result links and are not treatment IDs/special-hand detectors.
9. Keep score/value/exposure/settlement facts derived from exact runtime/profile truth.
10. Final gate: `atlas:generate`, `atlas:check`, full tests, typecheck, production build and `git diff --check`.

## Public naming

Use **Club - Bramhall 2026** in public learner copy. Internal `outside-the-box@0.1` remains unchanged.
