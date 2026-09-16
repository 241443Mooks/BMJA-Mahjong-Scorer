# Classical / Western configuration-layer golden fixture plan

Status: **pre-Codex test contract**  
Implementation target: #219  
Depends on: `CLASSICAL_PROFILE_CONFIG_MATRIX.md`, `CLASSICAL_PROFILE_CONFIG_V1.md`

## Purpose

Define the minimum fixture set that proves the proposed configuration layer changes **profile data, not scorer identity**.

The strongest tests use the **same hand/evidence** under two or more resolved profiles and assert different lawful outcomes caused only by configuration.

This plan intentionally separates:

- #219 scoring/configuration fixtures;
- later #220 settlement/incident fixtures.

T&M ordinary behaviour remains provisional where the source has not yet been verified. Tests may preserve current runtime behaviour, but must label it provisional rather than promote it to source fact.

---

## 1. Configuration resolution fixtures

### CFG-001 — published profile resolves deterministically

Given the same published profile manifest twice:

- resolution produces structurally identical configuration;
- serialise → parse → resolve is stable;
- order of object/map keys does not change semantics.

Profiles: BMJA, OTB, Buzzard, provisional T&M.

### CFG-002 — unknown rule ID fails closed

A variant referencing `score.double.not-a-real-rule` is rejected.

No rule may be silently ignored.

### CFG-003 — unknown policy/pattern fails closed

Reject:

- unknown settlement policy;
- unknown Goulash/mode policy;
- special-hand binding whose `patternId` has no registered detector.

### CFG-004 — base + override resolves without mutating base

Start from BMJA; disable final-discard double and change limit to 500.

Assert:

- derived variant contains the changes;
- original BMJA resolved configuration remains unchanged;
- a second BMJA resolution remains identical to the first.

### CFG-005 — profile/schema version participates in identity

`bmja@1.0` and a hypothetical later profile version must not collapse to the same replay identity merely because their current values happen to match.

---

## 2. Common ordinary-point fixtures

These should prove that configuration extraction does not disturb the established Classical point table.

### SCORE-001 — Pung/Kong table parity

For BMJA, OTB and Buzzard, source-backed expectations:

- exposed minor Pung = 2;
- concealed minor Pung = 4;
- exposed major/honour Pung = 4;
- concealed major/honour Pung = 8;
- exposed minor Kong = 8;
- concealed minor Kong = 16;
- exposed major/honour Kong = 16;
- concealed major/honour Kong = 32.

T&M may retain current provisional-compatible expectations in a separately labelled fixture.

### SCORE-002 — pair and bonus-tile parity

Source-backed BMJA/OTB/Buzzard expectations:

- Dragon pair = 2;
- own Wind pair = 2;
- prevailing Wind pair = 2;
- same Wind may qualify for both own + prevailing pair points;
- each Flower/Season = 4.

Purpose: prove `classical-standard-points-v1` preserves current arithmetic.

---

## 3. Selector/value fixtures — same evidence, different profile

### DIFF-001 — maximum Chows is profile configuration

Use a legal four-Chow + non-scoring-pair winning layout.

- BMJA: invalid because normal `maxChows = 1`.
- Buzzard: valid because the source explicitly scores an all-Chows winner and configuration does not impose the BMJA one-Chow cap.

This fixture proves Chow validation is not globally BMJA-coded after #219.

Do not assert T&M/OTB ordinary max-Chow behaviour beyond their current evidence.

### DIFF-002 — pure suit predicate variant

Use a complete winning hand entirely in one suit containing at least one Chow.

- BMJA: must **not** match the existing no-Chow `Purity` predicate.
- OTB: must retain its current BMJA-style Purity interpretation.
- Buzzard: pure-one-suit rule applies and contributes 3 doubles (×8).
- T&M: exercise the existing provisional/calculated one-Chow Purity binding separately and preserve current behaviour.

