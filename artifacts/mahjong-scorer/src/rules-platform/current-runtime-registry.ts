import { compileRulesRuntime, type RulesRuntime } from './classical-runtime';
import {
  currentPlayableProfiles,
  currentPlayableResolverEnvironment,
} from './current-profiles';
import { resolvePlayableProfile } from './resolver';
import type { RulesProfileRef } from './types';

const keyFor = ({ id, version }: RulesProfileRef): string => `${id}@${version}`;

let currentRuntimes: ReadonlyMap<string, RulesRuntime> | undefined;
let initialisation: Promise<void> | undefined;

/**
 * Seals and compiles the finite set of profiles currently offered by the
 * product.  Domain code can subsequently acquire only those exact runtimes
 * synchronously; resolution and fingerprinting never occur on that path.
 */
export const initialiseCurrentRulesRuntimes = async (): Promise<void> => {
  if (currentRuntimes) return;
  if (initialisation) return initialisation;

  initialisation = (async () => {
    const compiled = await Promise.all(currentPlayableProfiles.map(async (definition) => {
      const ref = { id: definition.identity.id, version: definition.identity.version };
      const artifact = await resolvePlayableProfile(ref, currentPlayableResolverEnvironment);
      if (artifact.profile.identity.id !== ref.id || artifact.profile.identity.version !== ref.version) {
        throw new Error(`CURRENT_RULES_RUNTIME_IDENTITY_MISMATCH:${keyFor(ref)}`);
      }
      return [keyFor(ref), compileRulesRuntime(artifact)] as const;
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
  const runtime = currentRuntimes.get(keyFor(ref));
  if (!runtime) throw new Error(`CURRENT_RULES_RUNTIME_UNAVAILABLE:${keyFor(ref)}`);
  return runtime;
};
