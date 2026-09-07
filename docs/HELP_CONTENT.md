# British Mahjong Scorer — help content

> **Purpose:** publishable source copy for a future `/help` page and contextual help links inside the scorer.
>
> This document is derived from `docs/PRODUCT_HANDBOOK.md` and `docs/FEATURES_CONTENT.md`. It should describe the shipped product only. If behaviour changes, update the handbook first and then review this file for drift.
>
> **Tone:** calm, practical, plain English and answer-first. Start with the player’s immediate problem. Explain the evidence boundary only as far as needed. Do not turn every answer into a rules lesson.
>
> **Help principle:** tell the player what they can do now, what the scorer can safely work out, and what it will deliberately leave unknown.

---

# Help

## Score the game without having to remember every scoring rule

British Mahjong Scorer is designed to help at the table, not to make you study the software before you can use it.

You can:

- score a complete four-player game;
- calculate one hand in detail;
- enter a numeric score when you already know it;
- enter only part of a losing hand when that is all you need;
- let the scorer detect supported patterns where the evidence is sufficient;
- recover an in-progress game after an ordinary browser refresh or restart;
- print or save the confirmed game record at the end.

If you are unsure about a fact, the scorer should not force you to invent one. Where possible, use the available **I’m not sure** route and let the score stay conservative.

---

# Start here

## I want to score a complete game

Open **Score a game**.

Set up the four players and score each hand as you play. For each player you can either:

- type the hand score directly; or
- use the detailed hand scorer to calculate it from the tiles.

After the hand scores are entered, the game calculates settlement, updates the running balances and adds the confirmed result to the game ledger.

The same ledger becomes the printable or savable game record later.

### What the scorer works out automatically

The game handles the current game context used by its settlement and progression model, including East and prevailing-Wind progression.

It also calculates player-to-player settlement from the confirmed hand scores and shows the resulting running balances.

### What you still need to tell it

You need to provide the player scores and the hand result, either manually or through the detailed scorer.

The app does not observe the physical table by itself.

### Related

- Score one hand in detail
- Enter a score manually
- Understand settlement
- Print or save a game record

---

## I only want to score one hand

Open **Score a hand**.

Use the visual tile controls to enter the hand and the relevant game context. The scorer then calculates the score supported by the evidence you entered.

You do not need to start a full game merely to calculate one hand.

### You can enter

- Pungs;
- Kongs;
- Chows;
- pairs;
- Remaining tiles for unfinished losing hands;
- Flowers and Seasons;
- an irregular Special layout where ordinary groups do not fit.

### The scorer may also ask

For a winning hand, it may need information such as:

- how Mah Jong was completed;
- which tile completed Mah Jong;
- a rare event fact that cannot safely be inferred.

It only needs those extra facts when they can affect the score.

---

# Scoring a complete game

## How do I start a new game?

Open **Score a game** and enter the four players.

The game then becomes the working score sheet for that table. Confirmed hands are added to the ledger as you play.

If there is already a saved in-progress game in the same browser, use the available recovery/start-over flow rather than assuming the old game has disappeared.

---

## Do all four players have to use the detailed scorer?

No.

Each player’s score can be entered in whichever way is practical for that hand:

- calculated from a detailed hand; or
- typed as a numeric score.

A single confirmed hand can contain a mixture of both.

For example:

- one player can enter every tile in detail;
- one player can enter only the scoring parts of a losing hand;
- two players can simply type their scores.

The game remains valid. The ledger keeps the evidence distinction for each player.

---

## I already know a player’s score. Do I need to build the hand?

No.

Enter the numeric score directly.

That score can be used for settlement, running balances and game progression.

The important limitation is that a manual number is not treated as a scorer-verified hand. The historical record will not invent tiles or a scoring breakdown that was never entered.

---

## Can I mix manual and calculated scores in one hand?

Yes.

This is normal supported behaviour.

The scorer does not require the whole table to use the same level of detail.

Detailed records keep their scoring evidence. Manual records remain clearly manual.

---

## What happens before I confirm a hand?

The game can show the settlement changes before confirmation.

This is a preview, not historical game data.

Only the confirmed result belongs in the canonical ledger and running history.

If something looks wrong, correct it before confirming where practical.

---

## What happens when I confirm a hand?

The confirmed result is added to the game ledger.

The game then retains the confirmed hand information needed for the history, including where available:

- winner or draw;
- East;
- prevailing Wind;
- each player’s score;
- settlement changes;
- running totals;
- detailed hand evidence for players who used the detailed scorer;
- manual-score labels for players who did not.

That confirmed history is also what the print/save feature uses later.

