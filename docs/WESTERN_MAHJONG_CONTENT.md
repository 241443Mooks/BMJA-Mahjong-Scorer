# Western Mahjong / Australian Mahjong content research

> Issue: #72 — Expand discoverability for Western and Australian Mahjong terminology
>
> Status: research + first content draft. No application/scoring implementation in this branch.
>
> Purpose: establish what can be said accurately about **Western Mahjong**, **Australian Mahjong** and the current **British/BMJA-style** scorer before Codex implements `/western-mahjong` after #61 centralises public-route SEO metadata.

---

## Executive conclusion

The safest and most useful public position is:

> **Western Mahjong is not one universal ruleset.** It is a broad family label used for several Western-developed Mahjong traditions. In contemporary Australia, “Western Mahjong” commonly refers to play based on books by Patricia Thompson and Betty Maloney, often combined with local group rules and a large catalogue of special hands. British/BMJA-style Mahjong is closely related and shares many recognisable mechanics, but the rules are not interchangeable.

That distinction should drive the page.

The opportunity is not to relabel the existing scorer as “Western Mahjong”. The opportunity is to become the clearest page explaining the relationship between **British Mahjong**, **Western Mahjong** and **Australian Mahjong**, then route people whose rules actually match the current implementation into the British scorer.

Current search results are fragmented across books, Q&A pages, U3A/group pages and a small number of apps. I did not find a dominant, clearly documented browser-based Western/Australian scoring calculator in this first pass. That supports building a genuinely useful explanatory page, but we should not claim market leadership from this search alone.

---

# Research findings

## 1. “Western Mahjong” is a family label, not a single modern standard

The term is used inconsistently across the web and across Mahjong history.

Tom Sloper’s long-running Mahjong reference material groups several published traditions under **Western / British / Australian** Mahjong and names authors including Thompson & Maloney, Headley & Seeley and Robertson. His earlier book FAQ described Thompson & Maloney’s *The Game of Mah Jong Illustrated* as a Western game as played in Australia.

This makes it unsafe to write:

> Western Mahjong is the Australian ruleset.

or:

> Western Mahjong is the same as British Mahjong.

A better formulation is:

> Western Mahjong is a broad label. In Australia and New Zealand it is often used for a particular social tradition built around published Australian rulebooks and extensive special-hand catalogues. British/BMJA-style Mahjong belongs to the same wider Western family but has its own rules and scoring details.

### Sources

- Tom Sloper, Mah-Jongg FAQ / Q&A material — Western (British/Australian) references: https://sloperama.com/mjfaq/mjfaq20.html
- Sloper archive describing Thompson & Maloney as Western Mahjong as played in Australia: https://groups.google.com/g/rec.games.mahjong/c/9YiTz3irH6c
- Current Sloper Q&A referring to Headley & Seeley as British/Western: https://sloperama.com/majexchange/bulletinbd.htm

---

## 2. Contemporary Australian “Western Mahjong” has a strong Thompson & Maloney tradition

There is good current evidence that Australian social groups use Patricia Thompson and Betty Maloney’s books as their practical reference.

Examples:

- Glen Eira U3A’s 2026 course catalogue explicitly says its experienced group plays **Western Mah Jong** in accordance with Thompson & Maloney plus local U3A rules, and recognises hands from *The Mah Jong Player’s Companion*.
- U3A Canberra’s current Western Mahjong group says it uses *The Mah Jong Player’s Companion* and describes the Western game as similar to the Chinese game but with many more special hands.
- WIZO Victoria’s Western Mahjong course uses hands from *The Mah Jong Player’s Companion* and rules from *The Game of Mah Jong Illustrated*. Its tutor describes this as the Australian version, distinct from American Mahjong.
- Simon & Schuster Australia describes *The Mah Jong Player’s Companion* as containing more than 120 illustrated hands collected from many parts of the world.

This gives us a credible contemporary definition for the page without claiming that every Australian table follows exactly the same rules.

### Sources

- Glen Eira U3A 2026 course catalogue: https://gleneirau3a.org.au/wp-content/uploads/2026/01/2026-Course-Catalogue-v2.5.pdf
- U3A Canberra Western Mahjong: https://www.u3acanberra.org.au/courseinfo/R018.16.html
- WIZO Victoria Western Mahjong course: https://wizovic.org.au/events/wizo-connect-an-introduction-to-western-mahjong-3/
- Simon & Schuster Australia, *The Mah Jong Player’s Companion*: https://www.simonandschuster.com.au/books/The-Mah-Jong-Players-Companion/Patricia-Thompson/9781761635946
- Simon & Schuster, *The Game of Mah Jong Illustrated*: https://www.simonandschuster.com/books/The-Game-of-Mah-Jong-Illustrated/Patricia-A-Thompson/9780684868431

