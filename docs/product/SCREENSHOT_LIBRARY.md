# Mahjong Reference product screenshot library

## Purpose

The deterministic screenshot generator is the canonical source for reusable real-product captures used across Mahjong Reference.

The library is not owned by one page. `/help`, `/how-it-works`, onboarding, product documentation and later product-led content should reuse the same generated states where they tell the truth about the same interaction.

Generate with:

```bash
pnpm --filter @workspace/mahjong-scorer screenshots:help
```

The command and `public/help/screenshots/` path retain their existing names for compatibility. Do not create a second screenshot pipeline merely to make the naming more generic.

## Rules

- Capture real rendered product UI only.
- Reach states deterministically from seeded state and/or normal UI interactions.
- Do not hand-crop or manually edit generated PNGs.
- Prefer reuse to near-duplicate families.
- Capture an image only when it teaches or demonstrates a useful product state or interaction.
- Keep static rules/reference teaching as HTML where a screenshot adds no interaction value.
- Do not change scoring, rules, settlement or game behaviour for screenshot convenience.
- Visually review generated captures; file existence alone is not acceptance.

## Current core catalogue

| Family | Demonstrates | Scope | Viewports | Current/expected consumers |
| --- | --- | --- | --- | --- |
| `game-setup` | Rules choice, player seats and starting a game | Product-global | Mobile / tablet / desktop | Help, How It Works |
| `game-table-score-entry` | Active table workspace and score entry after confirmed history | Product-global | Mobile / tablet / desktop | Help, How It Works |
| `hand-builder-ordinary` | One working picker and **Hand so far** | Rules-aware hand scorer | Mobile / tablet / desktop | Help, How It Works |
| `partial-losing-hand` | Partial losing-hand entry and Remaining tiles | Rules-aware hand scorer | Mobile / tablet / desktop | Help / User Guide |
| `hand-winning-tile` | Winning-tile interaction | Rules-aware hand scorer | Mobile / tablet / desktop | Help / User Guide |
| `hand-score-result` | Clean calculated score result | Rules-aware hand scorer | Mobile / tablet / desktop | How It Works, User Guide |
| `hand-score-breakdown` | Explanation / **Why this hand scores** | Rules-aware hand scorer | Mobile / tablet / desktop | Help, How It Works |
| `game-settlement-preview` | **Who pays whom** before confirming the hand | Rules-aware game settlement | Mobile / tablet / desktop | How It Works, User Guide |
| `game-ledger-settlement` | Confirmed game history and settlement record | Rules-aware game record | Mobile / tablet / desktop | Help, How It Works |
| `print-save` | Full game record / game summary choices | Product-global | Mobile / tablet / desktop | Help, How It Works |

These ten are core journey states, so three responsive variants are intentional. Future families do not automatically require all three viewports.

## Reuse notes

- `game-setup` is the default visual for How It Works **Choose the rules your table uses**.
- `hand-builder-ordinary` is the default visual for **Enter the hand**.
- `hand-score-result` and `hand-score-breakdown` are deliberately separate: one shows the answer; the other explains it.
- `game-settlement-preview` must remain a pre-confirmation state. Do not substitute confirmed ledger history for **Who pays whom**.
- `game-table-score-entry` may represent **Carry on to the next hand** when the visible capture clearly shows updated balances and East/Wind context from the seeded confirmed history.
- `game-ledger-settlement` represents **Look back at the game**.
- `print-save` represents **Keep a copy**.

## Candidate User Guide extensions

Add these only when the guide structure proves the screenshot materially helps the task:

| Candidate | Why it may be useful | Add when |
| --- | --- | --- |
| Table tools | Shows where less-frequent game actions live | A guide task needs the menu rather than an individual action capture |
| Recovered in-progress game | Explains what happens after refresh/reopen | Recovery becomes a first-class User Guide task |
| Detailed score returned to table | Connects Hand scorer → current table | The User Guide documents this transition explicitly |
| Undo/correct confirmed hand | Recovery from an input mistake | The current correction workflow is documented and stable |
| Flowers / Seasons | Shows bonus-tile entry | Text alone proves insufficient for player guidance |
| Special-hand entry | Shows the special-layout interaction | A task guide needs interaction guidance rather than the existing reference catalogue |
| Completed game / final record | Shows end-of-game state | It adds information not already conveyed by ledger + Print/Save |

Before creating a new family, write down what the existing catalogue cannot truthfully demonstrate.

## Adding a family

For each new family record:

1. the player task/state it demonstrates;
2. how the state is reached deterministically;
3. which viewport variants are actually useful;
4. whether the image is product-global or rules/profile-specific;
5. which consumer(s) need it.

Use stable descriptive filenames. Where only selected viewport variants are useful, update generator verification accordingly rather than creating decorative duplicates.

## Relationship to product work

- Issue #161 owns this reusable generated library.
- Issue #163 consumes the library for the visual How It Works journey.
- Issue #179 consumes and extends it for the User Guide when a real visual gap is demonstrated.
- Issue #171 handles final crawl/alt-text/image-discovery treatment at the page-consumer layer; it does not create a separate screenshot system.
