# EMA Riichi 2025 — implementation matrix

Status: **research / architecture preparation**

Profile target: **European Mahjong Association (EMA), _Riichi: Rules for Japanese Mahjong_, 2025 edition**

Primary source: http://mahjong-europe.org/portal/images/docs/Riichi-rules-2025-EN.pdf

This document is not a replacement for the rulebook. It is an implementation-facing map of the rule domains that must be understood, sourced and tested before a production Riichi profile is declared complete.

Evidence status vocabulary follows the project provenance model. All rows below are `verified-source` at the rulebook-summary level but still require code-level source locators/tests before a final `1.0` profile.

## Domain matrix

| Domain | EMA 2025 rule / implementation fact | Source locator | Engineering consequence |
|---|---|---|---|
| Profile identity | Riichi has formal-rule variants; EMA 2025 is a named European rules edition | Preface pp. 2–3 | Do not expose a generic unversioned `Riichi` profile |
| Tile set | 136 basic tiles; Flowers/Seasons/Jokers unused | §1, p. 6 | Tile-set profile differs from 144-tile BMJA/Western assumptions |
| Red fives | Japanese sets may include them; EMA rules do not use them | §1.3, p. 6 | No aka-dora support in initial EMA profile |
| Seat winds | Four players; East/South/West/North seats | §2.1, p. 7 | Reuse seat-wind primitive, not BMJA progression semantics |
| Round wind | East round then South round | §2.2, §3.1, pp. 7,10 | Dedicated Riichi progression strategy |
| Dead wall | 14 tiles; replacement tiles + dora/kan-dora/ura-dora indicator positions | §2.6, p. 8 | New dead-wall/indicator state if full-table model tracks it |
| Dora | Indicator points to next suit/honour tile in defined cycle | §2.7, p. 8 | Deterministic indicator→dora resolver |
| Winning shape | Four sets + pair, plus Seven Pairs and Thirteen Orphans | §3.2, p. 10 | Reuse structural primitives only where exact semantics match |
| Win legality | Complete hand must have at least one yaku | §3.2, p. 10 | Yaku eligibility is a validation gate before value calculation |
| Claim priority | Win claims outrank set claims; multiple winners may claim same discard | §3.3.1, p. 11 | Event/order model must support multi-ron |
| Open hand | `chii` / `pon` / claimed `kan` open the hand | §3.3.3, p. 12 | Open/concealed status feeds yaku and fu |
| Kan types | Claimed, extended and concealed quads differ; kan reveals indicator and draws replacement | §3.3.4, p. 12 | Kan lifecycle cannot be represented as a static four-tile group alone |
| Fourth/fifth kan | Fourth kan allowed; no fifth kan | §3.3.5, p. 12 | Hand/event legality rule |
| Liability | Feeder of final called dragon/wind set can become liable for Daisangen/Daisuushii payment | §3.3.7, p. 13 | Separate hand value from payment routing |
| Tenpai | Hand has at least one completing tile; dead hand is noten | §3.3.8, p. 13 | Dedicated Riichi waiting-state model; not British fishing |
| Furiten | Prevents `ron`; self-discard, temporary pass and riichi-pass cases differ | §3.3.9, pp. 13–14 | Derived/eventful state, not a simple boolean entered at score time |
| Riichi | Concealed tenpai + call + rotated discard + 1,000-point bet | §3.3.10, p. 14 | New declaration/deposit state |
| Post-riichi | Hand-change restrictions; constrained concealed kan; passed win can lock furiten | §3.3.10, pp. 14–15 | Engine needs event history/context, not only final tiles |
| Ura dora | Revealed for winners who declared riichi | §3.3.10, p. 15 | Conditional bonus evidence |
| Tsumo | Self-draw win; furiten does not prevent tsumo | §3.3.11, p. 15 | Separate win source and payment path |
| Ron | Discard win; prohibited by furiten | §3.3.12, p. 15 | Separate win source and payment path |
| Robbing a quad | Extended kan may be robbed; concealed kan only for Thirteen Orphans | §3.3.13, p. 15 | Win-event + exception logic |
| Exhaustive draw | Tenpai/noten declared; 3,000 points redistributed | §3.4.2, p. 16 | Dedicated draw-settlement path |
| Riichi bets after draw | Deposits remain for future winner | §3.4.2, p. 16 | Pot state persists across hands |
| Highest scoring interpretation | If multiple completions/interpretations exist, choose maximum score | §3.4.3, p. 16; §4.1.1 p. 21 | Scorer must search valid interpretations, not stop at first match |
| Multiple winners | Discarder settles with each winner | §3.4.3, p. 16; §4.1, p. 20 | Settlement supports >1 winner per hand |
| Counters | Each counter adds 300 on ron or 100 from each payer on tsumo | §3.4.4, p. 17 | Counter state separated from base hand value |
| Dealer repeat | East repeats after East win or East tenpai at exhaustive draw | §3.4.5, p. 17 | Riichi-specific progression strategy |
| Dealer rotation | Otherwise South becomes East, etc. | §3.4.5, p. 17 | Seat wind mutation after each hand |
| Chombo | Re-deal; no dealer rotation; current-hand riichi bets returned | §3.4.6, p. 17 | Error/procedure state distinct from normal draw/win |
| Chombo payment | Tournament: -20,000 after game/uma. Social: reverse mangan payment | §3.4.6, pp. 17–18 | Tournament overlay must not leak into social default |
| Game length | Full game ends after East and South rounds when starting East cycles back | §3.5, p. 18 | Explicit game-end condition |
| Negative score | No bankruptcy rule | §3.7 / §4.1.4, pp. 18,22 | Do not end game automatically below zero |
| Final score | Subtract 30,000 start, then apply uma and penalties | §3.7, p. 18 | Dedicated finalisation step |
| Uma | +15k, +5k, -5k, -15k; ties split relevant positions | §3.7.1, p. 19 | Profile-specific end-game adjustment |
| Scoring responsibility | Winning hand scored to maximum; players must correct errors | §4.1, p. 20 | Explanation/audit UI strongly aligned with source practice |
| Han | Add yaku han plus dora/kan-dora/ura-dora | §4.1, p. 20 | Dedicated han evaluator |
| Fu | Base + win condition + sets + value pair + wait; round to next 10 | §4.1.1, pp. 20–21 | Dedicated fu engine |
| Seven Pairs fu | Exactly 25, no further fu | §4.1.1, p. 20 | Special scoring path |
| Open pinfu fu | Exactly-20 open hand receives +2 | §4.1.1, p. 21 | Fu edge case |
| Double-wind pair | Pair of both seat and round wind = 2 fu | §4.1.1, p. 21 | EMA-2025-specific profile choice |
| Limit tiers | 5 mangan; 6–7 haneman; 8–10 baiman; 11+ sanbaiman; yakuman | §4.1.2, p. 22 | Separate limit-tier evaluator |
| Kiriage mangan | 4 han 30+ fu and 3 han 60+ fu score mangan | §4.1.3 p. 22; 2025 revision notes | Must not assume another platform's threshold rules |
| Ron maths | Non-East winner = 4× base; East winner = 6× base; round payment to 100 | §4.1.2, p. 22 | Deterministic payment formula |
| Tsumo maths | Opponents pay base; East portion doubled | §4.1.2, p. 22 | Payer-specific transaction output |
| Yaku interaction | Yaku cumulative unless specified; some require closed; some lose han when open | §4.2, pp. 23–26 | Per-yaku eligibility + open-value metadata + exclusions |
| Yakuman | EMA 2025 yakuman are not cumulative | §4.2, p. 23 | Profile-specific cap/interaction rule |
| Official examples | Ten worked scoring examples cover common/open/closed/limit/yakuman cases | §4.3, pp. 26–28 | Mandatory golden fixture corpus |
| Etiquette | Physical-table handling and display conventions are explicitly defined | Ch. 5, pp. 29–31 | Useful Table Companion help/reference; not all belongs in scorer logic |
| Errors/penalties | Dead hand, chombo, point penalties and many procedural errors are specified | Ch. 6, pp. 32–38 | Separate procedure/error layer; do not entangle basic scorer initially |
| Tournament overlay | Time limits, phone rules, score sheet procedures etc. | Ch. 7, pp. 39–40 | Optional tournament mode, not core social profile by default |
| Yaku quick reference | Compact official list | Annex p. 42 | Testing/index aid; detailed sections remain authoritative |
| Scoring table | East and Non-East ron/tsumo table | Annex p. 43 | Golden validation target for formula output |