---

## 3. Max Robertson is also an important Australian reference line

Penguin Australia still publishes Max Robertson’s *The Game of Mah Jong* and describes it as a long-established guide to rules and scoring.

This matters because “Australian Mahjong” is not reducible to only Thompson & Maloney. Robertson is another important published strand and helps explain why Australian groups can share a recognisable Western base while differing in hand lists and local conventions.

### Source

- Penguin Australia, Max Robertson, *The Game of Mah Jong*: https://www.penguin.com.au/books/the-game-of-mah-jong-9780143006596

---

## 4. British/BMJA-style and Australian Western Mahjong clearly overlap

The current project’s BMJA reference and published Western material share a recognisable structure.

### Strong overlap

Both traditions can include:

- the familiar four-player Wind structure;
- a 144-tile set with Flowers and Seasons;
- Pungs, Kongs, Chows and a pair;
- a restriction of **at most one Chow in an ordinary hand**;
- base/ground points followed by doubles;
- own Wind and prevailing Wind scoring concepts;
- own Flowers/Seasons;
- named special hands;
- fishing/calling concepts;
- a Goulash/redeal tradition;
- a significant role for East in scoring/settlement.

The one-Chow point is particularly useful. Sloper explicitly describes the Western restriction as no more than one Chow in an ordinary hand, citing Thompson & Maloney and other Western/British/Australian references. That matches the project’s BMJA implementation.

### Sources

- Project BMJA rules reference: `BMJA_RULES_REFERENCE.md`
- Sloper, misunderstood rules / Western Chow restriction: https://sloperama.com/mjfaq/mjfaq20.html
- Thompson & Maloney book metadata/contents: https://books.google.com/books/about/The_Game_of_Mah_Jong_Illustrated.html?id=FESgeK92RhYC
- BMJA source site / project source lineage: https://mahjongbritishrules.wordpress.com/about-the-website/

---

## 5. The main public distinction should be “same family, different rulebook”

The page should not try to enumerate every scoring-table difference before we have the underlying Australian rulebooks in hand.

We already have strong evidence for several material differences:

### A. Special-hand catalogue

The current BMJA project supports a defined catalogue of British special hands documented in `BMJA_RULES_REFERENCE.md`.

By contrast, Thompson & Maloney’s *Mah Jong Player’s Companion* contains **120+ hands**, and current Australian groups explicitly use that catalogue.

This is probably the clearest user-facing difference.

### B. Local rules are visibly part of Australian social play

Glen Eira U3A explicitly combines Thompson & Maloney with **local rules**. That is excellent evidence for issue #51’s architecture principle: do not pretend one online source defines every Western table.

### C. Special-hand values can extend beyond the current BMJA 1,000-point limit

A current Livingstone Shire Council listing describes its Western Style Mahjong group as using hands with values of:

- Half Limit — 500
- Limit — 1,000
- Middle Limit — 1,500
- Double Limit — 2,000

The current BMJA scorer normally caps ordinary hands at 1,000 and its implemented fixed-value special hands are 500 or 1,000.

This is concrete evidence that the current scorer must **not** be advertised as a universal Australian/Western scorer.

### Sources

- Simon & Schuster Australia — 120+ hands: https://www.simonandschuster.com.au/books/The-Mah-Jong-Players-Companion/Patricia-Thompson/9781761635946
- Glen Eira U3A 2026 — Thompson/Maloney + local rules: https://gleneirau3a.org.au/wp-content/uploads/2026/01/2026-Course-Catalogue-v2.5.pdf
- Livingstone Shire Council — Western Style hand value categories: https://www.livingstone.qld.gov.au/Places-and-Spaces/Community-Facilities/The-Community-Centre/Community-Group-Activities/CCHA-Mahjong
- Project BMJA implementation: `BMJA_RULES_REFERENCE.md`

---

## 6. Current product wording should be conservative

### Safe claims

We can say:

- British/BMJA-style Mahjong is closely related to the wider Western Mahjong tradition.
- Western Mahjong is widely played socially in Australia.
- Contemporary Australian groups commonly use Thompson & Maloney and/or Max Robertson references.
- Australian groups may add local rules and larger special-hand catalogues.
- The current scorer is specifically a British/BMJA-style scorer.
- Some Western/Australian concepts will look familiar to a British player, but scoring compatibility should not be assumed.

