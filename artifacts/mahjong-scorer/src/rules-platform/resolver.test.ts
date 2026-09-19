import { describe, expect, it } from 'vitest';
import { RegistryBank } from './registry';
import { inspectProfile, resolvePlayableProfile, type ResolverEnvironment } from './resolver';
import type { JsonObject, JsonValue, ProfileAuthoringDefinition, RootProfileDefinition } from './types';

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

  it.each([
    ['empty id', (d: RootProfileDefinition) => { d.identity.id = ''; }],
    ['empty version', (d: RootProfileDefinition) => { d.identity.version = ''; }],
    ['unknown fixed field', (d: RootProfileDefinition) => { (d.definition as Record<string, unknown>).unknown = true; }],
    ['non-integer players', (d: RootProfileDefinition) => { (d.definition.table as { playerCount: number }).playerCount = 3.5; }],
    ['non-positive players', (d: RootProfileDefinition) => { (d.definition.table as { playerCount: number }).playerCount = 0; }],
    ['grammar mismatch', (d: RootProfileDefinition) => { (d.definition.scoring as { grammar: string }).grammar = 'riichi-han-fu'; }],
  ])('strict root parsing rejects %s', (_name, change) => {
    const definition = root(); change(definition);
    expect(inspectProfile(definition, environment()).blockers[0]?.blockerCode).toBeTruthy();
  });

  it('enforces present family allow lists and leaves omitted lists unrestricted', () => {
    const definition = root();
    const constrained = { ...environment(), families: { get: (id: string) => id === 'family.test' ? { id, allowedGrammars: ['classical-points-doubles' as const], allowedTileSetIds: ['tiles.other'], allowedSeatModelIds: ['seats.other'], handEvidenceCodecId: 'codec.hand', roundOutcomeCodecId: 'codec.round', strategyStateCodecId: 'codec.strategy' } : undefined } };
    expect(inspectProfile(definition, constrained).blockers.map(b => b.blockerCode)).toEqual(expect.arrayContaining(['FAMILY_TILESET_INCOMPATIBLE', 'FAMILY_SEATMODEL_INCOMPATIBLE']));
    expect(inspectProfile(definition, environment()).blockers).toEqual([]);
  });

  it('distinguishes functional metadata, architecture-only, and category blockers', () => {
    const metadata = new RegistryBank([...entries.filter(entry => entry.id !== 'seats.four'), { id: 'seats.four', category: 'seats', status: 'metadata' }]);
    expect(inspectProfile(root(), { ...environment(), registry: metadata }).blockers.some(b => b.blockerCode === 'REFERENCE_NOT_EXECUTABLE')).toBe(true);
    const wrong = root(); (wrong.definition.table as { seatModelId: string }).seatModelId = 'tiles.test';
    expect(inspectProfile(wrong, environment()).blockers.some(b => b.blockerCode === 'REFERENCE_CATEGORY_MISMATCH')).toBe(true);
  });

  it('rejects unsafe non-empty open JSON and preserves canonical sealed sets', async () => {
    const unsafe = root(); (unsafe.definition.settlement as { params: Record<string, unknown> }).params = { x: 1 };
    expect(inspectProfile(unsafe, environment()).blockers.some(b => b.blockerCode === 'OPEN_JSON_UNVALIDATED')).toBe(true);
    const setty = root(); (setty.definition.validation as { policyIds: string[] }).policyIds = ['validation.policy', 'validation.policy'];
    (setty.definition.evidence as { policyIds: string[]; alwaysRequired: string[] }).policyIds = ['evidence-policy.test', 'evidence-policy.test'];
    const artifact = await resolvePlayableProfile(ref(), environment([setty]));
    expect(artifact.profile.validation.policyIds).toEqual(['validation.policy']);
    expect(artifact.profile.evidence.policyIds).toEqual(['evidence-policy.test']);
    expect(artifact.rulesFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('fails self and cyclic inheritance and deep-freezes every returned level', async () => {
    const self: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'self', version: '1', name: 'self', status: 'custom' }, baseProfile: ref('self'), overrides: {} };
    const a: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'a', version: '1', name: 'a', status: 'custom' }, baseProfile: ref('b'), overrides: {} };
    const b: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'b', version: '1', name: 'b', status: 'custom' }, baseProfile: ref('a'), overrides: {} };
    await expect(resolvePlayableProfile(ref('self'), environment([self]))).rejects.toThrow('PROFILE_INHERITANCE_SELF');
    await expect(resolvePlayableProfile(ref('a'), environment([a, b]))).rejects.toThrow('PROFILE_INHERITANCE_CYCLE');
    const artifact = await resolvePlayableProfile(ref(), environment());
    expect(Object.isFrozen(artifact)).toBe(true); expect(Object.isFrozen(artifact.executableDependencies)).toBe(true); expect(Object.isFrozen(artifact.profile.table)).toBe(true);
  });

  it('rejects unknown, locked, incompatible, non-executable and schema-less capability overrides', async () => {
    const derived = (overrides: Record<string, any>): ProfileAuthoringDefinition => ({ kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'derived', status: 'custom' }, baseProfile: ref('base'), overrides });
    const cap = (id: string, extra: Record<string, any> = {}) => ({ id, category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'value', presentation: { presentationKey: id }, authoringDimensions: [], ...extra });
    const env = (metadata: unknown) => ({ ...environment([root('base'), derived({ 'validation.cap': true })]), registry: new RegistryBank([...entries, executable('validation.cap', 'validation')]), capabilities: { get: () => metadata as never }, capabilityState: { all: () => [metadata] as never[] }, contracts: { get: () => ({ validate: (value: unknown) => ({ value }) }) }, capabilityAdapters: { get: () => ({ apply: (profile: any) => profile, isActive: () => false }) } } as unknown as ResolverEnvironment);
    await expect(resolvePlayableProfile(ref('derived'), env(undefined))).rejects.toThrow('CAPABILITY_UNRESOLVED');
    await expect(resolvePlayableProfile(ref('derived'), env(cap('validation.cap', { customisation: 'locked' })))).rejects.toThrow('CAPABILITY_LOCKED');
    await expect(resolvePlayableProfile(ref('derived'), env(cap('validation.cap', { compatibleFamilyIds: ['other'] })))).rejects.toThrow('CAPABILITY_FAMILY_INCOMPATIBLE');
    await expect(resolvePlayableProfile(ref('derived'), env(cap('validation.cap', { compatibleGrammars: ['riichi-han-fu'] })))).rejects.toThrow('CAPABILITY_GRAMMAR_INCOMPATIBLE');
    await expect(resolvePlayableProfile(ref('derived'), env({ ...cap('validation.cap'), status: 'architecture-only' }))).rejects.toThrow('CAPABILITY_REGISTRY_MISMATCH');
  });

  it('rejects missing and invalid capability value-schema contracts', async () => {
    const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'derived', status: 'custom' }, baseProfile: ref('base'), overrides: { 'validation.cap': true } };
    const metadata = { id: 'validation.cap', category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'value.missing', presentation: { presentationKey: 'validation.cap' }, authoringDimensions: [] };
    const base: ResolverEnvironment = {
      ...environment([root('base'), derived]), registry: new RegistryBank([...entries, executable('validation.cap', 'validation')]), capabilities: { get: () => metadata }, capabilityState: { all: () => [] },
      capabilityAdapters: { get: () => ({ apply: profile => profile, isActive: () => false }) },
    };
    await expect(resolvePlayableProfile(ref('derived'), { ...base, contracts: { get: () => undefined } })).rejects.toThrow('CAPABILITY_VALUE_UNVALIDATED');
    await expect(resolvePlayableProfile(ref('derived'), { ...base, contracts: { get: () => ({ validate: () => ({ value: undefined as never }) }) } })).rejects.toThrow('CAPABILITY_VALUE_INVALID');
  });

  it('rejects capabilities whose metadata disagrees with the authoritative registry', async () => {
    const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'derived', status: 'custom' }, baseProfile: ref('base'), overrides: { 'validation.cap': true } };
    const metadata = { id: 'validation.cap', category: 'validation' as const, status: 'executable' as const, semanticRevision: 2, customisation: 'customisable' as const, valueSchemaId: 'value', presentation: { presentationKey: 'validation.cap' }, authoringDimensions: [] };
    const env: ResolverEnvironment = {
      ...environment([root('base'), derived]), registry: new RegistryBank([...entries, executable('validation.cap', 'validation', 1)]),
      capabilities: { get: () => metadata }, capabilityState: { all: () => [] }, contracts: { get: () => ({ validate: value => ({ value }) }) },
      capabilityAdapters: { get: () => ({ apply: profile => profile, isActive: () => false }) },
    };
    await expect(resolvePlayableProfile(ref('derived'), env)).rejects.toThrow('CAPABILITY_REGISTRY_MISMATCH');
  });

  it('rejects capability provenance without resolvable source metadata', async () => {
    const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'derived', status: 'custom' }, baseProfile: ref('base'), overrides: { 'validation.cap': true } };
    const metadata = (sourceId: string) => ({ id: 'validation.cap', category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'value', presentation: { presentationKey: 'validation.cap' }, authoringDimensions: [], provenance: { sourceId } });
    const env = (sourceId: string): ResolverEnvironment => ({
      ...environment([root('base'), derived]), registry: new RegistryBank([...entries, executable('validation.cap', 'validation')]),
      capabilities: { get: () => metadata(sourceId) }, capabilityState: { all: () => [] }, contracts: { get: () => ({ validate: value => ({ value }) }) },
      capabilityAdapters: { get: () => ({ apply: profile => profile, isActive: () => false }) },
    });
    await expect(resolvePlayableProfile(ref('derived'), env('source.missing'))).rejects.toThrow('CAPABILITY_UNRESOLVED');
    await expect(resolvePlayableProfile(ref('derived'), env('validation.policy'))).rejects.toThrow('CAPABILITY_UNRESOLVED');
  });

  it('seals normalised capability values and exact nested semantic dependencies', async () => {
    const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'derived', status: 'custom' }, baseProfile: ref('base'), overrides: { 'validation.cap': { raw: 'input' } } };
    const metadata = { id: 'validation.cap', category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'value', presentation: { presentationKey: 'validation.cap' }, authoringDimensions: [] };
    const env: ResolverEnvironment = {
      ...environment([root('base'), derived]), registry: new RegistryBank([...entries, executable('validation.cap', 'validation'), executable('evidence.nested', 'evidence', 7)]),
      capabilities: { get: () => metadata }, capabilityState: { all: () => [] },
      contracts: { get: () => ({ validate: () => ({ value: { canonical: 'value' }, references: [{ path: 'evidence', category: 'evidence' as const, id: 'evidence.nested' }] }) }) },
      capabilityAdapters: { get: () => ({ apply: (profile, value) => ({ ...profile, provenance: { ...profile.provenance, metadata: value as JsonObject } }), isActive: () => false }) },
    };
    const artifact = await resolvePlayableProfile(ref('derived'), env);
    expect(artifact.profile.provenance.metadata).toEqual({ canonical: 'value' });
    expect(artifact.profile.provenance.metadata).not.toEqual({ raw: 'input' });
    expect(artifact.executableDependencies).toContainEqual({ id: 'evidence.nested', semanticRevision: 7 });
  });

  it('rejects target catalogues from the wrong registry category', async () => {
    const definition = root();
    (definition.definition as Record<string, any>).grammar = 'target-catalogue';
    (definition.definition.scoring as Record<string, unknown>) = { grammar: 'target-catalogue', config: { configVersion: 1, catalogueRef: { id: 'catalogue.pattern.test', version: '2026.1' }, matchPolicyId: 'target-match.test', substitutionPolicyId: 'substitution.test', exposurePolicyId: 'target-exposure.test', valuePolicyId: 'target-value.test' } };
    const registry = new RegistryBank([...entries, executable('catalogue.pattern.test', 'catalogue.pattern'), executable('target-match.test', 'target-match'), executable('substitution.test', 'substitution'), executable('target-exposure.test', 'target-exposure'), executable('target-value.test', 'target-value')]);
    const env = { ...environment([definition]), registry, families: { get: (id: string) => id === 'family.test' ? { id, allowedGrammars: ['target-catalogue' as const], handEvidenceCodecId: 'codec.hand', roundOutcomeCodecId: 'codec.round', strategyStateCodecId: 'codec.strategy' } : undefined }, targetCatalogues: { has: () => true } };
    await expect(resolvePlayableProfile(ref(), env)).rejects.toThrow('PROFILE_NOT_PLAYABLE:REFERENCE_CATEGORY_MISMATCH');
  });

  it.each([
    ['empty version', '', true],
    ['unavailable exact version', '2026.2', false],
  ])('rejects target catalogue with %s', async (_name, version, available) => {
    const definition = root();
    (definition.definition as Record<string, any>).grammar = 'target-catalogue';
    (definition.definition.scoring as Record<string, unknown>) = { grammar: 'target-catalogue', config: { configVersion: 1, catalogueRef: { id: 'catalogue.target.test', version }, matchPolicyId: 'target-match.test', substitutionPolicyId: 'substitution.test', exposurePolicyId: 'target-exposure.test', valuePolicyId: 'target-value.test' } };
    const registry = new RegistryBank([...entries, executable('catalogue.target.test', 'catalogue.target'), executable('target-match.test', 'target-match'), executable('substitution.test', 'substitution'), executable('target-exposure.test', 'target-exposure'), executable('target-value.test', 'target-value')]);
    const env = { ...environment([definition]), registry, families: { get: (id: string) => id === 'family.test' ? { id, allowedGrammars: ['target-catalogue' as const], handEvidenceCodecId: 'codec.hand', roundOutcomeCodecId: 'codec.round', strategyStateCodecId: 'codec.strategy' } : undefined }, targetCatalogues: { has: ({ id, version: candidateVersion }: { id: string; version: string }) => available && id === 'catalogue.target.test' && candidateVersion === '2026.1' } };
    await expect(resolvePlayableProfile(ref(), env)).rejects.toThrow('PROFILE_NOT_PLAYABLE');
  });

  it('resolves an available exact target catalogue ref', async () => {
    const definition = root();
    (definition.definition as Record<string, any>).grammar = 'target-catalogue';
    (definition.definition.scoring as Record<string, unknown>) = { grammar: 'target-catalogue', config: { configVersion: 1, catalogueRef: { id: 'catalogue.target.test', version: '2026.1' }, matchPolicyId: 'target-match.test', substitutionPolicyId: 'substitution.test', exposurePolicyId: 'target-exposure.test', valuePolicyId: 'target-value.test' } };
    const registry = new RegistryBank([...entries, executable('catalogue.target.test', 'catalogue.target'), executable('target-match.test', 'target-match'), executable('substitution.test', 'substitution'), executable('target-exposure.test', 'target-exposure'), executable('target-value.test', 'target-value')]);
    const env = { ...environment([definition]), registry, families: { get: (id: string) => id === 'family.test' ? { id, allowedGrammars: ['target-catalogue' as const], handEvidenceCodecId: 'codec.hand', roundOutcomeCodecId: 'codec.round', strategyStateCodecId: 'codec.strategy' } : undefined }, targetCatalogues: { has: ({ id, version }: { id: string; version: string }) => id === 'catalogue.target.test' && version === '2026.1' } };
    await expect(resolvePlayableProfile(ref(), env)).resolves.toMatchObject({ profile: { scoring: { config: { catalogueRef: { id: 'catalogue.target.test', version: '2026.1' } } } } });
  });

  it('enforces final-state capability requirements and conflicts, including a base-only requiring capability', async () => {
    const derived = (id: string, overrides: Record<string, JsonValue>): ProfileAuthoringDefinition => ({ kind: 'derived', schemaVersion: 1, identity: { id, version: '1', name: id, status: 'custom' }, baseProfile: ref('base'), overrides });
    const capability = (id: string, extra: Record<string, unknown> = {}) => ({ id, category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'value', presentation: { presentationKey: id }, authoringDimensions: [], ...extra });
    const resolveRelationships = async (definition: ProfileAuthoringDefinition, baseState: Record<string, boolean>, metadata: readonly ReturnType<typeof capability>[]) => {
      const base = root('base'); (base.definition.provenance as { metadata: JsonObject }).metadata = { capabilities: baseState };
      const state = (profile: { provenance: { metadata?: JsonObject } }, id: string) => Boolean((profile.provenance.metadata?.capabilities as Record<string, boolean> | undefined)?.[id]);
      const env: ResolverEnvironment = {
        ...environment([base, definition]), registry: new RegistryBank([...entries, ...metadata.map(item => executable(item.id, 'validation'))]), capabilities: { get: id => metadata.find(item => item.id === id) }, capabilityState: { all: () => metadata }, contracts: { get: () => ({ validate: value => ({ value }) }) },
        capabilityAdapters: { get: id => ({ apply: (profile, value) => ({ ...profile, provenance: { ...profile.provenance, metadata: { ...profile.provenance.metadata, capabilities: { ...(profile.provenance.metadata?.capabilities as JsonObject), [id]: value } } } }), isActive: profile => state(profile, id) }) },
      };
      return resolvePlayableProfile(ref(definition.identity.id), env);
    };
    const requiringA = capability('validation.a', { requires: ['validation.b'] });
    const b = capability('validation.b');
    await expect(resolveRelationships(derived('disables-b', { 'validation.b': false }), { 'validation.a': true, 'validation.b': true }, [requiringA, b])).rejects.toThrow('CAPABILITY_REQUIREMENT_UNMET');
    const conflictingA = capability('validation.a', { conflicts: ['validation.b'] });
    const noop = capability('validation.noop');
    await expect(resolveRelationships(derived('conflict', { 'validation.noop': true }), { 'validation.a': true, 'validation.b': true }, [conflictingA, b, noop])).rejects.toThrow('CAPABILITY_CONFLICT_ACTIVE');
  });

  it('makes derived override insertion order semantically and fingerprint deterministic', async () => {
    const derived = (id: string, overrides: Record<string, JsonValue>): ProfileAuthoringDefinition => ({ kind: 'derived', schemaVersion: 1, identity: { id, version: '1', name: id, status: 'custom' }, baseProfile: ref('base'), overrides });
    const metadata = (id: string) => ({ id, category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'value', presentation: { presentationKey: id }, authoringDimensions: [] });
    const a = metadata('validation.a'); const b = metadata('validation.b');
    const left = derived('left', { 'validation.b': 4, 'validation.a': 3 });
    const right = derived('right', { 'validation.a': 3, 'validation.b': 4 });
    const env: ResolverEnvironment = {
      ...environment([root('base'), left, right]), registry: new RegistryBank([...entries, executable('validation.a', 'validation'), executable('validation.b', 'validation')]), capabilities: { get: id => [a, b].find(item => item.id === id) }, capabilityState: { all: () => [] }, contracts: { get: () => ({ validate: value => ({ value }) }) },
      capabilityAdapters: { get: () => ({ apply: (profile, value) => ({ ...profile, table: { ...profile.table, playerCount: value as number } }), isActive: () => false }) },
    };
    const [first, second] = await Promise.all([resolvePlayableProfile(ref('left'), env), resolvePlayableProfile(ref('right'), env)]);
    expect(first.profile.table).toEqual(second.profile.table);
    expect(first.rulesFingerprint).toBe(second.rulesFingerprint);
  });

  it('canonicalises ordinary JSON object-key ordering for configs and params', async () => {
    const first = root('first'); const second = root('second');
    (first.definition.scoring as { config: JsonObject }).config = { beta: { y: 2, x: 1 }, alpha: true };
    (second.definition.scoring as { config: JsonObject }).config = { alpha: true, beta: { x: 1, y: 2 } };
    (first.definition.settlement as { params: JsonObject }).params = { beta: { y: 2, x: 1 }, alpha: true };
    (second.definition.settlement as { params: JsonObject }).params = { alpha: true, beta: { x: 1, y: 2 } };
    const registry = new RegistryBank([...entries.filter(entry => entry.id !== 'settlement.test'), { ...executable('settlement.test', 'settlement'), parameterSchemaId: 'params' }]);
    const env: ResolverEnvironment = { ...environment([first, second]), registry, contracts: { get: () => ({ validate: value => ({ value }) }) }, familyContracts: { get: () => ({ validate: value => ({ value }) }) } };
    const [a, b] = await Promise.all([resolvePlayableProfile(ref('first'), env), resolvePlayableProfile(ref('second'), env)]);
    expect(a.profile.scoring).toEqual(b.profile.scoring);
    expect(a.profile.settlement.params).toEqual(b.profile.settlement.params);
    expect(a.rulesFingerprint).toBe(b.rulesFingerprint);
  });

  it('normalises set-like arrays before sealing their semantics and fingerprint', async () => {
    const first = root('first'); const second = root('second');
    (first.definition.validation as { policyIds: string[] }).policyIds = ['validation.policy-two', 'validation.policy', 'validation.policy-two'];
    (second.definition.validation as { policyIds: string[] }).policyIds = ['validation.policy', 'validation.policy-two'];
    (first.definition.evidence as { policyIds: string[]; alwaysRequired: string[] }).policyIds = ['evidence-policy.two', 'evidence-policy.test', 'evidence-policy.two'];
    (second.definition.evidence as { policyIds: string[]; alwaysRequired: string[] }).policyIds = ['evidence-policy.test', 'evidence-policy.two'];
    (first.definition.evidence as { policyIds: string[]; alwaysRequired: string[] }).alwaysRequired = ['evidence.two', 'evidence.test', 'evidence.two'];
    (second.definition.evidence as { policyIds: string[]; alwaysRequired: string[] }).alwaysRequired = ['evidence.test', 'evidence.two'];
    const env = { ...environment([first, second]), registry: new RegistryBank([...entries, executable('validation.policy-two', 'validation'), executable('evidence-policy.two', 'evidence-policy'), executable('evidence.two', 'evidence')]) };
    const [a, b] = await Promise.all([resolvePlayableProfile(ref('first'), env), resolvePlayableProfile(ref('second'), env)]);
    expect(a.profile.validation.policyIds).toEqual(b.profile.validation.policyIds);
    expect(a.profile.evidence).toEqual(b.profile.evidence);
    expect(a.rulesFingerprint).toBe(b.rulesFingerprint);
  });

  it('preserves incident order as fingerprint-significant semantics', async () => {
    const first = root('first'); const second = root('second');
    (first.definition as Record<string, unknown>).incidents = [{ id: 'incident.first', params: {} }, { id: 'incident.second', params: {} }];
    (second.definition as Record<string, unknown>).incidents = [{ id: 'incident.second', params: {} }, { id: 'incident.first', params: {} }];
    const env = { ...environment([first, second]), registry: new RegistryBank([...entries, executable('incident.first', 'incident'), executable('incident.second', 'incident')]) };
    const [a, b] = await Promise.all([resolvePlayableProfile(ref('first'), env), resolvePlayableProfile(ref('second'), env)]);
    expect(a.profile.incidents).not.toEqual(b.profile.incidents);
    expect(a.rulesFingerprint).not.toBe(b.rulesFingerprint);
  });

  it('includes executable dependency semantic revisions in the fingerprint', async () => {
    const definition = root();
    const standard = environment([definition]);
    const revised: ResolverEnvironment = { ...environment([definition]), registry: new RegistryBank([...entries.filter(entry => entry.id !== 'settlement.test'), executable('settlement.test', 'settlement', 2)]) };
    const [first, second] = await Promise.all([resolvePlayableProfile(ref(), standard), resolvePlayableProfile(ref(), revised)]);
    expect(first.profile).toEqual(second.profile);
    expect(first.executableDependencies.find(entry => entry.id === 'settlement.test')?.semanticRevision).toBe(1);
    expect(second.executableDependencies.find(entry => entry.id === 'settlement.test')?.semanticRevision).toBe(2);
    expect(first.rulesFingerprint).not.toBe(second.rulesFingerprint);
  });

  it('preserves resolved semantics and fingerprint through JSON authoring round-trip', async () => {
    const definition = root();
    const parsed = JSON.parse(JSON.stringify(definition)) as ProfileAuthoringDefinition;
    const [original, roundTripped] = await Promise.all([
      resolvePlayableProfile(ref(), environment([definition])),
      resolvePlayableProfile(ref(), environment([parsed])),
    ]);
    expect(roundTripped.profile).toEqual(original.profile);
    expect(roundTripped.rulesFingerprint).toBe(original.rulesFingerprint);
  });

  it('does not mutate a previously resolved base artifact while resolving a derived profile', async () => {
    const base = root('base');
    const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'derived', version: '1', name: 'derived', status: 'custom' }, baseProfile: ref('base'), overrides: {} };
    const env = environment([base, derived]);
    const artifact = await resolvePlayableProfile(ref('base'), env);
    const before = JSON.parse(JSON.stringify(artifact));
    await resolvePlayableProfile(ref('derived'), env);
    expect(artifact).toEqual(before);
  });

  it('seals nested profile and executable dependency state against mutation', async () => {
    const artifact = await resolvePlayableProfile(ref(), environment());
    const before = JSON.parse(JSON.stringify(artifact));
    expect(() => { (artifact.profile.table as { playerCount: number }).playerCount = 99; }).toThrow();
    expect(() => { (artifact.executableDependencies[0] as { semanticRevision: number }).semanticRevision = 99; }).toThrow();
    expect(artifact).toEqual(before);
  });

  it('rejects architecture-only profiles through playable resolution after structured inspection', async () => {
    const definition = root(); (definition.definition.table as { seatModelId: string }).seatModelId = 'seats.placeholder';
    const env = environment([definition]); const registry = new RegistryBank([...entries, { id: 'seats.placeholder', category: 'seats' as const, status: 'architecture-only' as const }]);
    expect(inspectProfile(definition, { ...env, registry }).blockers.some(blocker => blocker.blockerCode === 'REFERENCE_NOT_EXECUTABLE')).toBe(true);
    await expect(resolvePlayableProfile(ref(), { ...env, registry })).rejects.toThrow('PROFILE_NOT_PLAYABLE');
  });
});
