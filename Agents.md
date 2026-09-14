# Mahjong Reference — agent instructions

## Start here
- Work from the issue or PR named in the task. Treat that as the execution authority.
- Inspect the current code and existing work before changing anything.
- Do not scan the whole repository by default. Start with the files and authority sources named by the issue/PR, then expand only when evidence requires it.
- Do not read historical planning by default. Open extra authority docs only when the task needs them:
  - product direction: `docs/product/TABLE_COMPANION_TRANSFORMATION.md` and issue #105;
  - documentation authority: `docs/README.md`;
  - rules/scoring changes: `BMJA_RULES_REFERENCE.md`, `artifacts/mahjong-scorer/SCORING_AUDIT.md` and relevant `docs/rules/` evidence.

## Repository
- GitHub is the source of truth.
- Production: https://mahjong.smooks.co.uk
- Frontend package: `artifacts/mahjong-scorer` in a pnpm monorepo.
- Do not use Replit for development or hosting.
- Keep the product browser-local and simple unless the task explicitly requires infrastructure.

## Product guardrails
- Build for the **quiet fifth person at the table**: show what the player needs next; do not make them manage the page.
- Beginner first. Use plain player-facing language.
- Explain rather than guess. Unknown evidence stays unknown and scores conservatively.
- Mahjong Reference is the brand; **Your Mahjong table companion** is the proposition.
- Public UI says `Rules`; internal versioned profile IDs are implementation/provenance detail.
- Keep British-only learning explicitly British.
- Never silently change the rules/profile of an active or recovered game.
- Do not invent or silently change a Mahjong rule. Update tests and rules evidence when rule behaviour changes.

## Development
- Keep each change bounded to the named task. Do not perform unrelated refactors.
- Preserve manual numeric scoring compatibility and exact rules/profile version identity in saved games and records.
- Prefer existing canonical tile/hand models and shared learner copy over parallel implementations.
- Reuse existing deterministic scripts and test infrastructure instead of creating parallel tooling unless the task proves the existing path is insufficient.
- Do not reopen settled product/rules decisions merely to explore alternatives unless current evidence contradicts them.
- Do not merge to `main` automatically unless explicitly asked.

## Verification
Use targeted tests while developing. Before a PR is ready to merge, run from the repository root:
- `pnpm test`
- `pnpm run typecheck`
- `PORT=5173 BASE_PATH=/ pnpm run build`

`PORT` and `BASE_PATH` are required by the Vite configuration; a bare `pnpm run build` is not the canonical production-build check.

## History
- `CHANGELOG.md` records meaningful product and maintenance changes, not every commit.
- When a merged PR materially changes the product or future maintenance, add one concise entry under **Unreleased**.
- Do not add changelog entries for typo fixes, test-only churn, routine refactors or other implementation noise.
- Working branches are temporary; durable history belongs in `main`, merged PRs/issues, the changelog and canonical docs.
