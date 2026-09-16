# Rules platform registry audit v1

Status: **pre-implementation audit for #230 / 227-B**  
Branch target: `integration/rules-platform-v1`  
Inputs: `RULES_PLATFORM_EIGHT_MANIFESTS_V1.md`, `RULES_PLATFORM_REGISTRY_INVENTORY.md`, `RULES_PLATFORM_SENIOR_REVIEW_HARDENING_V1.md`, `CLASSICAL_PROFILE_CONFIG_MATRIX.md`.

## 1. Purpose

Audit the rule dimensions that a player/club actually recognises at the table and make sure each one has one clear architectural owner before Codex implements the registries.

The requested authoring dimensions are:

1. which rules/patterns are used;
2. how points/value are scored;
3. penalties/liability;
4. Goulash/alternate hand mode;
5. whether East/dealer stays after a draw;
6. table limit/cap;
7. Flowers/Seasons;
8. bonuses.

The key rule is:

> **These are not one generic “house rules” object. Each dimension belongs to the narrowest registry or grammar that actually owns its semantics.**

A future Plus rules builder may present them together as one friendly questionnaire, but the stored resolved profile must keep the underlying concepts separate.

---

## 2. User-facing dimension → architectural owner

| Human question | Architectural owner | Safe authoring model | Important non-merge |
|---|---|---|---|
| Which named hands/patterns do we use? | canonical `pattern.*` detectors + profile-local catalogue/binding registry (`classical.*`, `catalogue.pattern.*`, `catalogue.yaku.*`, `catalogue.yakuman.*`, `catalogue.target.*`) | include/exclude known pattern; set profile-local value/exposure where grammar allows | detector identity is not score/value; user cannot author arbitrary predicate code |
| How do we score? | selected scoring grammar + its typed config | values/selectors within compatible grammar | Classical points/doubles ≠ accumulator fan/tai ≠ Riichi han/fu ≠ target-catalogue matching |
| Do we use penalties/liability? | `incident.*` / `procedure.*` plus settlement consequence | known preset/policy + validated parameters | penalty trigger is not ordinary hand score |
| Do we use Goulash? | `hand-mode.*` | choose registered mode preset | not a boolean; BMJA and OTB Goulash are not assumed identical |
| Does East stay after a draw? | `progression.*` strategy; family-specific capability metadata may expose a friendly control | finite validated strategy parameter/preset | dealer identity does not own pass/retain/rotate |
| What is the table limit? | grammar-specific value/limit policy | numeric value only where the active grammar supports that concept | Classical table limit ≠ Riichi limit tiers ≠ Zung Jung formal cap |
| Do we use Flowers/Seasons? | tile-set inventory **and separately** grammar-specific scoring bindings/policies | physical presence + scoring treatment configured independently | Flowers ≠ Riichi dora; a tile may exist but score zero |
| What bonuses do we use? | grammar-specific scoring capabilities | enable/value known bonus rule inside the active grammar | there is deliberately no universal `bonus.*` registry spanning all families |

This gives the future UI one coherent questionnaire without creating one incoherent runtime object.

---

## 3. Pattern/catalogue audit

### Classical / Western

Known structural detectors remain score-neutral. Profiles bind them independently with membership, name, value, exposure and score model.

Current profile evidence:

- **BMJA** — finite approved special catalogue plus calculated Purity behavior;
- **T&M Western** — larger explicit binding catalogue; values/exposure may differ from BMJA and ordinary baseline remains provisional where primary-source work is incomplete;
- **Outside the Box** — 33 club bindings, mostly using known detectors with local values/exposure plus several T&M-derived overrides;
- **Buzzard 2000** — source-defined limit/special conditions, including structural and event/context conditions;
- **European Classical paper profile** — Classical grammar with a profile-local special catalogue still architecture/source-gated.

Authoring decision:

```text
custom profile may:
  include/exclude a known canonical pattern
  choose an allowed profile-local value
  choose allowed exposure/fishing treatment

custom profile may not:
  upload JavaScript
  write a free-form pattern expression
  redefine what pattern.big-three-dragons structurally means
```

### Pattern-accumulator families

- Hong Kong: profile/versioned fan catalogue — production authority still unresolved.
- MCR: source-pinned 81-fan catalogue; executable corpus still required.
- Taiwanese: profile tai catalogue — production authority still unresolved.
- Zung Jung: 44-pattern catalogue; exact production locators/corpus still required.

### Riichi family

Pattern membership is split deliberately into:

