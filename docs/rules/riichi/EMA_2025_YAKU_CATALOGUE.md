# EMA Riichi 2025 — yaku / yakuman catalogue

Status: **pre-code source-bound catalogue for #202**  
Profile: `riichi-ema-2025@0.x`  
Authority: `ema-riichi-2025`  
Primary locators: §4.2 pp. 23–26; compact official list p. 42.

## Contract

Each binding below is **Riichi profile-owned scoring semantics**. A shared canonical structural predicate may be reused only where exact structural equivalence is separately proved; the yaku's value, open/closed treatment, event requirements and interactions remain owned by the EMA 2025 profile.

Stable project IDs use the prefix:

```text
riichi.ema2025.yaku.*
riichi.ema2025.yakuman.*
```

Dora / kan-dora / ura-dora are **not yaku** and are deliberately absent from this catalogue.

---

## One-han yaku

| Stable ID | Yaku | Closed han | Open han | Evidence/detector class | Source-owned notes |
|---|---|---:|---:|---|---|
| `riichi.ema2025.yaku.riichi` | Riichi | 1 | — | declaration/context | Concealed tenpai hand with accepted riichi declaration. |
| `riichi.ema2025.yaku.ippatsu` | Ippatsu | 1 | — | event/context | Requires riichi; first uninterrupted set of turns. A called set or declared quad interrupts. |
| `riichi.ema2025.yaku.menzen-tsumo` | Fully Concealed Hand / Menzen Tsumo | 1 | — | hand + win source | Concealed hand won by self-draw. |
| `riichi.ema2025.yaku.pinfu` | Pinfu | 1 | — | structure + wait + context | Four sequences, valueless pair, two-sided wait. 20 fu tsumo / 30 fu ron treatment. |
| `riichi.ema2025.yaku.iipeiko` | Pure Double Sequence / Iipeikō | 1 | — | structure | Two identical sequences in same suit; concealed only. |
| `riichi.ema2025.yaku.tanyao` | All Simples / Tan'yao | 1 | 1 | structure | No terminals or honours. Open allowed. |
| `riichi.ema2025.yaku.dragon-triplet` | Dragon Triplet / Fanpai-Yakuhai | 1 each | 1 each | structure | One han per dragon triplet/quad; multiple dragon sets score separately. |
| `riichi.ema2025.yaku.seat-wind-triplet` | Seat Wind Triplet | 1 | 1 | structure + seat context | Triplet/quad of player's seat wind. |
| `riichi.ema2025.yaku.round-wind-triplet` | Round Wind Triplet | 1 | 1 | structure + round context | Triplet/quad of current round wind. A double-wind set may satisfy both seat + round yaku. |
| `riichi.ema2025.yaku.rinshan-kaihou` | After a Quad / Rinshan Kaihō | 1 | 1 | resolved win event | Win on replacement tile after declaring a quad. Counts ordinary self-draw fu. Does not combine with Haitei. |
| `riichi.ema2025.yaku.chankan` | Robbing a Quad / Chankan | 1 | 1 | resolved win event | Ron on tile extending a melded triplet to quad. No new kan-dora indicator. May combine with Ippatsu. Concealed-quad robbery only for Kokushi. |
| `riichi.ema2025.yaku.haitei` | Under the Sea / Haitei | 1 | 1 | resolved win event | Self-draw on last wall tile. Does not combine with Rinshan. |
| `riichi.ema2025.yaku.houtei` | Under the River / Hōtei | 1 | 1 | resolved win event | Ron on last discard. |

---

## Two-han yaku

| Stable ID | Yaku | Closed han | Open han | Evidence/detector class | Source-owned notes |
|---|---|---:|---:|---|---|
| `riichi.ema2025.yaku.double-riichi` | Double Riichi / Daburu Riichi | 2 | — | declaration/event | Riichi declared on player's first turn in first uninterrupted set. Does not combine with ordinary Riichi; may combine with Ippatsu. |
| `riichi.ema2025.yaku.chiitoitsu` | Seven Pairs | 2 | — | irregular structure | Seven **different** pairs; two identical pairs not allowed. Fixed 25 fu and no other fu. |
| `riichi.ema2025.yaku.sanshoku-doujun` | Mixed Triple Sequence | 2 | 1 | structure | Same numerical sequence in all three suits. |
| `riichi.ema2025.yaku.ittsu` | Pure Straight / Ittsū | 2 | 1 | structure | 123 + 456 + 789 in same suit. |
| `riichi.ema2025.yaku.chanta` | Half Outside Hand | 2 | 1 | structure | Every set/pair contains terminal or honour; includes honours and at least one sequence. |
| `riichi.ema2025.yaku.sanshoku-doukou` | Triple Triplet | 2 | 2 | structure | Same-number triplet/quad in each suit. |
| `riichi.ema2025.yaku.sanankou` | Three Concealed Triplets | 2 | 2 | structure + winning tile/source | Three concealed triplets/quads; whole hand need not be concealed. Ron-completed triplet is melded for this evaluation. |
| `riichi.ema2025.yaku.sankantsu` | Three Quads | 2 | 2 | structure | Three declared quads. |
| `riichi.ema2025.yaku.toitoi` | All Triplets | 2 | 2 | structure | Four triplets/quads + pair. |
| `riichi.ema2025.yaku.shousangen` | Little Three Dragons | 2 | 2 | structure | Two dragon triplets/quads + dragon pair. Individual dragon triplets also add Yakuhai han. |
| `riichi.ema2025.yaku.honroutou` | All Terminals and Honours | 2 | 2 | structure | Only terminals/honours. Source explicitly adds either Toitoi or Seven Pairs as structurally applicable. |

