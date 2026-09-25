# Current-Classical Atlas concept and facet audit (v1)

Status: **bounded evidence audit; not a universal Mahjong ontology**
Base: `575ad69db43008137c71a7ba3509d9c9c17589e5`
Scope: the 146 exact treatments in `bmja@1.0`, `western-tm@0.1`, `outside-the-box@0.1`, and `buzzard-2000@0.1`.
Purpose: #351, following the authoritative Sol preflight addendum.

This is a research/model document. Existing exact treatment identity remains
`profile id + profile version + executable pattern id`. Nothing here edits
detectors, bindings, values, or production presentation. Classical groupings
proved here would not settle MCR, Riichi, or other families.

## Method and evidence boundary

For each case, the runtime predicate in `artifacts/mahjong-scorer/src/scoring/special-hands.ts`
was compared with its profile-local binding in `scoring/special-hands.ts`,
`game/western-tm-catalogue.ts`, `game/outside-the-box-catalogue.ts`, or
`game/buzzard-2000.ts`. A shared pattern ID is a positive structural signal,
not a conclusion: binding restrictions and current source evidence were also
checked. The source locators below refer to repo-held, current evidence records;
`SPECIAL_HANDS_PROVENANCE.md` and `A2_STRESS_TEST_SEED.md` were used only to
locate candidates. The BMJA source is also checked directly at the
[approved BMJA special-hands reference](https://mahjongbritishrules.wordpress.com/scoring/special-hands/)
(the relevant sections are named in the case notes below).

The audited distinctions are:

* **Treatment identity** stays exact and profile-local.
* **Concept membership** is a review judgment over structural runtime truth,
  effective binding qualification, and profile evidence.
* **Inter-concept relationship** describes distinct predicates/concepts; it
  does not replace membership or name data.
* **Name/alias** is a sourced naming fact attached to a treatment or supported
  concept. It does not create another concept by itself.
* **Structural facets** describe the reviewed pattern. Exposure, winning-method
  constraints that are binding-local, score model/value, and source status stay
  treatment qualifiers.

When a source claim is less specific than the runtime, or disagrees with it,
the case is `unresolved` for grouping. The follow-up is evidence/implementation
review outside #351; this audit does not change scorer behavior.

## Vocabulary retained after the corpus review

The smallest useful structural vocabulary supported by these cases is:

| Facet | Meaning in this audit | Example supported by exact predicate |
|---|---|---|
| `tile-defined` | Qualification is determined from a tile arrangement rather than a winning event. | `thirteen-unique-wonders` |
| `event-defined` | An explicit event/context predicate is essential to qualification. | `heavens-blessing`, `earths-blessing`, `twofold-fortune` |
| `one-suit` | All suited tiles in the predicate belong to one numbered suit. | `western-gates-of-heaven`, `seven-pairs-one-suit` |
| `multiple-suits` | The predicate explicitly spans more than one suit. | `two-suit-knitting`, `three-suit-knitting-with-pair` |
| `terminals` | Suited terminals (1s/9s) are required by the predicate. | `thirteen-unique-wonders`, `all-pair-honours` |
| `honours` | Honour tiles are required. | `thirteen-unique-wonders`, `wriggling-snake` |
| `winds` / `dragons` | The named honour family is structurally required. | `four-blessings` / `three-great-scholars` |
| `green-tile-restriction` | The exact predicate restricts composition to the specified green tile set. | BMJA/OTB `imperial-jade` |
| `pair-structure` | Pairs are an essential part of the pattern, including repeated pairs. | pair-family predicates |
| `pung-kong-structure` | Pungs/Kongs are explicitly required. | `three-great-scholars`, `four-blessings` |
| `chow-structure` | A Chow is required or explicitly permitted by the predicate. | Western Imperial Jade permits at most one specified Chow. |
| `irregular-layout` | The detector requires a loose, non-grouped complete arrangement. | `wriggling-snake`, `western-gates-of-heaven` |
| `knitted-interleave` | Same-rank suit interleaving, not ordinary Chow/Pung grouping. | knitting predicates |

Facets are multi-valued: for example, the BMJA/OTB Wriggling Snake predicate
has `tile-defined`, `honours`, `winds`, `one-suit`, `irregular-layout`, and
`pair-structure`. They are overlapping browse facts, not exclusive categories.
The audit does **not** attach treatment qualifiers as concept facets. In
particular, exposure, winning method, values, fixed/calculated/configured
scoring, fishing, combination, and provenance remain treatment-local.

### Binding qualifiers, values and interaction behavior

These are recorded to prevent structural grouping from hiding effective
treatment differences:

| Cases | Current binding facts | Interaction represented by runtime |
|---|---|---|
| Thirteen Wonders | BMJA 1,000/400; T&M 2,000/800; OTB 1,000/400 and concealed-only; Buzzard configured limit. No explicit `winningMethods` binding on these four rows. | No candidate-specific combination/suppression relation is declared in the bindings. Where more than one fixed special matches, scoring selects the highest-valued fixed special; this does not merge concepts. |
| Wriggling/Wriggly Snake | Each fixed row is 1,000/400. OTB's two rows are concealed-only. No explicit winning-method binding. | The two OTB patterns are distinct detectors and can be shown as distinct results; no name-based suppression is encoded. |
| Knitting / Triple Knitting | BMJA, T&M and OTB fixed values are 500/200. OTB rows are concealed-only. No explicit winning-method binding. | No interaction edge is encoded by the pattern bindings. |
| Three Great Scholars | BMJA 1,000/400 with intrinsic fishing floor; T&M 1,500/600; OTB 1,000/400 with exposure allowed; Buzzard configured limit. No explicit winning-method binding. | It can overlap Four Blessings or All Winds and Dragons on a suitable hand. The scorer selects the highest matched fixed value rather than summing overlapping fixed specials. Buzzard's non-winning limit is not represented by this pattern. |
| Gates family | BMJA 1,000/400; T&M 1,000/400 and concealed-only; Buzzard configured limit. BMJA has detector-level completion/provenance logic; no explicit winning-method binding on these rows. | The structural candidates are separate detectors. No pairwise combination rule is documented in these bindings. |
| Imperial Jade | BMJA 1,000/400; OTB 1,000/400, exposure allowed with exposed 500/200; T&M 2,000/800, exposure allowed at full value. No explicit winning-method binding. | No combination/suppression fact is encoded for these patterns. |
| Pair family | All Pair Honours: BMJA 500/200, T&M 1,000/400, OTB 500/200 concealed-only. All Pair: T&M 500/200 concealed-only. Heavenly Twins: T&M 1,000/400 concealed-only. Seven Twins: T&M 500/200, concealed-only and winning method `wall` or `last-wall-tile`. | Detectors use different set/loose representations. Similar name or pair facet does not create combination or identity. |
| Blessings and Four Blessings | BMJA Heaven/Earth 1,000 with no fishing field; Buzzard corresponding bindings are configured limits. Four Blessings: BMJA 1,000/400 with intrinsic fishing floor; T&M 1,500/600; OTB 1,000/400 with exposure allowed. Buzzard Three Winds is a configured limit. | Four Blessings may overlap All Winds and Dragons; the scorer's highest-fixed selection applies. Event-based Blessings are separate event detectors and have no relationship encoded to tile-defined Four Blessings. |
| BMJA Twofold Fortune | BMJA 1,000 with no fishing value. No matching current T&M, OTB, or Buzzard binding. | Event-defined predicate; no candidate-specific suppression rule is encoded. |
| Purity | BMJA is calculated three doubles, with a separate fishing calculation. OTB reuses the calculated BMJA treatment. T&M `purity-one-chow` is calculated and has a treatment-local exposure rule; no fixed special value is copied into this audit. | Generic fixed-special priority and calculated-hand handling are scorer mechanics, not concept membership. |

The priority statement above is sourced from `scoring/score.ts`, where the
matched fixed results are sorted by value and the highest is selected. The
bindings have no separate generic “equivalent”, “alias”, or concept-level
combination field. Where a source expressly says a hand can be incomplete or
non-winning, that remains a separate condition that a winning-only detector
cannot satisfy.

## Reviewed stress corpus

### 1. Thirteen Unique Wonders / Unique Wonder / Thirteen Odd Majors

| Exact treatment | Runtime predicate | Current source/profile evidence | Result |
|---|---|---|---|
| `bmja@1.0:thirteen-unique-wonders` — Thirteen unique wonders | Requires all 13 suited terminals, Winds, and Dragons plus exactly one duplicated tile. | BMJA approved source, “The thirteen unique wonders”: one each Dragon, Wind, 1 and 9, any one paired; canonical detector matches. | Supported member of the Classical structural concept. Fixed 1,000 / 400 fishing; values are treatment-local. |
| `western-tm@0.1:thirteen-unique-wonders` — Unique Wonder | Same canonical detector. | `TM_COMPANION_CATALOGUE_INDEX.md` §4, synopsis p.58/detail p.44: all Winds, Dragons, 1s and 9s, one tile duplicated; value 2,000 / 800; no exposure marker. | Supported member; `Unique Wonder` is a sourced local name, not a second concept. |
| `outside-the-box@0.1:thirteen-unique-wonders` — 13 Unique Wonders | Same canonical detector. | `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md` §2: ESWN, GRW, suited 1s/9s, any pair; 1,000 / 400, concealed-only; `verified-club`. | Supported member; treatment exposure differs from Western and stays local. |
| `buzzard-2000@0.1:thirteen-unique-wonders` — Thirteen Odd Majors | Same canonical detector. | `BUZZARD_2000_RULE_EVIDENCE.md` §D lists the name as a limit hand, but gives no exact tile predicate or exposure/win qualification for this item. | **Unresolved** membership. The source record is insufficiently specific to verify the reused predicate; matching pattern ID/name cannot fill that gap. |

Relationship: supported shared Classical concept among BMJA, T&M and OTB;
Buzzard is not added to it pending exact source qualification. Facets:
`tile-defined`, `terminals`, `honours`, `pair-structure`, `irregular-layout`
(the detector is tile-based; the pattern can be represented without ordinary
meld decomposition). BMJA/T&M/OTB score and exposure differences remain
treatment qualifiers.

### 2. Wriggling Snake / Wriggly Snake

| Exact treatment | Runtime predicate and binding | Current source/profile evidence | Result |
|---|---|---|---|
| `bmja@1.0:wriggling-snake` — The Wriggling Snake | One suited 1 duplicated, suited 2–9 once, one each Wind; 14 loose tiles, no represented sets. | BMJA approved source (“The wriggling snake”) gives a 1 pair, 2–9 run in the same suit, and each Wind; canonical runtime predicate matches. | Supported narrow pattern. |
| `outside-the-box@0.1:wriggling-snake` — Wriggling Snake | Same predicate; OTB binding concealed-only. | `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md` §2: ESWN + 2–9 run + same-suit 1 pair; `verified-club`. | Supported member of that narrow pattern. |
| `western-tm@0.1:wriggling-snake-any-pair` — Wriggly Snake | Complete 1–9 run in one suit, all four Winds, and any one of those base tiles duplicated. | `TM_COMPANION_CATALOGUE_INDEX.md`, “Wriggly Snake”: detail-page evidence explicitly permits any tile in the 13-tile base to be paired. | Supported broader pattern. |
| `outside-the-box@0.1:wriggling-snake-any-pair` — Wriggly Snake | Same wider predicate; concealed-only. | `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md` §2 distinguishes Wriggly Snake from starred Wriggling Snake. | Supported broader pattern. |

Relationship: `wriggling-snake` is `narrower-than`
`wriggling-snake-any-pair`: the former's duplicated 1 is one allowed duplicate
in the latter's 1–9 + ESWN base. They remain distinct pattern identities.
“Wriggling”/“Wriggly” is a real disambiguation need, but this is not an
unrelated same-name collision because the predicates have a documented subset
relationship. Facets: `tile-defined`, `one-suit`, `honours`, `winds`,
`irregular-layout`, `pair-structure`.

### 3. Knitting / Triple Knitting

| Exact treatments | Predicate comparison | Evidence and outcome |
|---|---|---|
| `bmja@1.0:knitting`; `outside-the-box@0.1:knitting`; `western-tm@0.1:two-suit-knitting` | The corrected shared qualification requires a winning hand, no represented sets, exactly 14 loose playing tiles, no remaining slots, physical copy limits, suited tiles only, exactly two numbered suits, and seven same-rank cross-suit pairs. | BMJA approved source (“Knitting”), T&M p.20/synopsis pp.57/59, and OTB §2 support the same structure. The former three-suit BMJA fixture is rejected; standard two-suit and duplicate-pair fixtures pass. **Reviewed shared concept.** Exact profile names, values, and exposure remain treatment-local. |
| `bmja@1.0:triple-knitting`; `outside-the-box@0.1:triple-knitting`; `western-tm@0.1:three-suit-knitting-with-pair` | All require a complete 14-tile loose layout with no normal sets or remaining slots, then four same-rank three-suit groups plus a same-rank pair across two suits. | BMJA and OTB retain the existing structural partition and now use the same strict layout guard as T&M. Positive, duplicate-triplet, malformed-group, and 14-total loose/remaining boundary fixtures prove the qualification. **Reviewed shared concept.** Exact profile names, values, and exposure remain treatment-local. |

Knitting facets: `tile-defined`, `multiple-suits`, `pair-structure`,
`knitted-interleave`, `irregular-layout`. Triple Knitting adds explicit
three-suit rank units and a cross-suit pair. The learner generator represents
each reviewed concept with exact treatment references and a shared structural
variant; profile score and exposure are still projected from each treatment.
The Club public label is **Club - Bramhall 2026**; `outside-the-box@0.1`
remains the internal profile identity.

### 4. Three Great Scholars / Three Dragons

Exact references using canonical predicate `three-great-scholars`:
`bmja@1.0:three-great-scholars`,
`western-tm@0.1:three-great-scholars`,
`outside-the-box@0.1:three-great-scholars`, and
`buzzard-2000@0.1:three-great-scholars`.

The runtime predicate is a winning five-set hand with four Pung/Kong sets, one
pair and at least one set of each Dragon. BMJA, Western, OTB and Buzzard bind
that one ID under different values/names: 1,000/400, 1,500/600, 1,000/400 and
configured limit respectively. T&M's source synopsis (p.58/detail p.33) says
all three Dragon sets plus the remaining set/pair structure; this supports the
shared detector for that source. OTB's current guide crosswalk instead says
the remaining set must be same-suit Pung/Kong or Chow. The detector does not
enforce that condition. Buzzard's primary evidence (§D and §E) also says the
Three-Dragon limit can score against other losers while incomplete/non-winning,
whereas this canonical detector requires `hand.isWinner` and five sets.

Result: BMJA/Western membership has good shared-predicate and T&M support,
with values local. OTB membership in a complete shared concept is
**unresolved** because its source is more restrictive than the runtime.
Buzzard membership is **unresolved** because source-described non-winner
qualification conflicts with the reused winning-hand predicate. Keep both as
exact treatments and record the two audit gaps for a separate owner; do not
change them here. Facets for the supported structural core:
`tile-defined`, `dragons`, `pung-kong-structure`, `pair-structure`.

### 5. Gates of Heaven / Nine Gates family

| Exact treatment | Predicate/source comparison | Result |
|---|---|---|
| `bmja@1.0:gates-of-heaven` | One-suit 14-tile 111, 999, one each 2–8, one 2–8 duplicate; detector additionally calls `gatesCompletionIsAllowed` for BMJA completion/provenance semantics. | Runtime tile skeleton is clear. Full concept membership with other profiles is not asserted because completion/provenance qualification differs. |
| `western-tm@0.1:western-gates-of-heaven` | One suit, 111, 999, one each 2–8 and a duplicated 2–8; T&M binding says concealed-only. | `TM_COMPANION_CATALOGUE_INDEX.md` Pass 4J, pp.9/47, says the BMJA completion/provenance restrictions were a reason to use a separate pattern. Relationship to BMJA: `partial-analogue` at the structural skeleton; full semantic equivalence unresolved. |
| `buzzard-2000@0.1:one-suit-nine-gates-any-completion` — Calling Nine Tile Hand | One suit, at least three 1s and 9s, every 2–8 present, fourteen total: it permits an extra same-suit 1–9 completion. | `BUZZARD_2000_RULE_EVIDENCE.md` §D, “Calling Nine Tile Hand clarification” (source PDF p.11): exact 13-tile base `1112345678999`, completed by any same-suit 1–9; explicitly not identical to BMJA/T&M gates predicates. Structurally `broader-than` the middle-rank-only duplicated skeleton. Other effective exposure/completion comparison is unresolved where not specified by the source record. |

No current OTB Gates of Heaven binding exists in the bounded four-profile
catalogue. Facets: `tile-defined`, `one-suit`, `terminals`, `irregular-layout`.
Completion/provenance and exposure stay treatment-local, even though the
current BMJA detector contains a completion check.

### 6. Imperial Jade / All Green family

| Exact treatment | Predicate and evidence | Result |
|---|---|---|
| `bmja@1.0:imperial-jade`; `outside-the-box@0.1:imperial-jade` | Four Pung/Kong groups and a pair; every tile is Green Dragon or Bamboo 2,3,4,6,8. BMJA approved source (“Imperial jade”) defines the green set exactly and requires Pungs/Kongs plus a green pair. OTB source §2 gives the same structure and marks `verified-club`. | Supported shared narrow concept membership; BMJA and OTB values/exposure are treatment-local. |
| `western-tm@0.1:green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow` — Imperial Jade | Green Dragon Pung/Kong, three green Bamboo melds, green Bamboo pair; at most one Bamboo 234 Chow. | `TM_COMPANION_CATALOGUE_INDEX.md` Pass 4H, pp.36/52, explicitly states the Chow difference. Runtime extends the represented BMJA structure with the permitted Chow. Relationship: Western predicate is `broader-than` the no-Chow BMJA/OTB pattern; they are not treatment-equivalent. Western value 2,000/800 and exposure permission remain local. |
| Buzzard | No current exact Imperial Jade/All Green binding among its ten patterns. | No membership or cross-profile relationship is invented. |

Facets: `tile-defined`, `green-tile-restriction`, `dragons`, `pung-kong-structure`,
`pair-structure`; the T&M extension also has `chow-structure`. Do not create a
universal `All Green` concept from visual colour resemblance or non-Classical
sources.

### 7. Seven Pairs / All Pair family

| Exact treatment(s) | Predicate facts | Decision |
|---|---|---|
| `bmja@1.0:all-pair-honours`; `western-tm@0.1:all-pair-honours`; `outside-the-box@0.1:all-pair-honours` | Seven represented pairs, each Wind/Dragon or suited 1/9. All share canonical `all-pair-honours`; BMJA approved source (“All pair honours”), T&M pp.57–58/detail p.22/44, and OTB §2 support the same composition. BMJA/T&M/OTB values are 500/200, 1,000/400 and 500/200; OTB is concealed-only. | Supported same-pattern membership with profile-local values and exposure. |
| `western-tm@0.1:seven-pairs-one-suit-with-honours` — All Pair | Seven pairs, at most one suited family, honours allowed; non-terminal suit ranks are allowed. | T&M index p.57/detail p.22 states the structure. Compared with All Pair Honours, neither predicate contains the other: All Pair Honours can span multiple suits (using only terminals/honours), while All Pair can use non-terminal tiles. Classify the similar-name pair as `name-collision` with a material structural distinction; keep the records disambiguated. |
| `western-tm@0.1:seven-pairs-one-suit` — Heavenly Twins | Seven pairs in one numbered suit, no honours. | T&M index p.57/detail pp.21/48. Structurally `narrower-than` All Pair. This overlap supports browse facets, not merging all pair-named hands. |
| `western-tm@0.1:seven-pairs-all-from-wall` — Seven Twins | Seven distinct loose pairs plus a binding win-method restriction `wall` or `last-wall-tile`. | T&M index p.22 and current binding are both required; do not promote wall-method restriction to a concept facet or merge solely by “seven pairs.” Membership relationship to other pair patterns remains **unresolved** because its event qualifier changes effective qualification. |

Facets supported for the relevant patterns: `tile-defined`, `pair-structure`,
`terminals`, `honours`, `one-suit` (for the narrower patterns), and
`irregular-layout` where the exact detector requires loose tiles. Pair
structure alone is not a concept identity.

### 8. Heaven's/Earth's Blessing and event-defined treatments

| Exact treatment(s) | Canonical event predicate | Evidence and result |
|---|---|---|
| `bmja@1.0:heavens-blessing`; `buzzard-2000@0.1:heavens-blessing` — Buzzard local name `Original Hand` | East wins by `initial-deal`, fourteen tiles, no bonus tiles. | `BMJA_RULES_REFERENCE.md`, Event-dependent specials: BMJA explicitly says the implemented mapping is inferred from “Mah Jong in original deal.” `BUZZARD_2000_RULE_EVIDENCE.md` §D lists `Original Hand` as a limit hand but gives no equivalent East/bonus qualification. Shared ID alone is insufficient: Buzzard membership is **unresolved**. |
| `bmja@1.0:earths-blessing`; `buzzard-2000@0.1:earths-blessing` — Buzzard local name `East's First Discard` | Non-East player wins by discard; event evidence says East made hand discard ordinal 1. | BMJA Rules Reference says the BMJA event requires a non-East winner and East's first discard. Buzzard source §D lists “winning with East Wind's first discard” but does not state all matching context fields. Buzzard membership is **unresolved** pending exact source qualification. |
| Western / OTB | No corresponding current binding in the bounded catalogue. | No cross-profile concept membership asserted. |

These are `event-defined`, not tile-composition concepts. Treatment-local
source status and any exposed/seating details are not promoted to facets. The
repo documentation's `inferred` BMJA event qualifications remain explicit
evidence caveats rather than hidden certainty.

### 9. Four Blessings / four-Winds family

| Exact treatment | Predicate and source | Result |
|---|---|---|
| `bmja@1.0:four-blessings`; `western-tm@0.1:four-blessings`; `outside-the-box@0.1:four-blessings` | Four distinct Wind Pung/Kong sets and a pair; canonical ID shared. BMJA approved source (“Four blessings hovering over the door”), T&M §4 p.58/detail p.30 (1,500/600), and OTB §2 (`verified-club`, 1,000/400) support the same composition. | Supported common structural concept; BMJA's intrinsic-fishing floor, values, and OTB exposure permission remain treatment-local. |
| `buzzard-2000@0.1:three-winds-and-fourth-wind-pair` | Three distinct Wind Pung/Kongs, the fourth Wind as pair, plus a final set; Buzzard configures it as a limit. | Buzzard evidence §D calls out this form; §E says the Four-Wind family may qualify while incomplete/non-winning. The predicate is materially different from Four Blessings. Classify `related-materially-different`; do not merge. Its non-winning qualification is not encoded by this canonical winning predicate, a separate unresolved implementation/source finding. |

Facets: `tile-defined`, `winds`, `pung-kong-structure`, `pair-structure`.
Do not encode “limit”, score value, exposure, or non-winner qualification as
structural facets.

### 10. Profile-specific treatment with no forced partner

`bmja@1.0:twofold-fortune` is the BMJA-only exact event treatment in this
four-profile corpus. Its detector requires a replacement-tile win, at least
two Kongs, and event evidence that the first Kong replacement completed the
second Kong and the next replacement completed Mahjong. `BMJA_RULES_REFERENCE.md`
“Event-dependent specials” describes this sequence and its confirmation step.
No Western, OTB, or Buzzard binding with equivalent recorded event identity
exists in the four binding arrays.

Decision: `profile-specific` **within this bounded current-Classical corpus**;
this is not a claim of global Mahjong uniqueness. Facet: `event-defined`; the
specific Kong-replacement sequence is an event subtype only while the current
predicate/source evidence remains exact. It is not a tile-structure facet.

### 11. Shared pattern ID that still needs semantic review

`three-great-scholars` is deliberately retained as the high-information
example. The same canonical predicate is bound to all four profiles, but the
OTB source says more about the remaining shape than the predicate enforces,
and Buzzard's source explicitly includes non-winning/incomplete limit
qualification that the predicate rejects. Therefore shared ID is strong
positive evidence of a shared detector, **not** sufficient to establish
complete treatment/concept equivalence. See §4; OTB and Buzzard memberships
remain unresolved. No repair is made here.

### 12. Purity boundary

BMJA Purity is an ordinary calculated scoring mode, not one of the 18 fixed
BMJA Atlas treatment identities. `BMJA_RULES_REFERENCE.md` §“Special-hand
scoring principles” defines it as three doubles; `scoring/fishing.ts` and the
BMJA purity predicate represent its scorer calculation/fishing separately.
The Atlas can therefore retain authored/structural Purity guidance without
counting it as a fixed executable BMJA special-hand card. OTB crosswalk §2
reuses BMJA's calculated predicate; T&M has a distinct calculated
`purity-one-chow` pattern that permits one Chow and has its own profile
exposure binding (`TM_COMPANION_CATALOGUE_INDEX.md` “Purity”). These facts do
not support one universal fixed-treatment concept.

Boundary finding: allow a future knowledge view to connect authored structural
guidance to calculated treatments, while labelling the exact treatment and
not inflating the BMJA fixed Atlas count. Do not copy a score calculation into
the facet layer.

## Rejected tempting matches and unresolved list

* Do not attach Buzzard Thirteen Odd Majors to the Thirteen Unique Wonders
  group yet: the source ledger names it but lacks an exact tile predicate.
* Knitting and Triple Knitting now have reviewed shared concepts across BMJA,
  Western, and Club - Bramhall 2026 after the canonical boundary predicates
  were corrected and covered by focused fixtures. Their exact treatments
  remain profile-local.
* Do not call OTB Three Great Scholars equivalent to the other three profiles
  until the source's remaining-shape restriction and the runtime are reconciled.
* Do not call Buzzard Three Dragons equivalent to Three Great Scholars: its
  published non-winner limit provision conflicts with the current shared
  winning-hand predicate.
* Do not normalize BMJA, T&M, and Buzzard Gates of Heaven/Nine Gates as exact
  equivalents. The 2–8 duplicate, any-rank completion, BMJA provenance test,
  and exposure qualifications need treatment-aware comparison.
* Do not merge Imperial Jade across profiles: T&M's permitted Chow creates a
  strict structural superset; score/exposure differences are also local.
* Do not merge all pair-based hands by a broad “Seven Pairs” label. All Pair
  versus All Pair Honours is a source-backed name collision; Heavenly Twins is
  narrower; Seven Twins has a wall-winning restriction.
* Do not group Buzzard Original Hand or East's First Discard from shared IDs
  alone; their source descriptions do not currently establish every runtime
  qualification.
* Do not infer an OTB match for any absent treatment, or an All Green concept,
  from colour, naming, source tradition, score, or non-Classical examples.

Unresolved cases are intentionally left exact-profile-local. They can proceed
in parallel with the IA recommendation and do not stop this bounded audit.

## Atlas v0.2 information-architecture recommendation

Recommend a **combined concept-first and exact-treatment browse surface**:

1. Put only reviewed, supported concept groups at the top of the browse
   surface. Keep the current 146-treatment completeness as the underlying
   inventory and keep all exact `referenceId`s stable.
2. Expand a concept into exact profile treatment rows. Each row retains its
   local name, profile/version, score model/value, fishing treatment, exposure
   policy, winning methods, and source status. The group heading describes
   only invariant reviewed structure.
3. Keep profile-specific and unresolved treatments as standalone exact
   treatment entries. A singleton is not a failed record and should not be
   assigned a speculative universal concept.
4. Show name collisions as separate, fully labelled treatments with short
   profile context (e.g. All Pair vs All Pair Honours; Wriggling Snake vs
   Wriggly Snake). Never replace local names with a canonical display name.
5. Expose structural facets as overlapping filters over reviewed concepts or
   patterns. A matching treatment appears once in results even when several
   facets match; facets are links/filters, not duplicated catalogue truth.
6. Keep exact treatment-name/profile search. Add concept-name/alias search
   only for source-supported names attached to reviewed concepts. Search must
   resolve to labelled treatments, not an unqualified universal definition.
7. In **My rules**, show only the exact remembered profile's treatments under
   the reviewed concept groups they support; profile-local qualifiers remain
   visible. Do not imply that another profile's broader concept membership or
   score applies to the remembered profile. In **All rules**, show every
   supported profile treatment and the current unresolved singleton records.
8. Preserve BMJA treatment anchors and route equity when grouped: old BMJA
   anchors must still land on their BMJA treatment inside a group, without
   reassigning an anchor to whichever profile happens to be first.

Before implementation, revise G2/G3 to specify (a) membership versus
inter-concept links versus source aliases as separate fields, (b) treatment
qualifier display and My-rules filtering, (c) unresolved/singleton behavior,
(d) treatment-aware overlapping facet filtering, (e) collision disambiguation,
(f) stable legacy-anchor target selection, and (g) the evidence gate for moving
a proposed group from unresolved to reviewed. This audit does not implement
that UI or data model.

## Machine-readable proof decision

No machine-readable artifact is added. The candidate cases demonstrate a
stable separation of treatment identity, reviewed concept membership,
inter-concept relationships, name facts, structural facets, and treatment
qualifiers. However, several high-value memberships remain unresolved and the
approved proof set is not yet a settled production-neutral schema. The audit
document itself is the reviewable evidence record; creating a parallel
machine-readable proof structure would add a second shape before that schema
is agreed. This does not block a later docs-scoped proof model once the
unresolved cases and field boundaries are reviewed.

## Validation and change boundary

This change is documentation-only. No scorer, binding, Atlas UI, route, source
registry, or score/rules semantic changed. Validate with `git diff --check` and
review every exact identity and unresolved finding against the referenced
current runtime/evidence files.