---

## How does settlement work in the app?

Once the scores are known, the game calculates the player-to-player payments using the implemented British Mahjong settlement rules.

Where East affects the payment, the game applies the relevant doubling.

The ledger keeps the actual settlement transactions, so it can explain who paid whom rather than leaving you with only a net number.

If you are checking a disagreement, use those transaction explanations rather than trying to reconstruct the settlement from the final balances alone.

---

## Why did one player pay twice as much?

Check whether that player was East and whether East doubling applies to that settlement.

The ledger’s settlement explanation should show the actual payment and why the East amount was doubled where relevant.

---

## How are running balances calculated?

Each confirmed hand changes the running balances according to the confirmed settlement transactions.

The balance after each hand is retained as part of the ledger.

This means you should not need a separate handwritten running-total sheet alongside the app.

---

## Can I record a draw?

Yes.

A confirmed hand can be recorded as a draw according to the game model.

The result remains part of the game history rather than disappearing because nobody won the hand.

---

## I made a mistake in a confirmed hand. Do I have to restart the game?

No.

Use the game’s correction/undo flow.

The point of the correction path is to recover from an ordinary scoring mistake without discarding the whole game.

Because running balances and progression derive from confirmed history, a correction should be made through that supported flow rather than by trying to edit the displayed totals independently.

---

## How do I know when the game is complete?

When the implemented game progression reaches completion, the game page shows the finished state.

This includes:

- **Game complete**;
- the number of confirmed hands played;
- ranked final standings;
- final balances;
- the winner.

You do not need to generate a separate report before you can see the final result.

---

# Scoring one hand in detail

## How do I enter an ordinary hand?

Use the standard grouped-set builder.

Add the completed groups you have, choosing from:

- Pung;
- Chow;
- Kong;
- Pair.

Set exposed or concealed information where relevant, then enter Flowers, Seasons and any other required hand context.

For a losing hand, use **Remaining tiles** for ordinary loose tiles that are not part of a completed scoring group.

---

## Do I need to know Mahjong notation?

No.

The hand is entered visually using Mahjong tile artwork.

You choose the group or destination and tap the tiles rather than typing a compact tile code.

---

## How do I mark a set as exposed or concealed?

Use the set controls for that group.

The scorer retains this distinction because it can affect points, doubles or special-hand conditions.

You do not need to calculate the scoring effect yourself; enter the state that reflects the actual hand.

---

## What if I have a Chow?

Enter it as a Chow in the standard sets flow.

The scorer enforces the ordinary Chow restrictions used by this project rather than accepting unsupported ordinary-hand combinations silently.

If the hand is an irregular special layout rather than a normal grouped hand, use the Special layout route instead.

---

## What if I have a Kong and the tile count looks too high?

That is expected.

A Kong has four physical tiles but occupies one structural group slot.

The scorer accounts for that difference, so a valid Kong should not make the hand invalid merely because there is an extra physical tile.

---

## Where do Flowers and Seasons go?

Enter them in the dedicated Flowers/Seasons controls.

They are bonus tiles, not part of the normal structural 13/14 playing-tile base.

The scorer and learner guide also show their relationship to seat Wind so you do not need to memorise the mapping before entering them.

---

# Winning hands

## How do I score a winning hand?

Enter the completed hand and mark the player as the winner using the relevant game status.

Provide the winning method if the scorer asks for it.

Once the hand contains sufficient evidence, the scorer can calculate the ordinary points, doubles, whole-hand patterns and supported special-hand logic that apply.

Some rare rules also depend on the exact tile that completed Mah Jong. In those cases, the scorer may ask one further question.

---

## Why does the scorer ask how Mah Jong was completed?

Some scoring rules depend on whether the hand was completed by a particular type of draw, claim or special event.

The scorer records the winning method so it can apply only the rules supported by what actually happened.

It does not treat every winning method as equivalent.

---

## Why does it ask “Which tile completed Mah Jong?”

A small number of rules depend not just on the final 14 tiles, but on which tile was the actual winning tile and which group it completed.

Rather than making you choose from a long abstract list, the scorer shows the entered hand and lets you identify the tile that completed Mah Jong.

This evidence can then be retained with the detailed hand record.

---

## I do not know which tile completed Mah Jong

Use the **I’m not sure** route where provided.

The scorer will still calculate what it can, but it will not apply winning-tile-sensitive exceptions that it cannot prove.

That may produce a lower result than a fully evidenced hand. This is deliberate: unknown evidence should not be replaced with a guess.

---

## I chose the winning tile and then edited the hand

