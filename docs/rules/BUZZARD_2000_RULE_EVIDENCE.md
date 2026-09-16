# Buzzard 2000 British/Western Classical — rule evidence ledger

Status: **implementation gate / provenance ledger**  
Issue: #175  
Implementation child: #217  
Working source ID: `buzzard-2000-classical`  
Intended source: Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It*, last modified 30 March 2000  
Canonical source URL: `http://www.buzzard.me.uk/jonathan/MahJongg.html`

## Why this file exists

`BUZZARD_2000_COMPATIBILITY_CROSSWALK.md` answers **where Buzzard fits in the software architecture**.

This file answers the stricter implementation question:

> **Which Buzzard rule facts are evidenced closely enough to become executable, and which still need the original source re-checked before code is allowed to depend on them?**

The project must not fill a Buzzard gap by copying BMJA, Thompson & Maloney, another classical rules page, or a plausible historical convention.

## Source-access note — 16 September 2026

The Buzzard page was read and manually captured into #175 during the 14 September research pass. On 16 September an automated refetch of the canonical URL returned HTTP 502, so the original page could not be independently re-opened during this evidence-normalisation pass.

Two detailed secondary classical-rules pages were used only as corroboration/checking aids:

- h2g2, *How to Play Mah Jong*, `https://h2g2.com/approved_entry/A6844520`;
- CasinoCity, *Rules of Mah Jong*, `https://www.casinocity.com/rule/mah_jong.htm`.

They overlap strongly with the captured Buzzard mechanics, but they are **not substitutes for Buzzard**. Where they differ, or where #175 lacks an exact original-source locator/value, the evidence below remains `needs-primary-source`.

This is deliberate. Similar classical rules are evidence of architectural compatibility, not proof of Buzzard's exact rule.

## Evidence-status rule

Use the existing `PROVENANCE_MODEL.md` vocabulary:

- `verified` — the original Buzzard source was captured clearly enough in #175 to support the factual rule;
- `needs-primary-source` — an exact value/condition still needs the Buzzard page or an archived exact copy checked;
- `secondary-only` — useful corroboration, but not enough to drive Buzzard implementation.

`verified` here means **verified for this named Buzzard profile from the captured primary-source research**, not governing-body authority. The source remains Authority D in the source register.

## A. Setup, wall and turn procedure

| Rule ID | Buzzard claim | Locator / evidence | Status | Implementation consequence |
|---|---|---|---|---|
| `setup.hand.ordinary-13-14` | Ordinary play holds 13 tiles, draws to 14, and normally wins with four sets plus a pair. | Buzzard capture #175: Core hand/play | verified | Reuse classical hand structure. |
| `setup.wall.basic-136` | Without Flowers/Seasons, each player builds a 17×2 wall for 136 basic tiles. | Buzzard capture #175: Wall / dead-wall behaviour | verified | Reuse tile set; Buzzard wall strategy owns lifecycle. |
| `setup.wall.loose-tiles` | The breach creates two initial Loose Tiles used for replacement behaviour. | Buzzard capture #175: Wall / dead-wall behaviour | verified | New full-table state later; hand scorer can use final event evidence only. |
| `setup.wall.dead-14` | The final 14 tiles, including Loose Tiles, remain unused; reaching them without Mahjong ends the deal without scoring. | Buzzard capture #175: Wall / dead-wall behaviour | verified | Full-table implementation needs automatic dead-wall state; #217 defers it. |
| `progression.dead-hand.east-retains` | A dead/invalid deal leaves East as East. | Buzzard capture #175: Dealer / East / round progression | verified | Buzzard progression fixture required later. |
| `play.turn.order` | Play proceeds East → South → West → North in the source's seating direction. | Buzzard capture #175: Core hand/play | verified | Reuse ordered players; do not infer physical clockwise/counter-clockwise UI from labels alone. |
| `play.claim.chow-preceding` | Chow may be claimed only from the immediately preceding player's discard. | Buzzard capture #175: Core hand/play | verified | Profile legality rule if claim enforcement is implemented. |
| `play.claim.priority.mahjong` | Mahjong takes precedence over Pung/Kong/Chow claims. | Buzzard capture #175: Core hand/play | verified | Procedure layer, not hand value. |
| `play.claim.priority.multiple-winners-turn-order` | If more than one player can win on a discard, the earliest player in normal turn order has precedence. | Buzzard capture #175: Core hand/play | verified | Current single-winner outcome can store the resolved result; claim-event enforcement can come later. |
| `play.claim.after-next-draw` | A previous discard can still be claimed before the next drawing player discards; their just-drawn wall tile may be returned. | Buzzard capture #175: Core hand/play | verified | Full procedure tracker only; #217 defers. |

