# BMJA scoring audit

Audited against the BMJA-approved rules explanations at:

- https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/
- https://mahjongbritishrules.wordpress.com/scoring/special-hands/

The machine-readable source of truth for this implementation is
`src/scoring/scoring-rules.catalog.json`.

## Corrections made

1. Removed generic Seven Pairs, which is not a BMJA special hand.
2. Restricted Purity to four pungs/kongs and a pair in one suit. A one-suit
   hand containing chows no longer receives three doubles.
3. Separated Purity playing-tile scoring from flower/season scoring. Ordinary
   doubles no longer compound into Purity bonus tiles.
4. Corrected All Pair Honours to allow all major tiles (including 1s and 9s)
   and repeated pairs.
5. Corrected Buried Treasure to reject kongs, chows and mixed numbered suits.
6. Corrected Three Great Scholars to require a complete hand.
7. Corrected Four Blessings to require all four wind pungs/kongs plus any pair.
8. Corrected Fourfold Plenty to require four kongs and a pair.
9. Replaced generic All Honours/All Terminals labels and shapes with the BMJA
   All Winds and Dragons and Heads and Tails definitions.
10. Added explicit calculation components so fixed special values, separately
    doubled bonus tiles, Purity and final limit capping are machine-verifiable.

## Variant contamination check

No Riichi yaku, dora, fu/han, furiten, Hong Kong fan minimum, American card
hands, jokers or Charleston rules are present. Generic Seven Pairs and generic
one-suit-with-chows scoring were found and removed.

## Winning-tile provenance corrections

11. Added optional winning-tile provenance with distinct grouped-set and
    loose-layout destinations. It is checked against the completed winning hand.
12. Implemented Buried Treasure's discard/final-discard exception: only the
    provenance-selected final pung or pair may be exposed.
13. Implemented Gates of Heaven's final-pung exception: a claimed completion
    must identify a suited 1 or 9 in the Gates suit. Unknown, paired-minor, stale
    and mismatched provenance is rejected conservatively.

## Event-special corrections

14. Added an East-only original-deal winning method and automatic Heaven's
    Blessing recognition without treating the hand as a wall draw.
15. Added the minimum first-discard evidence for Earth's Blessing. Unknown or
    negative answers do not enable the special.
16. Added automatic Gathering the Plum Blossom from the Roof recognition from a
    replacement winning 5 Circles.
17. Added automatic Plucking the Moon from the Bottom of the Sea recognition
    from a last-wall winning 1 Circles.
18. Added a compact two-Kong replacement-sequence fact for Twofold Fortune.
    It requires at least two completed Kongs and a replacement-tile win.
19. Kept event evidence out of non-winning records and preserved it through
    detailed score records, confirmation, replay and undo. No turn or discard
    history was introduced.

## Unfinished losing-hand corrections

20. Replaced the single typed incomplete group with arbitrary individually
    entered Remaining tiles alongside completed scoring groups.
21. Enforced 13 structural playing tiles for non-winners and 14 for winners.
    Flowers and Seasons are excluded; each represented Kong contributes four
    physical tiles but only three structural slots.
22. Included Remaining tiles in playing-tile copy limits and whole-hand
    suit/honour properties without scoring them as completed groups.
23. Reworked grouped fishing to use only the actual entered remainder. Each
    candidate draw is accepted only when the resulting tiles have a legal
    concealed decomposition that completes a supported special. Existing
    pairs may be upgraded to pungs when the draw matches.
24. Preserved the direct 13-loose-tile fishing route for irregular specials,
    and also allowed the same actual-content check when all 13 ordinary
    Remaining tiles are ungrouped.
25. Corrected Fourfold Plenty fishing fixtures to four completed Kongs plus a
    single waiting for the pair. Promoting a pung to a Kong cannot itself
    supply the missing structural tile.
26. Preserved Remaining tiles in detailed score records, handoff, ledger
    cloning, replay and undo paths.

## Hand-builder UX refinements

- Kept Standard sets as the default entry route and moved the rare irregular
  layout behind the beginner-facing “My hand doesn’t fit normal sets” action.
- Made each entered loose tile a touch-friendly removal control: tapping it
  removes that occurrence, while Enter and Space provide the same keyboard
  behavior.
- Preserved the separate Standard-set and irregular-layout drafts when changing
  modes so switching entry route does not silently discard work.
- Replaced “Incomplete group” with a touch- and keyboard-operable Remaining
  tiles area. Every leftover tile can be added or removed individually.
- Changed hand progress to the 13/14 structural playing-tile base, excluding
  Flowers and Seasons and showing additional physical Kong tiles separately.
- Prevented the tile bank from representing more than four physical copies or
  exceeding the applicable structural hand size.

## Ambiguities retained rather than guessed

1. **Loose-tile extra 2 points:** the general scoring page says the extra two
   points are for a live-wall draw, while the Purity notes say live wall or
   kong box. The unambiguous loose-tile double remains; no extra two points are
   awarded pending an authoritative clarification.

## BMJA special-hand coverage

Knitting, Triple Knitting, Imperial Jade, Gates of Heaven and Wriggling Snake
now have winner-pattern recognition. All supported specials now also have
verified one-tile-away fishing treatment with published 200/400 values,
intrinsic-value alternatives where applicable, and separately scored bonus
tiles. Buried Treasure and Gates of Heaven now apply their final-claim
exceptions only from validated winning-tile provenance. The five event-based
specials are now recognized from existing winning method/provenance data plus
only the two event facts that cannot be inferred: East's first discard and the
two-Kong replacement sequence.