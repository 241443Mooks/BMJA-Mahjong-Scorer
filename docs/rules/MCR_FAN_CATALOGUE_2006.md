# MCR 2006 fan catalogue

Status: **source-linked transcription for implementation fixtures**  
Issue: #176  
Profile target: `mcr-wmo-2006@0.x`  
Catalogue concept: `catalogue.pattern.mcr-wmo-2006`

Authority: World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006 (“Green Book”), English edition distributed by EMA.

The names and values below are factual indexing data. Detector summaries are independent implementation paraphrases, not reproduced rulebook prose.

## Evidence codes

| Code | Meaning |
|---|---|
| `H` | complete final hand / legal decomposition is sufficient |
| `X` | exposure/concealment state of groups matters |
| `C` | trusted table context (seat/prevailing wind) matters |
| `M` | win method (discard/self-draw) matters |
| `W` | winning tile is needed to reconstruct the pre-win wait |
| `E` | resolved special win event from the physical table is needed |
| `V` | visible-table fact not reconstructable from hand alone is needed |
| `F` | winner's Flower count is needed |
| `I` | interaction engine / other matched fan determine the result |

The implementation should derive `H`, `X` and `W` facts where possible rather than asking the player to name fan.

## Catalogue

| # | Stable binding ID | Fan | Pts | Detector synopsis | Evidence | Formal locator |
|---:|---|---|---:|---|---|---|
| 1 | `mcr2006.fan.big-four-winds` | Big Four Winds | 88 | Four Wind Pungs/Kongs | H | §3.8.1 #1; App.1 #1 |
| 2 | `mcr2006.fan.big-three-dragons` | Big Three Dragons | 88 | Pungs/Kongs of all three Dragons | H | §3.8.1 #2; App.1 #2 |
| 3 | `mcr2006.fan.all-green` | All Green | 88 | Entire hand uses only 2/3/4/6/8 Bamboo and Green Dragon | H | §3.8.1 #3; App.1 #3 |
| 4 | `mcr2006.fan.nine-gates` | Nine Gates | 88 | Concealed 1112345678999 base in one suit plus any same-suit winner | H,X,W | §3.8.1 #4; App.1 #4 |
| 5 | `mcr2006.fan.four-kongs` | Four Kongs | 88 | Four Kongs, concealed or melded | H,X | §3.8.1 #5; App.1 #5 |
| 6 | `mcr2006.fan.seven-shifted-pairs` | Seven Shifted Pairs | 88 | Seven same-suit pairs with consecutive ranks | H | §3.8.1 #6; App.1 #6 |
| 7 | `mcr2006.fan.thirteen-orphans` | Thirteen Orphans | 88 | Twelve distinct terminals/honors plus pair of the thirteenth type | H | §3.8.1 #7; App.1 #7 |
| 8 | `mcr2006.fan.all-terminals` | All Terminals | 64 | Pair/Pungs/Kongs use only suited 1s and 9s | H | §3.8.1 #8; App.1 #8 |
| 9 | `mcr2006.fan.little-four-winds` | Little Four Winds | 64 | Three Wind Pungs/Kongs plus pair of fourth Wind | H,C | §3.8.1 #9; App.1 #9 |
| 10 | `mcr2006.fan.little-three-dragons` | Little Three Dragons | 64 | Two Dragon Pungs/Kongs plus pair of third Dragon | H | §3.8.1 #10; App.1 #10 |
| 11 | `mcr2006.fan.all-honors` | All Honors | 64 | Hand contains only Wind/Dragon pairs, Pungs or Kongs | H | §3.8.1 #11; App.1 #11 |
| 12 | `mcr2006.fan.four-concealed-pungs` | Four Concealed Pungs | 64 | Four Pungs/Kongs achieved without melding | H,X | §3.8.1 #12; App.1 #12 |
| 13 | `mcr2006.fan.pure-terminal-chows` | Pure Terminal Chows | 64 | Two 123 and two 789 Chows in one suit plus pair of 5s | H | §3.8.1 #13; App.1 #13 |
| 14 | `mcr2006.fan.quadruple-chow` | Quadruple Chow | 48 | Four identical Chows in one suit | H,I | §3.8.1 #14; App.1 #14 |
| 15 | `mcr2006.fan.four-pure-shifted-pungs` | Four Pure Shifted Pungs | 48 | Four same-suit Pungs/Kongs at four consecutive ranks | H,I | §3.8.1 #15; App.1 #15 |
| 16 | `mcr2006.fan.four-pure-shifted-chows` | Four Pure Shifted Chows | 32 | Four same-suit Chows stepping consistently by 1 or by 2 | H,I | §3.8.1 #16; App.1 #16 |
| 17 | `mcr2006.fan.three-kongs` | Three Kongs | 32 | Three Kongs | H,X,I | §3.8.1 #17; App.1 #17 |
| 18 | `mcr2006.fan.all-terminals-and-honors` | All Terminals and Honors | 32 | Pair/Pungs/Kongs use only terminals and honors | H | §3.8.1 #18; App.1 #18 |
| 19 | `mcr2006.fan.seven-pairs` | Seven Pairs | 24 | Seven pairs | H | §3.8.1 #19; App.1 #19 |
| 20 | `mcr2006.fan.greater-honors-knitted` | Greater Honors and Knitted Tiles | 24 | Seven single honors plus seven compatible knitted-suit singles | H | §3.8.1 #20; App.1 #20 |
| 21 | `mcr2006.fan.all-even-pungs` | All Even Pungs | 24 | Pungs/Kongs and pair use only even suited ranks | H | §3.8.1 #21; App.1 #21 |
| 22 | `mcr2006.fan.full-flush` | Full Flush | 24 | Entire hand in one numbered suit | H | §3.8.1 #22; App.1 #22 |
| 23 | `mcr2006.fan.pure-triple-chow` | Pure Triple Chow | 24 | Three identical Chows in one suit | H,I | §3.8.1 #23; App.1 #23 |
| 24 | `mcr2006.fan.pure-shifted-pungs` | Pure Shifted Pungs | 24 | Three same-suit Pungs/Kongs at consecutive ranks | H,I | §3.8.1 #24; App.1 #24 |
| 25 | `mcr2006.fan.upper-tiles` | Upper Tiles | 24 | Hand uses only suited ranks 7/8/9 | H | §3.8.1 #25; App.1 #25 |
| 26 | `mcr2006.fan.middle-tiles` | Middle Tiles | 24 | Hand uses only suited ranks 4/5/6 | H | §3.8.1 #26; App.1 #26 |
| 27 | `mcr2006.fan.lower-tiles` | Lower Tiles | 24 | Hand uses only suited ranks 1/2/3 | H | §3.8.1 #27; App.1 #27 |
| 28 | `mcr2006.fan.pure-straight` | Pure Straight | 16 | Same-suit 123 + 456 + 789 Chows | H,I | §3.8.1 #28; App.1 #28 |
| 29 | `mcr2006.fan.three-suited-terminal-chows` | Three-Suited Terminal Chows | 16 | 123+789 in two suits plus pair of 5s in third suit | H,I | §3.8.1 #29; App.1 #29 |
| 30 | `mcr2006.fan.pure-shifted-chows` | Pure Shifted Chows | 16 | Three same-suit Chows stepping consistently by 1 or 2 | H,I | §3.8.1 #30; App.1 #30 |
| 31 | `mcr2006.fan.all-fives` | All Fives | 16 | Every set/pair contains a 5 | H | §3.8.1 #31; App.1 #31 |
| 32 | `mcr2006.fan.triple-pung` | Triple Pung | 16 | Same-rank Pung/Kong in all three suits | H | §3.8.1 #32; App.1 #32 |
| 33 | `mcr2006.fan.three-concealed-pungs` | Three Concealed Pungs | 16 | Three Pungs/Kongs achieved without melding | H,X | §3.8.1 #33; App.1 #33 |
| 34 | `mcr2006.fan.lesser-honors-knitted` | Lesser Honors and Knitted Tiles | 12 | Irregular singles using honors plus compatible knitted-suit tiles | H | §3.8.1 #34; App.1 #34 |
| 35 | `mcr2006.fan.knitted-straight` | Knitted Straight | 12 | Three different 147/258/369 knitted sequences assigned across suits | H | §3.8.1 #35; App.1 #35 |
| 36 | `mcr2006.fan.upper-four` | Upper Four | 12 | Hand uses suited ranks 6–9 only | H | §3.8.1 #36; App.1 #36 |
| 37 | `mcr2006.fan.lower-four` | Lower Four | 12 | Hand uses suited ranks 1–4 only | H | §3.8.1 #37; App.1 #37 |
| 38 | `mcr2006.fan.big-three-winds` | Big Three Winds | 12 | Pungs/Kongs of any three Winds | H,C | §3.8.1 #38; App.1 #38 |
| 39 | `mcr2006.fan.mixed-straight` | Mixed Straight | 8 | 123/456/789 distributed across three suits | H,I | §3.8.1 #39; App.1 #39 |
| 40 | `mcr2006.fan.reversible-tiles` | Reversible Tiles | 8 | Entire hand uses only the Green-Book vertically symmetric tile set | H | §3.8.1 #40; App.1 #40 |
| 41 | `mcr2006.fan.mixed-triple-chow` | Mixed Triple Chow | 8 | Same-number Chow in each of three suits | H,I | §3.8.1 #41; App.1 #41 |
| 42 | `mcr2006.fan.mixed-shifted-pungs` | Mixed Shifted Pungs | 8 | Pung/Kong in each suit, ranks stepping by 1 | H,I | §3.8.1 #42; App.1 #42 |
| 43 | `mcr2006.fan.chicken-hand` | Chicken Hand | 8 | Legal winning hand with zero other non-Flower fan | H,I | §3.8.1 #43; App.1 #43 |
| 44 | `mcr2006.fan.last-tile-draw` | Last Tile Draw | 8 | Win by drawing the final wall tile | E,M | §3.8.1 #44; App.1 #44 |
| 45 | `mcr2006.fan.last-tile-claim` | Last Tile Claim | 8 | Win on the final discard after the wall is exhausted | E,M | §3.8.1 #45; App.1 #45 |
| 46 | `mcr2006.fan.out-with-replacement-tile` | Out with Replacement Tile | 8 | Win on a Kong replacement draw, excluding Flower replacement | E,M | §3.8.1 #46; App.1 #46 |
| 47 | `mcr2006.fan.robbing-the-kong` | Robbing the Kong | 8 | Win on tile added to promote a melded Pung to Kong | E,M | §3.8.1 #47; App.1 #47 |
| 48 | `mcr2006.fan.two-concealed-kongs` | Two Concealed Kongs | 8 | Two concealed Kongs | H,X,I | §3.8.1 #48; App.1 #48 |
| 49 | `mcr2006.fan.all-pungs` | All Pungs | 6 | Four Pungs/Kongs plus pair | H | §3.8.1 #49; App.1 #49 |
| 50 | `mcr2006.fan.half-flush` | Half Flush | 6 | One numbered suit plus honors | H | §3.8.1 #50; App.1 #50 |
| 51 | `mcr2006.fan.mixed-shifted-chows` | Mixed Shifted Chows | 6 | Three Chows, one per suit, ranks stepping by 1 | H,I | §3.8.1 #51; App.1 #51 |
| 52 | `mcr2006.fan.all-types` | All Types | 6 | Hand collectively includes Characters, Bamboo, Dots, Winds and Dragons | H | §3.8.1 #52; App.1 #52 |
| 53 | `mcr2006.fan.melded-hand` | Melded Hand | 6 | All four sets exposed; pair completed by winning discard on single wait | H,X,M,W | §3.8.1 #53; App.1 #53 |
| 54 | `mcr2006.fan.two-dragon-pungs` | Two Dragon Pungs | 6 | Two Dragon Pungs/Kongs | H,I | §3.8.1 #54; App.1 #54 |
| 55 | `mcr2006.fan.outside-hand` | Outside Hand | 4 | Every set and pair contains a terminal or honor | H | §3.8.1 #55; App.1 #55 |
| 56 | `mcr2006.fan.fully-concealed-hand` | Fully Concealed Hand | 4 | No melded sets and win by self-draw | H,X,M | §3.8.1 #56; App.1 #56 |
| 57 | `mcr2006.fan.two-melded-kongs` | Two Melded Kongs | 4 | Two melded Kongs | H,X,I | §3.8.1 #57; App.1 #57 |
| 58 | `mcr2006.fan.last-tile` | Last Tile | 4 | Winning tile is final visible copy of that tile kind | V,W | §3.8.1 #58; App.1 #58 |
| 59 | `mcr2006.fan.dragon-pung` | Dragon Pung | 2 | Dragon Pung/Kong | H,I | §3.8.1 #59; App.1 #59 |
| 60 | `mcr2006.fan.prevalent-wind` | Prevalent Wind | 2 | Pung/Kong of current prevailing Wind | H,C | §3.8.1 #60; App.1 #60 |
| 61 | `mcr2006.fan.seat-wind` | Seat Wind | 2 | Pung/Kong of player's Seat Wind | H,C | §3.8.1 #61; App.1 #61 |
| 62 | `mcr2006.fan.concealed-hand` | Concealed Hand | 2 | No melded sets and win by discard | H,X,M | §3.8.1 #62; App.1 #62 |
| 63 | `mcr2006.fan.all-chows` | All Chows | 2 | Four Chows and a suited pair; no honors | H,I | §3.8.1 #63; App.1 #63 |
| 64 | `mcr2006.fan.tile-hog` | Tile Hog | 2 | All four copies of a suited tile used without forming a Kong | H | §3.8.1 #64; App.1 #64 |
| 65 | `mcr2006.fan.double-pung` | Double Pung | 2 | Same-rank Pung/Kong in two suits | H,I | §3.8.1 #65; App.1 #65 |
| 66 | `mcr2006.fan.two-concealed-pungs` | Two Concealed Pungs | 2 | Two Pungs/Kongs achieved without melding | H,X,I | §3.8.1 #66; App.1 #66 |
| 67 | `mcr2006.fan.concealed-kong` | Concealed Kong | 2 | Four self-drawn identical tiles declared as concealed Kong | H,X,I | §3.8.1 #67; App.1 #67 |
| 68 | `mcr2006.fan.all-simples` | All Simples | 2 | No terminals or honors anywhere in hand | H | §3.8.1 #68; App.1 #68 |
| 69 | `mcr2006.fan.pure-double-chow` | Pure Double Chow | 1 | Two identical Chows in same suit | H,I | §3.8.1 #69; App.1 #69 |
| 70 | `mcr2006.fan.mixed-double-chow` | Mixed Double Chow | 1 | Same-number Chow in two suits | H,I | §3.8.1 #70; App.1 #70 |
| 71 | `mcr2006.fan.short-straight` | Short Straight | 1 | Two same-suit consecutive Chows forming six ranks | H,I | §3.8.1 #71; App.1 #71 |
| 72 | `mcr2006.fan.two-terminal-chows` | Two Terminal Chows | 1 | Same-suit 123 and 789 Chows | H,I | §3.8.1 #72; App.1 #72 |
| 73 | `mcr2006.fan.pung-terminals-or-honors` | Pung of Terminals or Honors | 1 | Pung/Kong of suited 1/9 or a Wind; Dragon Pung scores under fan 59 instead | H,I | §3.8.1 #73; App.1 #73 |
| 74 | `mcr2006.fan.melded-kong` | Melded Kong | 1 | Kong claimed from another player or promoted from melded Pung | H,X,I | §3.8.1 #74; App.1 #74 |
| 75 | `mcr2006.fan.one-voided-suit` | One Voided Suit | 1 | Uses only two of the three numbered suits | H,I | §3.8.1 #75; App.1 #75 |
| 76 | `mcr2006.fan.no-honors` | No Honors | 1 | No Wind or Dragon tiles | H,I | §3.8.1 #76; App.1 #76 |
| 77 | `mcr2006.fan.edge-wait` | Edge Wait | 1 | Sole winning tile is 3 for 12 or 7 for 89 | H,W,I | §3.8.1 #77; App.1 #77 |
| 78 | `mcr2006.fan.closed-wait` | Closed Wait | 1 | Sole winning tile fills middle of a Chow | H,W,I | §3.8.1 #78; App.1 #78 |
| 79 | `mcr2006.fan.single-wait` | Single Wait | 1 | Sole winning tile completes the pair | H,W,I | §3.8.1 #79; App.1 #79 |
| 80 | `mcr2006.fan.self-drawn` | Self-Drawn | 1 | Ordinary fresh-wall self-draw, including Flower replacement | M,E,I | §3.8.1 #80; App.1 #80 |
| 81 | `mcr2006.fan.flower-tiles` | Flower Tiles | 1 each | One point per Flower retained by winner, applied after win qualification | F,I | §3.8.1 #81; §3.11.6.6 |

