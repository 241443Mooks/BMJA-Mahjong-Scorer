import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { BMJA_PROFILE_REF } from './ruleset';
import { OUTSIDE_THE_BOX_PROFILE_REF } from './outside-the-box-catalogue';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY, clearPreferredRulesProfile, isCurrentPreferredRulesProfile, readPreferredRulesProfile, setPreferredRulesProfile } from './preferred-rules-profile';

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => { value = next; },
    removeItem: () => { value = null; },
    value: () => value,
  };
}

describe('preferred rules profile', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('stores and restores only the exact current profile id and version', () => {
    const storage = memoryStorage();
    setPreferredRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF, storage);
    expect(storage.value()).toBe(JSON.stringify(OUTSIDE_THE_BOX_PROFILE_REF));
    expect(readPreferredRulesProfile(storage)).toEqual(OUTSIDE_THE_BOX_PROFILE_REF);
    expect(PREFERRED_RULES_PROFILE_STORAGE_KEY).toBe('mahjong-reference:preferred-rules-profile');
  });

  it.each([
    '{broken json',
    JSON.stringify({ id: 'missing-profile', version: '1.0' }),
    JSON.stringify({ id: BMJA_PROFILE_REF.id, version: 'stale' }),
    JSON.stringify({ id: BMJA_PROFILE_REF.id, version: BMJA_PROFILE_REF.version, label: 'British' }),
  ])('fails closed and removes invalid stored data: %s', (raw) => {
    const storage = memoryStorage(raw);
    expect(readPreferredRulesProfile(storage)).toBeNull();
    expect(storage.value()).toBeNull();
  });

  it('rejects unknown refs and tolerates storage read, write, and remove failures', () => {
    expect(isCurrentPreferredRulesProfile({ id: 'bmja', version: '99' })).toBe(false);
    const broken = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    expect(readPreferredRulesProfile(broken)).toBeNull();
    expect(() => setPreferredRulesProfile(BMJA_PROFILE_REF, broken)).not.toThrow();
    expect(() => clearPreferredRulesProfile(broken)).not.toThrow();
    expect(() => readPreferredRulesProfile({ ...memoryStorage('{bad'), removeItem: broken.removeItem })).not.toThrow();
  });
});