Purpose: prove `pureSuitShape` selects a known predicate variant rather than introducing profile-name branches.

### DIFF-003 — concealed-hand eligibility

Use an otherwise ordinary fully concealed winner completed from a discard.

- BMJA: concealed-hand ordinary double applies under current/source-backed profile.
- OTB: no concealed-hand double because OTB's current policy restricts it to self-drawn/wall situations.
- Buzzard: generic concealed-hand ordinary double is disabled.
- provisional T&M: preserve current behaviour and label its source status appropriately.

Purpose: prove `concealedHandEligibility` replaces handwritten profile filtering.

### DIFF-004 — final-discard double

Use the same ordinary winning hand with `winningMethod = final-discard`.

- BMJA: +1 double.
- Buzzard: no final-discard double.
- OTB: preserve current/source-compatible behaviour.
- T&M: preserve current provisional behaviour.

Purpose: prove winning-method doubles are individually selectable.

### DIFF-005 — Flower/Season complete-set stacking

Use East with all four Flowers (or equivalent own-number context).

Assert the **bonus-double contribution**:

- BMJA: 2 doubles total for the bouquet, inclusive of own Flower.
- OTB: preserve current aligned treatment.
- Buzzard: 3 doubles for the complete set **plus** 1 double for own Flower = 4 doubles from these two rules, i.e. ×16 contribution.
- provisional T&M: preserve current behaviour unless later source evidence changes it.

Purpose: prove `bonusSetStacking` is a finite configuration option.

### DIFF-006 — Buzzard Standing Hand is data-driven evidence

Use the same Buzzard winning hand twice:

- `standingHand = false` → no Standing bonus;
- `standingHand = true` → +100 points.

Run the equivalent hand under BMJA and assert the Buzzard-only evidence does not accidentally produce a BMJA rule.

Purpose: prove enabled rule + evidence dependency drives the UI/scorer without a Buzzard-specific scoring entry point.

### DIFF-007 — Buzzard only-possible tile

Same pattern as DIFF-006:

- Buzzard with evidence false/absent → no +2;
- Buzzard with evidence true → +2;
- other profiles do not gain the bonus unless explicitly configured in future.

### DIFF-008 — no-Chows point bonus and double are independent rules

Use an ordinary all-Pung/Kong Buzzard winner.

Assert:

- the ordinary no-Chows/all-Pungs double is applied;
- Buzzard's separate +10 no-Chows point bonus is also applied;
- arithmetic adds points before multiplying by doubles.

Run under BMJA and assert it gets its normal no-Chows double **without** the Buzzard +10 point bonus.

### DIFF-009 — last-wall event can carry both points and doubles

Same hand, `winningMethod = last-wall-tile`:

- Buzzard: existing last-wall double + Buzzard +10 point rule;
- BMJA: existing last-wall double, no Buzzard +10;
- score breakdown contains distinct stable rule IDs for the point and double contribution.

Repeat for Loose Tile/replacement win.

---

## 4. Catalogue/binding fixtures

### CATALOGUE-001 — one detector, profile-local score

Use a hand satisfying the shared Three Great Scholars / three-Dragon-set structure where the profile binding permits the comparison.

Expected profile-local outcome should demonstrate that a canonical detector does not own its score:

- BMJA binding: 1,000 / fishing 400 where applicable;
- T&M binding: 1,500 / fishing 600;
- OTB binding: 1,000 / fishing 400;
- Buzzard: source-defined Dragon limit treatment resolves against the configured table limit when the exact Buzzard binding condition is met.

Use exact source/profile predicates rather than forcing a detector equivalence if structures differ at fixture level.

Purpose: prove catalogue membership/value remains profile-local.

### CATALOGUE-002 — configured-limit score model

Buzzard limit-hand fixture, run with two game limits:

- configured limit 600 → matching limit hand scores 600 before East settlement multiplication;
- configured limit 1,000 → the same profile/pattern scores 1,000.

