# Classical / Western configuration-layer golden fixture plan

Status: **pre-Codex test contract**  
Implementation target: #219  
Depends on: `CLASSICAL_PROFILE_CONFIG_MATRIX.md`, `CLASSICAL_PROFILE_CONFIG_V1.md`

## Purpose

Define the minimum fixture set that proves the configuration layer changes **profile data, not scorer identity**.

The strongest tests use the same hand/evidence under two or more resolved profiles and assert different lawful outcomes caused only by configuration.

This plan separates:

- #219 scoring/configuration fixtures;
- later #220 settlement/incident fixtures.

T&M ordinary behaviour remains provisional where the intended source has not yet been verified. Tests may preserve current runtime behaviour but must not promote it to source fact.

---

## 1. Configuration resolution fixtures

### CFG-001 — deterministic published resolution

For BMJA, OTB, Buzzard and provisional T&M:

- resolving the same profile twice produces structurally equivalent config;
- serialise → parse → resolve is stable;
- object/map key order does not alter semantics.

### CFG-002 — unknown rule fails closed

A profile/variant referencing `score.double.not-a-real-rule` is rejected. Unknown rules are never silently ignored.

### CFG-003 — unknown policy/pattern fails closed

Reject unknown:

- settlement/incident policy;
- Goulash/mode policy;
- special-hand `patternId` with no registered canonical detector.

### CFG-004 — base + override does not mutate base

Start from exact BMJA, disable final-discard double and change limit to 500.

Assert the derived profile changes and BMJA remains identical before/after resolution.

### CFG-005 — exact version participates in identity

Two profile versions must remain distinct replay identities even if their currently resolved values happen to match.

---

## 2. Shared intrinsic-point fixtures

Prove extraction into `classical-standard-points-v1` does not change established arithmetic.

For source-backed BMJA/OTB/Buzzard assert:

- exposed minor Pung 2;
- concealed minor Pung 4;
- exposed major/honour Pung 4;
- concealed major/honour Pung 8;
- exposed minor Kong 8;
- concealed minor Kong 16;
- exposed major/honour Kong 16;
- concealed major/honour Kong 32;
- Dragon pair 2;
- own Wind pair 2;
- prevailing Wind pair 2;
- each Flower/Season 4.

T&M may retain current equivalent runtime expectations in separately labelled `provisional-compatible` fixtures.

---

## 3. Same evidence, different configuration

### DIFF-001 — maximum Chows

Use a complete four-Chow + non-scoring-pair hand.

- BMJA `maxChows=1` → invalid.
- Buzzard unrestricted normal Chows → valid.
- test custom `maxChows=2` → invalid.
- test custom `maxChows=4` → valid.

Do not assert unverified ordinary T&M/OTB Chow limits.

### DIFF-002 — pure-suit predicate

Use a complete one-suit winner containing a Chow.

- BMJA no-Chow Purity does not match.
- OTB retains its BMJA-style Purity.
- Buzzard any-standard-meld pure-suit rule matches and contributes three doubles.
- T&M existing calculated/one-Chow Purity behaviour remains separate/provisional as currently evidenced.

Also test a multiple-Chow one-suit hand: BMJA invalid by max-Chow rule, Buzzard valid and pure-suit eligible.

### DIFF-003 — concealed-hand eligibility

Use the same fully concealed standard winner twice: self-drawn and discard-completed.

Expected:

- BMJA current/source-backed generic concealed double remains unchanged;
- OTB current rule applies only under its self-drawn/wall eligibility;
- Buzzard generic concealed-hand double is disabled;
- T&M current provisional behaviour remains unchanged and labelled provisional.

### DIFF-004 — final-discard selector

Same ordinary hand with final-discard win evidence:

- BMJA: final-discard double applies;
- Buzzard: it does not;
- OTB/T&M retain their current behaviour without cross-profile leakage.

### DIFF-005 — complete Flower/Season stacking

Use East with all four Flowers including East's own Flower.

Assert bonus-double contribution:

- BMJA: two doubles total, inclusive of own Flower;
- OTB: same current verified/compatible treatment;
- Buzzard: three doubles for complete set plus one own-Flower double = four doubles total (×16 from those rules).

Repeat for Seasons.

### DIFF-006 — Standing Hand evidence

Same Buzzard hand:

- evidence false/absent → no +100;
- evidence true → +100.

Equivalent BMJA hand must not gain Buzzard's rule merely because the evidence field exists.

### DIFF-007 — only-possible tile evidence

Same pattern as DIFF-006:

- Buzzard false/absent → no +2;
- Buzzard true → +2;
- other profiles unaffected unless explicitly configured later.

### DIFF-008 — no-Chows point + double independence

Use an all-Pung/Kong ordinary winner.

- BMJA: normal no-Chows double, no Buzzard +10.
- Buzzard: no-Chows double **and** +10 points, with points added before doubles.

### DIFF-009 — last-wall / Loose-Tile point + double independence

For Buzzard:

- last-wall evidence → existing last-wall double +10 point rule;
- Loose-Tile evidence → existing Loose-Tile double +10 point rule.

BMJA must keep its normal double without Buzzard +10.

### DIFF-010 — all-Chows + non-scoring pair

Use a legal Buzzard all-Chows winner with non-scoring pair.

Assert the Buzzard one-double rule. BMJA must not inherit it and remains invalid under its normal Chow restriction.

