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

- `pain-mining/evidence.csv` — canonical, source-verified evidence rows only.
- `pain-mining/collection-log.md` — record of deliberate research passes, including weak and contrary findings.
- `pain-mining/source-index-2026-09-15.csv` — 50 original URLs retained from the first Deep Research pass.
- `pain-mining/recovery-note-2026-09-15.md` — provenance and recovery caveat for that pass.
- `jobs/` — Jobs-to-be-Done clusters built from multiple observations.
- `opportunities/` — candidate product responses to validated jobs.
- `synthesis/pain-map.md` — comparative view of jobs and current priority.
- `synthesis/` also contains coverage, hypothesis verdicts, new opportunities, gaps and dated research reports.

## Evidence principles

1. **One row is one observation, not one thread.** A source may contain several distinct pains or jobs.
2. **Preserve provenance.** Keep the original source URL and date where available.
3. **Paraphrase by default.** Store only a short quote when exact wording is unusually revealing. Do not archive whole posts/comments.
4. **Separate problem from solution.** `Get a physical hand into the scorer without interrupting play` is a job. Voice, photography and manual tile entry are candidate solutions.
5. **Unknown stays unknown.** Do not infer a ruleset, persona, severity or willingness to pay where the source does not support it.
6. **Contrary evidence counts.** Log evidence that weakens a hypothesis as carefully as evidence that supports it.
7. **Frequency matters.** Repetition across independent sources and communities is stronger than one highly enthusiastic thread.
8. **Do not turn scores into fake precision.** Scores are comparison aids, not measurements of objective truth.

## Evidence IDs

Use sequential IDs:

- `E-0001`, `E-0002`, ... for canonical evidence observations.
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

When comparing opportunities, consider pain severity, frequency, breadth of affected users, inadequacy of current workarounds, Table Companion fit, differentiation, credible willingness-to-pay signals, implementation cost and rules/safety risk.

A high-scoring opportunity still requires a product decision. It is not automatically a roadmap commitment.

## Current evidence status — 2026-09-15

The first Deep Research pass screened a broad set of public player-generated material and retained a synthesis representing **101 observations from 50 unique source URLs**, producing nine JTBD clusters and seven opportunity hypotheses.

The original generated archive was not persisted. A later recovery package reconstructed its row-level CSV from preserved source metadata, snippets and the final report. Because those rows are reconstructed rather than byte-for-byte original source extraction, they have **not** been promoted into canonical `pain-mining/evidence.csv`.

The durable repository therefore preserves:

- the 50 original source URLs;
- recovery provenance;
- coverage counts;
- the JTBD and opportunity synthesis;
- contrary findings and research gaps.

Before a high-impact decision relies on a specific observation, reopen the original URL and promote a source-checked observation into `evidence.csv`. The source is authoritative; synthesis remains revisable.

## Current discovery objective

Before defining the smallest compelling Free and Plus products, understand the jobs people hire — or would hire — a Mahjong table companion to do.

Current research suggests the strongest territory is recurring interruption around a physical table: scoring, settlement, contextual explanation and shared state. My Table remains strategically interesting when it lets those jobs reuse the correct rules, but persistence and willingness to pay are not yet validated.

Current themes remain research themes, not pre-approved features.