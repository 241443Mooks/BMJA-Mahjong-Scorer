# Rules platform registry inventory

Status: **pre-Codex registry contract for #227**\
Companion: `RULES_PLATFORM_ENVELOPE_V1.md`

## 1. Purpose

Define the finite typed “banks” the rules platform may select from.

The goal is to make a new profile primarily an act of selecting and configuring known capabilities, while keeping genuine new semantics explicit.

> **A registry entry is code-owned capability with a stable ID. A profile selects it as data. A custom profile may only change capabilities explicitly declared customisable.**

Do not build one `RuleOption` registry containing unrelated concepts from every Mahjong family.

---

# 2. Registry families and ID namespaces

| Registry | ID namespace | What it owns |
|---|---|---|
| tile set | `tiles.*` | physical tile inventory/multiplicity/variants |
| seat model | `seats.*` | legal player seats/winds |
| dealer model | `dealer.*` | dealer identity semantics |
| hand shape | `shape.*` | grouped/irregular/target hand grammar |
| validation | `validation.*` | profile/family legality constraints |
| canonical structural pattern | `pattern.*` | score-neutral tile/hand structure predicates |
| canonical condition | `condition.*` | score-neutral hand/context conditions |
| wait predicate | `wait.*` | score-neutral winning wait structure |
| event predicate | `event.*` | score-neutral table/win event truth |
| evidence field | `evidence.*` | physical facts that may need user confirmation |
| Classical rule binding | `classical.*` | values/selectors inside Classical grammar |
| pattern catalogue | `catalogue.pattern.*` | family/profile pattern-binding set |
| pattern interaction | `interaction.*` | combination/exclusion/series policy |
| qualification | `qualification.*` | legal minimum/threshold policy |
| cap/floor | `value-policy.*` | caps, floors, listed-limit behavior |
| conversion | `conversion.*` | score-unit to payment/value conversion |
| Riichi yaku catalogue | `catalogue.yaku.*` | profile-local yaku bindings |
| Riichi yakuman catalogue | `catalogue.yakuman.*` | yakuman bindings |
| Riichi fu | `fu.*` | fu calculation policy |
| Riichi dora | `dora.*` | dora modules/policy |
| target catalogue | `catalogue.target.*` | versioned target hand catalogue |
| substitution | `substitution.*` | Joker/substitution semantics |
| settlement | `settlement.*` | payment routing to generic transactions |
| progression | `progression.*` | next dealer/round/strategy state |
| game end | `game-end.*` | completion/finalisation policy |
| hand mode | `hand-mode.*` | finite modes such as Goulash |
| incident/procedure | `incident.*`, `procedure.*` | finite penalties/liabilities/procedure variants |
| outcome | `outcome.*` | profile-owned round-result payload schema |

Stable IDs are internal English-like machine keys. They are never translated.

---

# 3. Tile-set registry

Minimum V1 entries required by the eight-profile acceptance set:

```text
tiles.standard-136
tiles.flowers-144
tiles.riichi-136
tiles.riichi-red-fives
tiles.sanma-108
tiles.american-joker-capable
```

Each entry owns a schema such as:

```text
base tile identities
copy multiplicity
excluded ranks/tiles
bonus-tile identities
red-tile identity/count if applicable
Joker capability if applicable
dead-wall-size metadata only where an actively tracked feature needs it
```

Do not encode scoring value here. A Flower can exist physically without the tile-set registry deciding how a profile scores it.

---

# 4. Seat/dealer/table registries

Initial seat models:

```text
seats.winds-4
seats.riichi-winds-4
seats.riichi-sanma-east-south-west
```

Initial dealer semantics:

```text
dealer.classical-east
dealer.always-pass
dealer.riichi-renchan
dealer.riichi-sanma-renchan
```

Dealer progression remains a progression strategy; this registry describes the table identity/state vocabulary the strategy consumes.

---

# 5. Hand-shape registry

Initial entries:

```text
shape.four-sets-pair
shape.five-sets-pair
shape.irregular-canonical
shape.target-catalogue
```

`shape.four-sets-pair` must not imply profile-specific Chow restrictions.

`shape.five-sets-pair` exists because Taiwanese proves group count is not universal.

Irregular patterns remain separately enabled by the active profile catalogue. A profile may support both standard grouped shape and specific irregular canonical patterns.

Target-catalogue matching is a fundamentally different legal-hand grammar and therefore receives its own shape/matcher boundary.

