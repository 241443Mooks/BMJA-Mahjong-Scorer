# Classical profile configuration — fixture plan

Status: **pre-Codex test contract**  
Implementation target: #219  
Config design: `CLASSICAL_PROFILE_CONFIG_V1.md`

## Purpose

The configuration layer should be proven by **the same hand/evidence producing different lawful results under different profile manifests**.

Fixtures should be written before the implementation refactor wherever practical. They are not tests of profile names; they are tests of selected configuration.

The primary rule evidence remains in `docs/rules/`, especially:

- `BMJA_WESTERN_OTB_CROSSWALK.md`;
- `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md`;
- `BUZZARD_2000_RULE_EVIDENCE.md`;
- current T&M catalogue bindings and their provenance records.

## Fixture principles

1. One fixture should normally change **one config dimension at a time**.
2. Expected breakdown should assert stable rule IDs, not only final totals.
3. Cross-profile tests must prove both presence and absence of rules.
4. Published-profile provenance status must survive migration.
5. A config validation failure is preferable to silently ignoring an unknown rule/option.
6. No test should require simulating physical play when end-of-hand evidence is sufficient.

---

## A. Common Classical intrinsic points

Use the same ordinary represented groups under BMJA, OTB and Buzzard (and current provisional T&M runtime).

Assert identical intrinsic results for:

- exposed minor Pung = 2;
- concealed minor Pung = 4;
- exposed major Pung = 4;
- concealed major Pung = 8;
- exposed minor Kong = 8;
- concealed minor Kong = 16;
- exposed major Kong = 16;
- concealed major Kong = 32;
- Dragon pair = 2;
- own Wind pair = 2;
- prevailing Wind pair = 2;
- Flower/Season = 4 each.

Purpose: prove `classical-standard-points-v1` is shared data/preset rather than copied scorer logic.

---

## B. Validation configuration — maximum Chows

Construct an otherwise-valid ordinary winning hand with four Chows and a non-scoring pair.

Expected:

| Config | Result |
|---|---|
| BMJA `maxChows=1` | invalid |
| Buzzard `maxChows=null` | valid |
| custom profile `maxChows=2` | invalid |
| custom profile `maxChows=4` | valid |

Purpose: prove validation is profile configuration, not a global BMJA rule.

---

## C. Complete Flower/Season stacking

Use a player holding all four Flowers where one is their own Flower.

Expected rule-level result:

| Profile/config | Flower doubles from these rules |
|---|---:|
| BMJA `complete=2, inclusive-of-own` | 2 doubles total |
| OTB same setting | 2 doubles total |
| Buzzard `complete=3, additive-with-own` + own Flower 1 | 4 doubles total (×16) |

Repeat for Seasons.

Purpose: prove stacking behaviour is a finite selector and there is no `if profile === buzzard` branch.

---

## D. Pure-suit predicate choice

Use complete one-suit winning layouts with controlled Chow count.

Expected:

1. Pungs/Kongs + pair only:
   - BMJA purity applies;
   - OTB purity applies;
   - Buzzard pure-suit applies.
2. One Chow in the one-suit hand:
   - BMJA ordinary Purity does not apply;
   - current T&M calculated Purity binding can apply according to its catalogue evidence;
   - Buzzard pure-suit applies.
3. Multiple Chows:
   - BMJA invalid because of max-Chow validation;
   - Buzzard pure-suit can apply if otherwise valid.

Purpose: prove predicate variant is configuration/canonical capability, not profile-local duplicated code.

---

## E. Concealed-hand eligibility

Use an otherwise identical fully concealed ordinary winner under two winning methods.

Expected:

| Profile | Wall/self-drawn | Discard win |
|---|---:|---:|
| BMJA | concealed double | concealed double under current BMJA rule |
| OTB | concealed double | no generic concealed double |
| Buzzard | no generic concealed double | no generic concealed double |

T&M current behaviour should remain unchanged and clearly labelled provisional where source evidence is incomplete.

Purpose: prove a common rule can have an applicability option rather than a callback.

---

## F. Winning-method rules

For the same baseline hand, vary only winning method.

Assert independently:

- rob-Kong double;
- last-wall double;
- Loose-Tile double;
- final-discard double.

Cross-profile expectations:

- BMJA: all current published rules remain unchanged;
- OTB: current verified/compatible method rules remain unchanged;
- Buzzard: rob-Kong / last-wall / Loose-Tile enabled; final-discard disabled.

Purpose: prove the current bundled winning-method logic can be selected per rule.

---

## G. Same event, points plus doubles

### No Chows

Use a winning all-Pung/Kong ordinary hand.

