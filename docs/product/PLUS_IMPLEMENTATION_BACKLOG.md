# Mahjong Reference Plus — implementation backlog

Status: **development-readiness plan**  
Parent programme: #206  
Architecture: `docs/product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`  
Delivery epics: #207–#212

This document decomposes the six Plus delivery epics into **bounded implementation jobs**. The jobs are intentionally smaller than the epics and are intended to be suitable for focused Codex sessions and independently reviewable changes where practical.

Do **not** create every row as an open GitHub issue immediately. Keep this as the stable plan and promote the next dependency-ready jobs into issues just before implementation. This preserves a readable issue tracker while making the true workload visible.

## Sizing convention

- **S** — narrow infrastructure/UI/test slice; usually one focused implementation session.
- **M** — several connected files/behaviours with meaningful integration testing.
- **L** — substantial bounded integration; still one product decision, but likely more than one implementation/review pass.

Size is relative engineering scope, not elapsed calendar time.

## Global invariants

Every job must preserve these programme rules:

1. Existing free scoring/table play requires no account.
2. Network/auth/billing failure does not stop an active physical game.
3. Deterministic Mahjong rules remain client/domain authority.
4. Exact rules profile/version travels with cloud game truth.
5. Cloud writes never silently overwrite divergent state.
6. Stripe/webhook state, not the browser redirect, grants durable paid value.
7. Entitlement and usage credits remain separate.
8. Payment card data stays with Stripe.
9. Cancellation is not account deletion.
10. Voice remains optional and gated by #147.

---

# Phase 1 — backend/auth foundation (#207)

## P1.1 — Cloudflare Functions + D1 development boundary
**Size:** M  
**Depends on:** Phase 0

Add the smallest server runtime alongside the existing Vite/Pages application: `/api/*` Functions/Workers routing, D1 binding configuration, local development wiring and a harmless health endpoint.

**Done when:** local and deployed-style development can call one server endpoint and D1 binding exists; static/prerendered free routes still build and behave unchanged.

## P1.2 — Drizzle schema and migration pipeline
**Size:** M  
**Depends on:** P1.1

Introduce Drizzle for D1, checked-in SQL migrations, migration commands/documentation and the initial application/auth schema boundary.

**Done when:** a blank local D1 can be brought deterministically to current schema and repeated migration runs are safe.

## P1.3 — Better Auth server/session foundation
**Size:** M  
**Depends on:** P1.1, P1.2

Integrate Better Auth with D1/Drizzle, secure cookie/session configuration and client session discovery. No email delivery yet.

**Done when:** auth routes/session plumbing run in the Cloudflare runtime and authenticated server code can resolve the internal account ID without trusting a browser-supplied user ID.

## P1.4 — Transactional mail adapter + email OTP
**Size:** M  
**Depends on:** P1.3

Add a provider-isolated auth mail interface and implement passwordless email OTP request/verification. Initial provider may be Resend, but auth/domain code must not depend on provider-specific objects.

**Done when:** a user can request a bounded-lifetime OTP, receive it in the configured provider/test harness and establish a session.

## P1.5 — OTP abuse/rate-limit and failure handling
**Size:** S  
**Depends on:** P1.4

Add request throttling/abuse protection, neutral account-enumeration-safe responses, retry behaviour and understandable mail-delivery failure states.

**Done when:** rapid/repeated OTP requests are bounded server-side and provider failure cannot affect free play.

## P1.6 — Account shell and navigation state
**Size:** M  
**Depends on:** P1.3, P1.4

Create `/account`, signed-in/out states, sign-out, quiet global account affordance and responsive/accessibility behaviour.

**Done when:** account UI works on phone/tablet/desktop without intruding on active game UX; signed-out game/scorer behaviour is unchanged.

## P1.7 — Authenticated API helper + integration harness
**Size:** M  
**Depends on:** P1.3

Create reusable server authorization helpers and integration tests for authenticated versus unauthenticated API calls, cookie/session handling and user scoping.

**Done when:** later APIs can use one tested primitive for current-user identity and cannot accept another user's ID as authority.

## P1.8 — Secrets/deployment runbook for account foundation
**Size:** S  
**Depends on:** P1.1–P1.7

Document required Cloudflare bindings/secrets, local/test values and deployment/migration sequence; verify secrets cannot enter client bundles.

**Done when:** a clean environment can be configured from documented steps without committing secrets.

**Phase 1 total:** 8 jobs.

---

# Phase 2 — cloud games, sync and preferences (#208)

