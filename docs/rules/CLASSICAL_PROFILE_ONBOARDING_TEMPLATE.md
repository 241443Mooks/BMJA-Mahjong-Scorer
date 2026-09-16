# Classical / Western club-profile onboarding template

Status: **repeatable evidence/configuration worksheet**  
Config contract: `CLASSICAL_PROFILE_CONFIG_V1.md`  
Comparison model: `CLASSICAL_PROFILE_CONFIG_MATRIX.md`

## Purpose

Use this template whenever a club, family, tutor or historical source needs a new **Classical/Western-adjacent** profile.

The aim is to answer:

> **Can this profile be represented entirely by existing selectors, values, policy choices and special-hand bindings?**

If yes, onboarding should be evidence + configuration + fixtures.

If no, record the smallest genuinely new reusable capability needed. Do not create a profile-specific scorer as the default response.

This template is not intended for Riichi, MCR, American/NMJL or another scoring family with a materially different grammar.

---

## 1. Profile identity

```text
Profile name:
Working profile ID:
Profile version:
Kind: published / club / user-template
Closest existing baseline:
Source owner / authority:
Source title:
Source edition/date:
Source URL/file/reference:
Evidence status: verified / verified-club / provisional
Researcher/date:
```

### Scope statement

Describe whose rules these are. Be precise.

Good:

> Outside the Box club rules, September 2026 guide.

Avoid:

> Western Mahjong rules.

unless the evidence genuinely supports that broader claim.

---

## 2. Baseline choice

Choose the nearest supported Classical/Western profile for comparison only.

```text
Baseline profile ID/version:
Why this is the closest baseline:
```

Important:

- baseline selection is an onboarding convenience, not a historical derivation claim;
- a published profile must ultimately resolve to explicit deterministic rules;
- a user variant may remain editable as exact base + overrides, but started games must preserve reproducible resolved rules state.

---

## 3. Quick difference inventory

Before transcribing every rule, capture the club/source's stated differences in ordinary language.

```text
[ ] ordinary scoring differs
[ ] Chow limit differs
[ ] Flowers/Seasons differ
[ ] ordinary doubles differ
[ ] winning-event bonuses differ
[ ] pure-suit treatment differs
[ ] special-hand catalogue differs
[ ] special-hand values differ
[ ] fishing/ready values differ
[ ] exposure rules differ
[ ] limit differs
[ ] settlement differs
[ ] East multiplier differs
[ ] draw/Goulash behaviour differs
[ ] liability/cannon differs
[ ] penalties/incidents differ
[ ] progression differs
[ ] other
```

Free-text summary:

```text

```

---

## 4. Validation/settings crosswalk

Complete only what the source establishes. Unknown is a valid answer.

| Setting | Baseline | New profile | Evidence locator/status | Existing config capability? |
|---|---|---|---|---|
| normal maximum Chows | | | | `validation.normal.max-chows` / gap |
| Flowers/Seasons used | | | | existing / gap |
| ordinary limit | | | | numeric limit / gap |
| limit user/table adjustable | | | | boolean / gap |
| after-draw mode | | | | normal / BMJA Goulash / OTB Goulash / gap |
| other validation rule | | | | capability ID / gap |

Do not infer a missing value from the baseline simply because play looks similar. If runtime compatibility is intentionally provisional, mark it as such.

---

## 5. Ordinary intrinsic points

First ask whether the profile uses the existing Classical point table.

```text
Uses `classical-standard-points-v1`: yes / no / unknown
```

If `yes`, do not duplicate the table.

If `no`, record only evidenced differences:

| Intrinsic rule | Existing value | Profile value | Source locator | Reusable override or new capability? |
|---|---:|---:|---|---|
| exposed minor Pung | 2 | | | |
| concealed minor Pung | 4 | | | |
| exposed major/honour Pung | 4 | | | |
| concealed major/honour Pung | 8 | | | |
| exposed minor Kong | 8 | | | |
| concealed minor Kong | 16 | | | |
| exposed major/honour Kong | 16 | | | |
| concealed major/honour Kong | 32 | | | |
| Dragon pair | 2 | | | |
| own Wind pair | 2 | | | |
| prevailing Wind pair | 2 | | | |
| Flower/Season points | 4 | | | |

Do not expose all of these as user controls merely because the internal model can support them.

---

## 6. Point-rule selectors

Use stable capability IDs where they exist.

| Rule ID | Enabled? | Amount | Evidence needed | Source locator/status | Gap? |
|---|---:|---:|---|---|---|
| `score.point.mahjong` | | | tiles/result | | |
| `score.point.self-draw-live-wall` | | | winning method | | |
| `score.point.winning-pair` | | | winning-tile provenance | | |
| `score.point.standing-hand` | | | manual Standing Hand evidence | | |
| `score.point.only-possible-tile` | | | manual/inferred wait evidence | | |
| `score.point.no-chows-bonus` | | | hand structure | | |
| `score.point.scoreless-hand` | | | hand structure/score evidence | | |
| `score.point.last-wall` | | | winning method/event | | |
| `score.point.loose-tile` | | | winning method/event | | |
| other | | | | | **engineering candidate** |

A missing rule ID is not permission to encode a one-off callback. Record it as a capability gap first.

---

## 7. Double-rule selectors

