# Mahjong Competition Rules (MCR) — implementation / compatibility crosswalk

Status: **source-pinned correctness corpus ready for bounded scorer implementation**  
Issue: #176

## Pinned implementation authority

Initial target:

> **World Mahjong Organization, _Mahjong Competition Rules_, first edition / first printing July 2006 (“Green Book”), English edition distributed/referenced by the European Mahjong Association.**

Source register ID: `mcr-ema`  
EMA rules page: https://mahjong-europe.org/portal/index.php?Itemid=167&id=31&option=com_content&view=article  
English rulebook: https://mahjong-europe.org/portal/images/docs/mcr_EN.pdf

If a later formal WMO/EMA edition is deliberately adopted, it becomes a new rules-profile version rather than silently changing old games.

Working profile identity:

```text
mcr-wmo-2006@0.x
```

Promotion to `1.0` belongs to the implementation/certification gate, not to this research pass.

## Product boundary

Mahjong Reference **scores the physical game; it does not play MCR for the players or referee the table**.

The Table Companion needs to:

1. record the resolved winning hand and the small amount of score-relevant context that cannot be derived from the tiles;
2. calculate lawful MCR fan / Basic Points;
3. emit the correct settlement transactions;
4. record the hand and advance dealer / prevailing wind / game completion.

It does **not** need to simulate or enforce:

- wall construction or wall position;
- draw/discard turn order;
- claim timing/priority;
- Kong declaration procedure;
- spoken calls;
- live foul detection;
- tournament umpire procedure.

If the physical table resolves an event that affects scoring — for example a win by robbing a Kong — the scorer records that **resolved event**, not the entire procedure that produced it.

Canonical evidence contract: `MCR_SCORE_EVIDENCE_CONTRACT.md`.

## Executive compatibility decision

MCR is not a Classical-profile configuration.

Its scoring grammar is:

```text
shared tile / group / event evidence
                ↓
          81 MCR fan detectors
                ↓
     MCR interaction/counting policy
                ↓
       non-Flower qualifying subtotal
                ↓
         require subtotal >= 8
                ↓
          add Flower points
                ↓
             Basic Points
                ↓
          MCR settlement
```

Rules-platform classification:

```text
grammar: pattern-accumulator
catalogue: catalogue.pattern.mcr-wmo-2006
interaction: interaction.mcr-2006-non-combination
qualification: qualification.mcr-8-before-flowers
settlement: settlement.mcr-2006
progression: progression.always-pass
game-end: game-end.four-round-always-pass
```

Do not route MCR through `base points → doubles → limit`.

## Correctness corpus

Three documents now form the pre-code MCR contract:

### `MCR_FAN_CATALOGUE_2006.md`

- all 81 fan in formal order;
- stable project binding IDs;
- formal values;
- independent detector synopsis;
- minimum evidence category;
- formal source locators;
- source-owned interaction notes;
- the five §3.9.1 counting principles.

### `MCR_SCORE_EVIDENCE_CONTRACT.md`

Defines the minimal scorer input and explicitly separates:

- facts derivable from final hand structure;
- trusted game context the Table Companion already knows;
- the small set of physical-table facts that may require confirmation;
- live procedure that is outside scorer scope.

### `MCR_GOLDEN_FIXTURES_2006.md`

Defines regression oracles for:

- catalogue interaction / non-repeat behaviour;
- 8-point qualification;
- Flowers after qualification;
- Chicken Hand;
- special win events;
- Last Tile and wait evidence;
- discard/self-draw settlement;
- always-pass dealer progression;
- four-round game completion;
- fail-closed unknown evidence.

The future implementation should convert these into executable fixtures rather than rediscovering MCR semantics from fan names.

## Formal source facts that drive implementation

The pinned Green Book establishes:

- a 144-tile set including eight Flowers;
- ordinary four-sets-plus-pair wins plus permitted irregular structures;
- 81 named fan;
- additive MCR fan points;
- a minimum **8 non-Flower points** for a valid Hu;
- one point per Flower, added after qualification;
- five formal counting/combination principles;
- discard/self-draw settlement with a fixed 8-point component;
- dealer passes after each completed hand, regardless of winner;
- four dealer positions complete a round;
- East/South/West/North rounds complete a game.

Penalties and tournament procedure are separate from ordinary deterministic hand value.

## Minimal external scoring evidence

Most fan need no player questionnaire beyond the hand itself.

The scorer can derive from entered tiles/groups:

- Chow/Pung/Kong/pair structure;
- exposure/concealment;
- suit/honor composition;
- special/irregular structures;
- shifted/double/triple relationships;
- candidate decompositions;
- waits from the pre-win state when the winning tile is known.

The genuinely external evidence is small:

- seat wind and prevailing wind when not already held by the tracked game;
- discard vs self-draw;
- winning tile;
- finite special win event where applicable (`last-wall-draw`, `last-discard`, `kong-replacement`, `flower-replacement`, `rob-kong`);
- whether the winning tile was the last visible copy of that tile kind for fan 58;
- Flower count.

Do not ask the player to select fan manually as scoring authority.

## Scoring-result boundary

Do not stretch the existing Classical `ScoreBreakdown` into MCR fields.

The pattern-accumulator result must explain at least:

```text
candidate fan
counted fan + values
suppressed fan + reason
qualifying non-Flower subtotal
post-qualification Flower points
Basic Points
legal / illegal Hu
source/profile identity
```

This makes the score auditable at the table.

## Pattern reuse rule

Canonical predicates may be reused only where the structural truth is genuinely the same.

MCR still owns, for every binding:

- its MCR fan ID/name;
- value;
- exact definition;
- exposure/event/context requirements;
- interaction behaviour;
- source locator.

A similarly named BMJA, Western or Riichi pattern is not evidence of identical MCR semantics.

## Fan interaction policy

Do not model MCR as 81 independent checkboxes.

The evaluator must support:

- source-owned explicit implications/exclusions;
- the five §3.9.1 counting principles;
- alternate lawful decomposition where a final tile set permits it;
- deterministic selection of the highest lawful scoring interpretation.

A later formal trilingual MCR source was used to cross-check the unusual named interaction wording around fan 14/15. Because the same wording is retained beyond the 2006 English text, the project preserves the formal interaction rather than “repairing” it from pattern-name intuition. General Non-Repeat still applies independently to structurally implied lower fan. `MCR_GOLDEN_FIXTURES_2006.md` pins this behaviour.

## Settlement

Hand value and payment routing remain separate.

For accepted Basic Points `B`:

```text
discard win:
  discarder -> winner: 8 + B
  each other non-winner -> winner: 8

self-draw:
  each non-winner -> winner: 8 + B
```

No East multiplier and no loser-to-loser difference settlement.

## Progression

MCR progression consumes the resolved hand outcome only.

```text
after every completed hand:
  dealer passes

when all four dealer positions complete:
  prevailing wind advances

East -> South -> West -> North

complete North dealer cycle:
  game complete
```

This applies after wins and draws. Do not inherit BMJA/Classical East retention.

Tournament clocks and post-session Table Points are competition administration, not required for the ordinary Table Companion game tracker.

## Penalties / referee procedure

The Green Book contains extensive foul and tournament procedure. They are not automatic hand-scoring detectors for this product scope.

If a future tournament feature needs to record a referee-decided penalty, model it as an explicit profile-owned/manual transaction or adjustment with provenance. Do not infer it from the final hand unless the issue explicitly expands product scope.

## Existing platform reuse

Reuse where semantics genuinely match:

- canonical tile identities;
- Chow/Pung/Kong/pair structural evidence;
- exposed/concealed group state;
- irregular tile evidence;
- winning tile / event evidence primitives;
- profile/version identity;
- generic settlement transaction ledger;
- profile-owned progression/game-end strategies;
- local/cloud replay envelope when those layers exist.

Do not reuse Classical assumptions such as:

- base points / doubles fields;
- loser-hand scoring;
- loser-to-loser settlement;
- East payment multiplier;
- East retention;
- Classical limit semantics.

## Bounded implementation handoff

Once the #227 platform prerequisites exist, MCR implementation can be split mechanically:

1. register the 81 catalogue bindings from `MCR_FAN_CATALOGUE_2006.md`;
2. implement structural/event detectors and permitted irregular hand shapes;
3. implement `interaction.mcr-2006-non-combination`;
4. implement `qualification.mcr-8-before-flowers` + post-qualification Flower points;
5. implement MCR score result/explanations;
6. convert `MCR_GOLDEN_FIXTURES_2006.md` into executable tests;
7. implement `settlement.mcr-2006`;
8. implement `progression.always-pass` + four-round game end;
9. wire MCR-specific hand/result presentation;
10. obtain real MCR-player review before promoting the profile to stable/playable.

Any implementation discovery that contradicts the pinned source corpus returns to #176/source review rather than being guessed inside Codex.

## Research completion state

For the product boundary above, the pre-code research work is complete enough for a bounded engineering handoff:

- exact source edition pinned;
- all 81 fan indexed and source-located;
- scoring evidence boundary defined;
- interaction/counting policy defined;
- qualification/Flower ordering pinned;
- settlement pinned;
- progression/game end pinned;
- tournament procedure explicitly excluded from automatic scorer scope;
- named correctness fixtures prepared.

No MCR runtime code or public playable profile is added by this research work.
