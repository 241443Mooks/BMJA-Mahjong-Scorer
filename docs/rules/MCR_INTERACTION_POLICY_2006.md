# MCR 2006 interaction policy — complete source contract

Status: **authoritative interaction contract for #300 Pass 1**  
Profile: `mcr-wmo-2006@0.x`  
Runtime target: `interaction.mcr-2006-non-combination`

Authority: World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006 ("Green Book"), English edition. As the Green Book itself states, unresolved translation or interpretation disputes must be escalated to the original Chinese edition rather than guessed.

## Why this file exists

The interaction section in `MCR_FAN_CATALOGUE_2006.md` was intentionally a compact list of high-risk relationships "worth pinning as fixtures". During #300 Pass 1 / PR #309 it was incorrectly treated as a complete transcription of all Appendix 1 interaction wording.

This file corrects that handoff. For #300 interaction semantics, this file is authoritative where the earlier compact table is incomplete or less specific.

This file deliberately separates three different things:

1. **source-explicit exclusions / implications** — wording directly stated by the Green Book;
2. **source-explicit positive coexistence / arithmetic** — combinations the source explicitly permits or demonstrates;
3. **principle-derived interaction** — consequences of §3.9.1 that must be evaluated from actual candidate occurrence identities rather than pretending every relationship is a source-written pairwise exclusion.

Do not merge these categories in implementation or audit output.

---

## 1. The five §3.9.1 counting principles

After identifying the highest-scoring fan, lesser fan are added subject to all five principles:

1. **Non-Repeat** — an inevitably implied/included lower fan is not also scored;
2. **Non-Separation** — sets already grouped to create one fan are not regrouped incompatibly to create another;
3. **Non-Identical** — the same set cannot be reused with another set to claim the same fan again;
4. **High-versus-Low** — where the same structural use can form a high-value or lower-value fan, the higher lawful result is chosen;
5. **Account-Once** — an unused set may be combined with a previously used set only within the source's one-reuse constraint.

These principles are not truthfully reducible to one guessed binding-to-binding exclusion matrix. Occurrence identity remains required.

---

## 2. Complete source-explicit non-combination / implication table

The table below records the Green Book's direct interaction wording for the fan relevant to runtime suppression. If a relationship is not in this table, do **not** label it `source-*` merely because §3.9.1 may still suppress it.