### Claims to avoid for now

Do not say:

- “Western Mahjong and British Mahjong are the same rules.”
- “Australian Mahjong is one standard ruleset.”
- “The British scorer works for Australian Mahjong.”
- “BMJA rules are the official Western rules.”
- “Thompson & Maloney is the official Australian standard.”
- “All Western games use the same special hands / limits / settlement.”

---

# Proposed public page

## Route

`/western-mahjong`

## Recommended H1

# Western Mahjong, Australian Mahjong and British Mahjong

## Page eyebrow

Western Mahjong explained

## Intro heading

## Closely related — but not one universal rulebook

## Suggested title tag

Western Mahjong Rules & Scoring | British vs Australian Mahjong

## Suggested meta description

Learn what Western Mahjong means, how Australian Western Mahjong relates to British/BMJA-style play, where scoring and special hands differ, and when the British Mahjong calculator is suitable.

---

# First publishable copy draft

## Western Mahjong, Australian Mahjong and British Mahjong

### Closely related — but not one universal rulebook

“Western Mahjong” sounds as though it should describe one clear set of rules. In practice, it is a broader family label.

British Mahjong, Australian Western Mahjong and several other Western-developed traditions share a lot of recognisable DNA: Winds and Dragons, Pungs and Kongs, Flowers and Seasons, points and doubles, named special hands, and the familiar rhythm of drawing and discarding tiles.

But they are **not automatically the same scoring system**.

This site currently scores **British Mahjong using the BMJA-style rules documented by this project**. If your group describes its game as Western or Australian Mahjong, this page will help you work out how close your rules are before you use the scorer.

---

## What does “Western Mahjong” mean?

There is no single modern authority called “Western Mahjong”. The term has been used for several rule traditions that developed as Mahjong spread through Europe, Australia, New Zealand and North America.

In contemporary Australia, Western Mahjong is often taught using books by **Patricia Thompson and Betty Maloney**, including *The Game of Mah Jong Illustrated* and *The Mah Jong Player’s Companion*. The latter contains more than 120 illustrated special hands. **Max Robertson’s** *The Game of Mah Jong* is another long-standing Australian reference.

Local groups may then add their own conventions. For example, a current Australian U3A group explicitly describes its rules as Thompson & Maloney **plus local rules**.

So if somebody says, “We play Western Mahjong”, the sensible next question is:

> **Which rulebook or hand list does your group use?**

---

## Is Western Mahjong the same as British Mahjong?

Not exactly.

British/BMJA-style Mahjong and Australian Western Mahjong are close relatives. A player moving between them will recognise much of the basic structure.

Both can use:

- Pungs, Kongs and Chows;
- Winds and Dragons;
- Flowers and Seasons;
- own Wind and prevailing Wind concepts;
- points followed by doubles;
- named special hands; and
- a one-Chow limit in an ordinary hand.

That makes them much closer to each other than, for example, British Mahjong and American Mah Jongg.

But the details matter. Different Western rulebooks and groups can use different special-hand catalogues, scoring values, limits and local conventions.

The best mental model is:

> **Same family. Different rulebooks.**

---

## What is Australian Western Mahjong?

In Australia, “Western Mahjong” is a common name for a social style of Mahjong taught by clubs, community groups and U3A organisations.

A particularly visible modern tradition uses Patricia Thompson and Betty Maloney’s books. Their *Mah Jong Player’s Companion* contains more than 120 named hands, and current Australian groups explicitly use it as their hand reference.

That large special-hand catalogue is one reason Australian Western play can feel different from the current British/BMJA scorer even when the basic tiles and ordinary scoring ideas look familiar.

There is also real table variation. Some groups publish local rules alongside the books, and some use special-hand values beyond the British scorer’s usual 1,000-point limit.

That is why this site does not silently label British scoring as “Australian scoring”.

---

## British vs Australian Western Mahjong — at a glance

