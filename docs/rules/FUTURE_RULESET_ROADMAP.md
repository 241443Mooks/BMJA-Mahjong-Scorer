# Future Mahjong ruleset roadmap

This document is Pass 5 of the Mahjong Reference multi-ruleset research programme.

Its purpose is **not** to schedule every Mahjong variant for implementation. It records enough future-facing architecture to make sure the BMJA/Western work in #51 does not accidentally design the product around assumptions that only hold for British Mahjong.

It should be read alongside:

- `RESEARCH_BASELINE_2026-09-09.md`
- `RULESET_LANDSCAPE.md`
- `SOURCE_REGISTER.md`
- `PROVENANCE_MODEL.md`
- `BMJA_WESTERN_OTB_CROSSWALK.md`
- `SPECIAL_HANDS_PROVENANCE.md`

## Executive decision

Mahjong Reference should aim for a **shared game/pattern platform with pluggable rules strategies**, not one universal scorer with an ever-growing set of switches.

The first architecture proof remains:

1. British / BMJA
2. verified Thompson & Maloney Western
3. Outside the Box as a named club profile

Only after those three coexist cleanly should the project implement a materially different scoring family.

The future design should nevertheless leave room for at least these distinct grammars:

```text
Shared Mahjong platform
│
├── Classical / Western scorer
│   ├── British / BMJA
│   ├── Thompson & Maloney Western
│   └── named club profiles
│
├── Faan-based scorer
│   └── named Hong Kong / Cantonese profile
│
├── Riichi scorer
│   └── named formal rules edition
│
├── MCR scorer
│   └── Chinese Official / competition rules
│
├── Annual target-catalogue matcher
│   └── American / NMJL-style play
│
└── Later regional engines/profiles
    ├── Taiwanese 16-tile
    ├── Sichuan variants
    └── Singaporean / Malaysian families
```

This is a product/engineering taxonomy. It is not a claim that all historical lineages fit a clean software tree.

---

# 1. Shared primitives worth protecting now

The architecture in #83 and #84 should keep the following concepts as rules-neutral as practical.

## 1.1 Tile identity and tile-set definition

A tile should have a stable identity independent of ruleset scoring.

The platform should be able to describe a profile's tile set, including:

- suits and ranks;
- Winds;
- Dragons;
- Flowers/Seasons where used;
- Jokers or wild/blank tiles where used;
- duplicate counts;
- profile-specific optional tiles.

Do not hard-code `144 tiles` as a platform invariant. Riichi commonly uses 136; American sets commonly include Jokers; OTB Goulash can introduce blank wild tiles.

## 1.2 Hand and table state

Reusable state concepts include:

- player / seat identity;
- seat wind;
- prevailing/round wind where relevant;
- concealed tiles;
- declared/exposed groups;
- discards;
- drawn tile;
- winning tile/source;
- dealer/East state;
- turn/hand/round index;
- wall/dead-wall state where the product eventually needs it.

A profile may ignore a field; the shared model should not force British semantics onto it.

## 1.3 Canonical pattern predicates

Where the actual tile structure is verified as equivalent, the same detector can be reusable across profiles.

Examples identified by the research include:

- Thirteen Orphans / Thirteen Unique Wonders / Kokushi Musou;
- Nine Gates / Gates of Heaven / Chuuren Poutou;
- Big Three Dragons / Three Great Scholars / Daisangen;
- Big Four Winds / Four Blessings / Daisuushii;
- Four Kongs / Fourfold Plenty / Suukantsu;
- All Honours;
- All Green;
- All Terminals;
- Seven Pairs.

The detector must stay separate from:

- local name;
- catalogue membership;
- score/fan/han/yakuman value;
- exposure policy;
- interaction/exclusion rules;
- provenance.

## 1.4 Win-source / event primitives

Several rulesets care about events such as:

- self-draw;
- discard win;
- replacement tile after Kong;
- robbing a Kong;
- last tile;
- first-turn / Heavenly or Earthly conditions.

Represent the underlying event once, then allow each profile to value or prohibit it differently.

## 1.5 Liability / payment routing

The product should distinguish:

1. **how a hand is valued**, and
2. **who is liable to pay whom**.

