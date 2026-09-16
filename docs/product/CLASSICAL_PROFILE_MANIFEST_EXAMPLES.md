# Classical / Western profile manifest examples

Status: **design fixtures, not production code**  
Companion spec: `CLASSICAL_PROFILE_CONFIG_V1.md`  
Evidence: `../rules/CLASSICAL_PROFILE_CONFIG_MATRIX.md`

## Why these examples exist

A configuration design is not proven merely because its interface looks tidy.

This file attempts to express four real profiles through the proposed v1 vocabulary:

- BMJA;
- provisional Thompson & Maloney Western;
- Outside the Box;
- Buzzard 2000.

If a real profile cannot be represented without profile-name conditionals, the configuration model needs work before Codex implements it.

The examples are intentionally JSON-like rather than executable TypeScript.

---

## 1. Shared internal Classical preset

All four current profiles use or provisionally reuse the same ordinary intrinsic point table.

```json
{
  "presetId": "classical-standard-points-v1",
  "pung": {
    "minor": { "exposed": 2, "concealed": 4 },
    "major": { "exposed": 4, "concealed": 8 }
  },
  "kong": {
    "minor": { "exposed": 8, "concealed": 16 },
    "major": { "exposed": 16, "concealed": 32 }
  },
  "pairs": {
    "dragon": 2,
    "ownWind": 2,
    "prevailingWind": 2
  },
  "bonusTilePoints": 4
}
```

This is an engineering reuse preset, not a historical claim that one profile derives from another.

---

## 2. BMJA resolved profile sketch

This example records the **resolved** profile rather than a patch against another profile.

```json
{
  "schemaVersion": 1,
  "profile": {
    "id": "bmja",
    "version": "1.0",
    "family": "classical-western",
    "kind": "published"
  },
  "provenance": {
    "sourceId": "bmja-approved-site",
    "evidenceStatus": "verified"
  },
  "defaultLimit": { "value": 1000, "userAdjustable": true },
  "intrinsicPoints": { "preset": "classical-standard-points-v1" },
  "validation": {
    "normal": { "maxChows": 1 }
  },
  "rules": {
    "score.point.mahjong": { "enabled": true, "amount": 20 },
    "score.point.self-draw-live-wall": { "enabled": true, "amount": 2 },

    "score.double.own-wind-set": { "enabled": true, "amount": 1 },
    "score.double.prevailing-wind-set": { "enabled": true, "amount": 1 },
    "score.double.dragon-set": { "enabled": true, "amount": 1 },
    "score.double.own-flower": { "enabled": true, "amount": 1 },
    "score.double.own-season": { "enabled": true, "amount": 1 },
    "score.double.complete-flower-set": {
      "enabled": true,
      "amount": 2,
      "option": "inclusive-of-own"
    },
    "score.double.complete-season-set": {
      "enabled": true,
      "amount": 2,
      "option": "inclusive-of-own"
    },

    "score.double.no-chows": { "enabled": true, "amount": 1 },
    "score.double.mixed-one-suit": { "enabled": true, "amount": 1 },
    "score.double.all-majors": { "enabled": true, "amount": 1 },
    "score.double.concealed-hand": {
      "enabled": true,
      "amount": 1,
      "option": "any-concealed-winner"
    },
    "score.double.pure-suit": {
      "enabled": true,
      "amount": 3,
      "option": "pung-kong-only"
    },

    "score.double.rob-kong": { "enabled": true, "amount": 1 },
    "score.double.last-wall": { "enabled": true, "amount": 1 },
    "score.double.loose-tile": { "enabled": true, "amount": 1 },
    "score.double.final-discard": { "enabled": true, "amount": 1 },
    "score.double.original-call": { "enabled": true, "amount": 1 }
  },
  "specialHands": {
    "catalogue": "bmja-current"
  },
  "settlement": {
    "basePolicy": "classical-pairwise",
    "eastMultiplier": 2,
    "incidentPolicies": []
  },
  "progression": { "policy": "classical-winds" },
  "modes": { "afterDraw": "bmja-goulash" }
}
```

