# Mahjong Reference Plus — Phase 0 architecture

Status: **implementation-ready architecture decision record**  
Parent: #206  
Date: 15 September 2026

## Product contract

Mahjong Reference Plus adds an optional paid account layer without weakening the free, local-first Table Companion.

> **Free should still let the table play. Plus should remember and remove work.**

### Free remains free

No account is required for the existing core product:

- manual hand scoring;
- whole-game tracking;
- who-pays-whom settlement;
- rules/reference/help content;
- local recovery on the current device;
- correction/history;
- Print / Save.

Existing free capability must not be moved behind login merely because accounts exist.

### Plus launch proposition

Working name: **Mahjong Reference Plus**.

Initial paid value:

- account-backed game library;
- cloud backup of in-progress and completed games;
- continue a saved game across devices;
- saved table/player/rules preferences;
- recover paid entitlement on another device;
- access to premium convenience services such as voice if #147 passes its product gate.

Voice usage remains separately metered even when Plus later includes an allowance.

### Commercial shape

- Plus is a **subscription**.
- Architecture supports both monthly and annual prices from day one.
- Launch packaging may expose both once pricing is settled without schema redesign.
- Voice/top-up usage uses separate **credit purchases**.
- Plus may later include a recurring voice-credit allowance, but that allowance is not part of account identity or subscription state.
- Primary commercial currency is GBP; sell internationally where payment/tax configuration makes this operationally sensible.

Exact price and included voice allowance are deliberately deferred until launch packaging is decided.

## User/account behaviour

### Authentication

Use passwordless email as the initial identity model.

Decision:

- **Better Auth** for application authentication;
- **email OTP** as the first sign-in method;
- no username/password database;
- no mandatory social login;
- passkeys/social providers may be added later without redefining the user identity model.

Email OTP is preferred to a magic link for the first mobile/table use because the user can remain in the same browser/app surface and enter the code rather than depending on email-client deep-link/browser handoff behaviour.

Transactional auth email is provider-isolated behind one mail adapter. Initial implementation may use Resend, which has direct Cloudflare support, but application/auth logic must not depend on Resend-specific concepts.

### Subscription lapse

Cancellation is not account deletion.

When Plus entitlement ends:

- free/local play remains fully available;
- the user can still sign in;
- existing cloud games remain readable/exportable;
- paid cloud mutation/sync and premium services may become read-only/disabled;
- no saved game is deleted merely because payment stops.

Account deletion is a separate explicit destructive action.

## Deployment and backend boundary

Keep the current React/Vite/Cloudflare Pages application.

Add optional server capability at the same product boundary:

```text
Browser
├─ deterministic Mahjong rules/scoring
├─ local game + local recovery
└─ optional authenticated /api services
   ├─ auth/session
   ├─ cloud games/preferences
   ├─ entitlements
   ├─ Stripe checkout/webhooks
   └─ later voice gateway/credit ledger
```

Decision:

- Cloudflare Pages Functions / Workers runtime for server endpoints;
- Cloudflare D1 for account/application relational data;
- server-side environment secrets for auth, Stripe, mail and later AI providers;
- no always-on conventional application server;
- no server migration of deterministic Mahjong scoring.

Core play must remain usable if every Plus API is unavailable.

## Database / migration strategy

Use one D1 application database for the initial Plus service.

Decision:

- D1 binding: conceptually `PLUS_DB`;
- Drizzle ORM with the Cloudflare D1 driver for typed application schema and queries;
- Better Auth through its Drizzle adapter using SQLite semantics;
- checked-in generated SQL migrations;
- production schema changes only through migrations, not runtime auto-migration.

Keep auth-owned tables logically distinct from Mahjong product/billing tables even though they share one physical D1 database initially.

A later operational reason may justify separating databases; the application-domain IDs must not rely on them being co-located.

## Minimum data model

Exact column names may change during implementation, but the domain boundaries do not.

### Auth-owned

Better Auth owns its required user/session/account/verification records.

