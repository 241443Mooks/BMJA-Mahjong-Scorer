# Atlas v0.2 language review — 2026

Issue: #368  
Parent programme: #342  
Reviewed base: `fa5098417ea2dc95945a583e64138fb3d51743f9`  
Status: **Sol editorial review complete for all 71 current learner entries. No production content changed in this document.**

## Purpose

This review separates **knowledge truth** from **learner language**.

The Atlas knowledge model is allowed to contain precise research, evidence and implementation terms. The public learner copy should not make the reader understand those terms before they can understand the Mahjong hand.

The target is plain, adult, beginner-friendly English at roughly an 11-year reading age. The tone should be calm and matter-of-fact, not childish.

The implementation pass should preserve every treatment ID, profile identity, score model, facet, example structure, evidence binding and relationship. This document changes only how those facts are explained to a player.

## Editorial contract

### Keep Mahjong words

Keep genuine game vocabulary where it is the shortest accurate language: **Chow, Pung, Kong, pair, Wind, Dragon, honour, terminal, concealed, wall, replacement tile, seat Wind**.

When a specialist term first matters, explain the rule around it rather than replacing it with a vague synonym.

### Remove model/research language from learner copy

Do not use these as ordinary teaching language:

- reviewed concept / reviewed family / browse family;
- predicate / executable / runtime / canonical predicate;
- treatment-local / profile-local / profile score result;
- qualification / qualifies through / qualification boundary;
- provenance;
- structural membership;
- source/runtime verified;
- ordinary four-melds-plus-pair decomposition;
- non-standard collection;
- intrinsic fishing-floor behaviour;
- source-specific hybrid / configured-limit treatment when the player can simply be told the rule;
- machine relationship labels such as `narrower-than`, `broader-than`, `partial analogue`, `name collision`.

Those terms may remain in evidence or structured fields that are not rendered as ordinary learner prose.

### Preferred translations

- `ordinary four-melds-plus-pair structure` → **the usual four sets and a pair**
- `irregular/non-standard hand` → **this hand does not use the usual four sets and a pair**
- `qualifies` → **counts as this hand** / **you have this hand when…**
- `profile` → **rules**
- `treatment` → **version under these rules** or state the rule directly
- `event-defined special` → **a special win based on how you win**
- `the scorer needs to know…` → state the condition directly: **This only counts if…**
- `provenance condition` → say **how the hand was completed** or name the exact draw/discard condition
- `configured limit` → in learner prose, normally **scores the table limit under Buzzard 2000**; the exact score panel remains runtime-derived

### Field intent

**Summary:** one recognition sentence. Prefer about 18 words or fewer when possible.

**What it is:** tell the player what tiles/sets/event they are looking for.

**What it means:** explain the one useful distinction from an ordinary hand or a confusing nearby hand.

**Why it is special:** explain the actual rule that makes it unusual. Avoid abstract claims such as “structurally distinctive”.

**How it works:** short checks or actions in player order.

**Rules differences:** state what changes. Example: **In Western — T&M, one 2-3-4 Bamboo Chow is allowed.**

**Watch out:** only player-useful traps. Evidence/process cautions belong under Sources, not here.

**Accessible descriptions:** describe the hand/event. Never describe the implementation.

---

# Entry-by-entry review

Legend:

- **A — rewrite:** current learner wording contains research/software language or unnecessary abstraction.
- **B — simplify:** meaning is sound; shorten and make more concrete.
- **C — retain:** current core wording is already suitable; only apply global public-name/accessibility clean-up.

## Batch 1 — concept proof entries (11/11)

### 1. `thirteen-unique-wonders` — A

Keep the summary idea. Replace abstract explanation with:

- **What it is:** “You need the 1 and 9 from each suit, all four Winds, all three Dragons, and one extra copy of any of those 13 tiles.”
- **What it means:** “This hand does not use the usual four sets and a pair. It is a fixed collection of terminal and honour tiles.”
- **Why:** “You must collect all 13 required tile types, then pair one of them.”

