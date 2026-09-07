# British Mahjong Scorer — Product Handbook

> **Purpose:** canonical product truth for `mahjong.smooks.co.uk`.
>
> This handbook records what the product currently does, how it behaves, what evidence it uses, what it deliberately does not infer, and which ideas remain future work. It is intentionally more exhaustive than any public page.
>
> **Baseline:** shipped application state after merged PR #32 on 7 September 2026.
>
> Public Features, Help, How it works, About and marketing copy should be derived from this handbook rather than becoming independent descriptions of the product.

---

# 1. Product definition

British Mahjong Scorer is a browser-based companion for scoring and learning the British Mahjong ruleset implemented by this project.

It has three connected jobs:

1. **Score accurately** — calculate individual hands and four-player games.
2. **Explain what happened** — show why a score applies, how settlement works and what evidence supports the result.
3. **Teach without interrupting play** — surface useful rules when they become relevant and keep deeper reference material available separately.

The main product principle is:

> **Explain the game. Do not make the player learn the scoring engine.**

The main trust principle is:

> **Never invent missing evidence. Calculate what can be supported, ask only when necessary, and say when something is unknown.**

The product is deliberately **British-Mahjong-specific**, **beginner-first**, **browser-first** and **local-first where practical**.

It is not intended to support every Mahjong ruleset or every house rule.

---

# 2. Product status vocabulary

Every capability in this handbook should use one of these states.

## Shipped

Implemented in the current application and suitable to describe publicly as an available capability.

## Backlog

A defined future feature with an issue/specification, but not available in the current product.

## Exploratory

An idea being investigated. It may never ship and must not be presented as committed functionality.

## Explicitly not current product behaviour

An idea intentionally excluded from an existing feature or MVP. It may be revisited separately but should not be implied by current wording.

---

# 3. Current product surfaces

## `/`

**Status:** Shipped

Action-led homepage.

Primary purpose:

- enter a full game scorer
- enter a standalone hand scorer
- reach learner/reference content
- reach project/about information

The homepage should remain concise. Rich feature, help and marketing content belongs behind it rather than replacing the action-first entry experience.

## `/game`

**Status:** Shipped

Four-player game scorer and canonical game ledger.

## `/hand`

**Status:** Shipped

Standalone detailed hand scorer.

The same detailed hand-scoring model is also used from inside a full game.

## `/gameplay-basics`

**Status:** Shipped

Learner-facing explanation of how British Mahjong is played.

## `/guide`

**Status:** Shipped

Beginner scoring guide.

Alias:

- `/beginner-guide` redirects to `/guide`

## `/special-hands`

**Status:** Shipped

Visual catalogue of supported special hands.

Alias:

- `/special-hand-catalogue` redirects to `/special-hands`

## `/about`

**Status:** Shipped

Project purpose, rules/source transparency, independence statement, artwork attribution, data approach and support information.

## Proposed future content routes

These are **content work**, not yet shipped product routes:

- `/features`
- `/how-it-works`
- `/help`

See `PRODUCT_CONTENT_PLAN.md`.

---

# 4. Product-wide trust rules

These rules apply across the product.

## 4.1 Evidence over assumption

The application should only apply a rule when the entered tiles, entered game context or explicit user answer provide enough evidence.

If necessary evidence is unknown, the scorer should either:

- calculate only the portion that can be proved;
- ask a short relevant question; or
- omit the uncertain bonus/pattern.

It should not silently manufacture a favourable interpretation.

## 4.2 “I’m not sure” is a valid product state

Where the scorer asks for evidence the user may genuinely not know, an uncertainty route should remain available where practical.

Unknown should result in conservative scoring rather than forced guessing.

## 4.3 Manual scores are not scorer-verified hands

A numeric score entered manually remains valid game input.

However:

- the app must not invent tiles;
- the app must not imply the hand was calculated by the detailed scorer;
- the game record should clearly identify it as manually entered;
- detailed scoring evidence should only appear when it actually exists.

## 4.4 Partial evidence is not a complete hand reconstruction

A losing player may enter only part of a hand.

The scorer can calculate directly evidenced scoring elements from that partial entry, but it must not claim that the full hand has been reconstructed.

Whole-hand deductions that depend on unseen tiles are withheld until enough evidence exists.

## 4.5 Canonical data should be reused, not reinterpreted

The same canonical scoring/game information should drive:

- live scoring;
- game settlement;
- hand history;
- explanatory evidence;
- printed/saved game records.

Where stored settlement transactions exist, explanatory wording should use those transactions rather than reverse-engineering them from totals.

Where a detailed hand record exists, the ledger should reuse that record rather than regenerate an imagined hand.

---

# 5. Full game scoring

**Status:** Shipped

Relevant route: `/game`

The full game scorer manages a four-player British Mahjong game hand by hand.

## 5.1 Game setup

The game flow supports:

- four player names;
- player seat-Wind context;
- East;
- prevailing Wind;
- game progression;
- the project's supported game-length/progression behaviour.

The game state becomes the context for settlement and for detailed hand scoring opened from the game.

## 5.2 Per-player score entry

For a given hand, each player's score can come from either:

### Detailed calculated scoring

The player opens the detailed hand scorer and builds enough of the hand to calculate the score.

When applied back to the game, the game can retain structured scoring evidence alongside the numeric score.

### Manual numeric scoring

The player simply enters the score.

This allows the game scorer to remain usable even when:

- a player already knows their score;
- the table chooses not to reconstruct every hand;
- only one or two players want detailed scoring;
- the hand was scored away from the application.

Manual and calculated input can coexist within the same game and within the same confirmed hand.

## 5.3 Winner and draw handling

The game supports confirmed hands with a winner and draw outcomes according to the implemented game model.

The winner context affects settlement.

## 5.4 East and prevailing Wind

The game tracks East and prevailing Wind progression rather than requiring the table to recalculate these externally each hand.

Detailed hand scoring opened from the game receives relevant game context so own/prevailing Wind and event-sensitive scoring can be evaluated where applicable.

## 5.5 Settlement

**Status:** Shipped

