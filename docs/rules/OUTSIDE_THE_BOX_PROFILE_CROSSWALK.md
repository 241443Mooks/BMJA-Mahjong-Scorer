# Outside the Box profile crosswalk

Implementation-facing evidence record for issue #88, Pass 88A. It records Rachel's supplied Outside the Box (OTB) guide, transcribed in the issue comments, rather than making OTB a general Western rule.

## 1. Profile status

| Field | Record |
|---|---|
| Profile | Outside the Box |
| Planned executable identity | `outside-the-box@0.1` |
| Authority | Outside the Box club guide supplied by Rachel (special-hand pages 12–14 and ordinary/round material transcribed in #88) |
| Evidence status | `verified-club` where the guide wording is clear |

OTB is a named club profile, not automatically BMJA and not automatically Thompson & Maloney (T&M) Western. Shared structures should reuse canonical implementation only where verified; values, exposure, procedure and membership remain OTB-local.

## 2. Complete special-hand inventory

The transcription has 35 table rows but **33 unique OTB hands**: Hachi Ban and All Pair Ruby Jade each appear twice as one membership with two illustrated forms/sections. `X` means concealed-only. Values are Mah Jong / fishing. “BMJA” and “Western” identify the existing implementation family, not a claim that OTB inherits every hand in that family.

| OTB hand | `*` | Structure | OTB | Exposure | Canonical pattern ID | Family / relationship | Status and implementation note |
|---|---:|---|---:|---|---|---|---|
| Buried Treasure | yes | concealed one-suit P/K, optional honours, pair; wall-only; no Kongs | 1000/400 | X | `buried-treasure` | BMJA / reuse-identical | verified-club; retain BMJA provenance/wall rule |
| Purity | yes | one suit, P/K and pair; no honours/Chows | unclear | unclear (`3x basic` row alignment) | none — BMJA `isPurityHand` ordinary predicate | BMJA / needs-clarification | do not infer value/exposure; OTB wording matches BMJA no-Chow form, not Western `purity-one-chow` |
| Imperial Jade | yes | Green Dragon plus green Bamboo 2,3,4,6,8 P/K and pair | 1000/400 | half | `imperial-jade` | BMJA / reuse-identical | verified-club; distinct from Western one-Chow, 2000/800 form |
| Heads & Tails | yes | 1/9 P/K and pair only; no honours | 1000/400 | half | `heads-and-tails` | BMJA / reuse-identical | verified-club; same pattern also Western at 1000/400, but OTB exposure is local/British |
| All Winds & Dragons | yes | honour P/K and pair only | 1000/400 | full | `all-winds-and-dragons` | BMJA / reuse-identical | verified-club; same Western pattern/value |
| Three Great Scholars | yes | three Dragon P/K plus same-suit remaining P/K or Chow and pair | 1000/400 | full | `three-great-scholars` | BMJA / reuse-pattern-override-binding | guide’s remaining-shape wording needs fixture audit before binding; OTB/BMJA 1000/400, Western 1500/600 |
| Four Blessings | yes | four Wind P/K plus pair | 1000/400 | full | `four-blessings` | BMJA / reuse-pattern-override-binding | verified-club structure/value/exposure; Western is 1500/600 |
| Fourfold Plenty | yes | four Kongs plus pair | 1000/400 | half | `fourfold-plenty` | BMJA / reuse-identical | verified-club |
| Knitting | yes | seven same-rank pairs across two suits | 500/200 | X | `knitting` | BMJA / reuse-identical | British binding follows guide; do not substitute Western `two-suit-knitting` without a predicate fixture audit |
| Triple Knitting | yes | four same-rank three-suit groups plus knitting pair | 500/200 | X | `triple-knitting` | BMJA / reuse-identical | British binding follows guide; Western uses separately audited `three-suit-knitting-with-pair` |
| All Pair Honours | yes | seven pairs of Winds, Dragons, 1s/9s | 500/200 | X | `all-pair-honours` | BMJA / reuse-pattern-override-binding | same canonical structure is Western 1000/400 |
| 13 Unique Wonders | yes | ESWN, GRW, all suited 1s/9s, any pair | 1000/400 | X | `thirteen-unique-wonders` | BMJA / reuse-pattern-override-binding | Western `Unique Wonder` is 2000/800 |
| Wriggling Snake | yes | ESWN + 2–9 run + same-suit 1 pair | 1000/400 | X | `wriggling-snake` | BMJA / reuse-identical | distinct from unstarred Wriggly Snake |
| All Pair | no | seven pairs, one suit; honours allowed | 500/200 | X | `seven-pairs-one-suit-with-honours` | western-tm / reuse-identical | verified-club |
| Heavenly Twins | no | seven pairs in one suit, no honours | 1000/400 | X | `seven-pairs-one-suit` | western-tm / reuse-identical | verified-club |
| All Pair Ruby Jade | no | GG, RR plus five Bamboo pairs | 1000/400 | X | `all-pair-ruby-jade` | OTB-local / needs-clarification | guide does not prove T&M’s red-or-green Bamboo rank restriction; needs club confirmation |
| Sparrow's Sanctuary | no | four Bamboo 1s plus pairs of Bamboo 2,3,4,6,8 | 1000/400 | X | `four-bamboo-one-and-five-green-bamboo-pairs` | western-tm / reuse-pattern-override-binding | OTB override: T&M 1500/600 |
| Hovering Angel | no | own-Wind P/K, Dragon pair, Chow in each suit | 1000/400 | X | `own-wind-meld-with-dragon-pair-and-three-suit-chows` | western-tm / reuse-identical | verified-club; uses player Wind |
| Big Robert | no | four-tile run in each suit, honour pair | 500/200; matching starts 1000/400 | X | `three-four-tile-suit-runs-with-honour-pair`; `three-matching-four-tile-suit-runs-with-honour-pair` | western-tm / reuse-identical | two mutually exclusive IDs truthfully express base and double form; no conditional-value engine |
| Wriggly Snake | no | ESWN + 1–9 run + any pair | 1000/400 | X | `wriggling-snake-any-pair` | western-tm / reuse-identical | structurally distinct from starred Wriggling Snake |
| Windfall | no | ESWN plus five same-suit pairs | 1000/400 | X | `windfall` | western-tm / reuse-identical | verified-club |
| Windy Ones | no | ESWN, Wind pair, 1 P/K in each suit | 1000/400 | half | `wind-pair-with-three-suit-rank-one-melds` | western-tm / reuse-identical | verified-club |
| Windy Nines | no | ESWN, Wind pair, 9 P/K in each suit | 1000/400 | half | `wind-pair-with-three-suit-rank-nine-melds` | western-tm / reuse-identical | verified-club |
| Windy Chow | no | ESWN, Wind pair, Chow in each suit | 500/200 | X | `wind-pair-with-three-suit-chows` | western-tm / reuse-identical | verified-club |
| Hachi Ban | no | three Wind **or** Dragon pairs + one-suit 1–8/2–9 run | 1000/400 | X | `hachi-ban` | western-tm / reuse-identical | one membership; detector covers both published forms |
| Dragonfly | no | GRW singles, P/K in each suit, suited pair | 1000/400 | half | `three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair` | western-tm / reuse-identical | verified-club |
| Dragon Breath | no | GRW with one Dragon pair plus five same-suit pairs | 1000/400 | X | `dragon-pair-with-five-suited-pairs` | western-tm / reuse-identical | binding calls it Dragon's Breath; same structure |
| Wriggly Dragon | no | GRW plus Dragon pair and one-suit 1–9 run | 1000/400 | X | `wriggly-dragon` | western-tm / reuse-identical | verified-club |
| Green Jade | no | Green Dragon Pung + three Bamboo P/K + Bamboo pair | 1000/400 | half | `green-dragon-pung-with-bamboo-melds` | western-tm / reuse-pattern-override-binding | OTB override: T&M exposed full |
| Red Coral | no | Red Dragon Pung + three Character P/K + Character pair | 1000/400 | half | `red-dragon-pung-with-character-melds` | western-tm / reuse-pattern-override-binding | OTB override: T&M exposed full; both are Pung-only Dragon |
| White Opal | no | White Dragon Pung + three Circle P/K + Circle pair | 1000/400 | half | `white-dragon-pung-with-circle-melds` | western-tm / reuse-pattern-override-binding | OTB override: T&M exposed full; both are Pung-only Dragon |
| Run, Pung & Pair | no | 1–9 run, same-suit P/K and pair | 1000/400 | X | `run-one-to-nine-with-same-suit-pung-and-pair` | western-tm / reuse-identical | physical four-copy limit means the same-suit group is a Pung, not a Kong |
| Grand Sequence | no | 1–9 run, **suited** pair, honour P/K | 1000/400 | X | `run-one-to-nine-with-honour-pung-and-any-pair` | OTB-local / structurally-distinct | Western detector permits an honour pair; OTB text requires suited pair. Likely new canonical restriction for 88B unless Rachel permits honour pairs. |

### Confirmed OTB binding overrides

| Pattern | OTB binding | Current T&M binding |
|---|---:|---:|
| `four-bamboo-one-and-five-green-bamboo-pairs` | 1000 / 400, concealed | 1500 / 600, concealed |
| `green-dragon-pung-with-bamboo-melds` | 1000 / 400; exposed half | 1000 / 400; exposed full |
| `red-dragon-pung-with-character-melds` | 1000 / 400; exposed half | 1000 / 400; exposed full |
| `white-dragon-pung-with-circle-melds` | 1000 / 400; exposed half | 1000 / 400; exposed full |

## 3. Ordinary scoring crosswalk

| Domain | OTB evidence | BMJA relationship |
|---|---|---|
| Winner bonuses | Mah Jong 20; wall 2; pair completion 2 minor/4 major; only possible tile 2 | verified-identical-to-BMJA |
| Pung/Kong and Dragon/Wind pair basics | 2/4, 4/8, 8/16, 16/32; qualifying pair 2 | verified-identical-to-BMJA |
| Flowers/Seasons | basic 4 each; own Flower/Season double; all Flowers or all Seasons double | verified-identical-to-BMJA |
| Ordinary winner doubles | no Chows; concealed wall win; clean; Kong/Flower box; last wall; final discard; robbing Kong | verified-identical-to-BMJA from listed domains |
| Limit events | Heavenly Hand, Earthly Hand, first wall draw | verified-identical-to-BMJA from listed events |
| Set doubles | own/prevailing Wind and any Dragon P/K each double; three concealed P/K double (exposed Kong counts concealed Pung) | verified-identical-to-BMJA |
| Little/Big Three Dragons and Four Joys | Little 1, Big 2 doubles in each family | needs-clarification: guide does not state whether component Dragon/Wind doubles stack with combination doubles |

## 4. Fixed special plus Flower/Season side score

OTB explicitly gives Buried Treasure 1,000 plus own Flower basic 4 and own-Flower double = **1,008**. A fixed special therefore does not necessarily suppress independent Flower/Season scoring. This is an OTB scoring-policy requirement for Pass 88C, not an implementation in 88A.

## 5. Settlement crosswalk

OTB says each loser pays the winner the winner's Mah Jong score; East pays/receives double; non-winners settle pairwise score differences; East doubles those loser-to-loser payments. This is **verified-identical-to-BMJA**: the current settlement engine performs exactly those pairwise transfers and doubles whenever East is either side. OTB cannon is a later override, not ordinary settlement.

## 6. Round mode / Goulash

| Current mode | Result | Next mode |
|---|---|---|
| Normal | winner | Normal |
| Normal | draw | Goulash |
| Goulash | winner | Normal |
| Goulash | draw | Goulash |

On draw: no score, no settlement and East does not move. In Goulash, four blanks may represent ordinary playing tiles but never Flowers/Seasons; no Chows; a Pung has at most one blank, a Kong at most two, and each needs at least two genuine identical tiles. These are OTB-only evidence. The later mechanism may be reusable, but it must not be attributed to T&M until #121 proves it. Wall construction, dealing, dice and Charleston execution are non-scorer gameplay mechanics and out of scope.

## 7. Penalties / liability

| Incident | Information needed | Consequence | Automation / later handling |
|---|---|---|---|
| Incorrect tile count | player and too-few/too-many state | cannot Mah Jong; too few may score, too many cannot | history not required; manual end-of-round incident |
| False discard name | false call, whether tile was claimed, whether call was Mah Jong | claimed: discarder pays 50; false Mah Jong: play stops, discarder pays winner all three loser shares, no other settlement | history required; manual incident |
| False Mah Jong | whether any hand was exposed | none if none exposed; otherwise declarer pays each player half-limit | manual incident |
| Wrong tile claim | correction before next draw; claimed set | timely correction no penalty; otherwise set remains and claimant cannot Mah Jong | gameplay history required; manual incident |
| Cannon | discard, visible dangerous structure, winner/special result, alleged cannoner | cannoner pays all three loser shares to winner; no other settlement | automatic proof needs history/visibility; manual incident |
| `No choice!` | cannoner was fishing and had no alternative discard, revealed hand | cancels cannon liability | automatic proof needs complete hand/history; manual incident with evidence |

## 8. Rachel / 10 October questions

1. Do Little/Big Dragon and Little/Big Wind doubles stack with component Dragon/Wind set doubles? This changes ordinary component arithmetic.
2. Does Grand Sequence’s “two suited tiles paired” exclude honour pairs as written? This decides whether a new restricted canonical pattern is needed.
3. In All Pair Ruby Jade, may the five Bamboo pairs be any ranks, or only the T&M red/green ranks? This decides detector reuse.
4. What are Purity’s exact winning, fishing and exposed fields? The photograph transcription cannot safely align them; this decides whether the British calculated binding is reusable.

## 9. Implementation readiness

| Pass | Ready evidence | Blocked / clarification |
|---|---|---|
| 88B | 29 exact memberships/canonical IDs; Big Robert two-ID composition; four stated T&M overrides; British value divergences | Purity, All Pair Ruby Jade and Grand Sequence; any BMJA-vs-OTB predicate fixture audit noted above |
| 88C | listed BMJA-identical ordinary domains; fixed-special Flower/Season side-score policy | Dragon/Wind combination stacking |
| 88D | Normal/Goulash transitions, draw effects and blank legality | none in scorer-relevant evidence |
| 88E | incident triggers, consequences, and manual-selection boundary | no unresolved rule required to model manual incidents; automatic cannon/no-choice remains intentionally out of scope |

Likely new canonical work in 88B: only a suited-pair-restricted Grand Sequence **if Rachel confirms the transcription's restriction**. No other new detector is evidenced by this pass.
