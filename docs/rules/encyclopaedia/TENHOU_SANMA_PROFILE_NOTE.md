# Tenhou ranked three-player Mahjong — 251A1 profile-delta note

Status: **formal named Sanma profile identified; no duplicate corpus count added**  
Parent: #251  
Date checked: 18 September 2026

## Source pin

First-party Tenhou manual:

- https://cdn.tenhou.net/man/

Relevant sections:

- `ルール / 段位戦3人打ち` — ranked three-player rules;
- `役一覧` — Tenhou yaku/yakuman/bonus catalogue shared by the rule system.

## Formal three-player delta

Tenhou's manual explicitly states that its three-player section lists differences from ranked four-player play. The source-local delta includes:

- 35,000 starting points / 40,000 return;
- placement uma +20 / 0 / -20;
- eight rinshan tiles;
- 2–8 manzu removed;
- 1-man / 9-man dora wrap rule;
- chi unavailable;
- North is nuki-dora;
- North cannot be extracted immediately after pon;
- extraction is treated like a call for effects including ippatsu / chiihou / nine-terminals abort / double-riichi interruption;
- an extracted North can be won on beyond yakuman-only cases;
- North used in the hand is an ordinary guest wind;
- the manual also states the timing boundary for same-turn reset around added-kan/nuki and rinshan draw.

These facts make Tenhou ranked Sanma a sufficiently bounded **runtime/profile target** for later architecture work.

## Why it is not another counted A1 catalogue

The manual also publishes Tenhou's yaku/yakuman list, but the three-player section is defined primarily as a **delta from the four-player rules**, not as a wholly separate scoring catalogue.

Re-counting the whole inherited Riichi yaku list as a new 40–50-item Encyclopaedia corpus would increase the A1 headline number without adding equivalent knowledge.

Therefore this note records:

```text
formal profile identity       yes
first-party source            yes
Sanma-specific rules delta    yes
separate full concept corpus  no
A1 count increase             0
```

## Encyclopaedia-relevant delta

The most obvious source-local concept for future relationship work is **nuki-dora / extracted North**, but even that should not receive a universal concept ID yet. Its semantics combine:

- tile-set/profile configuration;
- physical extraction evidence;
- bonus-han treatment;
- interruption effects;
- possible ron interaction;
- use of North as a normal guest-wind tile when not extracted.

That is a good later stress case for the universal evidence and relationship model.

## Runtime relevance

Tenhou Sanma is also useful as a future architecture pressure test because it demonstrates that a three-player profile can share the Riichi han/fu scoring grammar while changing:

- tile set;
- seat/table model;
- call capabilities;
- bonus evidence;
- settlement proportions;
- game-end/starting-point configuration.

This is supporting evidence for #227/#229–#234, not a reason to change those tickets during the current preserved Codex-prep branch.

## 251A2 hold

Do not yet equate Tenhou's nuki-dora, yaku or yakuman treatments with EMA Riichi or any future Sanma profile. A2 should compare implemented profile identities and exact semantics after the relevant runtime support exists.
