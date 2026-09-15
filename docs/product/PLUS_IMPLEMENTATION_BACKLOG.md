# Mahjong Reference Plus — implementation backlog

Status: **development-readiness plan**  
Parent programme: #206  
Architecture: `docs/product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`  
Delivery epics: #207–#212  
Reuse/build map: `docs/product/PLUS_REUSE_MAP.md`  
Concrete minimal-code stack: `docs/product/PLUS_LEGO_STACK.md`

This document decomposes the six Plus delivery epics into **bounded acceptance concerns**. They are intentionally smaller than the epics and suitable for focused implementation/review, but they are **not** a commitment to one bespoke PR per row.

Before implementation, each row must be classified using the reuse map as **CONFIGURE / INTEGRATE / ADAPT / BUILD**. Maintained platform/library capability should satisfy as many rows as possible in one coherent PR where that is safer and simpler than custom code.

Do **not** create every row as an open GitHub issue immediately. Keep this as the stable plan and promote only the next dependency-ready jobs into issues just before implementation.

## Sizing convention

- **S** — narrow acceptance concern; often config/thin adaptation or one focused code/test change.
- **M** — several connected files/behaviours with meaningful integration testing.
- **L** — substantial bounded product-specific integration; likely more than one implementation/review pass if no maintained module owns most of it.

Size is relative engineering scope **before reuse collapse**; a mature official plugin may reduce several S/M rows to one integration PR.

## Global invariants

Every job must preserve these programme rules:

1. Existing free scoring/table play requires no account.
2. Network/auth/billing failure does not stop an active physical game.
3. Deterministic Mahjong rules remain client/domain authority.
4. Exact rules profile/version travels with cloud game truth.
5. Cloud writes never silently overwrite divergent state.
6. Stripe/webhook state, not the browser redirect, grants durable paid value.
7. Subscription state and immediate usage credits remain distinct.
8. Payment card data stays with Stripe.
9. Cancellation is not account deletion.
10. Voice remains optional and gated by #147.
11. Commodity SaaS behaviour must be integrated from maintained modules where suitable rather than reimplemented.

---

# Phase 1 — backend/auth foundation (#207)

Expected Lego: Cloudflare Pages/Workers runtime, Hono, D1/Drizzle, Better Auth Drizzle adapter, Email OTP plugin, built-in Better Auth rate limiting, Better Auth Captcha + Cloudflare Turnstile where needed, Resend, Better Auth Test Utils, Cloudflare Vitest plugin.

## P1.1 — Cloudflare/Hono API + D1 development boundary
**Size:** M  
**Depends on:** Phase 0

Add the smallest server runtime alongside the existing Vite/Pages application: Hono `/api/*` routing, D1 binding configuration, local development wiring and a harmless health endpoint.

**Done when:** local and deployed-style development can call one server endpoint and D1 binding exists; static/prerendered free routes still build and behave unchanged.

## P1.2 — Drizzle schema and migration pipeline
**Size:** M  
**Depends on:** P1.1

Introduce Drizzle for D1, checked-in SQL migrations, migration commands/documentation and the initial application/auth schema boundary. Use Better Auth's schema generator for Drizzle rather than hand-authoring auth tables.

**Done when:** a blank local D1 can be brought deterministically to current schema and repeated migration runs are safe.

## P1.3 — Better Auth server/session foundation
**Size:** M  
**Depends on:** P1.1, P1.2

Mount Better Auth directly into Hono, using the official Drizzle adapter, secure cookie/session configuration and React client session discovery.

**Done when:** auth routes/session plumbing run in the Cloudflare runtime and authenticated server code can resolve the internal account ID without trusting a browser-supplied user ID.

## P1.4 — Email OTP + transactional mail transport
**Size:** M  
**Depends on:** P1.3

Configure Better Auth's Email OTP plugin and a provider-isolated send callback. Initial provider may be Resend.

**Done when:** a user can request a bounded-lifetime OTP, receive it through provider/test harness and establish a session without any custom OTP algorithm/lifecycle code.

## P1.5 — Auth abuse protection and failure handling
**Size:** S  
**Depends on:** P1.4