| Fan | Stable binding | Source-explicit non-combination / implication |
|---|---|---|
| 1 Big Four Winds | `mcr2006.fan.big-four-winds` | Big Three Winds; All Pungs; Prevalent Wind; Seat Wind; Pung of Terminals or Honors |
| 2 Big Three Dragons | `mcr2006.fan.big-three-dragons` | Two Dragon Pungs; Dragon Pung |
| 4 Nine Gates | `mcr2006.fan.nine-gates` | Full Flush; Concealed Hand; Pung of Terminals or Honors |
| 5 Four Kongs | `mcr2006.fan.four-kongs` | Single Wait |
| 6 Seven Shifted Pairs | `mcr2006.fan.seven-shifted-pairs` | Full Flush; Concealed Hand; Single Wait |
| 7 Thirteen Orphans | `mcr2006.fan.thirteen-orphans` | All Types; Concealed Hand; Single Wait |
| 8 All Terminals | `mcr2006.fan.all-terminals` | All Pungs; Outside Hand; Pung of Terminals or Honors; No Honors |
| 9 Little Four Winds | `mcr2006.fan.little-four-winds` | Big Three Winds; Pung of Terminals or Honors |
| 10 Little Three Dragons | `mcr2006.fan.little-three-dragons` | Dragon Pung; Two Dragon Pungs |
| 11 All Honors | `mcr2006.fan.all-honors` | All Pungs; Outside Hand; Pung of Terminals or Honors |
| 12 Four Concealed Pungs | `mcr2006.fan.four-concealed-pungs` | All Pungs; Concealed Hand |
| 13 Pure Terminal Chows | `mcr2006.fan.pure-terminal-chows` | Seven Pairs; Full Flush; All Chows; Pure Double Chow; Two Terminal Chows |
| 14 Quadruple Chow | `mcr2006.fan.quadruple-chow` | Pure Shifted Pungs; Tile Hog; Pure Double Chow |
| 15 Four Pure Shifted Pungs | `mcr2006.fan.four-pure-shifted-pungs` | Pure Triple Chow; All Pungs |
| 16 Four Pure Shifted Chows | `mcr2006.fan.four-pure-shifted-chows` | Short Straight |
| 18 All Terminals and Honors | `mcr2006.fan.all-terminals-and-honors` | All Pungs; Pung of Terminals or Honors |
| 19 Seven Pairs | `mcr2006.fan.seven-pairs` | Concealed Hand; Single Wait |
| 20 Greater Honors and Knitted Tiles | `mcr2006.fan.greater-honors-knitted` | All Types; Concealed Hand |
| 21 All Even Pungs | `mcr2006.fan.all-even-pungs` | All Pungs; All Simples |
| 22 Full Flush | `mcr2006.fan.full-flush` | No Honors |
| 23 Pure Triple Chow | `mcr2006.fan.pure-triple-chow` | Pure Shifted Pungs; Pure Double Chow |
| 24 Pure Shifted Pungs | `mcr2006.fan.pure-shifted-pungs` | Pure Triple Chow |
| 25 Upper Tiles | `mcr2006.fan.upper-tiles` | No Honors |
| 26 Middle Tiles | `mcr2006.fan.middle-tiles` | No Honors; All Simples |
| 27 Lower Tiles | `mcr2006.fan.lower-tiles` | No Honors |
| 29 Three-Suited Terminal Chows | `mcr2006.fan.three-suited-terminal-chows` | Pure Double Chow; Two Terminal Chows; No Honors; All Chows |
| 31 All Fives | `mcr2006.fan.all-fives` | All Simples |
| 34 Lesser Honors and Knitted Tiles | `mcr2006.fan.lesser-honors-knitted` | All Types; Concealed Hand |
| 36 Upper Four | `mcr2006.fan.upper-four` | No Honors |
| 37 Lower Four | `mcr2006.fan.lower-four` | No Honors |
| 40 Reversible Tiles | `mcr2006.fan.reversible-tiles` | One Voided Suit |
| 44 Last Tile Draw | `mcr2006.fan.last-tile-draw` | Self-Drawn |
| 47 Robbing the Kong | `mcr2006.fan.robbing-the-kong` | Last Tile |
| 53 Melded Hand | `mcr2006.fan.melded-hand` | Single Wait |
| 63 All Chows | `mcr2006.fan.all-chows` | No Honors is explicitly stated as implied |

### Event / Flower wording that is source-explicit but not a normal pairwise fan table row

- **Fan 46 Out with Replacement Tile** is bound in this profile to a Kong replacement win. A Flower-replacement win may score Self-Drawn, but Out with Replacement Tile does not apply to that Flower-replacement event.
- **Fan 81 Flower Tiles** are separate post-qualification points; Flower replacement may score Self-Drawn, but not Out with Replacement Tile.

The direct table above therefore must not be expanded with guessed `source-*` relationships. Anything else belongs to the §3.9.1 principle layer unless another source sentence explicitly states it.

---

## 3. Source-explicit positive coexistence / arithmetic constraints

These are just as important as exclusions because they stop a generic hierarchy from suppressing fan that the source expressly allows.

