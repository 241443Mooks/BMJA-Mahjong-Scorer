# Mahjong Tile Asset Source Decision

This document records the visual-asset decision for the learner guide, special-hand catalogue, worked examples, reports, and any future tile-based reference UI.

It belongs to issue #5 and should be treated as the implementation brief for Codex when tile illustrations are added.

## Decision

Use the **Regular SVG set from `xhokir/riichi-mahjong-tiles`** as the preferred source for the project's Mahjong tile artwork.

Repository: https://github.com/xhokir/riichi-mahjong-tiles

The fork contains:

- the 34 standard playing-tile faces
- 4 Flower tiles
- 4 Season tiles
- SVG source artwork
- PNG exports

This gives the project one visually coherent set covering all 42 tile identities currently needed by the British Mahjong scorer.

### Licence

The `xhokir/riichi-mahjong-tiles` repository states that its images are licensed under the **Creative Commons Attribution 4.0 International licence (CC BY 4.0)**.

Licence: https://creativecommons.org/licenses/by/4.0/

The fork is based on `FluffyStuff/riichi-mahjong-tiles`, whose original assets are public domain / CC0. For simplicity and conservatism, assets imported from the xhokir fork should be treated by this project as **CC BY 4.0** and attributed accordingly.

Recommended attribution text:

> Mahjong tile artwork from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, used under CC BY 4.0. Changes, if any, are noted by this project.

When assets are added to this repository, also add a local attribution/licence notice beside them.

## Why this set was selected

The project needs a set that works for British Mahjong rather than only Riichi. In particular, it needs all eight bonus tiles as first-class assets.

The xhokir fork is the best current fit because:

- it includes **all 34 standard tiles plus all 8 Flowers/Seasons**
- the bonus tiles are supplied in the same Regular set as the standard tiles, so examples can use one consistent visual language
- SVGs are available for crisp scaling on mobile, desktop, print-style guides and generated reports
- PNG exports are already available if raster output is ever useful
- the licence permits reuse and modification with straightforward attribution
- it avoids mixing a public-domain base set with a visually different bonus-tile family unless we need a fallback later

## Candidate comparison

| Candidate | Visual fit | SVG | PNG | Flowers / Seasons | Licence | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `samoheen/mahjong-tiles` | Traditional Hong Kong-style; good fit for non-Riichi players | Yes | Yes | No complete 8-tile bonus set found | Public Domain | Good fallback for standard tiles, but incomplete for this project |
| `FluffyStuff/riichi-mahjong-tiles` | Very clean, polished flat vectors | Yes | Yes | No | Public Domain / CC0 | Excellent base artwork, but incomplete by itself |
| `xhokir/riichi-mahjong-tiles` | Same clean flat family as FluffyStuff, with added bonus tiles | Yes | Yes | **Yes: Flower1–4 and Season1–4** | **CC BY 4.0** | **Chosen** |
| Wikimedia Commons / Cangjie6 bonus tiles | Detailed, attractive, more 3D/perspective in style | Yes | Renderable | Yes | CC BY-SA 4.0 | Fallback only; visually less consistent and adds ShareAlike obligations for derivatives |

## Canonical assets to use

Prefer the Regular SVG files, not the black tile set and not Riichi red-five / Dora variants.

### Standard playing tiles

Map the source names to project-facing names rather than exposing Japanese/Riichi filenames in learner-facing code or content:

- `Man1.svg` – `Man9.svg` → Characters 1–9
- `Pin1.svg` – `Pin9.svg` → Circles 1–9
- `Sou1.svg` – `Sou9.svg` → Bamboos 1–9
- `Ton.svg` → East Wind
- `Nan.svg` → South Wind
- `Shaa.svg` → West Wind
- `Pei.svg` → North Wind
- `Chun.svg` → Red Dragon
- `Hatsu.svg` → Green Dragon
- `Haku.svg` → White Dragon

### Bonus tiles

- `Flower1.svg` – `Flower4.svg` → Flower 1–4
- `Season1.svg` – `Season4.svg` → Season 1–4

The app may later display conventional flower/season names as secondary labels, but the canonical scorer model should continue to use its existing `flower1`–`flower4` and `season1`–`season4` identities unless a separate rules decision changes that.

## Implementation guidance for Codex

When this work is implemented:

1. **Vendor the SVGs into this repository.** Do not hot-link to GitHub or another external host at runtime.
2. Keep the source licence/attribution with the vendored assets.
3. Prefer SVG as the canonical asset format.
4. Generate or bundle PNG only where a specific export path genuinely requires raster artwork.
5. Use stable project-owned filenames such as `characters-1.svg`, `circles-5.svg`, `east-wind.svg`, `red-dragon.svg`, `flower-1.svg` and `season-1.svg`.
6. Do not import red fives / Dora tiles because they are not part of the current BMJA ruleset.
7. Add accessible text alternatives wherever the tile image conveys information.
8. Examples should be generated from tile identities where practical rather than hand-building one-off composite images. This will let the same asset system power the special-hand catalogue, beginner guide, scorer, reports and future photo-correction UI.
9. If the artwork is recoloured, cropped, simplified, composited, or otherwise modified, record that in the attribution notice as required by CC BY 4.0.

## Catalogue use

The special-hand catalogue should use these assets for the small visual examples described in `SPECIAL_HAND_CATALOGUE_CONTENT.md`.

Examples should be rendered from arrays of canonical tile identities, not embedded as single pre-made screenshots. That will make them responsive, reusable, testable and easier to update if the artwork ever changes.

Event-based specials such as Heaven's Blessing, Earth's Blessing and Twofold Fortune may still be better explained with a small event/timeline diagram rather than a full tile row. The tile assets should be used only where they materially help the learner understand the pattern or winning tile.

## Public wording / attribution placement

The learner guide does not need to interrupt every example with a licence note. A single accessible **Credits / Open-source licences** page or footer link is sufficient for normal use, provided it includes the required CC BY 4.0 attribution and licence link.

Generated reports that include the artwork should also retain an appropriate attribution, either in the report footer or in a compact credits section.

## Revisit conditions

Reconsider this decision only if:

- a genuinely public-domain / CC0 complete 42-tile set becomes available in a style we prefer
- the xhokir bonus artwork proves inconsistent at the sizes used by the app
- accessibility testing shows that another visual style is materially clearer
- the project adopts a custom in-house tile style later

Until then, the xhokir Regular SVG set is the preferred asset source.
