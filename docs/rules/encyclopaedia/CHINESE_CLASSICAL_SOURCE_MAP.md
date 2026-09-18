# Chinese Classical — 251A1 historical source map

Status: **research map; Babcock 1923 separately admitted, other editions remain gated**  
Parent: #251  
Date checked: 18 September 2026

## Why this is not one A1 corpus

Modern comparison pages use labels such as “Early Classical”, “Late Classical”, “Shanghai New Style” and “Hong Kong New Style”, but those labels can represent reconstructions or families assembled from multiple historical sources.

251A1 must not turn a comparative synthesis into one invented canonical source profile.

## Direct / historically identifiable source candidates

### George Edward Mauger — 1915

George Edward Mauger, *Quelques considérations sur les jeux en Chine et leur développement synchronique avec celui de l'empire chinois*, Société d'Anthropologie de Paris, 1915.

Accessible source page:

- https://www.chineancienne.fr/d%C3%A9but-20e-s/mauger-les-jeux-en-chine/

Mahjong history references identify Mauger's `Ma-Tchio-Pai` section as an early rules description. This is potentially useful for a **named 1915 historical profile**, but it should be indexed from the actual article rather than from a modern “Early Classical” summary.

The public HTML page provides the article and download links, but this research pass did not establish a closed item-level scoring catalogue without deeper source reading. It therefore remains a source pin, not a counted A1 corpus.

### Shen Yifan — early Chinese manual / 1924 edition scan

Mahjong history research identifies `Hui Tu Ma Qiao Pai Pu` / `Huitu maque paipu` by Shen Yifan as an early Chinese Mahjong manual, first published in 1914. A 1924-edition scan has been recovered through modern archival links.

Research locator:

- https://www.sloperama.com/mjfaq/mjfaq11h.html

The scan is a substantial Chinese manual. Converting it into a scoring inventory requires a careful page-level reading/translation and should not be rushed into an A1 count from later summaries. It remains a high-quality historical source pin.

### J. P. Babcock — 1923 rules — ADMITTED SEPARATELY

A public-domain 1923 second edition is available on Wikisource:

- https://en.wikisource.org/wiki/Babcock%27s_Rules_for_Mah-Jongg

Its standard score sheet and optional scoring material were reviewed during this pass. A1 now counts **24 reference-worthy Babcock-local concepts** while excluding primitive pung/kong/pair arithmetic and the base win.

See `BABCOCK_1923_SOURCE_INDEX.md` for the admitted corpus.

Babcock remains a specific Western codification, not a synonym for Chinese Classical as a whole.

### Tchou Kia-kien / Zhu Jiajian — 1924

Direct historical edition:

- Tchou Kia-kien, *Le Mah-Jong tel qu'il est joué par les Chinois*, Les Éditions du Monde Moderne, Paris, 1924.
- accessible historical-library page: https://www.chineancienne.fr/d%C3%A9but-20e-s/tchou-kia-kien-le-mah-jong/

The page exposes substantial direct text and downloadable edition files. Later comparative scholarship identifies **17 special hands** in Tchou 1924, making it a promising finite historical corpus candidate.

However, A1 does **not** promote that secondary count into source truth. Admission still requires extracting and gap-checking the 17 source-local names/treatments from the direct edition itself.

### Historical comparative scholarship

Useful secondary mapping sources include:

- Cofa Tsui / Thierry Depaulis historical comparison material on iMahjong;
- Alan Kwan's historical discussion of early Chinese Classical rules;
- Sloperama historical bibliographies and source chronology.

These are valuable for deciding which historical editions to compare, but should not replace the named original sources when an original is available.

One comparative source is particularly useful as a research map because it reports different finite special-hand counts across historical editions (for example Babcock 1923 and Tchou 1924). Those figures are leads for direct extraction, not automatic A1 counts.

## Candidate A1 strategy

Do not create one generic `Chinese Classical` row set from a modern comparison table.

Continue with bounded historical source profiles such as:

```text
Mauger 1915 description            [source pinned]
Shen Yifan 1924-edition scan       [source pinned; deep reading needed]
Babcock 1923 second edition        [24 concepts admitted separately]
Tchou Kia-kien 1924                [source pinned; 17-hand extraction lead]
[other specifically pinned edition]
```

For each candidate:

1. pin edition/date and provenance;
2. determine the finite scoring vocabulary actually present in that source;
3. distinguish basic set/pair/bonus arithmetic from named limit/special-hand concepts;
4. record source-local names/values only;
5. do not infer that similarly named items across editions are identical;
6. only then decide whether the source is useful enough to add to the counted A1 total.

## Relationship to later A2

Historical lineage is not the same relationship as rules equivalence.

A later Encyclopaedia may want to say that a modern concept is historically related to an older source treatment, but that relationship must be supported separately from “these two executable rulesets implement the same concept”.

Therefore this historical map does not create canonical concept IDs or cross-family edges.