After hand scores are known, the game calculates settlement between players according to the implemented British Mahjong rules.

This includes East doubling where applicable.

Settlement is represented as canonical transactions rather than only as final net differences.

That matters because the application can then explain settlement in plain English, for example conceptually:

- Player A paid Player B 320.
- Player C paid Player B 320.
- East paid Player B 640 because the East payment was doubled.

The exact wording is derived from actual stored settlement transactions.

## 5.6 Preview before confirmation

Settlement changes can be previewed before a hand is confirmed.

Unconfirmed live entry should not be treated as historical game record data.

Only confirmed results belong in the canonical hand ledger.

## 5.7 Confirmed hand ledger

**Status:** Shipped

The existing game ledger is the single canonical hand-history surface.

Each confirmed hand can include:

- hand number;
- winner or draw;
- East player;
- prevailing Wind;
- each player's hand score;
- each player's net settlement change;
- each player's running total after the hand;
- settlement explanation;
- detailed hand evidence where detailed scoring was used;
- manual-score labelling where a manual numeric score was used.

Entries use a compact expandable presentation on screen.

The ledger is not a separate report generated later. It grows as the game is played.

## 5.8 Detailed hands inside the ledger

Where a player's score came from the detailed scorer, the stored detailed-hand record can be shown inside the confirmed ledger entry.

Depending on what was actually entered, this may include:

- grouped sets;
- exposed/concealed information;
- loose/special-layout tiles;
- Remaining tiles;
- Flowers and Seasons;
- winning-tile provenance where known;
- scoring breakdown;
- matched patterns/special-hand result;
- fishing result where applicable;
- base points/doubles/final score information.

The ledger must not add tiles that were not entered.

If the hand record contains only partial evidence, it should be presented as partial evidence.

## 5.9 Mixed evidence within one hand

A confirmed game hand can legitimately contain different evidence levels for different players.

Example:

- Jenn uses the detailed scorer and has a complete reconstructed hand;
- SMooks enters only scoring Pungs and Flowers as partial evidence;
- Andy enters a manual number;
- Louise enters a different detailed hand.

The ledger should retain those distinctions rather than pretending all four records were captured identically.

## 5.10 Running balances

**Status:** Shipped

The game maintains running balances after each confirmed hand.

These running totals form part of the hand history and final standings.

## 5.11 Undo/correction

**Status:** Shipped

The game provides a way to undo/correct confirmed game progression rather than requiring the whole game to be restarted for an ordinary scoring mistake.

Corrections should preserve the principle that current balances and progression derive from canonical confirmed history.

## 5.12 Game completion

**Status:** Shipped

When the game reaches its implemented completion condition, the same game page presents the finished state.

The completed state includes:

- Game complete;
- number of confirmed hands played;
- ranked final standings;
- final balances;
- winner.

No separate report-generation workflow is required.

---

# 6. Local game persistence and recovery

**Status:** Shipped

Relevant implementation: issue #14 / PR #23.

## 6.1 User problem

A browser refresh, accidental tab closure or browser restart should not casually destroy an in-progress game.

## 6.2 Current behaviour

The application stores a versioned snapshot of relevant canonical game state in browser `localStorage`.

This allows recovery on the same browser/device without requiring an account or server-side game history.

## 6.3 Persisted information

Persisted state includes relevant canonical game information such as:

- game setup/player information;
- progression context;
- confirmed hand ledger/history;
- running balances;
- detailed scoring records already applied to players;
- current recoverable round/draft information supported by the implementation.

Derived/transient presentation state should not become the source of truth merely because it was visible on screen.

## 6.4 What local recovery means

Local recovery means:

- the data is stored in that browser's local storage;
- refresh can recover the game;
- closing/reopening can recover the game;
- browser restart can recover the game.

It does **not** mean:

- account-based cloud history;
- cross-device sync;
- remote backup;
- shared multiplayer state;
- hosted reports.

## 6.5 Defensive loading

Malformed or incompatible saved snapshots should not prevent the application from loading.

The persistence model is versioned so incompatible state can be rejected/cleared rather than being trusted blindly.

## 6.6 Start over / new game

An intentional reset or new-game action clears/replaces the saved in-progress state so an obsolete game does not unexpectedly return later.

---

# 7. Standalone and in-game detailed hand scorer

**Status:** Shipped

Relevant route: `/hand`, plus the hand scorer opened from `/game`.

The detailed scorer uses the same underlying hand/scoring model whether used independently or as part of a game.

## 7.1 Core user model

The player describes:

- relevant game status;
- grouped sets where appropriate;
- Remaining tiles where appropriate;
- Flowers/Seasons;
- irregular/special layouts where normal grouping does not fit;
- winning method and limited event information where required;
- winning tile provenance where required and known.

The scoring engine then calculates only what the evidence supports.

## 7.2 Standard grouped sets

Supported structural group types include:

- Pung;
- Chow;
- Kong;
- Pair.

The UI is beginner-oriented rather than requiring the user to encode the hand in notation.

## 7.3 Exposed and concealed information

Sets retain exposed/concealed information where that distinction is relevant to scoring.

This evidence can influence points, doubles and special-hand conditions.

## 7.4 Chow constraints

The scorer enforces the project's implemented ordinary-hand Chow restrictions rather than allowing structurally impossible/unsupported combinations without warning.

## 7.5 Tile copy limits

The application prevents or rejects impossible entered inventories such as more than four copies of the same ordinary playing tile across the entered hand evidence.

Copy checks cover relevant entered sources including groups and Remaining tiles.

The application must distinguish an impossible inventory from merely incomplete evidence.

## 7.6 Kongs and hand counts

Kongs contain four physical tiles but occupy one structural group slot.

The scorer's validation/counting logic accounts for this distinction.

This prevents a valid hand containing a Kong from being rejected simply because its physical tile count is larger than the structural base count.

## 7.7 Flowers and Seasons are bonus tiles

Flowers and Seasons are handled separately from the ordinary structural 13/14 playing-tile base.

They do not consume structural playing-tile slots.

Their relationship to seat Wind is surfaced in the learner/scorer experience.

---

# 8. Winning hands

