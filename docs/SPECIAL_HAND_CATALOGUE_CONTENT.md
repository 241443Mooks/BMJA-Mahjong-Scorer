# Special-Hand Catalogue Content

This document is the content source for the learner-facing British Mahjong special-hand catalogue now implemented at `/special-hands` (alias `/special-hand-catalogue`).

It sits **outside the main beginner scoring flow**. The scorer should detect special hands wherever possible. Players should not need to memorise special-hand names before they can score a hand.

This is a project-owned learner guide, not an official BMJA publication. Public wording remains paraphrased and should be cross-checked against `BMJA_RULES_REFERENCE.md` when rules change.

## Catalogue purpose

The catalogue helps a player answer:

- What does this special hand mean?
- Why did the scorer recognise this?
- What is it worth?
- Can I score for fishing for it?
- Does the app recognise it automatically?
- Why is the app asking me what happened?

It is **not** a prerequisite for scoring.

## Implemented page design

Each special-hand card contains:

- name
- plain-English description
- winner value
- fishing value where applicable
- how to enter it
- what the scorer can detect
- a visual tile example where a pattern is best explained with tiles
- a short expandable explanation where winning-tile or event context can matter

The catalogue is grouped into:

1. specials built from normal sets
2. irregular tile-pattern specials
3. specials based on how the hand was won

Tile diagrams reuse the same pinned CC BY 4.0 SVG artwork as the beginner guide. Event-based specials use small timelines instead of inventing arbitrary full hands.

## Visual principle

The pictures teach the pattern rather than decorate the page. Each tile row is one clear legal-style example; it is not presented as the only possible arrangement.

Pattern examples currently cover:

- Purity
- All Pair Honours
- All Winds and Dragons
- Heads and Tails
- Fourfold Plenty
- Three Great Scholars
- Four Blessings Hovering over the Door
- Buried Treasure
- Imperial Jade
- Knitting
- Triple Knitting
- Thirteen Unique Wonders
- Gates of Heaven
- Wriggling Snake

Event timelines currently cover:

- Heaven’s Blessing
- Earth’s Blessing
- Gathering the Plum Blossom from the Roof
- Plucking the Moon from the Bottom of the Sea
- Twofold Fortune

The two tile-specific event specials also show the relevant SVG directly:

- 5 Circles for Gathering the Plum Blossom from the Roof
- 1 Circles for Plucking the Moon from the Bottom of the Sea

## Values and recognition

| Special hand | Winner value | Fishing | Entry route | Detection |
| --- | ---: | ---: | --- | --- |
| Purity | 3 doubles / intrinsic if greater | 3 doubles / intrinsic if greater | Standard sets | Automatic |
| All Pair Honours | 500 | 200 | Standard sets | Automatic |
| All Winds and Dragons | 1,000 | 400 / intrinsic if greater | Standard sets | Automatic |
| Heads and Tails | 1,000 | 400 | Standard sets | Automatic |
| Fourfold Plenty | 1,000 | 400 | Standard sets | Automatic |
| Three Great Scholars | 1,000 | 400 / intrinsic if greater | Standard sets | Automatic |
| Four Blessings Hovering over the Door | 1,000 | 400 / intrinsic if greater | Standard sets | Automatic |
| Buried Treasure | 1,000 | 400 | Standard sets | Automatic; winning-tile context may matter |
| Imperial Jade | 1,000 | 400 | Standard sets | Automatic |
| Knitting | 500 | 200 | Irregular layout | Automatic |
| Triple Knitting | 500 | 200 | Irregular layout | Automatic |
| Thirteen Unique Wonders | 1,000 | 400 | Irregular layout | Automatic |
| Gates of Heaven | 1,000 | 400 | Irregular layout | Automatic; winning-tile context may matter |
| Wriggling Snake | 1,000 | 400 | Irregular layout | Automatic |
| Heaven’s Blessing | 1,000 | — | Normal winner flow | Automatic from original-deal method |
| Earth’s Blessing | 1,000 | — | Normal winner flow | One short event question |
| Gathering the Plum Blossom from the Roof | 1,000 | — | Normal winner flow | Automatic from method + winning tile |
| Plucking the Moon from the Bottom of the Sea | 1,000 | — | Normal winner flow | Automatic from method + winning tile |
| Twofold Fortune | 1,000 | — | Normal winner flow | One short event question |

## UX principles

- Do not make the catalogue a prerequisite.
- Prefer recognition over selection.
- Use progressive disclosure for the exceptions and finer detail.
- Explain what the app does for the player rather than exposing implementation terminology.
- For event specials, ask only the smallest factual question that cannot be inferred.
- If the player selects **I’m not sure**, score conservatively rather than assuming a special event occurred.

Useful public labels include:

- **Detected automatically from your tiles**
- **Detected automatically from how you won**
- **The scorer may ask one extra question**
- **Use “My hand doesn’t fit normal sets” to enter this pattern**

Avoid public implementation language such as detector, provenance, event context, canonical model, or loose-tile representation.

## Maintenance note

The page is implemented in `artifacts/mahjong-scorer/src/guide/SpecialHandsCatalogue.tsx` and uses reusable tile rendering from `MahjongTileGallery.tsx`.

Before publishing changes to rules or values, cross-check this page and document against `BMJA_RULES_REFERENCE.md`. The catalogue should remain secondary to the scorer itself.