# Issue #72 implementation handoff

This file is intentionally short. It exists so the eventual implementation can stay separate from the research/content work.

## Wait for #61 first

Do not implement `/western-mahjong` until #61 has landed and the repository has one shared public-route SEO configuration.

## Then implement

- add `/western-mahjong` through the shared route configuration;
- use `docs/WESTERN_MAHJONG_CONTENT.md` as the first copy draft;
- keep the page useful independently of SEO;
- link naturally to `/hand`, `/guide`, `/special-hands`, `/mahjong-rules-compared` and later `/scoring-examples`;
- add reciprocal links from relevant British content where they genuinely help;
- keep the British/BMJA scorer identity explicit;
- do not imply current Australian/Western scoring support;
- use ordinary visible HTML for FAQ/explanatory content;
- preserve mobile readability and current site visual language;
- inspect built HTML for title, description, canonical and internal links;
- run the repository's standard tests, typecheck and production build.

## Do not implement

- a Western/Australian rules toggle;
- a second scoring engine;
- keyword-driven scoring branches;
- claims that Western/Australian/British rules are interchangeable;
- one page per keyword variation;
- hidden SEO/AI-only content.

## Research boundary

The relationship/identification page is ready to implement from current evidence.

A real Australian/Western scoring profile is **not** ready to implement. See `WESTERN_MAHJONG_RESEARCH_MATRIX.md` for the primary-source gaps that still need resolving.