Configure Better Auth's built-in rate limits with the trusted Cloudflare client-IP header, add Turnstile via Better Auth's Captcha plugin where appropriate, and provide understandable mail-delivery failure/retry states.

**Done when:** repeated OTP requests are bounded server-side, bot-challenge policy is explicit, and provider failure cannot affect free play.

## P1.6 — Account shell and navigation state
**Size:** M  
**Depends on:** P1.3, P1.4

Create `/account`, signed-in/out states, sign-out, quiet global account affordance and responsive/accessibility behaviour using existing UI primitives.

**Done when:** account UI works on phone/tablet/desktop without intruding on active game UX; signed-out game/scorer behaviour is unchanged.

## P1.7 — Authenticated API helper + integration harness
**Size:** M  
**Depends on:** P1.3

Use Better Auth session middleware/helpers with Hono. Add integration tests using Better Auth Test Utils and Cloudflare's Workers Vitest integration.

**Done when:** later APIs can use one tested primitive for current-user identity and cannot accept another user's ID as authority; OTP/session fixtures are supplied by maintained test tooling rather than hand-rolled fakes.

## P1.8 — Secrets/deployment runbook for account foundation
**Size:** S  
**Depends on:** P1.1–P1.7

Document required Cloudflare bindings/secrets, local/test values and deployment/migration sequence; verify secrets cannot enter client bundles.

**Done when:** a clean environment can be configured from documented steps without committing secrets.

**Phase 1 acceptance concerns:** 8. Expected implementation consolidation: roughly 3–4 PRs.

---

# Phase 2 — cloud games, sync and preferences (#208)

Expected Lego: existing game persistence model, Hono, D1/Drizzle, Zod, TanStack React Query. Deliberately no CRDT/general sync engine unless the simple model fails a demonstrated requirement.

## P2.1 — Canonical cloud-game serialization contract
**Size:** M  
**Depends on:** P1.2

Define/version the cloud payload around the existing canonical setup + confirmed history + current draft/evidence model. Include exact rules-profile/version and game schema version.

**Done when:** representative current games round-trip serialize/deserialize without creating a second scoring truth and can be replayed deterministically.

## P2.2 — Cloud game schema + owned CRUD API
**Size:** M  
**Depends on:** P1.7, P2.1

Add `cloud_game`, stable IDs, owner scoping, revision/timestamps/status and authenticated create/list/get/archive endpoints using Hono/Drizzle/Zod.

**Done when:** one user cannot address another user's game and all returned games retain exact rules/version truth.

## P2.3 — Revision-checked cloud mutation API
**Size:** M  
**Depends on:** P2.2

Implement expected-revision writes and explicit conflict responses. No last-writer-wins fallback.

**Done when:** stale writes are rejected with enough server state/revision information for the client to resolve deliberately.

## P2.4 — Explicit local-game import/save-to-account flow
**Size:** M  
**Depends on:** P2.2

When a signed-in browser has a recoverable local game, offer deliberate save/import rather than replacing either side automatically.

**Done when:** sign-in never overwrites local state and a user can intentionally make the current local game cloud-backed.

## P2.5 — Background sync coordinator
**Size:** L  
**Depends on:** P2.3, P2.4

Use the existing local game as immediate truth and React Query for background transport/retry/status. Keep clean/saving/pending/failed/conflict states explicit.

**Done when:** confirmed game progress remains immediate locally; API failure never blocks hand progression; pending state survives/retries without silent loss.

## P2.6 — Conflict-resolution UX
**Size:** M  
**Depends on:** P2.3, P2.5

Provide explicit user resolution when server and local revisions diverge. Start with understandable choose-local/choose-cloud/copy-preservation behaviour rather than automatic history merging.

**Done when:** neither version is silently destroyed and conflict handling is usable on a phone at the table.

## P2.7 — Cross-device game library and continuation
**Size:** M  
**Depends on:** P2.2, P2.5

Build the account game library with in-progress/completed status and open/continue behaviour on another browser/device.

**Done when:** a game explicitly saved on device A can be opened on device B with exact rules profile/version and correct history/current draft.

