# Special Hands Guide language implementation

Issue: #368
Base: `b3e18c2a4cc612911b76344b51827f5e3877eca0`
Status: implemented in PR #370; awaiting review

## Public naming

`Atlas` is internal project language only.

Public product wording:

- section/product name: **Special Hands Guide**
- navigation, breadcrumbs and return links: **Special Hands**
- page heading can remain **Find a special hand.**
- preferred intro: **Find, understand and compare special hands across different Mahjong rules.**

Do not expose `Atlas` in visible copy, accessibility labels, screen-reader text, page metadata, breadcrumbs, navigation labels, scorer return links, empty states, help copy or user-facing status messages.

Internal code names such as `ATLAS_*`, `AtlasLearnerEntry`, `atlas:check`, generator names and test identifiers may stay unchanged.

## Editorial authority

Use the completed Sol review on branch `research/issue-368-atlas-language-review`, commit `7de00e4368ccc5238c2eebefb101e793d4f5bdd2`, file:

`docs/rules/encyclopaedia/ATLAS_V02_LANGUAGE_REVIEW_2026.md`

That review covers all 71 learner entries and is the wording authority for this implementation slice.

## Scope

Apply the reviewed language to the authoritative learner-content sources and regenerate the runtime snapshot. Also update page-level user-facing wording introduced or retained by #358/#369.

This is a language/public-copy change only. Do not alter:

- rules semantics;
- scores or fishing values;
- exact treatment identities;
- pattern IDs;
- ownership;
- examples or their tile structures;
- facets;
- evidence bindings;
- scorer behaviour;
- filter/selection behaviour from #358.

## Required public-copy cleanup

Remove learner-facing software/research language where plain Mahjong wording is available, including terms such as `predicate`, `runtime`, `executable`, `qualification`, `treatment-local`, `profile-local`, `provenance`, `reviewed family`, `reviewed concept`, `structural membership` and machine relationship labels.

Keep genuine Mahjong terminology such as Chow, Pung, Kong, Wind, Dragon, honour, terminal, concealed and wall.

Change the rendered heading **Why it qualifies** to **Why it is special**.

Keep public club naming as **Club - Bramhall 2026**; no visible or screen-reader `Outside the Box` / `outside-the-box`.

## Validation

- all 71 learner entries reviewed in the final rendered output;
- public search/scan finds no user-facing `Atlas` terminology;
- public search/scan finds no user-facing `Outside the Box` identifier;
- no internal software/research wording leaks into visible or accessible learner copy where plain wording is available;
- `atlas:generate` and `atlas:check` pass;
- 146/146 treatment ownership remains unchanged;
- full tests pass;
- typecheck passes;
- production build passes;
- `git diff --check` passes;
- run the #358 Playwright verifier after wording changes to catch layout/accessibility regressions;
- perform a rendered ~390px spot-check on several long entries.

Open a PR against `main`. Do not merge automatically.
