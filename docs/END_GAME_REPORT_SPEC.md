# End-of-Game Report Specification

This document defines the product and implementation direction for the British Mahjong Scorer end-of-game report.

The report should be more than a formatted copy of the final scores. Its purpose is to answer:

> **What happened in our game, why did the scores move, and what can we understand from it afterwards?**

The report should turn the game ledger into a useful permanent record, especially for newer British Mahjong players who may not yet understand settlement, East doubling, seat progression, or special-hand scoring.

---

## Product goal

Create a report that feels worth saving, sharing, printing, or emailing because it contains information that the live scoring screen does not preserve as clearly.

The report should combine:

- final result
- game progression
- running balances
- hand-by-hand settlement
- plain-English payment explanations
- detailed scoring evidence where it was recorded
- notable game moments derived from the ledger
- learner explanations where useful

The report should feel like:

> **“This was our game.”**

not:

> “Here is a screenshot of four numbers.”

---

## Core principles

### 1. Explain, do not merely display

British Mahjong settlement is not intuitive. The report should explain why money/points moved, particularly when East is involved and when losing players settle differences between their own hand scores.

### 2. Never invent missing detail

The report must distinguish between:

- scores calculated from a detailed hand
- scores entered manually
- facts explicitly captured during play
- facts inferred safely from the ledger

If a player entered only a numeric score, the report should say so rather than fabricate a hand explanation.

Suggested wording:

> **320 — score entered manually**  
> No detailed hand breakdown was recorded.

### 3. Use the ledger as the source of truth

Report calculations should be derived from the canonical game ledger and persisted detailed-hand records, not from presentation-layer state.

### 4. Keep learner help optional

Experienced players should be able to generate a concise report. Newer players should be able to choose a fuller report with explanations.

### 5. One report model, multiple outputs

Do not maintain separate business logic for web preview, PDF, download and email.

Preferred architecture:

`canonical game data -> report view model -> HTML/web preview -> PDF/download/share/email`

---

# Report modes

## Summary report

Designed for experienced players or quick sharing.

Include:

- game title/date
- player names
- final standings
- number of hands played
- winner
- running-balance graph
- concise hand ledger
- notable moments

Aim for approximately one to two pages when printed, depending on game length.

## Full game report

Designed for learners, clubs, family groups and players who want the game explained.

Include everything in the summary report plus:

- hand-by-hand settlement details
- plain-English payment explanations
- detailed hand score breakdowns where available
- special-hand explanations
- winning-tile context where relevant
- East/prevailing-Wind progression
- learner callouts such as “Why was this doubled?”

---

# Report structure

## 1. Cover / game summary

Example:

> # Saturday Mahjong  
> 6 September 2026  
> 14 hands played
>
> **Winner: Louise — +684**
>
> Sharron +216  
> Louise +684  
> Mark −304  
> Joe −596
>
> Final balances total **0**.

### Required fields

- report/game title
- date
- number of completed hands
- game mode if useful, e.g. single round or full game
- final ranking
- final balances
- winner/highest final balance

### Integrity check

Final net balances must total zero for a completed game.

If they do not, report generation should fail visibly rather than silently produce an inconsistent document.

---

## 2. Running-balance graph

Show each player’s cumulative balance after every completed hand.

### Purpose

This should make the story of the game visible immediately:

- who led early
- where major swings occurred
- whether someone recovered late
- whether one hand changed the result dramatically

### Requirements

- one line per player
- clear legend using names
- accessible beyond colour alone where practical
- hand number on horizontal axis
- cumulative balance on vertical axis
- include zero baseline
- usable on mobile and in print/PDF

### Data source

Use running totals already reconstructed from the canonical ledger.

---

## 3. Hand-by-hand game history

Each completed hand should have a compact summary block.

Example:

> ## Hand 7 — Louise won
>
> South prevailing · Mark was East

| Player | Hand score | Net change | Running total |
| --- | ---: | ---: | ---: |
| Louise | 320 | +800 | +412 |
| Mark (East) | 76 | −488 | −202 |
| Sharron | 112 | −132 | +244 |
| Joe | 44 | −180 | −454 |

### Required context

- hand number
- winner or wash-out/draw
- East player
- prevailing Wind
- each player’s entered/calculated hand score
- net settlement change
- running total after the hand

Where available, also show:

- starting seat Winds
- winning method
- detected special hand
- winning tile
- score source: calculated or manual

---

## 4. Settlement explanation

This is a core differentiator of the report.

For each hand, the full report should explain who paid whom and why.

Example:

> ### Why these payments happened
>
> Sharron paid Louise 320.  
> Joe paid Louise 320.  
> Mark was East, so his payment to Louise was doubled to 640.
>
> The losing players then settled the differences between their own hand scores. Payments involving East were doubled.

### Requirements

Use the stored pairwise settlement transactions rather than recomputing prose from final net changes alone.

Each transaction should retain or derive:

- payer
- recipient
- ordinary amount/base
- final amount
- whether East doubling applied
- reason/category

### Learner callouts

Where useful, provide optional expandable explanations such as:

> **Why was Mark’s payment doubled?**  
> Mark was East. Under British rules, payments involving East are doubled.

Do not repeat the same explanation excessively in a long game. The report may explain a concept fully the first time and use shorter wording later.

---

# Detailed hand evidence

## 5. Calculated detailed hands

When a hand was scored through the detailed scorer, include the recorded breakdown.

Example:

> ### Louise — 320
>
> Pung of Red Dragons — 4  
> Concealed Pung of 9 Circles — 8  
> Own Wind pair — 2  
> Mah Jong — 20  
> …
>
> **Base score: 40**  
> **3 doubles → 320**

### Include where available

- entered tile/set composition
- base-point components
- bonus-tile points
- doubles and their reasons
- winner bonuses
- fixed special-hand value
- fishing value for non-winners where applicable
- final calculated score
- score limit application where relevant

### Visual hand rendering

Where a complete detailed hand is available, the report should eventually render a compact visual hand using the project’s local SVG tile assets.

This is especially useful for:

- special hands
- memorable high-value hands
- learner reports

Do not block the first MVP on visual tile rendering if the rest of the report is ready.

---

## 6. Special-hand explanation

When a special hand was detected, show the name and a concise explanation.

Example:

> **Gates of Heaven — 1,000**
>
> The entered tiles matched the Gates of Heaven pattern.
>
> Winning tile: 9 Circles, claimed from Mark.
>
> The scorer used the recorded winning tile to verify the permitted final-Pung exception.

### Principles

- explain the actual rule condition that mattered
- do not expose internal detector terminology
- use the same learner-facing language as the special-hand catalogue
- link to the catalogue page in the web report where appropriate

---

## 7. Manual numeric scores

A manually entered score should remain a valid first-class record.

Suggested display:

> ### Joe — 184
>
> **Score entered manually**  
> No detailed hand breakdown was recorded.

Do not imply the score was independently verified by the scorer.

---

# Game progression

## 8. East and prevailing-Wind journey

The full report should help learners understand why East stayed or changed.

Possible compact presentation:

> **Hand 1**  
> East: Sharron · Prevailing: East  
> ↓ Joe wins
>
> **Hand 2**  
> East: Joe · Prevailing: East  
> ↓ Joe wins
>
> **Hand 3**  
> East: Joe retained · Prevailing: East

### Requirements

Explain only the actual progression events:

- East retained after East win
- East retained after wash-out/draw
- East moved after a non-East win
- prevailing Wind advanced after the seat cycle completed

This can be a compact timeline rather than a large section if the game is long.

---

# Notable moments

## 9. Automatically derived highlights

The report may include a **Notable moments** section containing only facts that can be calculated reliably from stored game data.

Examples:

- **Highest-scoring hand:** Louise — 1,000, Thirteen Unique Wonders
- **Biggest settlement swing:** Mark — −1,840 on Hand 11
- **Longest East run:** Sharron remained East for 4 hands
- **Special hand:** Joe completed Knitting for 500
- **Fishing:** Sharron was fishing for Thirteen Unique Wonders when Joe went Mah Jong
- **Wash-outs:** 2
- **Largest comeback:** only if defined objectively and deterministically

### Product rule

Do not generate artificial commentary such as:

> “What an exciting game!”

No AI-generated personality layer is required for the MVP.

Highlights should be deterministic and evidence-based.

### Suggested first-version highlights

Prioritise simple, high-confidence metrics:

- highest hand score
- biggest positive net swing
- biggest negative net swing
- number of special hands
- number of wash-outs
- longest continuous East tenure
- most hands won

Add more only when the metric has a clear definition.

---

# Learner explanations

## 10. Optional educational layer

The full report can include brief explanations where the recorded game demonstrates a rule.

Examples:

> **Why was this payment doubled?**  
> The payment involved East, so it was doubled.

> **What does fishing mean?**  
> The player was exactly one legal tile away from completing the named special hand when another player went Mah Jong.

> **Why did East stay the same?**  
> East keeps the position after winning, and also after a wash-out.

### Principle

Teach through the game the player just played rather than inserting a generic rulebook into the report.

---

# Output and sharing

## 11. Web preview

The first rendering target should be an in-app report preview.

Benefits:

- simplest development path
- easy responsive testing
- same view model can feed export later
- lets users inspect before downloading/sharing

## 12. PDF / download

The downloadable report should preserve:

- headings and tables
- balance graph
- hand breakdowns
- page-safe layout
- links where supported
- footer/attribution

The PDF should remain readable when printed in greyscale.

## 13. Email / share

Do not create a second independently maintained report format.

Preferred behaviour:

- generate the same report
- export/share the resulting PDF or a stable HTML representation
- allow the user to use the device/browser share mechanism where practical

A future email feature may attach the generated PDF or share a generated report link if server-side storage is introduced later.

No backend is required for the initial local-generation version.

---

# Footer and attribution

Every downloaded/shared report should include a quiet footer.

Suggested wording:

> Scored with **British Mahjong Scorer**  
> mahjong.smooks.co.uk
>
> This scorer is an independent project and is not an official BMJA publication.
>
> Mahjong tile artwork: CC BY 4.0 attribution as recorded in the project asset notice.
>
> Enjoying the scorer? **Buy me a coffee**  
> buymeacoffee.com/sharronmo

