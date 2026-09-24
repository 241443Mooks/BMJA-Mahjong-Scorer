# Classical rules comparator audit v1

Status: **reviewed calibration audit; no public comparator implementation yet**\
Date: 20 September 2026\
Issue: #296\
Profiles: `bmja@1.0`, `western-tm@0.1`, `outside-the-box@0.1`, `buzzard-2000@0.1`

## Purpose

Use the four executable Classical-family profiles to establish a durable comparison vocabulary before MCR introduces a different scoring grammar.

This audit answers four questions:

1. Which dimensions are useful enough to become stable comparator rows?
2. Which values can come directly from executable profile/runtime truth and which still need source-backed reference data?
3. Can the model distinguish exact sameness from provisional implementation reuse, parameter changes, binding changes, policy changes, broader/narrower rules and genuinely profile-specific behaviour?
4. Which dimensions are useful later for `Which rules am I playing?`

This is a **model/data audit**, not a request to build the public UI and not a new rules-research pass.

---

## Evidence discipline

A comparator cell must never collapse these two statements:

> The current executable profiles behave the same here.

and

> The underlying rules sources establish that these profiles are the same here.

That distinction is especially important for `western-tm@0.1`. Its Companion special-hand catalogue is source-certified, but ordinary rules that currently reuse BMJA-compatible behaviour remain provisional pending the intended ordinary-rules source in #121.

The useful cell-level evidence states are therefore:

- **source-verified** — the intended source/profile evidence establishes the rule;
- **verified-club** — the named club's own source establishes the rule;
- **source-provisional** — executable/current value exists but source equivalence is not yet established;
- **source-unknown** — current evidence does not establish the rule;
- **runtime-executable** — the current sealed profile executes the value/strategy;
- **runtime-partial** — some related behaviour is executable but the whole source rule is not represented;
- **runtime-not-modelled** — the rule may exist at the real table, but the current companion does not model it.

### Important absence rule

`absent`, `unknown`, and `not modelled` are not synonyms.

A future data contract must be able to distinguish at least:

```text
rule status:     present | absent | unknown | not-applicable
runtime support: executable | partial | reference-only/not-modelled
```

For example, the current BMJA executable profile having no automatic Goulash hand-mode strategy does **not** prove that Goulash is absent from British source material.

---

## Executable family baseline

The sealed current profiles already prove a substantial shared family core:

| Runtime dimension | BMJA | T&M Western | Outside the Box | Buzzard 2000 |
| --- | --- | --- | --- | --- |
| Family | `family.classical-western` | same | same | same |
| Grammar | `classical-points-doubles` | same | same | same |
| Players | 4 | 4 | 4 | 4 |
| Seat model | E/S/W/N | same | same | same |
| Tile preset | `tiles.flowers-144` | same | same | same |
| Ordinary hand shape | four sets + pair | same | same | same |
| Scorer | current Classical scorer | same | same | same |
| Profile binding | BMJA | T&M | OTB | Buzzard |
| Profile scoring policy | BMJA | T&M | OTB | Buzzard |
| Default table limit | 1,000 | 1,000 | 1,000 | 600 |
| Ordinary progression strategy | Classical East cycle | same | same | same |
| Game-end strategy | Classical East cycle | same | same | same |
| Hand mode | normal only | normal only | normal ↔ Goulash | normal only |
| Settlement strategy | Classical pairwise | Classical pairwise | OTB incidents over Classical core | Buzzard incidents over Classical core |
| Validation | current Classical | current Classical | current Classical | Buzzard Classical variant |

The runtime therefore supports a real family comparison rather than four unrelated implementations. It also already demonstrates that **shared family/grammar does not imply identical profile behaviour**.

---

# Reviewed comparator dimensions

The following is the recommended **v1 durable row catalogue**. It deliberately prefers dimensions a player can understand over internal implementation seams.

## A. Identity, table and tiles

