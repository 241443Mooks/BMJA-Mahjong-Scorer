# Mahjong Reference Plus — reuse / build map

Status: **implementation-preparation constraint**  
Parent: #206  
Architecture: `MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`  
Bounded backlog: `PLUS_IMPLEMENTATION_BACKLOG.md`

## Principle

> **Do not custom-build commodity SaaS plumbing. Integrate maintained platform/library capability, then write only the Mahjong-specific seams and product behaviour.**

The 44 backlog rows are acceptance concerns, **not 44 bespoke subsystems**. Several may share one implementation session/PR when an established module already owns most of the behaviour.

Before implementing any P1–P6 job, the implementation brief must contain a short **reuse check**:

1. Is this already supplied by Cloudflare, Better Auth, Stripe or an existing repo dependency?
2. Is there an official maintained adapter/plugin for this exact stack?
3. Can configuration/composition solve it without a custom abstraction?
4. If custom code remains, what is the smallest Mahjong-specific seam we actually own?

Prefer official/provider-maintained integrations over community glue where both exist.

## Use existing platform/library capability

### Cloudflare

Use Cloudflare's existing primitives rather than constructing equivalents:

- Pages Functions / Workers runtime for `/api/*`;
- D1 binding for relational persistence;
- Secrets / environment bindings for server-only credentials;
- Wrangler/local bindings for development and migration/deployment tooling;
- Workers Rate Limiting binding where route/user service throttling is required.

Do not build a home-grown API server, secret store or distributed rate limiter.

### Drizzle

Use Drizzle's maintained Cloudflare D1 support and Drizzle Kit migration generation.

Own only:

- Mahjong product schema;
- domain queries/constraints;
- migration review and application policy.

Do not write a query builder, schema diff system or migration framework.

### Better Auth

Better Auth should own commodity identity/session/account behaviour.

Use existing capabilities where suitable:

- user/session/verification model;
- session cookie handling;
- Email OTP plugin;
- auth route/client helpers;
- built-in auth rate limiting where appropriate;
- schema generation/migration support;
- account deletion/fresh-session/verification primitives;
- official Stripe plugin if its data/lifecycle model satisfies the Plus contract.

Do **not** hand-roll OTP generation/expiry, session tokens, cookie auth, account deletion verification or basic subscription lifecycle handling.

#### D1 adapter decision

At P1 implementation time, compare Better Auth's first-class native D1 path with its Drizzle adapter against the already-selected Drizzle application schema.

Choose the path that gives the simplest single migration/deployment story. The product decision is **Better Auth**, not “we must custom-build its tables through Drizzle”.

### Email delivery

Use a transactional provider SDK behind a tiny adapter. Resend is the initial candidate and provides a Cloudflare Worker integration.

Mahjong Reference owns the message content and provider boundary, not an SMTP/delivery system.

### Stripe / Better Auth Stripe plugin

Before implementing custom P3 billing plumbing, perform a plugin-fit spike against the official Better Auth Stripe plugin.

The current plugin already covers commodity work including:

- Stripe Customer creation/linking;
- Checkout/subscription plan actions;
- subscription lifecycle persistence;
- secure Stripe webhook processing;
- cancellation/update events;
- Customer Portal session creation;
- client subscription helpers;
- checkout/webhook reconciliation behaviour.

If it satisfies the Phase 0 invariants, **use it** and collapse/re-scope P3.1–P3.7 around configuration, entitlement adaptation and tests rather than recreating those mechanisms.

Custom code should remain only where Mahjong Reference deliberately differs, especially:

- the product's `plus` entitlement boundary if the plugin's subscription state is not sufficient;
- humane read-only/lapse behaviour for cloud games;
- complimentary/promotional grants if retained;
- one-time voice-credit purchase fulfilment and the separate immutable credit ledger.

Never duplicate Stripe subscription state merely for architectural neatness when the plugin already provides a trustworthy model.

### Existing frontend dependencies

Reuse the application's existing UI/data libraries before adding new ones:

- TanStack React Query for authenticated fetch/mutation/loading/retry/cache behaviour where appropriate;
- Zod for API/input/payload validation;
- existing Radix primitives for dialogs/forms/accessibility interactions;
- Sonner for non-blocking status/error notifications;
- existing responsive/design system and tested accessibility patterns.

Do not introduce another state/query/form/component framework just because Plus has a backend.

## Product-specific code we probably do own

These are not good candidates for generic SaaS replacement because they encode Mahjong Reference's actual product contract.

### Canonical cloud-game serialization

We own the mapping between current local game truth and a versioned cloud record, including exact rules-profile/version and current round evidence.

### Explicit local → cloud adoption

We own the UX rule that signing in never silently replaces the game on the table.

### Revision conflict policy

The server can use a standard optimistic concurrency pattern, but Mahjong Reference owns the user-facing decision not to silently merge divergent Mahjong histories.

Do **not** add CRDT/general collaborative-sync machinery unless real requirements appear. This is primarily single-owner save/continue, not Google Docs.

### Local-first table behaviour

We own the rule that cloud failure cannot stop a physical hand/game. Generic query/retry libraries may implement transport mechanics, but the table behaviour is ours.

### Plus entitlement semantics

We own what Plus permits and the cancellation/read-only policy, even if Better Auth/Stripe provide the underlying subscription state.

### Immutable service-credit semantics

Stripe can sell a credit pack, but Mahjong Reference owns what one service credit means, when it is consumed/refunded, and the append-only audit model. #147 owns eventual voice charging semantics.

### Voice evidence boundary

Providers may supply transcription/structured output. Mahjong Reference owns the strict evidence schema, Accept/Edit UX and deterministic scorer boundary.

## Explicit anti-reinvention checks by epic

### #207 / P1 — auth/backend

Expected composition: **Cloudflare + D1 + Better Auth + Email OTP plugin + mail provider**.

Most work should be integration/configuration/testing, not auth implementation.

### #208 / P2 — cloud games

Expected composition: **existing game persistence model + D1/Drizzle + React Query/Zod + small revision API**.

Do not import a heavyweight offline-sync/collaboration platform unless the simple optimistic-revision model fails a demonstrated requirement.

### #209 / P3 — subscriptions

Expected composition: **Better Auth Stripe plugin + Stripe-hosted Checkout/Portal** wherever compatible.

This epic should be aggressively re-estimated after the plugin-fit spike. Several current backlog rows may collapse into one or two configuration/integration PRs plus Plus-specific entitlement/lapse tests.

### #210 / P4 — credits

Expected composition: **Stripe Checkout for purchase + D1/Drizzle append-only ledger + database uniqueness/idempotency constraints**.

Do not buy/build a general accounting platform for a small service-credit balance.

### #211 / P5 — voice

Expected composition: **provider SDK/API selected by #147 + existing strict evidence/domain scorer**.

Do not build speech recognition, general agent infrastructure or scoring AI.

### #212 / P6 — launch

Expected composition: provider dashboards/configuration and existing product UI. Better Auth's account deletion facilities and Stripe's Portal/Tax capabilities should be used where they meet the actual policy.

Do not recreate billing management or identity lifecycle screens already safely hosted/provided elsewhere.

## Dependency/vendor rule

A library is not automatically better than a little code. Adopt it when it:

- owns a genuinely generic concern;
- is actively maintained and compatible with Cloudflare/TypeScript;
- materially reduces security/correctness burden;
- has a stable enough data/export path to avoid lock-in trapping user data;
- does not force the free local product onto the network.

Avoid dependencies that add a second backend/state authority merely to save a small amount of straightforward domain code.

## Readiness consequence

Before promoting a backlog row into a GitHub implementation issue, classify it as one of:

- **CONFIGURE** — mostly provider/platform configuration;
- **INTEGRATE** — wire an existing maintained capability into the product;
- **ADAPT** — thin product-specific wrapper/policy around an existing capability;
- **BUILD** — genuinely Mahjong-specific behaviour we must own.

Codex briefs should explicitly name the library/platform capability to reuse and state what **not** to rebuild.

The goal is not to complete 44 custom builds. The goal is to satisfy 44 bounded acceptance concerns with the **least bespoke code we can responsibly own**.