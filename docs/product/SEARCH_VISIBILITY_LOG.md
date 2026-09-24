# Mahjong Reference search visibility evidence log

Status: observational evidence log  
Strategy authority: `SEO_GROWTH_STRATEGY.md`

## Purpose

Keep dated search-discovery observations without rewriting the current SEO strategy every time Google changes position, indexing state or presentation.

This log records evidence such as:

- Google Search Console snapshots;
- manual Google result spot checks;
- indexed-page counts and recrawl/title lag;
- Google AI / generated-search descriptions of the product;
- notable changes in which queries or pages Google appears to understand.

It is evidence, not a ranking forecast and not a substitute for Search Console.

## Measurement rules

Keep different evidence types separate.

- **Search Console average position** is an aggregate across real impressions and should not be treated as the same thing as one manual result position.
- **Manual SERP positions** are point-in-time observations and may vary by device, location, account, personalisation and experiment.
- **Google AI/generated-search output** is useful evidence that the crawler/index/search systems can interpret the product, but it is not proof of broad ranking strength, Knowledge Graph entity status, traffic or conversion.
- **Indexing/title lag** should be recorded separately from ranking observations. Google can understand and surface a site before every submitted route or revised title has been refreshed in ordinary results.
- Do not overwrite earlier observations merely because later measurements differ. Preserve the dated evidence and explain methodology differences where needed.

---

## 24 September 2026 — early discovery snapshot

### Indexing / recrawl state

Manual Search Console / Google observation:

- **11 of 19 known public pages indexed**;
- several search-result titles had **not yet refreshed to the current site titles**.

Interpretation: Google was still processing the current public surface. Treat this as crawl/indexing lag, not as evidence that the unrefreshed copy was still the site's intended metadata.

### Manual ranking spot checks

Point-in-time Google observations:

| Query | Observed position | Evidence type | Notes |
| --- | ---: | --- | --- |
| `mahjong calculator` | **#49** | manual Google SERP spot check | Generic, non-branded tool intent. A useful discovery signal, but one manual position is not directly comparable with Search Console average position. |
| `mahjong reference` | **#35** | manual Google SERP spot check | The product name is also a descriptive phrase, so this is not yet a clean navigational-brand query. |

Do **not** replace the 17 September Search Console observation of approximately `6.8` average position for `mahjong calculator` with `#49`. They are different measurements taken at different times and can legitimately diverge: Search Console reports aggregate impression-based position, while `#49` is one manually observed results page.

### Google AI recognition — `smooks mahjong`

A mobile Google search for `smooks mahjong` produced an AI-generated description that correctly identified **Mahjong Reference** as a free browser-based Mahjong table companion/scorer and summarised several real product capabilities, including:

- whole-game Table Companion functions such as scoring hands, tracking payments/settlement, Winds and totals;
- British / BMJA-style rule support;
- provisional Thompson & Maloney Western support and configurable club profiles;
- browser/local-storage use without requiring an account;
- the Scoring Guide and Hand Calculator.

The answer cited multiple `mahjong.smooks.co.uk` pages while synthesising the description.

### Why this is worth recording

The branded query itself is not a ranking achievement: `smooks mahjong` strongly identifies the site.

The useful signal is **machine comprehension**. While the site was still only partially indexed and some displayed titles were stale, Google's generated-search layer could already combine information from the site into a coherent description of:

1. what Mahjong Reference is;
2. the difference between a one-hand scorer and whole-game Table Companion behaviour;
3. the existence/status of multiple rules profiles;
4. the no-account/local-first product model; and
5. the site's learning/scoring resources.

That should be treated as early evidence that the site's product language and information architecture are sufficiently consistent for Google to infer the intended product model.

It is **not** evidence by itself that:

- Mahjong Reference has formal Knowledge Graph entity status;
- the site will rank highly for generic Mahjong queries;
- AI-generated answers will continue to appear unchanged;
- the generated answer will produce meaningful traffic.

### Relationship to the existing SEO evidence

`SEO_GROWTH_STRATEGY.md` contains the earlier Search Console snapshot settled through 14 September 2026, including early page-one tests for several calculator/British-Mahjong intents.

Keep that strategy snapshot intact. This log exists so later observations can accumulate chronologically without making the strategy document a volatile diary.

### Next useful observations

While the site remains young, capture only meaningful changes rather than daily noise:

- indexed public routes moving toward the submitted/canonical set;
- Google refreshing the new page titles/descriptions;
- Search Console query/page evidence after the 24 September multi-profile production release has had time to settle;
- sustained movement of the primary calculator/scorer/British-Mahjong watchlist;
- new non-branded queries reaching useful positions;
- generated-search/AI descriptions only when they reveal a materially new interpretation of the product.