**Status:** Shipped

## 8.1 Complete winning-hand evidence

A detailed winning hand normally requires enough evidence for the scorer to validate and calculate the completed hand.

The scorer can then apply:

- base points;
- relevant doubles;
- winning-method effects;
- whole-hand patterns;
- supported special hands;
- relevant event-based specials;
- limit handling according to the implemented rules.

## 8.2 Winning method

The scorer records the implemented winning-method context rather than treating every Mah Jong as identical.

Relevant methods include the project's supported draw/claim contexts, such as ordinary discard/draw and specific replacement/last-tile/robbing/event circumstances.

The method can be required evidence for bonuses or special hands.

## 8.3 Winning-tile provenance

**Status:** Shipped

Relevant implementation: issue #3 / PR #13.

Some rules cannot be applied safely merely from the final 14-tile layout. They depend on which tile actually completed Mah Jong and, in grouped hands, which set/pair it completed.

For relevant winning hands, the UI can ask:

> Which tile completed Mah Jong?

The user selects from a reconstruction of the entered hand rather than a long detached dropdown.

The model can retain:

- winning tile identity;
- completed group/set where relevant;
- existing winning method as the source/claim context.

## 8.4 Unknown winning tile

If the user does not know which tile completed the hand, they can use an uncertainty path.

The scorer should then avoid applying winning-tile-sensitive exceptions that cannot be proved.

This may reduce the score compared with a fully evidenced hand; that is deliberate conservative behaviour.

## 8.5 Provenance invalidation

If the hand is edited after the winning tile was selected, stored provenance should be revalidated/cleared where it no longer matches the edited hand rather than remaining as stale evidence.

---

# 9. Losing hands and unfinished hands

**Status:** Shipped

Relevant implementation: issue #15, PR #22 and PR #30.

This is a key product capability.

## 9.1 Actual Mahjong structural count

A non-winning hand has a 13-tile structural playing base, with represented Kong fourth tiles handled separately and Flowers/Seasons excluded from this structural count.

## 9.2 Remaining tiles

A losing hand does not need to be forced into fake completed groups.

The scorer supports arbitrary **Remaining tiles** for ordinary loose/uncompleted tile evidence.

This allows realistic unfinished hands containing unrelated leftovers and partial shapes.

## 9.3 Partial evidence

A losing player may enter **fewer than all 13 structural playing tiles** and still receive a valid score for directly evidenced scoring elements.

Example:

A player might enter only:

- a Red Dragon Pung;
- a concealed 9 Circles Pung;
- an own-Wind pair;
- Flower 3.

They do not have to reconstruct every unrelated loose tile merely to score those known components.

## 9.4 What partial evidence can score

When directly entered and independently scoreable, partial evidence can support items such as:

- completed scoring Pungs;
- completed Kongs;
- relevant pairs;
- bonus tiles;
- other rule components whose truth does not depend on unseen tiles.

## 9.5 What partial evidence cannot safely infer

When fewer than the complete structural tiles are present, the scorer withholds deductions that depend on the unseen remainder.

This includes, where applicable:

- whole-hand suit/honour composition;
- Purity/one-suit conclusions;
- no-Chow/all-Pung-style whole-hand conclusions;
- special-hand completion claims requiring the entire layout;
- special fishing detection requiring complete one-away evidence;
- other whole-hand properties that unseen tiles could change.

## 9.6 Completeness states

The conceptual distinction is:

### Partial

Fewer than the full structural tile count has been entered for a non-winning hand.

Valid for scoring directly evidenced components.

### Complete evidence

All required structural playing tiles for the non-winning hand have been entered.

The scorer may run whole-hand and fishing analysis supported by that complete evidence.

### Invalid

The evidence describes an impossible/contradictory state, for example:

- too many structural tiles;
- more than four copies of the same playing tile;
- other structural contradictions caught by validation.

Incomplete is not the same thing as invalid.

## 9.7 User messaging

Partial hand entry should be presented as a legitimate state, conceptually:

> **Partial hand — scoring entered sets and bonus tiles.**
>
> Add all remaining tiles if you want the scorer to check whole-hand patterns or fishing.

The user should not be blocked merely because they do not care to enter irrelevant loose tiles.

---

# 10. Irregular and special layouts

**Status:** Shipped

Some supported special hands do not fit naturally into the ordinary grouped-set builder.

The scorer provides a secondary **Special layout** / irregular layout route for those cases.

This route is deliberately less prominent than ordinary sets because most hands should use the normal beginner flow.

Loose tile evidence is entered directly and used by the supported special-hand detectors.

The scorer should not require a beginner to identify the special hand's name merely to choose this route.

---

# 11. Ordinary scoring

**Status:** Shipped

The scoring engine calculates the implemented British Mahjong scoring rules from the entered evidence.

The public product need not expose its internal rule-engine architecture, but the score breakdown should make the major components visible.

This includes relevant combinations of:

- base/set/pair points;
- bonus points where applicable;
- doubles;
- winning-method effects;
- whole-hand patterns;
- special-hand/fishing values;
- applicable limits.

The engineering rule source of truth is `BMJA_RULES_REFERENCE.md`, with implementation/testing detail in the scoring code and `SCORING_AUDIT.md`.

The product handbook describes behaviour; it does not replace those rule definitions.

---

# 12. Contextual detected patterns

**Status:** Shipped

Relevant implementation: issue #20 / PR #25.

The working scorer should not show a permanent catalogue of every special hand/pattern during every scoring session.

Instead it surfaces patterns that actually apply to the entered evidence.

Examples may include ordinary scoring patterns, relevant double rules, special-hand matches and fishing matches.

A contextual callout can communicate:

- pattern name;
- score effect;
- short plain-English explanation.

The purpose is to answer:

> Why did my score just change?

The UI derives these explanations from existing structured scoring outputs rather than running a second independent detector solely for presentation.

The complete browse-all catalogue remains on `/special-hands`.

---

# 13. Special hands

**Status:** Shipped for the set currently implemented by the project.

The scorer supports the project's documented BMJA-style special-hand catalogue, including the layout-based and event-based specials implemented through issues #1–#4.

