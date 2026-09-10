# Western / Australian evidence notes preserved from PR #73

This note preserves the parts of draft PR #73 that remain useful after the broader six-pass rules research programme superseded its original document set and `/western-mahjong` implementation handoff.

It is **research evidence, not a scoring specification**. The near-term production path remains BMJA → verified Thompson & Maloney Western → Companion catalogue → Outside the Box. Max Robertson is retained here as comparative evidence only; it is not a current implementation target.

## 1. Why this note exists

PR #73 mixed several concerns:

- Western/Australian terminology and search intent;
- current Australian club practice;
- Thompson & Maloney source discovery;
- Max Robertson comparisons;
- public-page drafting;
- an implementation handoff for a now-superseded `/western-mahjong` route.

The canonical rules programme now owns architecture, provenance, public-content structure and implementation sequencing under `docs/rules/` and issues #51/#83–#91. This file retains only evidence that would otherwise be lost when #73 is closed.

## 2. Current Australian use of “Western Mahjong”

The strongest current-practice finding from #73 is that **Western Mahjong is a live social-game label in Australia, but not one universal national ruleset**.

Current evidence found in that research included:

- Glen Eira U3A describing Western Mah Jong played according to Thompson & Maloney plus local U3A rules;
- U3A Canberra using *The Mah Jong Player's Companion* and describing Western play as close to the classical game but with many more special hands;
- WIZO Victoria teaching Western Mahjong using *The Game of Mah Jong Illustrated* for rules and *The Mah Jong Player's Companion* for hands;
- a Livingstone Shire Council-listed Western-style group using Thompson & Maloney material and Half Limit / Limit / Middle Limit / Double Limit values of 500 / 1,000 / 1,500 / 2,000.

These are useful as **evidence of terminology, real-world use and variation**. They must not be treated as authorities for a universal Australian ruleset.

## 3. Max Robertson comparative evidence

PR #73 also collected useful evidence around Max Robertson's *The Game of Mah Jong*.

Robertson-derived scoring material strongly corroborates the same ordinary arithmetic skeleton seen in the current BMJA implementation:

| Item | Robertson-derived evidence |
|---|---:|
| Minor Pung, exposed / concealed | 2 / 4 |
| Major or honour Pung, exposed / concealed | 4 / 8 |
| Minor Kong, exposed / concealed | 8 / 16 |
| Major or honour Kong, exposed / concealed | 16 / 32 |
| Qualifying honour pair | 2 |
| Flower | 4 |
| Mah Jong | 20 |
| Self-drawn completion | +2 |

This is strong comparative evidence that Robertson and BMJA share a very similar ordinary scoring skeleton.

It does **not** establish ruleset identity. Robertson-derived material also points to differences or edition-sensitive details around:

- small winning/wait bonuses;
- special-hand catalogue size and values;
- fishing values;
- Goulash procedure;
- settlement/progression details;
- club-added house rules.

Tom Sloper's direct cross-book comparison reported a materially larger Robertson special-hand list than BMJA in the editions compared. That is useful secondary evidence, but a future selectable Robertson profile would still require direct checking of the intended current edition.

## 4. Thompson & Maloney arithmetic: evidence level

PR #73 confirmed that *The Game of Mah Jong Illustrated* contains tabulated scoring, worked examples and a doubling table. Western/British teaching material citing Thompson & Maloney strongly corroborates the familiar 2/4/8/16/32 ordinary set-scoring structure.

However, the exact primary-book pages for the complete ordinary table were not available in that pass. Therefore the current canonical evidence position remains correct:

> Treat Thompson & Maloney ordinary scoring as `needs-primary-source` until the relevant pages of *The Game of Mah Jong Illustrated* are directly checked.

The Companion is authoritative for the catalogue facts actually visible in it, but it should not be used by itself to define the underlying Western rules profile.

## 5. Product/search evidence

The first-pass searches behind #73 found a fragmented mix of:

- specialist Mahjong references and Q&A;
- publisher/book pages;
- Australian U3A and community-group pages;
- a small number of apps;
- generic variant-comparison pages.

No clearly dominant browser-based Western/Australian scoring calculator was identified in that pass.

This should be treated only as **directional market/search evidence**. It is not a durable ranking claim because search results vary by engine, geography, personalisation and time.

The useful product conclusion is narrower:

- there is genuine discoverability value in explaining Western/Australian terminology;
- the site should help users identify which rulebook/profile they actually play;
- calculator-intent wording must not imply that the current BMJA scorer supports all Western variants;
- public Western rules content should now follow issue #91 and the #86 evidence gate rather than the old `/western-mahjong` draft from #73.

## 6. Safe retained conclusions

The following conclusions from #73 remain useful:

1. “Western Mahjong” is better treated as a family/tradition label than as one universal ruleset.
2. Contemporary Australian Western play has a visible Thompson & Maloney tradition, often combined with local rules.
3. Max Robertson remains another important Australian/Western published reference line.
4. BMJA, Robertson-derived play and Thompson & Maloney material show strong structural kinship, especially around ordinary points-and-doubles scoring.
5. The largest compatibility risks sit around special hands, limit categories, fishing, exposure, winning bonuses, Goulash, settlement/progression and local rules.
6. Similarity in ordinary arithmetic is not enough to advertise the current BMJA scorer as a universal Western/Australian scorer.
7. Robertson research should remain evidence-only unless future demand justifies a dedicated profile.

## 7. Source-quality hierarchy for this preserved evidence

Prefer sources in this order when revisiting these findings:

1. the intended current editions of Thompson & Maloney's *The Game of Mah Jong Illustrated* and Max Robertson's *The Game of Mah Jong*;
2. publisher metadata/previews where they expose factual edition or structural information;
3. scoring sheets that explicitly name the source rulebook and clearly distinguish local house rules;
4. current Australian U3A/council/group material for evidence of live terminology and table practice;
5. specialist secondary references such as Tom Sloper for cross-book history/comparison;
6. apps/forums only as market-language or demand evidence, not scoring authority.

### Sources identified in PR #73

- Simon & Schuster Australia — *The Game of Mah Jong Illustrated*
- Simon & Schuster Australia — *The Mah Jong Player's Companion*
- Penguin Australia — Max Robertson, *The Game of Mah Jong*
- Glen Eira U3A 2026 course catalogue
- U3A Canberra Western Mahjong
- WIZO Victoria Western Mahjong course
- Livingstone Shire Council Western Style Mahjong group
- Onehunga Mahjong scoring sheet stating Max Robertson rules with separately flagged house rules
- Taunton & District Mahjong Club Robertson scoring material
- Tom Sloper Mahjong FAQ/Q&A cross-book material

Exact URLs remain available in the history of PR #73 and issue #72. If any of this evidence is promoted into executable scoring behaviour, move the specific source into `SOURCE_REGISTER.md` with an exact locator and evidence status.

## 8. Deliberate non-actions

This preserved evidence does **not** create:

- a Max Robertson implementation issue;
- a generic Australian rules profile;
- a new `/western-mahjong` route;
- another rules architecture pass;
- a universal Western scoring engine;
- any additional house-rule switches.

Those decisions remain evidence- and demand-gated.