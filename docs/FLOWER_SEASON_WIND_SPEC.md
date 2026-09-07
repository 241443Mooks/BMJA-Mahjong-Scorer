# Flower, Season and Wind relationship — learner UX spec

## Purpose

Make the relationship between **Flowers, Seasons and the player's seat Wind** obvious to a beginner without requiring them to memorise a scoring table.

This should be implemented in the same simple, visual style as the beginner guide and special-hand catalogue, using the existing shared Mahjong SVG artwork.

## Rule to teach

Each Flower and each Season is permanently associated with one Wind:

| Number | Wind | Flower | Season |
| --- | --- | --- | --- |
| 1 | East | Plum | Spring |
| 2 | South | Orchid | Summer |
| 3 | West | Chrysanthemum | Autumn |
| 4 | North | Bamboo | Winter |

The relationship is based on the player's **own/current seat Wind**, not the prevailing Wind.

A matching own Flower gives **1 double**.

A matching own Season gives **1 double**.

Flowers and Seasons remain bonus tiles: they are set aside and replaced and do not count toward the normal 13/14-tile structural hand.

If a player has all four Flowers, the Flower set gives **two doubles in total**. Likewise, all four Seasons gives **two doubles in total**.

## Beginner guide change

Add a short visual section titled:

## Matching Flowers and Seasons

Suggested learner-facing copy:

> In British Mahjong, every Flower and Season belongs to one Wind.
>
> If the tile matches **your own seat Wind**, it gives an extra double.

Show the four mappings visually using the existing SVG tiles. Prefer four compact cards or a 2 × 2 grid on wider screens, stacked cleanly on mobile.

### East

- Flower 1 — **Plum**
- Season 1 — **Spring**

### South

- Flower 2 — **Orchid**
- Season 2 — **Summer**

### West

- Flower 3 — **Chrysanthemum**
- Season 3 — **Autumn**

### North

- Flower 4 — **Bamboo**
- Season 4 — **Winter**

Each card should show:

- Wind name
- Flower SVG + name
- Season SVG + name
- a small caption such as **Matches East**, **Matches South**, etc.

Add a short note beneath the visual:

> Your matching Flower and matching Season each give **1 double**.
>
> This uses your **seat Wind**, not the prevailing Wind.

Optional secondary note:

> All four Flowers, or all four Seasons, give **two doubles in total** for that complete set.

Do not over-explain bouquet terminology in the main learner flow unless it improves clarity. The visual relationship is the priority.

## Hand scorer change

The current Flower and Season selectors should not rely on image recognition alone.

Keep the SVG tile as the primary visual control, but add visible learner-friendly names.

### Flowers

- **Flower 1 — Plum (East)**
- **Flower 2 — Orchid (South)**
- **Flower 3 — Chrysanthemum (West)**
- **Flower 4 — Bamboo (North)**

### Seasons

- **Season 1 — Spring (East)**
- **Season 2 — Summer (South)**
- **Season 3 — Autumn (West)**
- **Season 4 — Winter (North)**

The exact layout may be compact, but the name must be visible without requiring hover, a tooltip or prior knowledge of the artwork.

## Context-aware enhancement

Where the scorer already knows the player's seat Wind, visually identify the matching bonus tiles.

Preferred treatment:

- subtle border or background emphasis
- small badge: **Own Flower** or **Own Season**
- preserve the existing selected/unselected state clearly

Do not make the own-Wind treatment look like the tile has already been selected.

Example for a South player:

- Flower 2 — Orchid: badge **Own Flower**
- Season 2 — Summer: badge **Own Season**

This should teach the scoring relationship while the player is entering the hand.

## Shared data / implementation principle

Do not hard-code the Wind relationship independently in multiple components.

Create or extend one shared metadata source for the eight bonus tiles containing at least:

- tile identity
- category: flower / season
- number: 1–4
- display name
- associated Wind
- SVG artwork key/path

The beginner guide and scorer should render from this same mapping.

This mapping should also be reusable later by:

- detected-pattern explanations
- end-game reports
- generated scoring breakdowns
- accessibility labels

## Accessibility

Every bonus tile image must have meaningful accessible text, for example:

- `Flower 1, Plum, East`
- `Season 3, Autumn, West`

The Wind relationship must not be communicated by colour alone.

Touch targets should remain large enough for mobile play.

## Mobile UX

The scorer is commonly used at the table on a phone.

On narrow screens:

- avoid long single-line labels that force horizontal overflow
- allow the image and label to stack if needed
- keep all four Flowers and all four Seasons easy to scan
- preserve a clear selected state

A compact card such as the following is acceptable:

> [tile SVG]
> **Plum**
> Flower 1 · East

## Acceptance criteria

- [ ] Beginner guide visually explains the 1–4 Flower/Season ↔ Wind mapping.
- [ ] Guide states that the relationship uses the player's seat Wind, not the prevailing Wind.
- [ ] Guide explains that matching own Flower and own Season each give 1 double.
- [ ] Guide retains the existing explanation that Flowers/Seasons are bonus replacement tiles.
- [ ] Guide includes a concise note about all four Flowers / all four Seasons giving two doubles in total.
- [ ] Hand scorer shows a visible name for every Flower and Season SVG.
- [ ] Hand scorer displays the associated Wind for each bonus tile.
- [ ] When seat Wind is known, own Flower / own Season are visually identified without appearing pre-selected.
- [ ] Guide and scorer use one shared bonus-tile metadata mapping rather than duplicated rule data.
- [ ] Mobile layout remains compact and usable.
- [ ] Accessible labels contain tile type, name and associated Wind.

## Product principle

**Teach the relationship at the moment it is useful.**

A beginner should be able to look at the guide or the scorer and immediately understand why a particular Flower or Season matters to their Wind.