---

## Three-han yaku

| Stable ID | Yaku | Closed han | Open han | Evidence/detector class | Source-owned notes |
|---|---|---:|---:|---|---|
| `riichi.ema2025.yaku.ryanpeikou` | Twice Pure Double Sequence | 3 | — | structure | Four sequences forming two Iipeikō. Do not additionally count Iipeikō. |
| `riichi.ema2025.yaku.honitsu` | Half Flush | 3 | 2 | structure | One suit + honours. |
| `riichi.ema2025.yaku.junchan` | Full Outside Hand | 3 | 2 | structure | Every set and pair contains terminals; at least one sequence; no honours. |

---

## Five-han yaku

| Stable ID | Yaku | Closed han | Open han | Evidence/detector class | Source-owned notes |
|---|---|---:|---:|---|---|
| `riichi.ema2025.yaku.renhou` | Blessing of Man / Renhō | 5 | — | resolved first-turn event | Ron in first uninterrupted set of turns before player's first turn. **Cannot combine with any other yaku or dora.** |

---

## Six-han yaku

| Stable ID | Yaku | Closed han | Open han | Evidence/detector class | Source-owned notes |
|---|---|---:|---:|---|---|
| `riichi.ema2025.yaku.chinitsu` | Full Flush | 6 | 5 | structure | Exactly one suit, no honours. |

---

## Yakuman

EMA 2025 yakuman are **not cumulative**. A hand matching more than one yakuman still scores one yakuman value under this profile.

| Stable ID | Yakuman | Open permitted? | Evidence/detector class | Source-owned notes |
|---|---|---:|---|---|
| `riichi.ema2025.yakuman.kokushi-musou` | Thirteen Orphans | no | irregular structure | Only case where a concealed quad may be robbed. |
| `riichi.ema2025.yakuman.chuuren-poutou` | Nine Gates | no | structure | 1112345678999 + one extra same-suit tile; concealed; concealed quad not allowed. |
| `riichi.ema2025.yakuman.tenhou` | Blessing of Heaven | no | resolved initial-hand event | East wins with starting hand. Concealed quad not allowed. |
| `riichi.ema2025.yakuman.chihou` | Blessing of Earth | no | resolved first-turn event | Self-draw in first uninterrupted set of turns. Concealed quad not allowed. |
| `riichi.ema2025.yakuman.suuankou` | Four Concealed Triplets | no | structure + winning source/wait | Four concealed triplets/quads + pair. Ron possible only on pair wait. |
| `riichi.ema2025.yakuman.suukantsu` | Four Quads | yes | structure | Four quads + pair. |
| `riichi.ema2025.yakuman.ryuuiisou` | All Green | yes | structure | Only 2/3/4/6/8 bamboo + green dragon. |
| `riichi.ema2025.yakuman.chinroutou` | All Terminals | yes | structure | Only terminal suit tiles. |
| `riichi.ema2025.yakuman.tsuuiisou` | All Honours | yes | structure | Only winds/dragons. |
| `riichi.ema2025.yakuman.daisangen` | Big Three Dragons | yes | structure + optional liability | Three dragon triplets/quads. Liability may apply when third set was called from another player. |
| `riichi.ema2025.yakuman.shousuushii` | Little Four Winds | yes | structure | Three wind triplets/quads + wind pair. |
| `riichi.ema2025.yakuman.daisuushii` | Big Four Winds | yes | structure + optional liability | Four wind triplets/quads. Liability may apply when fourth set was called from another player. |

---

## Dora modules — separate from yaku

Registry/engine ownership belongs under the Riichi dora policy, not this catalogue:

```text
dora normal
dora kan-dora
dora ura-dora (riichi winners only)
```

Each matching tile contributes +1 han per active indicator. Red-five aka-dora is disabled for EMA 2025.

A dora-only complete hand is **not a legal win** because §3.2 requires at least one yaku.

---

## Explicit interaction / non-stacking rules

At minimum the executable policy must encode these source-owned rules:

```text
Double Riichi suppresses ordinary Riichi
Ryanpeikou suppresses Iipeikou
Rinshan Kaihou and Haitei are mutually exclusive
Renhou suppresses all other yaku and all dora
Yakuman are not cumulative
```

Additional combinations that are structurally additive are not to be suppressed merely because one yaku implies another. Examples explicitly source-backed:

```text
Shousangen + individual Dragon Triplet han
Honroutou + Toitoi OR Chiitoitsu, as structurally applicable
seat-wind triplet + round-wind triplet when the same wind has both roles
```

The scorer should report counted/suppressed yaku with stable reason IDs rather than silently dropping matches.

---

## Yaku eligibility gate

Winning evaluation order must preserve:

```text
complete legal shape
→ at least one yaku / yakuman
→ then add dora han
→ fu / limit / payment
```

Dora never rescue a no-yaku hand.

Furiten is a separate legality gate for ron.

---

## Engineering coverage gate

When implemented:

- every yaku/yakuman binding needs at least one positive detector fixture;
- every open-reduction binding needs closed + open coverage;
- every concealed-only binding needs a negative open fixture where meaningful;
- source-owned suppression rules need dedicated tests;
- event yaku need evidence-required / missing-evidence tests;
- yakuman non-cumulation needs a multi-yakuman-shaped fixture;
- dora-only no-yaku win must fail legality;
- structural detector reuse across families must remain provenance-gated rather than name-gated.
