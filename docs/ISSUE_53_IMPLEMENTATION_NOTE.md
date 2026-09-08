# Issue 53 implementation note

This pilot proves the responsive instructional-image pattern described in `docs/INSTRUCTIONAL_SCREENSHOT_PLAN.md`.

## Capture command

From the repository root:

```bash
pnpm --filter @workspace/mahjong-scorer screenshots:help
```

The capture script uses a pinned Playwright version in a temporary tooling directory, starts the scorer locally, creates deterministic product states, and writes the six pilot captures to `artifacts/mahjong-scorer/public/help/screenshots/`.

The pilot currently covers:

- partial losing hand — Mobile, Tablet, Desktop
- Print / Save game — Mobile, Tablet, Desktop

The capture command also smoke-tests the Help-page responsive behaviour: automatic mobile selection at 390px, manual Tablet override, propagation to the second instructional block, and session persistence after reload.

This remains deliberately small. It is not a general visual-regression framework and should only be expanded if the pilot is useful in the live Help experience.
