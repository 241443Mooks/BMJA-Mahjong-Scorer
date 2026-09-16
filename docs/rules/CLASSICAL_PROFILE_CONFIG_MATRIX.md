# Classical / Western profile configuration matrix

Status: **pre-Codex configuration design**  
Implementation target: #219  
Profiles compared: BMJA, provisional Thompson & Maloney Western, Outside the Box, Buzzard 2000

## Purpose

This matrix asks one practical question:

> **If a player or club starts from a known Classical/Western profile, which differences are just selectors, values or catalogue choices, and which differences genuinely require new engine behaviour?**

It is deliberately scoped to Mahjong Reference's product boundary: **score the physical game and run the table**. It does not model every physical-play procedure.

The intended future user experience is:

> choose a baseline → switch common rules on/off → change supported values/options → choose special hands → save the variant.

A new club should require engineering only when its rule cannot be represented by the existing vocabulary.

## Evidence/status key

- **V** — verified from the profile's intended authority/source.
- **VC** — verified from the named club's own source.
- **P** — current provisional-compatible runtime behaviour; primary source still incomplete.
- **R?** — current runtime inheritance exists, but profile-specific source evidence is not established. Treat as a migration audit item, not verified truth.
- **U** — unknown / not yet source-established.
- **N/A** — profile does not use the concept.

Important: a shared runtime value does not by itself prove a historical or rules-authority relationship.

---

## 1. What the current code already proves

The repository already has most of the ingredients needed for a configuration layer:

- versioned `RulesProfileRef` identities;
- a shared deterministic `scoreHand` entry point;
- profile-local special-hand bindings;
- profile-local `ScoringPolicy` hooks;
- canonical pattern detectors separated from profile values/names;
- transaction-based settlement;
- profile registry and persisted rules-profile references;
- OTB-specific incident handling as a separate policy layer.

The main obstacle is not missing capability. It is that several Classical/BMJA rules are still hard-coded inside `rules.ts`, `score.ts` and `validation.ts` rather than selected from serialisable profile data.

---

## 2. Profile identity, defaults and validation

| Config dimension | BMJA | Western / T&M | Outside the Box | Buzzard 2000 | Config shape |
|---|---|---|---|---|---|
| profile id/version | `bmja@1.0` — V | `western-tm@0.1` — P | `outside-the-box@0.1` — VC | `buzzard-2000-classical@0.x` — V source / pre-runtime | identity data |
| Classical/Western engine family | yes | yes, provisionally | yes | yes | fixed family selector |
| default ordinary limit | 1000 — V | 1000 current ordinary default — P | 1000 — VC | 600 source example/default; table may choose another — V | numeric default + `userAdjustable` |
| normal-hand max Chows | 1 — V | U | ordinary-play cap not established in current club evidence | at least 4 must be legal because an all-Chows winning hand is scoreable — V | numeric / `null` unrestricted |
| Flowers/Seasons available for scoring | yes — V | catalogue/ordinary baseline P | yes — VC | yes — V | toggle |
| Goulash validation mode | BMJA has Goulash rules — V | U | yes after draw — VC | no identified Buzzard Goulash | mode policy |
| Goulash max Chows | source-specific BMJA rule; index separately | U | 0 — VC | N/A | per-mode numeric |
| blank/wild tile support | BMJA mechanism to keep source-indexed | U | four blanks with OTB-specific legality — VC | N/A | named mode policy, not free-form values yet |

### First important refactor discovery

`validation.ts` currently hard-codes **“a normal BMJA hand may contain at most one chow”** for every profile. Buzzard's source explicitly scores an all-Chows winner, so `maxChows` is already proven to be a profile setting rather than a universal validation rule.

This is exactly the kind of difference the configuration layer should absorb.

---

## 3. Ordinary intrinsic point table

| Rule | BMJA | Western / T&M | OTB | Buzzard | Config conclusion |
|---|---:|---:|---:|---:|---|
| exposed minor Pung | 2 V | 2 current runtime P | 2 VC | 2 V | common Classical table preset |
| concealed minor Pung | 4 V | 4 current runtime P | 4 VC | 4 V | common preset |
| exposed major/honour Pung | 4 V | 4 current runtime P | 4 VC | 4 V | common preset |
| concealed major/honour Pung | 8 V | 8 current runtime P | 8 VC | 8 V | common preset |
| exposed minor Kong | 8 V | 8 current runtime P | 8 VC | 8 V | common preset |
| concealed minor Kong | 16 V | 16 current runtime P | 16 VC | 16 V | common preset |
| exposed major/honour Kong | 16 V | 16 current runtime P | 16 VC | 16 V | common preset |
| concealed major/honour Kong | 32 V | 32 current runtime P | 32 VC | 32 V | common preset |
| Dragon pair | 2 V | 2 current runtime P | 2 VC | 2 V | common preset |
| own Wind pair | 2 V | 2 current runtime P | 2 VC | 2 V | common preset |
| prevailing Wind pair | 2 V | 2 current runtime P | 2 VC | 2 V | common preset |
| Flower/Season basic points | 4 each V | 4 current runtime P | 4 each VC | 4 each V | common preset |