If the edit makes the previous winning-tile evidence invalid, the scorer should clear or revalidate that selection.

Choose the winning tile again if needed.

This prevents stale provenance from remaining attached to a different hand shape.

---

# Losing and unfinished hands

## Do I have to enter all 13 tiles for a losing hand?

No.

This is one of the main design choices in the scorer.

A losing hand can be entered as **partial evidence**. If you only care about the completed groups and bonus tiles that score, enter those and stop there.

The scorer can calculate the parts that are directly supported by what you entered.

---

## I only know part of the losing hand

Enter the parts you know.

For example, if you know the player has:

- a Red Dragon Pung;
- a concealed 9 Circles Pung;
- an own-Wind pair;
- a Flower;

enter those items.

You do not have to invent the remaining loose tiles merely to make the screen look complete.

The scorer will mark the evidence as partial and calculate what those entered items prove.

---

## I only want to enter the sets that score

That is allowed for a losing hand.

Enter the completed scoring sets, relevant pair and bonus tiles you want included.

You can then use the calculated partial score without reconstructing every irrelevant loose tile.

The trade-off is that the scorer will not run whole-hand deductions that depend on the unseen remainder.

---

## What does “Partial hand” mean?

It means the scorer has enough evidence to calculate some parts of the score, but not enough to treat the entry as a complete reconstruction of all 13 structural playing tiles.

Partial does **not** mean invalid.

A partial hand can still have a valid score for directly evidenced components.

---

## What can the scorer calculate from a partial losing hand?

It can calculate scoring elements whose truth is already established by what you entered.

Depending on the hand, that can include things such as:

- completed scoring Pungs;
- completed Kongs;
- relevant pairs;
- Flowers and Seasons;
- other scoring components that do not depend on unseen tiles.

---

## What can’t it calculate from a partial losing hand?

It will withhold conclusions that depend on the unseen tiles.

For example, it should not confidently infer:

- Purity or another whole-hand suit conclusion;
- an all-Pung/no-Chow-style whole-hand pattern where missing tiles could change the answer;
- a complete special hand;
- special-hand fishing;
- other whole-hand properties that require the full tile evidence.

If you want those checks, enter all of the remaining structural tiles.

---

## What happens when I enter all 13 structural tiles for a losing hand?

The evidence becomes complete enough for the scorer to run the supported whole-hand and fishing analysis.

The hand can then move from **partial evidence** to **complete evidence**.

Flowers and Seasons remain separate bonus tiles and do not count toward the structural 13.

---

## What are Remaining tiles?

**Remaining tiles** are the ordinary loose tiles in a losing hand that are not part of one of the completed groups you have entered.

They let you record the actual unfinished hand without pretending every tile belongs to a completed Pung, Chow, Kong or pair.

Use them when you want the scorer to see the rest of the hand, for example to check whole-hand composition or fishing.

---

## Do Remaining tiles have to form one incomplete set?

No.

They can be arbitrary loose or unfinished tile evidence.

A real losing hand can contain unrelated leftovers and multiple incomplete shapes. You do not need to force them into one fake incomplete group.

---

## I entered 12 structural tiles. Is that an error?

Not for a losing hand.

Twelve entered structural tiles simply means the evidence is partial.

You can still score directly evidenced components.

Add the final structural tile only if you want the scorer to run the complete-hand deductions that require it.

---

## I entered too many structural tiles

That is different from a partial hand.

More than the legal structural count is an invalid state, so correct the entered tiles before using the score.

The scorer distinguishes **incomplete evidence** from **impossible evidence**.

---

## I entered five copies of the same tile

That is an impossible physical inventory.

The scorer should reject or warn about more than four copies of the same ordinary playing tile across the entered evidence.

Remove the extra copy or correct whichever group/tile was entered incorrectly.

---

# Special hands and irregular layouts

## My hand does not fit normal Pungs, Chows, Kongs and pairs

Use the **Special layout** route.

Some supported special hands have an irregular tile pattern that does not fit naturally into the ordinary grouped-set builder.

Special layout lets you enter those tiles directly.

You do not need to identify the special hand by name before you can use the irregular layout route.

---

## Do I need to select the name of the special hand?

Usually, no.

The product principle is that the scorer should detect supported patterns from the entered evidence where it safely can.

You should not have to recognise “Wriggling Snake”, “Knitting” or another supported special before the app can identify it.

The full Special hands page is there if you want to browse and learn the names separately.

---

## How do I know when a special hand has been detected?

When the entered evidence matches a supported special hand, the scorer surfaces the relevant result in the live scoring area.

The working scorer shows relevant detected patterns rather than displaying every possible special hand all the time.

