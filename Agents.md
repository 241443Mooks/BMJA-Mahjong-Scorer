# BMJA Mahjong Scorer – Codex instructions

## Repository
- GitHub is source of truth.
- Production: https://mahjong.smooks.co.uk
- Do not use Replit for development or hosting.
- Frontend package: artifacts/mahjong-scorer
- pnpm monorepo.

## Verification
Run:
- pnpm --filter @workspace/mahjong-scorer test
- pnpm run typecheck
- pnpm run build

Prefer targeted tests while developing; run the full verification before a PR is ready to merge.

## Product principles
- Beginner first.
- Explain the game; do not make the player learn the scoring engine.
- Infer rules/patterns where the entered tiles provide enough evidence.
- Ask only for facts the scorer cannot infer.
- Unknown evidence scores conservatively.
- Mobile usability matters.
- Keep architecture browser-local and simple unless an issue explicitly requires otherwise.

## Rules
- BMJA_RULES_REFERENCE.md is the engineering rules source of truth.
- SCORING_AUDIT.md records scoring coverage/interpretation.
- Do not invent or silently change a Mahjong rule.
- Update tests and rules documentation when rule behaviour changes.

## Development
- Work from the issue/PR named in the task.
- Do not perform unrelated refactors.
- Inspect existing work before implementing anything.
- Preserve manual numeric scoring compatibility.
- Prefer shared canonical tile/hand models and shared learner copy.
- Do not merge to main automatically unless explicitly asked.
