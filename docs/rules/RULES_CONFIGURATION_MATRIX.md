# Rules configuration matrix — Classical/Western profiles + MCR boundary

Status: **pre-implementation design / evidence matrix**  
Related: #219 (Buzzard configuration-layer proof), #176 (MCR)

## Purpose

This matrix tests a product hypothesis:

> For **Classical/Western-adjacent Mahjong**, most named rulesets and club/family house rules can be represented as a known baseline plus selectors, numeric values, catalogue choices and a small number of reusable rule capabilities.

Buzzard 2000 is the first implementation test of that model.

MCR is included deliberately as a **negative control**. It shares tile/group/pattern primitives with Classical Mahjong, but its scoring grammar is materially different. If the matrix tries to force MCR through Classical points + doubles, the abstraction is wrong.

## Profiles compared

| Profile | Working identity | Evidence status |
|---|---|---|
| British / BMJA | `bmja@1.0` | current verified product baseline |
| Thompson & Maloney Western | `western-tm@0.1` | provisional ordinary base; substantial verified catalogue |
| Outside the Box | `outside-the-box@0.1` | verified named club profile where guide is clear |
| Buzzard 2000 Classical | `buzzard-2000-classical@0.x` | primary 2000 source snapshot recovered and indexed |
| MCR / Green Book | future `mcr-wmo-2006@...` | WMO 2006 English Green Book pinned; separate engine family |

MCR source used for this matrix: World Mahjong Organization, *Mahjong Competition Rules*, English edition, first edition/printing July 2006 (the Green Book). The book states that the Chinese edition controls disputes arising from translation.

## Legend

- **VALUE** — numeric selector/value.
- **TOGGLE** — common on/off rule.
- **ENUM** — bounded choice between known semantics.
- **CATALOGUE** — choose pattern membership/binding/value/exposure.
- **PRESET** — reusable strategy/policy selected as one unit.
- **CAPABILITY** — requires executable engine support once, then future profiles can select/configure it.
- **N/A** — not part of that scoring grammar.
- **SEPARATE ENGINE** — do not express this as a Classical house-rule switch.

---

# 1. Family / scoring grammar

| Dimension | BMJA | T&M Western | OTB | Buzzard | MCR | Config conclusion |
|---|---|---|---|---|---|---|
| Engine family | Classical | Classical | Classical | Classical | MCR additive fan | top-level **ENUM** / discriminated engine family |
| Ordinary score grammar | intrinsic points × 2^doubles, plus specials | same working family | same family | intrinsic/additive points then doubles, capped | additive fan points | Classical **PRESET**; MCR **SEPARATE ENGINE** |
| Non-winning hands have score | yes | provisional-compatible | yes | yes | no ordinary loser-hand score | family strategy, not one universal boolean |
| Fixed special/catalogue values | yes | yes, broader catalogue | yes | source-defined limit catalogue | fan values rather than Classical fixed specials | Classical **CATALOGUE**; MCR own fan catalogue |
| Minimum points required to win | no equivalent 8-point gate | no verified equivalent | no | no | **8 fan points excluding Flowers for legal Hu** | MCR engine **VALUE**, not Classical toggle by default |
| Ordinary cap/limit | 1000 | current 1000 ordinary cap; published specials may exceed | 1000 ordinary | table-agreed; 600 source example/default | no Classical cap model | Classical **VALUE/TOGGLE** |

**Conclusion:** one common profile registry can host all five profiles, but only BMJA/T&M/OTB/Buzzard belong to `ClassicalProfileConfig`.

---

# 2. Tile set and winning structures

