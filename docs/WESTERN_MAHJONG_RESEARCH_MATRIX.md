# Western / Australian / British Mahjong research matrix

> Companion working note for issue #72. This deliberately separates **verified overlap**, **verified difference**, and **still-to-check** items so public copy does not overclaim.

## Scoring comparison after second research pass

| Topic | British / BMJA-style project | Australian / Western evidence | Confidence / public use |
| --- | --- | --- | --- |
| Core groups | Pung, Kong, Chow, pair | Same vocabulary across Robertson and Thompson/Maloney traditions | High — safe overlap |
| Ordinary Chow limit | At most one Chow | Western references explicitly state at most one Chow in an ordinary hand | High — safe overlap |
| Minor Pung | 2 exposed / 4 concealed | Robertson-derived scoring sheets use 2 / 4; Western/British teaching material citing Thompson/Maloney uses the same table | High for Robertson; strong corroboration for T&M |
| Major / honour Pung | 4 exposed / 8 concealed | Robertson-derived scoring sheets use 4 / 8; Western/British teaching material citing Thompson/Maloney uses the same table | High for Robertson; strong corroboration for T&M |
| Minor Kong | 8 exposed / 16 concealed | Robertson-derived scoring sheets use 8 / 16; same table appears in Western/British teaching material citing Thompson/Maloney | High for Robertson; strong corroboration for T&M |
| Major / honour Kong | 16 exposed / 32 concealed | Robertson-derived scoring sheets use 16 / 32; same table appears in Western/British teaching material citing Thompson/Maloney | High for Robertson; strong corroboration for T&M |
| Dragon / own-Wind / prevailing-Wind pair | 2 | Robertson-derived scoring sheets use 2 for these honour pairs; same values appear in Western/British teaching material citing T&M | High for Robertson; strong corroboration for T&M |
| Flowers & Seasons | 4 points each plus relevant doubles | Western/Robertson-derived material uses 4 points per Flower; T&M material clearly includes Flowers/Seasons and doubling treatment | Strong overlap; exact bouquet treatment should be described carefully |
| Mah Jong | 20 points | Robertson-derived tables explicitly use 20; Western/British teaching material citing T&M also uses 20 | Strong overlap |
| Self-drawn winning tile | +2 | Robertson-derived scoring table includes +2 for drawing the completing tile from the wall; same value appears in Western/British teaching material citing T&M | Strong overlap |
| Other finishing bonuses | Current BMJA project uses its documented BMJA winner rules | Robertson-derived club table also lists +2 for completing the pair, certain edge/middle waits and first East discard; not all should be assumed to be universal Robertson/T&M without primary-book confirmation | Difference / caution |
| Base score + doubles | Yes | Both Robertson and Thompson/Maloney material use a base-points-then-doubles structure | High — safe conceptual overlap |
| Dragon / own Wind / prevailing Wind doubles | Yes | Robertson scoring material explicitly lists these as doubles; T&M/British teaching material does too | High overlap |
| Own Flower / Season double | Yes | Western material supports own Flower/Season doubles | High overlap |
| Bouquet treatment | Full bouquet produces additional doubling under BMJA rules | Western sources also use bouquet scoring; secondary Robertson guidance warns against double-counting the own Flower/Season inside a bouquet | Similar concept; implementation detail needs primary check |
| Purity | Three doubles | Robertson-derived scoring material explicitly lists Purity as three doubles; Thompson/Maloney discussions use the same concept | Strong overlap |
| Losing hands | Can score and affect settlement | Robertson-style sources describe all players receiving/settling scores; Western practical material likewise scores non-winners | Strong overlap conceptually; exact transaction rules still to compare |
| East | Distinctive settlement multiplier and progression role | Robertson/Western sources give East a distinctive role in payments/progression | Strong conceptual overlap; exact settlement/progression still needs primary comparison |
| Goulash | Yes | Both Robertson and Thompson/Maloney traditions include Goulash; published and local variants differ in exchange/chow/progression details | Safe to say concept exists; do not imply identical procedure |
| Fishing/calling | Explicit BMJA fishing values/detection | Robertson historical descriptions and Western material recognise fishing; some published Western systems use half-/full-/double-limit fishing values | Concept overlap, scoring can differ materially |
| Named special hands | Defined BMJA list; current project implements 19 named/event specials | Robertson has a materially larger published list; Thompson/Maloney's *Player's Companion* contains 120+ hands | Clear major difference |
| Special-hand values | Project uses 500 / 1,000 fixed values plus specific fishing values | T&M-based current Australian play can use Half Limit 500, Limit 1,000, Middle Limit 1,500 and Double Limit 2,000; Western sources also describe concealed/full-limit vs exposed/half-limit treatment for many hands | Clear major difference |
| Local rules | BMJA baseline deliberately fixed in current scorer | Current Australian groups explicitly use Thompson/Maloney plus local rules; special-hand sheets are often locally extended | High — central compatibility warning |
| Rounding | Project follows BMJA behaviour | Some Western references mention rounding before doubles | Still needs primary-source comparison |
| Settlement transactions | Detailed BMJA payer/payee logic implemented | Robertson/Western traditions use all-player scoring and East effects, but exact payment formula should be verified edition-by-edition | Still needs primary-source comparison |
| Game progression | BMJA progression implemented | Robertson and Australian groups have recognisable East/round/Goulash progression, but local session conventions vary | Needs primary-source comparison |
| Special-hand fishing values | BMJA has explicit 200/400 etc. | Historical Robertson descriptions report 200 for half-limit, 400 for limit and 500 for double-limit fishing; current T&M-group practice is not yet established consistently | Do not map directly without named rules profile |

## Important conclusion

The second pass changes the emphasis of the comparison.

The **ordinary arithmetic skeleton is much closer than first assumed**. Robertson-derived scoring tables line up strikingly with the current BMJA implementation on the familiar 2/4/8/16/32 Pung/Kong ladder, 2-point honour pairs, 4-point Flowers, 20 points for Mah Jong and the points-then-doubles structure.

The larger compatibility problem is **not ordinary set arithmetic**. It is the rules profile around it:

1. the special-hand catalogue and which hands are permitted;
2. special-hand values (including 1,500/2,000 categories in current Australian T&M-based play);
3. concealment/exposure requirements and half/full/double-limit treatment;
4. fishing values;
5. Goulash procedure;
6. some winning/wait bonuses, rounding and settlement details; and
7. local/table rules.

This is useful product-wise: a future Australian/Western profile may be able to reuse much of the existing scoring primitive layer, while supplying a different named rules profile and special-hand/configuration data. That is a hypothesis for later architecture work, not permission to treat the current BMJA scorer as already Western-compatible.

## Source hierarchy

Prefer evidence in this order:

1. current editions of Thompson & Maloney primary books, especially *The Game of Mah Jong Illustrated* and *Improve Your Mah Jong*;
2. current Max Robertson edition;
3. scoring sheets explicitly stating they use Robertson rules;
4. publisher descriptions/previews;
5. current Australian U3A/council/group rules where they explicitly name their source;
6. specialist secondary references such as Tom Sloper for cross-book terminology/history;
7. apps/forums only as evidence of current language and user demand, not scoring authority.

## Product consequence

The eventual public page can safely explain **relationship and identification** now.

A future selectable Australian/Western scoring profile should wait until the remaining primary-source gaps are precise enough to turn into tests. Search terminology must never become an implicit scoring ruleset.