- `catalogue.yaku.*`;
- `catalogue.yakuman.*`;
- irregular/special hand-shape catalogue where required.

Sanma reuses the Riichi scoring grammar but may bind a different source-pinned catalogue/version.

### American target-catalogue family

The annual target catalogue is not a canonical-pattern list. It is versioned external catalogue data plus substitution/exposure/value policies. Current commercial card contents must not be assumed or distributed without an approved lawful source path.

---

## 4. Scoring/value audit

| Profile/family | Value derivation |
|---|---|
| BMJA / T&M / OTB / Buzzard / European Classical | intrinsic/additive points + doubles/multipliers + special/limit treatment |
| Hong Kong | fan-pattern accumulator + qualification/minimum + fan-to-payment/value conversion |
| MCR | 81-pattern point accumulator + formal non-combination + **8 qualifying points before Flowers** + Flowers afterwards |
| Taiwanese | tai-pattern accumulator + profile interaction/qualification + optional table cap where selected |
| Riichi | lawful interpretation → yaku/yakuman + han + dora + fu + limit tiers/hand value |
| Sanma | same Riichi grammar with Sanma tile/dora/payment/profile variants |
| Zung Jung | 44-pattern point accumulator + same-series-highest-only + zero-pattern floor + formal 320 cap |
| American | target-catalogue match + Joker/substitution + exposure + catalogue-defined value |

Authoring decision:

- published authority profiles remain reviewed/locked records;
- derived custom profiles may override only capabilities explicitly marked `customisable` for that family/grammar;
- Classical is the first broad user-customisable scoring surface because its vocabulary is already well mapped;
- other grammars gain editable value selectors only after their executable/source corpus proves the exact safe dimensions.

Do not make “score points” a universal numeric table.

---

## 5. Penalty / liability audit

Penalty rules are table-running incidents or procedures, not hand-value rules.

### Current Classical evidence

- BMJA: source procedure exists for several incidents, but current runtime coverage is not yet a complete generic penalty engine.
- T&M: current evidence incomplete.
- OTB: explicit club incidents already exercised in runtime, including incorrect hand/tile count, false Mahjong, cannon/liability, false discard naming and wrong tile claims.
- Buzzard: source-specific dangerous discard, false Mahjong and incorrect-hand consequences.

### Other families

The eight paper manifests are not a complete penalty audit. Most do not currently declare incident policies. Riichi has a source/versioned `procedure.*` seam; source-linked penalty/chombo behavior belongs there or in registered incident policies when implemented.

Authoring decision:

- **preset/policy first**, not arbitrary penalty formula;
- user may enable/disable known incident policies where a profile permits it;
- numeric parameters may be exposed only when the registered incident policy explicitly declares them safe/customisable;
- settlement consequence remains separate from the trigger.

This supports “Do you use penalties?” without creating a scripting language.

---

## 6. Goulash / alternate hand-mode audit

Known registered modes:

```text
hand-mode.none
hand-mode.bmja-goulash
hand-mode.outside-the-box-goulash
```

Current evidence:

- BMJA: Goulash exists;
- OTB: Normal draw → Goulash; Goulash draw → Goulash; winner → Normal, with profile-specific blank/Chow legality;
- T&M: source verification pending;
- Buzzard: no Goulash identified in the source set used for the current profile;
- eight external paper manifests: no alternate hand mode currently declared; absence is architecture state, not proof that every real-world local variant lacks one.

Authoring decision:

> The friendly UI may ask “Do you play a Goulash after a draw?”, but the stored choice is a **registered hand-mode preset**, never a bare boolean.

---

## 7. East/dealer-on-draw audit

Dealer identity and dealer movement are separate. `progression.*` is the sole owner of retain/pass/rotate behavior.

Known current behavior:

| Profile | Draw/dealer behavior currently represented |
|---|---|
| BMJA | East retains after a draw/dead hand |
| T&M current runtime | inherits current Classical behavior; primary-source status provisional |
| OTB | East retains after draw; OTB hand mode may additionally move into/remain in Goulash |
| Buzzard | East retains after draw |
| European Classical paper profile | rotate after every hand → no draw retention |
| MCR | always-pass progression → no draw retention |
| Zung Jung | always-pass progression → no draw retention |
| Riichi | source-profile `renchan` progression; outcome/tenpai context may matter |
| Sanma | source-profile Sanma renchan; exact production rules still source-gated |
| Hong Kong | production progression unresolved |
| Taiwanese | production progression unresolved |
| American | production progression unresolved |