---

# 6. Canonical structural predicate registry

## 6.1 Rule

A canonical predicate answers only:

> **Does this supplied hand/evidence satisfy this structural/event definition?**

It does not own:

- local display name;
- score/fan/tai/han;
- limit value;
- catalogue membership;
- source-specific exclusion rules;
- settlement meaning.

## 6.2 High-confidence first candidates

Existing provenance work supports these as priority reusable structural IDs, subject to exact family-source checks before each new binding becomes executable:

```text
pattern.thirteen-orphans
pattern.nine-gates
pattern.big-three-dragons
pattern.big-four-winds
pattern.four-kongs
pattern.seven-pairs
pattern.heavenly-hand
pattern.earthly-hand
```

Additional candidates remain source-gated:

```text
pattern.all-honours
pattern.all-green
pattern.all-terminals
pattern.little-four-winds
pattern.buried-treasure
pattern.purity
pattern.knitting
pattern.triple-knitting
pattern.wriggling-snake
```

The existing `SPECIAL_HANDS_PROVENANCE.md` remains the source of truth for British/Western equivalence status.

## 6.3 Cross-grammar architecture fixture: Big Three Dragons

Use one structural detector where exact equivalence is proved:

```text
pattern.big-three-dragons
```

Then profile/family bindings may independently define:

```text
BMJA:        Three Great Scholars → Classical fixed/limit treatment
T&M:         Three Great Scholars → different Classical fixed value
Hong Kong:   Big Three Dragons → fan binding
MCR:         Big Three Dragons → MCR fan binding + MCR interactions
Taiwanese:   Three Great Scholars/local name → tai binding
Zung Jung:   profile local binding → points
Riichi:      Daisangen → yakuman
```

The detector reuse must never cause score-semantic reuse.

## 6.4 Equivalence statuses

Every cross-profile predicate binding must carry one of:

```text
proved-equivalent
proved-profile-specific
needs-pattern-check
source-unresolved
```

Only `proved-equivalent` permits one detector to be reused without an additional family-specific structural adapter.

A matching English name is not evidence.

---

# 7. Condition, wait and event registries

These are separate from named special patterns because many ordinary scoring rules consume them.

## 7.1 Conditions

Initial candidates:

```text
condition.no-chows
condition.all-chows-non-value-pair
condition.concealed-hand
condition.three-concealed-pung-kong
condition.mixed-one-suit-honours
condition.all-majors
condition.scoreless-hand
condition.own-wind-set
condition.prevailing-wind-set
condition.dragon-set
condition.pure-suit-pung-kong-only
condition.pure-suit-any-standard-meld
```

The two pure-suit IDs remain deliberately distinct. Buzzard/European Classical supplied evidence that a broader “any standard meld” predicate is genuinely needed rather than forcing one definition everywhere.

## 7.2 Wait predicates

Initial architecture IDs:

```text
wait.single-tile
wait.edge-chow
wait.closed-chow
wait.pair-completion
wait.only-possible-winning-tile
```

**Do not yet collapse** Mahjong Time European Classical “one-chance Chow” into Buzzard `onlyPossibleTile`. That remains a semantic comparison task. One may be a narrow structural wait while the other is a broader winning-possibility condition.

## 7.3 Event predicates

Initial candidates:

```text
event.self-draw
event.discard-win
event.rob-kong
event.last-wall
event.replacement-tile-win
event.final-discard
event.initial-deal-win
event.first-discard-win
event.first-wall-draw-win
```

Riichi-specific event semantics may bind to these only where exact meaning matches. For example `rinshan`, `haitei`, `houtei` and `chankan` remain Riichi-owned event evaluators unless/until a shared event definition is proven safe.

---

# 8. Evidence registry

Evidence IDs describe facts the engine cannot safely infer from the submitted hand alone.

Initial inventory:

```text
evidence.winning-method
evidence.winning-tile-provenance
evidence.player-seat
evidence.seat-wind
evidence.round-wind
evidence.exposure-state

evidence.standing-hand
evidence.original-call
evidence.only-possible-tile
evidence.initial-hand-event
evidence.east-consecutive-wins
evidence.liable-player

evidence.riichi-declaration
evidence.ippatsu-eligibility
evidence.furiten-status
evidence.dora-indicators
evidence.ura-dora-indicators
evidence.kan-dora-indicators
evidence.honba
evidence.riichi-sticks
evidence.nuki-dora-count
evidence.tenpai-players
evidence.abortive-draw-reason
```