| Feature | British / BMJA-style on this site | Australian Western tradition |
| --- | --- | --- |
| Ordinary tiles and groups | Familiar suits, Winds, Dragons, Pungs, Kongs, Chows, pair | Very similar core vocabulary |
| Flowers & Seasons | Used and scored | Commonly used |
| Ordinary-hand Chow rule | Maximum one Chow | Maximum one Chow is a recognised Western rule |
| Scoring shape | Base points + doubles + limits/special values | Points/ground score + doubles are common in published Western rules |
| Named special hands | Defined BMJA-style catalogue | Often a much larger catalogue; Thompson & Maloney’s companion has 120+ hands |
| House/local rules | Scorer uses its documented BMJA baseline | Local group rules are common and may sit alongside published books |
| Maximum/special values | Current project normally uses a 1,000-point limit | Some groups use additional 1,500 / 2,000-point special-hand categories |
| Safe to use this scorer? | Yes, for the project’s British/BMJA rules | **Do not assume exact compatibility** — check your group’s rulebook/hand list |

The Australian column describes a **tradition**, not one universal national ruleset.

---

## Can I use the British Mahjong Scorer for Western Mahjong?

### If your group plays British/BMJA-style rules

Yes. That is exactly what the current calculator is designed for.

**Try the British Mahjong hand calculator →** `/hand`

### If your group uses Thompson & Maloney, Max Robertson or a local Australian hand sheet

Some of the mechanics may look extremely familiar, but you should not assume that every score or special hand matches.

The biggest thing to check is your group’s **special-hand list and scoring values**. Australian Western groups may recognise many more special hands than the current British scorer.

For now, use this site as a British reference rather than treating it as an Australian scoring authority.

---

## Why do Western Mahjong groups have different rules?

Mahjong spread internationally before there was one worldwide standard. Different authors, clubs and communities preserved some rules, changed others and added new special hands.

That history is still visible today. Two Western Mahjong groups can share the same core game but use different hand lists or local conventions.

That does not mean one group is necessarily “wrong”. It means the **rules profile needs to be explicit**.

This is also why the project keeps British/BMJA rules as a named baseline rather than quietly changing the scorer every time a house rule appears.

---

## Is Western Mahjong the same as American Mah Jongg?

No.

The word “Western” can be confusing here. Contemporary American/NMJL-style Mah Jongg is a much more distinct branch: it uses an annually changing card of valid hands, Jokers and the Charleston tile-passing sequence.

Australian Western and British/BMJA-style play remain much closer to the older Pung/Kong/Chow, Flowers/Seasons and points-and-doubles tradition.

For a wider comparison, link to `/mahjong-rules-compared` when that route is public.

---

## What should I ask before joining a Western Mahjong table?

If somebody tells you they play Western or Australian Mahjong, ask:

1. **Which rules/book do you use?**
2. **Which special-hand list do you use?**
3. **What is the game/hand limit?**
4. **Do you use any local or house rules?**
5. **Do you score every hand, or mainly play for named special hands?**

Those five questions will tell you far more than the word “Western” by itself.

---

## Related routes

Use descriptive internal links rather than generic “learn more” links:

- **British Mahjong scoring calculator** → `/hand`
- **How British Mahjong scoring works** → `/guide`
- **British Mahjong special hands** → `/special-hands`
- **Compare British, Hong Kong, Riichi, MCR and American Mahjong** → `/mahjong-rules-compared`
- **Worked British Mahjong scoring examples** → `/scoring-examples` once #65 exists

---

# Search intent / wording strategy

Use these phrases naturally where they answer a real question:

Primary:

- Western Mahjong
- Western Mahjong rules
- Western Mahjong scoring
- Australian Mahjong
- Australian Mahjong scoring
- British vs Western Mahjong
- British vs Australian Mahjong

Calculator intent should be handled carefully:

- Western Mahjong scoring calculator
- Western Mahjong calculator
- Australian Mahjong calculator

Do **not** put those phrases into a CTA that falsely implies the current scorer implements Australian rules.

A safer pattern is:

> Looking for a Western Mahjong scoring calculator? First check which Western rules your group uses. This calculator currently supports British/BMJA-style scoring.

That sentence serves the search intent while increasing trust rather than overclaiming.

---

# Suggested FAQ section

These would be useful both for users and retrieval/search systems if implemented as ordinary visible HTML.

### Is Western Mahjong the same as British Mahjong?

No. They are closely related Western traditions and share many mechanics, but their special hands, scoring values and local rules can differ.

### What is Australian Mahjong?

There is no single universal Australian ruleset. Many Australian social groups play a Western style based on books by Patricia Thompson and Betty Maloney and/or Max Robertson, often with local conventions.

### Does Western Mahjong allow more than one Chow?

A recognised rule in the Western/British/Australian tradition is that an **ordinary** hand may contain at most one Chow. Named special hands can have their own structures and may require Chow patterns that are exceptions to the ordinary-hand rule.

### Does Western Mahjong use Flowers and Seasons?