Implementation note: some BMJA special/event details remain outside this abbreviated sketch. The purpose here is to prove the ordinary selector shape, not replace the existing authoritative catalogue.

---

## 3. Thompson & Maloney Western resolved profile sketch

The ordinary rules remain `provisional-compatible` because the intended main T&M rules source has not yet been fully verified.

The manifest must preserve that evidence state rather than silently upgrading current shared runtime behaviour to verified.

```json
{
  "schemaVersion": 1,
  "profile": {
    "id": "western-tm",
    "version": "0.1",
    "family": "classical-western",
    "kind": "published"
  },
  "provenance": {
    "sourceId": "tm-game-illustrated",
    "evidenceStatus": "provisional-compatible"
  },
  "defaultLimit": { "value": 1000, "userAdjustable": true },
  "intrinsicPoints": { "preset": "classical-standard-points-v1" },
  "validation": {
    "normal": {
      "maxChows": 1,
      "evidenceStatus": "provisional-compatible"
    }
  },
  "rules": {
    "ordinaryScoringPreset": {
      "preset": "current-bmja-compatible-runtime",
      "evidenceStatus": "provisional-compatible"
    }
  },
  "specialHands": {
    "catalogue": "western-tm-companion-current"
  },
  "settlement": {
    "basePolicy": "classical-pairwise",
    "eastMultiplier": 2,
    "evidenceStatus": "provisional-compatible",
    "incidentPolicies": []
  },
  "progression": {
    "policy": "classical-winds",
    "evidenceStatus": "provisional-compatible"
  },
  "modes": { "afterDraw": "normal" }
}
```

### Why this example is intentionally less explicit

The source evidence is incomplete. We should not fabricate a long list of “verified T&M” booleans from today's shared runtime.

During eventual migration, the implementation may materialise each current provisional setting explicitly, but provenance must continue to mark those values provisional until #121/the primary-source work resolves them.

---

## 4. Outside the Box resolved profile sketch

OTB is a strong test because much of it is shared Classical scoring plus selected Western/BMJA special hands and a handful of club-local rules.

```json
{
  "schemaVersion": 1,
  "profile": {
    "id": "outside-the-box",
    "version": "0.1",
    "family": "classical-western",
    "kind": "published"
  },
  "provenance": {
    "sourceId": "otb-guide-2026-09",
    "evidenceStatus": "verified-club"
  },
  "defaultLimit": { "value": 1000, "userAdjustable": true },
  "intrinsicPoints": { "preset": "classical-standard-points-v1" },
  "validation": {
    "normal": {
      "maxChows": 1,
      "evidenceStatus": "runtime-current-source-question"
    }
  },
  "rules": {
    "score.point.mahjong": { "enabled": true, "amount": 20 },
    "score.point.self-draw-live-wall": { "enabled": true, "amount": 2 },
    "score.point.winning-pair": {
      "enabled": true,
      "option": "minor-2-major-4"
    },

    "score.double.own-wind-set": { "enabled": true, "amount": 1 },
    "score.double.prevailing-wind-set": { "enabled": true, "amount": 1 },
    "score.double.dragon-set": { "enabled": true, "amount": 1 },
    "score.double.own-flower": { "enabled": true, "amount": 1 },
    "score.double.own-season": { "enabled": true, "amount": 1 },
    "score.double.complete-flower-set": {
      "enabled": true,
      "amount": 2,
      "option": "inclusive-of-own"
    },
    "score.double.complete-season-set": {
      "enabled": true,
      "amount": 2,
      "option": "inclusive-of-own"
    },

    "score.double.no-chows": { "enabled": true, "amount": 1 },
    "score.double.mixed-one-suit": { "enabled": true, "amount": 1 },
    "score.double.all-majors": { "enabled": true, "amount": 1 },
    "score.double.concealed-hand": {
      "enabled": true,
      "amount": 1,
      "option": "self-drawn-only"
    },
    "score.double.pure-suit": {
      "enabled": true,
      "amount": 3,
      "option": "pung-kong-only"
    },

    "score.double.three-concealed-pung-kong": { "enabled": true, "amount": 1 },
    "score.double.little-three-dragons": { "enabled": true, "amount": 1 },
    "score.double.big-three-dragons": { "enabled": true, "amount": 2 },
    "score.double.little-four-winds": { "enabled": true, "amount": 1 },
    "score.double.big-four-winds": { "enabled": true, "amount": 2 },

    "score.double.rob-kong": { "enabled": true, "amount": 1 },
    "score.double.last-wall": { "enabled": true, "amount": 1 },
    "score.double.loose-tile": { "enabled": true, "amount": 1 },
    "score.double.final-discard": { "enabled": true, "amount": 1 },

    "score.fixed-special-bonus-treatment": {
      "enabled": true,
      "option": "add-after-special-cap"
    }
  },
  "specialHands": {
    "catalogue": "outside-the-box-current-33"
  },
  "settlement": {
    "basePolicy": "classical-pairwise",
    "eastMultiplier": 2,
    "incidentPolicies": [
      "incorrect-hand.otb",
      "false-discard-name.otb",
      "false-mahjong.half-limit-each",
      "wrong-tile-claim.otb",
      "liability.otb-cannon"
    ]
  },
  "progression": { "policy": "classical-winds" },
  "modes": { "afterDraw": "otb-goulash" }
}
```