Rules differences should say directly: Club - Bramhall 2026 requires concealment; Buzzard calls it **Thirteen Odd Majors** and scores it at the configured table limit. Remove `structural membership`, `source/runtime verified`, `treatment-local` and `reviewed shared concept` from public copy.

### 2. `four-blessings` — A

- **Summary:** “Pungs or Kongs of East, South, West and North, plus a pair.”
- **What it is:** “All four sets are Wind Pungs or Kongs. Add any legal pair.”
- **What it means:** “Every Wind must make a complete set. Simply having all four Winds in the hand is not enough.”
- **Why:** “All four set positions are filled by the four Winds.”

Replace `intrinsic fishing-floor behaviour remain treatment-local` with player-facing score text from the exact selected rules panel.

### 3. `imperial-jade` — A

- **Summary:** “A hand made from Green Dragons and the green Bamboo tiles. The Chow rule depends on your rules.”
- **What it is:** “Use Green Dragons and Bamboo 2, 3, 4, 6 and 8.”
- **What it means:** “British / BMJA-style and Club - Bramhall 2026 do not allow a Chow. Western — T&M allows one 2-3-4 Bamboo Chow.”
- **Why:** “Only a small set of green tiles may be used, so the Chow difference changes which hands count.”

Public variant label: **British / Club - Bramhall 2026 form**. Remove `reviewed structure`, `family of treatments`, `narrower/broader` from visible teaching text.

### 4. `wriggling-snake-family` — B

- **Summary:** “1 to 9 in one suit, all four Winds, and one extra matching tile.”
- **What it is:** “Both Snake hands use the same 13-tile base: 1 to 9 in one suit plus all four Winds.”
- **What it means:** “Wriggling Snake pairs the suited 1. Wriggly Snake may pair any tile from the 13-tile base.”
- **Why:** “The whole hand is a fixed loose-tile pattern, not normal sets.”

Do not describe one form as `narrower` in ordinary learner copy; explain the actual pair rule.

### 5. `pair-hand-family` — A

- **Summary:** “Several special hands use seven pairs, but the tile and winning rules are different.”
- **What it is:** “This group helps you compare All Pair Honours, All Pair, Heavenly Twins and Seven Twins.”
- **What it means:** “All four use pairs. They differ in which tiles may be paired and, for Seven Twins, how the hand is won.”
- **Why:** “Seven-pair hands do not use the usual four sets and a pair.”

Remove `browse family`, `predicate`, `effective qualification`, `name collision` from rendered text. For Seven Twins say the exact wall-winning condition directly.

### 6. `heavens-blessing-original-hand` — A

- **Summary:** “East is dealt a complete winning hand before play starts.”
- **What it is:** “East’s original 14 tiles already make Mahjong.”
- **What it means:** “BMJA calls this Heaven’s Blessing. Buzzard calls it Original Hand and also records the historical names Hand from Heaven and Natural Winning.”
- **Why:** “East wins from the original deal, before any ordinary draw or discard.”

Move the BMJA-vs-Buzzard evidence-status caveat out of the teaching answer and into Sources. Do not show `shared current event predicate`, `source-verified provenance`, or `mapping remains inferred` as normal learner prose.

### 7. `twofold-fortune-bmja` — A

- **Summary:** “Two linked Kong replacement draws end with Mahjong.”
- **What it is:** “A replacement tile completes a second Kong, then the next replacement tile completes Mahjong.”
- **What it means:** “The order of the two Kongs and replacement draws matters. The final hand shape alone is not enough.”
- **Why:** “The win depends on a specific sequence of events.”

### 8. `three-dragon-specials-family` — A

