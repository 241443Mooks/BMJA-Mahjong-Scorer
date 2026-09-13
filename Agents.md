# Mahjong Reference — repository instructions

## Repository
- GitHub is the source of truth.
- Production: https://mahjong.smooks.co.uk
- Do not use Replit for development or hosting.
- Frontend package: `artifacts/mahjong-scorer`.
- pnpm monorepo.
- Keep the product browser-local and simple unless an issue explicitly requires infrastructure.

## Current product authority
Before substantial product/frontend work, read:
- `docs/README.md` — documentation authority map;
- `docs/product/TABLE_COMPANION_TRANSFORMATION.md` — current Table Companion direction;
- GitHub issue #105 — implementation slices and dependencies.

Do not let older British-only product/content planning override the current #105 direction.

## Verification
Run:
- `pnpm --filter @workspace/mahjong-scorer test`
- `pnpm run typecheck`
- `pnpm run build`

Prefer targeted tests while developing; run the full verification before a PR is ready to merge.

## Product principles
- Beginner first.
- Explain the game; do not make the player learn the scoring engine.
- Infer rules/patterns where the entered tiles provide enough evidence.
- Ask only for facts the scorer cannot infer.
- Unknown evidence scores conservatively.
- Mobile usability matters.
- Mahjong Reference is the brand; Table Companion is the proposition.
- Public UI should say `Rules`; internal versioned profile IDs remain implementation/provenance detail.
- Never silently change the rules/profile of a recovered or active game.

## Rules
- `BMJA_RULES_REFERENCE.md` is the engineering rules source of truth for BMJA behaviour.
- `artifacts/mahjong-scorer/SCORING_AUDIT.md` records scoring coverage/interpretation.
- `docs/rules/` contains durable multi-profile evidence and provenance.
- Do not invent or silently change a Mahjong rule.
- Update tests and rules documentation when rule behaviour changes.
- Keep canonical pattern identity separate from profile-local catalogue membership, names, values and provenance.

## Development
- Work from the issue/PR named in the task.
- Do not perform unrelated refactors.
- Inspect existing work before implementing anything.
- Preserve manual numeric scoring compatibility.
- Prefer shared canonical tile/hand models and shared learner copy.
- Preserve exact profile/version identity in saved games and records.
- Do not merge to `main` automatically unless explicitly asked.