### Explicit audit item

The current runtime applies global one-Chow normal validation. The OTB guide evidence in the existing crosswalk does not independently settle the ordinary-play Chow cap. That value must remain visibly provisional/current-runtime rather than being promoted to verified-club.

### Original Call audit

The current OTB scorer may inherit ordinary BMJA `originalCall` behaviour through the shared base. It is intentionally absent from this source-backed sketch until OTB evidence establishes it.

This is precisely why explicit manifests are useful: hidden inheritance becomes visible.

---

## 5. Buzzard 2000 resolved profile sketch

Buzzard is the actual #219 test case.

```json
{
  "schemaVersion": 1,
  "profile": {
    "id": "buzzard-2000-classical",
    "version": "0.1",
    "family": "classical-western",
    "kind": "published"
  },
  "provenance": {
    "sourceId": "buzzard-2000-classical",
    "evidenceStatus": "verified"
  },
  "defaultLimit": { "value": 600, "userAdjustable": true },
  "intrinsicPoints": { "preset": "classical-standard-points-v1" },
  "validation": {
    "normal": { "maxChows": null }
  },
  "rules": {
    "score.point.mahjong": { "enabled": true, "amount": 20 },
    "score.point.self-draw-live-wall": { "enabled": true, "amount": 2 },
    "score.point.standing-hand": { "enabled": true, "amount": 100 },
    "score.point.only-possible-tile": { "enabled": true, "amount": 2 },
    "score.point.no-chows-bonus": { "enabled": true, "amount": 10 },
    "score.point.scoreless-hand": { "enabled": true, "amount": 10 },
    "score.point.last-wall": { "enabled": true, "amount": 10 },
    "score.point.loose-tile": { "enabled": true, "amount": 10 },

    "score.double.own-wind-set": { "enabled": true, "amount": 1 },
    "score.double.prevailing-wind-set": { "enabled": true, "amount": 1 },
    "score.double.dragon-set": { "enabled": true, "amount": 1 },
    "score.double.own-flower": { "enabled": true, "amount": 1 },
    "score.double.own-season": { "enabled": true, "amount": 1 },
    "score.double.complete-flower-set": {
      "enabled": true,
      "amount": 3,
      "option": "additive-with-own"
    },
    "score.double.complete-season-set": {
      "enabled": true,
      "amount": 3,
      "option": "additive-with-own"
    },

    "score.double.no-chows": { "enabled": true, "amount": 1 },
    "score.double.mixed-one-suit": { "enabled": true, "amount": 1 },
    "score.double.all-majors": { "enabled": true, "amount": 1 },
    "score.double.concealed-hand": { "enabled": false },
    "score.double.pure-suit": {
      "enabled": true,
      "amount": 3,
      "option": "any-standard-melds"
    },
    "score.double.all-chows-nonscoring-pair": { "enabled": true, "amount": 1 },

    "score.double.rob-kong": { "enabled": true, "amount": 1 },
    "score.double.last-wall": { "enabled": true, "amount": 1 },
    "score.double.loose-tile": { "enabled": true, "amount": 1 },
    "score.double.final-discard": { "enabled": false },
    "score.double.original-call": { "enabled": false }
  },
  "specialHands": {
    "catalogue": "buzzard-2000-limit-hands",
    "defaultScoreModel": "configured-limit"
  },
  "settlement": {
    "basePolicy": "classical-pairwise",
    "eastMultiplier": 2,
    "incidentPolicies": [
      "liability.buzzard-dangerous-discard",
      "false-mahjong.double-limit-each",
      "incorrect-hand.buzzard"
    ]
  },
  "progression": { "policy": "classical-winds" },
  "modes": { "afterDraw": "normal" }
}
```