## 13.1 Product principle

The user should generally not need to know the special-hand name before the scorer can recognise it.

Where the entered tile evidence and game context are sufficient, detection is automatic.

## 13.2 Layout-based specials

Implemented work includes the project's supported final-layout special hands, including those added in issue #1 such as:

- Knitting;
- Triple Knitting;
- Imperial Jade;
- Gates of Heaven;
- Wriggling Snake;

alongside the other special hands already present in the catalogue/rules implementation.

For the exact current list and values, use `BMJA_RULES_REFERENCE.md` and `SPECIAL_HAND_CATALOGUE_CONTENT.md` rather than duplicating rule-value tables here.

## 13.3 Winning-tile-sensitive specials

Certain special-hand exceptions depend on how the final tile completed the hand.

Winning-tile provenance supports those decisions where required.

If provenance is unknown, the scorer does not invent it.

---

# 14. Special-hand fishing

**Status:** Shipped

Relevant implementation: issue #2 / PR #12.

## 14.1 User problem

A player who is one tile from a special hand should not have to know which named special they are fishing for before the scorer can calculate it.

## 14.2 Detection model

When complete non-winning evidence supports fishing analysis, the scorer can:

- consider legal additional playing tiles that would not create an impossible fifth copy;
- test the resulting completion against supported special-hand patterns;
- identify possible completing tiles;
- handle overlapping matches;
- apply the highest lawful fishing result supported by the rules.

## 14.3 Multiple possible waits

A hand may be completable by more than one tile.

The scorer can surface multiple possible completing tiles where supported by the detection result.

## 14.4 Multiple matching specials

A candidate completion can potentially satisfy more than one supported pattern.

The calculation should not depend on arbitrary detector order. It evaluates lawful matches and uses the appropriate highest result according to the implemented rules.

## 14.5 Partial evidence and fishing

Special-hand fishing analysis requires sufficient complete evidence.

A partial losing-hand entry does not trigger fishing claims when unseen tiles could change the answer.

---

# 15. Event-based special hands

**Status:** Shipped

Relevant implementation: issue #4 / PR #16.

The app deliberately does **not** maintain a complete turn-by-turn game event log merely to score a small number of event-sensitive specials.

Instead it uses minimum necessary context and asks short conditional questions only in plausible cases.

Implemented event-based work includes:

- Heaven's Blessing;
- Earth's Blessing;
- Gathering the Plum Blossom from the Roof;
- Plucking the Moon from the Bottom of the Sea;
- Twofold Fortune.

## 15.1 Infer when possible

Examples of the product approach:

- East + the specific original-deal winning method can support Heaven's Blessing without a second redundant question;
- replacement/loose-tile win + 5 Circles can support Gathering the Plum Blossom from the Roof;
- last-wall-tile win + 1 Circles can support Plucking the Moon from the Bottom of the Sea.

## 15.2 Ask only when necessary

Where a required event fact cannot be inferred, the app asks only in the small subset of hands where it could matter.

Examples include questions about:

- whether a non-East discard win came from East's first discard;
- the specific Kong/replacement sequence required for Twofold Fortune.

## 15.3 Unknown answers

If the user does not know the event fact, the scorer omits the unsupported special rather than assuming it happened.

---

# 16. Flowers and Seasons

**Status:** Shipped

Flowers and Seasons are represented visually and separately from structural playing tiles.

The scorer/guide communicates their seat-Wind relationships rather than expecting a beginner to memorise hidden mappings.

Current behaviour includes the project's implemented own Flower/own Season and complete Flower/Season set scoring logic.

For exact scoring values, use the engineering rules reference rather than this product handbook.

---

# 17. Manual numeric score fallback

**Status:** Shipped

A user can enter a numeric hand score without building the tiles.

This is important for table usability.

## Product behaviour

Manual entry:

- is accepted as a score for settlement/game progression;
- does not create a fictional detailed hand;
- does not produce a detailed rule breakdown that was never calculated;
- is labelled as manually entered in historical evidence where relevant.

The product should never say or imply that a manually typed score has been verified against tiles.

---

# 18. Leaving and navigation

**Status:** Shipped

Relevant implementation: issue #21 / PR #24.

The major routes share a consistent site-level header/navigation pattern.

## 18.1 Global navigation

The shared menu provides access to the main product and learner destinations.

The logo/site title returns home.

## 18.2 Standalone hand exit

A standalone hand scorer has an obvious way to leave.

If leaving would discard entered hand work, the user should be warned rather than silently losing it.

## 18.3 In-game hand exit

A detailed scorer opened from a game has a clear return/cancel path.

Returning without applying a score must not quietly apply unfinished changes to the game.

## 18.4 Full game navigation

Game persistence reduces the risk of accidental page navigation destroying a game, while deliberate reset/start-over remains explicit.

---

# 19. Mobile hand entry

**Status:** Shipped

Relevant implementation: PR #28 after the earlier mobile experiment in PR #27.

The current mobile design keeps content in normal document flow rather than relying on a large permanently fixed tile tray.

Key mobile behaviour includes:

- game status presented before tile arrangement where relevant;
- compact tile picker inside the currently active destination;
- the picker can move between active sets, Remaining tiles and Special layout;
- mobile-friendly touch interaction;
- normal page scrolling to later scoring/actions/footer;
- desktop/tablet layout retained separately.

The mobile UX should remain a table tool, not become a shrunken desktop form.

---

# 20. Game ledger as printable/savable record

**Status:** Shipped

Relevant implementation: issue #6 / PR #32.

This is an important product architecture decision.

The app does **not** generate a separate reconstructed report from a parallel data model for the current product.

Instead:

> **The canonical game ledger is enriched enough to tell the story of the game, and the browser prints/saves that record.**

## 20.1 Print / Save game

The user can invoke browser print/save behaviour from the game record.

The browser may then:

- print physically;
- Save as PDF;
- use other print destinations supported by the user's device/browser.

## 20.2 Full game record

**Status:** Shipped

Full mode includes the detailed confirmed history available in the ledger, including detailed hand/evidence content where it was actually recorded.

