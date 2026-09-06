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

## Ambiguities retained rather than guessed

1. **Loose-tile extra 2 points:** the general scoring page says the extra two
   points are for a live-wall draw, while the Purity notes say live wall or
   kong box. The unambiguous loose-tile double remains; no extra two points are
   awarded pending an authoritative clarification.

## BMJA special hands not represented by the current engine

The catalogue lists every special hand currently supported. The event-dependent
Heaven's Blessing, Earth's Blessing, Gathering the Plum Blossom from the Roof,
Plucking the Moon from the Bottom of the Sea and Twofold Fortune need event data
that the current hand contract does not yet capture. They have not been guessed
or silently approximated.

Knitting, Triple Knitting, Imperial Jade, Gates of Heaven and Wriggling Snake
now have winner-pattern recognition. All supported specials now also have
verified one-tile-away fishing treatment with published 200/400 values,
intrinsic-value alternatives where applicable, and separately scored bonus
tiles. Buried Treasure and Gates of Heaven now apply their final-claim
exceptions only from validated winning-tile provenance.