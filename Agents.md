# Mahjong Reference — agent instructions

## Start here

- Work from the issue or PR named in the task. Treat that as the execution authority.
- Inspect the current code and existing work before changing anything.
- Do not scan the whole repository by default. Start with the files and authority sources named by the issue/PR, then expand only when evidence requires it.
- Do not read historical planning by default. Open extra authority docs only when the task needs them:
  - product direction: `docs/product/TABLE_COMPANION_TRANSFORMATION.md` and issue #105;
  - documentation authority: `docs/README.md`;
  - structured reference knowledge: `docs/product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md`, `docs/rules/encyclopaedia/` and issue #251;
  - Plus/account work: `docs/product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`, supporting `PLUS_*` docs and issue #206;
  - rules/scoring changes: `BMJA_RULES_REFERENCE.md`, `artifacts/mahjong-scorer/SCORING_AUDIT.md` and relevant `docs/rules/` evidence;
  - rules-platform migration: issue #227, rollout tracker #275 and the **exact normative files named by the active child issue on `integration/rules-platform-v1`**.

## Repository

- GitHub is the source of truth.
- Production: https://mahjong.smooks.co.uk
- Frontend package: `artifacts/mahjong-scorer` in a pnpm monorepo.
- Do not use Replit for development or hosting.
- Keep current free table play browser-local unless the named task explicitly requires infrastructure.

## Branch discipline

- `main` is the production line.
- The completed cross-family rules-platform train is staged on `integration/rules-platform-v1` pending #323 reconciliation and deliberate production promotion.
- Rules-platform implementation child issues target the integration branch unless their issue explicitly says otherwise; #323 reconciles that completed train with production `main`.
- A child rules-platform PR must target `integration/rules-platform-v1`, **not `main`**.
- Do not merge the integration branch to `main` automatically. Eligibility for production promotion comes only after the required parity/cutover gates and explicit review.
- If an urgent production fix lands on `main` while integration work is active, sync that fix deliberately into the integration branch rather than reimplementing it differently.
- Closed/superseded design PRs are archaeology, not implementation authority.

## Product guardrails

- Build for the **quiet fifth person at the table**: show what the player needs next; do not make them manage the page.
- Beginner first. Use plain player-facing language.
- Explain rather than guess. Unknown evidence stays unknown and scores conservatively.
- Mahjong Reference is the brand; **Your Mahjong table companion** is the proposition.
- Public UI says `Rules`; internal versioned profile IDs are implementation/provenance detail.
- Keep British-only learning explicitly British.
- Never silently change the rules/profile of an active or recovered game.
- Do not invent or silently change a Mahjong rule. Update tests and rules evidence when rule behaviour changes.
- Free table play must remain usable when future account/backend/billing/AI services are unavailable.

## Rules-platform discipline

For #227 work:

- Codex implements an agreed contract; it does not rediscover Mahjong architecture while editing production code.
- Keep current `MahjongHand`, `ScoreBreakdown`, `GameState` and `HandOutcome` legacy semantics intact until the named migration slice says otherwise.
- Shared canonical predicates are structural/event truth; profile bindings own score/name/value semantics.
- Keep scoring, settlement, progression and game-end as distinct concerns.
- Do not introduce an arbitrary rules DSL or executable user configuration.
- Unknown, incompatible, unresolved or unavailable rule/profile dependencies fail closed.
- Do not substitute `latest` for an exact historical profile/semantic revision.
- If implementation exposes a genuine unresolved Mahjong-domain question, stop that narrow piece and report the design gap rather than guessing.
- **Parity gates are proof work, not repair work.** When a parity issue freezes production code, an old-path/new-path mismatch must stop the parity run. Repair the owning production/runtime issue separately, merge that repair into the integration baseline, then resume parity.
- Do not weaken a parity oracle, fixture or comparison merely to make the migration green. Current product behaviour remains the oracle unless a separately evidenced defect task explicitly changes it.

## Structured knowledge discipline

For #251/reference/AI work:

- Public reference pages are **views over structured, source/runtime-backed knowledge**, not a second prose rules database.
- Keep canonical concepts, profile-specific treatments, relationships, evidence claims and executable/runtime identities distinct.
- Do not infer cross-family equivalence from similar English names. Same-name/different-concept and different-name/same-concept cases must remain explicit until evidence proves the relationship.
- Rarity, difficulty, strategy and “common mistake” claims need an evidence type and provenance. Use sourced, calculated or explicitly simulated evidence with assumptions; otherwise omit the claim.
- Future AI/voice may explain verified facts or translate user input into structured evidence. It must not become the authority for Mahjong rules or scoring truth.
- **Parity gates are proof work, not repair work.** When a parity issue freezes production code, an old-path/new-path mismatch must stop the parity run. Repair the owning production/runtime issue separately, merge that repair into the integration baseline, then resume parity.
- Do not weaken a parity oracle, fixture or comparison merely to make the migration green. Current product behaviour remains the oracle unless a separately evidenced defect task explicitly changes it.

## Structured knowledge discipline

For #251/reference/AI work:

- Public reference pages are **views over structured, source/runtime-backed knowledge**, not a second prose rules database.
- Keep canonical concepts, profile-specific treatments, relationships, evidence claims and executable/runtime identities distinct.
- Do not infer cross-family equivalence from similar English names. Same-name/different-concept and different-name/same-concept cases must remain explicit until evidence proves the relationship.
- Rarity, difficulty, strategy and “common mistake” claims need an evidence type and provenance. Use sourced, calculated or explicitly simulated evidence with assumptions; otherwise omit the claim.
- Future AI/voice may explain verified facts or translate user input into structured evidence. It must not become the authority for Mahjong rules or scoring truth.

## Development

- Keep each change bounded to the named task. Do not perform unrelated refactors.
- Preserve manual numeric scoring compatibility and exact rules/profile version identity in saved games and records.
- Prefer existing canonical tile/hand models and shared learner copy over parallel implementations where semantics genuinely match.
- Reuse existing deterministic scripts and test infrastructure instead of creating parallel tooling unless the task proves the existing path is insufficient.
- Do not reopen settled product/rules decisions merely to explore alternatives unless current evidence contradicts them.
- Do not merge to `main` automatically unless explicitly asked.

## Verification

Use targeted tests while developing. Before a PR is ready to merge, run from the repository root:

- `pnpm test`
- `pnpm run typecheck`
- `PORT=5173 BASE_PATH=/ pnpm run build`

`PORT` and `BASE_PATH` are required by the Vite configuration; a bare `pnpm run build` is not the canonical production-build check.

For migration/parity issues, also run the exact old-path/new-path fixtures required by the issue. A parity mismatch is a blocker unless a separately evidenced bug task explicitly authorises changing current behaviour.

### Completion discipline

For any task with an authoritative implementation or acceptance contract:

- Do **not** claim completion merely because the implementation appears finished or the existing test suite is green.
- Before the final gate, re-read the authoritative contract and audit the **actual branch diff and committed tests** against every required acceptance item.
- Every acceptance requirement must be demonstrably implemented and proved by the required committed fixture/test, or reported as a blocker. If any required item is missing or unproved, continue working.
- Inspect `git diff <base>...HEAD` and the committed test files before reporting done. Confirm the proof surface covers the contract rather than assuming existing tests are sufficient.
- Do not silently narrow, reinterpret or omit acceptance criteria to save time or tokens.
- Run the final full gate only after the contract audit is clean, unless the issue explicitly specifies a different order.
- A green build is verification evidence, not by itself proof that the task is complete.

## History

- `CHANGELOG.md` records meaningful product and maintenance changes, not every commit.
- When a merged PR materially changes the product or future maintenance, add one concise entry under **Unreleased** or the current coherent milestone.
- Do not add changelog entries for typo fixes, test-only churn, routine refactors or other implementation noise.
- Working branches are temporary; durable history belongs in `main`, merged PRs/issues, the changelog and canonical docs.