For the complete catalogue, use **Special hands** from the site navigation.

---

## Why is a special hand not being applied?

Check whether the scorer has enough evidence to prove it.

A supported special may depend on:

- the complete tile layout;
- exposed/concealed state;
- the winning method;
- the winning tile;
- a rare event fact.

If one of those facts is missing or unknown, the scorer may deliberately omit the special rather than assume the best-case interpretation.

---

# Fishing

## What does fishing mean here?

Fishing means the entered non-winning hand is one tile away from completing Mah Jong in a way recognised by the supported rules.

For special-hand fishing, the scorer can test the complete non-winning evidence against supported special patterns.

---

## I think I’m fishing for a special hand but I do not know its name

You do not need to know the name.

Enter the complete non-winning tile evidence.

Where the evidence is sufficient, the scorer can test legal completing tiles, identify supported special-hand matches and show the possible winning tile or tiles.

---

## Why is fishing not being detected on my partial hand?

Because unseen tiles could change the answer.

Special-hand fishing requires enough complete evidence for the scorer to know that the entered hand is genuinely one tile away from the detected pattern.

If you want the fishing check, add all 13 structural playing tiles for the losing hand.

---

## What if more than one tile would complete the special hand?

The scorer can show multiple possible completing tiles where the supported detection finds more than one legal wait.

You do not need to choose a single target in advance.

---

## What if more than one special hand matches?

The scorer evaluates the supported lawful matches rather than simply using whichever detector happened to run first.

It applies the appropriate highest fishing result supported by the implemented rules.

---

# Event-based special hands

## Why does the scorer sometimes ask a strange one-off question?

A few rare special hands depend on what happened during play rather than only on the final tile layout.

The app deliberately avoids asking those questions during ordinary hands.

It asks only when the hand is already a plausible candidate and the missing fact could change the score.

---

## Why doesn’t the app keep a complete turn-by-turn event log?

Because most players do not need one simply to score the supported rare event specials.

The current product uses the minimum necessary context instead.

It infers an event when the information already entered is sufficient and asks a short follow-up only when needed.

---

## I do not know the answer to an event question

Use **I’m not sure** where available.

The scorer will omit the unsupported event special rather than assume that the rare event happened.

The rest of the hand can still be scored from the evidence that is known.

---

## Why didn’t it ask me about a rare special?

Either the entered evidence was not a plausible candidate, or the required fact could already be inferred.

The scorer is designed not to interrupt ordinary scoring with irrelevant special-hand questions.

---

# Flowers and Seasons

## Do Flowers and Seasons count toward the 13 or 14 tiles?

No.

They are bonus tiles and are entered separately from the structural playing-tile base.

A hand with Flowers or Seasons can therefore contain more physical tiles without those bonus tiles making the structural hand invalid.

---

## How do I know which Flower or Season is mine?

The scorer and learner material show the relationship between the bonus tile and seat Wind.

You do not need to memorise the mapping before using the controls.

---

## Can Flowers and Seasons still score on a partial losing hand?

Yes, where their scoring is directly evidenced by the entered bonus tile and relevant seat context.

They do not require you to enter every unrelated loose playing tile first.

---

# Understanding the score

## Where can I see why the score changed?

Look at the live score breakdown and contextual detected-pattern explanations.

The scorer surfaces the patterns and rule components that actually apply to the entered evidence rather than showing a permanent catalogue of everything that might have applied.

This is intended to answer:

> Why did my score just change?

---

## Why doesn’t the scorer show every possible special hand while I’m scoring?

Because the working scorer is meant to stay usable at the table.

It shows the patterns that apply to the current evidence.

If you want to browse all supported special hands, use the dedicated **Special hands** page.

---

## Is the score breakdown a second scoring system?

No.

The explanations are derived from the structured scoring result used by the scorer.

The UI should not run a separate independent rule engine just to create explanatory text.

---

## What if the scorer and our table disagree?

Start with the score breakdown and identify the specific rule causing the difference.

Possible reasons include:

- your group uses a house rule;
- your group uses a different Mahjong ruleset;
- a tile or game fact was entered incorrectly;
- required evidence is missing;
- the project has made a documented interpretation of an ambiguous rule;
- there is an implementation defect.

British Mahjong Scorer is an independent project, not an official BMJA publication, and it does not claim compatibility with every table’s house rules.

Use the relevant learner/rules material to locate the disagreement rather than treating the final number as unquestionable.

---

# Saving and recovering a game

## Will refreshing the page lose my game?

An in-progress game is saved locally in the browser so an ordinary refresh should not destroy it.