- BMJA: one no-Chows double; no +10 point bonus.
- Buzzard: one no-Chows double **and** +10 points.

### Last wall

- BMJA: last-wall double; no Buzzard +10.
- Buzzard: last-wall double +10.

### Loose Tile

- BMJA: Loose-Tile double; no Buzzard +10.
- Buzzard: Loose-Tile double +10.

Purpose: prove point and double rules are independent selectors bound to the same evidence event.

---

## H. Buzzard manual evidence rules

For the same tile layout, toggle only final scoring evidence.

- `standingHand=false` → no +100.
- `standingHand=true` → +100.
- `onlyPossibleTile=false` → no +2.
- `onlyPossibleTile=true` → +2.

Purpose: prove enabled rules can declare manual evidence dependencies without a gameplay event simulator.

---

## I. OTB-specific ordinary selectors

Use hands that isolate:

- three concealed Pung/Kong double;
- Little Three Dragons;
- Big Three Dragons;
- Little Four Winds/Joys;
- Big Four Winds/Joys;
- winning-pair point rule.

Expected:

- enabled under OTB;
- absent from BMJA unless BMJA has an independently bound special treatment;
- absent from Buzzard ordinary rules unless Buzzard source separately enables the same rule.

Purpose: prove existing OTB callback logic can migrate toward registry-backed rules without leaking into other profiles.

---

## J. Special-hand profile binding isolation

Use canonical patterns already shared between profiles.

Examples:

### Three Great Scholars

Assert profile-local value/binding:

- BMJA: existing BMJA value/fishing treatment;
- T&M: 1500 / 600;
- OTB: 1000 / 400;
- Buzzard: profile-specific limit treatment where the source condition matches its named limit rule.

### Four Blessings / Wind family

Assert one detector can bind differently by profile without detector duplication.

Purpose: prove canonical pattern != score.

---

## K. `configured-limit` special binding

Choose a Buzzard limit hand whose detector is already or newly available.

Run the same hand twice:

- active table limit 600 → final special value 600;
- active table limit 800 → final special value 800.

No catalogue data should need editing between runs.

Purpose: prove `configured-limit` is a reusable score model rather than ten hard-coded 600 values.

---

## L. Fixed-special bonus treatment isolation

Use OTB's documented fixed-special + Flower/Season side-score example shape.

Expected:

- OTB policy can preserve the independent bonus-tile subtotal above the ordinary/fixed special cap (documented 1008-style behaviour);
- BMJA/T&M retain their current different cap behaviour unless their own source says otherwise.

Purpose: prove cap treatment is a profile setting/policy and does not leak globally.

---

## M. Custom profile patch resolution

Start from exact `bmja@1.0`.

Apply only:

```text
limit = 500
maxChows = 2
concealed-hand = disabled
final-discard = disabled
last-wall point bonus = +10
```

Assert:

- unchanged BMJA settings remain inherited from the exact base version;
- overridden settings change only those rules;
- resolved manifest is complete and deterministic;
- resolved hash changes when one override changes;
- original BMJA preset remains unchanged.

Purpose: prove future Plus house rules use the same engine safely.

---

## N. Configuration validation failures

The resolver/validator must reject, not ignore:

- unknown `schemaVersion`;
- unknown rule ID;
- unsupported option for a known rule;
- negative/non-finite limit;
- negative doubles/points where rule definition disallows them;
- unknown special `patternId`;
- `configured-limit` special with a conflicting fixed value;
- unknown settlement/mode policy;
- mutually exclusive rule variants if represented separately;
- override of a field marked non-customisable.

Purpose: user-created profiles cannot become silently ambiguous.

---

## O. Evidence/provenance preservation

After migration:

- BMJA settings remain `verified`;
- OTB club settings remain `verified-club` where established;
- T&M ordinary runtime assumptions remain `provisional-compatible` until primary verification;
- Buzzard settings remain tied to the recovered 2000 source snapshot.

Purpose: configuration is not permission to erase uncertainty.

---

## P. Cross-profile regression gate

Before #219 can finish:

- all existing BMJA tests pass unchanged or are mechanically rehomed with identical expected behaviour;
- existing T&M catalogue/fishing tests pass;
- existing OTB scorer, catalogue, Goulash and incident tests pass;
- Buzzard fixtures pass;
- no profile obtains a rule solely because another profile enabled it;
- no test is weakened to fit the abstraction.

## Expected #219 report

Codex should report, after the fixtures pass:

1. which fixture groups are now pure configuration;
2. which reusable evaluators/predicates were added;
3. which existing handwritten OTB/BMJA paths remain and why;
4. which fields can safely become Plus selectors;
5. any profile behaviour that the proposed v1 schema cannot express without semantic loss.