| Dimension | BMJA | T&M Western | OTB | Buzzard | MCR | Config/capability |
|---|---|---|---|---|---|---|
| Players | 4 | 4 expected/provisional | 4 | 4 | 4 | shared constant/capability |
| Suits/Winds/Dragons | standard Classical set | same family | same | same | same core 136 tiles | shared tile primitives |
| Flowers/Seasons | 8 bonus tiles | Western source family | 8 | optional/source play | 8 Flowers in 144-tile set | shared tile identities; scoring is family-specific |
| Ordinary winning shape | four sets + pair, BMJA restrictions | Classical + wider specials | Classical + specials | four sets + pair + two irregular structures | four sets + pair | shared canonical structure detector |
| Seven Pairs | profile special catalogue | extensive Western catalogue | selected special | not core Buzzard limit list | explicit permissible structure + 24 fan | shared canonical predicate; profile binding differs |
| Thirteen Orphans/Wonders | BMJA special | Western special | selected | Thirteen Odd Majors limit | explicit permissible structure + 88 fan | shared canonical predicate after structural equivalence audit |
| Knitted/single-tile structures | BMJA/T&M specials exist | broad catalogue | selected specials | not a major Buzzard core feature | explicit Greater/Lesser Honors + Knitted structures | reusable predicates where exact identity exists |
| Chow cap/restriction | BMJA ordinary one-Chow cap | primary baseline still to verify | club-specific evidence | no need for scorer to police claims; scoring can inspect final hand | no Classical one-Chow cap in MCR scoring | user-facing Classical **ENUM/TOGGLE** only when score legality requires it |

The Table Companion should validate only what is necessary to score the entered physical-table result. It should not become a draw/discard simulator merely because a source rulebook describes physical procedure.

---

# 3. Classical intrinsic-point vocabulary

MCR intentionally shows `N/A` here: MCR does not score exposed/concealed Pungs/Kongs using the British/Classical intrinsic points table.

| Rule/capability | BMJA | T&M | OTB | Buzzard | MCR | Selector type |
|---|---:|---:|---:|---:|---|---|
| exposed simple/minor Pung | 2 | provisional-compatible | 2 | 2 | N/A | **VALUE** |
| concealed simple/minor Pung | 4 | provisional-compatible | 4 | 4 | N/A | **VALUE** |
| exposed major/honour Pung | 4 | provisional-compatible | 4 | 4 | N/A | **VALUE** |
| concealed major/honour Pung | 8 | provisional-compatible | 8 | 8 | N/A | **VALUE** |
| exposed simple/minor Kong | 8 | provisional-compatible | 8 | 8 | N/A | **VALUE** |
| concealed simple/minor Kong | 16 | provisional-compatible | 16 | 16 | N/A | **VALUE** |
| exposed major/honour Kong | 16 | provisional-compatible | 16 | 16 | N/A | **VALUE** |
| concealed major/honour Kong | 32 | provisional-compatible | 32 | 32 | N/A | **VALUE** |
| Dragon pair | 2 | provisional-compatible | 2 | 2 | N/A | **VALUE** |
| own/round Wind pair | 2 qualifying | provisional-compatible | 2 | 2 | N/A | **VALUE/TOGGLE** |
| Flower/Season basic points | 4 each | provisional | 4 | 4 | MCR Flower = 1 fan point on Hu | family-specific **VALUE** |
| going Mahjong | +20 | provisional | +20 | +20 | no Classical +20; fan grammar | Classical **VALUE** |
| self-draw additive points | +2 live-wall draw | provisional | +2 ordinary table rule | +2 | Self-Drawn = 1 fan | family-specific rule |

**Strong result:** the first four profiles already demonstrate a reusable Classical base-point table. A custom Western/club profile should not need code to change one of these values.

---

# 4. Classical doubles / multiplier vocabulary