Registry metadata for each evidence field should include:

```text
ID
data schema ID
UI control kind
presentation/help key
whether derivable from hand structure
whether it can be supplied by trusted active-game context
privacy/persistence class where relevant
```

`requiredEvidence()` is derived from active resolved rules and current context. The UI must not ask for the union of every possible field.

---

# 9. Classical rule/capability registry

`CLASSICAL_PROFILE_CONFIG_V1.md` remains the detailed contract. For future Plus authoring, expose stable capability IDs rather than object paths.

Representative V1 IDs:

```text
classical.limit.default
classical.limit.table-adjustable

classical.points.chow
classical.points.pung-minor-exposed
classical.points.pung-minor-concealed
classical.points.pung-major-exposed
classical.points.pung-major-concealed
classical.points.kong-minor-exposed
classical.points.kong-minor-concealed
classical.points.kong-major-exposed
classical.points.kong-major-concealed
classical.points.pair-dragon
classical.points.pair-own-wind
classical.points.pair-prevailing-wind
classical.points.bonus-tile-each
classical.points.mahjong
classical.points.self-draw

classical.bonus.only-possible-tile
classical.bonus.standing-hand
classical.bonus.no-chows
classical.bonus.scoreless-hand
classical.bonus.last-wall
classical.bonus.loose-tile
classical.bonus.completed-pair-minor
classical.bonus.completed-pair-major
classical.bonus.concealed-hand

classical.double.own-wind-set
classical.double.prevailing-wind-set
classical.double.dragon-set
classical.double.no-chows
classical.double.mixed-one-suit-honours
classical.double.all-majors
classical.double.concealed-hand
classical.double.rob-kong
classical.double.last-wall
classical.double.loose-tile
classical.double.final-discard
classical.double.original-call
classical.double.all-chows-non-value-pair
classical.double.three-concealed-pung-kong

classical.pure-suit.predicate
classical.pure-suit.doubles
classical.bonus-tiles.policy
classical.special-hand.catalogue
classical.hand-mode.preset
```

`classical.bonus.concealed-hand` is the reusable additive primitive exposed by the external European Classical stress test. It must not be conflated with `classical.double.concealed-hand`.

A capability definition owns allowed range/options and customisability. A profile value of zero may disable a numeric rule where that family contract already uses zero as disabled.

---

# 10. Pattern-accumulator registries

Do not expose individual MCR/HK/Taiwanese/Zung Jung score rules as one universal points table.

The grammar selects:

```text
catalogue.pattern.<profile/version>
interaction.<policy>
qualification.<policy>
value-policy.<floor/cap>
conversion.<policy>
```

Minimum architecture entries:

```text
interaction.simple-additive
interaction.mcr-2006-non-combination
interaction.zung-jung-same-series-highest-only
interaction.taiwanese-profile
interaction.hk-profile

qualification.none
qualification.minimum-total
qualification.mcr-8-before-flowers

value-policy.none
value-policy.optional-table-cap
value-policy.zung-jung-320-listed-limit

conversion.identity
conversion.hk-fan-payment-table
```

Production profile IDs must be source/version specific. Generic placeholders such as `interaction.hk-profile` are architecture names until a specific authority/profile is pinned.

---

# 11. Riichi registries

Riichi has a dedicated grammar but still consumes shared structural predicates where exact equivalence is proven.

Registry categories:

```text
catalogue.yaku.<authority/version>
catalogue.yakuman.<authority/version>
fu.<authority/version>
dora.<authority/version>
riichi-decomposition.<authority/version>
riichi-limit-tier.<authority/version>
riichi-hand-value.<authority/version>
```

For the existing EMA 2025 programme, the target published profile should bind to source-versioned EMA implementations rather than generic `riichi-default` IDs.

Sanma may reuse the same decomposition/fu/yaku engine where the source profile agrees while selecting:

```text
3-player table
Sanma tile set
no-Chii validation/call policy
nuki-dora module
Sanma payment strategy
Sanma progression/game-end policy
```

That is the primary variant-family acceptance proof.

---

# 12. Target-catalogue registries

Architecture categories:

```text
catalogue.target.<authority/year-or-version>
substitution.<policy>
target-match.<policy>
target-exposure.<policy>
target-value.<policy>
```

The engine must be able to consume a catalogue supplied through an approved lawful path without changing scoring code when the annual catalogue changes.

