# Classical / Western profile configuration matrix

Status: **design input for #219**  
Profiles compared: BMJA, Thompson & Maloney Western (`western-tm@0.1`), Outside the Box (`outside-the-box@0.1`), Buzzard 2000  
Purpose: derive the smallest repeatable rules vocabulary that can express published profiles and later club/family house-rule variants without a bespoke scorer per profile.

## Product conclusion

For Classical/Western-adjacent Mahjong, most variation is not a new scoring grammar. It is a combination of:

- an existing structural rule/predicate being enabled or disabled;
- a numeric point/double/limit value changing;
- a known predicate variant being selected;
- special-hand catalogue membership/value/exposure changing;
- a known round mode, settlement or incident policy being selected.

The intended authoring model is therefore:

> **baseline preset + selectors/toggles + value overrides + catalogue selection = resolved deterministic profile**

A new club should require code only when its rules contain a genuinely new concept that cannot be represented by the existing vocabulary.

## Status notation

- **V** — source/profile evidence verified for that profile.
- **VC** — verified from the club's own guide.
- **P** — provisional/current executable compatibility; primary Western source still needs checking.
- **—** — disabled/not part of that profile.
- **?** — not established by current evidence.

The matrix does not silently turn provisional T&M ordinary rules into verified facts.

---

## 1. Identity, limit and ordinary score table

| Config concept | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Configuration shape |
|---|---|---|---|---|---|
| profile id/version | `bmja@1.0` | `western-tm@0.1` | `outside-the-box@0.1` | `buzzard-2000-classical@0.x` | identity/version data |
| family | Classical/Western | Classical/Western | Classical/Western club | Classical/Western historical | enum `classical-western` |
| default limit | 1000 — V | 1000 current runtime — P; fixed specials may exceed | 1000 — VC | 600 source-derived example/default; table-agreed limit — V | number + `tableAdjustable` boolean |
| Chow basic points | 0 — V | inherited current runtime — P | 0 — VC | 0 — V | number |
| exposed minor Pung | 2 — V | P | 2 — VC | 2 — V | number |
| concealed minor Pung | 4 — V | P | 4 — VC | 4 — V | number |
| exposed major/honour Pung | 4 — V | P | 4 — VC | 4 — V | number |
| concealed major/honour Pung | 8 — V | P | 8 — VC | 8 — V | number |
| exposed minor Kong | 8 — V | P | 8 — VC | 8 — V | number |
| concealed minor Kong | 16 — V | P | 16 — VC | 16 — V | number |
| exposed major/honour Kong | 16 — V | P | 16 — VC | 16 — V | number |
| concealed major/honour Kong | 32 — V | P | 32 — VC | 32 — V | number |
| Dragon pair | 2 — V | P | 2 — VC | 2 — V | number |
| own-Wind pair | 2 — V | P | 2 — VC | 2 — V | number |
| prevailing-Wind pair | 2 — V | P | 2 — VC | 2 — V | number |
| Flower/Season base points | 4 each — V | P | 4 each — VC | 4 each — V | number; 0 can disable scoring while retaining tiles |
| Mahjong/win points | 20 — V | P | 20 — VC | 20 — V | number |
| self-drawn live-wall win points | 2 — V | P | 2 — VC | 2 — V | number |

### Finding

The ordinary point table is already overwhelmingly a **data table**, not profile code. T&M remains provisional because the intended primary ordinary-rules source has not yet been fully checked.

---

## 2. Additive point/bonus rules

Values are expressed as points; `0` means disabled.