## P2.1 — Canonical cloud-game serialization contract
**Size:** M  
**Depends on:** P1.2

Define/version the cloud payload around the existing canonical setup + confirmed history + current draft/evidence model. Include exact rules-profile/version and game schema version.

**Done when:** representative current games round-trip serialize/deserialize without creating a second scoring truth and can be replayed deterministically.

## P2.2 — Cloud game schema + owned CRUD API
**Size:** M  
**Depends on:** P1.7, P2.1

Add `cloud_game`, stable IDs, owner scoping, revision/timestamps/status and authenticated create/list/get/archive endpoints.

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

## P2.5 — Background sync state machine
**Size:** L  
**Depends on:** P2.3, P2.4

Add local-first background synchronization for cloud-backed games, including clean/saving/pending/failed/conflict states and retry after network recovery.

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

**Phase 2 total:** 9 jobs.

---

# Phase 3 — Stripe subscription and entitlement (#209)

## P3.1 — Billing schema + Stripe customer mapping
**Size:** M  
**Depends on:** P1.2, P1.7

Add billing customer/subscription/event/entitlement persistence and a server-only get-or-create Stripe Customer mapping for the authenticated internal user.

**Done when:** one account maps to one Stripe customer and no browser-provided customer ID is authoritative.

## P3.2 — Plus Checkout Session endpoint
**Size:** M  
**Depends on:** P3.1

Create authenticated server-side Stripe Checkout Sessions for configured Plus monthly/annual prices using the existing customer.

**Done when:** test-mode checkout starts from a signed-in account without hard-coding business prices into entitlement logic.

## P3.3 — Stripe webhook verification + event idempotency
**Size:** M  
**Depends on:** P3.1

Add raw-body signature verification, processed-event storage and safe duplicate/retry handling.

**Done when:** forged events are rejected and replaying the same valid event cannot apply state twice.

## P3.4 — Subscription snapshot reconciliation
**Size:** L  
**Depends on:** P3.3

Translate relevant verified Stripe subscription/customer events into the local operational subscription snapshot, including delayed/out-of-order/retried webhook behaviour.

**Done when:** local billing state converges safely on Stripe authority for activation, update and cancellation/lapse scenarios.

## P3.5 — Effective Plus entitlement evaluator
**Size:** M  
**Depends on:** P3.4

Implement server-side `plus` entitlement grants/evaluation independently of the raw subscription row, leaving room for manual/promotional grants.

**Done when:** paid APIs can ask one authoritative server primitive whether the user currently has Plus.

## P3.6 — Checkout return/reconciliation UX
**Size:** S  
**Depends on:** P3.2, P3.5

Handle return from hosted Checkout without treating the redirect as payment proof. Show a bounded processing/retry state until server truth confirms entitlement.

**Done when:** delayed webhook delivery cannot create false Plus state or trap the user in an ambiguous page.

## P3.7 — Customer Portal + billing account UI
**Size:** M  
**Depends on:** P3.1, P3.5

Create authenticated Customer Portal session endpoint and account UI for current Plus/billing status and managing billing through Stripe-hosted surfaces.

**Done when:** the correct signed-in customer can manage payment method/invoices/cancellation without custom card UI.

## P3.8 — Cancellation/lapse/read-only enforcement
**Size:** M  
**Depends on:** P3.5, P2.7

Apply the humane lapse policy: free product remains usable, sign-in remains, existing cloud records stay readable/exportable, paid mutations/services are disabled as defined.

**Done when:** cancellation never deletes games/account data and all paid write paths use server entitlement rather than client flags.

**Phase 3 total:** 8 jobs.

---

# Phase 4 — immutable credits and top-ups (#210)

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

## P4.3 — One-time credit Checkout + fulfilment
**Size:** M  
**Depends on:** P3.1, P3.3, P4.2

Create configured top-up Checkout Sessions and grant purchase credits only from verified fulfilment/webhook truth.

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

**Phase 4 total:** 5 jobs.

---

# Phase 5 — connect proven voice to Plus (#211)

**Hard gate:** #147 must first prove voice interpretation utility and define provider/cost/charging semantics.

## P5.1 — Authenticated voice gateway contract
**Size:** M  
**Depends on:** #147 gate, P1.7

Add bounded server upload/request handling, authentication, validation, provider-secret isolation and rate limiting. No scoring logic server-side.

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

**Phase 5 total:** 5 jobs.

---

# Phase 6 — paid launch readiness (#212)

## P6.1 — Plus offer/pricing surface
**Size:** M  
**Depends on:** commercial price decision, P3.2

