# Western Mahjong scoring comparison — BMJA, Max Robertson and Thompson/Maloney

> Working research note for issue #72. This is not a public rulebook and does not create a new scoring profile.
>
> Confidence labels matter. Exact Thompson/Maloney primary scoring pages are not freely visible in the current web sources, so values attributed to that tradition are separated into **primary-book structure confirmed** and **strongly corroborated Western-family values**.

## Short answer

The deeper research suggests a more precise product position than simply saying the systems are different:

> **British/BMJA, Max Robertson and Thompson/Maloney Western Mahjong share a very similar ordinary scoring skeleton. The major differences sit around special hands, limit categories, fishing and table rules.**

That means the current scorer is technically closer to Australian/Western play than the size of the special-hand difference first suggested — but it is still unsafe to call it a universal Western Mahjong calculator.

## Ordinary score table

| Scoring item | Current BMJA scorer | Max Robertson-derived evidence | Thompson/Maloney evidence |
| --- | ---: | ---: | --- |
| Minor Pung, exposed | 2 | 2 | 2 in Western/British synthesis citing T&M |
| Minor Pung, concealed | 4 | 4 | 4 in same synthesis |
| Major/honour Pung, exposed | 4 | 4 | 4 in same synthesis |
| Major/honour Pung, concealed | 8 | 8 | 8 in same synthesis |
| Minor Kong, exposed | 8 | 8 | 8 in same synthesis |
| Minor Kong, concealed | 16 | 16 | 16 in same synthesis |
| Major/honour Kong, exposed | 16 | 16 | 16 in same synthesis |
| Major/honour Kong, concealed | 32 | 32 | 32 in same synthesis |
| Dragon pair | 2 | 2 | 2 in same synthesis |
| Own Wind pair | 2 | 2 | 2 in same synthesis |
| Prevailing/Round Wind pair | 2 | 2 | 2 in same synthesis |
| Flower | 4 | 4 | 4 in same synthesis |
| Mah Jong | 20 | 20 | 20 in same synthesis |
| Draw completing tile from wall | +2 | +2 | +2 in same synthesis |

### Confidence

**Max Robertson:** strong. A scoring sheet explicitly described as using Robertson rules is indexed by Taunton & District Mahjong Club, and the Onehunga sheet states that Max Robertson rules apply while separately flagging house rules. The core values above are internally consistent across those sources.

**Thompson/Maloney:** medium-to-strong for the numbers, strong for the scoring architecture. Simon & Schuster and Google Books confirm that *The Game of Mah Jong Illustrated* contains a dedicated scoring chapter, simple tabulated scoring, worked examples and a doubling table. A Western/British U3A teaching guide citing Thompson/Maloney reproduces the exact same ordinary table. Until the relevant primary-book pages are directly checked, public copy should say the systems share the same/similar scoring structure rather than claiming every cell is definitively a Thompson/Maloney rule.

## Doubles and whole-hand ideas

There is similarly strong overlap around familiar doubles:

- Pung/Kong of Dragons;
- Pung/Kong of own Wind;
- Pung/Kong of prevailing/Round Wind;
- own Flower/Season;
- one suit with Winds/Dragons;
- concealed Mah Jong / buried treasure-type scoring;
- Purity as a strong multi-double pattern.

Robertson-derived material explicitly lists Purity as three doubles, matching the current BMJA project's treatment.

The detailed bouquet interaction deserves care. Specialist Robertson discussion indicates that where the bouquet already incorporates the own Flower/Season benefit, it should not be counted twice. Do not generalise the project's exact bonus-tile implementation to every Western table without checking the named profile.

## A real difference: small winning/wait bonuses

Robertson-derived club material also includes small +2 bonuses that are not a one-to-one match with the current project's displayed BMJA winner rules, including examples such as:

- completing the pair/Sparrow's Head;
- certain middle/edge Chow completions;
- a Pung/Kong from East's first discard.

These are precisely the sort of details that show why matching the headline Pung/Kong table is not enough to claim ruleset compatibility.

Before building a Robertson profile, each such item should be checked against the current Robertson edition and separated from any club house rule.

## The major divergence: special hands

This is where the traditions spread apart dramatically.

### BMJA project

The current project uses the BMJA-style special-hand list and its documented 500/1,000 values plus specific special-fishing treatment.

### Max Robertson

Tom Sloper's direct book comparison describes Robertson and BMJA as basically the same rule system but reports **41 Robertson special hands** versus **19 BMJA hands** in the editions he compared. This makes special-hand profile, rather than base arithmetic, the clearest Robertson/BMJA distinction.

### Thompson & Maloney

*The Mah Jong Player's Companion* is a large special-hand reference with **more than 120 hands**. Current Australian groups using it can also use value categories beyond the current BMJA project's fixed special values.

