import { describe, expect, it } from 'vitest';
import { currentPlayableProfiles } from './current-profiles';
import {
  getCurrentRulesRuntime,
  initialiseCurrentRulesRuntimes,
} from './current-runtime-registry';

const currentRefs = currentPlayableProfiles.map(({ identity }) => ({
  id: identity.id,
  version: identity.version,
}));

describe('current runtime registry', () => {
  it('fails explicitly before application bootstrap has completed', () => {
    expect(() => getCurrentRulesRuntime(currentRefs[0]!))
      .toThrow('CURRENT_RULES_RUNTIMES_NOT_INITIALISED');
  });

  it('initialises and retrieves every exact current profile artifact', async () => {
    await initialiseCurrentRulesRuntimes();
    expect(currentRefs).toHaveLength(4);
    for (const ref of currentRefs) {
      const runtime = getCurrentRulesRuntime(ref);
      expect(runtime.artifact.profile.identity).toMatchObject(ref);
      expect(runtime.artifact.rulesFingerprint).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it('is safe for repeated and concurrent bootstrap calls', async () => {
    await Promise.all(Array.from({ length: 4 }, () => initialiseCurrentRulesRuntimes()));
    expect(getCurrentRulesRuntime(currentRefs[0]!)).toBe(getCurrentRulesRuntime(currentRefs[0]!));
  });

  it('rejects an unknown exact version rather than selecting a fallback', () => {
    expect(() => getCurrentRulesRuntime({ id: currentRefs[0]!.id, version: '9.9' }))
      .toThrow(`CURRENT_RULES_RUNTIME_UNAVAILABLE:${currentRefs[0]!.id}@9.9`);
  });
});