| Stable rule concept | BMJA | T&M Western | OTB | Buzzard | User-facing selector candidate? |
|---|---:|---:|---:|---:|---|
| `bonus.only-possible-tile` | 0 / not implemented as BMJA rule | ? | guide mentions 2 but current evidence cannot prove the wait from hand layout | 2 — V | **Yes** once evidence field exists |
| `bonus.standing-hand` | 0 | ? | 0 | 100 — V | Yes, advanced |
| `bonus.no-chows` | 0 additional points | ? | 0 additional points | 10 — V | Yes |
| `bonus.scoreless-hand` | 0 | ? | 0 | 10 — V | Yes |
| `bonus.last-wall` | 0 additional points | ? | OTB has current local point treatment around last-wall/live-wall evidence | 10 — V | Yes |
| `bonus.loose-tile-win` | 0 additional points | ? | 0 unless club evidence says otherwise | 10 — V | Yes |
| `bonus.completed-pair.minor` | 0 | ? | 2 — VC | 0 | Advanced |
| `bonus.completed-pair.major` | 0 | ? | 4 — VC | 0 | Advanced |

### Finding

These are simple `ruleId -> numeric value` entries once the triggering predicate/evidence exists. A profile should not need an `additionalPointRules()` callback merely to change these numbers.

---

## 3. Standard doubles / multipliers

Represent ordinary classical doubling as a count of doubles (`0` disabled, `1` = ×2, `2` = ×4, `3` = ×8). This keeps the score explanation auditable and matches the existing `RuleResult` model.

| Stable rule concept | BMJA | T&M Western | OTB | Buzzard | Config type |
|---|---:|---:|---:|---:|---|
| `double.own-wind-set` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.prevailing-wind-set` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.dragon-set` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.own-flower` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.own-season` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.no-chows` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.mixed-one-suit-honours` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.all-majors` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.concealed-hand` | 1 — V | P | conditional: only retained for wall wins in current OTB policy — VC | 0 — V | integer + eligibility variant |
| `double.rob-kong` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.last-wall` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.loose-tile` | 1 — V | P | 1 — VC | 1 — V | integer |
| `double.final-discard` | 1 — V | P | 1 — VC | 0 — V | integer |
| `double.original-call` | 1 — V | P/current runtime | 1 via current shared ordinary policy unless later club evidence changes | 0; Standing Hand is different — V | integer |
| `double.all-chows-nonscoring-pair` | 0 | ? | 0 | 1 — V | integer |
| `double.three-concealed-pung-kong` | 0 | ? | 1 — VC | 0 | integer |
| `double.little-three-dragons` | profile special/catalogue treatment, not current generic ordinary selector | ? | 1 — VC | source limit family differs | integer only when same predicate semantics are proven |
| `double.big-three-dragons` | profile special/catalogue treatment | ? | 2 — VC | source limit family differs | integer only when same predicate semantics are proven |
| `double.little-four-winds` | profile special/catalogue treatment | ? | 1 — VC | source limit family differs | integer only when same predicate semantics are proven |
| `double.big-four-winds` | profile special/catalogue treatment | ? | 2 — VC | source limit family differs | integer only when same predicate semantics are proven |

### Finding

Most ordinary doubling behaviour can be a **selector/value map**. Where the same English label hides different structural semantics, use a stable predicate/rule ID rather than forcing unrelated rules into one switch.

---

## 4. Flower / Season behaviour

This area proves why values sometimes need one small enum as well as numbers.

| Concept | BMJA | T&M Western | OTB | Buzzard |
|---|---|---|---|---|
| bonus tiles enabled | yes — V | P | yes — VC | yes — V |
| points each | 4 | P | 4 | 4 |
| own Flower/Season | +1 double | P | +1 double | +1 double |
| complete four Flowers | 2 doubles total, **inclusive** of own-Flower rule in current BMJA implementation | ? | current implementation reuses BMJA bouquet behaviour | 3 doubles (×8), **additive** with own Flower |
| complete four Seasons | same as Flowers | ? | current implementation reuses BMJA bouquet behaviour | 3 doubles (×8), **additive** with own Season |

Required config vocabulary:

```text
bonusTiles.pointsEach: number
bonusTiles.ownFlowerDoubles: integer
bonusTiles.ownSeasonDoubles: integer
bonusTiles.fullFlowerSetDoubles: integer
bonusTiles.fullSeasonSetDoubles: integer
bonusTiles.fullSetCombination: 'replace-own' | 'additive'
```

That one `fullSetCombination` enum expresses the meaningful BMJA/Buzzard difference without profile-specific code.

---

## 5. One-suit / Purity behaviour

This is the clearest example of **predicate selection + value** rather than a boolean.

| Profile | Evidence/current behaviour | Config interpretation |
|---|---|---|
| BMJA | Purity requires four Pungs/Kongs + pair, one suit, no honours/Chows; 3 doubles | predicate `pure-suit-pung-kong-only`, doubles `3` |
| T&M Western | current catalogue includes a calculated `purity-one-chow` binding; broader ordinary baseline still being verified | predicate/binding selected by profile; status remains provisional where ordinary rule authority is incomplete |
| OTB | supplied guide currently reuses BMJA calculated Purity | predicate `pure-suit-pung-kong-only`, doubles `3` |
| Buzzard | entire hand in one suit, Chows permitted; 3 doubles (×8) | predicate `pure-suit-any-standard-meld`, doubles `3` |

Required config vocabulary:

```text
pureSuit.rule: null | 'pure-suit-pung-kong-only' | 'pure-suit-any-standard-meld' | other registered predicate ID
pureSuit.doubles: integer
```

The predicate registry remains code; the profile selects an existing predicate by stable ID.

---

## 6. Special-hand catalogue

This is already the most declarative area of the codebase.

A profile binding can vary independently by:

- canonical `patternId`;
- included/excluded;
- profile-local name/description key;
- fixed winning value;
- fishing value;
- exposure allowed/forbidden;
- exposed winning/fishing values;
- permitted winning methods;
- calculated-vs-fixed score model;
- calculated exposure multiplier/policy.

| Profile | Current shape |
|---|---|
| BMJA | finite approved catalogue plus calculated Purity behaviour |
| T&M Western | large explicit profile binding catalogue; values/exposure can differ from BMJA |
| OTB | 33 club bindings, mostly reuse of existing canonical detectors with profile-local values/exposure; several T&M overrides |
| Buzzard | ten source-defined limit conditions, some structural and some event/context based |

### Configuration conclusion

Do **not** create a bespoke field for every named special hand. Reuse the existing binding concept as profile data. A future house-rules UI can expose known canonical patterns as include/exclude/value/exposure controls.

---

## 7. Special-value / limit semantics

| Concept | BMJA | T&M Western | OTB | Buzzard | Config candidate |
|---|---|---|---|---|---|
| ordinary cap/default | 1000 | 1000 current runtime — P | 1000 | 600 source example/default, table-adjustable | `limit.default`, `limit.tableAdjustable` |
| fixed special can exceed ordinary cap | profile-specific published handling | yes in current T&M bindings | OTB uses published fixed values; bonus-tile side score can remain above cap | limit hands score agreed limit | enum/strategy ID, not arbitrary callback |
| bonus-tile side score on fixed special | standard current BMJA behaviour | current profile semantics | explicitly preserved above ordinary cap in OTB | source-specific classical calculation | strategy ID/value fields |
| event/context limit hands | named specials | catalogue dependent | some event limit evidence remains follow-up | Original Hand, East first discard, East 13th consecutive win etc. | registered event predicate binding |
| non-winner limit result | no current generic BMJA need | not established | no current generic need | yes for incomplete Wind/Dragon cases | **new reusable capability**; likely not ordinary user-facing v1 switch |

### Finding

The limit value is simple configuration. The **way a special interacts with the cap** is a small finite strategy choice and should become an enum/registered policy, not executable profile code.

---

## 8. Ordinary settlement and progression

