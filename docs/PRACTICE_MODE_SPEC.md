# Solo Practice Mode — Lightweight Product and Technical Spec

## Status

Tentative future capability. This is **not** a near-term implementation commitment.

The purpose of this document is to preserve the idea and define the lowest-cost, lowest-complexity route if the project later adds playable British Mahjong practice.

## Product idea

Add a future homepage option:

> **Practice Mahjong**  
> Play a British-rules hand against three computer players and learn as you go.

The practice mode should be a **patient practice table**, not an attempt to build a full commercial online Mahjong platform.

Its primary purpose is learning British Mahjong gameplay:

- draw and discard confidently
- understand legal claims
- practise Pungs, Kongs and the one-Chow rule
- understand Flowers and Seasons
- recognise when a hand is close to Mah Jong
- see how East and the prevailing Wind affect the game
- learn scoring and settlement from real played examples

The existing scorer remains the authority for hand scoring and settlement.

---

# Core principle

> **Do not build a server when the browser can run the whole game.**

The cheapest useful version should be entirely client-side.

No account, database, multiplayer server, WebSocket service, AI API or paid compute should be required.

The browser should hold:

- the wall
- all four hands
- discards
- exposed sets
- bonus tiles
- turn state
- legal actions
- bot decisions
- game progression
- scoring
- practice-game persistence

For solo play, there is no technical reason for an authoritative remote game server.

---

# Recommended architecture

## 1. Keep the existing web stack

Use the current React/Vite/TypeScript application and Cloudflare static hosting.

Do **not** introduce a second application stack just for practice mode.

Suggested internal shape:

```text
Practice UI
    ↓
Practice game state / reducer
    ↓
British gameplay rules
    ↓
Existing canonical hand model
    ↓
Existing scorer + settlement + progression
```

The important architectural decision is to keep **gameplay mechanics** separate from the existing **scoring rules**.

The practice engine decides what happened during play. The scorer decides what that completed state is worth.

## 2. Pure local state

The first version should use normal in-memory application state plus the same versioned `localStorage` approach planned for issue #14.

Persist enough information to resume a practice hand after refresh:

- wall order or deterministic seed
- current wall position
- four player hands
- exposed sets
- Flowers/Seasons
- discards
- current turn
- East / seat Winds
- prevailing Wind
- any pending claim decision
- hand history required for scoring event conditions

No cloud save is needed.

## 3. Reuse the canonical tile and hand model

Do not create a second incompatible set of Mahjong tile identifiers.

The practice engine should use the same tile identities and hand structures as the scorer wherever practical.

At the end of a hand it should be possible to transform the played state directly into the scorer's existing `MahjongHand` / context model rather than reconstructing the hand from display data.

## 4. Reuse the chosen SVG tile assets

The practice table should use the same locally vendored 42-tile SVG set selected in `docs/TILE_ASSET_DECISION.md`.

There should be one visual tile system across:

- hand scoring
- worked examples
- special-hand catalogue
- practice mode
- game reports

---

# Explicit non-goals for the first version

Do **not** initially build:

- human-v-human online multiplayer
- matchmaking
- accounts
- leaderboards
- chat
- spectators
- cloud saves
- an external AI service
- machine-learning bots
- a backend game server
- real-time networking
- complex animations
- 3D tiles
- voice control
- competitive bot difficulty tiers

Any of those can be reconsidered later if real usage justifies the additional complexity and cost.

---

# Why not import a complete existing Mahjong server?

There are useful open-source reference implementations, but most solve a larger problem than this project currently needs.

For example, `igncp/mahjong` is an MIT-licensed Hong Kong Mahjong engine and web application with game mechanics, AIs, a persistent service, HTTP API, WebSockets and a web client.

Reference:

- https://github.com/igncp/mahjong

Its architecture is valuable to study, particularly the separation of game mechanics and AI, but importing its server architecture would add Rust, networking, persistence and deployment concerns that a solo British practice mode does not need.

If specific MIT-licensed algorithms or design ideas are later reused, retain the required licence notice and document what was adopted.

`Pomax/mahjong` is also useful as a behavioural and UX reference for browser-based play against computer players, but no code should be copied unless its licensing position is explicitly established.

**Default position:** learn from existing engines; build the smallest TypeScript game loop around the scoring engine we already own.

---

# Minimum viable practice mode

