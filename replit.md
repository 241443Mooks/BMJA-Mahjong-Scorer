# British Mahjong Scorer

A frontend-first TypeScript app for entering and scoring British Mahjong hands with a detailed BMJA-style breakdown.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/mahjong-scorer run dev` — run the scoring app
- `pnpm --filter @workspace/mahjong-scorer test` — run scoring engine tests
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The scorer itself needs no environment variables, database, or API.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React + Vite frontend; Vitest scoring tests
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mahjong-scorer/src/scoring/` — pure hand model, rule functions, special-hand detectors, tests, and score orchestration
- `artifacts/mahjong-scorer/src/game/` — pure BMJA settlement, progression, ruleset boundary, ledger replay, game UI, and tests
- `artifacts/mahjong-scorer/src/App.tsx` — manual hand-entry UI

## Architecture decisions

- Manual entry and future recognition must both produce the canonical `MahjongHand` type.
- Every scoring rule is a named pure function that returns an itemised `RuleResult`.
- Special hands are independent detectors and do not mutate standard scoring.
- Keep hand scoring, round settlement, game progression, and ledger replay as separate layers.
- A hand score is an input to settlement, never a payment amount by itself.
- Undo game history by replaying confirmed round inputs from the original setup.
- BMJA is selected through the game ruleset boundary; do not add alternate-rule branches inside game orchestration.

## Product

The app supports detailed single-hand scoring plus an in-memory four-player BMJA game ledger with numeric score entry, settlement, East/seat rotation, prevailing-wind progression, and replay-based undo.

## User preferences

- Prioritise correctness, simplicity, and maintainability over visual polish.
- Do not add accounts, authentication, a database, subscriptions, remote multiplayer, photo recognition, or alternate rulesets unless explicitly requested.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