This separation is needed not only for OTB cannon rules, but also for Hong Kong dangerous-discard conventions and Riichi `pao`-style liability.

Do not bury liability into a final numeric hand score.

## 1.6 Progression

Seat/dealer progression should be a strategy/component rather than a British invariant.

Profiles vary on:

- whether dealer repeats after a win;
- whether dealer repeats after a draw;
- number of winds/rounds;
- continuation counters;
- when a game ends;
- draw redeal behaviour.

## 1.7 Reproducible versioning

Every playable profile must be versioned or snapshotted strongly enough that a saved game cannot silently change mathematics later.

This is especially important for:

- club-profile edits;
- formal rules-edition changes;
- annual American card/catalogue changes.

---

# 2. What belongs in configuration versus a separate strategy

A useful rule for future implementation:

> **Configuration changes values or enables/disables known mechanics. A strategy changes the mathematical grammar or the way a valid result is derived.**

## Good configuration/profile data

Likely reusable as data/configuration inside a compatible grammar:

- tile-set composition;
- permitted number of Chows;
- ordinary set/pair point tables;
- game limit;
- doubles catalogue;
- special-hand catalogue membership;
- special-hand fixed values;
- fishing values;
- exposed/concealed eligibility;
- East/dealer multipliers;
- settlement multipliers;
- Goulash parameters;
- liability triggers;
- penalties;
- round length / rotation rules;
- local naming/aliases;
- source/provenance bindings.

## Separate strategy/module territory

Do not try to model these merely as British-rule switches:

- Hong Kong faan accumulation + conversion/payment logic;
- Riichi yaku/han + fu + limit tiers + ron/tsumo payment maths;
- MCR additive fan plus formal combination/exclusion rules and qualifying threshold;
- American annual exact-target catalogue matching with Jokers and Charleston;
- 16-tile winning grammar where hand structure itself differs materially;
- variants whose win/settlement lifecycle requires mechanics absent from the current game model.

---

# 3. Ruleset-by-ruleset future assessment

## 3.1 British / BMJA

**Status:** current production baseline.

**Standardisation:** high for the project because a BMJA-approved reference source is already identified.

**Scoring grammar:** classical intrinsic points + doubles + fixed/limit special hands + fishing + British settlement.

**Architecture role:** first profile and regression anchor.

**Immediate action:** #83 → #84 → #85.

**Non-negotiable:** zero behaviour change during migration.

---

## 3.2 Thompson & Maloney Western

**Status:** immediate next profile, but ordinary rules still need primary-source verification.

**Standardisation:** a recognised published Western reference tradition rather than a single global governing-body ruleset.

**Scoring grammar:** expected to be close to the classical/British grammar; verify all ordinary rules before coding equivalence.

**Likely reuse:** very high with BMJA for tile state, ordinary set concepts, pattern registry and perhaps substantial scoring primitives.

**Primary blocker:** inspect the relevant edition of *The Game of Mah Jong Illustrated* for ordinary play, settlement, progression and procedural details.

**Implementation:** #86.

---

## 3.3 Thompson & Maloney Companion catalogue

**Status:** immediate supplementary Western layer.

**Nature:** not a separate game engine. A large hand catalogue/reference layer.

**Likely reuse:** canonical pattern registry + Western profile bindings.

**Important architecture requirement:** support values beyond a simple 500/1,000 assumption and allow some catalogue entries to use ordinary calculation rather than one fixed score.

**Implementation:** #87.

---

## 3.4 Outside the Box

**Status:** immediate real-world club-profile proof.

**Standardisation:** authoritative only for that named club/profile.

**Scoring grammar:** mostly compatible with British/Western classical scoring, with selected catalogue choices and local settlement/procedure rules.

**Architecture value:** extremely high. It tests whether the system can compose a genuine club profile without club-specific application forks.

**Implementation:** #88, with #89 for live validation.

---

## 3.5 Hong Kong / Cantonese

**Status:** strong candidate for the first materially different scoring family after BMJA/Western/OTB.

**Standardisation:** medium. `Hong Kong Mahjong` is a family label, not one globally uniform ruleset. Implementation must name a specific authority/profile rather than claim generic Hong Kong correctness.