Collapsed on-screen ledger entries can be temporarily expanded for the print output and then restored to their prior screen state.

## 20.3 Game summary

**Status:** Shipped

Summary mode provides a more compact record focused on:

- standings;
- hand-by-hand results;
- scores/changes/running totals;
- confirmed game history.

It deliberately excludes detailed tile/evidence cards even if a user happened to have them expanded on screen.

## 20.4 Confirmed data only

The print record should contain confirmed history, not an unconfirmed live settlement preview or unfinished score-entry controls.

## 20.5 Completed vs in-progress records

Completed games show ranked final standings.

An in-progress printed record reflects current confirmed standings/history rather than pretending the game is complete.

## 20.6 Print presentation

Print styling is designed to:

- hide interactive-only controls/navigation;
- expose relevant ledger details;
- keep tile evidence readable;
- allow detailed player records to flow across pages;
- avoid unnecessary page-break fragmentation where practical;
- remain understandable in greyscale;
- include quiet project/artwork attribution/support information.

## 20.7 What is not part of the current print feature

The current product does not require:

- custom PDF generation;
- hosted report URLs;
- account-based report storage;
- email delivery;
- screenshot/PNG capture;
- native share-sheet report integration;
- cross-game analytics;
- AI-generated game commentary.

These must not be implied by marketing for the current print/save feature.

---

# 21. Learner content

**Status:** Shipped

The learner/reference pages are part of the product rather than detached documentation.

## 21.1 Gameplay basics

Explains how to play at a practical beginner level.

Canonical source draft:

- `docs/GAMEPLAY_BASICS_CONTENT.md`

## 21.2 Beginner scoring guide

Explains the scoring system progressively rather than presenting the full rule catalogue at once.

Canonical source draft:

- `docs/BEGINNER_GUIDE_CONTENT.md`

## 21.3 Special-hand catalogue

Provides a browseable visual reference to supported special hands without forcing that catalogue into the active scorer.

Canonical source draft:

- `docs/SPECIAL_HAND_CATALOGUE_CONTENT.md`

## 21.4 About / trust content

Explains:

- project purpose;
- independent status;
- rule sources;
- accuracy/transparency approach;
- no-account/local-first design;
- artwork/licensing;
- open development repository;
- support route.

Canonical source draft:

- `docs/ABOUT_THIS_PROJECT_CONTENT.md`

---

# 22. Rules, sourcing and independence

**Status:** Shipped product position

The project implements the British Mahjong rules used by this scorer, based primarily on the published material referenced in `BMJA_RULES_REFERENCE.md`.

## 22.1 Independent project

British Mahjong Scorer is an independent project.

It must not be described as:

- an official BMJA app;
- BMJA-endorsed unless that ever becomes factually true;
- authoritative for every British Mahjong group/house rule.

## 22.2 Public wording

Public rule explanations are project-owned paraphrases rather than substantial reproduction of source text.

## 22.3 Engineering transparency

The project maintains:

- explicit rule/source references;
- interpretation notes;
- known ambiguity notes;
- test/fixture mapping;
- a scoring audit.

This helps make disagreements inspectable rather than hiding rule logic inside opaque code.

## 22.4 If the scorer and a table disagree

The product should encourage inspection of the score breakdown and relevant rule rather than asserting infallibility.

Possible reasons include:

- different house rules;
- different Mahjong variant;
- missing/incorrect entered evidence;
- a project interpretation;
- an implementation defect.

The application should make the relevant scoring reason visible enough that the disagreement can be located.

---

# 23. Data and privacy model

**Status:** Shipped current architecture

The public scorer is a static browser application.

Ordinary scoring does not require a user account or backend database.

## 23.1 Local saved game data

In-progress game recovery uses browser local storage.

This data remains associated with the relevant browser/device unless the user/browser clears it.

## 23.2 No account requirement

The user can score a hand or game without:

- creating an account;
- signing in;
- creating a cloud profile.

## 23.3 No claim of cloud backup

Local recovery must not be marketed as cloud storage or synchronisation.

## 23.4 Static hosting

The site is deployed as a static web application on Cloudflare Pages.

A backend is not required for ordinary scoring and learner use.

---

# 24. Accessibility and interaction principles

The product should continue to favour:

- ordinary semantic controls;
- keyboard-accessible navigation;
- accessible labels for tile images/controls;
- comfortable mobile touch targets;
- meaningful headings;
- warnings before destructive navigation where work would be lost;
- text explanations rather than colour-only meaning;
- printable records that remain understandable in greyscale.

Accessibility is part of product quality, not a separate optional feature claim.

---

# 25. SEO and public discoverability

**Status:** Shipped engineering readiness

Relevant implementation: issue #29 / PR #31.

The production build includes crawler-visible route-specific metadata for canonical public routes.

Current canonical routes include:

- `/`
- `/game`
- `/hand`
- `/gameplay-basics`
- `/guide`
- `/special-hands`
- `/about`

The build includes relevant:

- titles;
- descriptions;
- canonical links;
- Open Graph/Twitter metadata;
- sitemap;
- robots metadata/files;
- social preview image;
- minimal truthful structured data.

Operational search-engine submission/indexing remains an owner action and does not guarantee ranking.

If `/features`, `/help` or `/how-it-works` are added later, SEO files/metadata should be updated as part of that implementation.

---

# 26. Artwork and licensing

**Status:** Shipped

Mahjong tile artwork is sourced from the project's pinned copy of the Regular SVG set from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, under CC BY 4.0.

The artwork is reused across:

- tile entry;
- learner guides;
- special-hand examples;
- detailed ledger evidence;
- printed game records where relevant.

Using one visual language reduces inconsistency and avoids hot-link dependence during play.

See:

- `THIRD_PARTY_NOTICES.md`
- `docs/TILE_ASSET_DECISION.md`

The project source code is MIT licensed as recorded in `LICENSE`, while original written content retains the separate copyright position described in the README unless explicitly stated otherwise.

---

# 27. Support model

**Status:** Shipped

The project includes a quiet Buy Me a Coffee support route.