| Rule/capability | BMJA | T&M | OTB | Buzzard | MCR | Selector type |
|---|---|---|---|---|---|---|
| own Wind Pung/Kong | +1 double | provisional | +1 | +1 | Seat Wind = 2 fan | Classical **doubles VALUE/0=off** |
| prevailing Wind Pung/Kong | +1 | provisional | +1 | +1 | Prevalent Wind = 2 fan | same capability, family binding differs |
| Dragon Pung/Kong | +1 each | provisional | +1 each | +1 each | Dragon Pung = 2 fan | same structural predicate, different scoring grammar |
| own Flower | +1 | provisional | +1 | +1 | Flower = 1 fan each | family-specific |
| own Season | +1 | provisional | +1 | +1 | Flower category includes seasonal/plant bonus tiles | family-specific |
| full four Flowers | BMJA bouquet convention | provisional | club convention | **+3 doubles (×8), cumulative with own tile** | each Flower individually 1 fan | **VALUE + stacking ENUM** |
| full four Seasons | BMJA bouquet convention | provisional | club convention | **+3 doubles (×8), cumulative with own tile** | each Flower individually 1 fan | **VALUE + stacking ENUM** |
| no Chows / All Pungs-family | +1 double under BMJA standard logic | provisional | club logic | +1 double plus +10 bonus | All Pungs = 6 fan | capability + family binding |
| mixed one suit + honours | +1 | provisional | yes | +1 | Half Flush = 6 fan | shared predicate, family value binding |
| all majors / terminals+honours | +1 BMJA ordinary rule | provisional | yes | +1 | MCR has All Terminals and Honors = 32 fan | shared predicate where exact structure matches |
| pure one suit | BMJA Purity = 3 doubles with narrower predicate | T&M has calculated Purity binding | OTB uses BMJA calculated form | **3 doubles, broader one-suit predicate allows Chows** | Full Flush = 24 fan | **predicate ENUM + doubles VALUE** for Classical |
| generic concealed hand | BMJA +1 ordinary double | profile-dependent | OTB only under club conditions | **off** as ordinary double | Concealed Hand 2 / Fully Concealed 4 fan | **TOGGLE/VALUE**, family-specific semantics |
| final discard | BMJA exceptional method double | profile-dependent | yes | **off** | Last Tile Claim = 8 fan | **TOGGLE/VALUE** Classical; separate MCR event fan |
| last wall tile | +1 double | profile-dependent | yes | +1 double +10 points | Last Tile Draw = 8 fan, cannot combine Self-Drawn | event capability + family binding/exclusion |
| robbing Kong | +1 double | profile-dependent | yes | +1 | Robbing Kong = 8 fan; excludes Last Tile | event capability + family binding/exclusion |
| loose/replacement tile | +1 double | profile-dependent | club-specific | +1 +10 | Out with Replacement Tile = 8 fan with source-specific exclusions | event capability + family binding |
| Original Call | BMJA rule | unknown/provisional | profile-specific | **off; Standing Hand is different** | N/A | **TOGGLE**, not universal meaning |

This table is the core evidence for a selector-based Classical/Western layer.

---

# 5. Additive bonuses / evidence-driven rules

| Rule | BMJA | T&M | OTB | Buzzard | MCR | Proposed control |
|---|---|---|---|---|---|---|
| Standing Hand | no Buzzard-equivalent | unknown | no current binding | +100 | N/A | Classical **points VALUE**, 0/off |
| only possible winning tile | profile semantics vary | likely Western concept, verify | unimplemented evidence gap | +2 | MCR Edge/Closed/Single Wait each 1 fan with exact conditions | shared wait-evidence capability; family-specific rule |
| no Chows additive bonus | no separate +10 | verify | no same binding | +10 | All Pungs/All Chows are fan patterns, not bonus | Classical **points VALUE** |
| scoreless-hand bonus | no equivalent current ordinary bonus | verify | no equivalent | +10 | Chicken Hand = 8 fan | Classical **points VALUE**; MCR separate fan |
| last-wall additive bonus | no +10 | verify | club-specific | +10 | 8 fan event | Classical **points VALUE** |
| loose-tile additive bonus | no +10 | verify | club-specific | +10 | replacement event 8 fan | Classical **points VALUE** |
| winning pair completion bonus | none in current BMJA runtime | verify | OTB +2 minor / +4 major | not source-listed as Buzzard delta | Single Wait in MCR is 1 fan if exact wait condition | reusable evidence capability; profile binding |

The future house-rule UI should expose the rule, not the implementation detail. For example: **“Winning on the only tile that completes your hand: +2 points”** rather than an internal event field name.

---

# 6. Pattern catalogue / special hands

| Dimension | BMJA | T&M | OTB | Buzzard | MCR | Config conclusion |
|---|---|---|---|---|---|---|
| Catalogue size/model | finite BMJA list | broad published Western catalogue | 33 named club bindings | ten limit conditions + ordinary rule catalogue | **81 fan** | all profiles use stable pattern IDs + profile-local bindings; MCR uses fan engine |
| Pattern owns score? | no — profile binding should | no | no | no | no | universal architecture rule |
| Same predicate, different value | frequent | frequent | frequent | yes | frequent vs Classical values | shared canonical predicate + family binding |
| Exposure/concealment metadata | profile-specific | profile-specific | profile-specific | rule-specific | fan definition/combination rules | binding metadata |
| Fishing values | yes | yes | yes | not same catalogue model | no Classical fishing payout | Classical-only binding dimension |
| Fan combination/exclusion graph | N/A in MCR sense | N/A | N/A | N/A | **essential** | MCR-specific engine data |

### Shared-pattern examples