### Configuration implication

Do **not** make a user configure twelve numbers merely because the engine can.

Use a named internal preset such as `classical-standard-points-v1`, with optional advanced overrides only if later evidence proves clubs actually change these values.

For the current four profiles, this whole table is one reusable component.

---

## 4. Winner/additive point rules

| Stable concept | BMJA | Western / T&M | OTB | Buzzard | Future control |
|---|---|---|---|---|---|
| `score.point.mahjong` | +20 V | +20 current P | +20 VC | +20 V | numeric, normally hidden under preset |
| `score.point.self-draw-live-wall` | +2 V | +2 current P | +2 VC | +2 V | toggle + points |
| `score.point.winning-pair` | not separately implemented | not established | +2 minor / +4 major VC | not established | reusable rule with value options; OTB only today |
| `score.point.standing-hand` | N/A | U | N/A | +100 V | toggle + points; requires manual evidence |
| `score.point.only-possible-tile` | not current | U | guide mentions concept but current evidence contract cannot prove it | +2 V | toggle + points; manual evidence allowed |
| `score.point.no-chows-bonus` | 0 | U | 0 current | +10 V | toggle + points |
| `score.point.scoreless-hand` | 0 | U | 0 current | +10 V | toggle + points |
| `score.point.last-wall` | 0 additional points | current P | OTB current policy adds +2 live-wall handling, not Buzzard +10 | +10 V | toggle + points tied to event evidence |
| `score.point.loose-tile` | 0 additional points | current P | 0 additional current | +10 V | toggle + points tied to event evidence |

### Configuration implication

These are textbook user-configurable rules: an enabled flag plus a numeric value, with the rule registry declaring what evidence/predicate makes the rule applicable.

Config stores data; the engine owns the evaluator.

---

## 5. Wind, Dragon and bonus-tile doubles

| Stable concept | BMJA | Western / T&M | OTB | Buzzard | Config shape |
|---|---|---|---|---|---|
| `score.double.own-wind-set` | 1 V | 1 current P | 1 VC | 1 V | enabled + doubles |
| `score.double.prevailing-wind-set` | 1 V | 1 current P | 1 VC | 1 V | enabled + doubles |
| `score.double.dragon-set` | 1 V | 1 current P | 1 VC | 1 V | enabled + doubles |
| `score.double.own-flower` | 1 V | current P | 1 VC | 1 V | enabled + doubles |
| `score.double.own-season` | 1 V | current P | 1 VC | 1 V | enabled + doubles |
| complete four Flowers | **2 doubles total, own-tile treatment inclusive** V | current P | current OTB implementation/evidence aligned to BMJA | **3 doubles in addition to own Flower when applicable** V | doubles + stacking enum |
| complete four Seasons | same as Flowers V | current P | aligned to BMJA | same Buzzard cumulative treatment V | doubles + stacking enum |

### Required reusable setting

A complete-set bonus cannot be represented by only `doubles: number`; it also needs a known stacking option:

```text
completeSetStacking = inclusive-of-own | additive-with-own
```

That is a finite selector, not a generic expression language.

Buzzard proves the need because four Flowers/Seasons ×8 and own tile ×2 accumulate to ×16 when both apply.

---

## 6. Ordinary composition doubles

