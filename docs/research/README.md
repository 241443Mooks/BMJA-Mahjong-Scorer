# Product research

This directory holds evidence-led product discovery for Mahjong Reference / Table Companion.

Its purpose is to answer a simple question:

> What work are people already doing badly, manually, repeatedly or anxiously around a Mahjong table, and which of those jobs should this product remove?

Research here is an input to product decisions. It is **not** a source of scoring or rules truth and must not override rules provenance, tests, or the current product plan.

## Research chain

Keep product decisions traceable through this chain:

`user evidence -> job/pain cluster -> opportunity hypothesis -> product decision -> GitHub issue -> implementation`

Do not jump directly from an interesting comment to a feature.

## Structure

- `pain-mining/evidence.csv` — one row per useful evidence observation.
- `pain-mining/collection-log.md` — record of deliberate research passes, including searches that produce weak or contrary evidence.
- `jobs/` — Jobs-to-be-Done clusters built from multiple evidence records.
- `opportunities/` — candidate product responses to validated jobs. A solution can address several jobs; several solutions can compete for the same job.
- `synthesis/pain-map.md` — comparative view of validated jobs and their current priority.

## Evidence principles

1. **One row is one observation, not one thread.** A source may contain several distinct pains or jobs.
2. **Preserve provenance.** Keep the original source URL and date where available.
3. **Paraphrase by default.** Store only a short quote when the exact wording is unusually revealing. Do not archive whole posts/comments.
4. **Separate problem from solution.** `Get a physical hand into the scorer without interrupting play` is a job. Voice, photography and manual tile entry are candidate solutions.
5. **Unknown stays unknown.** Do not infer a ruleset, persona, severity or willingness to pay where the source does not support it.
6. **Contrary evidence counts.** Log evidence that weakens a hypothesis as carefully as evidence that supports it.
7. **Frequency matters.** Repetition across independent sources and communities is stronger than one highly enthusiastic thread.
8. **Do not turn scores into fake precision.** Scores are comparison aids, not measurements of objective truth.

## Evidence IDs

Use sequential IDs:

- `E-0001`, `E-0002`, ... for evidence observations.
- `JTBD-001`, `JTBD-002`, ... for job clusters.
- `OPP-001`, `OPP-002`, ... for opportunity hypotheses.

Never recycle an ID after it has been used.

## Evidence strength

Use a 1-5 synthesis score only after clustering several observations:

1. isolated anecdote;
2. a few similar examples;
3. repeated within one community or user type;
4. repeated across communities or user types;
5. pervasive, with visible workarounds, products or repeated attempts to solve it.

## Opportunity assessment

When comparing opportunities, consider:

- pain severity;
- frequency of the job;
- number/range of affected users;
- inadequacy of existing workarounds;
- fit with the Table Companion concept;
- differentiation from existing products;
- credible willingness-to-pay signal;
- implementation cost, safety and rules risk.

A high-scoring opportunity still requires a product decision. It is not automatically a roadmap commitment.

## Current discovery objective

Before defining the smallest compelling Free and Plus products, understand the jobs people hire — or would hire — a Mahjong table companion to do.

Current themes to investigate include, but are not limited to:

- scoring without stopping play;
- identifying what rules a family or table actually uses;
- preserving and reusing house rules;
- teaching and onboarding new players;
- table/game administration and settlement;
- remembering players, settings and previous games;
- getting physical table state into software with minimum friction;
- finding the right rule or explanation at the moment it is needed.

These are research themes, not pre-approved features.