## P2.8 — Account-backed table/player/rules preferences
**Size:** M  
**Depends on:** P1.7

Add a deliberately small preferences schema/API/UI for useful reusable defaults. Do not make it an arbitrary application-state JSON dump.

**Done when:** selected defaults can be saved and reused without changing existing signed-out defaults.

## P2.9 — Cloud data export
**Size:** S  
**Depends on:** P2.2, P2.8

Provide an authenticated export of the user's cloud games and explicit preferences in an understandable versioned form.

**Done when:** exported data covers the user-owned product data currently stored by Plus and cannot expose another account's data.

**Phase 2 acceptance concerns:** 9. Expected implementation consolidation: roughly 5–6 PRs.

---

# Phase 3 — Stripe subscription and Plus policy (#209)

Expected Lego: official Better Auth Stripe plugin + Stripe-hosted Checkout and Customer Portal. Do not duplicate plugin-managed Stripe customer/subscription/webhook state.

## P3.1 — Better Auth Stripe plugin + plan/customer configuration
**Size:** M  
**Depends on:** P1.2, P1.7

Install/configure `@better-auth/stripe`, link Stripe Customers to Better Auth users, and define configurable Plus monthly/annual plan identities.

**Done when:** one authenticated account maps to one plugin-managed Stripe customer and subscription configuration exists without separate Mahjong billing-customer/subscription tables.

## P3.2 — Plus subscription Checkout integration
**Size:** M  
**Depends on:** P3.1

Use the plugin's subscription upgrade/Checkout flow for configured Plus monthly/annual prices.

**Done when:** test-mode checkout starts from a signed-in account without custom Checkout lifecycle machinery or hard-coded business prices in access logic.

## P3.3 — Plugin webhook/lifecycle verification
**Size:** M  
**Depends on:** P3.1

Configure the official plugin webhook endpoint and prove its signature verification, duplicate/retry safety and common subscription lifecycle handling against Stripe test events.

**Done when:** forged events are rejected and plugin state converges correctly under duplicate/retried subscription events without a second custom webhook subsystem.

## P3.4 — Subscription-state reconciliation tests
**Size:** M  
**Depends on:** P3.3

Exercise activation, update, cancellation/lapse and delayed/out-of-order webhook cases against plugin-managed subscription state.

**Done when:** application-visible state safely reflects Stripe authority for launch-relevant scenarios.

## P3.5 — `hasPlus` product-policy adapter
**Size:** S  
**Depends on:** P3.4

Implement one small server-side application helper that maps plugin subscription state to Mahjong Reference Plus access. Do not build a generic entitlement-grant subsystem unless a real manual/promo access requirement appears.

**Done when:** paid APIs/UI can ask one authoritative application primitive whether the user currently has Plus.

## P3.6 — Checkout return/reconciliation UX
**Size:** S  
**Depends on:** P3.2, P3.5

Use the plugin's built-in Checkout/webhook race handling and add only the Mahjong-facing processing/success state needed by the account UI.

**Done when:** delayed webhook delivery cannot create false Plus state or trap the user in an ambiguous page.

## P3.7 — Customer Portal + billing account UI
**Size:** S/M  
**Depends on:** P3.1, P3.5

Use the plugin's Customer Portal action and show compact Plus/billing status in `/account`.

**Done when:** the correct signed-in customer can manage payment methods/invoices/cancellation through Stripe-hosted Portal without custom card UI.

## P3.8 — Cancellation/lapse/read-only enforcement
**Size:** M  
**Depends on:** P3.5, P2.7

Apply the humane lapse policy: free product remains usable, sign-in remains, existing cloud records stay readable/exportable, paid mutations/services are disabled as defined.

**Done when:** cancellation never deletes games/account data and all paid write paths use server Plus policy rather than client flags.

**Phase 3 acceptance concerns:** 8. Expected implementation consolidation: roughly 2–3 PRs if plugin fit remains sound.

---

# Phase 4 — immutable credits and top-ups (#210)

Expected Lego: Stripe SDK one-time Checkout using the existing customer; Better Auth Stripe webhook endpoint/`onEvent` hook for verified event delivery where compatible; tiny D1/Drizzle application ledger.