Support messaging should remain secondary to gameplay and learning.

It should not:

- interrupt active scoring;
- create a payment wall;
- imply payment is required to use core scoring/learning functions.

The support link may appear in appropriate low-friction locations such as:

- About;
- footer;
- bottom of finished/printed game record.

---

# 28. Product differentiation / USP truth bank

These are **truthful current capability statements**, not claims of market uniqueness.

They may be reused in public marketing copy after tone/editing.

## Built specifically around this British Mahjong ruleset

The product is not trying to be a universal Mahjong calculator.

Its scoring, special hands, fishing, settlement and learner content are built around the British rules implemented by the project.

## Explains the score, not only the number

The user can see relevant point/double/pattern reasoning and game settlement rather than receiving a bare total.

## You do not need to know the special-hand name first

Supported layout/fishing patterns are detected from entered evidence where sufficient.

## Partial losing hands are legitimate input

A player can enter only known scoring evidence rather than reconstructing every irrelevant loose tile.

## Unknown means unknown

The scorer supports conservative uncertainty rather than forcing the user to guess event/provenance facts.

## Detailed scoring and the game record are connected

A hand scored in detail can retain its evidence when applied to a game and later appear in the same canonical ledger/print record.

## Refresh recovery without an account

An in-progress game can recover locally after ordinary browser accidents without requiring sign-up.

## The saved game record is the same history used during play

The product enriches and prints the canonical ledger rather than constructing a second narrative report from scratch.

## Beginner-first without hiding depth

The working scorer surfaces relevant information contextually, while deeper learner/reference material is available separately.

## Manual fallback remains available

The table can type a score when detailed reconstruction is unnecessary, while the product keeps that evidence distinction explicit.

---

# 29. Comprehensive “what if?” truth bank

This section records the canonical answer behind future Help/FAQ content.

## What if I only know part of a losing hand?

Enter the scoring sets/bonus tiles you know.

The scorer can calculate directly evidenced components and label the hand as partial.

It will not infer whole-hand patterns or special fishing that depend on unseen tiles.

## What if I only want to enter the sets that score?

That is supported for a losing hand.

You do not have to enter every irrelevant loose tile merely to receive a score for completed scoring evidence.

## What if I enter all 13 structural tiles for a losing hand?

The evidence becomes complete enough for the scorer to run the whole-hand/fishing analysis supported by the implementation.

## What if I enter more than the legal structural count?

The hand becomes invalid rather than being treated as merely partial.

## What if I enter five copies of the same ordinary tile?

The scorer rejects/warns about the impossible tile inventory.

## What if I have a Kong and the physical tile count looks too high?

The scorer understands that a Kong has four physical tiles while occupying one structural group slot.

## What if I have Flowers or Seasons?

Enter them separately as bonus tiles.

They are not counted as part of the normal structural 13/14 playing-tile base.

## What if my hand does not fit normal Pungs/Chows/Kongs/Pairs?

Use the Special layout route for an irregular supported layout.

It is intentionally secondary because ordinary hands should use standard sets.

## What if I think I am fishing for a special hand but do not know its name?

Enter the complete non-winning tile evidence.

The scorer can detect supported one-tile-away special patterns and possible completing tiles automatically.

## What if several special fishing patterns match?

The scorer evaluates supported lawful matches rather than relying on the order in which detectors happen to run and applies the appropriate highest result.

## What if I do not know which tile completed Mah Jong?

Use the uncertainty route.

The scorer will avoid winning-tile-sensitive exceptions it cannot prove.

## What if I edit the hand after choosing the winning tile?

Winning-tile provenance should be revalidated/cleared where the selected evidence is no longer valid.

## What if I do not know whether a rare event-based special happened?

Answer that you are not sure where the option is provided.

The scorer omits the unsupported event special rather than assuming it occurred.

## What if a rare special can be inferred from information already entered?

The scorer should infer it rather than asking the same fact again.

## What if I already know the numeric score?

Enter it manually.

It can be used for settlement/game progression, but the record will not pretend that a detailed hand was captured or verified.

## What if only one player uses detailed scoring?

That is fine.

Detailed and manual scores can coexist. The ledger preserves the actual evidence available for each player.

## What if I refresh during a game?

The game should recover from the local saved snapshot on the same browser/device.

## What if I close the browser and return later?

The most recent compatible locally saved in-progress game can be recovered on the same browser/device.

## What if the saved browser data is malformed or from an incompatible schema?

It should not crash the application. Invalid/incompatible persisted state is rejected/cleared defensively.

## What if I want to start again completely?

Use the explicit Start over/new-game/clear action so the old saved snapshot does not reappear.

## What if I accidentally leave a standalone hand?

If entered work would be lost, the application should warn before discarding it.

## What if I cancel a detailed scorer opened from a game?

Return to the game without applying that unfinished detailed score.

## What if I want to save the game?

Use Print / Save game and the browser print flow.

A browser can normally Save as PDF as one of its print destinations.

## What if I want every captured tile and scoring detail in the saved record?

Use **Full game record**.

It exposes the detailed confirmed ledger evidence available.

## What if I just want the standings and hand-by-hand results?

Use **Game summary**.

It omits detailed hand cards/tiles/evidence and remains focused on confirmed game results.

## What if a hand entry is collapsed on screen when I print Full game record?

The print flow temporarily exposes the necessary confirmed ledger detail and then restores the prior open/closed screen state.

## What if the game is not finished but I want a record so far?

The print system can represent current confirmed game history/standings without falsely presenting final completed-game standings.

## What if the scorer and our table disagree?

Inspect the scoring breakdown and compare the relevant rule.

Possible causes include different house rules, different ruleset expectations, missing/incorrect entered evidence, a project interpretation or an implementation defect.

## What if our group plays a different Mahjong variant?

This scorer is not intended to be a universal rules engine. It targets the British ruleset documented by this project.

## What if I want the game on another device?

Current local recovery is not cross-device sync.

There is no account/cloud game sync in the current product.

## What if I want a shareable web link to the report?

Hosted/shareable report URLs are not part of the current print/save feature.

