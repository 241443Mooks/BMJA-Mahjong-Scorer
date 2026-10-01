# Mahjong Reference assurance and verification methods

Status: **current project method summary**  
Scope: explain what source review, automated checks and architecture reviews establish, and where their limits are.

## Human source review

Rule evidence is reviewed against an identified source and a precise location. A claim is limited to what that source supports for the named profile and version. Source gaps, ambiguous wording and deferred interpretation stay explicit; matching code behaviour does not resolve them.

Evidence records distinguish the source claim from its runtime treatment. A reviewer can therefore inspect the cited material, the recorded claim and the exact profile binding without treating one as proof of the others.

## Automated behaviour and integrity checks

The test suite checks selected application behaviour, runtime fixtures, profile bindings and truth-corpus integrity. A passing test establishes that the checked code behaves as expected for its fixture. It does not establish that a rulebook says the same thing.

The current repository commands are defined in the root `package.json`:

```sh
pnpm test
pnpm run typecheck
PORT=5173 BASE_PATH=/ pnpm run build
```

`pnpm test` runs the configured test suite and generated-content freshness checks. `pnpm run typecheck` runs TypeScript without emitting files. The production build runs typecheck, builds the site and prerenders its configured public routes.

These commands are checks to run for a change, not a standing claim that every past or future revision has passed them. A result should be reported against the exact revision checked.

## Architecture review

Paper manifests and architecture fixtures test whether distinct rules families can be represented while keeping scoring, settlement, progression and provenance boundaries explicit. They do not implement every paper profile or certify the runtime against those families.

## Limits

No single check proves every Mahjong rule, table practice or variant. Source review, runtime tests, typechecking, build verification and architecture review answer different questions. Unresolved evidence remains unresolved until a source-specific review supports a stronger conclusion.