Create `/plus` with truthful Free/Plus comparison, monthly/annual packaging and clear links into sign-in/Checkout. Do not degrade free product to manufacture upgrade pressure.

## P6.2 — Privacy notice + processor/retention inventory
**Size:** M  
**Depends on:** implemented providers/features

Document actual account/cloud/billing/mail/voice data flows, subprocessors and retention. Only describe systems that really exist.

## P6.3 — Explicit account deletion and complete data lifecycle
**Size:** L  
**Depends on:** P2.9, P3.8

Implement authenticated destructive deletion with appropriate re-verification, server-side data removal/anonymisation plan and clear separation from subscription cancellation.

## P6.4 — Tax/VAT and international-sales configuration gate
**Size:** M  
**Depends on:** launch geography/pricing, P3.2

Confirm the real UK/international tax position, configure Stripe tax/location facilities as required and keep tax assumptions out of application entitlement logic.

**Done when:** launch has an explicit documented decision; this is not a substitute for professional tax advice where needed.

## P6.5 — Stripe live-mode configuration/go-live checklist
**Size:** M  
**Depends on:** P3.1–P3.8, P4.3 if credits launch

Configure live products/prices/webhooks/portal/secrets, exercise purchase/cancel/reconcile paths and verify test/live isolation.

## P6.6 — Security/abuse review
**Size:** M  
**Depends on:** implemented backend surface

Review auth cookies/origin/CSRF assumptions, ownership checks, OTP/premium rate limits, secret exposure, webhook verification, idempotency and destructive actions.

## P6.7 — Failure-mode exercise
**Size:** M  
**Depends on:** P2.5, P3.5, P4.2

Deliberately exercise D1/API unavailable, auth email delayed, webhook delayed/duplicated, Checkout abandoned, sync conflict and entitlement expiry.

**Done when:** failures match the ADR and never strand active free/local play.

## P6.8 — Refund/cancellation/support runbook
**Size:** S  
**Depends on:** commercial policy decisions, P3/P4 implementation

Document operational handling for payment, login, sync/conflict, credit/refund and deletion problems with clear escalation/records.

## P6.9 — Final accessibility/responsive/free-regression pass
**Size:** M  
**Depends on:** all launch UI

Run WCAG-regression evidence plus phone/tablet/desktop flows, signed-out/free baseline and account/Plus purchase/manage/cancel journeys.

**Phase 6 total:** 9 jobs.

---

# Programme size

| Phase | Epic | Bounded jobs |
|---|---|---:|
| 1 | #207 backend/auth | 8 |
| 2 | #208 cloud games/preferences | 9 |
| 3 | #209 Stripe/entitlement | 8 |
| 4 | #210 credit ledger | 5 |
| 5 | #211 voice integration | 5 |
| 6 | #212 launch readiness | 9 |
| **Total** |  | **44** |

The earlier 24–38 estimate was deliberately rough. Once failure modes, security, account lifecycle and deployability are separated rather than hidden inside the six epics, the honest current plan is **44 bounded jobs**. Some adjacent S jobs may later be sensibly combined in one PR/Codex session, but they should remain separate acceptance concerns.

# Critical path without voice

The shortest route to a genuinely usable paid cloud product is approximately:

`P1.1 → P1.2 → P1.3 → P1.4/P1.7 → P2.1 → P2.2 → P2.3/P2.4 → P2.5 → P2.7 → P3.1 → P3.2/P3.3 → P3.4 → P3.5 → P3.8 → launch gates`

Voice and credits can remain off this initial path. This means **Plus can launch as cloud memory/cross-device convenience even if #147 is not yet ready**.

# Suggested first fresh-Codex wave

Do not start with Stripe or voice. The first allowance should prove the new application boundary with the least irreversible complexity:

1. **P1.1** — Cloudflare Functions + D1 boundary.
2. **P1.2** — Drizzle migration pipeline.
3. **P1.3** — Better Auth session foundation.
4. **P1.7** — reusable authenticated API harness.
5. **P1.4** — email OTP once auth/session primitives are stable.

After that checkpoint, review architecture fit and only then continue into account UI/cloud games.

# Issue-promotion rule

When implementation begins:

1. take only the next dependency-ready job(s) from this file;
2. create a GitHub issue containing that job's scope, dependencies, non-goals and concrete acceptance checks;
3. give Codex that issue, not an entire epic;
4. merge/review it before promoting work whose architecture depends on it;
5. update this document only when the plan itself changes materially.

This keeps GitHub's open issue list as an active work queue rather than duplicating the entire programme plan.