# Mahjong Reference — internationalisation foundation

Status: **implementation-ready design**  
Programme: #105  
Issue: #215

## Decision

Internationalisation is a **free platform capability**, not a Plus feature.

Use:

- `i18next` + `react-i18next` for React UI strings, plural/interpolation behaviour and locale resources;
- native `Intl` APIs for locale-aware numbers, dates and currencies;
- explicit locale-prefixed URLs for translated indexable public pages;
- the existing prerender pipeline for crawlable translated HTML;
- local browser preference while signed out, with optional account synchronisation after #207 exists.

Do not introduce a translation-management SaaS until translation volume/review workflow demonstrates a real need.

## First implementation slice

The first slice is deliberately small:

1. install/configure i18next + react-i18next;
2. introduce **English only** resources first;
3. extract shared navigation, common actions and one bounded public route into translation keys without changing visible English copy;
4. add an accessible language selector and local preference;
5. add one pilot translated locale after the English layer is regression-safe;
6. extend prerender/SEO output for that pilot locale;
7. only then expand route-by-route.

This lets us discover awkward hard-coded strings before translating the whole application.

## Locale identity

Use BCP-47-style locale tags in product/configuration, initially language-only where regional differences do not matter, e.g.:

```text
en
fr
de
nl
es
```

Do not infer the first rollout languages from intuition. Choose the first one or two non-English languages from Search Console/visitor evidence.

`en` remains the default/fallback locale.

## URL model

Protect existing indexed English routes.

English stays unprefixed:

```text
/how-it-works
/rules
/scoring-examples
```

Translated public pages use stable locale prefixes:

```text
/fr/how-it-works
/de/how-it-works
```

Do **not** migrate English to `/en/*`.

For every indexable localized page:

- `<html lang>` matches the locale;
- canonical points to that locale's own URL;
- reciprocal `hreflang` alternates point to equivalent localized URLs;
- unprefixed English participates as `en` and may be `x-default` where appropriate;
- sitemap contains the localized URL only when that translation is intentionally public/indexable;
- server/prerendered primary content is already translated before hydration.

Never use IP/geolocation or `Accept-Language` rewriting as the only SEO mechanism. Browser language may suggest a locale, but explicit URL/user choice remains authoritative.

## Resource structure

Prefer namespaces by product concern rather than one giant locale file:

```text
src/i18n/
  index.ts
  locales/
    en/
      common.json
      game.json
      hand.json
      account.json
      rules.json
    <locale>/...
```

Suggested boundary:

- `common`: navigation, generic actions, errors, statuses;
- `game`: table/game tracker UI;
- `hand`: hand-entry/scorer UI;
- `account`: sign-in/Plus/account UI;
- `rules`: short rules-profile names/labels and shared rules terminology.

Long-form public/reference content should not be forced into a giant JSON catalogue if authored route content is clearer. The important rule is that localized route content is versioned, reviewable and prerenderable.

## Domain identity versus display language

Persist **stable IDs**, never translated labels.

Examples:

```text
rulesProfile: { id: "bmja", version: "1.0" }
locale: "de"
```

Display can then resolve:

```text
rules.profile.bmja.name
rules.profile.buzzard2000.name
rules.profile.mcrWmo2006.name
rules.profile.riichiEma2025.name
```

The same saved game must remain mathematically identical regardless of display language.

Do not translate:

- player-entered names;
- stable rule/pattern IDs;
- persisted profile/version IDs;
- numeric scores as strings in storage;
- provenance/source IDs.

Translate/display:

- navigation and actions;
- scoring explanations;
- pattern/rule names where reviewed;
- validation/error copy;
- help/reference prose;
- account/billing labels.

## Mahjong terminology policy

Mahjong terminology is not ordinary UI copy.

Maintain a reviewed glossary per locale for terms such as:

- Chow / Pung / Kong;
- prevailing wind / seat wind;
- Fishing / Calling / Standing Hand;
- fan;
- yaku / han / fu / dora / furiten / riichi / ron / tsumo;
- MCR pattern names.

Rules/profile source truth remains independent from translation. Translation may explain a term but must not change its executable meaning.

Do not treat machine translation of specialist rules prose as authoritative. Machine-assisted drafts are acceptable only with terminology review before publishing detailed rules guidance as trusted reference content.

## Runtime preference precedence

For signed-out users:

1. explicit current user choice;
2. previously saved local preference;
3. browser language suggestion when a supported locale exists;
4. English fallback.

For signed-in users after #207:

1. explicit current-session user choice;
2. account preference if available;
3. local preference;
4. browser suggestion;
5. English.

A local language change applies immediately even if account sync fails. Account/backend availability must never control language access.

## #207 foundation connection

`preferredLocale` is the recommended first harmless account-backed value for the #207 vertical proof.

Flow:

```text
choose locale locally
→ sign in with Better Auth OTP
→ save preferredLocale for current user
→ sign in on another browser
→ retrieve preferredLocale
```

This proves the server/database/auth/user-scoping path without entrusting it with game history.

Language remains free and local-first; syncing the preference is simply account convenience.

## Prerender changes

The current SEO script reads a route catalogue, renders each route and writes canonical/sitemap output. Extend that existing mechanism rather than creating a second rendering system.

Target shape:

```text
base public route definition
+ localized route/content metadata
→ renderRoute(path, locale)
→ translated HTML body
→ localized title/description/canonical/hreflang
→ output /<locale>/<route>.html
```

Build guards should fail when:

- an indexable localized page has no translated title/description;
- `<html lang>` is wrong;
- canonical does not match the localized URL;
- reciprocal alternates are incomplete;
- required translation keys render as raw keys/missing values;
- the localized prerender body is empty/incomplete.

## Accessibility

Language selector requirements:

- keyboard operable;
- correctly labelled;
- current language conveyed programmatically;
- language names understandable in their own language where practical (`Deutsch`, `Français`);
- no flag-only language representation;
- switching language does not unexpectedly discard an active game/draft.

Inline foreign-language terms should use `lang` where pronunciation/semantics benefit.

## Rollout gate

Do not translate every route at once.

Recommended progression:

- Stage A: English i18n plumbing, zero visible change;
- Stage B: selector + local preference;
- Stage C: one evidence-selected pilot locale + one small public route + common chrome;
- Stage D: SEO/prerender validation;
- Stage E: scorer/game UI;
- Stage F: long-form rules/reference content with glossary review;
- Stage G: further languages only where traffic/use justifies them.

## Non-goals

- paid-only language support;
- runtime translation API dependency;
- automatic translation of user-entered names;
- moving English URLs;
- translating persisted game/domain IDs;
- forcing every Mahjong term into an English-equivalent phrase;
- introducing a translation SaaS before it solves an observed workflow problem.

## Foundation acceptance

The design is ready for implementation when the first Codex brief can say:

> Add the English-only i18next/react-i18next foundation and extract one bounded UI/public surface without changing visible English behaviour. Preserve current URLs, prerender output and free local play. Do not add a second routing/rendering framework.
