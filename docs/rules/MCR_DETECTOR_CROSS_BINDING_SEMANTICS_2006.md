# MCR 2006 detector cross-binding semantics

Status: **authoritative source companion for #299**  
Issue: #303  
Profile target: `mcr-wmo-2006@0.x`

Authority: World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006 (“Green Book”).

## Purpose and precedence

`MCR_DETECTOR_PREDICATES_2006.md` gives the 81 per-binding contracts. This file pins the small number of behaviours whose exact detector meaning depends on facts spanning more than one row.

Where this file is more specific than an abbreviated 81-row description, **this file controls #299**. It does not move the five §3.9.1 counting principles into #299; #300 still owns final combination/suppression/highest-lawful scoring.

## 1. Wait fan require one winning face and one wait class

Green Book §3.8.1 fan 77–79 / Appendix 1 define Edge, Closed and Single as waiting **solely** in the stated way, and explicitly reject a wait when it is combined with another wait.

The executable detector rule is therefore stronger than “one winning tile face exists”.

From the pre-win state reconstructed by removing one occurrence of `winningTile`:

1. enumerate every non-Flower tile face that can legally be added without exceeding physical multiplicity;
2. for each added face, enumerate **all** lawful MCR completion routes / interpretations, including permitted irregular structures;
3. the set of winning tile faces must be exactly `{recordedWinningFace}`;
4. classify the role of that recorded tile in every lawful completion route;
5. emit a wait fan only when the winning state is exclusive to that class:
   - **Edge Wait:** every qualifying ordinary completion route uses the tile as 3 completing 1-2-3 or 7 completing 7-8-9, and there is no competing Closed/Single/two-sided/other completion route;
   - **Closed Wait:** every qualifying ordinary completion route uses the tile as the inside tile of a Chow, with no competing wait/completion class;
   - **Single Wait:** every qualifying completion route uses the tile to complete the pair, with no competing wait/completion class.

If the same tile face wins in two materially different ways and one route is not the target wait class, **do not emit the favourable wait fan merely because one decomposition supports it**.

This implements the existing `MCR-E006` golden rule that a favourable wait must not be manufactured from one decomposition when the pre-win hand has another lawful completion way/tile.

### Deterministic positive fixtures

Use the predicate-corpus fixtures:

```text
Edge:
  M(D123) M(B555) M(EEE)
  pre-win free C1 C2 D7 D7
  win C3

Closed:
  M(D123) M(B555) M(EEE)
  pre-win free C2 C4 D7 D7
  win C3

Single:
  M(C123) M(D456) M(B789) M(EEE)
  pre-win free D7
  win D7
```

Add negative property tests where the recorded face is still a legal winner but either another tile face also wins or the same face has a competing non-target completion route.

## 2. Self-Drawn follows the source's win-method definition

Green Book §3.7.2 says Self-Drawn includes a fresh wall tile **including replacement tiles after a Kong or a Flower**. Fan 80 then scores a fresh tile picked from the wall.

Therefore #299 candidate detection is:

```text
winSource == self-draw
=> emit Self-Drawn candidate
```

for source-compatible self-draw events including:

```text
resolvedWinEvent = none
resolvedWinEvent = last-wall-draw
resolvedWinEvent = kong-replacement
resolvedWinEvent = flower-replacement
```

The event does **not** stop fan 80 from being a candidate merely because another event fan is also present.

#300 then applies source-owned interaction:

- Last Tile Draw explicitly does not combine with Self-Drawn;
- Flower replacement may count Self-Drawn but does not count Out with Replacement Tile;
- Kong replacement is a self-drawn win and also satisfies fan 46's Kong-replacement event predicate unless a source-owned #300 interaction says otherwise.

`rob-kong` and `last-discard` are discard-source events and therefore do not emit Self-Drawn.

## 3. Last Tile is not a wall-event fan

Fan 58 means the winning tile was the last visible copy of its **tile kind**, established from real-table discards/exposures. It is represented by `lastVisibleCopy=true`.

Do not infer fan 58 from:

- `last-wall-draw`;
- `last-discard`;
- wall position;
- the tile merely being the last physical draw.

Unknown `lastVisibleCopy` is material missing evidence when fan 58 could affect the result; do not assume the favourable value.

## 4. Out with Replacement Tile English wording

The English §3.8.1 #46 entry contains both a last-discard sentence and a specific Kong-replacement sentence. Fan 45 separately owns Last Tile Claim, while fan 46 explicitly describes winning on the replacement tile after a Kong and explicitly distinguishes Flower replacement.

The existing profile evidence contract therefore binds fan 46 to:

```text
winSource = self-draw
resolvedWinEvent = kong-replacement
```

and excludes:

```text
resolvedWinEvent = flower-replacement
```

Do not silently reinterpret the duplicated English wording in code. If this profile decision is challenged by contradictory primary-source evidence, stop for comparison with the original Chinese edition as the Green Book itself requires for translation disputes.

## 5. Mixed concealed/melded Kong arithmetic

Appendix 1 #57 states:

```text
2 melded Kongs                         -> 4 points
1 melded Kong + 1 concealed Kong       -> 6 points
2 concealed Kongs                       -> 8 points
```

The list has no separate 6-point mixed-Kong fan. The runtime must preserve this source result without inventing an 82nd public binding.

For #299, preserve exact Kong pair identities and exposure state. The accepted fixed-value candidate representation may use:

```text
mixed pair:
  fan 57 pair-base candidate = 4
  fan 67 concealed-Kong occurrence = 2
```

provided #300 explicitly preserves the source-stated six-point result and does not suppress the +2 as an implied lower fan in this mixed case.

If the interaction implementation cannot express this source result with the accepted candidate/result contract, stop in #300 and report the architecture seam rather than changing the source arithmetic.

## 6. Repeated binding IDs are not repeated occurrence IDs

Appendix examples demonstrate multiple occurrences of lower fan, including Double Pung twice and Tile Hog multiple times. Candidate identity must therefore contain matched structural identity, not only the stable binding ID.

This rule applies particularly to:

- Dragon Pung;
- Tile Hog;
- Double Pung;
- concealed/melded Kong occurrences;
- Pure/Mixed Double Chow;
- Short Straight;
- Two Terminal Chows;
- Pung of Terminals or Honors;
- relational pair/triple candidate subsets needed for later §3.9.1 evaluation.

#300, not #299, decides which emitted occurrences may lawfully count together.
