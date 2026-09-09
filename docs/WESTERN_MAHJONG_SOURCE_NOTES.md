# Issue #72 source-quality notes

## Strong sources for public factual claims

### Thompson & Maloney

- **Simon & Schuster Australia — *The Game of Mah Jong Illustrated*.** Publisher description says scoring is presented in simple tabulated form with worked hand illustrations. The current 2015 edition is 63 pages and includes dedicated Scoring, Special Hands and Doubling Table sections.
  - https://www.simonandschuster.com.au/books/Game-Of-Mah-Jong-Illustrated/Patricia-Thompson/9780864173027
  - https://books.google.com/books/about/Game_of_Mah_Jong_Illustrated.html?id=1SRMCgAAQBAJ
- **Google Books / library catalogue metadata** confirms the older Thompson & Maloney editions and the same scoring-focused structure.
- **The Mah Jong Player's Companion** is best treated as the special-hand catalogue/strategy companion rather than the main ordinary scoring table. Publisher/catalogue descriptions show 120+ hands and a full special-hand synopsis.
- A current Australian council-listed group explicitly says it plays Western Style Mahjong using Thompson & Maloney's *Player's Companion* and uses Half Limit 500, Limit 1,000, Middle Limit 1,500 and Double Limit 2,000 categories:
  - https://www.livingstone.qld.gov.au/Places-and-Spaces/Community-Facilities/The-Community-Centre/Community-Group-Activities/CCHA-Mahjong

### Max Robertson

- **Taunton & District Mahjong Club scoring chart** is indexed under the explicit title *Scoring Chart When Playing Mah Jong Using Max Robertson's Rules*. Search-indexed content confirms Robertson-specific scoring items including 20 points for Mah Jong, 2 points for completing the pair/Sparrow's Head and familiar Wind/Dragon doubles. Where the original PDF cannot be fetched reliably, quote/paraphrase only the indexed facts and corroborate them elsewhere.
- **Onehunga Mahjong scoring sheet** says Max Robertson rules apply, with additional house rules clearly flagged. Its indexed score table gives the ordinary arithmetic in full: minor Pungs 2/4, major/honour Pungs 4/8, minor Kongs 8/16, major/honour Kongs 16/32, Flowers 4, honour pairs 2, wall-draw completion 2 and Mah Jong 20.
  - https://anyflip.com/xfrw/ngrc/basic
- **Tom Sloper's cross-book comparison** says Robertson and BMJA are basically the same rule system and identifies the larger Robertson special-hand list as a major difference. This is useful specialist secondary evidence, not a substitute for Robertson's book on a disputed value.
  - https://sloperama.com/majexchange/bulletinbd-archive46.htm
- Open Library/Google Books/publisher listings confirm current/revised Robertson editions and describe the book as a guide to rules and scoring.

### Current project / British baseline

- Project `BMJA_RULES_REFERENCE.md` remains the source of truth for exactly what the current scorer implements.
- Mahjong British Rules remains the project's source lineage for BMJA rules and clarifications.

## Strong corroborating synthesis, but not a single-ruleset authority

A current-style U3A beginner guide cites Thompson & Maloney alongside BMJA/Peter Gregory and other Western/British sources. It reproduces the same ordinary 2/4/8/16/32 scoring skeleton, 4-point bonus tiles, 2-point honour pairs, 20-point Mah Jong and familiar doubles.

This is excellent evidence that the arithmetic is common across the Western/British family, but because the guide synthesises several sources it must not be described as proof that every exact number came from Thompson & Maloney.

## Useful specialist secondary source

Tom Sloper's Mahjong FAQ/Q&A material is useful for:

- terminology across Western/British/Australian traditions;
- direct comparisons between Robertson, BMJA and Thompson/Maloney books;
- the one-Chow Western rule;
- special-hand exposure/concealment distinctions;
- historical descriptions of Robertson fishing/Goulash rules;
- locating clarifications across multiple editions/books.

Do not make Sloper the sole source for a contentious scoring-table value when a primary rulebook or named-rules scoring sheet can be checked instead.

## Market-language / current-practice evidence only

Current apps, Reddit/forum discussions and informal group sheets are useful for confirming that people actually use phrases such as:

- Western Mahjong;
- Australian-style Western Mahjong;
- British/Western Mahjong;
- Max Robertson rules;
- Thompson & Maloney rules.

They are not sufficient authority for exact scoring rules unless the document explicitly names its source and clearly marks house rules.

## Current strongest evidence points

1. The Robertson/BMJA ordinary score table is extremely close: the 2/4/8/16/32 Pung/Kong ladder, 2-point honour pairs, 4-point Flowers and 20-point Mah Jong all recur in Robertson-derived material.
2. Thompson & Maloney's main rules book explicitly contains a tabulated scoring system and doubling table; practical Western/British material citing it uses the same core arithmetic.
3. The biggest divergence is the **rules profile around the arithmetic**, especially the special-hand catalogue and values.
4. Thompson & Maloney are a major contemporary Australian Western reference, and current groups may explicitly add local rules.
5. The *Player's Companion* contains 120+ hands, far beyond the current BMJA catalogue.
6. At least one current council-listed T&M-based Western group uses 500/1,000/1,500/2,000 hand-value categories.
7. Robertson also has a materially larger special-hand list than BMJA according to direct cross-book comparison.
8. Therefore the current BMJA scorer must not be presented as automatically compatible with Australian Western play, despite substantial reuse potential at the scoring-primitive level.