**Scoring grammar:** additive `faan`, then score/payment conversion rules.

**Likely shared primitives:**

- tiles and four-sets-plus-pair state;
- many canonical pattern detectors;
- exposure/concealment state;
- win-source events;
- liability/payment routing abstractions;
- seat/dealer state.

**Needs its own strategy:**

- faan accumulator;
- minimum-faan policy if the chosen profile uses one;
- score conversion/table;
- settlement/payment rules;
- profile-specific liability interpretation.

**Main product risk:** exposing a generic `Hong Kong` option that falsely implies one universal ruleset.

**Recommended implementation timing:** after #89 and after the architecture has survived one related profile and one club composition.

**Difficulty:** medium-high.

---

## 3.6 Japanese Riichi

**Status:** strategically attractive later profile because it is widely recognised and has strong formal rule sources.

**Standardisation:** high when pinned to a named formal rules edition such as WRC/EMA-compatible rules.

**Scoring grammar:** fundamentally distinct:

- yaku establish eligibility/value;
- han accumulation;
- fu calculation;
- capped tiers / yakuman;
- ron versus tsumo payment paths;
- dealer multiplier/continuation;
- riichi deposits and continuation counters.

**Likely shared primitives:**

- 136-tile subset of common tile identities;
- canonical pattern detectors where structurally equivalent;
- exposure/concealment;
- win-source events;
- dealer/seat state;
- generic liability routing.

**Needs its own strategy/domain concepts:**

- yaku eligibility;
- dora/ura/aka treatment if the chosen rules profile uses them;
- fu engine;
- furiten;
- riichi declaration state;
- tenpai/noten draw settlement;
- honba/riichi-stick settlement;
- pao;
- dealer continuation.

**Semantic warning:** Riichi `tenpai` is not British/Western `fishing`. Do not reuse a field merely because both describe an incomplete hand state.

**Recommended implementation timing:** likely after Hong Kong or MCR unless product demand strongly favours Riichi.

**Difficulty:** high.

---

## 3.7 Chinese Official / MCR

**Status:** strong future rules-engine test because source standardisation is high and pattern overlap with other disciplines is substantial.

**Standardisation:** high when pinned to the formal MCR edition.

**Scoring grammar:** additive fan with:

- qualifying minimum;
- formal combination rules;
- exclusions/non-duplication constraints;
- many named scoring combinations.

**Likely shared primitives:**

- classical tile identities;
- ordinary groups/hand state;
- many canonical pattern predicates;
- win-source events;
- exposure/concealment;
- seat/wind context.

**Needs its own strategy:**

- 81-combination fan evaluator;
- interaction/exclusion graph/rules;
- minimum qualification;
- MCR settlement.

**Architecture value:** very high. If canonical patterns remain rules-neutral under MCR, #84 has succeeded.

**Recommended implementation timing:** after the initial classical-family work; plausible competitor to Hong Kong for first non-classical grammar.

**Difficulty:** high, but formally bounded.

---

## 3.8 American / NMJL-style Mahjong

**Status:** important product/reference discipline, but not an early scoring-engine target.

**Standardisation:** high around the annual NMJL card ecosystem, but the **winning catalogue changes annually** and the commercial card itself is copyrighted/sold.

**Winning grammar:** fundamentally different from the classical default:

- exact target patterns from an annual card;
- Jokers;
- Charleston exchanges;
- card-defined values;
- annual catalogue version is part of the rules identity.

**Likely shared primitives:**

- much of the tile identity model;
- player/seat/turn state;
- some exposure concepts;
- generic catalogue/version infrastructure;
- possibly a generic pattern-matching foundation at a low level.

**Needs its own strategy/domain:**

- annual-card target matcher;
- Joker substitution constraints;
- Charleston state machine;
- American declaration/exposure legality;
- annual catalogue licensing/data strategy;
- American settlement rules.

**Legal/product gate:** Mahjong Reference must not scrape or republish a current sold card without permission or another lawful strategy. Engine capability and catalogue distribution must be treated separately.

**Recommended implementation timing:** later, after a licensing/user-owned-card strategy exists.

**Difficulty:** very high because product/legal/data issues matter as much as code.

---

## 3.9 Taiwanese 16-tile Mahjong

