# Taiwanese 16-tile association rules — 251A1 recovered source-local index

Status: **recovered named source corpus; admitted with preserved-source evidence grade**  
Parent: #251  
Date checked: 18 September 2026

## Source identity and provenance

The scoring/rules material was formerly hosted at:

- http://atawmj.org.tw/mjking.htm

Surviving references identify it with **中華麻將競技協會 / Chinese Mahjong Sports Association** and describe it as a Taiwanese 16-tile rules/scoring reference.

The original page is not currently available to this research pass. The corpus is therefore admitted as a **recovered/preserved copy of a named association source**, not mislabelled as directly accessed current primary material.

## Preservation chain

The strongest surviving copy is a 2024 PTT preservation post that explicitly says it is backing up the disappearing source and names the original URL:

- https://www.ptt.cc/bbs/heart/M.1710649783.A.8F3.html

The preserved text contains the scoring-table heading, the full sequence of named tai items, then visibly transitions into the separate gameplay/terminology section after the final optional scored hand. That boundary makes the finite scoring inventory countable rather than an open-ended scrape.

Independent older traces cite the same original URL and quote source-specific definitions, including 天聽 / 地聽 and penalty/procedure rules:

- https://www.ptt.cc/bbs/MJ/M.1331702578.A.8B8.html
- https://www.ptt.cc/bbs/MJ/M.1331124249.A.FE8.html

A current Taiwanese 16-tile app listing also states that its implementation is based on Taiwanese Mahjong rules written by 中華麻將競技協會:

- https://play.google.com/store/apps/details?id=com.andy.mahjong&hl=zh_TW

These independent traces strengthen attribution to the same named source family without pretending the missing original page has been directly re-fetched.

## Catalogue facts

The recovered scoring section is a 16-tile additive `tai` system with source-specific combination/suppression rules. The finite scored inventory contains **36 named scored items**.

`花胡` appears in the preserved text as an umbrella/procedure concept for flower-completion wins; it is **not counted as a 37th scored row** because its scored forms are separately named (`配牌花胡`, `八仙過海`, `七搶一`).

## 36 source-local scored items

This is minimal factual indexing data only: preserved source-local name and listed value/treatment. It does not reproduce the source explanations or examples.

| # | Source-local name | Preserved value / treatment |
| ---: | --- | --- |
| 1 | 風字坎 | 1 tai per applicable Wind relationship; source interaction rules apply |
| 2 | 箭字坎 | 1 tai each |
| 3 | 門清 | 1 |
| 4 | 全求 | 2 |
| 5 | 半求 | 1 |
| 6 | 平胡 | 2 |
| 7 | 對對胡 | 4 |
| 8 | 作莊 | 1 |
| 9 | 連N拉N | 2N |
| 10 | 獨聽 | 1 |
| 11 | 搶槓 | 1 |
| 12 | 字一色 | 16 |
| 13 | 清一色 | 12 |
| 14 | 湊一色 | 4 |
| 15 | 三暗坎 | 2 |
| 16 | 四暗坎 | 6 |
| 17 | 五暗坎 | 16 |
| 18 | 大四喜 | 16 |
| 19 | 小四喜 | 8 |
| 20 | 大三元 | 8 |
| 21 | 小三元 | 4 |
| 22 | 自摸 | 1 |
| 23 | 不求.自摸 | 2 |
| 24 | 槓上開花 | 1 plus source-defined self-draw treatment |
| 25 | 海底撈月 | 1 plus source-defined self-draw treatment |
| 26 | 花牌 | variable: individual/matched-set/full-flower treatment |
| 27 | 配牌花胡 | 12 |
| 28 | 八仙過海 | 8 |
| 29 | 七搶一 | 8 |
| 30 | 天聽 | 8 |
| 31 | 地聽 | 4 |
| 32 | 地聽一發 | 8 |
| 33 | 天胡 | 16 |
| 34 | 地胡 | 16 |
| 35 | 人胡 | 16 |
| 36 | 嚦咕嚦咕（選用） | 8; explicitly optional in the preserved source |

## 251A1 treatment

Admit these as **36 Taiwanese-association-source-local scoring records**.

Do not generalise them into “Taiwanese Mahjong universally”. Other Taiwanese tables use overlapping names with materially different tai values and local rules. The Mahjong Wiki Taiwanese comparison page, for example, explicitly compares differing IGS and LA rule values rather than presenting one universal table.

Do not cross-map these records to MCR, Riichi, GMCR, Zung Jung or other profiles yet. That is 251A2 work.

## Evidence grade and later work

Evidence grade: **named association source recovered through a near-complete preserved copy, independently corroborated by older quotations and an implementation attribution; original page currently unavailable**.

If an archived capture of the original `atawmj.org.tw/mjking.htm` is later recovered, compare it line-by-line against this index and correct any transcription/value discrepancy before runtime implementation.

Later executable-profile work should add:

- stable profile/catalogue identity and semantic revision;
- exact 16-tile shape/evidence model;
- interaction/suppression rules;
- dealer/repeat-dealer settlement and progression semantics;
- flower-event handling;
- source locators per item;
- tests for the source-specific edge cases.