Internal `user.id` is the Mahjong Reference account identity. Email is an authentication/contact attribute, not the primary product key.

### Stripe customer mapping

`billing_customer`

- `user_id` — unique internal user;
- `stripe_customer_id` — unique Stripe customer;
- timestamps.

One Mahjong Reference user maps to one Stripe customer.

### Subscription snapshot

`billing_subscription`

- internal user;
- Stripe subscription ID;
- Stripe price/product identity;
- current Stripe status;
- current period/end/cancellation metadata needed by the product;
- last processed Stripe event/update time.

This is a local operational snapshot. Stripe remains billing authority.

### Entitlement grants

`entitlement_grant`

- user;
- entitlement key, initially e.g. `plus`;
- source (`stripe-subscription`, `manual`, `promotion`, etc.);
- source reference;
- valid-from / valid-until where applicable;
- revoked metadata where applicable.

Effective entitlement is evaluated server-side. Do not trust a browser boolean such as `isPlus=true`.

Keeping entitlement separate from the subscription snapshot allows complimentary/manual grants and future packaging without corrupting billing state.

### Credit ledger

`credit_entry`

- immutable entry ID;
- user;
- signed credit delta;
- reason (`purchase`, `allowance`, `use`, `refund`, `adjustment`);
- source/reference;
- idempotency key;
- created timestamp.

Balance is derived from the ledger, not stored as an independently editable number.

A voice request/purchase/refund must have an idempotency identity so retries cannot debit/credit twice.

### Cloud games

`cloud_game`

- stable game ID;
- owner user ID;
- exact rules profile ID/version;
- game schema version;
- canonical game payload sufficient to replay/reconstruct the game;
- revision integer;
- created/updated timestamps;
- completed/archive metadata where needed.

The cloud representation must preserve the current architecture: setup + confirmed history + current in-progress draft/evidence, rather than persisting a second independently-calculated scoring truth.

Derived balances/results should be replayable from deterministic history where practical.

### Preferences

`user_preferences`

Small, explicit account-backed defaults only, for example:

- preferred rules profile;
- commonly reused player/table names where deliberately saved;
- game setup defaults.

Do not turn preferences into an unrestricted JSON dumping ground for application state.

## Cloud/local sync contract

Local-first is non-negotiable.

### First sign-in / import

Signing in must never silently replace the current browser game.

If a recoverable local game exists, present an explicit choice such as:

- keep playing locally;
- save/import this game to my account;
- open a different cloud game.

### Normal cloud save

Once a game is explicitly cloud-backed:

- local game state remains the immediate working copy during table play;
- successful confirmed/draft state changes may sync in the background;
- sync failure must not block scoring or progression;
- unsynced state is visibly recoverable and retried later.

### Conflict protection

Every cloud game has a monotonically increasing revision.

Mutation requests include the revision the client last read. The server updates only when that expected revision still matches. A conflict returns the newer server revision instead of silently using last-writer-wins.

The first implementation may resolve conflicts through a simple user choice rather than automatic field merging. Mahjong game histories must never be silently merged by heuristic.

## Billing architecture

Stripe is the external billing authority.

Decision:

- Stripe Checkout Sessions for subscription purchases;
- Stripe Checkout Sessions for one-time voice-credit/top-up purchases;
- Stripe Billing for recurring Plus subscription state;
- Stripe Customer Portal for payment method, invoices and cancellation management;
- server-created Checkout/Portal sessions only;
- verified Stripe webhooks update local billing state/entitlements;
- processed Stripe event IDs are stored/idempotent;
- a successful browser redirect alone never grants durable Plus/credits;
- Mahjong Reference never stores card details.

The account should pass/use its existing Stripe Customer in Checkout rather than creating unrelated guest purchases.

## Credit operations

Keep subscription entitlement and metered credits independent.

Conceptual operations:

```text
purchase +100
allowance +N
voice use -1
refund +1
adjustment +/-N
```

Credit balance is the sum of immutable ledger entries.

Consumption/refund operations must be atomic and idempotent. D1 transactional batch semantics are suitable for the bounded ledger writes/checks, with implementation tests covering retry/double-submit behaviour.