| Rule / predicate | BMJA | Western / T&M | OTB | Buzzard | Configuration conclusion |
|---|---|---|---|---|---|
| no Chows / all Pungs-Kongs winner | 1 double V | current P | 1 VC | 1 double V **plus +10 points** | shared double + independent Buzzard point rule |
| one suit + honours | 1 V | current P | 1 current/club-compatible | 1 V | reusable toggle/value |
| all majors (terminals + honours) | 1 V | current P | 1 current/club-compatible | 1 V | reusable toggle/value |
| fully concealed ordinary winner | 1 V | current P | only when wall/last-wall in current OTB policy VC | **off** V | rule + applicability choice |
| pure one suit | BMJA `Purity`: 3 doubles; no Chows/honours V | T&M calculated `Purity` permits one Chow; exposure policy differs — P/catalogue-backed | BMJA-style no-Chow Purity VC | 3 doubles, Chows allowed V | predicate variant + doubles |
| all Chows + non-scoring pair | off | not currently bound | off | 1 double V | reusable rule toggle |
| three concealed Pungs/Kongs | off as standalone current rule | U | 1 double VC; exposed Kong counts as concealed Pung | not ordinary rule; concealed P/K is a limit hand | reusable OTB rule; profile value/meaning differs |
| Little Three Dragons | no separate current ordinary rule | U | +1 double in addition to component doubles VC | not this rule | reusable named predicate |
| Big Three Dragons | handled via special catalogue rather than OTB ordinary rule | U | +2 doubles in addition to component doubles VC | limit-hand treatment | same detector may bind to different score models |
| Little Four Winds/Joys | no separate current ordinary rule | U | +1 double VC | not this rule | reusable named predicate |
| Big Four Winds/Joys | special/catalogue context | U | +2 doubles VC | different limit-hand context | same structural pattern, profile-local binding |

### Required reusable setting

`pure suit` proves that a rule needs both a **predicate variant** and a **score value**.

Candidate finite options:

```text
pureSuitShape = pung-kong-only | allow-one-chow | any-standard-melds
pureSuitDoubles = number
```

Do not encode arbitrary predicate expressions in profile data.

---

## 7. Winning-method / event doubles

| Event rule | BMJA | Western / T&M | OTB | Buzzard | Config shape |
|---|---|---|---|---|---|
| robbing Kong | 1 double V | current P | 1 current/club-compatible | 1 V | event rule toggle/value |
| last wall tile | 1 double V | current P | 1 current/club-compatible | 1 V + separate +10 points | event rule toggle/value |
| Loose Tile / replacement win | 1 double V | current P | current compatible | 1 V + separate +10 points | event rule toggle/value |
| final discard | 1 double V | current P | 1 current/club-compatible | **off** V | event rule toggle/value |
| Original Call | 1 double V | current P | **R?** currently inherited but OTB guide evidence not established in this matrix | N/A; Standing Hand is different | source-audit + toggle |
| Original Hand / Heavenly event | profile special/event treatment V | Western catalogue has related concepts | OTB limit events partly evidence-blocked by event contract | Buzzard ×8 and limit-hand binding V | canonical event pattern + profile binding |
| East first-discard win | named event in BMJA family / canonical event infrastructure | catalogue-dependent | OTB Earthly-style event not fully representable today | Buzzard limit V | evidence field + profile binding |
| East 13th consecutive Mahjong | no ordinary current rule | U | N/A | Buzzard limit V | table-context evidence + profile binding |

### Audit finding

OTB currently inherits some ordinary BMJA rules simply because the base scorer emits them and its policy does not remove them. The configuration migration should make these choices explicit rather than silently carrying them forward.

That is a feature of this exercise: the final manifest becomes a readable statement of what the profile actually uses.

---

## 8. Special-hand catalogue configuration

Special hands are already closest to the desired model.

The engine separates canonical detector from profile binding. A binding can already carry:

- `patternId`;
- profile identity;
- profile-local name/description;
- fixed winning value;
- fishing value;
- exposure policy;
- allowed winning methods;
- calculated score model/exposure behaviour.

Current profile shape:

| Profile | Catalogue position |
|---|---|
| BMJA | finite authoritative British catalogue |
| T&M | much larger Western catalogue; many bindings already present, ordinary-game baseline still provisional |
| OTB | 33 explicit club-selected hands; many reuse T&M/BMJA canonical detectors with profile-local values/exposure |
| Buzzard | ten source-defined limit hands / achievements plus ordinary calculated rules |

### Configuration conclusion

For a future house-rules profile, special hands should be a catalogue patch over the chosen base:

```text
specialHands.remove[]
specialHands.upsert[]
```

Each `upsert` remains declarative data. If a user asks for a hand whose **canonical detector does not exist**, that is a genuine engineering event. Once the detector exists, future profiles only bind/configure it.

### New reusable binding needed for Buzzard

Buzzard exposes a useful generic score model not represented cleanly by the current fixed-number binding:

```text
scoreModel = configured-limit
```

That allows a named pattern/event to score **the table's chosen limit**, rather than hard-coding 600 or 1000 into every binding.

This should be a reusable special-hand binding mode, not Buzzard-specific arithmetic.

---

## 9. Fishing / ready-state behaviour