| Dimension ID | Public label | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Evidence / relationship note | Diagnostic value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `profile.identity` | Rules profile | BMJA 1.0 | T&M Western 0.1 | Outside the Box 0.1 | Buzzard 2000 0.1 | Exact version must remain visible in provenance | low |
| `profile.authority-status` | Rules/source status | published project profile | provisional ordinary profile | named club profile | named historical profile; source-complete for companion scope | Do not flatten these authority types | medium |
| `table.player-count` | Players | 4 | 4 | 4 | 4 | Runtime exact; T&M source relationship remains provisional | low within Classical; high cross-family |
| `table.seat-model` | Seats | East/South/West/North | same runtime | same | same | Common executable Classical core | low within Classical |
| `tiles.physical-set` | Main tile set | 144-tile Flowers/Seasons preset | same runtime; ordinary source provisional | same ordinary runtime | same runtime | Runtime exact; public source wording must preserve T&M caveat | low within Classical; high cross-family |
| `tiles.bonus-tiles` | Flowers & Seasons | used | used in current runtime; source provisional | used | used | Basic presence shared; scoring treatment is not necessarily identical | medium |
| `tiles.substitute-special` | Jokers, blanks or substitutes | no substitute mechanism in current executable profile | no substitute mechanism in current executable profile; source unknown | 4 blanks in Goulash | no substitute mechanism in companion evidence | OTB is the clear executable differentiator. Do not call BMJA/T&M source-absent from runtime silence | high |

## B. Hand structure and play

| Dimension ID | Public label | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Evidence / relationship note | Diagnostic value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `hand.structural-size` | Normal hand size | 13 before completion / 14 winning, Kongs add physical copies | same current Classical model | same ordinary model | same Classical model | BMJA source/project verified; T&M ordinary source provisional | low within Classical |
| `hand.normal-winning-shape` | Normal winning shape | four sets + pair | same runtime; source provisional | British/Classical four sets + pair | four sets + pair | Shared structural core | low within Classical; high cross-family |
| `play.ordinary-chow-policy` | Chows in an ordinary hand | maximum 1 | current runtime maximum 1; source unverified | current ordinary runtime maximum 1; exact club-source ordinary cap not separately established | multiple Chows permitted; BMJA one-Chow validation deliberately removed | **narrower/broader** proof: Buzzard is broader than BMJA on this dimension | high |
| `play.exposure-model` | Exposed vs concealed | materially affects scoring/specials | Companion bindings explicitly use exposure; ordinary baseline provisional | materially affects ordinary/special scoring | materially affects scoring | Shared concept, profile-specific policies | medium |
| `play.rob-kong` | Robbing a Kong affects scoring | yes | current runtime compatible; source baseline provisional | yes in profile policy | yes | Same broad concept, source confidence differs | medium |
| `hand.irregular-special-model` | Special/irregular hands | curated BMJA patterns/events | very large Companion catalogue | BMJA + Western-derived + OTB-local catalogue | ten source-defined limit hands plus Classical ordinary rules | Same broad dimension, strongly different bindings/catalogues | high |

## C. Ready / declaration concepts