| Concept | BMJA | T&M Western | OTB | Buzzard | Config shape |
|---|---|---|---|---|---|
| each loser pays winner | yes — V | current runtime inherits — P | yes — VC | yes — V | settlement preset/boolean |
| loser-to-loser differences | yes — V | current runtime inherits — P | yes — VC | yes — V | boolean |
| East pays/receives multiplier | 2 — V | current runtime — P | 2 — VC | 2 — V | number |
| East retains after East win | yes | current runtime — P | yes/current classical progression | yes — V | progression preset |
| East retains after draw/dead hand | yes | current runtime — P | yes | yes — V | progression preset |
| non-East win rotates seats | yes | current runtime — P | yes | yes — V | progression preset |
| prevailing wind advances after dealer cycle | yes | current runtime — P | yes/current profile | yes — V | progression preset |

### Finding

These profiles do not currently justify a configurable progression expression language. A small registered preset such as `classical-east-cycle` is enough. Expose settings to users only when real clubs demonstrate meaningful alternatives.

---

## 9. Goulash / alternate hand mode

| Concept | BMJA | T&M Western | OTB | Buzzard |
|---|---|---|---|---|
| drawn hand can trigger alternate mode | yes, BMJA Goulash exists | primary-source verification pending | yes — VC | no Buzzard Goulash identified |
| OTB draw state machine | not assumed identical | ? | Normal draw → Goulash; Goulash draw → Goulash; winner → Normal | — |
| blanks/wilds | BMJA has its own Goulash mechanism | ? | four blanks; profile-specific legality | — |
| Chow rule in Goulash | BMJA-specific | ? | no Chows | — |

### Configuration conclusion

Do not reduce Goulash to `true/false`. Treat it as a registered **mode preset/config component**. A user-facing builder can initially offer known presets such as `none`, `BMJA Goulash`, `Outside the Box Goulash` rather than exposing every low-level blank/wild rule immediately.

---

## 10. Incidents, penalties and liability

These are table-running rules, not ordinary hand mathematics.

| Capability | BMJA | T&M | OTB | Buzzard | Repeatable representation |
|---|---|---|---|---|---|
| incorrect hand/tile count | source procedure exists | ? | manual incident with OTB consequence | source-specific too-few/too-many consequences | registered incident policy ID + parameters |
| false Mahjong | source procedure exists | ? | half-limit to each opponent if exposed | fully exposed: double limit to each opponent | incident policy + multiplier |
| dangerous discard / cannon | not established as current generic BMJA profile rule | ? | cannon: liable player pays winner all three shares, no other settlement | similar full-payment liability with source-defined dangerous conditions | reusable settlement-override primitive + profile trigger labels |
| false discard name | source/Q&A needs indexing | ? | OTB-specific recorded policy | not part of Buzzard evidence set used here | registered incident policy |
| wrong tile claim | source/Q&A needs indexing | ? | OTB-specific manual incident | source procedure exists | registered incident policy |

### Finding

The existing OTB incident code demonstrates that the **transaction consequence** is reusable while trigger details are profile-local. For v1 custom house rules, advanced incidents can remain preset/policy choices rather than arbitrary user-authored formulas.

---

## 11. Evidence inputs required by scoring

These are facts the physical table/player supplies. They are **not** a request to simulate play.

| Evidence fact | BMJA | T&M | OTB | Buzzard | Config/UI implication |
|---|---|---|---|---|---|
| winning method | yes | yes | yes | yes | common input |
| original call | yes | current runtime | current shared rule | no | show only when enabled rule requires it |
| standing hand | no | ? | no | yes | show when enabled |
| only possible tile | not current ordinary BMJA input | ? | club guide has a rule but evidence cannot currently infer it | yes | manual toggle when enabled |
| first-discard / first-wall event | profile-specific specials | profile-specific | OTB follow-up | Buzzard limit event | event selector only for profiles that use it |
| East consecutive win count | not required by current BMJA hand scorer | ? | no current need | Buzzard 13th-win limit | game context can supply when enabled |
| liable player / cannon | profile dependent | ? | yes | yes | round incident input |