- **Summary:** “All versions use Pungs or Kongs of all three Dragons. The fourth set and pair rules differ.”
- **What it is:** “Make a set of Red, Green and White Dragons, then complete the hand under the selected rules.”
- **What it means:** “BMJA and Western — T&M require another Pung or Kong. Club - Bramhall 2026 also allows a Chow when the fourth set and pair use the same numbered suit. Buzzard allows any legal fourth set and pair.”
- **Why:** “The three Dragon sets are shared; the rest of the hand decides which version you have.”

The Buzzard non-winner table-limit consequence is not learner-card hand definition. Put it in a short **Buzzard table rule** note if surfaced; never expose `profile-score-result`, `detector`, `treatment ID`, or `predicate`.

### 9. `knitting-reviewed` — B

- **Summary:** “Seven same-number pairs made across exactly two suits.”
- **What it is:** “Match the same number across two different suits to make seven pairs.”
- **What it means:** “Only two numbered suits may be used. You do not make normal Chows, Pungs or Kongs.”
- **Why:** “The whole hand is built from cross-suit pairs.”

Variant definition should end after the rule. Remove “exact score and exposure rules remain attached to each profile treatment”; the selected rules panel already owns that information.

### 10. `triple-knitting-reviewed` — B

- **Summary:** “Four same-number groups using all three suits, plus one same-number pair across two suits.”
- **What it is:** “Each three-tile group uses the same number once in Bamboo, Circles and Characters. Add one same-number pair using two suits.”
- **What it means:** “The hand is a 14-tile loose pattern, not normal melds.”
- **Why:** “Every group follows the same cross-suit knitting idea.”

Remove `complete 14-tile loose layout; exact score and exposure rules remain attached…` from public variant prose.

### 11. `gates-family` — A

- **Summary:** “A one-suit 1112345678999 base. The allowed extra tile depends on the rules.”
- **What it is:** “Start with three 1s, three 9s and one each of 2 to 8, all in one suit.”
- **What it means:** “BMJA, Western — T&M and Buzzard use different rules for the extra tile and how the hand is completed.”
- **Why:** “The base is tightly fixed, so the exact winning tile matters.”

For each variant, state the actual completion rule. Remove `partial analogue`, `broader completion set`, and `provenance semantics` from learner text.

## Batch 2 — shared Western / Club concepts (20/20)

### 12. `all-winds-and-dragons` — B

Use: “Four Pungs or Kongs and a pair, all made from Winds and Dragons. No suited tiles are allowed.” Avoid `reviewed shared structure` and `ordinary hand structure` abstractions.

### 13. `heads-and-tails` — B

Use: “Four Pungs or Kongs and a pair made only from suited 1s and 9s. Winds, Dragons and middle-number tiles are not used.”

### 14. `fourfold-plenty` — B

Use: “Make four Kongs and a pair. Because each Kong has four tiles, the physical hand contains more than 14 tiles.”

### 15. `all-pair-ruby-jade` — B

Use: “Seven pairs: Green Dragons, Red Dragons and five Bamboo pairs. The hand uses pairs instead of normal sets.”

### 16. `sparrows-sanctuary` — A

- **Summary:** “All four 1 Bamboo tiles, plus pairs of 2, 3, 4, 6 and 8 Bamboo.”
- **What it is:** “A fixed 14-tile Bamboo hand.”
- **What it means:** “You need exactly four 1 Bamboo tiles and one pair of each listed green Bamboo rank.”
- **Why:** “Almost every tile is fixed in advance.”

Remove `qualification comes from matching` language.

### 17. `hovering-angel` — B

Use: “Make one Chow in each suit, a Pung or Kong of your own seat Wind, and a Dragon pair. Your seat Wind matters, so the same tiles may count for one player and not another.”

### 18. `big-robert-family` — B

Use: “Make one four-tile run in each suit, then add an honour pair. If all three runs start on the same number, it is the matching-runs version.” Explain that the four-tile runs are loose patterns, not ordinary Chows.

### 19. `windfall` — B