A current Livingstone Shire Council listing for a Thompson/Maloney Western-style group explicitly uses:

- Half Limit — **500**
- Limit — **1,000**
- Middle Limit — **1,500**
- Double Limit — **2,000**

Specialist discussion of Thompson/Maloney play also notes that many Western special hands may score full limit concealed and half limit exposed, while others have their own concealment requirement or double-limit treatment.

This is a **material rules difference**, not merely alternative terminology.

## Fishing

Fishing is common language across the family, but the amount and method are not safely interchangeable.

The current BMJA project has explicit pattern-specific fishing values such as 200 and 400 and can compare them with intrinsic value where required.

Historical Robertson descriptions report a simpler limit-linked treatment, including 200 for a half-limit target, 400 for a limit target and 500 for a double-limit target. That should be treated as edition-sensitive until checked directly against the current Robertson book.

The Thompson/Maloney special-hand universe is larger again, so a future implementation would need the fishing treatment attached to each named profile rather than assuming the current BMJA detector can simply recognise additional layouts.

## Goulash and table rules

All three traditions recognise Goulash, but this is another area where the exact mechanics can diverge.

Robertson sources describe specific exchange, Chow and East-progression conventions. Australian groups frequently add local rules. Therefore a future rules-profile design should keep at least these concepts independent:

- ordinary hand scoring primitives;
- special-hand catalogue;
- special-hand values;
- fishing values;
- settlement rules;
- game progression;
- Goulash profile;
- optional local/house rules.

## Architecture consequence

This research strengthens the case for the existing `GameRuleset` direction rather than for a second scorer.

Conceptually, a future implementation could reuse shared primitives such as:

```text
Pung/Kong/pair/bonus scoring
        ↓
common scoring result model
        ↓
named rules profile
        ├── BMJA
        ├── Max Robertson (future)
        └── Thompson/Maloney Western (future, if evidence/product demand supports it)
```

The profile would then supply or control:

- permitted ordinary hand structure;
- doubles;
- completion/wait bonuses;
- special-hand catalogue and values;
- fishing treatment;
- settlement/progression;
- Goulash behaviour.

This is **not** an implementation recommendation for issue #72 itself. #72 remains an explainer/discoverability page only.

## Public wording we can now use safely

Good:

> British Mahjong and Australian Western Mahjong are close relatives. Their ordinary Pung and Kong scoring can look remarkably similar, but special hands and table rules can differ substantially.

> If your group uses Max Robertson or Thompson & Maloney, do not assume every hand in this British scorer has the same value. Check which rulebook or local hand list your table uses.

Avoid:

> This calculator works for Western Mahjong.

> Australian Mahjong uses the same scoring as BMJA.

> Thompson & Maloney rules are just BMJA with more special hands.

The first two are unsupported. The third is too reductive because finishing bonuses, fishing, limits, Goulash and local rules may also differ.

## Sources used in this pass

- Simon & Schuster, *The Game of Mah Jong Illustrated* — confirms tabulated scoring and worked score examples: https://www.simonandschuster.com.au/books/Game-Of-Mah-Jong-Illustrated/Patricia-Thompson/9780864173027
- Google Books, 2015 *Game of Mah Jong Illustrated* — confirms scoring/special-hands structure and current edition: https://books.google.com/books/about/Game_of_Mah_Jong_Illustrated.html?id=1SRMCgAAQBAJ
- Livingstone Shire Council, current Western Style Mahjong group — T&M Player's Companion and 500/1000/1500/2000 categories: https://www.livingstone.qld.gov.au/Places-and-Spaces/Community-Facilities/The-Community-Centre/Community-Group-Activities/CCHA-Mahjong
- Onehunga scoring sheet — states Max Robertson rules apply with house-rule additions and exposes the ordinary table: https://anyflip.com/xfrw/ngrc/basic
- Tom Sloper, Robertson vs BMJA comparison — direct cross-book comparison and special-hand counts: https://sloperama.com/majexchange/bulletinbd-archive46.htm
- Tom Sloper, Thompson/Maloney Q&A and cross-book checks — useful secondary evidence for exposure/limit handling and specific rule interpretations: https://sloperama.com/majexchange/bulletinbd.htm

## Remaining primary-source gaps

Before any future Robertson or Thompson/Maloney selectable scorer profile, obtain/check the relevant current-edition pages for:

1. full doubling table;
2. all completion/wait bonuses;
3. rounding order;
4. exact all-player settlement formula and East multiplier;
5. game progression after East wins/loses/draws;
6. Goulash rules;
7. full special-hand catalogue with exposure/concealment flags;
8. special-hand fishing values; and
9. whether current editions differ from the older editions represented in secondary material.

Those gaps do **not** block the `/western-mahjong` relationship/explainer page.