| Dimension ID | Public label | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Evidence / relationship note | Diagnostic value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ready.model` | Ready / waiting concepts | special-hand fishing; Original Call is separate | Companion gives winning/fishing treatments; ordinary context still provisional | winning/fishing values in club special-hand catalogue | Calling exists; Calling player may declare **Standing Hand**, which adds +100 if completed | **related analogue**, not equivalence. Standing Hand must not be mapped to BMJA Original Call | high |
| `ready.fishing-score` | Non-winning fishing score | supported for many special hands | source-certified in Companion catalogue | explicit winning/fishing pairs | not the BMJA/T&M fishing-value model; separate Calling/Standing semantics | Do not force one universal `ready` boolean | high |

## D. Scoring

| Dimension ID | Public label | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Evidence / relationship note | Diagnostic value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `scoring.grammar` | Scoring system | points + doubles | points + doubles runtime | points + doubles | points + doubles | Exact executable family sameness; important future cross-family row | low within Classical; very high cross-family |
| `scoring.ordinary-base` | Basic Pung/Kong/pair/bonus points | BMJA Classical table | current runtime compatible; ordinary source unverified | source-verified club table matches BMJA core | source table directly matches Classical core | BMJA↔OTB and BMJA↔Buzzard are strong exact/shared evidence; T&M is `same-provisional` | low-medium |
| `scoring.winner-base-bonus` | Basic Mahjong / self-draw bonuses | +20 / +2 live-wall | current runtime compatible; source provisional | +20 / +2 | +20 / +2 | Shared executable core; source status differs | low |
| `scoring.multiplier-bonus-policy` | Doubles and extra bonuses | BMJA doubles including own/round Wind, Dragons and profile rules | current profile + Companion bindings; ordinary source provisional | shared Classical doubles plus OTB-local additions/removals | shared Classical doubles plus significant ADD/AMEND/REMOVE set, including Standing +100 and several +10/+2 bonuses | Same grammar does not mean same policy | high |
| `scoring.limit-cap` | Normal limit / table limit | normally 1,000 | runtime default 1,000; source baseline unresolved and Companion includes values above 1,000 | 1,000 configured ordinary limit | table-configured; 600 source-derived default/example | Clear **parameter variation**; T&M value remains implementation not source proof | high |
| `scoring.limit-composition` | How limits combine with bonus scoring | BMJA fixed-special/bonus-tile rules | profile-specific Companion treatments | fixed special may retain independently calculated Flower/Season side score above limit (e.g. source-backed 1,008 case) | source-defined agreed limit hands; limit amount configurable | **policy variation**, not just different cap number | medium |
| `scoring.special-catalogue` | Named special-hand / pattern catalogue | narrow BMJA catalogue (18 inventoried bindings plus calculated/event rules) | 84 unique source hands / 85 bindings | 33 unique named club hands | 10 named source limit hands | Major differentiator; counts are profile-local, not universal concepts | very high |
| `scoring.special-binding` | Values/exposure for the same structural pattern | BMJA-local | T&M-local | often reuses structure but overrides value/exposure | Buzzard-local limit bindings | Canonical structure can be shared while name/value/exposure/membership differ | very high |
| `scoring.nonwinner-special-result` | Exceptional non-winner special score | no equivalent executable special-result seam | no equivalent current profile seam | no equivalent current profile seam | incomplete Four-Wind / Three-Dragon achievements can score limit against other losers | Buzzard-specific architecture/result semantics | high |
| `scoring.decomposition-policy` | How alternate hand interpretations are handled | Classical scorer chooses lawful interpretation under profile bindings | same engine/profile bindings | same engine/profile bindings | same engine with Buzzard validation/policy | Keep as durable cross-family dimension; not highly differentiating within Classical | low within Classical; high cross-family |

## E. Settlement and incidents

| Dimension ID | Public label | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Evidence / relationship note | Diagnostic value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `settlement.winner-payments` | Who pays the winner? | each loser pays winner | same runtime; source ordinary settlement unresolved | same Classical core | same Classical core unless liability overrides | Shared executable core; T&M source status remains provisional | medium |
| `settlement.loser-to-loser` | Do non-winners settle with each other? | yes, pairwise score differences | yes in current runtime; **source verification still required** | yes, verified-club | yes, source-backed | Excellent example of `same-provisional` for T&M | high |
| `settlement.dealer-multiplier` | East/dealer payment multiplier | East pays/receives double | same runtime; source provisional | same, verified-club | same, source-backed | Shared core; cross-family discriminator later | medium |
| `settlement.liability` | Liability / one player pays for others | current profile has no dedicated incident strategy; do not infer source absence | current profile has no dedicated incident strategy; source unknown | Cannon with `No choice!` exception and other club incidents | dangerous-discard full-payment liability for source-defined dangerous hands | OTB and Buzzard are **related analogues with materially different policy**, not one universal cannon rule | very high |
| `settlement.false-mahjong` | False Mahjong consequence | not modelled as a dedicated current-profile incident here; source procedure exists | not modelled; source unknown | club-specific consequence depends on exposure | Buzzard: fully exposed invalid Mahjong pays double limit to each other player; withdrawal possible if not fully exposed | Same label can hide materially different semantics | high |
| `settlement.incorrect-hand` | Wrong tile-count consequence | current profile does not use a dedicated profile incident strategy | source/runtime profile-specific treatment unresolved | OTB-specific too-few/too-many consequences | Buzzard-specific too-few/too-many settlement consequences | Shared incident concept, profile-specific policy | high |

## F. Draws, dealer and progression

| Dimension ID | Public label | BMJA | T&M Western | Outside the Box | Buzzard 2000 | Evidence / relationship note | Diagnostic value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `round.draw-settlement` | What happens financially on a draw? | no transfers in current product interpretation | same current runtime; source provisional | no score/settlement | dead hand: no scoring | Shared current result, evidence strength differs | medium |
| `round.draw-follow-up` | What happens after a draw? | East retained; current executable hand mode remains normal | same runtime; source provisional | East retained **and next hand is Goulash** | East retained; normal mode | OTB's automatic Goulash transition is a strong unique discriminator | very high |
| `progression.dealer-retention` | When does East stay East? | after East win or draw | same runtime; source provisional | same current progression | source-backed same | Shared Classical progression | medium |
| `progression.seat-rotation` | When do seats rotate? | non-East win | same runtime; source provisional | same current progression | source-backed same | Shared Classical progression | low-medium |
| `progression.prevailing-wind` | Prevailing Wind progression | East → South → West → North over cycles | same runtime; source provisional | same current progression | same, source-backed | Shared current strategy | medium |
| `progression.game-end` | Full-game end | after North prevailing-Wind cycle in current product | same current runtime; source ordinary rules provisional | current profile uses same product strategy | source describes complete game as four rounds | Same executable strategy; source confidence differs | medium |

---

# Relationship vocabulary proved by the four profiles

The proposed #296 relationship vocabulary is not theoretical; the current family supplies real examples for every important class except a source-proven hard `absent` case, which should remain deliberately rare.

| Relationship | Classical proof case |
| --- | --- |
| `exact-same` | BMJA ↔ OTB ordinary intrinsic Pung/Kong values; BMJA ↔ Buzzard ordinary base score table; BMJA ↔ Buzzard ordinary settlement shape |
| `same-provisional` | BMJA ↔ T&M current ordinary settlement/progression/validation behaviour pending #121 source verification |
| `parameter-variation` | configured/default table limit 1,000 vs Buzzard 600 |
| `binding-variation` | same canonical hand structure with different T&M/OTB/BMJA value/exposure bindings; e.g. Three Great Scholars / Four Blessings families |
| `policy-variation` | OTB vs Buzzard liability, false-Mahjong and incorrect-hand consequences |
| `narrower` / `broader` | BMJA maximum-one-Chow ordinary validation vs Buzzard's broader ordinary Chow allowance |
| `related-analogue` | OTB cannon and Buzzard dangerous-discard liability; BMJA/T&M/OTB fishing concepts versus Buzzard Calling/Standing concepts |
| `unique` | OTB executable draw→Goulash hand mode; Buzzard Standing Hand bonus and exceptional non-winner limit result |
| `absent` | Require direct source evidence before using this label; runtime omission alone is insufficient |
| `unknown` | T&M ordinary settlement/source rules pending #121; exact OTB ordinary Chow-source cap where not directly established |

This is enough evidence to retain the relationship vocabulary.

---

# Strongest player-visible differentiators

These are the most promising inputs for a later diagnostic because a normal player could plausibly observe or recognise them at a table.

1. **What happens after a drawn hand?** OTB's executable draw→Goulash transition is highly distinctive.
2. **Are ordinary hands restricted to one Chow?** Buzzard deliberately removes the BMJA one-Chow restriction.
3. **Do you use Calling / Standing Hand and a +100 Standing bonus?** Strong Buzzard signal.
4. **Which special-hand catalogue looks familiar?** T&M's large Companion catalogue, OTB's 33-hand club selection, BMJA's narrower catalogue and Buzzard's ten limit hands differ substantially.
5. **What table limit do you normally agree?** 600 is a Buzzard source example/default while the current British/OTB profiles use 1,000, but this must be treated as a configurable clue rather than proof.
6. **Do you use Cannon / dangerous-discard liability, and what exactly happens?** Similar vocabulary can separate OTB and Buzzard only if the consequence is asked, not merely whether “cannon” exists.
7. **Do non-winners settle score differences with each other?** Useful across future families; within current Classical it is mostly shared, with T&M source status still provisional.

Diagnostic questions should prefer observable consequences over asking users to name their ruleset or know specialist terminology.

---

# Encyclopaedia link map

The audit supports the #251 join without requiring one page per row.

| Dimension family | Likely canonical concept / section |
| --- | --- |
| player count / seats / East | Players, seats and Winds |
| physical tiles / Flowers / blanks | Mahjong tile sets; Flowers and Seasons; substitute tiles |
| hand size / normal shape / irregular shapes | Mahjong hand structure |
| Chows / claims / exposure | Chows and claiming; exposed and concealed sets |
| ready / fishing / Calling / Standing | Ready hands, Fishing, Calling, Tenpai and declarations |
| grammar / ordinary points / doubles | Mahjong scoring systems; Classical points and doubles |
| limits | Limits, caps and maximum scores |
| special catalogue / bindings | Named hands and profile treatments |
| settlement | Mahjong settlement / who pays whom |
| liability / penalties | Liability and penalties |
| draws / Goulash | Drawn hands / wash-outs / Goulash |
| East retention / Winds / game end | Dealer/East and round progression |

A row may link to the broad concept and an individual cell may deep-link to that profile's treatment/anchor.

---

# Data-contract consequences before UI work

The audit exposes several requirements that should be settled before implementing the public comparison table.

## 1. Values need provenance and support state, not just display text

A profile cell should conceptually carry:

```text
dimensionId
profileRef
structuredRuleValue
humanDisplay
ruleStatus
runtimeSupport
source/provenance reference
qualification/caveat
conceptRef + optional anchor
diagnostic metadata
```

Do not use shared strings as semantic identity.

## 2. Relationship is not always derivable from equal values

`1000 === 1000` can prove a numeric match, but not source equivalence. Reviewed relationship/provenance may therefore need to accompany derived comparison output where semantics matter.

## 3. Some dimensions are scalar; others are structured

Examples:

- player count: scalar;
- table limit: numeric/configurable value;
- tile set: composition object;
- ready model: typed concept set / policy;
- liability: incident + trigger + consequence policy;
- catalogue: profile binding collection.

Do not reduce every dimension to `string | number` merely because the first UI can render text.

## 4. Difference-only mode must keep uncertainty visible

Two cells with the same current runtime value are **not** safely collapsible if one is source-verified and the other source-provisional. `Differences only` must therefore be able to retain a row because evidence status differs even when display values match.

## 5. Runtime truth and reference truth should join, not duplicate

Where a sealed profile already owns a value such as player count, grammar, table-limit default or strategy identity, comparator data should reference/derive from that truth. Source-only/procedural dimensions may live in a reviewed reference layer. The comparator must not copy scoring arithmetic into presentation data.

---

# MCR falsification gate

Do **not** build a large public content engine from this Classical-only model yet.

After MCR A/B establishes executable `pattern-accumulator` scoring and table semantics, attempt to add MCR as another column using the same model.

The model passes if MCR can express, without comparator-specific hacks:

- four-player/table/tile facts;
- ordinary winning structure;
- `pattern-accumulator` scoring grammar;
- eight-point minimum qualification;
- interaction/non-combination policy;
- Flowers after qualification;
- different settlement shape;
- no Classical loser-to-loser/East-multiplier assumptions where not applicable;
- MCR dealer/progression/game-end semantics;
- source/version/provenance status.

MCR may legitimately add a small number of new durable dimensions such as qualification order or pattern-interaction policy. That is extension of the catalogue, not failure. The failure condition is needing MCR-only ad-hoc fields because the profile/dimension/concept model cannot represent another grammar cleanly.

---

# Audit conclusion

The Classical family is sufficiently diverse to define the comparator foundation now.

The durable model is:

```text
verified runtime/source truth
        ↓
stable comparison dimension
        ↓
profile-specific value + evidence/support state
        ↓
reviewed relationship / differences view
        ↓
Encyclopaedia concept + profile treatment
        ↓
high-discrimination dimensions feed the diagnostic
```

The four-profile audit supports moving on to MCR rather than adding another Classical profile first. The next useful comparison work is **not** a large UI build: it is to keep this audit as the v1 model, let MCR falsify it, then implement the mature reusable data/UI layer against at least two scoring grammars.
