# Outside the Box validation readiness

## Certified profile

`outside-the-box@0.1` is the exact executable and persisted profile identity. It is a named club profile sourced from the supplied Outside the Box guide and its recorded clarifications; it is not a general claim about British or Western Mahjong.

## Runtime status

| Area | Status | Executable evidence |
|---|---|---|
| Special catalogue | CERTIFIED / EXECUTABLE | 33 fixed bindings, calculated Purity, and cross-profile values in `outside-the-box-readiness.test.ts` |
| Ordinary scoring | CERTIFIED / EXECUTABLE | component/combination doubles, cap, pair provenance, last-wall and fixed-special side score in `outside-the-box-scoring.test.ts` |
| Settlement | CERTIFIED / EXECUTABLE | common BMJA-compatible pairwise settlement and East cases in readiness and settlement tests |
| Goulash | CERTIFIED / EXECUTABLE | profile-bound mode transitions, physical blanks, no Chows, replay and undo in readiness and `outside-the-box-goulash.test.ts` |
| Incidents/liability | CERTIFIED / EXECUTABLE | Cannon, No choice!, false Mah Jong and false-name Mah Jong settlement in readiness and `outside-the-box-incidents.test.ts` |
| Persistence/replay/print | CERTIFIED / EXECUTABLE | exact profile reference, hand mode, blanks, incidents, settlement and human-facing print identity |
| Public rules chooser and profile marketing | OUT OF SCOPE | owned by #105/#91; no chooser is added here |

## Evidence-to-runtime boundary

| Source/evidence item | Runtime status | Boundary |
|---|---|---|
| Club guide special-hand table and 88A clarifications | CERTIFIED / EXECUTABLE | [profile crosswalk](OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md) maps names, structures, values and exposure |
| Ordinary points, doubles, settlement, Goulash and incidents | CERTIFIED / EXECUTABLE | [crosswalk](OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md) records the source-to-policy mapping |
| `only possible tile` +2 | DEFERRED — SOURCE/EVIDENCE GAP | current hand/evidence contract cannot prove the wait fact; it is not inferred |
| first-wall-draw limit event | DEFERRED — SOURCE/EVIDENCE GAP | current event evidence cannot prove the condition; it is not inferred |
| ordinary false-discard-name pickup 50 | DEFERRED — SOURCE/EVIDENCE GAP | amount is documented, but the repository evidence does not establish a recipient; UI remains intentionally withheld |
| public use of the club name | DEFERRED — SOURCE/EVIDENCE GAP | confirmation is needed before public named-profile/marketing launch if permission is not recorded; this does not block the internal executable profile or 10 October field test |

## Profile isolation and provenance

The readiness suite proves that canonical detection is shared only where structural evidence permits it. Three Great Scholars has profile-local 1000/400 (BMJA and OTB) versus 1500/600 (Western) interpretation; Sparrow's Sanctuary and exposed Green Jade lock additional OTB/T&M differences. OTB Grand Sequence retains its suited-pair restriction without broadening Western. BMJA and Western cannot activate Goulash or accept OTB incidents. Saved game and printed record labels retain a human-facing rules name plus exact persisted version.

## Recommended golden inputs for #89

| Fixture | Profiles | Expected key outcome | Evidence locator |
|---|---|---|---|
| `three-great-scholars-profile-values` | BMJA, Western, OTB | same pattern: 1000/400, 1500/600, 1000/400 | Crosswalk special catalogue: Three Great Scholars |
| `sparrows-sanctuary-profile-values` | Western, OTB | 1500/600 vs 1000/400 | Crosswalk confirmed binding overrides |
| `green-jade-exposure-override` | Western, OTB | exposed 1000 vs 500, shared detector | Crosswalk confirmed binding overrides |
| `grand-sequence-structural-boundary` | Western, OTB | Western any-pair remains distinct from OTB suited-pair | Crosswalk special catalogue: Grand Sequence |
| `buried-treasure-flower-side-score` | BMJA, Western, OTB | OTB 1008; other profiles retain 1000 | Crosswalk fixed special plus Flower/Season |
| `ordinary-settlement-east-cases` | BMJA, OTB | identical transactions/changes for winner and loser East cases | Crosswalk settlement crosswalk |
| `goulash-draw-draw-win-lifecycle` | OTB | Normal → Goulash → Goulash → Normal, replay/undo stable | Crosswalk round mode / Goulash |
| `cannon-no-choice-and-false-name` | OTB | liability replacement or restored ordinary settlement | Crosswalk 88E executable incident policy |
| `otb-persistence-profile-version` | OTB | profile/version, modes, blanks, incidents and settlement recover exactly | Crosswalk implementation readiness |

## #88 close-readiness conclusion

The executable `outside-the-box@0.1` profile is ready to close #88 once this certification PR merges. The listed evidence gaps are explicit, unguessed follow-ups rather than implementation defects. They do not block beginning #105 front-end work: #105's own activation gate treats #89 and the 10 October session as validation/refinement, not a prerequisite for usable profiles.

## Acceptance audit

| Criterion | Evidence | Status |
|---|---|---|
| Versioned OTB profile, catalogue and profile isolation | readiness suite; crosswalk | PASS |
| Ordinary scoring and fixed-special side score | readiness suite; OTB scoring suite | PASS |
| BMJA-compatible ordinary settlement | readiness suite; settlement suite | PASS |
| Goulash lifecycle, blanks, persistence/replay | readiness suite; Goulash suite | PASS |
| Incident/liability settlement and recovery | readiness suite; incidents suite | PASS |
| Saved and printed rules identity | persistence tests; `gameRecordRulesLabel` test | PASS |
| Unprovable wait/event/50-recipient rules | evidence table above | DEFERRED — SOURCE/EVIDENCE GAP |
| Public chooser, redesign and rules hub | #105/#91 | OUT OF SCOPE |