| Rule ID | Enabled? | Doubles | Option if any | Source locator/status | Gap? |
|---|---:|---:|---|---|---|
| `score.double.own-wind-set` | | | | | |
| `score.double.prevailing-wind-set` | | | | | |
| `score.double.dragon-set` | | | | | |
| `score.double.own-flower` | | | | | |
| `score.double.own-season` | | | | | |
| `score.double.complete-flower-set` | | | inclusive/additive | | |
| `score.double.complete-season-set` | | | inclusive/additive | | |
| `score.double.no-chows` | | | | | |
| `score.double.mixed-one-suit` | | | | | |
| `score.double.all-majors` | | | | | |
| `score.double.concealed-hand` | | | any/self-drawn/disabled | | |
| `score.double.pure-suit` | | | P/K only / one Chow / any standard meld | | |
| `score.double.all-chows-nonscoring-pair` | | | | | |
| `score.double.three-concealed-pung-kong` | | | | | |
| `score.double.little-three-dragons` | | | | | |
| `score.double.big-three-dragons` | | | | | |
| `score.double.little-four-winds` | | | | | |
| `score.double.big-four-winds` | | | | | |
| `score.double.rob-kong` | | | | | |
| `score.double.last-wall` | | | | | |
| `score.double.loose-tile` | | | | | |
| `score.double.final-discard` | | | | | |
| `score.double.original-call` | | | | | |
| other | | | | | **engineering candidate** |

---

## 8. Special-hand catalogue patch

For each special hand used by the profile, first search the canonical detector registry.

### Existing detector

Record a binding/override:

| Pattern ID | Profile name | Score model/value | Fishing | Exposure | Win-method restriction | Source locator/status |
|---|---|---|---|---|---|---|
| | | fixed / configured-limit / calculated | | | | |

### Removed baseline hand

```text
specialHands.remove:
- pattern-id
```

### Missing detector

Record separately:

```text
Requested hand name:
Source structure summary:
Nearest known pattern:
Why existing detector is insufficient:
Source locator:
```

Outcome:

> **New canonical detector required — engineering.**

Once added, this and future profiles should bind it as data.

---

## 9. Settlement, incidents and progression

### Ordinary settlement

```text
Ordinary settlement policy:
[ ] classical-pairwise
[ ] other — engineering review required

East multiplier:
```

### Incident/liability policies

Select only known implemented capabilities. Examples may include:

```text
liability.otb-cannon
liability.buzzard-dangerous-discard
false-mahjong.half-limit-each
false-mahjong.double-limit-each
incorrect-hand.otb
incorrect-hand.buzzard
```

For any new incident:

```text
Trigger/evidence supplied by table:
Who pays whom:
Amount/multiplier:
Does ordinary settlement still occur:
Source locator:
Nearest existing policy:
```

If the payment topology is genuinely new, record one reusable engineering capability rather than embedding arithmetic in profile JSON.

### Progression

```text
Progression policy:
[ ] classical-winds
[ ] other — engineering review required
```

The companion needs resolved round outcome and table state, not a simulation of physical play.

---

## 10. Evidence-input impact

List the questions this profile requires the scorer/table UI to ask beyond tiles and Winds.

| Evidence field | Why needed | Automatic or manual? | Existing UI/data field? | Engineering gap? |
|---|---|---|---|---|
| winning method | | | | |
| original call | | | | |
| Standing Hand | | | | |
| only possible winning tile | | | | |
| winning tile provenance | | | | |
| East first-discard event | | | | |
| consecutive East wins | | | | |
| liability + liable player | | | | |
| other | | | | |

A selected rule should declare its evidence dependency so future UI can reveal the question only when required.

---

## 11. Capability-gap register

Every item here is a candidate engineering task. Keep it small and reusable.

| Gap | Why existing capability cannot express it | Proposed reusable capability | Profiles likely to reuse it | Blocking? |
|---|---|---|---|---|
| | | | | |

Before approving new code, ask:

1. Is this actually a new rule, or merely a different value/selector?
2. Does an existing canonical detector already recognise the structure?
3. Can a finite enum represent the variation safely?
4. Can an existing settlement/mode policy represent it?
5. If code is necessary, can the capability be named without the club/profile name?

If the answer to 5 is no, reconsider whether the abstraction is right.

---

## 12. Golden fixtures for this profile

Create fixtures for **differences from the baseline**, not a second copy of every shared test.

| Fixture ID | Difference being proven | Same hand under baseline expected | New profile expected | Source locator |
|---|---|---|---|---|
| | | | | |

Minimum profile gates:

```text
[ ] every changed toggle/value has a fixture
[ ] every changed special-hand binding has a fixture or catalogue binding test
[ ] every new evidence field has a true/false or present/absent fixture
[ ] every new incident policy has settlement fixtures
[ ] base profile remains unchanged
[ ] unrelated published profiles remain unchanged
[ ] serialize/reconstruct preserves exact profile/version/config
```

---

## 13. Onboarding result

At the end, classify the profile:

```text
Configuration-only:
  [ ] yes
  [ ] no

Number of existing settings changed:
Number of special-hand bindings changed/added:
Number of new canonical detectors required:
Number of new reusable rule evaluators required:
Number of new settlement/mode policies required:
```

### Readiness statement

Choose one:

> **READY — configuration + fixtures only.**

> **READY AFTER CAPABILITY WORK — requires the listed reusable engine additions, then becomes configuration.**

> **NOT A CLASSICAL/WESTERN CONFIG PROFILE — use another scoring-engine family.**

---

## 14. Publication/versioning

Before a published/club profile is exposed:

```text
[ ] exact source/profile name retained
[ ] source/provenance status recorded
[ ] no unknowns silently inherited as verified
[ ] stable profile ID/version assigned
[ ] resolved config validates
[ ] cross-profile regressions pass
[ ] profile-specific reference/help terminology reviewed
[ ] saved/replayed game retains exact rules identity/config needed for reproducibility
```

For a user-created house-rule variant, source authority is `custom-user`; the user may optionally add a note about the origin of the rule.

---

## Product principle

> **The cost of supporting the next club should be proportional to how many genuinely new Mahjong ideas it introduces, not to the fact that it is another club.**
