using Workerd = import "/workerd/workerd.capnp";

# From the repository root:
# npx --yes --package workerd@1.20261119.1 workerd test artifacts/mahjong-scorer/voice-preview/transport.workerd.capnp
const config :Workerd.Config = (
  services = [
    (name = "transport", worker = (
      compatibilityDate = "2026-10-01",
      modules = [
        (name = "test.mjs", esModule = embed "transport.workerd.mjs"),
        (name = "openai.mjs", esModule = embed "../voice-dev/openai.mjs"),
      ],
      globalOutbound = (name = "transport", entrypoint = "mockOpenAI"),
    )),
  ],
);