#147 remains authority for the eventual rule that converts voice duration/provider outcomes into credit consumption/refund.

## Privacy / data lifecycle

Accounts/cloud/payment services replace the current purely browser-local privacy boundary for signed-in users, so paid launch requires explicit documentation and controls.

Before public launch:

- explain what account data and cloud game data leave the device;
- document retention;
- expose account data export;
- expose explicit account deletion;
- keep subscription cancellation separate from deletion;
- document billing processor and transactional-email provider;
- define voice audio/transcript retention before voice external beta;
- store no payment-card data in D1;
- use the minimum game/personal data needed for the feature the user selected.

Player names inside a deliberately cloud-saved game are user product data and must be covered by the cloud-data privacy/export/delete boundary.

## Tax / international launch boundary

The product may be sold internationally, priced primarily in GBP.

The billing implementation must support Stripe's tax/customer-location facilities rather than baking UK-only tax assumptions into application code. Before live launch, confirm the business's actual UK VAT position and any international digital-services obligations; tax registration/legal treatment is a launch gate, not something inferred by the application.

## Failure rules

1. Auth unavailable → free local product continues.
2. D1/cloud API unavailable → cloud-backed game continues locally and shows pending sync.
3. Stripe unavailable → existing entitled user can still use locally cached/free functionality; new purchase/portal actions fail clearly and safely.
4. Webhook delayed → never grant entitlement from the browser redirect; show a bounded processing state and reconcile from server truth.
5. Email unavailable → existing signed-in sessions continue; new sign-in explains delivery failure and can retry.
6. Voice provider unavailable → no loss of game state; #147 credit refund rules apply when integrated.

## Security boundaries

- HttpOnly/Secure session cookies through the auth system;
- CSRF/origin protections supplied/configured for state-changing authenticated routes;
- all game/billing queries scoped by authenticated internal user ID server-side;
- never accept `user_id`, entitlement or credit balance from the browser as authority;
- Stripe webhook signatures verified before processing;
- webhook and credit operations idempotent;
- API/mail/Stripe/AI secrets exist only in Cloudflare server environment;
- rate-limit OTP requests and premium-service endpoints;
- account export/delete require a current authenticated session and appropriate re-verification where destructive risk warrants it.

## Routes / UX surface

Initial additions should remain small:

- `/account` — sign in, account state, Plus status, saved games/preferences;
- a quiet `Sign in` / account affordance in normal navigation;
- `/plus` or equivalent offer page when launch packaging is ready;
- Stripe-hosted Checkout/Customer Portal for billing rather than custom card-management screens.

Active game play must not become visually dominated by account/subscription UI.

## Deferred commercial decisions

These must be decided before paid launch but do not block backend implementation:

- exact monthly price;
- exact annual price/discount;
- exact included voice allowance, if any;
- credit-pack sizes/prices;
- introductory/free-trial policy;
- whether both monthly and annual options appear on day one.

The schema/API must support these as product configuration rather than hard-coded business logic.

## Implementation slices

Phase 0 is complete when this ADR is accepted and the implementation work is split into bounded issues.

Recommended sequence:

1. backend/D1/auth foundation;
2. cloud game library + preferences + local import/conflict behaviour;
3. Stripe subscription + Plus entitlement;
4. credit purchase/immutable ledger;
5. connect #147 voice after its own product gate;
6. paid launch/privacy/support readiness.

Each slice must leave the free local scorer/game fully operational and independently testable.

## Architecture invariants

- Free does not require login.
- Deterministic scoring remains client/domain code, not a paid server service.
- Exact rules-profile/version travels with every saved game.
- Local play wins over network availability.
- Cloud sync never silently overwrites a local or newer cloud game.
- Stripe is billing authority; the browser is not.
- Entitlements and usage credits are separate concepts.
- Ledger events are immutable/idempotent.
- Cancellation never silently deletes user games.
- Voice is optional and cannot become necessary to use Mahjong Reference.