| Dimension | BMJA | Western / T&M | OTB | Buzzard | Config conclusion |
|---|---|---|---|---|---|
| fixed special fishing values | yes V | yes for Companion catalogue V | yes VC | no generic fishing payout identified | catalogue-binding option |
| profile has a ready declaration concept | fishing/calling context | Western source-specific | club follows its guide | Calling + optional Standing Hand V | evidence/UI concepts, not one universal rule |
| Standing Hand scoring | N/A | U | N/A | +100 V | separate rule/evidence flag |

Do not rename all ready-state concepts to one universal semantic. The configuration layer may expose a rule control while preserving profile terminology in presentation.

---

## 10. Fixed specials, limits and cap behaviour

| Dimension | BMJA | Western / T&M | OTB | Buzzard | Config shape |
|---|---|---|---|---|---|
| ordinary limit | 1000 V | 1000 current P | 1000 VC | configured; 600 source example/default V | numeric |
| fixed special can exceed ordinary limit | published BMJA binding semantics | yes; T&M values include 1500/2000 | yes where binding says so | limit hands resolve to configured limit | binding score model |
| bonus-tile subtotal above fixed special/ordinary cap | current BMJA calculation caps according to existing scorer | same default runtime P | **preserved above cap** VC (`1008` example) | exact Buzzard interaction should be fixture-driven | enum / policy ID |

Candidate finite policy values:

```text
fixedSpecialBonusTreatment = capped-with-final-score | add-after-special-cap
```

Do not expose this as a first-wave user control unless real house-rule evidence shows people understand/change it.

---

## 11. Ordinary settlement and progression

| Dimension | BMJA | Western / T&M | OTB | Buzzard | Config conclusion |
|---|---|---|---|---|---|
| each loser pays winner's score | yes V | current P / primary still needed | yes VC | yes V | `classical-pairwise` settlement preset |
| losers settle pairwise score differences | yes V | current P / source priority gap | yes VC | yes V | same preset |
| East pays/receives multiplier | ×2 V | current P | ×2 VC | ×2 V | numeric multiplier |
| East retains after East win | yes V | current P | current classical progression | yes V | common progression policy |
| non-East win rotates seats | yes V | current P | current classical progression | yes V | common progression policy |
| dead/drawn hand retains East | yes V | current P | yes in OTB flow VC | yes V | common progression policy |
| prevailing wind cycle | E→S→W→N | current P | current classical progression | E→S→W→N V | common progression policy |
| game length | product supports one-round/full-game | source/profile-specific | product-selectable | source describes four rounds | game/table preference, not necessarily profile rule |

For these four profiles, ordinary settlement/progression is overwhelmingly reusable. Keep it as a named policy plus a small number of values rather than exposing individual transaction formulae.

---

## 12. Incidents, liability and penalties

These should be **named policy capabilities**, not a user-authored formula language.

| Capability | BMJA | T&M | OTB | Buzzard | Repeatable representation |
|---|---|---|---|---|---|
| dangerous-discard / cannon full winner liability | no current BMJA executable policy | U | yes VC; liable player pays all three winner shares, no other settlement; `No choice!` can cancel | yes V; dangerous discarder pays winner liability and loser settlement is suppressed | common liability capability + profile trigger/cancellation policy |
| false Mah Jong | source family has procedure; exact current executable policy not indexed here | U | if hand exposed: half-limit to each opponent VC | if fully exposed invalid Mahjong: double limit to each opponent V | finite policy selector + multiplier |
| incorrect tile count | source procedure exists | U | too-many score forced to zero; too-few may still score VC | distinct too-many / too-few settlement consequences V | incident policy ID; not arbitrary expressions |
| false discard name | source/Q&A to index | U | explicit OTB behaviour, one recipient gap deliberately not invented VC | source-specific Buzzard procedure differs | named policy, manual incident evidence |
| wrong tile claim | source/Q&A to index | U | OTB manual incident VC | source procedure exists | named policy if Table Companion needs it |

### Configuration boundary

A profile may select from implemented incident policies, for example:

```text
incidentPolicies = [
  "liability.full-winner-payment",
  "false-mahjong.half-limit-each"
]
```

A new payout formula that has never existed before is an engineering event. We do **not** put executable arithmetic in user JSON.

---

## 13. Draw modes / Goulash

Goulash is too rule-dense to be a single boolean internally, but the user experience can still be a selector.

Candidate profile setting:

```text
afterDrawMode = normal | bmja-goulash | otb-goulash
```

The selected mode policy owns:

- next-round state transition;
- Chow restriction;
- blank/wild legality;
- validation rules;
- any score differences.

If later evidence proves many clubs use the same Goulash mechanism with only one or two variable values, that policy can itself become configurable. Do not speculate before evidence.

---