Patterns already worth treating as rules-neutral detectors where exact structure is verified:

- Big/Four Winds families;
- Big/Three Dragons families;
- Thirteen Orphans / Thirteen Odd Majors / 13 Unique Wonders family;
- Nine Gates / Calling Nine Tile family (exact structural equivalence must be pinned per binding);
- Four Kongs;
- All Honors;
- All Terminals;
- Seven Pairs;
- Full/Pure one-suit families;
- concealed Pung/Kong families;
- last-tile / replacement / rob-Kong event facts.

MCR proves why **detector ≠ score**. Its Green Book assigns values from 1 through 88 fan and includes explicit non-combination rules, while Classical profiles may treat the same structural idea as doubles, a fixed special, a limit, or not score it at all.

---

# 7. MCR scoring grammar — intentionally outside ClassicalProfileConfig

The WMO 2006 Green Book defines:

- **81 fan** in nine categories;
- twelve point grades: **88, 64, 48, 32, 24, 16, 12, 8, 6, 4, 2, 1**;
- a legal winning hand must have **at least 8 fan points** under the scoring rules;
- Flowers score 1 each on Hu but the False-Hu rule makes clear Flower points do not rescue a below-8 hand;
- additive fan scoring subject to five counting principles: Non-Repeat, Non-Separation, Non-Identical, High-vs-Low, and Account-Once;
- many individual fan definitions add explicit `does not combine with` restrictions.

Therefore an MCR configuration eventually looks conceptually like:

```text
engineFamily = mcr
fanCatalogue = wmo-2006
minimumWinningFan = 8
flowerFanEach = 1
combinationPolicy = wmo-2006
settlementPolicy = mcr-wmo-2006
progressionPolicy = mcr-wmo-2006
```

It is **not**:

```text
base = western-classical
noChowsDouble = ...
pureSuitDoubles = ...
```

MCR is useful in this matrix precisely because it tells us where the repeatable Western selector model should stop.

---

# 8. Settlement

| Dimension | BMJA | T&M | OTB | Buzzard | MCR | Config strategy |
|---|---|---|---|---|---|---|
| Winner paid by all non-winners | yes | provisional/shared working model | yes | yes | yes, but formula differs | family **PRESET** |
| Losers settle pairwise differences | yes | provisional | yes | yes | **no** | Classical settlement preset option |
| East/dealer payment multiplier | ×2 whenever East involved | provisional | ×2 | ×2 | none in Green Book hand settlement | Classical **VALUE**, MCR N/A |
| Self-draw | Classical winner score paid by each | provisional | Classical | Classical | each opponent pays `8 + Basic Points` | MCR own preset |
| Discard win | Classical winner score paid by each | provisional | Classical | Classical | discarder pays `8 + Basic Points`; other two pay 8 | MCR own preset |
| Liability/cannon override | source-specific | source TBD | OTB cannon | dangerous-discard liability | competition penalties separate; no Classical cannon model in base MCR settlement | incident capability + profile policy |
| Draw | no settlement | provisional | no settlement; may trigger Goulash | no settlement/dead hand | no winner settlement | shared transaction result can represent zero transfers |

The existing generic payer→payee transaction ledger remains reusable across both families. The formula producing the transactions is profile/family-specific.

---

# 9. Dealer / round progression

| Dimension | BMJA | T&M | OTB | Buzzard | MCR | Config strategy |
|---|---|---|---|---|---|---|
| Dealer retains after dealer win | yes | provisional | Classical club progression | yes | **no; dealer passes after each completed hand regardless of whether dealer wins** | progression **PRESET** |
| Dealer retains after draw | yes under current Classical flow | verify | draw retains East in implemented club flow | yes/dead hand | Green Book dealer rotation is not win-dependent | progression preset |
| Prevailing wind advances | after all players have held/lost East | verify | Classical wind cycle | same Classical cycle | rounds are East/South/West/North; a round is everybody dealer once | progression preset |
| Complete game | four wind rounds | verify | profile/game setting | four rounds | four rounds/session (or tournament time limit) | common completion concept + profile policy |

This is another good candidate for a selector at the **preset** level rather than exposing five interdependent booleans to normal users.

---

# 10. Goulash / drawn-hand variants