## Scoring interaction policy

The 81 detectors are **not** independent switches whose point values are blindly added.

Green Book §3.9.1(5) requires one MCR interaction policy implementing five principles:

1. **Non-Repeat** — do not also score a lower fan that is inevitably included/implied by a higher fan;
2. **Non-Separation** — once sets are grouped to form a fan, do not rearrange those same sets to create a different incompatible fan;
3. **Non-Identical** — a set already used with one set to create a fan cannot be reused with another set to claim the same fan again;
4. **High-versus-Low** — where the same sets support mutually exclusive alternatives, choose the higher scoring lawful fan;
5. **Account-Once** — unused sets can be combined with already-used sets only within the source's one-reuse constraint.

The runtime policy target remains:

```text
interaction.mcr-2006-non-combination
qualification.mcr-8-before-flowers
```

## Explicit source exclusions / implications worth pinning as fixtures

These are especially useful because they prevent an implementation from relying only on generic subset detection.

| Fan | Source interaction note |
|---|---|
| Big Four Winds | does not additionally score Big Three Winds, All Pungs, Prevalent Wind, Seat Wind, or Pung of Terminals/Honors |
| Big Three Dragons | does not additionally score Two Dragon Pungs or Dragon Pung |
| Nine Gates | does not additionally score Full Flush, Concealed Hand, or Pung of Terminals/Honors; may combine Fully Concealed if self-drawn |
| Four Kongs | does not additionally score Single Wait; concealed-Pung value may still apply where supported |
| Seven Shifted Pairs | does not additionally score Full Flush, Concealed Hand, or Single Wait; may combine Fully Concealed if self-drawn |
| Thirteen Orphans | does not additionally score All Types, Concealed Hand, or Single Wait; may combine Fully Concealed if self-drawn |
| All Terminals | does not additionally score All Pungs, Outside Hand, Pung of Terminals/Honors, or No Honors |
| Little Four Winds | does not additionally score Big Three Winds or Pung of Terminals/Honors; Prevalent/Seat Wind can still score when applicable |
| Little Three Dragons | does not additionally score Dragon Pung or Two Dragon Pungs |
| All Honors | does not additionally score All Pungs, Outside Hand, or Pung of Terminals/Honors |
| Four Concealed Pungs | does not additionally score All Pungs or Concealed Hand; may combine Fully Concealed when self-drawn |
| Pure Terminal Chows | does not additionally score Seven Pairs, Full Flush, All Chows, Pure Double Chow, or Two Terminal Chows |
| All Terminals and Honors | does not additionally score All Pungs or Pung of Terminals/Honors |
| Seven Pairs | does not additionally score Concealed Hand or Single Wait; may combine Fully Concealed when self-drawn |
| Greater Honors and Knitted Tiles | does not additionally score All Types or Concealed Hand; may combine Fully Concealed when self-drawn |
| All Even Pungs | does not additionally score All Pungs or All Simples |
| Full Flush | does not additionally score No Honors |
| Pure Triple Chow | does not additionally score Pure Double Chow |
| Upper / Middle / Lower Tiles | source suppresses lower composition fan such as No Honors (and All Simples for Middle Tiles) |
| Three-Suited Terminal Chows | does not additionally score Pure Double Chow, Two Terminal Chows, No Honors, or All Chows |
| All Fives | does not additionally score All Simples |
| Lesser Honors and Knitted Tiles | does not additionally score All Types or Concealed Hand; may combine Fully Concealed when self-drawn |
| Upper Four / Lower Four | source suppresses No Honors |
| Reversible Tiles | source suppresses One Voided Suit |
| Last Tile Draw | source explicitly suppresses Self-Drawn |
| Out with Replacement Tile | Kong replacement only; Flower-replacement win instead may score Self-Drawn |
| Robbing the Kong | source explicitly suppresses Last Tile |
| Melded Hand | source explicitly suppresses Single Wait |
| All Chows | No Honors is implied and not additionally scored |
| Edge / Closed / Single Wait | only score when the reconstructed pre-win hand has exactly that single winning tile possibility; overlapping/multiple waits do not score the wait fan |
| Flower Tiles | ignored for the 8-point legal-Hu threshold; added only after non-Flower qualification succeeds |

