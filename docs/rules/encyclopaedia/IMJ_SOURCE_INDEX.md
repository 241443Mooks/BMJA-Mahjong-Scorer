# International Mahjong® Rules (IMJ®) — 251A1 source-local index

Status: **first-party maintained named corpus; no cross-family equivalence asserted**  
Parent: #251  
Date checked: 18 September 2026

## Source pin

First-party rules site:

- rules introduction/index: https://www.imahjong.com/imjrules.php
- maintained Grade Elements table: https://www.imahjong.com/imjsum.php
- current online grade-elements rules section: https://www.imahjong.com/mruonline1103gradeelements.php

The first-party site states that **International Mahjong® Rules (IMJ® Rules)** was created in 1990 from Cantonese/Hong Kong Mahjong gameplay and then-common Hong Kong house rules, with deliberate modifications/clarifications to produce one maintained written ruleset.

Therefore this corpus is treated as **International Mahjong**, not as a claim that all Hong Kong Old Style / Cantonese tables use these exact rules.

## Catalogue facts

The first-party Grade Elements table states that it is the complete set of valid scoring elements recognised by IMJ and gives a total of **55 grade elements**.

The source groups them by rule function, including:

- special winning hands;
- basic winning structures;
- tile-combination series;
- honour / pung / chow series;
- how the winning tile is obtained;
- general hand state / flower conditions.

The scoring model is fan-based. The source also defines group-combination restrictions, with most groups contributing at most one element unless an explicit exception applies.

## 251A1 treatment

Admit **55 IMJ-local grade-element records**.

The first-party Grade Elements table remains the item-level authority. This index intentionally does not reproduce all 55 source rows or the source's explanatory prose/images.

Do not silently relabel these as “HKOS patterns”. IMJ is a named maintained profile derived from Cantonese/Hong Kong play and has its own additions, values and rule clarifications.

Do not cross-map source names such as Nine Gates, Thirteen Unios, Big Three Dragons, Seven Pairs, All Pungs or flower elements to other profiles yet. That relationship work belongs to 251A2.

## Version / maintenance note

The IMJ site describes the online rules as the maintained current rules source. A downloadable rules PDF indexed by the site/search record identifies an older version **05.01.2001**, effective August 2001. For A1, the maintained online rules/Grade Elements table is the current authority; do not assume the older PDF version number is the semantic version of today's online table unless a later implementation pass pins that explicitly.

## Later executable-profile fields

If IMJ becomes executable, add:

- exact maintained rules version / semantic revision;
- stable IDs for all 55 grade elements;
- group-membership and same-group exclusion rules;
- fixed/final special-hand semantics;
- hand/evidence requirements;
- fan-to-score conversion and settlement strategy;
- source locators per item;
- golden fixtures from the first-party sample hands where licensing permits derived factual tests.