Stripe Billing Credits are deliberately not the v1 wallet because their ordinary public flow is tied to usage-based subscription invoicing rather than immediate application-unit depletion.

## P4.1 — Credit ledger schema and derived balance
**Size:** M  
**Depends on:** P1.2, P1.7

Add immutable `credit_entry` persistence, signed deltas/reasons/source/idempotency and server-side balance derivation.

**Done when:** balance is reproducibly the ledger sum; no mutable balance column is source of truth.

## P4.2 — Atomic/idempotent grant-consume-refund primitives
**Size:** L  
**Depends on:** P4.1

Implement server operations that prevent duplicate grants/charges, insufficient-balance partial debits and retry races.

**Done when:** duplicate idempotency keys cannot double-apply and refund is a compensating entry rather than history mutation.

## P4.3 — One-time credit Checkout + verified fulfilment
**Size:** M  
**Depends on:** P3.1, P3.3, P4.2

Create configured one-time top-up Checkout Sessions with the existing Stripe Customer and fulfil purchase credits from verified Stripe events, preferably through the existing Better Auth Stripe webhook lifecycle.

**Done when:** one test purchase results in exactly one ledger grant even under duplicate webhook delivery.

## P4.4 — Account credit balance/history UI
**Size:** S  
**Depends on:** P4.1

Expose understandable balance and compact transaction history without pretending credits equal currency/cash.

**Done when:** account UI reconciles with server-derived ledger balance and works responsively/accessibly.

## P4.5 — Allowance/manual adjustment primitives
**Size:** S  
**Depends on:** P4.2

Support auditable subscription allowances and controlled manual/promotional adjustments without selecting the eventual allowance amount.

**Done when:** allowance/adjustment sources are distinct ledger events and cannot require a schema change later.

**Phase 4 acceptance concerns:** 5. Expected implementation consolidation: roughly 2–3 PRs.

---

# Phase 5 — connect proven voice to Plus (#211)

**Hard gate:** #147 must first prove voice interpretation utility and define provider/cost/charging semantics.

Expected Lego: provider SDK/API selected by #147 + Hono route + Cloudflare rate limiting + existing strict evidence schema/domain scorer + credit primitives from Phase 4.

## P5.1 — Authenticated voice gateway contract
**Size:** M  
**Depends on:** #147 gate, P1.7

Add bounded server upload/request handling, authentication, validation, provider-secret isolation and Cloudflare route/user rate limiting. No scoring logic server-side.

## P5.2 — Proven transcription/interpretation provider integration
**Size:** L  
**Depends on:** P5.1, #147 provider decision

Integrate the selected transcription/structured-interpretation path and return transcript + strict existing evidence schema or explicit ambiguity/failure.

## P5.3 — Voice usage identity + credit metering
**Size:** L  
**Depends on:** P4.2, P5.2, #147 charging rule

Tie one submitted recording/request to idempotent reserve/consume/refund semantics so retries/provider failures cannot double-charge.

## P5.4 — Voice interpretation review/Edit UX
**Size:** M  
**Depends on:** P5.2

Connect `What I heard` / structured interpretation to the existing hand evidence UI and deterministic scorer with Accept/Edit fallback.

## P5.5 — Voice privacy, retention and evaluation telemetry
**Size:** M  
**Depends on:** P5.2

Implement the chosen raw-audio/transcript retention policy and minimal product metrics for acceptance/correction/failure/latency/cost, with no unnecessary gameplay collection.

**Phase 5 acceptance concerns:** 5. Expected implementation consolidation: roughly 3–4 PRs.

---

# Phase 6 — paid launch readiness (#212)

Expected Lego: Better Auth account-deletion lifecycle, Stripe Portal/Tax/live-mode tooling, Cloudflare security/testing primitives, existing product UI/accessibility patterns.

## P6.1 — Plus offer/pricing surface
**Size:** M  
**Depends on:** commercial price decision, P3.2

Create `/plus` with truthful Free/Plus comparison, monthly/annual packaging and clear links into sign-in/Checkout. Do not degrade free product to manufacture upgrade pressure.