The first genuinely useful release does not need a full four-Wind game.

## Phase 1 — Play one hand against three bots

The smallest complete loop is:

1. create and shuffle a British Mahjong wall
2. allocate seats and deal
3. replace Flowers/Seasons correctly
4. player draws
5. player chooses a discard
6. bots take turns automatically
7. legal claims are detected
8. player is offered only legal claims
9. bots may make legal claims
10. Kongs trigger replacement draws
11. continue until Mah Jong or wash-out
12. send the completed state into the existing scorer
13. show the score and explain what happened
14. offer **Play another hand**

That alone would be a worthwhile learning tool.

## Phase 2 — Add teaching assistance

Once the game loop is reliable, add optional learner help.

Examples:

> **You can Pung this tile.**  
> Claiming it will expose the set.

> **You can make a Kong.**  
> A replacement tile will be drawn after the Kong is declared.

> **Suggested discard: 7 Characters**  
> This keeps more useful ways to improve your hand.

Assistance should be explainable and deterministic. It should not pretend to know the objectively perfect move.

Suggested labels:

- `Suggested`
- `Why?`
- `Show legal moves`

Never label a heuristic recommendation as **Best move** unless the project later has an engine capable of proving that claim.

## Phase 3 — Full round / game practice

Only after single-hand practice works well:

- retain East after an East win
- retain East after a draw where required
- rotate seats after other wins
- advance prevailing Wind
- use existing settlement logic
- maintain running balances
- feed the same ledger used by the normal score-a-game flow
- generate the same end-of-game report

At this point practice mode becomes a natural way to generate realistic scorer examples and reports.

---

# Bot design: deliberately simple

The computer players should **not** call ChatGPT, another LLM or any external AI API.

That would add latency, nondeterminism and ongoing cost without improving the first learning experience enough to justify it.

## MVP bot goal

Bots need to be:

- legal
- reasonably quick
- plausibly human
- predictable enough to test
- good enough that the table keeps moving

They do not need to be expert players.

## Simple discard heuristic

A first bot can score each possible discard using local hand features such as:

- preserve completed Pungs / pairs / useful sequences
- preserve strong two-tile sequence fragments
- prefer connected suited tiles over isolated tiles
- value pairs
- value own / prevailing Wind and Dragon pairs or sets
- reduce isolated honours when they have little current value
- respect the British maximum-one-Chow rule
- prefer actions that reduce estimated distance from a legal winning structure

The chosen discard is the legal option with the strongest heuristic score, with deterministic or seeded tie-breaking.

## Claims

Initial bot claim logic can also be conservative:

- declare Mah Jong whenever legal
- take a Kong when clearly useful and legal
- take a Pung when it materially improves the hand
- take a Chow only when legal and sufficiently useful
- otherwise pass

More sophisticated strategy can come later.

## Special hands

The first bot does **not** need to intentionally pursue every named special hand.

However, if a bot happens to complete one, the existing scorer should recognise and score it correctly.

Later versions could detect promising special-hand starting shapes and alter strategy accordingly.

---

# Legal-action engine

A clean practice mode should generate legal actions rather than let the UI infer them independently.

Conceptually:

```ts
getLegalActions(gameState, playerId)
```

could return actions such as:

```ts
[
  { type: 'discard', tile: ... },
  { type: 'pung', tile: ... },
  { type: 'kong', ... },
  { type: 'chow', ... },
  { type: 'mahjong', ... },
  { type: 'pass' }
]
```

The UI should render those actions. It should not contain a second set of gameplay legality rules.

This makes bot play, human play and tests all use the same rules.

---

# Game state should be replayable

Prefer game state changes represented as explicit actions/events rather than arbitrary component mutations.

Examples:

```text
DEAL
DRAW
BONUS_REPLACED
DISCARD
PUNG_CLAIMED
CHOW_CLAIMED
KONG_DECLARED
KONG_REPLACEMENT_DRAWN
MAHJONG_DECLARED
HAND_DRAWN
```

This provides several benefits:

- undo/debugging is easier
- persistence is simpler
- event-based special hands can be verified from actual play history
- reports can explain what happened
- deterministic tests can replay complete hands

This is particularly useful for specials such as Earth's Blessing and Twofold Fortune because practice mode can know the sequence directly rather than asking the player afterwards.

---

# Learning UX

