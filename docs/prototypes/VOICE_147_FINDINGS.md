# Issue #147: Phase 0 investigation (incomplete)

This branch is a contract experiment, not a working voice prototype. It must not be deployed as a voice feature.

## Existing entry and adapter

`HandScorer` in `src/App.tsx` keeps `sets` as `UIHandSet[]`: each completed group is a `HandSet`, while the working picker has `tile: null`. It separately owns layout mode, loose/remaining tiles, blank provenance, bonus tiles, winner and event evidence, winds and the exact active profile. It derives `MahjongHand` for the existing profile runtime. In a tracked game, context supplies authoritative locked facts. `HandSet.visibility` admits only exposed or concealed; missing visibility cannot safely be inserted into it.

A future integration must keep proposals separately, require confirmation of all uncertain group fields, and append to the current `sets` using a functional update and unique stable IDs. Preserve the unfinished picker and every unrelated state field. It must apply existing picker restrictions and the exact selected profile's validation to the combined draft, taking care that incomplete winning and hybrid drafts have distinct validation paths. Do not use the scorer's `set()` default for unknown exposure. Do not overwrite locked game context or silently invalidate winning-tile provenance. Confirm behaviour for special layouts and hybrid winner resolution before enabling append there.

The experimental `voice-evidence.ts` implements only the schema boundary and an append primitive. It checks basic tile and chow structure, but **does not** enforce complete domain/profile validation, copy counts, structural limits, layout compatibility, winning provenance or consent. It is not connected to the app. Its schema is not yet a full voice interpretation contract; bonus, ungrouped and contextual evidence require design. Treat unparsed and ambiguous text as blocking evidence, not a successful interpretation.

## Still needed before private testing

- Build and evaluate a typed-transcript interpreter with constrained output, real evaluation cases, explicit correction/ambiguity handling and an editable visual confirmation using existing tile artwork and entry controls.
- Integrate safely with the current draft, active profile and existing deterministic validation/scoring paths; prove parity across profiles and partial hands.
- Implement a private Cloudflare endpoint with server-side OpenAI calls, authentication and durable abuse limits; bound payload size and recording time, avoid retaining inputs, and verify the provider's current transcription API and data handling. Use an encrypted Cloudflare environment secret for the API key; never send the key to the browser or request it in chat.
- Add optional deliberate microphone recording and verify realistic recordings, accents and noise with consent. No recordings have been tested on this branch.
- Provide exact owner setup and a protected test route; deployment requires the owner's approval. Do not enable a public route or billing.

The tests here cover only this narrow boundary and one deterministic score parity example. They do not establish speech recognition or the Phase 0/1 gate.