Use: “Use one of each Wind as single tiles, then make five pairs in one suit. The Winds are not Pungs or pairs.”

### 20. `windy-ones` — B

Use: “Make a Pung or Kong of 1s in each suit. Add all four Winds, with one Wind duplicated as the pair.” Remove `hybrid hand`, `binds the same terminal rank`, and `complete four-Wind collection` wording.

### 21. `windy-nines` — B

Same pattern as Windy Ones, using 9s.

### 22. `windy-chow` — B

Use: “Make one Chow in each suit. Add all four Winds, with one Wind duplicated as the pair.”

### 23. `hachi-ban` — A

- **Summary:** “A 1-8 or 2-9 run in one suit, plus three Wind pairs or three Dragon pairs.”
- **What it is:** “The eight suited tiles are singles in order, not Chows.”
- **What it means:** “The other six tiles make three pairs, all Winds or all Dragons.”
- **Why:** “It combines an eight-tile straight with three honour pairs.”

Remove `non-standard fourteen-tile structure`.

### 24. `dragonfly` — B

Use: “Keep one single Red, Green and White Dragon. Add one Pung or Kong in each suit and a suited pair. The Dragons stay as single tiles.”

### 25. `dragons-breath` — B

Use: “Use all three Dragons, with one Dragon paired, then make five pairs in one suit. No normal sets are used.”

### 26. `wriggly-dragon` — B

Use: “Take 1 to 9 in one suit, one of each Dragon, then add two more copies of one Dragon so that Dragon forms a pair.” Avoid `complete Dragon-family pattern` language.

### 27. `green-jade` — B

Use: “Make a Green Dragon Pung, then Bamboo Pungs or Kongs and a Bamboo pair.” The rules panel handles exposure/value differences.

### 28. `red-coral` — B

Use: “Make a Red Dragon Pung, then Character Pungs or Kongs and a Character pair.”

### 29. `white-opal` — B

Use: “Make a White Dragon Pung, then Circle Pungs or Kongs and a Circle pair.”

### 30. `run-pung-pair` — C

Core copy is already clear. Prefer **set of three matching tiles** only if a beginner glossary later proves `Pung` itself is unfamiliar; otherwise keep Mahjong terminology. Keep the useful physical four-copy warning.

### 31. `grand-sequence-family` — A

- **Summary:** “A 1-9 run plus an honour Pung or Kong. The pair rule differs by rules.”
- **What it is:** “Make the 1-2-3, 4-5-6 and 7-8-9 Chows in one suit, then add an honour set and a pair.”
- **What it means:** “Western — T&M allows any pair. Club - Bramhall 2026 requires a suited pair.”
- **Why:** “The pair is the only important difference between these two versions.”

Remove `rules-specific pair qualification`, `narrows`, `broader-than`, and all public `Outside the Box` wording.

## Batch 3 — BMJA event hands and Buzzard entries (10/10)

### 32. `buried-treasure` — A

- **Summary:** “Four concealed Pungs and a concealed pair, mainly in one suit.”
- **What it is:** “Build the hand with four concealed Pungs and a concealed pair. Use the exact Buried Treasure tile and winning rules shown for your selected rules.”
- **What it means:** “How the hand is kept concealed and completed matters, not only the final tiles.”
- **Why:** “Every set is a concealed Pung and the hand has extra suit/winning restrictions.”

During implementation, replace the deliberately cautious second sentence with the exact known player-facing restriction if the structured rule can express it safely. Remove `provenance`, `predicate`, `owned by the treatment`.

### 33. `earths-blessing-bmja` — A

- **Summary / What it is:** “A non-East player wins with East’s first discard.”
- **What it means:** “The hand itself may be ordinary. What matters is that East’s first discard is the winning tile.”
- **Why:** “The win happens immediately on the first discard.”

Move the cross-profile evidence caution to Sources. Do not show `event-defined treatment` or `provenance status`.