Do not commit commercial current-card contents merely to prove the architecture.

---

# 13. Settlement registry

Initial architecture inventory:

```text
settlement.classical-pairwise
settlement.hk-profile
settlement.mcr-2006
settlement.taiwanese-winner-only
settlement.zung-jung-formal
settlement.riichi-four-player
settlement.riichi-sanma
settlement.american-profile
```

Each strategy:

```text
accepts validated profile-specific round outcome + score result + table state
emits neutral payer → payee → amount transactions
uses stable reason IDs
never mutates scoring result
```

Current `eastMultiplier` remains an implementation detail of the Classical settlement strategy, not a universal transaction property.

---

# 14. Progression and game-end registries

Initial progression IDs:

```text
progression.classical-east-cycle
progression.rotate-every-hand
progression.always-pass
progression.riichi-renchan
progression.riichi-sanma-renchan
progression.taiwanese-profile
progression.american-profile
```

Initial game-end IDs:

```text
game-end.classical-east-cycle
game-end.four-round-always-pass
game-end.zung-jung-profile
game-end.riichi-profile
game-end.riichi-sanma
game-end.taiwanese-profile
game-end.american-profile
```

IDs ending `profile` are placeholders in architecture manifests until a source-backed production strategy is selected. A playable published profile must not contain unresolved placeholders.

---

# 15. Hand-mode / incident / procedure registries

Known finite examples:

```text
hand-mode.none
hand-mode.bmja-goulash
hand-mode.outside-the-box-goulash

incident.outside-the-box.<stable-id>
incident.buzzard-dangerous-discard
incident.buzzard-false-mahjong
incident.buzzard-incorrect-hand

procedure.riichi-ema-2025-social
procedure.riichi-ema-2025-tournament
```

These exist because a finite policy has genuinely different semantics. Do not generalise them into an arbitrary formula language.

---

# 16. Capability metadata for Plus/custom profiles

Every customisable item exposes metadata conceptually equivalent to:

```ts
{
  id: 'classical.limit.default',
  grammar: 'classical-points-doubles',
  familyIds: ['family.classical-western'],
  customisable: true,
  valueSchemaId: 'schema.non-negative-integer',
  category: 'limits',
  control: 'number',
  advanced: false,
  evidenceIds: [],
  presentationKey: 'rules.classical.limit.default'
}
```

This same metadata can drive:

- override validation;
- future “How does your table play?” controls;
- profile diff/comparison;
- help text;
- evidence UI visibility;
- export/share representation.

Do not make presentation metadata part of the executable rules fingerprint unless it changes rule semantics.

---

# 17. Registry addition rule

A new registry entry is justified only when evidence shows one of:

1. a genuinely new structural predicate;
2. a genuinely new rule capability/value dimension;
3. a genuinely new finite strategy/policy;
4. a genuinely new evidence fact needed for deterministic evaluation;
5. a new versioned source catalogue.

A different numeric value, local display name or enabled/disabled choice is normally profile data, not new engine code.

When adding an entry:

```text
source evidence
→ semantic comparison against existing registry
→ stable ID
→ executable implementation if needed
→ focused unit fixture
→ capability metadata
→ profile binding
```

---

# 18. Explicit non-merges / hazards before Codex

Do **not** instruct Codex to unify these without a separate resolved evidence note:

- European Classical one-chance Chow and Buzzard only-possible-tile;
- European Classical supplement-tile scoring and existing Classical loose-tile semantics;
- green-family hands (`Imperial Jade`, `Green Jade`, `All Green`) by name alone;
- honours-family hands by name alone;
- “concealed hand + points” and “concealed hand ×2”;
- British `fishing` and Riichi tenpai;
- Classical `originalCall` and Riichi declaration;
- Flowers/Seasons and Riichi dora;
- Classical limit and Riichi limit tiers;
- physical dead-wall procedure and player-owned bonus tiles.

These distinctions are part of the architecture contract, not implementation trivia.

---

# 19. Registry acceptance test

The registry design passes #227 when:

- every field in all eight paper manifests resolves through a named registry/category or a clearly family-owned scoring config;
- no profile needs executable callbacks inside its data;
- cross-grammar capability use fails closed;
- the same proven canonical structural pattern can bind independently across multiple grammars;
- unresolved semantic equivalences remain separate IDs rather than being guessed;
- custom profile options can be enumerated from capability metadata rather than bespoke UI forms.