The saved state is versioned and designed to recover the current compatible game in the same browser/device.

---

## What if I close the browser and come back later?

The latest compatible in-progress game can be recovered on the same browser/device.

You do not need an account for this local recovery.

---

## Is my game saved to an online account?

No.

Current recovery uses the browser’s local storage.

That means it is **not**:

- cloud backup;
- cross-device sync;
- account history;
- online multiplayer state.

Do not rely on it as remote backup of the game.

---

## Can I continue the game on another phone or computer?

Not through the current recovery feature.

The saved in-progress game belongs to the browser/device where it was stored.

There is no current account-based cross-device sync.

---

## What if the saved browser data is damaged or incompatible?

It should not prevent the app from loading.

The persistence format is versioned and loaded defensively. Invalid or incompatible saved state can be rejected or cleared rather than trusted blindly.

---

## How do I completely start again?

Use the explicit **Start over**, **New game** or clear-saved-game action provided by the game flow.

A deliberate reset clears or replaces the current saved snapshot so the old game does not unexpectedly come back.

---

# Leaving the scorer safely

## Can I leave a standalone hand without saving it?

Yes, but if entered work would be lost the app should warn before discarding it.

Use the explicit leave/back action rather than assuming browser navigation will preserve an unfinished standalone hand.

---

## I opened the detailed hand scorer from a game and changed my mind

Use the **Back to game / Cancel** route.

Returning without choosing **Apply score** should leave the game without applying that unfinished detailed hand score.

This lets you inspect or abandon a detailed entry safely.

---

## If I navigate away from a game, is the game gone?

The shipped game persistence greatly reduces the risk of losing the game through an ordinary refresh or navigation accident.

However, an intentional **Start over/New game** action is different: that deliberately clears or replaces the saved game state.

---

# Printing and saving the game record

## How do I save a game at the end?

Use **Print / Save game**.

The app uses the browser’s normal print flow rather than generating a separate hosted report.

From the browser print dialog you can normally:

- print to paper; or
- choose **Save as PDF**.

---

## What is the Full game record?

**Full game record** prints the detailed confirmed history available in the canonical ledger.

Where you captured detailed hands, it can include the tile evidence and scoring detail stored for those players.

Where a score was entered manually, the record stays manual rather than inventing a hand.

Where only partial hand evidence was entered, it remains visibly partial.

---

## What is the Game summary?

**Game summary** is the more compact print/save option.

It focuses on:

- standings;
- confirmed hand-by-hand results;
- player scores;
- settlement changes;
- running totals.

It deliberately omits the detailed hand cards, tile diagrams and scoring evidence.

---

## Which print option should I use?

Use **Full game record** when you want the captured scoring evidence and tile detail.

Use **Game summary** when you mainly want a clean record of the game result and hand-by-hand movement.

Both come from the same canonical confirmed game history.

---

## My ledger entries are collapsed. Will the Full record miss them?

No.

For the Full game record, the print flow can temporarily expose the confirmed ledger detail needed for printing and then restore the entries to their previous open/closed state on screen.

---

## Can I print a game before it is finished?

Yes, the record can represent the confirmed game so far.

An in-progress print reflects current confirmed standings/history rather than pretending the game has final completed standings.

---

## Does the printout include the hand I am currently editing?

Only confirmed history belongs in the game record.

Unconfirmed score-entry controls and live settlement previews are not treated as historical game data.

Confirm the hand first if you want it included in the record.

---

## Does the app create a special PDF file itself?

No.

The current feature uses browser Print / Save as PDF.

There is no separate custom PDF-generation system, report account or hosted report URL in the current product.

---

## Can I get a shareable web link to the game report?

Not currently.

Hosted/shareable game-report URLs are not part of the shipped print/save feature.

If you need a portable copy now, use the browser’s Save as PDF option.

---

## Can the app email the report for me?

Not currently.

Built-in email delivery is not part of the shipped game-record feature.

Save the record using the browser print flow and share the resulting file using your normal device tools if needed.

---

## Can I save the game as an image or screenshot automatically?

There is no dedicated image/PNG capture feature in the current product.

The supported record flow is browser Print / Save as PDF.

---

# Accounts, privacy and data

## Do I need an account?

No.

You can score a hand or game without creating an account or signing in.

---

## Where is my in-progress game stored?

In the local storage of the browser/device you are using.

The scorer is a static browser application and does not require an account database for ordinary scoring.

---

## Is local recovery the same as cloud backup?

No.

Local recovery protects against ordinary browser refresh/restart on the same device.

It does not create a remote backup or copy the game to another device.

