# Mahjong Table Companion — research synthesis — 2026-09-15

## Executive finding

The strongest opportunity territory is not “more Mahjong features”. It is the recurring work required to keep a physical table moving when somebody must stop to calculate, remember, explain, reconcile or adjudicate something.

The current evidence-led product direction is:

> **table rules/context -> very fast scoring/state handling -> transparent explanation/settlement -> back to playing**

This is better supported than a broad “Mahjong operating system”.

## Coverage

The Deep Research pass produced a synthesis representing 101 retained observations from 50 unique public source URLs, with 72 coded supporting, 17 contrary and 12 neutral. It yielded nine JTBD clusters and seven opportunity hypotheses. Riichi material is over-represented; modern British/BMJA evidence is thinner than ideal.

The original generated archive was not persisted. A recovered package later reconstructed row-level evidence from retained source metadata and the report. For that reason, individual reconstructed rows are not canonical repository evidence. The 50 original URLs and the synthesis are retained; reopen originals before promoting a row into `evidence.csv`.

## Strongest jobs

1. **Score a physical hand without breaking flow.** The recurring pain is social latency and cognitive work, not arithmetic in isolation. A useful product must beat the table's existing method end-to-end.
2. **Teach a group without overwhelming them.** Hosts build cheat sheets and staged explanations; the pain is strong but often decays with experience.
3. **Resolve a rule or scoring question in context.** The need is often “why does this apply here under our rules?”, not generic encyclopaedic lookup.
4. **Keep table state and settlement organised.** Evidence favours one authoritative shared table state over four independent devices.
5. **Understand and agree how our table plays.** Families and clubs can know how they play without knowing a clean named ruleset.
6. **Preserve and share table rules.** Manual artefacts show real effort, but persistence and willingness to pay remain unproven.
7. **Get physical state into software with minimum friction.** Touch, camera and voice are competing solutions to this job.

## Product implications

### Scoring remains core, but speed is the test

Correctness alone is insufficient. Experienced players can be faster manually or with a compact reference. Benchmark the complete interaction from hand end to accepted score.

### Contextual explanation looks strategically important

A stronger differentiator than static rule lookup is an auditable answer tied to the active rules profile and concrete table state: “this result is X because A/B/C under table profile Y”.

### My Table survives as a problem, not yet as a business model

The evidence supports three useful verbs:

- **Understand** how the group actually plays.
- **Preserve** agreed local differences from a baseline.
- **Reuse** those rules in scoring, settlement and explanations.

What is not yet established is that people return often enough or will pay merely to persist a profile. Test reuse before account/billing complexity.

### Shared table state is stronger than remembered preferences

Round, seat/wind, scores, settlement and “what happens next” form a recurring shared-state job. Remembered players/settings may help, but they are not yet an independent leading pain.

### Voice is demoted from product thesis to experiment

No comparable first-person demand signal for voice was found. Camera has stronger evidence, but both should be evaluated as input methods against touch on total accepted-result time.

### PWA/installability is delivery, not premium value

Installability may reduce access friction, but it is not itself an evidenced paid job.

## Opportunity order

**Promising:**

- OPP-001 Fast, explainable rules-aware scoring
- OPP-003 Contextual rule explainer
- OPP-004 Table-centre dashboard and settlement
- OPP-006 Progressive teaching/newcomer mode

**Explore:**

- OPP-002 My Table rules profile
- OPP-005 Camera-assisted hand capture
- OPP-007 History and club administration

## Commercial interpretation

The evidence contains credible but limited willingness-to-pay signals. Paid American Mah Jongg products bundle online play, learning and account continuity; premium camera scoring provides a narrower signal. Neither validates a specific Table Companion subscription price.

The current commercial principle should therefore remain conservative: correctness and trustworthy core table help should not be held hostage to payment; Plus must earn its value through validated convenience, continuity, personalisation or other repeated jobs.

## Next research

The next decision-critical evidence should come from live tables rather than another broad web search:

- frequency of pauses and disputes;
- My Table reuse across sessions;
- physical-table willingness to pay;
- modern BMJA-specific behaviour;
- touch vs camera vs voice on the same hands;
- which contextual explanations are repeatedly needed;
- central-phone/tablet/shared-display behaviour.

See `research-gaps.md` for the proposed tests.