| Source fan / situation | Explicit positive constraint |
|---|---|
| All Green | may combine with Full Flush or Half Flush as the actual tile composition permits |
| Nine Gates | may combine with Fully Concealed Hand when self-drawn; Appendix example also combines Pure Straight and Tile Hog |
| Four Kongs | points for concealed Pungs may be added where supported |
| Seven Shifted Pairs | may combine with Fully Concealed Hand when self-drawn |
| Thirteen Orphans | may combine with Fully Concealed Hand when self-drawn |
| All Terminals | may combine with Double Pung or Triple Pung; example scores Double Pung twice |
| Little Four Winds | may combine with Prevalent Wind and Seat Wind when applicable |
| Four Concealed Pungs | may combine with Fully Concealed Hand when self-drawn |
| Three Kongs | may combine with Three Concealed Pungs when all three Kongs are concealed |
| Seven Pairs | may combine with Fully Concealed Hand when self-drawn |
| Greater Honors and Knitted Tiles | may combine with Fully Concealed Hand when self-drawn |
| Lesser Honors and Knitted Tiles | may combine with Fully Concealed Hand when self-drawn |
| Two Melded Kongs | one melded Kong + one concealed Kong is explicitly six points |
| Flower replacement | Self-Drawn may score; Out with Replacement Tile does not |

### Multiplicity / choice examples that constrain the five-principle evaluator

The Appendix examples additionally prove that the evaluator must preserve occurrence identity and cannot simply deduplicate by binding:

- All Terminals can score **Double Pung twice**.
- All Even Pungs can score **Double Pung twice**.
- Middle Tiles can score **Tile Hog three times**.
- Reversible Tiles can score **Pure Double Chow twice** and can score Pung of Terminals or Honors twice in another example.
- Outside Hand demonstrates alternative legal reuses: one example scores Pure Double Chow + Two Terminal Chows twice, or Two Terminal Chows + Pure Double Chow twice.
- Two Concealed Kongs example scores Pung of Terminals or Honors three times.
- Two Concealed Pungs example includes a concealed Kong and separately scores Concealed Kong, proving a concealed Kong can participate in the concealed-Pung fan while retaining its own Kong fan where the source permits it.
- Pure Straight examples demonstrate that the fourth set may combine once with a set already used by the straight to score one lower relationship such as Pure Double Chow, Short Straight or Two Terminal Chows.
- Mixed Straight likewise demonstrates a lawful lower relationship such as Short Straight or Mixed Double Chow in addition to the 8-point fan when the structural use satisfies §3.9.1.

These examples are positive constraints on the search. A generic "higher fan suppresses every lower-looking fan" implementation is invalid.

---

## 4. Principle-derived rules — separate from the source-explicit table

The following are §3.9.1 consequences, not Green-Book sentences that should be labelled `source-*`.

Implementation must evaluate them against the actual occurrence identities and source-positive constraints above.

### 4.1 Safe whole-family / whole-hand Non-Repeat implications

The following are mechanically lower forms under the accepted detector semantics and should not add points when represented by the same physical structure:

- Four Kongs -> Three Kongs.
- Quadruple Chow -> Pure Triple Chow occurrences contained in those four Chows.
- Four Pure Shifted Pungs -> Pure Shifted Pungs occurrences contained in those four Pungs/Kongs.
- Four Pure Shifted Chows -> Pure Shifted Chows occurrences contained in those four Chows.
- Triple Pung -> Double Pung occurrences formed by the same three same-rank Pungs/Kongs.
- Four Concealed Pungs -> Three Concealed Pungs and Two Concealed Pungs formed from those same concealed sets.
- Three Concealed Pungs -> Two Concealed Pungs formed from those same concealed sets.
- Three Kongs -> lower Kong fan formed from those same three Kongs, while preserving the source's explicit permission for concealed-Pung fan where supported.
- Two Concealed Kongs -> lower Concealed Kong occurrences formed by those Kongs.
- Two Melded Kongs -> lower Melded Kong occurrences formed by those Kongs.
- All Terminals -> the broader All Terminals and Honors candidate under the accepted detector predicate.
- Upper Tiles -> Upper Four.
- Lower Tiles -> Lower Four.
- Fully Concealed Hand -> Self-Drawn: fan 56's definition itself requires a self-drawn win.
- Out with Replacement Tile -> Self-Drawn for a Kong replacement: §3.7.2 defines that replacement draw as self-drawn and fan 46 is the higher event fan. Flower replacement is the explicit exception because fan 46 does not apply there.