### Buzzard features deferred from #219 to #220

The manifest can name incident policies now, but #219 does not need to implement all settlement behaviour.

Likewise, Buzzard's incomplete Wind/Dragon non-winner limit achievement requires a small result/settlement seam in #220. It should not distort the ordinary scoring config design.

---

## 6. User custom variant sketch

Once the engine exists, a Plus user's variant should be much smaller than a published resolved manifest.

Example:

```json
{
  "schemaVersion": 1,
  "profile": {
    "id": "custom:wed-club",
    "version": "3",
    "family": "classical-western",
    "kind": "custom",
    "name": "Wednesday Club"
  },
  "baseProfile": {
    "id": "bmja",
    "version": "1.0"
  },
  "overrides": {
    "defaultLimit": { "value": 500 },
    "validation": {
      "normal": { "maxChows": 2 }
    },
    "rules": {
      "score.double.concealed-hand": { "enabled": false },
      "score.double.final-discard": { "enabled": false },
      "score.point.last-wall": { "enabled": true, "amount": 10 }
    },
    "specialHands": {
      "remove": ["buried-treasure"],
      "upsert": [
        {
          "patternId": "three-great-scholars",
          "scoreModel": "fixed-number",
          "value": 1500,
          "fishingValue": 600
        }
      ]
    },
    "modes": {
      "afterDraw": "normal"
    }
  }
}
```

The resolver produces and freezes the complete effective configuration when a game starts.

---

## 7. Does the proposed v1 model express all four profiles?

### Yes, for the repeated/common shape

The model cleanly expresses:

- limit/default;
- ordinary intrinsic scoring preset;
- Chow cap variation;
- common point bonuses;
- common doubles;
- pure-suit predicate variation;
- Flower/Season full-set stacking;
- winning-method rules;
- special-hand catalogue membership/value/exposure/fishing;
- ordinary settlement;
- East multiplier;
- progression;
- Goulash mode choice;
- incident-policy selection.

### Reusable capabilities still needed in code

The examples expose a small number of capabilities that are not merely data today:

1. config-driven validation (`maxChows` first);
2. rule registry/resolver rather than bundled BMJA rule functions;
3. finite predicate choice for pure suit;
4. finite stacking choice for complete Flowers/Seasons;
5. special hand `configured-limit` score model;
6. evidence booleans such as Standing Hand / only-possible tile;
7. later #220: non-winner limit result and Buzzard incident settlement.

Those are **family capabilities**, not Buzzard-specific code paths.

### Evidence gaps, not architecture gaps

T&M ordinary rules remain provisional, and OTB ordinary Chow cap / Original Call need source clarification. These do not require a different schema; they require better evidence.

That is an important result: the unresolved points are mostly research statuses, not missing configuration concepts.

---

## 8. Dry-wipe conclusion before Codex

The four-profile paper test supports the configuration-layer direction.

No current profile requires a bespoke whole scorer.

Buzzard is the strongest next implementation test because it forces several common knobs to become explicit while remaining firmly inside the Classical points-and-doubles family.

If #219 produces roughly these manifests and only the reusable capabilities listed above, the next step should be to migrate BMJA/OTB/T&M deliberately and then design the Plus house-rules UI over the same registry.