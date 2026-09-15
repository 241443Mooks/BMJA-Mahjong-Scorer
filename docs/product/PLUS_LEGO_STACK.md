# Mahjong Reference Plus — minimal-custom-code “Lego” stack

Status: **module-fit recommendation before implementation**  
Parent: #206  
Architecture: `MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`  
Backlog: `PLUS_IMPLEMENTATION_BACKLOG.md`  
Reuse constraints: `PLUS_REUSE_MAP.md`

## Decision rule

> **Use maintained provider/library capability for commodity SaaS plumbing. Write custom code only where Mahjong Reference has a product-specific rule.**

The Plus programme should be assembled from existing, maintained pieces rather than treating every acceptance concern as a custom subsystem.

## Recommended stack

### 1. Keep the existing React/Vite frontend and Cloudflare deployment

Do not migrate the public product to another application framework simply because Plus needs a backend.

Add an API surface beside the existing application using Cloudflare Pages Functions / Workers runtime capability.

Use **Hono** as the small API router/middleware layer. Hono has first-class Cloudflare Pages/Workers support, mounts Better Auth directly using Web Standard `Request`/`Response`, and can reuse the repo's existing Zod schemas through `@hono/zod-validator` or Standard Schema validation.

Why this is preferable to custom routing:

- no home-grown router/middleware layer;
- clean `/api/*` boundary;
- typed route composition;
- simple authenticated-session middleware;
- optional Hono RPC client typing if useful later;
- no need to replace React/Vite.

### 2. D1 + Drizzle remains the product-data layer

Use Cloudflare D1 for Plus relational data and Drizzle for Mahjong product tables and checked-in migrations.

For Better Auth, prefer the **official Drizzle adapter** rather than Better Auth's direct/native D1 mode for v1.

Reason: native D1 is viable, but the application already needs Drizzle for product tables. Using the Drizzle adapter allows Better Auth's CLI to generate the required Drizzle schema and keeps **one schema/migration toolchain** instead of maintaining Better Auth/Kysely migrations alongside separate Drizzle product migrations.

This is an operational-simplicity choice, not a belief that native D1 is unsupported.

### 3. Better Auth owns identity/account lifecycle

Use Better Auth instead of custom authentication code.

Use these maintained capabilities:

- core user/session/account/verification model;
- React auth client/session hooks;
- **Email OTP plugin** for passwordless sign-in;
- built-in secure session cookies;
- built-in **rate limiting**, configured to trust Cloudflare's `cf-connecting-ip` header;
- **Captcha plugin + Cloudflare Turnstile** on OTP/sign-in endpoints if abuse protection is needed;
- built-in account deletion with fresh-session/email-verification support and before/after-delete hooks;
- **Test Utils plugin** in test-only configuration for users, sessions and OTP capture;
- Better Auth CLI schema generation.

Do not build:

- OTP generation/expiry/verification;
- password handling;
- session token/cookie machinery;
- account-enumeration/auth lifecycle from first principles;
- bespoke delete-account verification;
- bespoke auth test factories.

A transactional email provider only implements Better Auth's `sendVerificationOTP` callback.

### 4. Resend is the default OTP mail transport

Use Resend (or another provider with the same tiny adapter contract) to deliver OTP/account lifecycle mail.

Mahjong Reference owns message copy and a tiny mail adapter, not SMTP infrastructure or delivery retry systems.

Provider choice must remain swappable.

### 5. Better Auth's official Stripe plugin owns recurring billing plumbing

Use `@better-auth/stripe` for the Plus subscription wherever its model satisfies the product contract.

It already provides the commodity pieces we would otherwise have to build and secure:

- Stripe Customer creation/linking;
- subscription plan definitions;
- monthly/annual price support;
- Checkout Session creation;
- subscription status persistence;
- webhook signature verification and common subscription-event handling;
- checkout/webhook race reconciliation;
- cancel/restore/upgrade actions;
- Customer Portal session creation;
- lifecycle hooks;
- client subscription helpers.

### Consequence for the Phase 0 billing schema

Do **not** create separate Mahjong-owned `billing_customer` and `billing_subscription` tables merely to duplicate what the Better Auth Stripe plugin already stores.

Treat plugin-managed customer/subscription state as the subscription source exposed to application policy.

For v1, `hasPlus(user)` should be a thin application policy around the plugin's authoritative active/trialing subscription state.

Do **not** build a generic `entitlement_grant` system in v1 unless a real requirement appears for complimentary/manual grants that cannot be handled simply. Stripe Billing Entitlements also exists, but adding a second entitlement authority for one `plus` feature would increase rather than reduce moving parts today.

If manual/promotional access later becomes necessary, add the smallest explicit override mechanism then.

### 6. Use Stripe-hosted surfaces for money UI

Use Stripe Checkout and Customer Portal.

Do not build custom card forms, invoice screens, payment-method management or cancellation plumbing.

At launch, use Stripe Checkout's supported tax/location options and Stripe Tax where the actual tax decision requires them rather than encoding UK/international tax arithmetic in Mahjong Reference.

### 7. Keep one small custom credit ledger for voice

Do **not** replace the proposed `credit_entry` ledger with Stripe Billing Credits for v1.

