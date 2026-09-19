import { describe, expect, it } from 'vitest';
import { RegistryBank } from './registry';
import { inspectProfile, resolvePlayableProfile, type ResolverEnvironment } from './resolver';
import type { ProfileAuthoringDefinition, RootProfileDefinition } from './types';

const executable = (id: string, category: ConstructorParameters<typeof RegistryBank>[0][number]['category'], semanticRevision = 1) => ({ id, category, status: 'executable' as const, semanticRevision, executableContract: { kind: 'deterministic' as const, dependencies: [] as const } });
const entries = [
  executable('family.test', 'family'), executable('seats.four', 'seats'), executable('tiles.test', 'tiles'), executable('shape.standard', 'shape'), executable('validation.shape', 'validation'), executable('validation.policy', 'validation'), executable('evidence-policy.test', 'evidence-policy'), executable('evidence.test', 'evidence'), executable('settlement.test', 'settlement'), executable('progression.test', 'progression'), executable('game-end.test', 'game-end'), { id: 'source.test', category: 'source' as const, status: 'metadata' as const },
];
const ref = (id = 'test', version = '1') => ({ id, version });
function root(id = 'test', version = '1'): RootProfileDefinition {
  return { kind: 'root', schemaVersion: 1, identity: { id, version, name: 'A profile', status: 'published' }, definition: {
    familyId: 'family.test', grammar: 'classical-points-doubles', table: { playerCount: 4, seatModelId: 'seats.four' }, tileSet: { presetId: 'tiles.test', options: {} }, handShape: { presetId: 'shape.standard', options: {} }, validation: { handShapePolicyId: 'validation.shape', policyIds: ['validation.policy'] }, scoring: { grammar: 'classical-points-doubles', config: {} }, evidence: { policyIds: ['evidence-policy.test'], alwaysRequired: ['evidence.test'] }, settlement: { id: 'settlement.test', params: {} }, progression: { id: 'progression.test', params: {} }, gameEnd: { id: 'game-end.test', params: {} }, provenance: { sources: ['source.test'], metadata: { note: 'inert' } },
  } };
}
function environment(definitions: readonly ProfileAuthoringDefinition[] = [root()]): ResolverEnvironment {
  const profiles = new Map(definitions.map(d => [`${d.identity.id}@${d.identity.version}`, d]));
  return { registry: new RegistryBank(entries), families: { get: id => id === 'family.test' ? { id, allowedGrammars: ['classical-points-doubles'], handEvidenceCodecId: 'codec.hand', roundOutcomeCodecId: 'codec.round', strategyStateCodecId: 'codec.strategy' } : undefined }, profiles: { get: value => profiles.get(`${value.id}@${value.version}`) } };
}

describe('rules profile resolver', () => {
  it('resolves strict roots, captures executable identities, and excludes provenance metadata', async () => {
    const artifact = await resolvePlayableProfile(ref(), environment());
    expect(artifact.executableDependencies.map(d => d.id)).toContain('family.test');
    expect(artifact.executableDependencies.map(d => d.id)).not.toContain('source.test');
    expect(Object.isFrozen(artifact.profile)).toBe(true);
  });

  it('rejects unknown root fields and stale dealer state', () => {
    const definition = root(); (definition.definition as Record<string, unknown>).dealerModelId = 'dealer.old';
    expect(inspectProfile(definition, environment()).blockers[0]?.blockerCode).toBe('ROOT_INVALID');
  });

  it('blocks architecture-only functional references but permits metadata provenance', () => {
    const definition = root(); (definition.definition.table as { seatModelId: string }).seatModelId = 'seats.placeholder';
    const env = environment(); const broken = new RegistryBank([...entries, { id: 'seats.placeholder', category: 'seats', status: 'architecture-only' }]);
    const inspection = inspectProfile(definition, { ...env, registry: broken });
    expect(inspection.blockers.some(b => b.blockerCode === 'REFERENCE_NOT_EXECUTABLE')).toBe(true);
  });

  it('keeps fingerprint stable across identity and provenance changes, but not semantics', async () => {
    const a = root('a'); const b = root('b'); (b.definition.provenance as { metadata: Record<string, unknown> }).metadata = { changed: true };
    const first = await resolvePlayableProfile(ref('a'), environment([a, b])); const second = await resolvePlayableProfile(ref('b'), environment([a, b]));
    expect(first.rulesFingerprint).toBe(second.rulesFingerprint);
    const changed = root('changed'); (changed.definition.table as { playerCount: number }).playerCount = 3;
    expect((await resolvePlayableProfile(ref('changed'), environment([changed]))).rulesFingerprint).not.toBe(first.rulesFingerprint);
  });

  it('requires exact base identity for derived profiles', async () => {
    const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'Derived', status: 'custom' }, baseProfile: ref('base'), overrides: {} };
    await expect(resolvePlayableProfile(ref('derived'), environment([root('base'), derived]))).resolves.toMatchObject({ profile: { identity: { baseProfile: ref('base') } } });
    await expect(resolvePlayableProfile(ref('derived'), environment([derived]))).rejects.toThrow('PROFILE_UNRESOLVED');
  });
});