Customisation decision for Classical/Western:

Expose a family-safe capability conceptually equivalent to:

```text
classical.progression.east-retains-on-draw : boolean
```

It maps to validated parameters of the selected Classical progression strategy. It is **not** a universal dealer flag and cannot be applied to MCR/Riichi/American profiles.

A later source-proven need may expose additional Classical progression parameters, but no arbitrary progression expression is permitted.

---

## 8. Table limit/cap audit

“Table limit” is a useful human phrase but not one universal rule concept.

| Profile/family | Current limit/cap shape |
|---|---|
| BMJA | ordinary default limit 1000 |
| T&M | current runtime 1000; fixed specials may exceed according to profile binding semantics |
| OTB | ordinary default limit 1000 with profile-specific fixed-special/bonus-side handling |
| Buzzard | source example/default 600; table-agreed limit |
| European Classical paper profile | Classical limit capability exists but executable/source value not yet pinned in the paper manifest |
| Hong Kong | profile cap/value policy unresolved |
| MCR | no table cap represented in the current profile contract; qualification threshold is a different concept |
| Taiwanese | optional table cap policy represented |
| Riichi / Sanma | formal limit tiers/hand-value policies, **not** a generic table-limit field |
| Zung Jung | formal 320 cap/listed-limit policy |
| American | catalogue-defined value; no generic table cap currently established |

Authoring decision:

- `classical.limit.default` remains a strong v1 custom option;
- a generic UI label “Table limit” is shown only for profiles whose capability metadata declares a genuinely adjustable table limit;
- Riichi limit tiers and Zung Jung formal cap must never be wired to the Classical table-limit control merely because all restrict high scores.

---

## 9. Flowers / Seasons audit

Two separate questions are required:

```text
A. Are these physical tiles part of this profile's tile set?
B. If present, what scoring meaning do they have?
```

### Classical / Western

BMJA, OTB and Buzzard use Flowers/Seasons. Known configurable dimensions include:

- points per bonus tile;
- own Flower doubles;
- own Season doubles;
- complete Flower-set doubles;
- complete Season-set doubles;
- complete-set combination semantics (`replace-own` vs `additive`).

T&M current runtime inherits provisional behavior pending full source confirmation. European Classical paper profile has bonus tiles enabled but exact scoring values remain source-gated.

### Pattern-accumulator families

- Hong Kong paper profile uses a 144-tile Flowers/Seasons-capable set; exact scoring profile unresolved.
- MCR uses Flowers as a **post-qualification bonus**: they do not rescue a hand below the 8-point legal threshold.
- Taiwanese paper profile has bonus tiles enabled; exact scoring policy unresolved.
- Zung Jung paper profile uses standard 136 tiles; no Flower scoring layer is represented.

### Riichi / Sanma

No Flowers/Seasons scoring layer is represented. Red fives, dora and Sanma nuki-dora are different concepts and must remain separate.

### American

The current architecture manifest only proves a Joker-capable target-catalogue tile set. Flower presence/scoring is not yet formally represented by the paper manifest and must not be guessed during #230.

Authoring decision:

For Classical custom profiles, Flowers/Seasons are a strong v1 surface. The UI can present them together, but the resolver stores tile-set presence separately from scoring behavior.

---

## 10. Bonus audit

There is deliberately **no universal bonus registry** because “bonus” means materially different things across grammars.

### Classical

Known capabilities include additive point bonuses and separate doubles, for example:

```text
classical.bonus.only-possible-tile
classical.bonus.standing-hand
classical.bonus.no-chows
classical.bonus.scoreless-hand
classical.bonus.last-wall
classical.bonus.loose-tile
classical.bonus.completed-pair-minor
classical.bonus.completed-pair-major
classical.bonus.concealed-hand

classical.double.concealed-hand
classical.double.rob-kong
classical.double.last-wall
classical.double.loose-tile
classical.double.final-discard
classical.double.original-call
```

Additive concealed-hand points and concealed-hand doubles remain independent.

### MCR

Flowers are a pattern-accumulator **post-qualification bonus**, not a cap/floor rule and not a Classical bonus.

### Riichi / Sanma

Dora/ura-dora/kan-dora and Sanma nuki-dora are governed by `dora.*`; they are not yaku and not Classical bonus rules.

### Other accumulators / target catalogue

Any future bonus layer remains profile/grammar-owned until source evidence proves a reusable policy.

Authoring decision:

The Plus UI may use the friendly heading “Bonuses”, but each control must write to its grammar-specific capability. No universal `bonus.*` runtime abstraction is introduced.

---

## 11. Cross-profile audit matrix

Legend: **explicit** = represented in current source/contract; **provisional** = current executable/secondary-source behavior only; **unresolved** = architecture slot exists but production authority/value not pinned; **none represented** = no such layer in the current manifest, not a universal historical claim.

| Profile | Patterns/catalogue | Score model | Penalties | Goulash/mode | East/dealer on draw | Limit/cap | Flowers | Bonus layer |
|---|---|---|---|---|---|---|---|---|
| BMJA | explicit special catalogue | Classical points+doubles | source procedures; incomplete generic runtime | BMJA Goulash | retains | 1000 | explicit | Classical points/doubles |
| T&M Western | explicit profile catalogue | Classical, ordinary baseline provisional | unresolved | provisional | current Classical behavior, provisional | 1000 current; special treatment differs | provisional | provisional Classical |
| Outside the Box | 33 club bindings | Classical + club policies | explicit incidents/liability | OTB Goulash | retains | 1000 | explicit | explicit club/Classical |
| Buzzard 2000 | source-defined limit/special conditions | Classical points+doubles | explicit source incidents | none identified | retains | table-agreed; 600 example/default | explicit | explicit additive bonuses/doubles |
| European Classical | profile-local specials unresolved | Classical | none represented | none represented | rotates every hand | source value unresolved | 144, scoring unresolved | additive concealed bonus proved |
| Hong Kong | fan catalogue unresolved | fan accumulator + conversion | none represented | none represented | unresolved | cap/value policy unresolved | 144; scoring unresolved | unresolved/profile-owned |
| MCR 2006 | 81 fan | point accumulator + non-combination + threshold | none represented | none represented | always pass | no table cap represented | 144 | Flowers post-qualification |
| Taiwanese | tai catalogue unresolved | tai accumulator | none represented | none represented | unresolved | optional table cap | 144; scoring unresolved | unresolved/profile-owned |
| Riichi EMA 2025 | yaku + yakuman | han/fu + dora + limits | procedure seam; detailed penalty corpus later | none represented | renchan strategy | Riichi tiers, not table limit | no | dora modules |
| Sanma | Riichi-family yaku/yakuman variant | Riichi han/fu + Sanma dora/payment | unresolved/profile procedure | none represented | Sanma renchan | Riichi-family tiers | no | red/nuki dora modules |
| Zung Jung | 44 patterns | additive points + series exclusion | none represented | none represented | always pass | formal 320 cap | no | no separate bonus layer represented |
| American target catalogue | annual target catalogue | target match/catalogue value | unresolved | none represented | unresolved | none established | unresolved in current manifest | catalogue/profile-owned |

---

## 12. Namespace ownership audit

The eight normalised manifests currently use or depend on these ID namespaces.

| Namespace | Owner | Audit result |
|---|---|---|
| `family.*` | family registry | covered by senior hardening |
| `tiles.*` | tile-set registry | covered |
| `seats.*` | seat registry | covered |
| `dealer.*` | dealer representation only | covered, but transition-flavoured paper IDs must be normalised before playable |
| `shape.*` | hand-shape registry | covered |
| `validation.*` | validation registry | covered |
| `classical.*` | Classical family capability/binding registry | covered |
| `catalogue.pattern.*` | accumulator/classical special pattern catalogues | covered |
| `interaction.*` | pattern interaction registry | covered |
| `qualification.*` | qualification registry | covered |
| `interpretation.*` | accumulator interpretation registry | covered by senior hardening |
| `value-policy.*` | floor/cap/listed-limit registry | covered |
| `conversion.*` | value/payment conversion registry | covered |
| `catalogue.yaku.*` / `catalogue.yakuman.*` | Riichi catalogues | covered |
| `riichi-decomposition.*` | Riichi decomposition registry | covered by senior hardening |
| `fu.*` | Riichi fu registry | covered |
| `dora.*` | Riichi dora registry | covered |
| `riichi-limit-tier.*` | Riichi limit-tier registry | covered by senior hardening |
| `riichi-hand-value.*` | Riichi hand-value registry | covered by senior hardening |
| `catalogue.target.*` | target-catalogue registry | covered |
| `target-match.*` | target matcher | covered by senior hardening |
| `substitution.*` | Joker/substitution policy | covered |
| `target-exposure.*` | target exposure policy | covered by senior hardening |
| `target-value.*` | target value policy | covered by senior hardening |
| `evidence-policy.*` | evidence-policy registry | covered by senior hardening |
| `evidence.*` | evidence-field registry | covered |
| `settlement.*` | settlement registry | covered |
| `progression.*` | progression registry | covered |
| `game-end.*` | game-end registry | covered |
| `procedure.*` / `incident.*` | procedure/incident registry | covered |
| `hand-mode.*` | hand-mode registry | covered; required by current Classical audit even though absent from eight external manifests |
| `source.*` | **provenance source registry** | **GAP: namespace used by manifests but not formally assigned a typed registry category** |
| current MCR `value-policy.mcr-flowers` | currently cap/floor namespace | **GAP: wrong semantic drawer for a post-qualification bonus** |