Stripe Billing Credits are currently designed around usage-based subscription invoicing; public-preview credits are consumed through invoice/meter flows rather than acting as the immediate real-time application wallet needed for “can this user spend one more voice minute right now?”. Real-time burn-down is not the ordinary public flow.

Therefore keep a deliberately tiny D1 append-only ledger for Mahjong service credits:

- purchase;
- allowance;
- use;
- refund;
- adjustment;
- idempotency key.

Use Stripe only to collect money for top-ups. Create one-time Checkout Sessions server-side with the existing Stripe Customer and fulfil credits after verified Stripe events.

Prefer routing relevant one-time-payment events through the **same Better Auth Stripe webhook endpoint / `onEvent` hook** rather than creating a second Stripe webhook-verification subsystem.

### 8. Do not buy a general sync engine for cloud games

Replicache/RxDB-style local-first sync engines exist, but they solve a broader collaborative/offline replication problem than Mahjong Reference currently has.

Our requirement is narrower:

- one owner;
- one versioned game snapshot/history;
- local play is already canonical during the physical game;
- background upload/download;
- explicit optimistic `revision` check;
- never silently merge divergent histories.

The smaller implementation is:

`existing local game persistence + Hono API + D1/Drizzle + Zod + TanStack Query + integer revision`

Do not add CRDTs, realtime subscriptions, push infrastructure or a second client database until a demonstrated use case requires them.

### 9. Reuse existing frontend Lego

Do not add another frontend architecture for Plus.

Use what the repo already has:

- TanStack React Query — API cache/mutations/retry/background status;
- Zod — request/payload schemas;
- Radix primitives — accessible dialogs/popovers/forms where useful;
- Sonner — quiet recoverable status/errors;
- current responsive/accessibility patterns;
- existing game persistence/model as the canonical local truth.

### 10. Use Cloudflare and Better Auth security primitives

For auth endpoints:

- Better Auth built-in rate limiting;
- trusted Cloudflare client IP header configuration;
- Better Auth Captcha plugin + Cloudflare Turnstile if OTP abuse warrants challenge protection.

For non-auth premium endpoints such as voice:

- Cloudflare Workers Rate Limiting binding at the route/user boundary.

Do not build a distributed rate limiter.

### 11. Use maintained testing Lego

Use:

- existing Vitest suite;
- Better Auth **Test Utils** for test users/sessions and OTP capture;
- current Cloudflare **`@cloudflare/vitest-plugin`** for Worker/D1 tests in `workerd`;
- Hono's request testing / exported app handlers;
- outbound-request mocks for Resend/Stripe/provider calls where needed.

This avoids hand-building auth fixtures or pretending Node mocks behave exactly like Cloudflare Workers.

## What remains genuinely custom

After the module-fit pass, the main bespoke Plus code should be limited to these product seams:

1. **Cloud game codec** — local canonical game ↔ versioned cloud payload, including exact rules-profile/version.
2. **Owned cloud-game API/repository** — CRUD scoped to the authenticated owner.
3. **Optimistic revision rule** — reject stale writes instead of silent overwrite.
4. **Local-to-cloud adoption UX** — signing in never replaces the table's current game.
5. **Sync coordinator/conflict UX** — local play keeps working; user deliberately resolves divergence.
6. **Small preferences model** — only reusable Mahjong/table defaults.
7. **`hasPlus` application policy** — adapt subscription status to product access/lapse rules.
8. **Voice credit ledger** — immediate auditable service-unit balance.
9. **Voice gateway/evidence adapter** — only after #147; AI populates evidence, deterministic scorer remains authority.
10. **Product/privacy/export cleanup hooks** — domain data belonging to an account.

Everything else should be provider configuration, plugin wiring, schema generation or tests around maintained components.

## Revised implementation shape

The 44 backlog rows remain useful as acceptance checks, but they should **not** become 44 implementation PRs.

Expected consolidation after this Lego pass:

- Phase 1 auth/backend: roughly **3–4 PRs**, not 8 bespoke systems;
- Phase 2 cloud game product work: roughly **5–6 PRs**;
- Phase 3 subscriptions: roughly **2–3 PRs** if the Better Auth Stripe plugin fit is confirmed in code;
- Phase 4 credits: roughly **2–3 PRs**;
- Phase 5 voice integration: roughly **3–4 PRs** after #147;
- Phase 6 launch/ops: roughly **3–5 PRs**, much of it configuration/review rather than application code.

Working expectation: around **18–25 reviewable PRs** for the full Plus programme, with only a minority representing substantial new custom subsystems.

This is a planning estimate, not a commitment; adjacent small configuration concerns should share a PR when they form one coherent integration.

## First implementation wave after Codex reset

Do not start with 44 tickets.

Recommended first wave:

1. **Cloudflare/Hono backend shell + D1/Drizzle migration pipeline**.
2. **Better Auth integration using Drizzle + Email OTP + test utilities**.
3. **Resend OTP transport + Better Auth rate limits/Turnstile protection + account shell**.
4. **Cloud-game codec + source-linked round-trip fixtures**.

After those are reviewed, promote the next dependency-ready cloud/save jobs.

Do not touch subscription billing until the Better Auth Stripe plugin has been exercised against the actual worker/D1 stack in a bounded spike; do not touch voice metering until #147 passes its product gate.

## Principle

> **The hard part we should own is Mahjong behaviour. The boring SaaS parts should be assembled from boring, maintained SaaS parts.**
