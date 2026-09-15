# Mahjong Reference Plus — reuse / build map

Status: **implementation-preparation constraint**  
Parent: #206  
Architecture: `MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`  
Bounded backlog: `PLUS_IMPLEMENTATION_BACKLOG.md`  
Concrete stack decision: `PLUS_LEGO_STACK.md`

## Principle

> **Do not custom-build commodity SaaS plumbing. Integrate maintained platform/library capability, then write only the Mahjong-specific seams and product behaviour.**

The 44 backlog rows are acceptance concerns, **not 44 bespoke subsystems**. Several should share one implementation session/PR when an established module already owns most of the behaviour.

Before implementing any P1–P6 job, the implementation brief must contain a short **reuse check**:

1. Is this already supplied by Cloudflare, Better Auth, Stripe or an existing repo dependency?
2. Is there an official maintained adapter/plugin for this exact stack?
3. Can configuration/composition solve it without a custom abstraction?
4. If custom code remains, what is the smallest Mahjong-specific seam we actually own?

Prefer official/provider-maintained integrations over community glue where both exist.

## Use existing platform/library capability

### Cloudflare + Hono

Keep the existing React/Vite frontend and Cloudflare deployment.

Use Cloudflare's existing primitives rather than constructing equivalents:

- Pages Functions / Workers runtime for `/api/*`;
- D1 binding for relational persistence;
- Secrets / environment bindings for server-only credentials;
- Wrangler/local bindings for development and migration/deployment tooling;
- Workers Rate Limiting binding where non-auth premium route/user throttling is required.

Use **Hono** as the small API routing/middleware layer rather than hand-rolling a router. Hono has first-class Cloudflare support and Better Auth mounts directly into it with standard Web `Request`/`Response` APIs.

Use Hono's Zod/Standard Schema validator integration and optional RPC typing where useful.

Do not build a home-grown API server, secret store, route framework or distributed rate limiter.

### D1 + Drizzle

Use D1 for Plus product data and Drizzle for Mahjong schema/queries and checked-in SQL migrations.

Better Auth now supports D1 directly, but for this product prefer the **official Better Auth Drizzle adapter** because the application already needs Drizzle. Better Auth can generate the required Drizzle schema, allowing one migration toolchain rather than a separate Better Auth/Kysely migration path plus Drizzle application migrations.

Own only:

- Mahjong product schema;
- domain queries/constraints;
- migration review and application policy.

Do not write a query builder, schema diff system or migration framework.

### Better Auth

Better Auth should own commodity identity/session/account behaviour.

Use existing maintained capabilities:

- user/session/verification model;
- secure session cookie handling;
- React auth client/session helpers;
- **Email OTP plugin**;
- built-in rate limiting, configured around Cloudflare's trusted client IP header;
- **Captcha plugin + Cloudflare Turnstile** where OTP abuse protection requires a challenge;
- account deletion/fresh-session/email-verification primitives with before/after-delete hooks;
- **Test Utils plugin** in a test-only auth instance for user/session factories and OTP capture;
- CLI schema generation;
- official **Stripe plugin** for recurring billing.

Do **not** hand-roll OTP generation/expiry, session tokens, cookie auth, account deletion verification, auth test factories or basic subscription lifecycle handling.

### Email delivery

Use a transactional provider SDK behind a tiny adapter. Resend is the initial candidate and provides a Cloudflare-compatible API/SDK.

Mahjong Reference owns the message content and provider boundary, not SMTP/delivery infrastructure.

### Stripe / Better Auth Stripe plugin

Use the official Better Auth Stripe plugin for recurring Plus subscriptions wherever its model satisfies the Phase 0 contract.

The plugin already covers:

- Stripe Customer creation/linking;
- plan definitions including monthly/annual pricing;
- Checkout Session creation;
- subscription state persistence;
- secure Stripe webhook verification and common subscription-event handling;
- checkout/webhook race reconciliation;
- cancellation/update/restore flows;
- Customer Portal session creation;
- lifecycle hooks;
- client subscription helpers.

#### Billing data correction

Do **not** create separate Mahjong-owned `billing_customer` and `billing_subscription` tables merely to duplicate plugin-managed state.

For v1, application policy should derive `hasPlus(user)` from the plugin's authoritative subscription state. Do not build the generic `entitlement_grant` model until a demonstrated manual/promotional-access requirement actually needs it.

Stripe Billing Entitlements exists, but a second entitlement authority adds moving parts when the launch product currently has one `plus` subscription feature boundary. Revisit only if product packaging genuinely becomes feature-granular.

Custom billing code should remain limited to product policy and anything the plugin does not own.

### Stripe one-time credit purchases

The Better Auth Stripe plugin is strongest for recurring subscriptions. For voice-credit top-ups, use the Stripe SDK to create a server-side one-time Checkout Session associated with the existing Stripe Customer.

