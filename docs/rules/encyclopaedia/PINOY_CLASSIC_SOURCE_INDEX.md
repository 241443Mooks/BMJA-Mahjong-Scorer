# Pinoy Classic — 251A1 source-local scoring index

Status: **counted first-party named implementation profile; no claim of universal Philippine rules**  
Parent: #251  
Date checked: 18 September 2026

## Source pin

First-party source: Pinoy Mahjong, **Lesson 5 · Scoring**:

- https://pinoymahjong.com/en/learn/scoring

The page states that the current app's official table uses **Pinoy Classic**, that the listed values match the app's scoring engine and Rules Handbook, and that household schedules may differ.

The page footer identifies **Pinoy Mahjong Rules Handbook · Version 1.0**, reviewed **25 July 2026**.

This is therefore a bounded first-party implementation profile. It is not evidence that all Filipino/Philippine Mahjong tables use the same scoring schedule.

## Inventory boundary

The source explicitly separates:

- a 100-chip primitive base win;
- end-of-hand pattern/finish awards;
- separate immediate payments for Kang, Secret, Sagasa and Flores milestones;
- final chip movement/settlement.

For 251A1, exclude the **100-chip Base win** as primitive scoring arithmetic, analogous to the Babcock base-score boundary.

Count the remaining **11 reference-worthy end-of-hand scoring concepts**. Do not add immediate Kang/Secret/Sagasa/Flores payments as extra hand concepts; they are profile settlement/event evidence for later runtime work.

## 11 source-local scoring concepts

| Source-local award | Source-listed treatment |
| --- | ---: |
| Win before the fifth live-wall draw | +150 chips |
| Concealed hand | +25 chips |
| 1-to-9 Straight (Escalera) | +75 chips |
| Seven Pairs | +75 chips |
| All Chow | +25 chips |
| All Pong | +150 chips |
| Full Flush | +150 chips |
| Pair, edge, or middle wait | +25 chips |
| Rob the Sagasa | +100 chips |
| Last-tile win | +25 chips |
| Self-draw | double the subtotal |

## Profile facts for later runtime work

Related first-party Pinoy Classic lessons document additional profile-specific mechanics, including:

- `Secret` as a concealed Kang with an immediate payment;
- `Sagasa` as upgrading an exposed Pong to Kang with an immediate payment;
- `Rob the Sagasa` as a winning event;
- Flores replacement and milestone payments;
- 16-tile Filipino hand structure in the app profile.

Those mechanics should inform future profile/runtime work but do not expand the 251A1 end-of-hand concept count unless a separate source-local concept model later requires them.

## 251A1 treatment

Count **11 Pinoy-Classic-v1.0-local scoring records**.

Do not map Escalera, Seven Pairs, Full Flush, concealed-hand, wait or self-draw treatments onto other rules families by name alone. 251A2 must compare exact structure, event requirements, values and runtime identities first.
