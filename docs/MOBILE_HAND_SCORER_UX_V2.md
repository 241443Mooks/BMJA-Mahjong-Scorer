# Mobile hand scorer UX v2

## Why this replaces the first attempt

The first mobile pass used CSS `:has()`, `display: contents`, and a fixed tile bank to rearrange the existing desktop DOM. On Android Chrome this removed most of the hand scorer from normal scroll flow. Production was restored by reverting that CSS.

This version must change the React layout structurally and keep the document in normal flow. Do not use fixed-position panels, `display: contents`, or CSS selector tricks to move major sections.

## Goals

1. Put hand/game context at the top of the mobile hand-scoring workflow.
2. Let a player choose tiles beside the set or tile area they are currently editing.
3. Never require a down-page trip to a separate tile bank and then a return to the hand.
4. Preserve normal vertical page scrolling on Android Chrome and iOS Safari.
5. Preserve the existing desktop/tablet scorer and all scoring behaviour.

## Mobile information order

After the shared site header and short hand intro:

1. **Game status summary**
2. **Arrange the tiles**
3. Winning-tile question when applicable
4. Flowers & Seasons
5. Current score / detected explanations

The existing full Game status controls may remain in the desktop side column. On mobile, show a compact summary before tile entry:

- player / seat Wind
- prevailing Wind
- Winner or Not winner
- winning method when relevant
- for a standalone hand, a clear **Change game status** action may scroll to the existing editable Game status controls if extracting those controls would make the change unnecessarily large

Do not duplicate interactive inputs with the same test IDs.

## Inline mobile tile picker

On screens below the existing `sm` breakpoint, the separate full-size desktop Tile bank should not be the primary tile-entry interaction.

Render a compact tile picker **inside the currently active destination**:

- selected normal set
- Remaining tiles
- irregular special layout

The picker should appear directly below the tiles/placeholders in that active area.

### Picker contents

- small `Choose a tile` heading
- visible destination label, e.g. `Adding to Set 2`, `Remaining tiles`, or `Special layout`
- horizontally scrollable family tabs: Characters, Bamboo, Circles, Winds, Dragons
- horizontally scrollable single row of valid tile SVG buttons
- reuse the existing `visibleTiles`, `addTile`, validation/copy-limit logic and active-suit state
- no duplicate rule engine or tile validation

Use distinct mobile test IDs, e.g. `mobile-button-suit-*` and `mobile-button-add-tile-*`, so the existing desktop controls can remain in the DOM without duplicate test IDs.

The desktop Tile bank remains unchanged and visible from `sm` upward. It may be hidden visually below `sm` once the inline picker is working.

## Active destination

The selected set/Remaining tiles card should remain visually distinct. The mobile picker itself should reinforce the destination in text rather than relying on colour.

Do not auto-scroll the whole page when a tile is chosen. Keep the user's current hand area stable.

## Completed sets

It is acceptable to make completed set cards slightly more compact on mobile, but do not collapse information or hide the set type / concealment state.

## Explicit non-goals

- no fixed bottom tray in this version
- no `display: contents`
- no CSS `:has()` layout re-parenting
- no scorer-model or scoring-rule changes
- no desktop redesign
- no persistence changes

## Acceptance criteria

### Android/mobile behaviour

- full hand scorer remains vertically scrollable from top to bottom
- Game status summary appears before Arrange the tiles
- initial Set 1 is active and has the mobile picker immediately beneath it
- selecting another set moves the picker to that set
- changing Pung/Chow/Kong/Pair still filters valid representative tiles correctly
- one-Chow restriction still works
- Remaining tiles can be selected and populated from its inline picker
- irregular special layout can be populated from its inline picker
- physical copy limits and 13/14 structural validation remain unchanged
- winning-tile provenance still works
- Flowers/Seasons remain reachable
- Current score and Apply/Leave controls remain reachable
- no content is covered by a fixed panel

### Desktop

- current two-column scorer and full Tile bank are unchanged from `main`

### Verification

Run:

```sh
pnpm --filter @workspace/mahjong-scorer test
pnpm run typecheck
PORT=5000 BASE_PATH=/ pnpm run build
```

Then perform a rendered smoke test at a narrow Android-like viewport. The PR must not be merged until the full page can be scrolled and the inline picker is visually confirmed.

## Product principle

**Keep the tiles beside the thing the player is building.**