### Finding

The builder should derive the scorer form from the resolved profile: **if a rule is disabled, its evidence question should disappear.**

---

## 12. What is configuration already vs new reusable vocabulary

### Already essentially configuration/data

- profile identity/version;
- default limit;
- special-hand catalogue bindings;
- fixed values/fishing values/exposure values;
- whether a canonical special is present in a profile;
- current profile selection/persistence;
- settlement/progression function choice at profile level.

### Currently hard-coded but naturally configuration

- ordinary Pung/Kong/pair/bonus-tile point values;
- ordinary winner point values;
- enabled/disabled standard doubles;
- number of doubles awarded by each rule;
- winning-method doubles;
- own/full Flower/Season treatment;
- pure-suit predicate + double count;
- fixed-special cap strategy;
- extra winner bonuses such as Buzzard's +10/+100 cases.

### Small reusable capabilities still needed

- serialisable scoring-evidence fields for Standing Hand and only-possible-tile where enabled;
- registered predicate variant for Buzzard pure one-suit with Chows;
- non-winner special/limit result for Buzzard's incomplete Wind/Dragon cases;
- data-driven mapping of incident type to settlement policy/parameters;
- resolver/validator that turns a baseline + overrides into a complete deterministic config.

### Not justified as generic machinery yet

- arbitrary rule-expression DSL;
- user-authored JavaScript/functions;
- universal wall/draw/discard simulator;
- arbitrary settlement formulas;
- arbitrary progression programs;
- CRDT/event sourcing for rules.

---

## 13. User-facing house-rule selector candidates

### Strong v1 candidates

These are understandable at a table and already evidenced as real variation:

- starting preset;
- score limit;
- Flowers/Seasons used/scored;
- points per Flower/Season;
- own Flower/Season doubles;
- full Flower/Season set treatment;
- concealed-hand double on/off/eligibility;
- no-Chows double on/off;
- final-discard double on/off;
- last-wall double/bonus;
- Loose-Tile double/bonus;
- rob-Kong double;
- Original Call on/off;
- Standing Hand bonus;
- only-possible-tile bonus;
- pure-suit rule variant + value;
- special-hand catalogue include/exclude/value/exposure;
- table limit;
- Goulash preset.

### Advanced/preset-first candidates

- Little/Big Dragon/Wind extra doubles;
- three-concealed-Pung/Kong double;
- pair-completion points;
- fixed-special side-score/cap strategy;
- false-Mahjong penalties;
- cannon/dangerous-discard liability;
- wrong tile count consequences;
- non-winner limit achievements.

### Internal only for v1

- config schema version;
- canonical predicate IDs;
- source/evidence metadata;
- profile fingerprint;
- migration version;
- registered settlement/progression strategy IDs.

---

## 14. Repeatable club onboarding test

A future Western-adjacent club profile is **configuration-only** when all of the following are true:

1. its ordinary point values map to existing fields;
2. every ordinary bonus/double maps to a registered rule ID/predicate;
3. its special hands map to existing canonical detectors or can be added as catalogue data over an existing detector;
4. its limit/cap treatment maps to a registered strategy;
5. settlement/progression maps to an existing preset;
6. any incidents map to registered policies;
7. required table facts can be captured by existing evidence inputs;
8. golden fixtures validate the result without adding profile-specific code.

If one item fails, that failure becomes a **small engineering ticket to add one reusable vocabulary item**. Once added, every later club can select it.

## 15. Practical result for #219

Buzzard should be used to test this architecture, not merely implemented beside it.

The desired result is approximately:

```text
western/classical engine
        +
resolved ClassicalProfileConfig
        +
profile-local special-hand bindings
        =
deterministic scorer
```

If Buzzard can be represented almost entirely in the config vocabulary above, the next proof is to express BMJA, OTB and the executable/provisional portion of T&M through the same resolved config without changing their results.
