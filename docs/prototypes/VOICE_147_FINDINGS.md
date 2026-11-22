# Issue #147: typed voice experiment — local only

This draft contains a developer-only typed-transcript prototype. It is **not ready for private deployment or merger**. No microphone, production route, public navigation or billing is added.

## Scope and hand integration

Run `/voice-test` only on the local development server below. The user can enter a description, see what was submitted and review proposed group tiles using the existing artwork. Exposure remains unknown unless supplied or explicitly selected. Edit the text and interpret again to correct a tile, group, ambiguity or unparsed text; Accept is blocked until all proposals are resolved. The current version supports only standalone British BMJA 1.0 non-winning grouped hands, in normal mode, without remaining tiles or blank evidence. Other rules, winner, special-layout and tracked-game cases fail closed. Bonus, loose-tile, winner and context speech is retained as unresolved, not applied.

`HandScorer` holds completed `HandSet`s and an unfinished `tile: null` picker alongside separate context. The adapter appends uniquely identified confirmed groups while preserving these fields. It checks structural and four-copy limits and invokes the selected compiled profile's hand validator before the existing scorer sees the new state. It does not overwrite game facts or winning-tile evidence. No AI score is used. A mocked UI test verifies one manual group, its working picker and a later accepted group; another rejects a fifth physical tile. The existing adapter test compares one deterministic partial-hand result with manual entry. This is not proof for other modes or complete winning hands.

## Local setup for the owner

1. Initialise the pinned tile-artwork submodule: `git submodule update --init --depth 1`.
2. Install dependencies using the repository's pnpm version: `pnpm install --frozen-lockfile`.
3. In a private local shell, securely configure the existing OpenAI project key as the `OPENAI_API_KEY` environment variable for the server process. For a transient shell session, `read -rs OPENAI_API_KEY; export OPENAI_API_KEY` reads it without displaying it; enter it directly in that shell, never in chat. Do not save it in the repository, browser, logs or a tracked file. Use a non-production project/key if available.
4. Start from the repository root: `PORT=5173 BASE_PATH=/ VOICE_TEST_LOCAL=1 pnpm --filter @workspace/mahjong-scorer dev --host 127.0.0.1`.
5. On the same machine open `http://127.0.0.1:5173/voice-test`. The middleware requires that exact loopback host and Origin; it is available only when `VOICE_TEST_LOCAL=1`. Stop the server and `unset OPENAI_API_KEY` when done.

The server sends the text to OpenAI's Responses API using `gpt-4o-mini-2024-07-18` and strict structured output, with `store: false`. OpenAI receives the submitted description: consult the project's current provider data-retention settings and terms before using real hand descriptions. The code does not save or log transcript or response bodies; this does not guarantee provider-side zero retention. The local middleware limits the request body to 4 KiB, text to 2,000 characters, and requests to ten per minute per process. It rejects non-loopback connections and unexpected Origin/Host, and returns generic errors. It is not an authentication or distributed-rate-limit solution and must not be exposed through a proxy, tunnel or public host.

## Evaluation and limits

`voice-dev/evaluation.json` has 26 typed cases, including informal terms, missing exposure, corrections, invalid identities, partial and mixed hands. With the explicitly configured local server running, execute `node artifacts/mahjong-scorer/voice-dev/evaluate.mjs`. It sends each case to OpenAI and prints aggregate exact-evidence/uncertainty checks. It deliberately spaces requests to respect the local limit. This uses API capacity and may incur existing API charges. No live evaluation was run because the owner has not configured a key for this local session. **Accuracy is unmeasured**; passing mocked tests is not evidence of model accuracy. The evaluation should be reviewed case by case before relying on its aggregate, especially correction and ambiguity cases.

## Cloudflare and deployment gate

There is **no Cloudflare endpoint or secure hosted route in this draft**. A hidden URL is not access control. Before a private deployment, implement and independently verify Cloudflare Access authentication at the endpoint (including origin bypass prevention), durable rate limits, bounded requests, no input logging and generic errors. Configure `OPENAI_API_KEY` only as an encrypted Cloudflare environment secret, never as a frontend variable or tracked file. Verify isolation from production, provider retention controls and cost limits. Obtain explicit owner approval before any private deployment. Until then the experiment is local only; nothing has been deployed.