## Yaku implementation inventory

The detailed source definitions in §§4.2.1–4.2.6 are authoritative. This inventory is only a checklist.

### One han

- Riichi
- Ippatsu
- Fully Concealed Hand / Menzen Tsumo
- Pinfu
- Pure Double Sequence / Iipeikō
- All Simples / Tan'yao
- Dragon Triplet / Yakuhai
- Seat Wind Triplet / Yakuhai
- Round Wind Triplet / Yakuhai
- After a Quad / Rinshan Kaihō
- Robbing a Quad / Chankan
- Under the Sea / Haitei
- Under the River / Hōtei

### Two han base value

Some lose one han when open where specified by the source.

- Double Riichi
- Seven Pairs
- Mixed Triple Sequence / Sanshoku Dōjun
- Pure Straight / Ittsū
- Half Outside Hand / Chanta
- Triple Triplet / Sanshoku Dōkō
- Three Concealed Triplets / San'ankō
- Three Quads / Sankantsu
- All Triplets / Toitoi
- Little Three Dragons / Shōsangen
- All Terminals and Honours / Honrōtō

### Three han base value

- Twice Pure Double Sequence / Ryanpeikō
- Half Flush / Hon'itsu
- Full Outside Hand / Junchan

### Five han

- Blessing of Man / Renhō