## What if I want to photograph my tiles and have the app recognise them?

Photo-based recognition is backlog work (#8), not current functionality.

## What if I want to practise alone against computer players?

Solo practice is exploratory future work (#17), not current functionality.

## What if multiple detailed hands at the same table imply impossible shared tile usage?

Cross-player shared physical tile-inventory warnings are backlog work (#7), not current functionality.

---

# 30. Current feature inventory

This inventory is suitable as the source for future Features copy.

## Game scoring — shipped

- four-player game scoring;
- player names;
- seat Winds;
- East tracking;
- prevailing-Wind/game progression;
- winner/draw handling;
- manual or detailed player score entry;
- settlement calculation;
- East doubling;
- stored settlement transactions;
- plain-English payment explanation;
- settlement preview before confirmation;
- confirmed hand ledger;
- per-player hand scores;
- per-player net changes;
- running totals;
- detailed scoring evidence in ledger where available;
- manual-score distinction;
- undo/correction flow;
- local recovery;
- completed-game ranked standings;
- Full game record print/save;
- Game summary print/save.

## Hand scoring — shipped

- visual tile entry;
- Pungs;
- Chows;
- Kongs;
- pairs;
- exposed/concealed state;
- Remaining tiles;
- arbitrary unfinished losing-hand shapes;
- partial losing-hand evidence;
- complete losing-hand evidence;
- structural/physical Kong counting;
- Flowers;
- Seasons;
- bonus-tile/seat-Wind relationships;
- copy-limit validation;
- ordinary points/doubles;
- whole-hand pattern detection where evidence is complete;
- contextual pattern explanations;
- irregular/special layout entry;
- supported special-hand detection;
- automatic special fishing;
- multiple completing tiles;
- overlapping special fishing handling;
- winning method;
- winning-tile provenance;
- conservative unknown provenance;
- minimum-context event-special handling;
- conditional event questions;
- conservative unknown event answers;
- manual numeric scoring.

## Learning/reference — shipped

- gameplay basics;
- beginner scoring guide;
- tile-family explanations;
- major/minor explanation;
- Flower/Season guidance;
- visual special-hand catalogue;
- contextual scorer explanations;
- About/project transparency;
- engineering rules reference;
- source/interpretation tracking.

## Product experience — shipped

- action-led homepage;
- shared navigation;
- safe scorer exits;
- mobile hand-entry refinements;
- accessible tile labels/semantic controls where implemented;
- no account required;
- local browser recovery;
- static deployment;
- route-specific SEO metadata;
- sitemap/robots/social metadata;
- quiet support link.

---

# 31. Backlog and exploratory product boundary

These items must **not** be presented as current features.

## #7 Shared tile inventory and availability warnings

**Status:** Backlog

Future intent:

- consider detailed hands already entered for other players in the same hand;
- warn when another detailed hand would require impossible shared physical tile counts;
- possibly disable choices that are definitely unavailable.

Manual numeric scores would remain composition-unknown.

## #8 Photo-based tile recognition

**Status:** Backlog

Future intent:

- optional photo input;
- preferably browser-side recognition using an existing model;
- feed recognition results into the same canonical hand/correction flow;
- keep images client-side where practical;
- Flowers/Seasons may need separate handling depending on model support.

Not current product behaviour.

## #17 Lightweight solo practice mode

**Status:** Exploratory

Future concept:

- one human against three browser-based deterministic bots;
- reuse existing tile/scoring/game models;
- client-side only for initial experiment;
- no ML/LLM requirement;
- no account/backend/WebSocket requirement for the first experiment.

The concept is not a committed current feature.

## Account/cloud sync

**Status:** Not current product

No current commitment to:

- accounts;
- login-based game history;
- cross-device sync;
- cloud backup.

## Hosted/shareable game reports

**Status:** Not current product

Current save behaviour is browser print/Save as PDF from the canonical ledger.

## Cross-game analytics

**Status:** Not current product

No current player/game-history analytics dashboard.

## AI commentary or scoring

**Status:** Not current product

The scoring engine is deterministic rules logic.

Do not market it as “AI-powered”.

---

# 32. Explicit non-goals and things not to imply

Current public content must not imply:

- official BMJA status or endorsement;
- compatibility with all Mahjong variants;
- support for every house rule;
- perfect/guaranteed scoring accuracy;
- cloud account storage;
- cross-device game sync;
- online multiplayer;
- solo computer opponents;
- photo tile recognition;
- automatic shared-table physical tile inventory;
- hosted report links;
- built-in email report delivery;
- native image/screenshot export;
- cross-game statistics;
- AI-generated explanations;
- AI scoring;
- scorer verification of manually typed numeric scores;
- complete reconstruction when only partial hand evidence was entered.

---

# 33. How the product works — canonical short explanation

This section is the source for future `/how-it-works` copy.

## Step 1 — Give the scorer the context it actually needs

For a standalone hand, choose the relevant hand/game status.

Inside a full game, much of that context can already come from the game.

## Step 2 — Enter the hand at the level of detail you need

For a winning hand, build the completed hand.

For a losing hand, enter all tiles if you want whole-hand/fishing analysis, or only the scoring evidence you care about if a partial score is sufficient.

You can also type a numeric score instead when detailed reconstruction is unnecessary.

## Step 3 — The scorer applies only rules supported by the evidence

It calculates points/doubles/patterns and uses whole-hand analysis only when the entered evidence is complete enough.

## Step 4 — The scorer asks only for facts it cannot safely infer

Winning-tile and rare event questions appear only when they can affect the result.

“I’m not sure” reduces certainty rather than inventing an answer.

## Step 5 — Relevant scoring reasons are shown

Detected patterns and scoring components explain why the score changed.

## Step 6 — In a game, the result becomes settlement and history

Player scores feed the canonical settlement calculation and confirmed ledger.

## Step 7 — The ledger becomes the game record

At any appropriate point, the same confirmed history can be printed/saved as either a compact summary or a full detailed record.

---

# 34. Public content maintenance rules

When a product behaviour changes, maintain sources in this order.

## 1. Rule truth

If scoring rules changed:

- update scoring implementation/tests;
- update `BMJA_RULES_REFERENCE.md`;
- update `SCORING_AUDIT.md` where relevant.

## 2. Product truth

Update this handbook to reflect the behaviour users now experience.

## 3. Learner/public content

Update relevant content sources:

- `HELP_CONTENT.md`;
- `FEATURES_CONTENT.md`;
- `HOW_IT_WORKS_CONTENT.md`;
- `ABOUT_THIS_PROJECT_CONTENT.md`;
- `BEGINNER_GUIDE_CONTENT.md`;
- `GAMEPLAY_BASICS_CONTENT.md`;
- `SPECIAL_HAND_CATALOGUE_CONTENT.md`;
- `MARKETING_COPY_BANK.md`.

## 4. Public route metadata

If a new public canonical page ships, update:

- route metadata;
- sitemap;
- canonical handling;
- social metadata where relevant;
- navigation/footer links where appropriate.

Recommended PR checklist item:

> **Content impact checked:** Product Handbook, Help, Features, How it works, About, learner guides and rules reference reviewed where relevant.

---

# 35. Issue / PR implementation map

This is a product-level map, not an exhaustive commit log.

| Area | Issue / PR | Product result |
|---|---|---|
| Missing layout special hands | #1 / PR #11 | Complete the currently targeted layout-based special-hand set |
| Automatic special fishing | #2 / PR #12 | Detect special fishing and completing tiles without requiring the user to name the special |
| Winning-tile provenance | #3 / PR #13 | Capture final-tile evidence for rules that genuinely depend on it |
| Event-based specials | #4 / PR #16 | Add five event-sensitive specials using minimal context/questions |
| Learner/rules reference | #5 / PR #18 | Beginner guide, special-hand catalogue, rule/test mapping, tile artwork decision |
| Canonical printable game record | #6 / PR #32 | Enriched ledger plus Full/Summary browser print/save modes |
| Shared tile inventory | #7 | Backlog |
| Photo tile recognition | #8 | Backlog |
| Local game recovery | #14 / PR #23 | Versioned localStorage recovery without accounts |
| Unfinished/partial losing hands | #15 / PR #22 + PR #30 | Remaining tiles, correct counting, partial-evidence scoring |
| Solo practice | #17 | Exploratory |
| Homepage/product entry | PR #19 | Action-led home and learner routes |
| Contextual pattern callouts | #20 / PR #25 | Show only relevant detected scoring patterns in working scorer |
| Navigation/safe exits | #21 / PR #24 | Shared site navigation and safer scorer leaving behaviour |
| Mobile hand-scorer UX | PR #28 | In-flow mobile picker and phone usability refinements |
| README current-product refresh | PR #26 | Repository front door reflects modern product |
| SEO/indexing readiness | #29 / PR #31 | Static route metadata, redirects, sitemap, robots, social preview |

---

# 36. Canonical product claims allowed today

These statements are safe foundations for public copy when phrased appropriately:

- British Mahjong Scorer scores complete four-player games and individual hands.
- It can calculate detailed hand scores from visual tile entry.
- It can also accept manually entered numeric scores.
- Detailed and manual scores can coexist in the same game.
- It calculates settlement and East doubling according to the implemented rules.
- It keeps a hand-by-hand ledger with running balances.
- It explains stored settlement transactions in plain English.
- It supports partial scoring evidence for unfinished losing hands.
- It distinguishes partial evidence from complete evidence.
- It automatically detects supported special hands where the evidence is sufficient.
- It automatically detects supported special-hand fishing from complete non-winning evidence.
- It can ask for winning-tile/event facts only when they matter.
- It supports uncertainty/conservative scoring where required facts are unknown.
- It provides gameplay, scoring and special-hand learner guides.
- It can recover an in-progress game locally after refresh/browser restart on the same browser/device.
- It does not require an account for ordinary scoring.
- Its final game record comes from the same canonical ledger used during play.
- It offers Full game record and Game summary browser print/save modes.
- It is an independent project and not an official BMJA publication.

---

# 37. Claims that require qualification

## “Accurate”

Prefer:

- “built against the British rules documented by this project”;
- “scoring rules are explicit and tested”;
- “shows the scoring breakdown so the result can be checked”.

Avoid:

- “100% accurate”;
- “guaranteed correct”.

## “Private”

Prefer:

- “no account required”;
- “in-progress recovery is stored locally in your browser”;
- “ordinary scoring does not require cloud game-history storage”.

Avoid broad privacy claims that would require a full site/network/privacy audit beyond the scoring architecture.

## “Automatic”

It is fair to describe detection as automatic where the scorer actually derives a result from entered evidence.

Do not imply the app can infer facts that it explicitly asks the user to provide.

## “Complete hand scoring”

Detailed scoring is complete only to the extent the required evidence is entered and supported by the implemented rules.

Manual numeric input is not detailed scorer verification.

---

# 38. Product voice principles

Public product content should be:

- plain English;
- calm;
- specific;
- useful at the table;
- beginner-friendly without being patronising;
- transparent about uncertainty;
- concrete about what is automated and what is entered;
- independent rather than authority-posturing;
- restrained about marketing claims.

Prefer:

- “Enter what you know.”
- “The scorer works out what it safely can.”
- “If a rule needs a fact the app cannot infer, it asks.”
- “If you do not know, the scorer scores conservatively.”

Avoid:

- hype;
- gamified celebration that interrupts table use;
- “AI-powered” framing;
- forced technical terminology;
- making a beginner select rule names before the system can help them.

---

# 39. Handbook maintenance status

This file should be reviewed whenever a feature PR changes user-facing behaviour.

At minimum, future work should check:

- feature status;
- What if? answers;
- persistence implications;
- ledger/evidence implications;
- print implications;
- learner-guide implications;
- public feature/marketing claims;
- backlog/current-product boundary.

The handbook is intentionally redundant in places: the goal is to make product truth easy to retrieve without requiring someone to reconstruct months of design decisions from closed GitHub issues.

When repetition conflicts, the more specific behavioural section should be corrected and then the inventory/claim sections brought back into alignment.