### Required amendment A — provenance source registry

Add a non-executable metadata registry:

```text
source.*
```

It owns stable source/provenance identities and locators/authority metadata. It is not scorer code. Source metadata is stored with provenance but does not enter the executable semantic fingerprint merely because a citation/locator changes; a semantic rules change still requires the appropriate profile/catalogue/registry version or semantic revision change.

### Required amendment B — accumulator post-qualification bonus registry

Add a grammar-specific category:

```text
post-qualification-bonus.*
```

Use it for policies applied after legal qualification in the pattern-accumulator grammar, initially:

```text
post-qualification-bonus.none
post-qualification-bonus.mcr-flowers
```

The MCR paper manifest's current conceptual `value-policy.mcr-flowers` should be interpreted/normalised as `post-qualification-bonus.mcr-flowers` before executable implementation.

This keeps:

```text
value-policy.*              = floor/cap/listed-limit
post-qualification-bonus.* = bonus applied after qualification
```

and avoids creating a universal cross-family bonus abstraction.

---

## 13. Plus/custom-profile authoring stance

The user's desired rule-builder surface is accepted, with family-safe boundaries.

### Strong first-wave controls for Classical/Western custom profiles

- starting published/club preset;
- known special-pattern include/exclude;
- permitted profile-local special value/exposure controls;
- ordinary point values where marked customisable;
- ordinary doubles/bonus values where marked customisable;
- table limit;
- Flowers/Seasons physical use + scoring behavior;
- Goulash preset (`none`, BMJA, OTB as available);
- Classical East-retains-on-draw progression capability;
- known bonus rules such as Standing Hand/only-possible-tile/concealed points;
- penalties/incidents as advanced registered presets/policies.

### Later / source-gated family controls

HK/MCR/Taiwanese/Zung Jung/Riichi/Sanma/American authoring controls should be exposed only after the executable source corpus identifies which values/policies are legitimately configurable without changing grammar semantics.

### Never user-authored in V1

- JavaScript/functions;
- arbitrary pattern expressions;
- arbitrary settlement formulas;
- arbitrary progression scripts;
- arbitrary fu/yaku algorithms;
- arbitrary catalogue scraping/distribution;
- arbitrary penalty formulas.

---

## 14. Additions to #230 acceptance gate

Before #230 is complete, tests/registries must prove:

1. every namespace referenced by all eight manifests maps to exactly one registry category, **including `source.*`**;
2. MCR post-qualification Flowers do not live in the cap/floor registry;
3. `post-qualification-bonus.*` is type-distinct from `value-policy.*`, Classical bonuses and Riichi dora;
4. known patterns can be bound differently by profile without changing their canonical detector;
5. customisable capability metadata can describe all eight requested human dimensions without a generic “house rule” bag;
6. `classical.progression.east-retains-on-draw` (or semantically equivalent stable capability) maps only to a Classical-compatible progression strategy parameter;
7. Goulash authoring selects a registered hand-mode preset, not a boolean;
8. Flowers/Seasons presence and scoring treatment are independently representable;
9. penalties/incidents select registered policies and cannot embed arbitrary formulas;
10. a control that is valid for one grammar/family is rejected when applied to an incompatible profile.

---

## 15. Audit conclusion

The requested user-facing dimensions fit the approved architecture without adding a fifth scoring grammar or a generic rule DSL.

The audit found two concrete registry bookkeeping changes before implementation:

1. add `source.*` as a formal non-executable provenance registry;
2. separate accumulator post-qualification bonuses from `value-policy.*` via `post-qualification-bonus.*`.

It also confirms the intended product model:

> **The UI may feel like one simple “How does your table play?” questionnaire. Underneath, each answer goes to the correct typed drawer.**
