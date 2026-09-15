# Riichi source register

This file records sources used specifically by the Riichi programme. The global `docs/rules/SOURCE_REGISTER.md` remains the project-wide source model; this local register preserves the exact source/version distinctions needed while Riichi implementation is active.

## `ema-riichi-2025`

**Source:** European Mahjong Association, *Riichi: Rules for Japanese Mahjong*, 2025 edition, August 2025.

**URL:** http://mahjong-europe.org/portal/images/docs/Riichi-rules-2025-EN.pdf

**Authority:** A — formal governing/competition rules source for the named EMA profile.

**Intended use:** normative implementation authority for `riichi-ema-2025` scoring, legality, settlement, progression and core play procedure.

**Licence stated in source:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International.

**Important scope:** this source defines the project's first **EMA 2025 Riichi** profile. It must not be generalised into a claim that every Japanese professional league, online platform or local Riichi group uses identical rules.

**Implementation status:** active research / not yet executable.

**High-value locators:**

- p. 3 — 2025 revision notes
- pp. 6–9 — tile set, setup, dead wall, dora and deal
- pp. 10–15 — winning grammar, claims, kan, tenpai, furiten, riichi, ron/tsumo
- pp. 16–19 — end-of-hand logic, draws, payments, counters, dealer rotation, game end and uma
- pp. 20–22 — scoring procedure, fu and payment formulae
- pp. 23–26 — yaku/yakuman definitions
- pp. 26–28 — official scoring examples
- pp. 32–38 — errors and penalties
- pp. 39–40 — tournament overlay
- p. 42 — official compact yaku list
- p. 43 — official scoring tables

## `ema-riichi-yakulist-2023-secondary`

**Source:** supplied one-page image/PDF titled `Riichi-Yakulist.pdf`, marked `2023 Update`.

**Authority:** secondary learning/indexing aid only for this programme.

**Intended use:** visual familiarisation and cross-checking terminology.

**Do not use for:** resolving any conflict with EMA 2025, determining 2025 scoring thresholds, determining current yaku values/eligibility, or defining the executable profile.

The 2025 rulebook contains its own official compact yaku list on p. 42, which supersedes this sheet for the target profile.

## Source policy

1. EMA 2025 wins any conflict for the initial profile.
2. Common Riichi practice on apps/forums is not authority unless deliberately introduced as a separate named profile.
3. WRC rules may be useful as a later comparison source but must not silently modify EMA behaviour.
4. Project docs/tests should record rule facts and source locators in original wording; do not reproduce long passages/tables from the source unnecessarily.
5. Any future EMA edition must become a new source/version decision; saved games must not silently change mathematics.
