# tsumo Vietnamese Classic 160-tile — 251A1 source-local scoring index

Status: **counted fixed implementation profile; primary pattern table and profile scoring modifiers kept distinct**  
Parent: #251  
Date checked: 18 September 2026

## Source pin

First-party implementation source:

- https://tsumo.io/mahjong-rules/vietnamese

The page identifies itself as a guide to **tsumo's fixed Classic 160-tile Vietnamese profile**, based on the **August 2026 Vietnamese Mahjong Guide**.

It explicitly does not need to stand for every Vietnamese table: this A1 corpus is the tsumo fixed implementation profile only.

## Profile identity

The fixed profile uses:

- 160 tiles;
- 16 numbered flowers;
- seven true jokers with different substitution domains;
- non-wild Big Flower (`Đại Hoa`);
- no minimum Phán gate;
- six Phán converting to one Mủn;
- enabled/disabled optional-rule choices stated by the implementation.

These facts make it a bounded implementation profile rather than a generic regional synthesis.

## Primary Phán & Mủn pattern table

A browser-level extraction of the live fixed-profile page confirmed a closed **7-row primary scoring-pattern table**.

| Source-local pattern | Source-listed value |
| --- | ---: |
| All Sets (`Ù Tui Tui`) | 3 Phán |
| Half Flush (`Ù Lai Hàng`) | 3 Phán |
| Full Flush (`Ù Toàn Hàng`) | 1 Mủn |
| Seven Pairs (`Ù Pe Pe`) | 1 Mủn |
| Thirteen Orphans (`Ù Thập Tam Yêu`) | 13 Phán |
| All Honors (`Toàn Chữ`) | 4 Mủn |
| All Terminals (`Toàn Yêu`) | 4 Mủn |

The extraction boundary was the `Phán & Mủn Scoring Table`; the following major section is the complete rule reference material.

## Additional source-local scoring concepts

The same fixed profile explicitly defines further named scoring concepts outside that seven-row primary pattern table. These remain distinct in the index rather than being mislabelled as rows of the primary table:

| Source-local scoring concept | Source-listed treatment |
| --- | --- |
| Mosquito Hand | legal 0-Phán win; 1 point from each loser under the stated settlement |
| Seat Flower | +1 Phán |
| Bouquet | 1 Mủn |
| All Four Seat Flowers | 2 Mủn |
| Big Flower (`Đại Hoa`) | 2 Phán |
| Replaced / exposed true-joker bonus | source-listed 1–3 Phán depending on joker treatment |
| Self-draw (`Ù Tự Rút`) | doubles payout |
| True No Flowers, No Leaves | 1 Mủn base treatment under the fixed profile's route; additional qualifying tiles may increase it |
| No Jokers bonus | +1 Mủn for qualifying Mủn hands, or +1 Phán for All Sets as source-defined |

## A1 count decision

For Encyclopaedia preparation, count **16 reference-worthy tsumo-Vietnamese-Classic-local concepts**:

- 7 primary hand patterns;
- 8 explicit scoring modifiers/bonus concepts;
- 1 named zero-Phán Mosquito Hand.

This does **not** mean the source has a 16-row primary pattern table. The source's table has seven rows; the A1 count deliberately preserves other named scoring concepts because event/bonus treatments are useful later cross-family reference concepts, as in other corpora.

Do not count the Phán-to-point conversion ladder, base single/double rate arithmetic, liability transactions or generic settlement formulae as additional Encyclopaedia concepts.

## Profile/runtime pressure worth retaining

This corpus brings genuinely new future platform pressure:

- seven domain-specific substituting jokers;
- optional joker exposure and replacement;
- joker bounce from exposed Pongs;
- no-joker bonuses;
- a moving 26-tile replacement wall;
- `No Flowers, No Leaves` declaration state;
- Phán-to-Mủn progressive scoring;
- full-payment liability (`Đền`).

Those are important profile/evidence/runtime facts but are not all separate A1 catalogue entries.

## 251A1 treatment

Count **16 tsumo-Classic-160-tile-local records**.

Do not equate Seven Pairs, Thirteen Orphans, Full Flush, Robbing/last-tile style events or flower treatments with similarly named concepts in other families until 251A2 can compare exact predicates, joker semantics, combination rules and executable identities.
