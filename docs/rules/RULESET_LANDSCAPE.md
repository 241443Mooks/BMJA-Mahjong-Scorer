# Mahjong ruleset landscape

This document records the high-level rules families identified in the 9 September 2026 research pass.

Its purpose is to stop the project from treating every Mahjong variation as either "BMJA" or an arbitrary house rule.

## Working taxonomy

```text
Classical / Western family
├── British / BMJA
├── Thompson & Maloney Western
└── named club profiles
    └── Outside the Box

Other major scoring families
├── Hong Kong / Cantonese
├── Japanese Riichi
├── Chinese Official / MCR
├── American / NMJL
└── other regional families for later research
    ├── Sichuan
    ├── Taiwanese 16-tile
    └── Singaporean / Malaysian families
```

This is a product/engineering taxonomy, not a claim that the historical relationships between all variants are fully settled.

## At-a-glance comparison

| Dimension | British / BMJA | Thompson & Maloney Western | Outside the Box | Hong Kong / Cantonese | Japanese Riichi | Chinese Official / MCR | American / NMJL |
|---|---|---|---|---|---|---|---|
| Broad family | Classical/Western | Classical/Western | Named club profile | Faan-based Chinese family | Japanese | Competition Chinese | American card-based |
| Standard winning shape | Four sets + pair, plus special hands | Classical four sets + pair, plus special hands | British/Western core + selected exceptions | Four sets + pair + recognised exceptions | Four groups + pair, Seven Pairs or Thirteen Orphans | Four sets + pair + recognised exceptions | Exact annual-card target pattern |
| Core scoring grammar | Base points + doublings + fixed specials | Base points + doublings + fixed specials | Classical core + fixed specials/local rules | Additive faan + conversion | Han/yaku + fu + capped payment formula | Additive fan, minimum qualifying threshold | Printed annual-card value |
| Ready/incomplete scoring | Fishing values for special hands | Fishing values present in Companion material | Fishing values | No generic fishing payout | Tenpai/noten settlement, not fishing | No fishing payout | No generic fishing payout |
| Non-winner hands score? | Yes | Main rules source still to verify completely | Yes | Normally no | No, except draw settlement | No | No |
| Dealer/East treatment | East pays/receives double | Verify exact Western source/edition | East pays/receives double | Profile-dependent/classical modifiers | Dealer payment multiplier + continuation | No BMJA-style dealer doubling | No comparable BMJA-style dealer multiplier |
| Special-hand catalogue | Finite BMJA list | Large Western catalogue ecosystem | BMJA + selected Western + local | Named faan patterns | Yaku/yakuman catalogue | 81 fan combinations | Annual card catalogue |
| Exchange mechanic | Goulash after draw | Western Goulash tradition; verify exact source | Local Goulash | None standard | None | None | Charleston before ordinary play |
| Liability concept | No OTB-style cannon in current BMJA source | Verify | Explicit cannon rule | Dangerous-discard liability exists in codified variants | Pao for specified yakuman | Different settlement model | Discard/self-draw payer consequences |
| Versioning need | Rulebook/clarification edition | Book edition + catalogue edition | Club guide version | Named rules authority/version | WRC/EMA rules version | MCR edition | Annual year is mandatory |

## Classical / Western family

### British / BMJA

The current evidence supports treating BMJA as a **standardised British profile within a wider Western/classical tradition**, not as an entirely separate game grammar.

Important traits:

- classical intrinsic points for sets/pairs;
- doublings;
- fixed-value special hands;
- fishing values;
- loser-to-loser settlement;
- East doubling;
- restricted BMJA special-hand catalogue;
- one-Chow maximum in ordinary play;
- British Goulash rules.

The project should preserve BMJA as a named, authoritative default rather than flattening it into generic "Western".

### Thompson & Maloney Western

The project currently has two distinct Thompson & Maloney source roles:

1. **The Game of Mah Jong Illustrated** — intended Western baseline rules source.
2. **The Mah Jong Player's Companion** — extensive supplementary hand catalogue/reference.

The Companion demonstrates that the Western hand ecosystem is substantially larger than the BMJA-approved special-hand list. It also demonstrates profile-specific score variation: identical or near-identical tile patterns can carry different fixed values in different rule profiles.

The Western baseline remains **not yet fully verified** until the main rules book is checked for ordinary play and settlement details.

### Outside the Box

Outside the Box is best treated as a **named club profile**, not as a generic synonym for house rules.

The supplied guide shows a recognisable composition:

- British/classical ordinary scoring;
- BMJA-recognised special hands;
- selected additional Western special hands;
- local doubling and procedure rules;
- explicit cannon/liability;
- local Goulash.

This profile is valuable because it tests whether the future engine can compose real rules cleanly without club-specific conditional code.

## Hong Kong / Cantonese

"Hong Kong Mahjong" should not be treated as one universal ruleset. Future implementation should select a specific codified authority/profile.

Core architectural differences from British/Western:

- scoring in **faan** rather than intrinsic points followed by doublings;
- hand patterns contribute additive faan;
- a conversion/payment table resolves the final settlement;
- dangerous-discard liability can affect who pays;
- canonical hand shapes such as Nine Gates, Thirteen Orphans and Big Winds still overlap with other disciplines.

This means Hong Kong can share canonical pattern detectors and a generic liability-payment layer, but not the Western scoring grammar.

## Japanese Riichi

Riichi is a separate scoring grammar with strong formal rule sources available.

Important differences:

- 136 tiles; no Flowers/Seasons in the standard set;
- a valid winning hand needs at least one yaku;
- yaku and dora contribute han;
- fu is calculated separately;
- capped scoring tiers and yakuman;
- ron and tsumo produce different payment paths;
- riichi deposits and continuation counters affect settlement;
- tenpai/noten settlement applies at exhaustive draws;
- furiten materially changes legal winning claims;
- dealer continuation affects progression.

Riichi should reuse shared pattern/hand-state primitives where sensible, but needs its own scoring strategy.

## Chinese Official / MCR

MCR is a formal competition ruleset with an additive fan grammar.

Important differences:

- 81 formal scoring combinations;
- minimum qualifying fan;
- explicit interaction/exclusion rules between combinations;
- additive scoring rather than Western doubling or Riichi han/fu;
- recurring canonical patterns such as Big Four Winds, Big Three Dragons, Nine Gates, Four Kongs, All Green and Thirteen Orphans.

MCR is a useful future architecture test because its pattern overlap is high while its scoring semantics are distinct.

## American / NMJL

American Mahjong is the clearest example of a variant that should **not** be forced into a Western rules profile.

Important differences:

- annual Standard Hands card;
- exact target-hand matching;
- Jokers;
- Charleston before ordinary play;
- card-defined hand values;
- annual versioning is unavoidable;
- the current card is commercially sold/copyrighted.

A future implementation needs a distinct annual-catalogue strategy and should not embed current NMJL card content without appropriate permission/licensing.

American Mahjong can still reuse low-level tile and UI concepts, but its winning-hand matcher is fundamentally different from the classical four-sets-plus-pair model.

## Recurring canonical patterns

The research identified a set of patterns worth considering as future reusable, rules-neutral predicates:

- Thirteen Orphans;
- Nine Gates;
- Big Three Dragons;
- Big Four Winds;
- Four Kongs;
- All Honours;
- All Green;
- All Terminals;
- Seven Pairs;
- Heavenly Hand;
- Earthly Hand;
- replacement-tile win;
- last-tile win.

The rule engine should not assume identical scoring just because a pattern is structurally similar.

Example:

```text
canonical pattern: BIG_THREE_DRAGONS

BMJA                -> Three Great Scholars -> BMJA limit value
T&M Companion       -> Three Great Scholars -> 1500 / fishing 600
Outside the Box     -> Three Great Scholars -> 1000 / fishing 400
Riichi              -> Daisangen            -> yakuman
MCR                 -> Big Three Dragons     -> 88 fan
```

That pattern/value separation is one of the strongest conclusions of the research pass.

## Rules that may be configuration vs rules that need a different strategy

### Good candidates for profile/component configuration

- tile-set options;
- Chow limits;
- Flowers/Seasons use;
- ordinary base-point tables;
- fixed doubles;
- fixed special-hand values;
- exposure rules;
- fishing values;
- East/dealer multipliers;
- settlement multipliers;
- Goulash parameters;
- liability triggers;
- penalties;
- round/seat progression;
- catalogue membership.

### Likely separate scoring strategies

- Western/BMJA base-points-and-doublings;
- Hong Kong faan conversion;
- Riichi han/fu;
- MCR additive fan + interaction rules;
- American annual-card exact matcher.

## Immediate implementation relevance

The project should prove the architecture first with:

1. **BMJA** — preserve current behaviour exactly.
2. **Thompson & Maloney Western** — verify and encode the wider Western baseline.
3. **Outside the Box** — compose a real named club profile from British/Western components plus local rules.

If those three can coexist cleanly, the architecture is likely strong enough to consider Hong Kong, Riichi and MCR next.