| Dimension | BMJA | T&M | OTB | Buzzard | MCR |
|---|---|---|---|---|---|
| Goulash after draw | yes under BMJA rules | source pending | yes, explicit club state machine | no identified Buzzard Goulash | no |
| Special tiles/blanks | BMJA mechanism | pending | four OTB blanks in Goulash | no | no |
| No-Chows Goulash rule | BMJA-specific | pending | yes | N/A | N/A |

Goulash should remain a small **component/preset with parameters**, not a single naked boolean and not a universal Mahjong feature.

---

# 11. Penalties / incidents

For the current product boundary, the app should capture **resolved table facts** when those facts change scoring/settlement. It should not referee every physical procedure.

| Incident family | BMJA | T&M | OTB | Buzzard | MCR |
|---|---|---|---|---|---|
| false Mahjong | source rules exist | verify | manual incident | double-limit consequence | below-8 and erroneous Hu have formal competition penalties |
| wrong tile count | source rules exist | verify | manual incident | different too-many/too-few settlement treatment | player cannot Hu; formal competition rule |
| dangerous discard / liability | not current base | verify | cannon | explicit dangerous-discard liability | not a Classical cannon rule |
| competition fouls | not product focus | N/A | N/A | N/A | extensive umpire/tournament penalties |

A future house-rule builder should expose only incidents the Table Companion actually settles. Competition-refereeing rules should not become hundreds of irrelevant switches.

---

# 12. Candidate house-rule controls

These are strong candidates for a future **“How does your table play?”** builder because at least two real Classical/Western profiles demonstrate the dimension or it is a common bounded value:

| User-facing concept | Control |
|---|---|
| Starting rules | preset selector: BMJA / Western / named club / published profile |
| Table limit | number / common presets |
| Flowers and Seasons used | toggle |
| points per Flower/Season | number |
| own Flower/Season doubles | toggle / doubles value |
| complete Flower/Season set | off / doubles value / stacking rule |
| own Wind set | off / doubles value |
| prevailing Wind set | off / doubles value |
| Dragon set | off / doubles value |
| concealed hand bonus | off / doubles value / bounded semantics |
| no-Chows / all-Pungs treatment | off / points + doubles values |
| pure one-suit rule | off / predicate choice / doubles value / special binding |
| last wall tile | off / points / doubles |
| final discard | off / points / doubles |
| robbing Kong | off / points / doubles |
| replacement/Loose Tile win | off / points / doubles |
| only possible winning tile | off / points |
| Standing/ready declaration bonus | off / points, where supported |
| special-hand catalogue | include/exclude + profile binding/value/exposure where editable |
| Goulash after draw | off / named Goulash preset |
| East settlement multiplier | numeric bounded value |
| loser-to-loser settlement | toggle/preset |
| liability/cannon | off / supported incident preset |
| dealer progression | named progression preset |

Not every internal config field should appear in the UI. Published presets can lock provenance-critical semantics; custom Plus variants may override only supported house-rule controls.

---

# 13. Proposed architecture boundary

A shared profile envelope can be simple:

```text
RulesProfile
├─ identity + version + provenance
├─ engineFamily
├─ common tile/pattern/event primitives
├─ familyConfig
├─ settlementPolicy
└─ progressionPolicy
```

Family config is discriminated:

```text
engineFamily = classical
  -> ClassicalProfileConfigV1

engineFamily = mcr
  -> McrProfileConfigV1 (later)

engineFamily = riichi
  -> RiichiProfileConfig (later)
```

This gives us repeatable Western/club onboarding **without pretending every Mahjong discipline is just a different set of checkboxes on BMJA**.

---

# 14. What Buzzard #219 should prove

Before #219 is considered successful, its implementation report should answer:

1. Can Buzzard be represented primarily as selectors/values/catalogue bindings over a shared Classical engine?
2. Which existing BMJA/OTB handwritten callbacks become ordinary reusable rule capabilities?
3. Can the same `ClassicalProfileConfigV1` faithfully express BMJA, T&M and OTB without behaviour loss?
4. Which config dimensions are safe for a user-facing Plus house-rule builder?
5. Which rare mechanics remain engineering capabilities rather than configuration?
6. Does the resulting abstraction keep MCR obviously outside the Classical grammar while still sharing canonical tile/pattern/event primitives?

If the answer to 1–3 is yes, onboarding the next Western-adjacent club should become **evidence + form filling + golden fixtures**, with engineering needed only when the club introduces a genuinely new rule concept.
