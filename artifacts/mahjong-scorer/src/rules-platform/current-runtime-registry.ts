import { compileRulesRuntime, type RulesRuntime } from './classical-runtime';
import {
  currentPlayableProfiles,
  currentPlayableResolverEnvironment,
} from './current-profiles';
import { resolvePlayableProfile } from './resolver';
import { MCR_WMO_2006_PROFILE, mcrProfileResolverEnvironment } from './mcr-profile';
import { compileMcrRulesRuntime, type McrRulesRuntime } from './mcr-runtime';
import type { ResolvedProfileArtifact, RulesProfileRef, ScoringGrammarId } from './types';

const keyFor = ({ id, version }: RulesProfileRef): string => `${id}@${version}`;

export type CurrentCompiledRulesRuntime =
  | { grammar: 'classical-points-doubles'; artifact: ResolvedProfileArtifact; runtime: RulesRuntime }
  | { grammar: 'pattern-accumulator'; artifact: ResolvedProfileArtifact; runtime: McrRulesRuntime };

type CurrentRuntimeRegistration = {
  ref: RulesProfileRef;
  environment: typeof currentPlayableResolverEnvironment;
} | {
  ref: RulesProfileRef;
  environment: typeof mcrProfileResolverEnvironment;
};

const currentRuntimeRegistrations: readonly CurrentRuntimeRegistration[] = [
  ...currentPlayableProfiles.map(({ identity }) => ({
    ref: { id: identity.id, version: identity.version }, environment: currentPlayableResolverEnvironment,
  })),
  { ref: { id: MCR_WMO_2006_PROFILE.identity.id, version: MCR_WMO_2006_PROFILE.identity.version }, environment: mcrProfileResolverEnvironment },
];

let currentRuntimes: ReadonlyMap<string, CurrentCompiledRulesRuntime> | undefined;
let initialisation: Promise<void> | undefined;

/**
 * Seals and compiles the finite current runtime registration set. Domain code
 * can subsequently acquire only those exact runtimes
 * synchronously; resolution and fingerprinting never occur on that path.
 */
export const initialiseCurrentRulesRuntimes = async (): Promise<void> => {
  if (currentRuntimes) return;
  if (initialisation) return initialisation;

  initialisation = (async () => {
    const compiled = await Promise.all(currentRuntimeRegistrations.map(async ({ ref, environment }) => {
      const artifact = await resolvePlayableProfile(ref, environment);
      if (artifact.profile.identity.id !== ref.id || artifact.profile.identity.version !== ref.version) {
        throw new Error(`CURRENT_RULES_RUNTIME_IDENTITY_MISMATCH:${keyFor(ref)}`);
      }
      const grammar: ScoringGrammarId = artifact.profile.scoring.grammar;
      const runtime = grammar === 'classical-points-doubles'
        ? { grammar, artifact, runtime: compileRulesRuntime(artifact) } as const
        : grammar === 'pattern-accumulator'
          ? { grammar, artifact, runtime: compileMcrRulesRuntime(artifact) } as const
          : (() => { throw new Error(`CURRENT_RULES_RUNTIME_GRAMMAR_UNSUPPORTED:${grammar}`); })();
      return [keyFor(ref), runtime] as const;
    }));

    currentRuntimes = new Map(compiled);
  })();

  try {
    await initialisation;
  } catch (error) {
    initialisation = undefined;
    throw error;
  }
};

/** Returns the already-compiled runtime for one exact, current profile ref. */
export const getCurrentRulesRuntime = (ref: RulesProfileRef): RulesRuntime => {
  if (!currentRuntimes) throw new Error('CURRENT_RULES_RUNTIMES_NOT_INITIALISED');
  const compiled = currentRuntimes.get(keyFor(ref));
  if (!compiled) throw new Error(`CURRENT_RULES_RUNTIME_UNAVAILABLE:${keyFor(ref)}`);
  if (compiled.grammar !== 'classical-points-doubles') {
    throw new Error(`CURRENT_RULES_RUNTIME_GRAMMAR_MISMATCH:${keyFor(ref)}:${compiled.grammar}`);
  }
  return compiled.runtime;
};

/** Returns the exact compiled current runtime, discriminated by sealed scoring grammar. */
export const getCurrentCompiledRulesRuntime = (ref: RulesProfileRef): CurrentCompiledRulesRuntime => {
  if (!currentRuntimes) throw new Error('CURRENT_RULES_RUNTIMES_NOT_INITIALISED');
  const runtime = currentRuntimes.get(keyFor(ref));
  if (!runtime) throw new Error(`CURRENT_RULES_RUNTIME_UNAVAILABLE:${keyFor(ref)}`);
  return runtime;
};
