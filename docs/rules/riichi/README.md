# Riichi / EMA 2025 rules programme

This directory is the implementation-facing evidence base for adding **Japanese Riichi Mahjong** to Mahjong Reference / Table Companion.

The initial target profile is the **European Mahjong Association (EMA) 2025 rules edition**. It is intentionally named and versioned rather than exposed as generic `Riichi`, because formal Riichi traditions differ in scoring details, etiquette and optional rules.

Primary source:

- European Mahjong Association, *Riichi: Rules for Japanese Mahjong*, 2025 edition, August 2025
- Source: http://mahjong-europe.org/portal/images/docs/Riichi-rules-2025-EN.pdf
- Source authority: governing/competition body (`A` in the repo provenance model)
- Licence stated in the rulebook: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International

The supplied one-page `Riichi-Yakulist.pdf` is a useful learning/check aid but is labelled as a 2023 update and is **not** normative for the 2025 profile.

## Why EMA 2025 is the right first Riichi target

The EMA rulebook explicitly exists to make Riichi play and teaching consistent across Europe for both competition and social club play. It therefore gives the project a named, formal, current and geographically relevant target rather than asking the implementation to guess what `standard Riichi` means.

Working profile identity should preserve the source edition, conceptually:

`riichi-ema-2025@0.x` while provisional → `riichi-ema-2025@1.0` only after the executable source audit is complete.

Exact registry naming should follow the existing code conventions when implementation begins.

## Mental model for non-Riichi maintainers

Riichi shares ordinary Mahjong tile/set concepts but has a materially different rules and scoring lifecycle from BMJA/Western play.

A useful first mental model is:

```text
physical hand/table context
        ↓
complete winning shape?
        ↓
has at least one yaku?
        ↓
yaku + dora evidence → han
        +
hand/win structure → fu
        ↓
limit tier / base value
        ↓
ron or tsumo payment route
        +
East/dealer status
        +
counters / riichi deposits / liability
        ↓
settlement
        ↓
dealer repeat/rotation + next-hand state
```

This means Riichi cannot be represented as British base points + doubles with more switches.

## Core rules concepts we must understand before coding

### Tile set and setup

EMA 2025 uses the 136 basic suited/honour tiles. Flowers, Seasons and Jokers are not used. Japanese sets may contain red fives, but **EMA 2025 does not use them**.

The game uses a 14-tile dead wall containing replacement tiles plus dora / kan-dora / ura-dora indicator positions.

### Winning grammar

The ordinary complete form is four sets and a pair. EMA also recognises Seven Pairs and Thirteen Orphans as complete special structures.

A complete hand is not automatically a legal win: it must have at least one **yaku**. Dora add han/value but do not replace the yaku eligibility requirement.

### Open and concealed state

Calling `chii`, `pon` or a claimed `kan` opens the hand. Some yaku require a concealed hand; some lose han when open; some are unaffected.

Winning by ron does not itself make the whole hand open, although the set completed by the winning discard may be treated differently for fu/concealed-triplet evaluation.

### Tenpai, furiten and riichi

`tenpai` means the hand is waiting on at least one tile. It is **not** British/Western fishing and must not reuse fishing semantics.

`furiten` restricts winning by discard (`ron`). It can arise from the player's own discarded waiting tiles, from passing a possible winning discard temporarily, or persist to the end of the hand after passing a win following a riichi declaration.

A concealed tenpai player can declare `riichi`, rotate the discard and place a 1,000-point bet. Riichi then constrains future hand changes and enables ura dora if the player later wins.

### Win sources

`tsumo` = win by self-draw.

`ron` = win on another player's discard.

Other event-sensitive yaku include winning after a quad replacement tile, robbing an extended quad, and winning on the last tile/last discard.

### Scoring

Scoring is layered:

1. determine yaku and han;
2. add dora / kan dora / ura dora where applicable;
3. calculate fu for non-limit hands;
4. apply mangan/haneman/baiman/sanbaiman/yakuman limits;
5. route payments according to East/Non-East and ron/tsumo;
6. add counters and allocate riichi deposits;
7. apply any specific liability rule.

Important EMA-2025 choices include:

- 4 han 30 fu and 3 han 60 fu are treated as mangan;
- a pair that is both seat and round wind receives 2 fu, not 4;
- yakuman are not cumulative;
- red fives are not used.

### Exhaustive draw

When no one wins after the final discard, tenpai/noten is declared. The total noten penalty is 3,000 points and is redistributed according to how many players are tenpai.

Riichi deposits remain on the table. Dealer/counter state then changes according to whether East was tenpai.

### Dealer / counters / progression

A full EMA game uses East and South rounds. East remains East after an East win or when East is tenpai at an exhaustive draw; otherwise the dealer rotates.

Counters increase winning payments and persist/reset according to the result of the hand.

### Multiple winners and liability

More than one player may win from the same discard. The discarder settles with each winner.

EMA also defines specific payment liability when a player feeds the final called set for Big Three Dragons or Big Four Winds.

### End of game

Players begin at 30,000 points. EMA 2025 has no bankruptcy rule: play does not automatically stop because a score becomes negative.

At the end, scores are measured relative to 30,000 and the winner bonus (`uma`) is applied: +15,000 / +5,000 / -5,000 / -15,000, with tie handling defined by the source.

## Source-reading map

Use `EMA_2025_IMPLEMENTATION_MATRIX.md` for implementation domains and source locators.

High-value rulebook sections:

- pp. 6–9 — tiles, setup, dead wall, dora, deal
- pp. 10–15 — winning grammar, claims, kan, tenpai, furiten, riichi, ron/tsumo
- pp. 16–19 — exhaustive draw, settlement events, counters, dealer rotation, game end, uma
- pp. 20–22 — han/fu/value/payment calculation
- pp. 23–26 — yaku and yakuman definitions
- pp. 26–28 — ten official scoring examples
- pp. 32–38 — errors and penalties
- pp. 39–40 — tournament overlay
- p. 42 — compact yaku list
- p. 43 — scoring tables

## Implementation gates

### Gate A — comprehension

Before broad scoring implementation, maintainers must be able to describe from source:

- normal turn/claim flow;
- legal winning conditions;
- riichi declaration and post-riichi restrictions;
- furiten;
- ron versus tsumo;
- kan/dead-wall/dora flow;
- exhaustive draw;
- dealer repeat/rotation;
- full East/South progression;
- final settlement.

### Gate B — architecture

Every Riichi-specific concept must have an explicit home in the domain model. Do not overload BMJA concepts merely because names seem related.

### Gate C — deterministic scoring

The engine must reproduce the ten official examples on pp. 26–28 and the p. 43 scoring table/formula before it is treated as trustworthy.

### Gate D — full table play

A selectable full-game profile requires progression, counters, riichi deposits, tenpai/noten draws, dealer rotation and end-game settlement — not only a winning-hand calculator.

### Gate E — real-player validation

Because the maintainer does not currently play Riichi, experienced EMA/European Riichi players must validate terminology, evidence-entry flow and real-table usefulness before broad release.

## Product boundary

Riichi rules correctness must remain deterministic and local-first.

Voice, photography or other AI capture may later populate structured evidence, but they do not define Riichi truth and must never become required for scoring or table progression.

## Related work

- #202 — active Riichi / EMA 2025 development programme
- #51 — rules-profile architecture
- #83 — versioned rules profiles
- #84 — canonical hand-pattern model
- #89 — cross-profile golden validation
- #105 — Table Companion product direction

## Principle

> **Learn the game first; then build the smallest transparent rules engine that can explain every result.**
