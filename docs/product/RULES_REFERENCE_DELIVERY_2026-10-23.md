# Rules reference, comparison and Encyclopaedia — delivery plan

Date: 23 October 2026  
Baseline: `main@95063f380660ab5ce7ebdd069936aed5dc1675c4`  
Programme: #105  
Existing work: #405 (profile report), #407–#409 (profile slices), #296 (comparator), #251 (Encyclopaedia), #406 (shared dimension model, closed), #399/#440 (governed source-linked truth, closed).

## Outcome

Give a player three connected, honest ways to learn:

1. **Which rules are we using?** — one readable page per exact rules profile at `/rules/<slug>`, with a fast summary and optional technical/evidence detail.
2. **What is different?** — choose two or more exact profiles and compare stable practical dimensions, initially through the existing canonical `/mahjong-rules-compared` route.
3. **What does this mean?** — follow a comparison row or profile treatment into a canonical concept explanation in `/encyclopaedia/<concept>`, then back to the relevant scorer, example or rules page.

These are three views over one governed body of rules truth, **not three newly authored sources of scoring facts**.

## Evidence and publishing boundary

Current exact executable profiles:
- `bmja@1.0` — British / BMJA-style, stable;
- `western-tm@0.1` — source-certified special-hand catalogue, but ordinary rules remain provisional (#121);
- `outside-the-box@0.1` — configured local club profile, not universal club guidance;
- `buzzard-2000@0.1` — source-backed, provisional where semantic review remains;
- `mcr-wmo-2006@0.1` — implemented, provisional and human-review gated.

EMA Riichi 2025 is a **later exact-profile extension**, not a reason to hold the reference UI. Its runtime track remains #494 → #262 → #263 → #264. Do not infer support for Hong Kong, American, casino, or other researched families from reference content.

Keep **rule present / absent / not applicable / unknown**, **source verified / provisional / unresolved**, and **scorer executable / partial / not modelled / reference-only** separate.

Known gates: Western ordinary rules #121, T&M Purity #461, Buzzard concealed Pungs/Kongs #462. A runtime omission is not evidence that a source rule is absent. A similarly named hand is not automatically equivalent across profiles. Do not copy runtime arithmetic into display code.

## Working sequence — independent small PRs

### A. One-profile proof — #407 (this first branch)

- Read exact BMJA identity, runtime/profile values and the #406 37-dimension contract from the sealed current runtime.
- Render a short mobile-friendly **Rules at a glance** immediately after support status on `/rules/british`.
- Let readers expand grouped dimension information, source states, caveats and the exact fingerprint; clearly disclose unmapped dimensions.
- Retain the existing learning copy, scorer/game links and sources section; no scorer/settlement changes.
- Test the values and distinction between `not represented` and `absent`.
- After tests/build and an actual 390px rendered review, merge A before rolling it out elsewhere.

### B. Small reviewed concept crosswalk + public vertical — #251 A2/B

- Review a few *actual* Classical and MCR treatments from #399/#440: one genuine equivalent, one narrower/broader or analogue, one profile-specific hand, one broader mechanics concept (e.g. Chows), and one unresolved relationship.
- Reuse stable subject/treatment IDs. Do not make a 626-page migration goal or derive equivalence from names.
- Establish the generic concept/treatment page and deep-link contract. Prove addition of a synthetic future profile without changing core UI/route structure.
- Show provenance without giving every low-level dimension a separate URL.
- Preserve `/special-hands` as the discovery hub and avoid canonical duplication.

### C. Selectable comparison — #296

- Use the existing reviewed `CLASSICAL_COMPARATOR_AUDIT_V1.md` as calibration, not a second rules database.
- Show two or more exact profiles with **differences only** as a useful option, while always retaining unresolved/source-provisional caveats.
- Use shared #406 values and explicitly reviewed relationships; do not mechanically call identical runtime values source-equivalent.
- Give each dimension a **why it matters at the table** explanation, linked to #251 concepts.
- Validate BMJA vs Buzzard first; then Western/Club; MCR is the second-family contract test.
- Keep `/mahjong-rules-compared` canonical; do not duplicate indexable content.

### D. Every profile gets the same report — #408

- Roll out the proven report component across the five current executable profiles from the authoritative profile registry.
- Ensure MCR renders without invented Classical-only defaults, table limits or loser-to-loser assumptions.
- Place profile support and provenance prominently; surface known provisional questions without alarming styling.
- Audit club naming and sources: one local configuration does not define a whole region or tradition.

### E. Encyclopaedia hub, sensible expansion and derived stats — #251 C/D and #409

- Ship a useful browsable concept hub and a small set of well-evidenced pages.
- Grow in reviewed batches based on player questions, field feedback and source readiness.
- Add #409 audit counts only when denominators and sources are explicit. No synthetic completeness percentage or traffic-driven mass pages.
- Defer site-wide SEO ownership work (#250) until meaningful concept pages are live.

## Review gates for every PR

- All values and links resolve to the exact profile/version.
- `pnpm test`, `pnpm typecheck`, `PORT=5173 BASE_PATH=/ pnpm run build` and `git diff --check` pass.
- Test stable routes/canonical/prerender and no conflicting rules wording.
- Rendered desktop and ~390px mobile pages are inspected (long labels, expandable details, keyboard focus, no sideways clipping).
- No scorer, settlement or game-state semantic change; no new source-certainty claims without evidence.
- Update issues as each bounded slice lands; avoid rewriting #105's active #253 production QA or #494 Riichi track.
- Do not call a branch, PR or unreviewed draft 'live'.

## First human acceptance questions

For British `/rules/british`, can someone answer *which rules am I using, how does this system score, what happens after a hand, which facts are confirmed and where can I inspect them* without reading code?

For the first comparator, can someone answer *what actually changes between British and Buzzard, why does that matter, and which facts are provisional* without needing to know the source vocabulary?

For the first concept page, can a reader understand one rule, see **which exact profiles** treat it differently, and reach the correct profile/scorer without a guess?