### 4.2 Composition implications that need direct regression proof

These are true under the accepted predicates but should be tested rather than hidden in a broad name hierarchy:

- Pure Terminal Chows has no Honors, so No Honors must not leak as an extra point.
- All Even Pungs contains only suited even tiles, so No Honors must not leak in addition to the source-explicit All Pungs / All Simples suppression.
- All Fives contains no Honors, so No Honors must not leak in addition to the source-explicit All Simples suppression.
- All Simples necessarily contains no Honors, so No Honors is not an additional score.

### 4.3 Do not infer transitive or visual hierarchy blindly

Several source examples prove that a shape which visually contains another scoring idea may still combine with it through a lawful distinct structural use. In particular:

- Nine Gates may combine with Pure Straight and Tile Hog.
- Three Kongs may combine with Three Concealed Pungs if all Kongs are concealed.
- Pure Straight may combine with one qualifying Pure Double Chow / Short Straight / Two Terminal Chows relationship through the fourth-set reuse allowed by §3.9.1.
- Mixed Straight may similarly combine with a qualifying lower Chow relationship.

Therefore the runtime must not derive a universal hierarchy from English fan names or tile-subset intuition.

---

## 5. Correction to the abbreviated catalogue table used by PR #309

Compared with the current `MCR_2006_SOURCE_EXCLUSIONS` table at PR #309 head `813762412ae74cc133d826504252c9e67f41129c`, the source-explicit table above requires these exact corrections:

### Missing source-explicit relationships

- `quadruple-chow` also excludes `tile-hog` and `pure-double-chow`.
- `four-pure-shifted-pungs` also excludes `all-pungs`.
- `four-pure-shifted-chows` excludes `short-straight`.
- `pure-triple-chow` also excludes `pure-shifted-pungs`.
- `pure-shifted-pungs` excludes `pure-triple-chow`.

### Currently misclassified as source-explicit

These are not direct Green-Book exclusion sentences and must not use `source-*` reason IDs:

- `pure-terminal-chows -> no-honors` — principle-derived composition implication, not a direct fan-13 sentence.
- `pure-terminal-chows -> one-voided-suit` — not source-explicit and should not be needed under the accepted one-suit/two-suit detector predicates.
- `full-flush -> one-voided-suit` — not source-explicit and should not be needed under the accepted one-suit/two-suit detector predicates.

### Current principle map also needs correction

- `quadruple-chow -> no-honors` is not generally valid: the pair can be an Honor. Remove this static implication.
- add the missing principle-derived cases listed in section 4, especially Four Kongs -> Three Kongs, Upper Tiles -> Upper Four, Lower Tiles -> Lower Four, Fully Concealed Hand -> Self-Drawn, and Kong-replacement Out with Replacement Tile -> Self-Drawn.

---

## 6. Required audit taxonomy

Every suppression emitted by `interaction.mcr-2006-non-combination` must be attributable to exactly one of:

- `source-explicit` — direct Green Book interaction wording from section 2;
- `non-repeat`;
- `non-separation`;
- `non-identical`;
- `high-versus-low`;
- `account-once`.

The public/audit result may use stable implementation reason IDs, but source-explicit and principle-derived reasons must remain distinguishable.

---

## 7. Pass-1 acceptance consequence

PR #309 is not accepted until:

1. `MCR_2006_SOURCE_EXCLUSIONS` matches section 2 exactly for pairwise fan exclusions/implications represented in code;
2. principle-derived rules are moved/kept outside that source-explicit matrix;
3. the source-positive constraints in section 3 are protected by behavioural tests;
4. the five-principle evaluator still operates on occurrence identity and remains order-independent;
5. mixed Kong arithmetic remains M/M=4, M/C=6, C/C=8;
6. no Pass-2 Chicken/qualification/Flowers/final-selection behaviour leaks into Pass 1.

This closes the source-corpus gap exposed during the first PR #309 review without changing the pinned 81-fan catalogue or detector predicates.