## P6.2 — Privacy notice + processor/retention inventory
**Size:** M  
**Depends on:** implemented providers/features

Document actual account/cloud/billing/mail/voice data flows, subprocessors and retention. Only describe systems that really exist.

## P6.3 — Explicit account deletion and complete data lifecycle
**Size:** M/L  
**Depends on:** P2.9, P3.8

Use Better Auth's built-in account deletion/fresh-session/verification flow and its before/after-delete hooks; custom code owns only cleanup/export policy for Mahjong product data and any billing constraints.

**Done when:** deletion is deliberate/authenticated, product data cleanup is verified, and cancellation remains a separate action.

## P6.4 — Tax/VAT and international-sales configuration gate
**Size:** M  
**Depends on:** launch geography/pricing, P3.2

Confirm the real UK/international tax position and configure Stripe Checkout/Tax/customer-location options as required. Keep tax assumptions out of application entitlement logic.

**Done when:** launch has an explicit documented decision; this is not a substitute for professional tax advice where needed.

## P6.5 — Stripe live-mode configuration/go-live checklist
**Size:** M  
**Depends on:** P3.1–P3.8, P4.3 if credits launch

Configure live products/prices/webhooks/portal/secrets, exercise purchase/cancel/reconcile paths and verify test/live isolation.

## P6.6 — Security/abuse review
**Size:** M  
**Depends on:** implemented backend surface

Review Better Auth security configuration, ownership checks, Turnstile/rate limits, secret exposure, webhook/plugin configuration, credit idempotency and destructive actions.

## P6.7 — Failure-mode exercise
**Size:** M  
**Depends on:** P2.5, P3.5, P4.2

Deliberately exercise D1/API unavailable, auth email delayed, webhook delayed/duplicated, Checkout abandoned, sync conflict and entitlement expiry.

**Done when:** failures match the ADR and never strand active free/local play.

## P6.8 — Refund/cancellation/support runbook
**Size:** S  
**Depends on:** commercial policy decisions, P3/P4 implementation

Document operational handling for payment, login, sync/conflict, voice-credit refund and deletion problems using provider dashboards/hosted tools where appropriate.

## P6.9 — Paid-product accessibility/responsive/final regression
**Size:** M  
**Depends on:** launch UI complete

Run the established accessibility/responsive/product regression discipline across account/Plus/Checkout-return/cloud-library/credit surfaces and verify free scorer/table behaviour remains unchanged.

**Phase 6 acceptance concerns:** 9. Expected implementation consolidation: roughly 3–5 PRs.

---

# Likely critical path without voice

A usable paid cloud-save product does **not** depend on #147 or the credit ledger.

Likely path:

`P1.1 → P1.2 → P1.3 → P1.4/P1.7 → P2.1 → P2.2 → P2.3/P2.4 → P2.5 → P2.7 → P3.1 → P3.2/P3.3 → P3.5 → P3.8 → P6 launch gates`

Parallel work can include P1.6, P2.8/P2.9 and later launch documentation.

# Current programme estimate after Lego fit

- 44 bounded acceptance concerns remain useful as completeness checks.
- Expected full-programme delivery is closer to **18–25 reviewable PRs** if maintained modules fit as expected.
- The genuinely bespoke/high-risk concentration is Phase 2 sync/conflict, Phase 4 credit semantics and Phase 5 voice boundary — not auth, subscription plumbing or generic payment UI.

# First fresh-Codex wave

When the allowance resets, promote only the first coherent implementation wave:

1. Cloudflare/Hono + D1/Drizzle foundation (`P1.1` + `P1.2` if reviewably coherent).
2. Better Auth Drizzle/session + test foundation (`P1.3` + `P1.7`).
3. Email OTP/Resend + abuse protection/account shell (`P1.4` + `P1.5` + `P1.6` as one bounded auth UX integration if practical).
4. Cloud-game codec (`P2.1`) independently.

Do not ask Codex to implement Plus as a whole. Each prompt must name the provider/module Lego it is expected to reuse and explicitly prohibit rebuilding that capability.