### 34. `gathering-plum-blossom-bmja` — A

- **Summary:** “A replacement draw gives you 5 Circles and that tile completes Mahjong.”
- **What it is:** “Win with 5 Circles drawn as a replacement tile.”
- **What it means:** “A 5 Circles won another way does not count for this special.”
- **Why:** “Both the tile and the replacement draw matter.”

### 35. `plucking-moon-bmja` — A

- **Summary:** “The last drawable tile is 1 Circles and it completes Mahjong.”
- **What it is:** “Win with 1 Circles drawn as the final live-wall tile.”
- **What it means:** “A 1 Circles won earlier or by discard does not count for this special.”
- **Why:** “Both the tile and its position as the last live-wall draw matter.”

### 36. `buzzard-all-winds-dragons` — A

- **Summary:** “Four Pungs or Kongs and a pair, using only Winds and Dragons. Buzzard scores it at the table limit.”
- **What it is:** “Every set and the pair are Winds or Dragons.”
- **Why:** “Buzzard lists All Winds and Dragons as a limit hand.”

Move the cross-rules equivalence caution to Sources. Remove `current executable`, `canonical predicate`, `configured-limit treatment` from learner prose and accessible text.

### 37. `buzzard-three-winds-pair` — A

- **Summary:** “Three Wind Pungs or Kongs, the fourth Wind as the pair, plus one other legal set.”
- **What it is:** “Make sets of three different Winds, pair the fourth Wind, and complete the hand with one Chow, Pung or Kong.”
- **What it means:** “This is not Four Blessings: the fourth Wind is a pair, not another Wind set.”
- **Why:** “All four Winds have fixed roles in the hand.”

If the incomplete non-winner Buzzard table rule is shown, label it plainly: **Buzzard also has a separate table-limit rule for an incomplete Four-Wind pattern.** Do not expose `profile-score-result`, `knowledge link`, `detector`, or `treatment owner`.

### 38. `buzzard-east-first-discard` — A

- **Summary / What it is:** “Win with East’s first discard.”
- **What it means:** “The special depends on when the winning tile is discarded, not on a particular hand shape.”
- **Why:** “Buzzard lists this first-discard win as a limit hand.”

Move cross-profile equivalence caveat to Sources.

### 39. `buzzard-all-ones-nines` — A

- **Summary:** “Four Pungs or Kongs and a pair made only from suited 1s and 9s.”
- **What it is:** “Use only the 1 and 9 tiles from Bamboo, Circles and Characters.”
- **Why:** “Buzzard lists All Ones and Nines as a limit hand.”

Do not explain it as an `executable treatment bound to a predicate`.

### 40. `buzzard-concealed-pungs-kongs` — B

Use: “Make four concealed Pungs or Kongs and a pair. Buzzard scores this named hand at the table limit.” Remove references to `current detector` and comparative implementation detail from the learner answer.

### 41. `buzzard-east-thirteenth-consecutive-mahjong` — B

- **Summary:** “East wins a thirteenth consecutive hand while remaining East.”
- **What it means:** “This depends on the game history, not on a particular tile pattern.”
- **Why:** “Buzzard rewards the thirteenth consecutive East win as a limit event.”

Avoid `configured-limit event treatment` and `the scorer needs the fact`.

## Batch 4A — remaining Western catalogue, first half (19/19)

### 42. `gretas-run-family` — B

Use: “Both hands start with 1 to 7 in one suit. Greta’s Dragon adds all four Winds and a Dragon Pung/Kong. Greta’s Garden adds all four Winds and all three Dragons as singles.” Remove `learner family`, `backbone`, and `materially different` abstraction.

### 43. `dragons-run-western` — B

Use: “Take 1 to 9 in one suit, one of each Dragon, and a pair of Winds. The 1-9 run is nine single tiles, not Chows.”

### 44. `yin-yang-western` — B