**Status:** later research candidate.

**Standardisation:** variable; rules differ by community/competition source, so implementation should use a named codification rather than `Taiwanese` generically.

**Architectural significance:** hand shape differs materially because players commonly hold/play a 16-tile style leading to a winning structure beyond the standard four-groups-plus-pair assumption.

**Likely shared primitives:**

- base tile identities;
- sets/groups;
- seat/dealer state;
- many individual pattern concepts.

**Potential new requirements:**

- configurable winning hand arity/shape;
- Taiwanese-specific scoring grammar;
- variant-specific dealer/repeat/settlement rules.

**Why it matters now:** #84 must not bake `exactly four groups + pair` into the definition of every canonical hand container.

**Recommended timing:** later, after selecting a strong primary/codified source.

**Difficulty:** high.

---

## 3.10 Singaporean / Malaysian families

**Status:** reference/research first; implementation later.

**Standardisation:** variable. These labels can encompass local families with distinctive bonus tiles, animal tiles, Joker mechanics and scoring conventions.

**Likely shared primitives:**

- common suited/honour tiles;
- group state;
- pattern framework;
- bonus-tile capability if modelled generally.

**Potential new requirements:**

- extensible bonus/special tile classes beyond Flowers/Seasons;
- variant-specific immediate bonuses/events;
- named-profile rather than generic-region implementation.

**Product rule:** do not implement a single `Singapore/Malaysia` switch until a specific documented ruleset has been selected.

**Difficulty:** medium-high to high depending on profile.

---

## 3.11 Sichuan variants

**Status:** later research candidate.

**Standardisation:** variant-dependent; use a named codified rules source.

**Architectural significance:** Sichuan forms can alter the lifecycle of the game itself, not just final hand scoring. Some variants include suit-exchange/declaration mechanics and continued play after a player wins.

**Likely shared primitives:**

- core tile identity;
- turn/discard state;
- some group/pattern logic.

**Potential new requirements:**

- pre-play exchange/declaration phase;
- player state that can transition to `won` while the hand continues for others;
- settlement across multiple wins within one deal;
- variant-specific restrictions on suits/hand legality.

**Why it matters now:** the game state machine should not assume `one winner -> hand immediately over` as an eternal platform invariant.

**Difficulty:** high.

---

# 4. Capability matrix

The table below is deliberately architectural rather than a promise of implementation.

| Capability | BMJA / Western | Hong Kong | Riichi | MCR | American | Taiwanese | Singapore/Malaysia | Sichuan |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Shared tile IDs | High | High | High | High | Medium/High | High | Medium/High | High |
| Four-groups + pair base model | High | High | High* | High | Low | Low/Modified | Profile-dependent | Profile-dependent |
| Canonical pattern reuse | High | High | High | High | Low/Medium | Medium | Medium | Medium |
| Base-points + doubles grammar | Yes | No | No | No | No | Profile-specific | Profile-specific | No/generalise carefully |
| Separate scoring strategy needed | Classical | Yes | Yes | Yes | Yes | Yes | Likely | Yes |
| Exposure state reusable | High | High | High | High | Medium | High | High | High |
| Generic win-source events reusable | High | High | High | High | Medium | High | High | High |
| Liability routing useful | OTB | High | High | Profile-specific | Profile-specific | Profile-specific | Profile-specific | Profile-specific |
| Special exchange phase | Goulash only | No standard | No standard | No standard | Charleston | Profile-specific | Profile-specific | Often relevant |
| Annual catalogue/version requirement | No | No | No | No | **Yes** | No | No | No |
| Multiple winners/continued hand risk | Low | Profile-dependent | Rule-dependent | Low | Low | Profile-dependent | Profile-dependent | **High** |

`*` Riichi also recognises special structures such as Seven Pairs and Thirteen Orphans.

---

# 5. Recommended post-OTB implementation order

This is a **decision framework**, not a fixed backlog.

After #83–#89, choose the next discipline using four factors:

- user demand / search opportunity;
- strength and accessibility of primary rules sources;
- architecture learning value;
- implementation and maintenance cost.

## Recommended default sequence

### Candidate A — Hong Kong, named codified profile

Why first:

- still visually/mechanically recognisable to classical players;
- high reuse of canonical patterns;
- introduces a genuinely new scoring grammar without Riichi's full state complexity;
- useful test of liability/payment abstraction.

### Candidate B — MCR

Why early:

- excellent formal source basis;
- large shared pattern surface;
- strong test of pattern bindings and interaction/exclusion logic;
- bounded official scoring catalogue.

### Candidate C — Riichi

Why after the architecture has matured:

- important and recognisable discipline;
- strong formal sources;
- substantially more domain state: yaku, fu, furiten, riichi, dora, honba, deposits, tenpai/noten, dealer continuation.

### American later unless licensing/data strategy changes the equation

American Mahjong could be highly valuable for reference/content and perhaps product growth, but scoring implementation should not begin by copying the annual NMJL card. Resolve catalogue rights/data strategy first.

### Regional families after source selection

Taiwanese, Singaporean/Malaysian and Sichuan work should begin with **source/codification selection**, not coding.

---

# 6. Architecture guardrails for #83 and #84

Pass 5 exists mainly to protect the near-term refactor. The following should therefore be treated as design tests.

## #83 Rules-profile framework must not assume

- every profile has 144 tiles;
- every profile uses Flowers/Seasons;
- every profile scores with base points and doubles;
- every game has one static special-hand catalogue;
- every profile has a concept equivalent to British fishing;
- every dealer behaves like BMJA East;
- every draw triggers a Goulash;
- every hand ends the instant the first player wins;
- every saved profile can be identified safely by an unversioned string.

## #84 Canonical pattern model must not assume

- a pattern owns its score;
- a pattern owns one universal display name;
- a detector's existence means the active profile recognises it;
- every winning hand is exactly four groups plus a pair;
- all aliases are structurally identical;
- all rule interactions can be represented inside the detector itself.

## Scoring-strategy boundary

A useful conceptual interface is:

```text
raw hand/table context
        ↓
profile legality
        ↓
canonical / profile-specific pattern evidence
        ↓
SCORING STRATEGY
        ↓
profile score result
        ↓
LIABILITY / SETTLEMENT STRATEGY
        ↓
player balance transactions
        ↓
PROGRESSION STRATEGY
```

Do not require every profile to populate every stage identically.

---

# 7. Source policy for future rulesets

Before a future discipline becomes selectable in the scorer:

1. choose a named/codified profile;
2. record the authority and exact edition/version;
3. build a rule-level provenance crosswalk;
4. distinguish formal rule from optional/local convention;
5. create golden fixtures against source examples where possible;
6. expose the active rules profile clearly;
7. persist the profile/version reproducibly.

Avoid labels such as `Hong Kong`, `Taiwanese`, `Malaysian` or `Western` when the implementation actually represents only one particular codification but does not say which one.

---

# 8. Product/reference support can precede scorer support

Mahjong Reference does **not** need to implement a scorer for a discipline before publishing accurate reference/comparison content about it.

This distinction is valuable:

```text
Reference coverage ≠ scoring support
```

For example, the site can truthfully explain:

- how Riichi scoring differs from British Mahjong;
- why American Mahjong uses an annual card;
- why `Hong Kong Mahjong` can refer to more than one local convention;
- how MCR fan differs from Western doubles;

while clearly labelling the scorer profiles that are actually implemented.

This becomes the basis for Pass 6.

---

# 9. Current roadmap decision

As of 9 September 2026:

```text
BUILD NOW / NEXT
BMJA -> Western -> Companion catalogue -> Outside the Box

ARCHITECT FOR, DO NOT BUILD YET
Hong Kong -> MCR -> Riichi

REFERENCE/RESEARCH FIRST
American/NMJL
Taiwanese 16-tile
Singaporean/Malaysian named variants
Sichuan named variants
```

The ordering after Outside the Box can change with real user/search evidence. The architectural boundaries should not.

## Pass 5 completion criterion

Pass 5 is complete when the project can answer this question before #83 begins:

> **If Mahjong Reference later adds Riichi, MCR, Hong Kong, American or a 16-tile variant, have we avoided making today's BMJA/Western abstractions impossible to evolve?**

This roadmap provides the checklist for that answer.