---

## Does the site need a backend to score my hand?

No.

Ordinary scoring and learner use run in the browser as part of the static application.

---

# Learning the rules

## I do not really know how to play yet

Start with **Gameplay basics**.

It explains the practical flow of British Mahjong before you get into scoring detail.

---

## I can play but scoring confuses me

Use the **Beginner guide**.

It explains the scoring system progressively, including tiles, sets, points, doubles, fishing and settlement.

You do not need to absorb the complete special-hand catalogue before using the scorer.

---

## I want to see all the special hands

Open **Special hands**.

That page is the browseable visual catalogue.

The working scorer deliberately keeps the full catalogue out of the active scoring flow and only surfaces patterns that actually apply.

---

## Is this an official BMJA scorer?

No.

British Mahjong Scorer is an independent project.

It implements the British ruleset documented by this project and uses published British Mahjong sources during development, but it is not an official British Mah-Jong Association publication and should not be treated as BMJA-endorsed.

---

## Does it support every Mahjong ruleset?

No.

It is deliberately built around the British rules used by this project.

It is not a universal Mahjong engine and it does not currently offer a switch for every regional variant or house rule.

---

## Where can I see the rules the scorer is based on?

The public learner pages explain the rules in project-owned plain English.

The repository also contains an engineering rules reference and scoring audit that record sources, interpretations, known ambiguity and test coverage.

Those engineering documents are useful when you need to inspect exactly why the software behaves a particular way.

---

# Common “what if?” answers

## What if I only know two scoring groups from a losing hand?

Enter those two groups.

You can score the directly evidenced components without entering every unrelated loose tile.

The hand remains partial, so whole-hand deductions that depend on unseen tiles stay off.

---

## What if I do not know the exact losing hand at all?

If you know the numeric score, enter it manually in the game.

If you know only some scoring components, enter those as partial evidence in the detailed scorer.

Do not invent tiles just to produce a complete-looking record.

---

## What if I am not sure whether a set was exposed or concealed?

Use the evidence you actually know.

If the distinction affects the score and you cannot establish it, avoid selecting a state merely to maximise the result. Where the UI does not provide an explicit unknown state for that fact, the safest approach is to confirm the real table state before relying on a detailed calculated score.

---

## What if I do not know the winning tile?

Use the uncertainty route.

The scorer will avoid rules that specifically require that provenance.

---

## What if I do not know a rare event fact?

Use **I’m not sure** where offered.

The scorer omits the unsupported rare special and continues with the evidence it can prove.

---

## What if the scorer asks no extra question about a special?

That can be correct.

Either the special is not plausible from the current hand or the necessary fact can already be inferred from information you entered.

---

## What if I accidentally enter an impossible fifth tile?

Correct the duplicate.

The scorer treats that as invalid evidence, not as a partial hand.

---

## What if I have a Kong plus Flowers and the physical tile count is well above 14?

That can still be structurally valid.

Kongs add an extra physical tile to a structural group, and Flowers/Seasons are separate bonus tiles.

The structural count is therefore not the same thing as the total number of physical tiles sitting in front of the player.

---

## What if only one player wants a detailed final record?

That is fine.

Use detailed scoring for that player and manual scores for the others.

The Full game record will show the detailed evidence where it exists and keep the other scores clearly manual.

---

## What if one losing player only entered partial evidence?

The game can still use the resulting calculated score.

The ledger and Full record should preserve that it was partial rather than presenting it as a full reconstruction.

---

## What if I want to know exactly who paid whom after a hand?

Expand the confirmed ledger entry and read the settlement explanation.

It uses the stored settlement transactions rather than guessing from the final net totals.

---

## What if I only want a compact record for the group chat?

Use **Game summary** and save it using the browser print flow.

It is intentionally more compact than the Full game record.

---

## What if I want every captured tile for posterity?

Use **Full game record**.

It includes the detailed confirmed ledger evidence that was actually recorded.

---

## What if I want the game history online on several devices?

That is not a current feature.

The shipped persistence is local to one browser/device.

---

## What if I want to photograph the tiles instead of entering them?

Photo-based tile recognition is future backlog work, not current functionality.

For now, enter the tiles using the visual hand scorer.

---

## What if I want to play against computer players?

Solo browser practice is exploratory future work, not current functionality.

The current product scores and teaches; it does not run three computer opponents.

---

## What if two detailed player hands together use impossible shared tiles?

The current hand scorer validates each entered hand’s own tile inventory.

Cross-player shared physical-tile availability warnings are backlog work and should not be assumed to exist yet.

---

# Troubleshooting by symptom