## B. Kong and replacement behaviour

| Rule ID | Buzzard claim | Locator / evidence | Status | Implementation consequence |
|---|---|---|---|---|
| `play.kong.exposed-from-discard` | A Kong can be exposed from a discard. | Buzzard capture #175: Kong / replacement-tile behaviour | verified | Reuse Kong primitive. |
| `play.kong.concealed` | A concealed Kong can be declared. | Buzzard capture #175: Kong / replacement-tile behaviour | verified | Reuse concealed Kong primitive. |
| `play.kong.promote-exposed-pung` | A self-drawn fourth matching tile may promote an exposed Pung to Kong. | Buzzard capture #175: Kong / replacement-tile behaviour | verified | Reuse/extend event evidence. |
| `play.kong.replacement-loose-tile` | A Kong replacement comes from the source's Loose Tiles. | Buzzard capture #175: Kong / replacement-tile behaviour | verified | Full wall inventory later. |
| `play.kong.promoted-robbable` | A promoted exposed Kong may be robbed for Mahjong. | Buzzard capture #175: Kong / replacement-tile behaviour | verified | Existing rob-Kong win evidence can be reused. |
| `play.kong.concealed-not-robbable` | A concealed Kong cannot be robbed under this profile. | Buzzard capture #175: Kong / replacement-tile behaviour | verified | Buzzard-specific legality policy. |

## C. Calling and Standing Hand

| Rule ID | Buzzard claim | Locator / evidence | Status | Implementation consequence |
|---|---|---|---|---|
| `ready.calling.one-away` | A player one tile from Mahjong is Calling. | Buzzard capture #175: Calling / Standing Hand | verified | Keep separate from Riichi tenpai semantics. |
| `ready.standing-hand.declare` | After the first draw/discard (East after the first discard), a Calling player may declare Standing Hand. | Buzzard capture #175: Calling / Standing Hand | verified | New profile-local declaration state. |
| `ready.standing-hand.lock` | After declaring Standing Hand, the held hand is locked and subsequent wall draws are discarded unless they supply the winning tile. | Buzzard capture #175: Calling / Standing Hand | verified | New legality/state transition; do not map to `originalCall`. |
| `score.bonus.standing` | A completed Standing Hand receives an additive score bonus. | Buzzard capture #175 records **+100 points**. Secondary h2g2/CasinoCity independently show +100. | verified | Later Standing slice can add +100 after the declaration evidence exists. |

## D. Irregular/special structures and event patterns

| Rule ID | Buzzard claim | Locator / evidence | Status | Implementation consequence |
|---|---|---|---|---|
| `pattern.thirteen-odd-majors` | Thirteen Odd Majors is a legal irregular Mahjong structure. | Buzzard capture #175: Special hands; secondary h2g2 gives the structural form. | verified | Reuse canonical Thirteen-Orphans-family predicate only after exact structural equivalence fixture. |
| `pattern.calling-nine-tile` | Calling Nine Tile Hand is a legal irregular Mahjong structure. | Buzzard capture #175: Special hands; secondary h2g2 gives the 111 + 2–8 + 999 one-suit form plus one duplicate. | verified | Likely Nine-Gates-family predicate; verify exact structural mapping in golden fixture. |
| `pattern.original-hand` | East can score an Original Hand / Hand from Heaven / Natural Winning. | Buzzard capture #175: Special hands | verified | Event/context pattern, not merely tile structure. |
| `score.limit.incomplete-wind-achievement` | The source allows a Four-Wind-family limit consequence even where the player has not gone Mahjong. | Buzzard capture #175: Special hands / settlement | verified | Do not encode `limit => winner`; result model must allow non-winner high/limit value. |
| `score.limit.incomplete-dragon-achievement` | The source allows a Three-Dragon-family limit consequence even where the player has not gone Mahjong. | Buzzard capture #175: Special hands / settlement | verified | Same architectural consequence as above. |

## E. Ordinary intrinsic points — exact values still gated

The secondary sources expose a coherent classical point table, but #175 did not yet preserve the original Buzzard table as narrow source locators. These numbers are therefore **candidate transcription values, not yet executable Buzzard authority**.