Current summary is strong. Simplify explanation to: “One suit uses 11, 234, 55. The other uses 55, 678, 99. The exact mirrored layout is the hand.” Remove `qualification is a specific arrangement`.

### 45. `little-robert-western` — B

Use: “Make one Chow in each suit, then add a suited Pung/Kong and a suited pair. No honour set or pair is used in the defining pattern.”

### 46. `moon-bottom-well-western` — B

Use: “Make four Circle Chows and a Circle pair. The Chows must include 1-2-3, 4-5-6 and 7-8-9.”

### 47. `wind-pair-chow-family-western` — B

Use: “All three hands have one Chow in each suit plus all four Winds, with one Wind paired. Windy Chow allows any Chows; Chop Suey uses 1-2-3 in every suit; Chow Mein uses 7-8-9 in every suit.”

### 48. `dragonette-western` — B

Use: “Take all four Winds as singles, all three Dragons with one Dragon paired, and three non-terminal pairs in one suit.”

### 49. `western-gates-named-topic` — A

- **Summary:** “Three Western hands have ‘Gates’ in the name, but their tile patterns are different.”
- **What it is:** “This page groups Confused Gates, Golden Gates and Dragon’s Gates so the names are easier to tell apart.”
- **What it means:** state the three patterns directly; do not claim a shared hand family.
- **Why:** “The similar names can easily cause lookup mistakes.”

Replace `disambiguation topic`, `canonical hand`, `predicate` and `#351 Gates family` in ordinary learner copy. A short “Not the same as Gates of Heaven” warning is useful.

### 50. `five-odd-honours-western` — B

Use: “Take 1 to 9 in one suit as single tiles, then add five different Winds or Dragons.”

### 51. `purity-western-calculated` — A

- **Summary:** “One suit, four sets and a pair. Western — T&M allows at most one Chow.”
- **What it is:** “A one-suit Western scoring pattern, not a fixed-value special hand.”
- **What it means:** “The hand uses the usual four sets and a pair. One set may be a Chow.”
- **Why:** “The same name ‘Purity’ has a different structure under these rules.”

The exact calculated score/exposure belongs in the selected treatment panel. Remove `important boundary`, `executable treatment`, `authored guidance`, `canonical predicate`, and implementation instructions from public `referenceNote`.

### 52. `sunrise-sunset-family` — B

Use: “Both hands have one non-terminal Pung/Kong in each suit. Sunrise adds an East Wind Pung/Kong and White Dragon pair. Sunset adds a White Dragon Pung/Kong and Red Dragon pair.”

### 53. `all-honour-hand-western` — A

- **Summary:** “Four Pungs/Kongs and a pair using honours and, if used, 1s or 9s from one suit.”
- **What it is:** “Use only Winds, Dragons, and terminal tiles from at most one numbered suit.”
- **What it means:** “The hand stays Pung/Kong-based. Any suited tiles must all come from one suit and be 1s or 9s.”

Do not describe it as a `calculated treatment`; show the calculated score separately. Move generator/source caveats out of learner text.

### 54. `ordinary-mah-jong-western` — A

- **Summary:** “One suit with optional honours, mostly Pungs/Kongs, plus a pair. One Chow may be allowed.”
- **What it is:** “A named Western scoring pattern for a mostly Pung/Kong hand using one numbered suit plus optional Winds or Dragons.”
- **What it means:** “One Chow may be used, but the rest of the hand is built from Pungs/Kongs and a pair.”

The exact exposure rule belongs in the selected rules panel. Remove meta-copy about the catalogue containing calculated treatments.

### 55. `one-nine-run-honour-family-western` — B

Use: “All three hands contain the 1-2-3, 4-5-6 and 7-8-9 Chows in one suit. Guardian Winds uses a Wind set and Wind pair; Guardian Dragons uses a Dragon set and Dragon pair; Dragon’s Tail mixes the two honour families.”

### 56. `all-pair-jade-western` — B

