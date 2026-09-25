# Atlas v0.2 batch 2 — exact treatment-reference validation

Status: **completed binding-resolution check for #354 batch 2**  
Base runtime: `efe2cec955f973a28a5e982160f3b6e39593606a`

Batch 2 adds **46 previously uncovered exact treatments**: 3 BMJA, 20 Thompson & Maloney Western, and 23 Outside the Box treatments. Each exact `referenceId` was checked against the current binding source that feeds `specialHandTreatmentsForProfile()`.

## BMJA 1.0 — 3 / 3 resolve

Binding authority: `artifacts/mahjong-scorer/src/scoring/special-hands.ts` → `bmjaSpecialHandBindings`.

- `bmja@1.0:all-winds-and-dragons`
- `bmja@1.0:heads-and-tails`
- `bmja@1.0:fourfold-plenty`

## Thompson & Maloney Western 0.1 — 20 / 20 newly covered references resolve

Binding authority: `artifacts/mahjong-scorer/src/game/western-tm-catalogue.ts`.

- `western-tm@0.1:all-winds-and-dragons`
- `western-tm@0.1:heads-and-tails`
- `western-tm@0.1:all-pair-ruby-jade`
- `western-tm@0.1:four-bamboo-one-and-five-green-bamboo-pairs`
- `western-tm@0.1:own-wind-meld-with-dragon-pair-and-three-suit-chows`
- `western-tm@0.1:three-four-tile-suit-runs-with-honour-pair`
- `western-tm@0.1:three-matching-four-tile-suit-runs-with-honour-pair`
- `western-tm@0.1:windfall`
- `western-tm@0.1:wind-pair-with-three-suit-rank-one-melds`
- `western-tm@0.1:wind-pair-with-three-suit-rank-nine-melds`
- `western-tm@0.1:wind-pair-with-three-suit-chows`
- `western-tm@0.1:hachi-ban`
- `western-tm@0.1:three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair`
- `western-tm@0.1:dragon-pair-with-five-suited-pairs`
- `western-tm@0.1:wriggly-dragon`
- `western-tm@0.1:green-dragon-pung-with-bamboo-melds`
- `western-tm@0.1:red-dragon-pung-with-character-melds`
- `western-tm@0.1:white-dragon-pung-with-circle-melds`
- `western-tm@0.1:run-one-to-nine-with-same-suit-pung-and-pair`
- `western-tm@0.1:run-one-to-nine-with-honour-pung-and-any-pair`

The Western `All Pair` and `Heavenly Twins` references used by the batch-2 extension were already present and validated in batch 1; batch 2 adds their OTB counterparts rather than recounting those Western identities as newly covered.

## Outside the Box 0.1 — 23 / 23 newly covered references resolve

Binding authority: `artifacts/mahjong-scorer/src/game/outside-the-box-catalogue.ts`.

- `outside-the-box@0.1:all-winds-and-dragons`
- `outside-the-box@0.1:heads-and-tails`
- `outside-the-box@0.1:fourfold-plenty`
- `outside-the-box@0.1:seven-pairs-one-suit-with-honours`
- `outside-the-box@0.1:seven-pairs-one-suit`
- `outside-the-box@0.1:all-pair-ruby-jade`
- `outside-the-box@0.1:four-bamboo-one-and-five-green-bamboo-pairs`
- `outside-the-box@0.1:own-wind-meld-with-dragon-pair-and-three-suit-chows`
- `outside-the-box@0.1:three-four-tile-suit-runs-with-honour-pair`
- `outside-the-box@0.1:three-matching-four-tile-suit-runs-with-honour-pair`
- `outside-the-box@0.1:windfall`
- `outside-the-box@0.1:wind-pair-with-three-suit-rank-one-melds`
- `outside-the-box@0.1:wind-pair-with-three-suit-rank-nine-melds`
- `outside-the-box@0.1:wind-pair-with-three-suit-chows`
- `outside-the-box@0.1:hachi-ban`
- `outside-the-box@0.1:three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair`
- `outside-the-box@0.1:dragon-pair-with-five-suited-pairs`
- `outside-the-box@0.1:wriggly-dragon`
- `outside-the-box@0.1:green-dragon-pung-with-bamboo-melds`
- `outside-the-box@0.1:red-dragon-pung-with-character-melds`
- `outside-the-box@0.1:white-dragon-pung-with-circle-melds`
- `outside-the-box@0.1:run-one-to-nine-with-same-suit-pung-and-pair`
- `outside-the-box@0.1:run-one-to-nine-with-honour-pung-and-suited-pair`

## Result

**46 / 46 newly covered batch-2 treatment identities resolve to current executable bindings.**

Combined with batch 1, the content work now has an identity-validated learner representation for **82 / 146 current Classical treatments**.

Relationship confidence is separately evidence-gated. Most batch-2 T&M/OTB groupings use the explicit `reuse-identical` or documented structural-difference rows in `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md`; treatment value/exposure differences remain exact-profile facts rather than concept facts.