## 2006 English-text anomalies that must not be silently guessed

Two Appendix 1 lines appear internally inconsistent with the structures they describe:

- fan 14 **Quadruple Chow** says it does not combine with “Pure Shifted Pungs”, although a four-identical-Chow structure naturally contains lower identical-Chow fan rather than shifted Pungs;
- fan 15 **Four Pure Shifted Pungs** says it does not combine with “Pure Triple Chow”, although the structure naturally contains the lower Pure Shifted Pungs fan.

Later/secondary MCR references commonly treat these as:

```text
Quadruple Chow -> suppress Pure Triple Chow (+ Pure Double Chow / Tile Hog as applicable)
Four Pure Shifted Pungs -> suppress Pure Shifted Pungs (+ All Pungs)
```

For `mcr-wmo-2006@1.0`, do **not** silently replace the Green Book English wording merely because the correction looks obvious. Resolve this with a documented interpretation source (preferably the Chinese text / formal later clarification) and lock the result with fixtures.

Until then these two interaction edges are `interpretation-required`, not `research-required` for the rest of the catalogue.

## Implementation consequence

A future MCR scorer should conceptually do:

```text
validate permitted winning structure
→ enumerate lawful decompositions where necessary
→ detect candidate fan
→ apply mcr-2006 interaction/counting policy
→ compute non-Flower qualifying subtotal
→ require subtotal >= 8
→ add Flower points
→ return auditable fan list + suppressed candidates + Basic Points
```

The score result should explain **which fan counted and which candidate fan were suppressed**, so a player can verify MCR arithmetic without understanding the engine internals.