The table should prioritise clarity over realism.

Suggested mobile layout:

```text
Prevailing Wind · Your seat · Wall remaining

Opponent summary
Opponent summary        Opponent summary

            discards / table

Your exposed sets
Your Flowers / Seasons

Your hand

Contextual action buttons
```

The learner should never need to interpret a disabled button to understand what they can do.

Show only currently relevant actions.

Examples:

- `Pung`
- `Kong`
- `Chow`
- `Mah Jong`
- `Pass`

When waiting for the player's discard, make the tiles themselves the action.

## Optional help mode

Practice could eventually have:

- **Just play**
- **Help me learn**

Help mode can explain claims and offer discard suggestions.

The underlying game remains identical.

---

# Relationship to the rest of the product

Practice mode should reuse rather than duplicate existing product capabilities.

## Scorer

At completion, pass the hand into the canonical scorer.

## Rules guide

Explanations such as Chow, Kong or Fishing should deep-link to the relevant learner guide section.

## Special-hand catalogue

When a special is detected:

> **You made Thirteen Unique Wonders — 1,000**
>
> Learn about this hand →

## Report

A completed practice round/game should be able to use the same report model as a real scored game.

## Homepage

Do not add **Practice Mahjong** to the public homepage until the mode is usable.

When it exists, it becomes a natural third primary action alongside:

- Score a game
- Score a hand
- Practice Mahjong

---

# Dependencies and sensible order

Practice mode should come after the core scorer is stable.

Important foundations:

1. **#15 — arbitrary unfinished hands / correct tile-count model**  
   Establishes a reliable representation of real in-progress holdings.

2. **#14 — local persistence**  
   Provides the storage pattern practice mode should reuse.

3. **#5 — rules / learner content**  
   Supplies gameplay explanations and identifies any remaining gameplay-rule ambiguities.

4. **#6 — report model**  
   Allows practice games to end in the same useful explanatory output.

Issue #7 shared inventory is related conceptually, but practice mode will inherently own a complete physical wall and therefore should not depend on the manual scorer's inventory-warning implementation.

---

# Cost model

## Ongoing infrastructure

Target: **effectively no incremental application infrastructure cost** beyond the existing static site.

The browser performs:

- shuffling
- gameplay
- legal-move calculation
- bots
- scoring
- persistence

Cloudflare serves only the same static JavaScript, CSS, HTML and tile assets already required by the web application.

There is no per-game API or compute bill.

## Development cost

The largest cost is engineering time, so scope control matters more than infrastructure optimisation.

The cheapest route is:

- one-hand solo mode first
- simple deterministic bots
- existing UI components where possible
- no networking
- no separate backend
- no ML
- no multiplayer abstraction until there is evidence it is wanted

---

# Testing strategy

The game engine should be testable without rendering React.

Minimum deterministic tests should cover:

- wall composition
- seeded shuffle / deterministic fixtures
- initial deal
- Flower/Season replacement
- normal draw/discard cycle
- legal Pung claim
- legal Kong and replacement draw
- British Chow restriction
- prohibited claims
- tile-count integrity
- maximum four copies of standard tiles
- Mah Jong detection
- wash-out
- event history
- conversion into scorer model
- scoring a completed practice hand through the existing scorer
- East / prevailing progression once full-game mode exists
- save / restore of an in-progress practice hand
- deterministic bot choices for fixed fixtures

Add replay fixtures for real or carefully constructed hands so failures can be reproduced exactly.

---

# Research references

Useful references to inspect rather than automatically adopt:

## igncp/mahjong

https://github.com/igncp/mahjong

MIT-licensed Hong Kong Mahjong game engine and web application. Useful for studying game-state separation, AI design, simulations and legal game mechanics. Its server/WebSocket architecture is intentionally **not** the proposed architecture for our solo mode.

## Pomax/mahjong

https://github.com/Pomax/mahjong

Useful browser-game and computer-player UX reference, especially Chinese Classical play. Treat as reference-only unless an explicit reusable software licence is established.

---

# Decision

If this capability is built, start with the following smallest experiment:

> **Can one human play one complete British Mahjong hand against three deterministic browser bots, entirely locally, and finish with a correctly scored explanatory result?**

If yes, stop and user-test that before building a larger game platform.

That experiment proves almost everything important while committing the project to almost no new ongoing infrastructure.
