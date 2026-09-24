import { describe, expect, it } from 'vitest';
import { architectureSeedEntries, assertFamilyCompatibility, categoryForId, decisionTraceIdentities, executableIdentity, RegistryBank } from './index';
import type { CapabilityMetadata, RegistryEntry, RulesFamilyDefinition } from './index';

const architecture = new RegistryBank(architectureSeedEntries);
const family: RulesFamilyDefinition = {
  id: 'family.riichi', allowedGrammars: ['riichi-han-fu'], handEvidenceCodecId: 'codec.hand',
  roundOutcomeCodecId: 'codec.round', strategyStateCodecId: 'codec.strategy',
  allowedTileSetIds: ['tiles.riichi-136'], allowedSeatModelIds: ['seats.riichi-winds-4'],
};

describe('rules platform registry banks', () => {
  it('fails closed for duplicate, unknown, and cross-category IDs', () => {
    const entry: RegistryEntry = { id: 'tiles.test', category: 'tiles', status: 'architecture-only' };
    expect(() => new RegistryBank([entry, entry])).toThrow('Duplicate');
    expect(() => architecture.get('tiles', 'tiles.missing')).toThrow('Unknown');
    expect(() => architecture.get('tiles', 'seats.winds-4')).toThrow('category mismatch');
    expect(() => categoryForId('dealer.always-pass')).toThrow('Unknown registry category');
  });

  it('enforces family grammar, codecs, and compatible tiles/seats', () => {
    expect(() => assertFamilyCompatibility(family, 'pattern-accumulator', family)).toThrow('Grammar');
    expect(() => assertFamilyCompatibility(family, 'riichi-han-fu', { ...family, handEvidenceCodecId: 'wrong' })).toThrow('Codec');
    expect(() => assertFamilyCompatibility(family, 'riichi-han-fu', family, 'tiles.sanma-108')).toThrow('Tile set');
    expect(() => assertFamilyCompatibility(family, 'riichi-han-fu', family, 'tiles.riichi-136', 'seats.riichi-winds-4')).not.toThrow();
    const unrestricted: RulesFamilyDefinition = { ...family, id: 'family.unrestricted', allowedTileSetIds: undefined, allowedSeatModelIds: undefined };
    expect(() => assertFamilyCompatibility(unrestricted, 'riichi-han-fu', unrestricted, 'tiles.sanma-108', 'seats.american-four-player')).not.toThrow();
  });

  it('requires revision and deterministic contracts for executable entries', () => {
    expect(() => new RegistryBank([{ id: 'pattern.test', category: 'pattern', status: 'executable' }])).toThrow('requires identity');
    expect(() => architecture.requireExecutable('tiles', 'tiles.riichi-136')).toThrow('not executable');
    const executable = new RegistryBank([{ id: 'pattern.test', category: 'pattern', status: 'executable', semanticRevision: 1, executableContract: { kind: 'deterministic', dependencies: [] } }]);
    expect(executableIdentity(executable.requireExecutable('pattern', 'pattern.test'))).toEqual({ id: 'pattern.test', semanticRevision: 1 });
  });

  it('resolves each normalized architecture seed exactly once and keeps sources metadata-only', () => {
    expect(architectureSeedEntries).toHaveLength(new Set(architectureSeedEntries.map(({ id }) => id)).size);
    for (const entry of architectureSeedEntries) expect(architecture.get(entry.category, entry.id)).toEqual(entry);
    const source = architecture.get('source', 'source.ema-riichi-2025');
    expect(source.status).toBe('metadata');
    expect(() => architecture.requireExecutable('source', source.id)).toThrow('not executable');
    expect(() => executableIdentity(source)).toThrow('not executable');
    expect(source.status).not.toBe(architecture.get('tiles', 'tiles.riichi-136').status);
    expect(() => new RegistryBank([{ id: 'source.test', category: 'source', status: 'architecture-only' }])).toThrow('metadata only');
    expect(() => new RegistryBank([{ id: 'source.test', category: 'source', status: 'metadata', semanticRevision: 1 }])).toThrow('Non-executable');
    expect(architecture.get('post-qualification-bonus', 'post-qualification-bonus.mcr-flowers').category).toBe('post-qualification-bonus');
    expect(architecture.get('dora', 'dora.riichi-ema-2025').category).toBe('dora');
    expect(architecture.get('classical', 'classical.standard').category).toBe('classical');
  });

  it('keeps capability authoring dimensions semantically separated', () => {
    const capabilities: CapabilityMetadata[] = [
      { id: 'pattern.all-pungs', category: 'pattern', customisation: 'locked', status: 'architecture-only', presentation: { presentationKey: 'pattern.allPungs' }, authoringDimensions: ['membership-binding'] },
      { id: 'classical.binding.bmja-all-pungs', category: 'classical', bindingId: 'binding.bmja.all-pungs', customisation: 'customisable', valueSchemaId: 'schema.value.points', status: 'architecture-only', presentation: { presentationKey: 'binding.allPungs' }, provenance: { sourceId: 'source.mcr-ema-green-book-2006' }, authoringDimensions: ['score-selector'] },
      { id: 'incident.false-mah-jong', category: 'incident', customisation: 'locked', status: 'architecture-only', presentation: { presentationKey: 'incident.falseMahJong' }, authoringDimensions: ['incident-liability'] },
      { id: 'hand-mode.bmja-goulash', category: 'hand-mode', compatibleFamilyIds: ['family.classical-western'], customisation: 'locked', status: 'architecture-only', presentation: { presentationKey: 'handMode.bmjaGoulash' }, authoringDimensions: ['hand-mode'] },
      { id: 'progression.rotate-every-hand', category: 'progression', compatibleGrammars: ['classical-points-doubles'], compatibleFamilyIds: ['family.classical-western'], customisation: 'locked', status: 'architecture-only', presentation: { presentationKey: 'progression.rotate' }, authoringDimensions: ['progression'] },
      { id: 'classical.table-limit', category: 'classical', compatibleGrammars: ['classical-points-doubles'], customisation: 'customisable', valueSchemaId: 'schema.value.classical-limit', status: 'architecture-only', presentation: { presentationKey: 'tableLimit.classical' }, authoringDimensions: ['table-limit'] },
      { id: 'tiles.flowers-144', category: 'tiles', customisation: 'locked', status: 'architecture-only', presentation: { presentationKey: 'tiles.flowers144' }, authoringDimensions: ['bonus-tile-presence'] },
      { id: 'post-qualification-bonus.mcr-flowers', category: 'post-qualification-bonus', compatibleGrammars: ['pattern-accumulator'], compatibleFamilyIds: ['family.mcr'], customisation: 'locked', status: 'architecture-only', presentation: { presentationKey: 'bonus.mcrFlowers' }, authoringDimensions: ['grammar-bonus'] },
    ];
    expect(new Set(capabilities.flatMap(({ authoringDimensions }) => authoringDimensions))).toHaveLength(8);
    const binding = capabilities[1];
    expect(decisionTraceIdentities(binding, 'pattern-counted', 'classical.standard')).toEqual({
      ruleId: binding.id, bindingId: binding.bindingId, policyId: 'classical.standard',
      reasonId: 'pattern-counted', sourceId: 'source.mcr-ema-green-book-2006',
    });
    expect(architecture.get('hand-mode', 'hand-mode.bmja-goulash').status).toBe('architecture-only');
    expect(architecture.get('hand-mode', 'hand-mode.outside-the-box-goulash').status).toBe('architecture-only');
    expect(() => architecture.get('hand-mode', 'hand-mode.goulash')).toThrow('Unknown');
  });
});
