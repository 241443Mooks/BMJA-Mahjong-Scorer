# Buzzard 2000 British/Western Classical — compatibility crosswalk

Status: **implementation-ready architecture crosswalk**  
Issue: #175  
Implementation child: #217  
Source profile: Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It*, last modified 30 March 2000  
Working source ID: `buzzard-2000-classical`

## Conclusion

Buzzard is substantially closer to the current platform than the first architecture pass suggested.

The key scope correction is:

> **Mahjong Reference scores the physical game and runs the table. It does not play Mahjong for the players.**

That means we do not need a Buzzard wall simulator, draw/discard engine, real-time claim arbiter or Standing-Hand legality state machine to support the rules profile.

For the product we actually have, Buzzard is mostly:

> **existing classical/BMJA profile primitives + a Buzzard menu of additions/amendments/removals + a small amount of settlement evidence.**

It is not a new scoring-engine family and should not fork the application.

## Existing platform fit

The current platform already has the pieces Buzzard needs:

- four players and seat winds;
- prevailing wind and East progression;
- versioned `RulesProfileRef` persisted/replayed with the game;
- Chow/Pung/Kong/pair representation;
- exposed/concealed sets;
- Flowers/Seasons;
- ordinary points + doubles calculation;
- special-hand predicates/profile bindings;
- final win-source evidence such as wall, loose tile, last wall and robbing Kong;
- scores for winners and losers;
- transaction-based settlement;
- pairwise loser settlement and East doubling;
- incident/liability infrastructure from Outside the Box.

The recovered Buzzard PDF now source-binds the exact scoring, settlement, progression and penalty rules needed by the companion. See `BUZZARD_2000_RULE_EVIDENCE.md`.

## Compatibility matrix

| Buzzard concern | Current fit | Build decision |
|---|---|---|
| ordinary Chow/Pung/Kong/pair points | Direct | **REUSE** |
| exposed/concealed values | Direct | **REUSE** |
| Flowers/Seasons basic 4 points | Direct | **REUSE** |
| own/round Wind + Dragon doubles | Direct | **REUSE** |
| +20 Mahjong / +2 self-draw | Direct | **REUSE** |
| mixed-one-suit / majors-family doubles | High | **REUSE** |
| rob-Kong / last-wall / loose-tile win evidence | Direct event primitives | **REUSE** |
| ordinary settlement | Same transaction shape | **REUSE** |
| East payment doubling | Direct | **REUSE** |
| East/seat/prevailing-wind progression | Same strategy shape | **REUSE + fixture** |
| complete Flowers/Seasons ×8 | Different bouquet rule | **AMEND** |
| pure one-suit ×8 | Current BMJA predicate too narrow | **AMEND predicate** |
| Standing Hand +100 | Evidence field missing | **ADD small scoring fact** |
| only-possible tile +2 | Evidence field/inference missing | **ADD** |
| no Chows +10 | Missing additive bonus | **ADD** |
| scoreless +10 | Missing additive bonus | **ADD** |
| last-wall +10 | Existing double, missing additive bonus | **ADD** |
| Loose Tile +10 | Existing double, missing additive bonus | **ADD** |
| all Chows + non-scoring pair ×2 | Missing | **ADD** |
| Buzzard ten limit hands | Registry can express most | **CONFIGURE/ADD bindings** |
| incomplete Four-Wind/Three-Dragon limit for a loser | Current assumptions too winner-centric | **SMALL ADAPT** |
| dangerous-discard liability | OTB cannon infrastructure is close | **REUSE shape + CONFIGURE policy** |
| false Mahjong / tile-count consequences | Existing incident concepts exist | **CONFIGURE/ADAPT policy** |
| BMJA fully-concealed ordinary double | Not a Buzzard ordinary double | **REMOVE / do not inherit** |
| BMJA `originalCall` | Not Standing Hand | **REMOVE / do not inherit** |
| BMJA generic final-discard double | Not stated by Buzzard | **REMOVE / do not inherit** |

## The right mental model

The implementation should behave like selecting rules from a profile menu, not copying one scorer and editing it into another.

Conceptually:

```text
shared classical primitives
+ Buzzard KEEP rules
+ Buzzard ADD rules
+ Buzzard AMEND rules
- rules not in Buzzard
= buzzard-2000-classical profile
```

This does **not** mean the runtime should literally invoke `BMJA_RULESET` and mutate its result. It means the reusable lower-level rules/predicates/policies should be composed into profile-specific behaviour.

The important isolation rule remains: changing Buzzard must not change BMJA, Western T&M or Outside the Box outputs.

## What is genuinely new architecture

Only two seams look materially new enough to deserve architecture attention.

### 1. Non-winner special/limit result

Buzzard permits incomplete Four-Wind and Three-Dragon achievements to score the limit against the other losers even though that player did not win the hand.

So a special/limit result cannot universally mean `isWinner === true`.

This is a modest scorer/settlement generalisation, not a new engine.

### 2. Profile-owned incident settlement policy

Buzzard's dangerous-discard liability and false-Mahjong/tile-count consequences differ numerically or procedurally from OTB, but the existing incident → settlement-override architecture is already the right shape.

Generalise only the shared evidence/transaction seam; keep Buzzard trigger/amount policy profile-local.

## What does **not** need architecture work

The source describes physical-play procedure for:

- wall breach and Loose Tiles;
- the final 14 dead-wall tiles;
- Chow/Pung/Kong claim timing;
- priority between competing claims;
- promoted/concealed Kong procedure;
- Standing Hand lock behaviour.

These are important rules-reference facts, but they do not require state machines in the current Table Companion.

The real table supplies resolved facts such as:

- `draw/dead hand`;
- `standing hand`;
- `last wall tile`;
- `loose tile`;
- `robbed kong`;
- `dangerous discard liability` and liable player.

The companion scores/settles those facts.

## Proposed profile identity

Working identity:

```text
buzzard-2000-classical@0.x
```

Public label:

> **British/Western Classical — Buzzard 2000**

Never present it as universal `Traditional Mahjong`, `Classical Mahjong` or `Western Mahjong`.

## Build order

1. encode source-linked golden fixtures from `BUZZARD_2000_RULE_EVIDENCE.md`;
2. add the versioned Buzzard profile;
3. compose ordinary KEEP rules from existing classical primitives;
4. add/amend/remove the small scoring deltas;
5. add Buzzard limit bindings;
6. adapt the non-winner limit seam;
7. reuse ordinary settlement/progression and prove with fixtures;
8. configure Buzzard incident/liability settlement;
9. expose in the profile picker only after cross-profile regression passes;
10. add profile-specific reference/help content.

## Build-size judgement

For the current scoring/table-running scope, Buzzard is **small-to-medium**, not a new mini-platform.

The majority of work is profile configuration and regression fixtures. The only meaningful domain extensions are non-winner limit scoring and profile-specific settlement incidents.

This makes Buzzard a useful first proof that our rules architecture can genuinely compose another classical profile before we move to MCR and Riichi, where the scoring grammar changes much more substantially.