---

## 4. Existing OTB selectors

Use focused hands to prove rules currently implemented in OTB callbacks can remain profile-local when represented by registry-backed settings:

- winning-pair +2/+4 points;
- three concealed Pung/Kong double;
- Little Three Dragons one double;
- Big Three Dragons two doubles;
- Little Four Winds/Joys one double;
- Big Four Winds/Joys two doubles;
- concealed-hand self-drawn-only eligibility.

Assert OTB gets them and BMJA/Buzzard do not unless independently configured.

Purpose: configuration migration should reduce bespoke callbacks rather than add another club callback file.

---

## 5. Special-hand binding fixtures

### CATALOGUE-001 — canonical detector does not own score

Use a shared canonical pattern such as Three Great Scholars where each exact profile binding applies.

Assert profile-local treatment, including current known examples:

- BMJA binding stays BMJA-specific;
- T&M remains 1500 / fishing 600 for its binding;
- OTB remains 1000 / fishing 400;
- Buzzard's source-defined Dragon limit treatment resolves through its own binding/condition.

Do not force structural equivalence if a profile's exact source condition differs; fixture the profile's actual binding.

### CATALOGUE-002 — configured-limit binding

Use a Buzzard limit hand twice:

- active limit 600 → special value 600;
- active limit 800 → same pattern/profile resolves to 800.

No hard-coded Buzzard 600 should be copied into every binding.

### CATALOGUE-003 — custom catalogue patch

Derived test profile:

- remove one existing special;
- change value/fishing value of another existing detector;
- add one already-supported canonical detector.

Assert only derived profile changes; base profile remains immutable.

### CATALOGUE-004 — unsupported detector

Binding an unknown pattern ID fails clearly as an engineering/capability gap.

---

## 6. Limits and cap policy

### LIMIT-001 — profile default limits

Ordinary over-limit hand:

- BMJA default 1000;
- OTB 1000;
- Buzzard 600;
- T&M current provisional ordinary default 1000.

### LIMIT-002 — adjustable Buzzard limit

Start/resolve Buzzard at 800 instead of 600.

Assert:

- ordinary cap uses 800;
- configured-limit specials use 800;
- persisted game context/snapshot retains the selected limit.

### LIMIT-003 — OTB fixed-special bonus treatment

Use the existing OTB documented 1000-special + Flower/Season side-score shape that yields above-limit subtotal (e.g. documented 1008-style behaviour).

Assert OTB policy remains isolated and BMJA/T&M do not inherit it.

---

## 7. Custom profile patch

Start from exact `bmja@1.0` and apply only:

```text
limit = 500
maxChows = 2
concealed-hand = disabled
final-discard = disabled
last-wall point bonus = +10
```

Assert:

- all untouched settings remain inherited from exact base version;
- only named overrides change;
- resolved profile is deterministic;
- base BMJA remains unchanged;
- changing one override changes resolved identity/hash/snapshot as implementation chooses to represent it.

Purpose: prove the future Plus house-rules model uses the same core safely.

---

## 8. Configuration validation failures

Reject rather than ignore:

- unsupported schema version;
- unknown rule ID;
- unsupported finite option;
- non-finite/invalid limit;
- invalid points/doubles amount according to rule definition;
- unknown special pattern;
- configured-limit special with conflicting fixed value;
- unknown settlement/mode policy;
- incompatible mutually-exclusive settings;
- override of a field marked non-customisable;
- missing exact base profile/version.

---

## 9. Evidence/provenance preservation

After migration:

- BMJA remains `verified`;
- OTB settings remain `verified-club` only where its source establishes them;
- T&M ordinary assumptions remain `provisional-compatible` until primary verification;
- Buzzard stays tied to its recovered 2000 source snapshot.

Configuration must not erase uncertainty.

---

## 10. Replay/isolation gates

### REPLAY-001

Resolve/serialise/reconstruct Buzzard and one custom variant, then score the same fixture. Result/breakdown must remain identical.

### REPLAY-002

A later edit/new revision of a custom/base profile must not change a previously started game's resolved scoring rules.

### ISOLATION-001

Resolving/scoring Buzzard cannot mutate BMJA rule settings/output.

### ISOLATION-002

OTB binding overrides cannot mutate T&M bindings.

### ISOLATION-003

Two custom variants derived from one base remain independent when scored interleaved.

---

## 11. Out of #219

Defer to #220 or later:

- Buzzard incomplete Four-Wind / Three-Dragon non-winner limit settlement;
- dangerous-discard liability routing;
- false-Mahjong settlement consequences;
- incorrect-hand settlement consequences;
- full incident-policy migration;
- public house-rules editor;
- profile sharing/import/export UX.

#219 may define registry/policy IDs if needed by the config contract, but should not expand into all settlement work.

---

## 12. Codex completion report

Alongside passing tests, #219 should report:

1. which differences became pure configuration;
2. which reusable evaluators/predicates had to be extracted or added;
3. which current callbacks remain and why;
4. whether any scorer control flow still checks profile names;
5. any matrix row the v1 config cannot express without semantic loss;
6. which fields are safe candidates for the future Plus house-rule UI;
7. recommended changes to `CLASSICAL_PROFILE_CONFIG_V1.md` based on implementation evidence.

A successful result should make the next Western-adjacent club profile look like **source evidence + manifest + fixtures**, not a new scorer implementation.
