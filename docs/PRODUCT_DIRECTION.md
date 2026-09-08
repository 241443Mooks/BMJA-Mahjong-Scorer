# Product direction

This document captures a possible long-term direction for mahjong.smooks.co.uk. It is **not a committed delivery roadmap**. Its purpose is to help future product and architecture decisions avoid unnecessarily closing off useful options.

## Current product: free scorer

The current product is primarily a scoring utility.

Its core job is:

> **What does this Mahjong hand score?**

The free scorer should remain simple, useful and accessible without requiring an account.

Possible characteristics of this layer include:

- no account required;
- fast hand scoring;
- beginner-friendly guidance;
- British Mahjong as the initial ruleset;
- printable/shareable game results;
- local or anonymous use wherever practical.

## Future paid product: Mahjong companion

A later paid product could extend the scorer into a persistent Mahjong companion rather than simply adding more scoring features.

Its core job would become:

> **Run our Mahjong games for us.**

Possible features include:

- installable app / PWA experience;
- user accounts;
- saved games;
- persistent player profiles;
- game and scoring history;
- regular groups / tables;
- statistics;
- saved preferences;
- multiple Mahjong rulesets;
- configurable house rules.

The paid value should come primarily from persistence, collaboration, history and richer game management rather than charging users simply because they play a different ruleset.

## Shared table / collaborative scoring

A strong intermediate step between the current scorer and full online Mahjong would be a shared-table mode.

Example flow:

1. One player starts a game.
2. The app generates a short join code, link or QR code.
3. Other players join the same game from their own phones.
4. Everyone can see the shared game state, including round, prevailing wind, seat winds, running totals and hand history.
5. A player enters a completed hand or result.
6. The result is confirmed if needed and the shared totals update for everyone.

This provides meaningful multiplayer value without requiring the system to simulate the whole physical Mahjong game.

## Future possibility: online play

Full online Mahjong is a separate and substantially larger product capability.

It would require, among other things:

- a game engine;
- tile-wall generation and dealing;
- turn management;
- discard and claim handling;
- hidden/private hand state;
- rule enforcement;
- real-time state synchronisation;
- reconnect/recovery behaviour;
- validation of legal moves;
- multiplayer UX;
- potentially timers, invitations and matchmaking.

This should not be treated as a small extension of shared scoring. It is a later product direction that can remain optional.

## Ruleset architecture

The scorer should increasingly treat the ruleset as an explicit input rather than assuming British Mahjong globally.

Conceptually:

```text
Game
 ├── players
 ├── rounds / hands
 ├── current state
 └── ruleset
       ├── British Mahjong
       ├── Hong Kong
       ├── Riichi
       ├── MCR
       └── custom / house-rule switches
```

The initial implementation does not need to support all of these rulesets. The architectural goal is simply to avoid making British Mahjong assumptions unnecessarily difficult to separate later.

House rules should be represented as configuration where practical rather than as duplicated or forked scoring logic.

## Architectural implications worth preserving now

Future-proofing should remain proportionate. The current scorer should not become more complicated just to serve hypothetical features.

However, where the cost is small, the following choices are worth preserving:

1. **Explicit ruleset** — scoring logic should receive or resolve a defined ruleset rather than assuming one globally.
2. **Stable IDs** — games, hands and players should have stable identifiers even if they currently exist only in local browser state.
3. **Separated scoring logic** — scoring rules should remain separate from the UI used to collect hand information.
4. **Configurable house rules** — optional variations should use configuration rather than code forks where practical.
5. **Anonymous use remains possible** — future accounts should add persistence and collaboration, not become mandatory for basic scoring.
6. **Local-first remains viable** — simple single-device use should continue to work without depending on future multiplayer infrastructure.

## Possible product ladder

| Layer | Core value | Examples |
| --- | --- | --- |
| Free scorer | Score this hand | Hand scoring, guidance, printable/shareable result |
| Paid companion | Remember and manage our games | Saved games, player history, groups, statistics, multiple rulesets |
| Shared table | Run this physical game together | Join code/QR, shared state, live totals, collaborative scoring |
| Online play | Play Mahjong remotely | Full digital table, private hands, turns, claims and rule enforcement |

## Product principle

The current scorer should be able to remain the anonymous, single-device mode of the future product.

Future capability should grow around it rather than requiring the useful simple product to be replaced.