### Six han base value

- Full Flush / Chin'itsu

### Yakuman

- Thirteen Orphans / Kokushi Musō
- Nine Gates / Chūren Pōtō
- Blessing of Heaven / Tenhō
- Blessing of Earth / Chihō
- Four Concealed Triplets / Sūankō
- Four Quads / Sūkantsu
- All Green / Ryūiisō
- All Terminals / Chinrōtō
- All Honours / Tsūiisō
- Big Three Dragons / Daisangen
- Little Four Winds / Shōsūshii
- Big Four Winds / Daisūshii

Do not infer exclusions/stacking/open values from this checklist; bind them from the detailed source text.

## Official golden-fixture programme

The ten scoring examples on pp. 26–28 should become source-linked fixtures before release.

At minimum verify each fixture against:

- winning tile/source;
- open/concealed state;
- seat/round wind where relevant;
- yaku list;
- yaku han subtotal;
- dora subtotal;
- fu components + rounding;
- resulting tier/base value;
- East/Non-East payment route;
- final payer amounts.

Also generate exhaustive focused fixtures for:

- every individual yaku;
- each yaku with open reduction where applicable;
- stated non-combinations (e.g. Double Riichi vs Riichi; Rinshan vs Haitei);
- each fu category;
- Seven Pairs fixed 25 fu;
- Pinfu/open-pinfu edge cases;
- multiple valid winning-tile interpretations where maximum score must be selected;
- dora cycling for suits, Winds and Dragons;
- kan-dora and ura-dora eligibility;
- furiten cases;
- multiple ron;
- Daisangen/Daisuushii liability;
- exhaustive-draw distributions (0/1/2/3/4 tenpai);
- dealer repeat/rotation;
- riichi-stick persistence/allocation;
- counter/honba settlement;
- negative score continuing play;
- final uma and tie handling;
- EMA 2025 kiriage mangan and double-wind-pair rules.

## Known non-goals for the first profile

- red-five/aka-dora variants
- generic Japanese professional-league profiles
- Tenhou/Mahjong Soul house settings
- strategy/advice/discard recommendations
- tournament administration beyond rules needed for ordinary full-game correctness

## Open architecture questions to resolve before coding broadly

1. Which existing hand-evidence fields can be reused without changing semantics?
2. Does the current hand model retain enough discard/event history to derive furiten and ippatsu correctly?
3. Where should dead-wall/dora-indicator state live: table state, hand evidence, or a Riichi strategy-owned snapshot?
4. How should multiple valid hand decompositions be enumerated and scored to guarantee maximum value?
5. Should yaku be represented as profile bindings over reusable predicates or as Riichi-owned evaluators where event/context is integral?
6. Can the current settlement transaction model express ron, split tsumo, counters, multiple winners, riichi-pot allocation and liability without new transaction types?
7. How should tournament-only penalties be separated from social-play defaults?
8. What immutable profile/version snapshot is persisted with saved Riichi games?
9. Which parts of the rules should the Table Companion actively track versus explain/reference only?

Resolve these from actual code + source evidence, not abstract framework enthusiasm.

## Promotion gate

Do not create a final `riichi-ema-2025@1.0` profile until:

- every executable domain in this matrix has a source locator/status;
- all yaku and fu/value/payment rules are deterministic and tested;
- official scoring examples pass;
- game progression and settlement pass full-game fixtures;
- EMA-specific choices are isolated from other Riichi variants;
- BMJA/Western/club regression remains unchanged;
- experienced Riichi players have reviewed table flow and terminology.