## 14. Proposed v1 rule vocabulary discovered from real profiles

### Values/toggles suitable for generic Classical/Western configuration

```text
validation.normal.max-chows
score.point.mahjong
score.point.self-draw-live-wall
score.point.winning-pair
score.point.standing-hand
score.point.only-possible-tile
score.point.no-chows-bonus
score.point.scoreless-hand
score.point.last-wall
score.point.loose-tile
score.double.own-wind-set
score.double.prevailing-wind-set
score.double.dragon-set
score.double.own-flower
score.double.own-season
score.double.complete-flower-set
score.double.complete-season-set
score.double.no-chows
score.double.mixed-one-suit
score.double.all-majors
score.double.concealed-hand
score.double.pure-suit
score.double.all-chows-nonscoring-pair
score.double.three-concealed-pung-kong
score.double.little-three-dragons
score.double.big-three-dragons
score.double.little-four-winds
score.double.big-four-winds
score.double.rob-kong
score.double.last-wall
score.double.loose-tile
score.double.final-discard
score.double.original-call
```

Not every profile enables every rule.

### Finite options/variants required

```text
bonusSetStacking: inclusive-of-own | additive-with-own
pureSuitShape: pung-kong-only | allow-one-chow | any-standard-melds
concealedHandEligibility: any-concealed-winner | self-drawn-only | disabled
afterDrawMode: normal | bmja-goulash | otb-goulash
fixedSpecialBonusTreatment: capped-with-final-score | add-after-special-cap
ordinarySettlementPolicy: classical-pairwise
progressionPolicy: classical-winds
```

### Catalogue/configuration data

```text
special hand membership
special hand name/display key
fixed value / configured-limit model
fishing value
exposure allowed/half/full/custom supported binding
winning-method restrictions
```

### Evidence fields that the UI can reveal automatically when a rule needs them

```text
original call
standing hand
only possible winning tile
winning method
winning tile provenance
East first-discard event
replacement/Kong chain event
East consecutive-win count (Buzzard limit context)
liability/incident selections at settlement
```

A rule definition should declare its evidence dependency so the future scorer UI can show the right selector only when that rule is enabled.

---

## 15. What is configuration versus engineering?

### Configuration-only after v1 capability exists

A new club says:

- limit is 500;
- concealed hand does not double;
- last discard does not double;
- own Flower doubles;
- a full Flower set is worth three doubles and stacks with own Flower;
- use these 42 already-supported special hands with these published values;
- use OTB-style cannon;
- no Goulash after a draw.

That should require **no scorer code**: profile evidence + manifest + fixtures.

### Engineering event

A new club says:

- it has a special hand structure for which no canonical detector exists;
- it awards a score based on a calculation type the Classical engine cannot express;
- it has a new incident/payment topology not represented by a known settlement policy;
- it uses a genuinely new table mode rather than a known Goulash variant.

Implement the new reusable capability once. Add it to the rule/policy registry. Every later profile can select it.

---

## 16. Current migration risks exposed by the matrix

1. **Normal maximum Chow count is globally BMJA-coded.** This must become profile validation configuration before Buzzard can be correct.
2. **Purity is partly special-cased in `score.ts`.** It needs to become a selectable predicate/score behaviour rather than a universal branch.
3. **Bonus-tile doubles are BMJA-coded.** Buzzard proves complete-set stacking must be data-driven.
4. **Winning-method doubles are emitted as one BMJA bundle.** They need independent selectors.
5. **Original Call is a field on every hand.** It should only affect profiles that enable its rule.
6. **OTB handwritten scoring callbacks contain rules that are good candidates for registry-backed configuration.** Migration should reduce bespoke callbacks, not create more.
7. **T&M ordinary behaviour remains provisional.** Moving it into a manifest must preserve the `P` evidence status rather than relabel it verified.
8. **Published profiles and user customisations need different inheritance semantics.** Published profiles should resolve to explicit immutable configurations; user variants may conveniently store `base + overrides` and then resolve/freeze a snapshot for games.

---

## 17. Configuration-layer success test

#219 succeeds as an architecture experiment if, after implementation:

- Buzzard's ordinary scoring is almost entirely a serialisable manifest;
- BMJA, T&M and OTB can be represented by the same vocabulary without semantic loss;
- source status/provenance remains attached to published profile settings;
- adding a common club variant changes data, not scorer control flow;
- the remaining custom code corresponds to **genuinely new reusable capabilities**, not profile names;
- a future Plus UI can render meaningful house-rule controls from the same rule registry.

That is the point at which “support another Western-adjacent club” becomes onboarding rather than software development.