| Rule ID | Candidate value from secondary corroboration | Status |
|---|---:|---|
| `score.base.pung.simple.exposed` | 2 | needs-primary-source |
| `score.base.pung.simple.concealed` | 4 | needs-primary-source |
| `score.base.pung.terminal.exposed` | 4 | needs-primary-source |
| `score.base.pung.terminal.concealed` | 8 | needs-primary-source |
| `score.base.pung.honour.exposed` | 4 | needs-primary-source |
| `score.base.pung.honour.concealed` | 8 | needs-primary-source |
| `score.base.kong.simple.exposed` | 8 | needs-primary-source |
| `score.base.kong.simple.concealed` | 16 | needs-primary-source |
| `score.base.kong.terminal.exposed` | 16 | needs-primary-source |
| `score.base.kong.terminal.concealed` | 32 | needs-primary-source |
| `score.base.kong.honour.exposed` | 16 | needs-primary-source |
| `score.base.kong.honour.concealed` | 32 | needs-primary-source |
| `score.base.pair.dragon` | 2 | needs-primary-source |
| `score.base.pair.own-wind` | 2 | needs-primary-source |
| `score.base.pair.round-wind` | 2 | needs-primary-source |
| `score.base.bonus-tile` | 4 per Flower/Season | needs-primary-source |

Secondary corroboration: h2g2 and CasinoCity report this same ordinary Pung/Kong/pair table. That agreement is useful, but the final Buzzard profile must bind these numbers to the Buzzard source itself.

## F. Winner additive bonuses — separate confirmed concept from exact binding

#175 captured the following score concepts from Buzzard. Where an exact numeric value is preserved in #175, it is recorded below; otherwise the implementation remains gated.

| Rule ID | Candidate / captured value | Status | Note |
|---|---:|---|---|
| `score.bonus.mahjong` | 20 in both secondary checks | needs-primary-source | Exact Buzzard table locator still required. |
| `score.bonus.self-draw` | +2 | verified | #175 explicitly captured +2. |
| `score.bonus.only-possible` | +2 | verified | #175 explicitly captured +2. |
| `score.bonus.standing` | +100 | verified | Captured in #175 and independently corroborated. |
| `score.bonus.no-chows` | +10 in h2g2/CasinoCity | needs-primary-source | #175's earlier summary described a possible double, so this is a live conflict until Buzzard is re-opened. |
| `score.bonus.scoreless` | +10 in h2g2/CasinoCity | needs-primary-source | Same caution: do not infer Buzzard exact treatment. |
| `score.bonus.last-wall` | +10 in h2g2/CasinoCity | needs-primary-source | #175 captured last-wall scoring but not this exact table locator. |
| `score.bonus.loose-tile` | +10 in h2g2/CasinoCity | needs-primary-source | #175 captured replacement/Loose Tile significance but exact value must be rebound to Buzzard. |

This conflict is important: it proves why “classical-family compatibility” must not be treated as “all classical sources share the same scoring table”.

## G. Doubles — do not import a secondary table into Buzzard

The captured Buzzard issue identifies doubles for Winds/Dragons, hand composition, last-wall/replacement/rob-Kong circumstances and Original Hand. Secondary classical pages do not agree perfectly about which items are additive bonuses, doubles or limits.

The current implementation gate is therefore:

- stable rule IDs may be prepared now;
- **no Buzzard double count should become executable until the original table is re-opened or an archived exact copy is pinned.**

Candidate IDs to bind:

```text
score.double.own-wind
score.double.round-wind
score.double.dragon
score.double.own-flower-season
score.double.flower-season-set
score.double.one-suit-honours
score.double.terminals-honours
score.double.pure-suit
score.double.pure-terminals
score.double.all-honours
score.double.rob-kong
score.double.original-hand
score.double.last-wall
score.double.loose-tile
score.double.all-pungs
score.double.all-chows-scoreless-pair
```

Evidence status for the exact Buzzard value/eligibility of these entries: **`needs-primary-source`** unless a later row explicitly upgrades it.

## H. Limit/cap rules

