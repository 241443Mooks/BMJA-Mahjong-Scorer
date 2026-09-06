# British Mahjong Scorer

A TypeScript web app for scoring British Mahjong hands and complete four-player games using BMJA-style rules. It supports manual or calculated hand scores, itemised scoring breakdowns, round settlement, game progression, a ledger, and undo.

## Published app

https://british-mahjong-scorer.replit.app

## Run locally

This is a pnpm workspace. From the repository root:

```sh
pnpm install
pnpm --filter @workspace/mahjong-scorer run dev
```

## Test and verify

```sh
pnpm --filter @workspace/mahjong-scorer run test
pnpm run typecheck
pnpm run build
```

## Rules coverage

The scorer implements an audited subset of BMJA-style scoring and special hands. BMJA rule coverage is still being completed; known interpretations and outstanding ambiguities are documented in `artifacts/mahjong-scorer/SCORING_AUDIT.md` and `artifacts/mahjong-scorer/GAME_RULES.md`.