## My score looks too low

Check, in this order:

1. Is the correct seat Wind/game context entered?
2. Are the completed groups entered correctly?
3. Are exposed/concealed states correct?
4. Are Flowers/Seasons entered?
5. Is the hand partial, meaning a whole-hand pattern is deliberately unavailable?
6. Is the winning method correct?
7. Does a special rule need the winning tile or event evidence that is currently unknown?
8. Does your table use a different house rule?

Then inspect the score breakdown to identify the missing component rather than simply increasing the number manually.

---

## My score looks too high

Check for:

- an incorrect exposed/concealed state;
- incorrect seat or prevailing Wind context;
- a bonus tile entered for the wrong player;
- an incorrect winning method;
- a rare event answer set to Yes when it did not happen;
- tiles/groups that were entered twice;
- a house-rule difference between your table and the scorer.

Use the visible scoring breakdown to find which component is adding the unexpected value.

---

## A whole-hand pattern I expected is missing

First check whether the hand is a partial losing-hand entry.

If not all structural tiles are present, the scorer deliberately withholds whole-hand deductions that unseen tiles could change.

If the evidence is complete, inspect the actual entered tile composition and the relevant rule in the guide/reference.

---

## Fishing is missing

Check whether the losing hand has complete 13-tile structural evidence.

Special fishing is not inferred from a partial hand because the unseen tiles could change both the pattern and the possible waits.

---

## A special hand is missing

Check whether the hand needs:

- a complete tile layout;
- a specific winning method;
- winning-tile provenance;
- a rare event answer;
- a particular exposed/concealed state.

If the necessary evidence is unknown, the scorer may correctly omit the special.

---

## The app says the hand is invalid

Invalid is not the same as partial.

Look for an impossible or contradictory entry such as:

- too many structural tiles;
- more than four copies of the same ordinary tile;
- an unsupported structural combination;
- stale evidence after editing.

Correct the contradiction and recalculate.

---

## The browser refreshed and I cannot see the game I expected

Current recovery depends on compatible saved state in the same browser/device.

Check that you are using the same browser profile/device and that local site data has not been cleared.

The feature is not cloud backup, so another device will not automatically have the game.

---

## My PDF looks different from the screen

That is expected to some extent.

Print mode deliberately hides interactive-only controls and changes the layout so the confirmed record is readable on paper/PDF.

Full mode can also expose ledger details that were collapsed on screen.

---

# Help-page information architecture

> The following is implementation guidance for the future `/help` route. It is not all intended to appear as one unbroken page.

## Recommended top-level groups

### Score a game

- Start a game
- Enter player scores
- Manual vs detailed scoring
- Preview and confirm
- Understand settlement
- Correct a confirmed hand
- Finish the game

### Score a hand

- Enter ordinary sets
- Enter exposed/concealed state
- Add Flowers and Seasons
- Enter a winning hand
- Enter a losing hand
- Enter partial evidence
- Enter Remaining tiles
- Use Special layout

### Understand the scorer

- Score breakdown
- Detected patterns
- Special hands
- Fishing
- Winning-tile questions
- Event questions
- Evidence and uncertainty

### Save and recover

- Refresh/browser recovery
- Start over
- Leave safely
- Print/Save game
- Full game record
- Game summary

### Learn and check rules

- Gameplay basics
- Beginner guide
- Special-hands catalogue
- Rules and sources
- If the table disagrees

### Current limitations

- no account/cloud sync
- no cross-device recovery
- no photo recognition yet
- no solo computer opponents yet
- no shared physical tile inventory across players yet
- no hosted shareable report URLs

---

# Recommended search/SEO question targets

These headings are useful candidates for searchable help anchors or future individual help routes.

- How do I score British Mahjong online?
- How do I score a British Mahjong hand?
- Do I need to enter every tile in a losing Mahjong hand?
- How do I score a partial losing Mahjong hand?
- What are Remaining tiles in the scorer?
- How does a Kong affect the Mahjong tile count?
- Do Flowers and Seasons count toward 13 tiles?
- How do I score Flowers and Seasons in British Mahjong?
- How does East doubling work in British Mahjong settlement?
- How do I calculate who pays whom in British Mahjong?
- What does fishing mean in British Mahjong?
- Can the scorer detect special-hand fishing automatically?
- What if I do not know the winning tile?
- How do I score an irregular British Mahjong special hand?
- Can I enter a Mahjong score manually?
- Can different players use different scoring methods in one game?
- Does the Mahjong scorer save my game if I refresh?
- Can I recover a Mahjong game after closing the browser?
- Can I save a British Mahjong game as PDF?
- What is the difference between Full game record and Game summary?
- Is British Mahjong Scorer an official BMJA app?
- Does British Mahjong Scorer support house rules?