### Product decision

The Buy Me a Coffee link belongs naturally in reports/downloads/share outputs rather than being aggressively placed in the live scoring flow.

---

# Report data model

## 14. Recommended report view model

Build a dedicated report view model from canonical game state rather than binding report components directly to live gameplay state.

Illustrative shape only:

```ts
interface GameReport {
  metadata: {
    title?: string;
    playedAt?: string;
    gameMode: string;
    completedHands: number;
  };
  players: ReportPlayer[];
  finalStandings: ReportStanding[];
  hands: ReportHand[];
  balanceSeries: ReportBalancePoint[];
  highlights: ReportHighlight[];
  progression: ReportProgressionEvent[];
  integrity: {
    netTotal: number;
    isZeroSum: boolean;
  };
}
```

The exact TypeScript shape should follow the canonical models that exist when #6 is implemented.

### ReportHand should be able to represent

- hand number
- winner/draw
- East and prevailing Wind
- player hand scores
- score source per player
- pairwise transactions
- net changes
- running balances
- detailed scoring record where available
- winning tile/provenance where available
- event-special facts where available
- post-hand game progression

---

# Dependencies and sequencing

## Issue #14 — persistence/recovery

The report becomes much more valuable once completed games can survive browser refresh and restart.

Report generation should not itself be responsible for persistence, but it should consume the same canonical recovered game state.

## Issue #15 — unfinished losing hands

The final detailed-hand model should be stabilised before report rendering assumes how non-winning hand remainder tiles are represented.

## Issue #5 — learner content and tile assets

The report should reuse:

- learner-facing terminology
- special-hand explanations
- locally vendored tile SVGs
- attribution wording

Avoid duplicating content strings in multiple places if a shared structured content source is practical.

---

# MVP scope

The first worthwhile version of #6 should deliver four core capabilities:

1. **Final standings**
2. **Running-balance graph**
3. **Hand-by-hand settlement explanation**
4. **Detailed scoring evidence where available**

Also include:

- manual-score distinction
- East/prevailing context per hand
- basic notable moments
- report footer and attribution
- browser report preview
- downloadable/printable output if practical in the same implementation slice

These elements are sufficient to make the report materially more useful than the live scoring screen.

---

# Later enhancements

Potential later work, not required for the first release:

- richer visual tile-hand diagrams
- configurable report title/location/club name
- notes entered by players
- player statistics across multiple saved games
- club/session archive
- comparison across games
- richer objective highlights
- shareable hosted report links
- direct email delivery
- CSV/JSON export for analysis

Avoid adding cross-game analytics until persistence and saved-game identity are deliberately designed.

---

# Accessibility

The report should:

- use semantic headings and tables
- provide text alternatives for charts
- not encode player identity by colour alone
- preserve sufficient contrast
- render clearly at mobile widths
- remain understandable when printed without colour
- give tile images accessible names where visual examples are included

For the balance graph, provide a text/table equivalent of final and per-hand balances so the chart is never the sole source of information.

---

# Validation and trust

Before a report is generated:

- completed-hand net changes should be internally consistent
- final balances should match replay of the ledger
- final balances should total zero
- detailed calculated scores should match their persisted final score
- manual scores should remain labelled manual
- missing detailed metadata should never be synthesized

If historic or recovered data is malformed, prefer a visible “report cannot be generated from this saved game” state over a plausible-looking but incorrect report.

---

# Testing requirements

Add focused tests for at least:

- final standings from a multi-hand ledger
- zero-sum integrity
- running-balance series reconstruction
- East doubled payment explanation
- non-East winner settlement
- loser-to-loser settlement explanation
- East retention after East win
- East retention after wash-out
- seat rotation after non-East win
- calculated detailed score rendering data
- manual numeric score labelling
- special-hand metadata in report
- missing detailed metadata does not produce invented explanation
- deterministic notable-moment calculation
- summary/full report mode selection

Add at least one golden full-game report fixture containing:

- several ordinary hands
- one East-related doubled settlement
- one detailed calculated hand
- one manually entered hand score
- one special hand
- one wash-out if supported by the fixture

---

# Acceptance criteria

Issue #6 can be considered complete for the first release when:

- a completed game can produce a report from canonical ledger data
- the report shows correct final standings and balances
- the report shows a running-balance graph or equivalent visualisation
- every hand can show scores, net changes and running totals
- the full report explains settlement transactions in plain English
- detailed calculated hands show their recorded score evidence
- manual scores are explicitly identified as manual
- at least a small set of deterministic notable moments is shown
- East and prevailing Wind context is preserved
- zero-sum/integrity checks are enforced
- the report has a printable/downloadable presentation
- the independent-project, tile-artwork and Buy Me a Coffee footer is included
- the report is usable on mobile and in print

---

# Product summary

The report is worthwhile when it preserves both the **result** and the **reasoning behind the result**.

The live scorer helps players finish the game correctly.

The report should help them look back afterwards and understand what actually happened.
