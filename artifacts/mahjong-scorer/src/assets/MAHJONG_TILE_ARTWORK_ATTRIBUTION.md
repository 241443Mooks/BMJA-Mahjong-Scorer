# Mahjong tile artwork attribution

The Mahjong tile artwork used by this project comes from [`xhokir/riichi-mahjong-tiles`](https://github.com/xhokir/riichi-mahjong-tiles), based on [`FluffyStuff/riichi-mahjong-tiles`](https://github.com/FluffyStuff/riichi-mahjong-tiles).

The imported artwork is used under the **Creative Commons Attribution 4.0 International licence (CC BY 4.0)**:

https://creativecommons.org/licenses/by/4.0/

Attribution:

> Mahjong tile artwork from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, used under CC BY 4.0. Changes, if any, are noted by this project.

## How the project uses the artwork

- The upstream repository is included as a pinned Git submodule at `artifacts/mahjong-scorer/src/assets/riichi-mahjong-tiles`.
- The pinned upstream revision is `19d72ff5cf9ad9c401188734f80cef7e6c8c6140`.
- The app uses only the Regular SVG tile faces required by British Mahjong: 34 standard playing-tile identities plus Flower 1–4 and Season 1–4.
- Riichi red-five / Dora variants are not used.
- The SVG artwork is not hot-linked at runtime. Vite bundles the selected local checkout assets into the application build.
- The SVG artwork is currently used without visual modification. Project-owned responsive layout, labels and accessible text are added around it.

If the artwork is modified later, this notice should be updated to identify those changes.