| Rule ID | Current evidence | Status |
|---|---|---|
| `score.limit.normal` | #175 confirms a classical limit/cap exists. h2g2 says a typical limit is 600, but this is not enough to bind Buzzard's production default. | needs-primary-source |
| `score.limit.three-winds` | #175 confirms Four-Wind-family limit treatment can apply to a non-winner. | verified concept; exact condition/value needs-primary-source |
| `score.limit.three-dragons` | #175 confirms Three-Dragon-family limit treatment can apply to a non-winner. | verified concept; exact condition/value needs-primary-source |
| `score.limit.thirteen-odd-majors` | #175 records the hand; secondary sources commonly treat it as a limit. | needs-primary-source for Buzzard value |
| `score.limit.calling-nine-tile` | #175 records the hand; secondary sources commonly treat it as a limit. | needs-primary-source for Buzzard value |
| `score.limit.original-hand` | #175 records Original Hand; secondary sources vary between doubles and limit treatment. | needs-primary-source |
| `score.limit.east-thirteenth` | #175 records East/dealer progression and classical source material mentions a thirteenth-consecutive-Mahjong rule. | needs-primary-source for exact Buzzard condition/value |

## I. Settlement and progression

| Rule ID | Buzzard claim | Status | Implementation consequence |
|---|---|---|---|
| `settlement.winner-paid-first` | Winner is paid their score by each loser before loser-to-loser settlement. | verified | Reuse transaction infrastructure. |
| `settlement.loser-to-loser` | Losers then settle score differences among themselves. | verified | Strong classical reuse fit. |
| `settlement.east-double` | East pays and receives at double stakes. | verified concept | Exact multiplication order/edge cases should receive golden fixtures before production. |
| `settlement.incomplete-limit` | Incomplete Wind/Dragon limit achievements can affect loser-to-loser settlement. | verified concept | Requires score result independent of winner status. |
| `progression.east-win-retains` | East retains East after winning. | verified | Profile progression strategy. |
| `progression.dead-hand-retains-east` | Dead hand leaves East unchanged. | verified | Profile progression strategy. |
| `progression.non-east-win-rotates` | Non-East win rotates dealer/seat winds. | verified | Profile progression strategy. |
| `progression.prevailing-wind-cycle` | Prevailing wind advances after the source-defined East/dealer cycle. | verified concept | Exact cycle fixture/locator still required before code. |

## J. Liability and penalties — intentionally blocked

These are the highest-risk areas for accidental rule invention.

#175 captured that Buzzard includes dangerous-discard liability and procedural penalties. It did **not** yet preserve enough narrow original-source detail to make every trigger and payment consequence safely executable, and generic classical sources vary.

Keep all of the following `needs-primary-source` until the exact Buzzard wording/locator is pinned:

```text
liability.dangerous-discard.trigger
liability.dangerous-discard.payer-routing
liability.dangerous-discard.suppress-loser-settlement
penalty.false-mahjong.fully-exposed
penalty.false-mahjong.withdrawn-before-exposure
penalty.wrong-tile-count
penalty.invalid-chow-pung-kong
penalty.wall-deal-irregularity
```

Architecture may prepare a generic evidence envelope, but no numeric penalty or liability trigger should be copied from BMJA, OTB, Millington, Babcock or another secondary classical rules page.

## K. Phase 1 implementation gate (#217)

The architecture is ready, but **Phase 1 is not yet fully source-ready** because the exact ordinary point table, double catalogue and limit bindings still need an exact Buzzard source copy/locator.

What is safe now:

- create fixtures/schema around stable IDs;
- reuse canonical hand/group primitives;
- implement nothing that invents a disputed numeric binding;
- prepare the profile pack structure behind an internal/provisional gate.

What must happen before Codex writes scoring mathematics:

1. recover/re-open the canonical Buzzard page or a trustworthy archived exact copy;
2. transcribe the ordinary points table, winner bonuses, doubles and limit list into this ledger with section locators;
3. resolve the `no Chows` / `scoreless` treatment conflict;
4. pin the ordinary limit default (if the source specifies one rather than merely giving an example);
5. add source-linked golden fixtures to #217.

## L. Later full-playable gates

Even after #217, public `playable` status remains blocked on:

- Standing Hand declaration/lock UI + legality;
- Loose Tile/dead-wall table lifecycle;
- exact liability triggers and routing;
- procedural penalties/dead-hand consequences;
- progression edge cases;
- cross-profile regression against BMJA/T&M/OTB;
- real-player/source review.

## Product wording

Until all gates pass:

> **British/Western Classical — Buzzard 2000** — research/provisional profile.

Do not label it simply `Traditional Mahjong`, `Classical Mahjong` or `Western Mahjong`.