No duplicated Buzzard binding values should be required.

### CATALOGUE-003 — catalogue remove/upsert isolation

Create a user/test variant based on a known profile:

- remove one supported special-hand binding;
- override the value of another existing detector;
- add one already-supported detector from the wider catalogue.

Assert only the derived variant changes. Published presets remain unchanged.

Purpose: prove future house-rule variants can alter catalogue membership as data.

### CATALOGUE-004 — missing detector reports capability gap

Try to bind a non-existent pattern ID.

Configuration validation must reject it clearly rather than create a non-functional profile.

---

## 5. Limit/cap fixtures

### LIMIT-001 — profile default limit

Ordinary calculated hand above the cap:

- BMJA resolves with default 1,000;
- OTB default 1,000;
- Buzzard default 600;
- T&M current provisional ordinary default 1,000.

Purpose: prove limit default is profile configuration.

### LIMIT-002 — Buzzard user-adjustable limit

Resolve/start a Buzzard game with limit changed from 600 to 800.

Assert:

- ordinary cap is 800;
- `configured-limit` specials use 800;
- profile identity/version remains Buzzard while the game snapshot retains the chosen limit.

### LIMIT-003 — OTB fixed-special bonus treatment

Use the existing OTB source example shape where a 1,000 fixed special plus own Flower subtotal produces 1,008.

Assert:

- OTB preserves the bonus subtotal above the ordinary/fixed special cap;
- BMJA/T&M do not inherit the OTB policy merely because they share the Classical engine.

Purpose: prove cap treatment is profile policy/config, not profile-name branching.

---

## 6. Profile isolation fixtures

### ISOLATION-001 — Buzzard config does not mutate BMJA

Score a representative BMJA regression hand before and after resolving Buzzard.

Exact breakdown/output must remain identical.

### ISOLATION-002 — OTB config does not mutate Western catalogue

Resolve OTB after T&M and score a T&M hand whose OTB binding differs in value/exposure.

T&M output must remain unchanged.

### ISOLATION-003 — derived user variant does not mutate its base

Create two variants from BMJA with different limits and toggles. Resolve/score interleaved.

No configuration state may leak between instances.

### ISOLATION-004 — profile registry uses exact version

Unknown version must fail rather than silently fall back to another version with the same ID.

---

## 7. Replay/persistence fixtures

### REPLAY-001 — resolved profile survives serialisation

For Buzzard and one user test variant:

- resolve configuration;
- serialise the replay/profile snapshot representation;
- parse/reconstruct;
- score the same fixture;
- breakdown and final score must match.

### REPLAY-002 — base preset change cannot alter an old game

Conceptually simulate a later base revision after an old game snapshot exists.

The old game must continue using its frozen/versioned rules state rather than re-resolving against the new base.

The exact storage representation may follow the existing local/cloud architecture; the invariant is what matters.

---

## 8. What #219 does not test yet

These belong to #220 or later:

- Buzzard incomplete Four-Wind / Three-Dragon non-winner limit settlement;
- dangerous-discard liability routing;
- false-Mahjong settlement penalties;
- incorrect-hand settlement consequences;
- OTB/Buzzard incident-policy comparison;
- public house-rules editor UI;
- profile sharing/import/export UX.

#219 may define/validate policy IDs if required by the config contract, but should not expand into the full settlement implementation slice.

---

## 9. Codex completion report

Alongside passing tests, #219 should report:

1. which fixtures are pure configuration differences;
2. which reusable rule evaluators/predicates had to be extracted or added;
3. which current callbacks disappeared or became thinner;
4. any rule that still depends on profile-name checks;
5. any matrix row the proposed v1 contract could not represent cleanly;
6. recommended changes to `CLASSICAL_PROFILE_CONFIG_V1.md` based on implementation evidence.

A successful result should make the next Western-adjacent club profile look like **manifest + source evidence + fixtures**, not another scorer implementation.