Common Western/British/Australian rule traditions use Flowers and Seasons as bonus/scoring tiles, although exact scoring can vary by rulebook or group.

### Can I use this calculator for Australian Mahjong?

Only if your group’s rules match the British/BMJA-style rules implemented by this project. If your group uses a Thompson & Maloney hand list, Max Robertson rules or local rules, do not assume every score or special hand is compatible.

### Is Western Mahjong the same as American Mah Jongg?

No. Modern American/NMJL-style Mah Jongg uses an annual hand card, Jokers and the Charleston. British and Australian Western styles retain a much more traditional Pung/Kong/Chow and points/doubles structure.

---

# Architecture notes for future ruleset support

Issue #72 should **not** implement a second scoring engine.

If evidence later justifies Australian/Western support, it should build on the existing rules-profile direction from #51.

Conceptually:

```ts
type RulesProfileId =
  | 'bmja'
  | 'western-au-thompson-maloney'
  | 'western-au-robertson'

// House rules remain separate from the named base profile.
type GameRulesConfig = {
  profile: RulesProfileId
  houseRules?: HouseRuleOverrides
}
```

This is only a direction note, not a proposed implementation API.

Important separation:

- **SEO term**: “Western Mahjong”
- **rules profile**: a named, testable rule source
- **house rules**: explicit overrides used by a group/table

Never branch scoring behaviour because the page/search keyword says “Western”.

---

# Evidence gaps / next research pass

Before converting this content draft into an implementation brief, useful next steps are:

1. Obtain or inspect a legitimate copy/preview of Thompson & Maloney’s *The Game of Mah Jong Illustrated* closely enough to compare the actual ordinary scoring table with the BMJA table.
2. Do the same for Max Robertson’s *The Game of Mah Jong*.
3. Build a small **rules-difference matrix** covering:
   - Pung/Kong base values
   - honour pairs
   - Flower/Season treatment
   - rounding
   - doubles
   - East settlement
   - loser settlement
   - game progression
   - Goulash
   - fishing
   - special-hand value categories
4. Treat contemporary group-specific rules as evidence of variation, not as a national standard.
5. After #61 lands, implement `/western-mahjong` through the shared route metadata/sitemap configuration rather than adding route metadata separately.

---

# Sources used in this first pass

Primary / publisher / current group sources:

- Mah-Jong British Rules — site history and BMJA lineage: https://mahjongbritishrules.wordpress.com/about-the-website/
- Project BMJA source-of-truth: `BMJA_RULES_REFERENCE.md`
- Simon & Schuster — *The Game of Mah Jong Illustrated*: https://www.simonandschuster.com/books/The-Game-of-Mah-Jong-Illustrated/Patricia-A-Thompson/9780684868431
- Simon & Schuster Australia — *The Mah Jong Player’s Companion*: https://www.simonandschuster.com.au/books/The-Mah-Jong-Players-Companion/Patricia-Thompson/9781761635946
- Penguin Australia — Max Robertson, *The Game of Mah Jong*: https://www.penguin.com.au/books/the-game-of-mah-jong-9780143006596
- Glen Eira U3A 2026 course catalogue: https://gleneirau3a.org.au/wp-content/uploads/2026/01/2026-Course-Catalogue-v2.5.pdf
- U3A Canberra Western Mahjong: https://www.u3acanberra.org.au/courseinfo/R018.16.html
- WIZO Victoria Western Mahjong: https://wizovic.org.au/events/wizo-connect-an-introduction-to-western-mahjong-3/
- Livingstone Shire Council Western Style Mahjong group: https://www.livingstone.qld.gov.au/Places-and-Spaces/Community-Facilities/The-Community-Centre/Community-Group-Activities/CCHA-Mahjong

Useful secondary reference:

- Tom Sloper, commonly misunderstood Mahjong rules: https://sloperama.com/mjfaq/mjfaq20.html
- Tom Sloper Q&A archive on Western/British/Australian rules: https://www.sloperama.com/majexchange/bulletinbd-archive51.htm
- Historical Sloper book FAQ: https://groups.google.com/g/rec.games.mahjong/c/9YiTz3irH6c

Search-result / market context:

- Western Mahjong App (Australian-style Western Mahjong): https://apps.apple.com/au/app/western-mahjong/id6757350677
- Mahjong Downunder: https://mahjongdownunder.com.au/how-to-play-a-session-game

The app/site items are useful evidence of present-day terminology and demand, but they should not be treated as rule authorities.