Use: “Seven pairs using Green Dragons and the permitted green Bamboo tiles. The hand is all pairs; no normal sets are used.” Avoid `canonical predicate` in example/accessibility text.

### 57. `windy-dragons-western` — B

Use: “Make a pair of each Wind, then two Dragon Pungs or Kongs.”

### 58. `rank-parity-family-western` — A

- **Summary:** “Chinese Odds and Odds & Evens both use odd/even tile numbers, but the hands are built differently.”
- **What it is:** “Chinese Odds uses odd-number Pungs/Kongs in one suit. Odds & Evens uses odd ranks in two suits and even ranks in the third.”
- **Why:** “The tile numbers themselves are part of the rule.”

Remove `browse family`, `qualification`, `complete predicate`, and `canonical layout predicate` from learner and accessibility copy.

### 59. `robin-western` — B

Use: “Make four Chows across all three suits, plus a pair. One suit must supply two of the four Chows.”

### 60. `numbers-in-parallel-western` — B

Use: “Choose one non-terminal number and make that Pung/Kong in all three suits. Add an honour Pung/Kong and a pair.” Replace generator/accessibility references to `executable predicate` with the actual rule.

## Batch 4B — remaining Western catalogue (11/11)

### 61. `dragon-suit-colour-topic-western` — A

- **Summary:** “Ten Western hands link particular Dragons with specific suits or coloured rank groups.”
- **What it is:** “These are separate named hands. The useful clue is the Dragon colour and the restricted suited tiles used with it.”
- **What it means:** “Choose the named hand below to see its exact Dragon and suit/rank rule.”
- **Why:** “The names are difficult to guess unless the colour patterns are shown together.”

Do not call this a `learner/discovery topic`, `source/runtime-backed family`, or imply equivalence. Variant definitions can remain mostly as written, with `source/runtime does not impose…` rewritten simply as the positive rule that is actually known.

### 62. `wind-pair-three-suit-meld-topic-western` — B

Use: “All three hands make one Pung/Kong in each suit, then use all four Winds with one Wind paired. Windvane allows different suited numbers; Three Sisters uses 3s; Seven Brothers uses 7s.” Remove `family extension`, `pattern area`, `skeleton`, and `rank constraint` jargon.

### 63. `dragons-teeth-western` — B

Use: “Make Red and White Dragon Pungs. Add a seven-tile 1-7 or 2-8 run in Characters or Circles, with one run tile duplicated as the pair.”

### 64. `little-brother-western` — B

Use: “Make four Chows using all three suits, then pair your own seat Wind. Your seat matters.”

### 65. `gerties-garter-western` — B

Use: “Take 1 to 7 in exactly two suits. Every tile is a single; there are no normal sets or pair.”

### 66. `numbers-doubled-western` — B

Use: “Choose two non-terminal numbers and two suits. Make each number as a Pung/Kong in both suits, then add an honour pair.”

### 67. `civil-war-western` — B

Use: “Make North and South Wind Pungs/Kongs. Add 1-8-6-1 in one suit and 1-8-6-5 in another.” Remove `source-specific hybrid`, `numeric signatures`, and `qualification` wording.

### 68. `red-lantern-western` — B

Use: “Take 1 to 7 in one suit with one run tile duplicated. Add a Red Dragon Pung/Kong and a Pung/Kong of your own seat Wind.”

### 69. `mixed-chow-family-western` — A

- **Summary:** “Four Western hands use Mixed Chows: three consecutive numbers, one tile from each suit.”
- **What it is:** “A Mixed Chow has one Bamboo, one Circle and one Character tile whose numbers run in order, such as 1 Bamboo, 2 Circles, 3 Characters.”
- **What it means:** “The four named hands differ in how many Mixed Chows they use and what other tiles complete the hand.”
- **Why:** “Mixed Chows do not follow the normal same-suit Chow rule.”

