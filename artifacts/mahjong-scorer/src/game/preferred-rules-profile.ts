import type { RulesProfileRef } from './types';
import { PUBLIC_RULES_DESCRIPTORS } from './rules-presentation';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';

export const PREFERRED_RULES_PROFILE_STORAGE_KEY = 'mahjong-reference:preferred-rules-profile';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const exactRef = (value: unknown): RulesProfileRef | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 2 || typeof record.id !== 'string' || typeof record.version !== 'string') return null;
  return { id: record.id, version: record.version };
};

const browserStorage = (): StorageLike | undefined => {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
};
export const preferredRulesProfileStorage = browserStorage;

export const isCurrentPreferredRulesProfile = (profile: unknown): profile is RulesProfileRef => {
  const ref = exactRef(profile);
  if (!ref) return false;
  try {
    getCurrentCompiledRulesRuntime(ref);
    return PUBLIC_RULES_DESCRIPTORS.some(({ profile: candidate, publiclySelectable }) =>
      publiclySelectable && candidate.id === ref.id && candidate.version === ref.version);
  } catch { return false; }
};

export function readPreferredRulesProfile(storage: StorageLike | undefined = browserStorage()): RulesProfileRef | null {
  if (!storage) return null;
  let raw: string | null;
  try { raw = storage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY); } catch { return null; }
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isCurrentPreferredRulesProfile(parsed)) return exactRef(parsed);
  } catch { /* invalid or unavailable preference fails closed */ }
  try { storage.removeItem(PREFERRED_RULES_PROFILE_STORAGE_KEY); } catch { /* storage is optional */ }
  return null;
}

export function setPreferredRulesProfile(profile: RulesProfileRef, storage: StorageLike | undefined = browserStorage()): void {
  const ref = exactRef(profile);
  if (!ref || !isCurrentPreferredRulesProfile(ref)) throw new Error('Cannot store an unavailable rules profile preference.');
  try { storage?.setItem(PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(ref)); } catch { /* preference failure never blocks scoring */ }
}

export function clearPreferredRulesProfile(storage: StorageLike | undefined = browserStorage()): void {
  try { storage?.removeItem(PREFERRED_RULES_PROFILE_STORAGE_KEY); } catch { /* preference failure never blocks scoring */ }
}