Do not turn these into keyword-stuffed copy. They are question-language patterns that match genuine user problems already supported by the product.

---

# Contextual-help opportunities inside the app

The future Help implementation can link directly from difficult product states rather than expecting the user to navigate to the Help homepage first.

Useful contextual links include:

## Partial losing hand

Link label:

> Why can’t the scorer check whole-hand patterns yet?

Target:

- explanation of partial vs complete evidence

## Winning-tile question

Link label:

> Why does the winning tile matter?

Target:

- winning-tile provenance explanation

## Event question

Link label:

> Why am I being asked this?

Target:

- event-based special explanation

## Manual score entry

Link label:

> What is saved with a manual score?

Target:

- manual vs detailed evidence explanation

## Local recovery

Link label:

> Where is this game saved?

Target:

- localStorage / same-device explanation in non-technical language

## Print chooser

Link label:

> Full record or summary?

Target:

- print-mode comparison

## Invalid tile inventory

Link label:

> Why is this hand invalid?

Target:

- partial vs impossible evidence, structural count and copy limits

---

# Content rules for future help articles

Every individual Help answer should follow this order where practical:

1. **Answer the immediate question.**
2. **Tell the user what to do.**
3. **Explain what the scorer can infer automatically.**
4. **State what it cannot know from the current evidence.**
5. **Offer the next useful action.**
6. **Link to deeper rules only if the user needs them.**

Avoid:

- beginning with a long definition before answering the user;
- treating partial evidence as user error;
- telling the user to guess missing facts;
- implying manually typed scores were verified;
- implying local browser recovery is cloud storage;
- implying the scorer supports every Mahjong ruleset;
- repeating the full special-hand catalogue in Help;
- exposing internal implementation terms unless they genuinely help the user;
- describing backlog features as if they already exist.

---

# Canonical trust language for Help

Use variants of these statements consistently:

> **Enter what you know. The scorer will calculate what the evidence safely supports.**

> **Partial does not mean invalid.**

> **If a fact is unknown, the scorer should not invent it.**

> **A manual score is accepted as game input, but it is not presented as a scorer-verified hand.**

> **The saved game record comes from the same confirmed ledger used during play.**

> **Local recovery works on the same browser/device; it is not cloud sync.**

> **British Mahjong Scorer is an independent project built around the British rules documented by this project.**

---

# Current limitations — publishable wording

## Cross-device sync

Your in-progress game is recovered from the browser where it was saved. Account-based cloud sync is not currently available.

## Photo recognition

Tiles currently need to be entered through the visual scorer. Photo-based tile recognition is future backlog work.

## Solo practice

The current product scores and teaches British Mahjong. Playing against computer opponents is exploratory future work rather than a current feature.

## Shared physical tile availability across players

Each detailed hand is validated against its own entered tile inventory. The app does not yet use other players’ detailed hands to disable tiles or warn about impossible cross-player shared inventory.

## Hosted reports

Game records are currently printed or saved through the browser. The app does not yet create hosted shareable report URLs.

## House rules and other variants

The scorer implements the British ruleset documented by this project. It does not currently provide configurable support for every house rule or Mahjong variant.

---

# Suggested `/help` page opening

## Help with scoring, hands and game records

Choose what you are trying to do, or search for the situation that has come up at the table.

You do not need to understand the scorer’s internal rules before using it. Enter what you know, and the app will calculate what the evidence safely supports.

Suggested first-level cards:

- **Score a game** — setup, settlement, running balances and corrections
- **Score a hand** — tiles, winning hands, losing hands and partial evidence
- **Why did it score that?** — patterns, fishing, winning tile and rare event questions
- **Save or recover a game** — refresh recovery, start over and print/save
- **Learn the rules** — Gameplay basics, Beginner guide and Special hands
- **Something looks wrong** — troubleshooting and ruleset differences

---

# Maintenance

This file is derived public Help content, not the canonical source of product behaviour.

When product behaviour changes:

1. update `PRODUCT_HANDBOOK.md` first;
2. update `BMJA_RULES_REFERENCE.md` if the underlying rule changed;
3. review this Help content for affected answers;
4. review `FEATURES_CONTENT.md`, `HOW_IT_WORKS_CONTENT.md`, About and marketing copy where relevant;
5. update route metadata/sitemap when `/help` is eventually implemented.

The purpose of this maintenance rule is simple: the Help page should always describe the scorer that actually exists, not the scorer that existed three releases ago.