Remove `source/runtime-backed family` and other implementation framing. Keep the four variant definitions, rewritten only for brevity.

### 70. `chow-chow-western` — A

- **Summary:** “Four concealed Chows and a pair in one suit, won from the wall.”
- **What it is:** “All four sets are concealed Chows in one suit.”
- **What it means:** “The hand must stay concealed and the winning tile must come from the wall under this rule.”
- **Why:** “Both the all-Chow shape and how the winning tile is drawn matter.”

Do not use `wall-based winning-method requirement` or `exact treatment` in learner prose.

### 71. `up-down-you-go-family-western` — B

Current pattern explanation is strong. Prefer:

- **Summary:** “All four Winds plus 2, 4, 6 and 8 in one suit, with the tile counts rising or falling.”
- **What it means:** “Up You Go uses 2, 44, 666, 8888. Down You Go reverses it: 2222, 444, 66, 8. Both also use one of each Wind.”
- **Why:** “The two hands are mirror images, so learning them together is easier.”

---

# Example and accessibility review

The tile descriptions themselves are generally strong. Keep concrete lists such as “Pungs of 2, 4 and 6 Circles, plus a pair of 8 Circles.”

The following implementation-language patterns must be removed from rendered example or screen-reader copy:

- `current executable Buzzard example` → **Buzzard example**;
- `current executable winning example` → **example winning hand**;
- `runtime treatment example` / `not exhaustive source qualification` → do not render the metadata label; explain any player-relevant limit separately;
- `accepted by the executable predicate` / `predicate-valid` / `canonical predicate` → state the actual permitted tiles/groups if known; otherwise do not offer a concrete learner example yet;
- `example generator` in ordinary prose → **Example pattern** or omit if a concrete tile visual is generated;
- Blue Mountains accessible text should say **“The permitted blue Circle ranks are 2, 3, 4, 5, 8 and 9.”**, not “the executable blue Circle set…”;
- All Pair Jade should say **“Use Green Dragons and the green Bamboo tiles allowed by these rules.”** unless the exact rank set is displayed alongside it;
- Odds & Evens and Numbers in Parallel should describe the actual rank/suit rule, not the generator/predicate;
- all public and screen-reader occurrences of `Outside the Box` must become **Club - Bramhall 2026**.

# Page-level language after #358

When #358 lands, review the rendered page once more before implementation of this language pass.

Preferred page-level terms:

- `Why it qualifies` → **Why it is special**
- `Exact treatment` → **Under these rules** or the public rules name where space permits
- `How each exact treatment scores` → **Other rules** / **Scores under other rules**
- `learner entry` in ordinary visible result text → **hand** or **result**; `learner entry` is an internal content-model term
- `all 146 exact treatments remain searchable` → preferably remove from the primary mobile flow or rewrite as **“Search all supported versions.”**
- footer `Profile and version identify each exact treatment.` → **“Each rules version keeps its own scoring and hand rules.”**

The current #358 branch also still contains implementation language in fallback example copy (`generated from the exact current pattern predicate`, `concrete arrangement is not available for this profile`). #368 should replace that after #358 lands; do not modify Luna’s active branch to do it now.

# Implementation sequence

1. Merge/stabilise #358 first.
2. Rebase this review onto the new `main` and inspect the final rendered field structure.
3. Edit the authoritative authored content sources, not only the generated runtime snapshot.
4. Regenerate Atlas content through the normal generator.
5. Add a public-copy regression that fails if obvious model-language tokens leak into learner-facing Atlas content. Do not blindly ban words that are legitimate source or internal fields; test the rendered/public content path.
6. Run `atlas:check`, full tests, typecheck, production build and `git diff --check`.
7. Perform the mobile rendered spot-check promised by #368.

## Completion statement for the editorial review

All **71/71** current learner entries have been reviewed in this document. The remaining work in #368 is implementation of the approved language direction after #358 stabilises, plus final rendered/mobile verification.