Reuse the **same Better Auth Stripe webhook endpoint and `onEvent` lifecycle hook** for fulfilment where compatible, rather than implementing a second Stripe webhook verification subsystem.

Keep durable credit fulfilment idempotent in Mahjong-owned application data.

### Stripe Billing Credits — deliberately not used for v1 voice wallet

Stripe Billing Credits are a real maintained product, but the public flow applies credits through usage-based subscription metering/invoice finalisation. That does not directly satisfy the real-time product requirement “does this user have another voice minute available right now?” without pulling voice charging into invoice-based billing.

Therefore retain the small Mahjong-owned append-only credit ledger for v1.

### Existing frontend dependencies

Reuse the application's existing UI/data libraries before adding new ones:

- TanStack React Query for authenticated fetch/mutation/loading/retry/cache behaviour where appropriate;
- Zod for API/input/payload validation;
- existing Radix primitives for dialogs/forms/accessibility interactions;
- Sonner for non-blocking status/error notifications;
- existing responsive/design system and tested accessibility patterns.

Do not introduce another state/query/form/component framework just because Plus has a backend.

### Testing

Use maintained testing primitives rather than custom fixture machinery:

- existing Vitest suite;
- Better Auth Test Utils for users, sessions and OTP capture;
- Cloudflare's current `@cloudflare/vitest-plugin` to run Worker/D1 tests inside `workerd`;
- Hono's request/app testing surface;
- outbound request mocks for Resend/Stripe/provider calls where needed.

Do not maintain hand-rolled fake auth/session implementations.

## Product-specific code we probably do own

These encode Mahjong Reference's actual product contract and are not good candidates for generic SaaS replacement.

### Canonical cloud-game serialization

We own the mapping between current local game truth and a versioned cloud record, including exact rules-profile/version and current round evidence.

### Explicit local → cloud adoption

We own the UX rule that signing in never silently replaces the game on the table.

### Revision conflict policy

The server can use a standard optimistic concurrency pattern, but Mahjong Reference owns the user-facing decision not to silently merge divergent Mahjong histories.

Do **not** add CRDT/general collaborative-sync machinery unless real requirements appear. This is primarily single-owner save/continue, not Google Docs.

### Local-first table behaviour

We own the rule that cloud failure cannot stop a physical hand/game. Generic query/retry libraries may implement transport mechanics, but the table behaviour is ours.

### Plus access/lapse semantics

We own what Plus permits and the cancellation/read-only policy, even if Better Auth/Stripe provide the underlying subscription state.

### Immutable service-credit semantics

Stripe can sell a credit pack, but Mahjong Reference owns what one service credit means, when it is consumed/refunded, and the append-only audit model. #147 owns eventual voice charging semantics.

### Voice evidence boundary

Providers may supply transcription/structured output. Mahjong Reference owns the strict evidence schema, Accept/Edit UX and deterministic scorer boundary.

## Explicit anti-reinvention checks by epic

### #207 / P1 — auth/backend

Expected composition: **Cloudflare + Hono + D1/Drizzle + Better Auth + Email OTP + Better Auth rate limiting/Turnstile + Resend + test utilities**.

Most work should be integration/configuration/testing, not auth implementation.

### #208 / P2 — cloud games

Expected composition: **existing game persistence model + Hono + D1/Drizzle + React Query/Zod + small revision API**.

Local-first frameworks such as Replicache/RxDB solve a broader replication problem. Do not import them unless the simple owner/snapshot/revision model fails a demonstrated requirement.

### #209 / P3 — subscriptions

Expected composition: **Better Auth Stripe plugin + Stripe-hosted Checkout/Portal**.

The current backlog should collapse materially: customer mapping, subscription persistence, webhook signature handling, checkout lifecycle and Portal are plugin responsibilities. Custom code should mainly adapt plugin subscription state to Mahjong's Plus/lapse policy and test it.

### #210 / P4 — credits

Expected composition: **Stripe one-time Checkout + existing Stripe webhook/plugin lifecycle + D1/Drizzle append-only ledger + uniqueness/idempotency constraints**.

Do not buy/build a general accounting platform for a small immediate service-credit balance, and do not force v1 voice metering through Stripe's invoice-time Billing Credits flow.

### #211 / P5 — voice

Expected composition: **provider SDK/API selected by #147 + existing strict evidence/domain scorer**.

Do not build speech recognition, general agent infrastructure or scoring AI.

### #212 / P6 — launch

Expected composition: provider dashboards/configuration and existing product UI. Better Auth account deletion, Stripe Portal/Tax and Cloudflare security/testing primitives should be used where they meet the actual policy.

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

The current fit assessment suggests the 44 acceptance concerns should consolidate to roughly **18–25 reviewable PRs** across the full Plus programme, not 44 bespoke implementations.

The goal is to satisfy every acceptance concern with the **least bespoke code we can responsibly own**.
