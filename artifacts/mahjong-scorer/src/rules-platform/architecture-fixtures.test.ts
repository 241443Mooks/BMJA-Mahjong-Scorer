import { describe, expect, it } from 'vitest';
import {
  architectureSeedEntries, assertFamilyCompatibility, inspectProfile, RegistryBank, resolvePlayableProfile,
  type JsonContract, type JsonObject, type ProfileAuthoringDefinition, type ResolverEnvironment,
  type RootProfileDefinition, type RulesFamilyDefinition, type ScoringGrammarId,
} from './index';

type Fixture = {
  id: string;
  definition: RootProfileDefinition;
  family: RulesFamilyDefinition;
  expectedCategories: Readonly<Record<string, string>>;
};

const source = (id: string) => `source.${id}`;
const strategy = (id: string, params: JsonObject = {}) => ({ id, params });
const root = (id: string, familyId: string, grammar: ScoringGrammarId, table: JsonObject, tileSet: JsonObject, handShape: JsonObject, validation: JsonObject, scoring: JsonObject, evidence: JsonObject, settlement: string, progression: string, gameEnd: string, sourceId: string, settlementParams: JsonObject = {}): RootProfileDefinition => ({
  kind: 'root', schemaVersion: 1, identity: { id, version: 'architecture-1', name: id, status: 'provisional' },
  definition: { familyId, grammar, table, tileSet, handShape, validation, scoring: { grammar, config: scoring }, evidence, settlement: strategy(settlement, settlementParams), progression: strategy(progression), gameEnd: strategy(gameEnd), provenance: { sources: [sourceId], metadata: { fixture: id } } },
});

const accumulator = (unit: 'fan' | 'points' | 'tai', patternCatalogueId: string, interactionPolicyId: string, qualificationPolicyId: string, extra: JsonObject = {}) => ({ configVersion: 1, unit, patternCatalogueId, interactionPolicyId, qualificationPolicyId, interpretationPolicyId: 'interpretation.max-lawful-profile', ...extra });
const riichi = (prefix: 'riichi-ema-2025' | 'sanma-profile') => ({ configVersion: 1, yakuCatalogueId: `catalogue.yaku.${prefix}`, yakumanCatalogueId: `catalogue.yakuman.${prefix}`, decompositionPolicyId: `riichi-decomposition.${prefix === 'riichi-ema-2025' ? 'ema-2025-enumerate-max' : 'compatible-enumerate-max'}`, doraPolicyId: `dora.${prefix === 'riichi-ema-2025' ? 'riichi-ema-2025' : 'sanma-profile-with-nuki'}`, fuPolicyId: `fu.${prefix}`, limitTierPolicyId: `riichi-limit-tier.${prefix === 'riichi-ema-2025' ? 'ema-2025' : 'sanma-profile'}`, handValuePolicyId: `riichi-hand-value.${prefix === 'riichi-ema-2025' ? 'ema-2025' : 'sanma-profile'}` });

const fixtures: readonly Fixture[] = [
  { id: 'A01', family: { id: 'family.classical-western', allowedGrammars: ['classical-points-doubles'], handEvidenceCodecId: 'classical.hand.v1', roundOutcomeCodecId: 'classical.round.v1', strategyStateCodecId: 'classical.strategy.v1', allowedTileSetIds: ['tiles.flowers-144'], allowedSeatModelIds: ['seats.winds-4'] }, definition: root('mt-european-classical-paper', 'family.classical-western', 'classical-points-doubles', { playerCount: 4, seatModelId: 'seats.winds-4' }, { presetId: 'tiles.flowers-144', options: { bonusTilesEnabled: true } }, { presetId: 'shape.four-sets-pair', options: { irregularCatalogueId: 'catalogue.pattern.mt-european-classical-specials' } }, { handShapePolicyId: 'validation.classical-standard', policyIds: [] }, { configVersion: 1, presetId: 'classical.standard', profileBindingsId: 'classical.bindings.mt-european-classical', concealedHandAdditivePointsId: 'classical.concealed-hand-additive-points', concealedHandDoubleId: 'classical.concealed-hand-double' }, { policyIds: ['evidence-policy.classical-winning-context', 'evidence-policy.mt-european-classical-waits'], alwaysRequired: [] }, 'settlement.classical-pairwise', 'progression.rotate-every-hand', 'game-end.four-round-always-pass', source('mahjong-time.european-classical'), { eastMultiplier: 2, loserToLoser: true }), expectedCategories: { 'classical.standard': 'classical', 'classical.bindings.mt-european-classical': 'classical' } },
  { id: 'A02', family: { id: 'family.hong-kong', allowedGrammars: ['pattern-accumulator'], handEvidenceCodecId: 'hk.hand.v1', roundOutcomeCodecId: 'hk.round.v1', strategyStateCodecId: 'hk.strategy.v1', allowedTileSetIds: ['tiles.flowers-144'], allowedSeatModelIds: ['seats.winds-4'] }, definition: root('mt-hong-kong-paper', 'family.hong-kong', 'pattern-accumulator', { playerCount: 4, seatModelId: 'seats.winds-4' }, { presetId: 'tiles.flowers-144', options: { flowersSeasonsEnabled: true } }, { presetId: 'shape.four-sets-pair', options: { irregularCatalogueId: 'catalogue.pattern.hk-profile-specials' } }, { handShapePolicyId: 'validation.hk-profile', policyIds: [] }, accumulator('fan', 'catalogue.pattern.hk-profile', 'interaction.hk-profile', 'qualification.hk-profile', { conversionPolicyId: 'conversion.hk-fan-payment-table', capPolicyId: 'value-policy.hk-profile' }), { policyIds: ['evidence-policy.hk-profile'], alwaysRequired: ['evidence.winning-method', 'evidence.seat-wind', 'evidence.round-wind'] }, 'settlement.hk-profile', 'progression.hk-profile', 'game-end.hk-profile', source('mahjong-time.hong-kong')), expectedCategories: { 'catalogue.pattern.hk-profile': 'catalogue.pattern', 'qualification.hk-profile': 'qualification', 'conversion.hk-fan-payment-table': 'conversion' } },
  { id: 'A03', family: { id: 'family.mcr', allowedGrammars: ['pattern-accumulator'], handEvidenceCodecId: 'mcr.hand.v1', roundOutcomeCodecId: 'mcr.round.v1', strategyStateCodecId: 'mcr.strategy.v1', allowedTileSetIds: ['tiles.flowers-144'], allowedSeatModelIds: ['seats.winds-4'] }, definition: root('mcr-wmo-2006', 'family.mcr', 'pattern-accumulator', { playerCount: 4, seatModelId: 'seats.winds-4' }, { presetId: 'tiles.flowers-144', options: {} }, { presetId: 'shape.four-sets-pair', options: { irregularCatalogueId: 'catalogue.pattern.mcr-special-shapes' } }, { handShapePolicyId: 'validation.mcr-winning-shape', policyIds: ['validation.mcr-minimum-win-context'] }, accumulator('points', 'catalogue.pattern.mcr-wmo-2006', 'interaction.mcr-2006-non-combination', 'qualification.mcr-8-before-flowers', { postQualificationBonusPolicyId: 'post-qualification-bonus.mcr-flowers', conversionPolicyId: 'conversion.identity' }), { policyIds: ['evidence-policy.mcr-wmo-2006'], alwaysRequired: ['evidence.winning-method', 'evidence.winning-tile-provenance', 'evidence.seat-wind', 'evidence.round-wind'] }, 'settlement.mcr-2006', 'progression.always-pass', 'game-end.four-round-always-pass', source('mcr-ema-green-book-2006')), expectedCategories: { 'catalogue.pattern.mcr-wmo-2006': 'catalogue.pattern', 'post-qualification-bonus.mcr-flowers': 'post-qualification-bonus' } },
  { id: 'A04', family: { id: 'family.taiwanese-16-tile', allowedGrammars: ['pattern-accumulator'], handEvidenceCodecId: 'taiwan.hand.v1', roundOutcomeCodecId: 'taiwan.round.v1', strategyStateCodecId: 'taiwan.strategy.v1', allowedTileSetIds: ['tiles.flowers-144'], allowedSeatModelIds: ['seats.winds-4'] }, definition: root('mt-taiwanese-paper', 'family.taiwanese-16-tile', 'pattern-accumulator', { playerCount: 4, seatModelId: 'seats.winds-4' }, { presetId: 'tiles.flowers-144', options: { bonusTilesEnabled: true } }, { presetId: 'shape.five-sets-pair', options: { dealtConcealedTiles: 16, winningStructuralTiles: 17, irregularCatalogueId: 'catalogue.pattern.taiwanese-profile-specials' } }, { handShapePolicyId: 'validation.taiwanese-five-sets-pair', policyIds: [] }, accumulator('tai', 'catalogue.pattern.taiwanese-profile', 'interaction.taiwanese-profile', 'qualification.taiwanese-profile', { capPolicyId: 'value-policy.optional-table-cap', conversionPolicyId: 'conversion.identity' }), { policyIds: ['evidence-policy.taiwanese-profile'], alwaysRequired: ['evidence.winning-method', 'evidence.winning-tile-provenance'] }, 'settlement.taiwanese-winner-only', 'progression.taiwanese-profile', 'game-end.taiwanese-profile', source('mahjong-time.taiwanese')), expectedCategories: { 'shape.five-sets-pair': 'shape', 'catalogue.pattern.taiwanese-profile': 'catalogue.pattern' } },
  { id: 'A05', family: { id: 'family.riichi', allowedGrammars: ['riichi-han-fu'], handEvidenceCodecId: 'riichi.hand.v1', roundOutcomeCodecId: 'riichi.round.v1', strategyStateCodecId: 'riichi.strategy.v1', allowedTileSetIds: ['tiles.riichi-136'], allowedSeatModelIds: ['seats.riichi-winds-4'] }, definition: root('riichi-ema-2025', 'family.riichi', 'riichi-han-fu', { playerCount: 4, seatModelId: 'seats.riichi-winds-4' }, { presetId: 'tiles.riichi-136', options: { redFives: 0 } }, { presetId: 'shape.four-sets-pair', options: { irregularCatalogueId: 'catalogue.pattern.riichi-ema-2025-special-shapes' } }, { handShapePolicyId: 'validation.riichi-winning-shape', policyIds: ['validation.riichi-yaku-required'] }, riichi('riichi-ema-2025'), { policyIds: ['evidence-policy.riichi-ema-2025'], alwaysRequired: ['evidence.winning-method', 'evidence.winning-tile-provenance', 'evidence.seat-wind', 'evidence.round-wind'] }, 'settlement.riichi-ema-2025-four-player', 'progression.riichi-ema-2025-renchan', 'game-end.riichi-ema-2025', source('ema-riichi-2025')), expectedCategories: { 'catalogue.yaku.riichi-ema-2025': 'catalogue.yaku', 'dora.riichi-ema-2025': 'dora' } },
  { id: 'A06', family: { id: 'family.riichi-sanma', allowedGrammars: ['riichi-han-fu'], handEvidenceCodecId: 'sanma.hand.v1', roundOutcomeCodecId: 'sanma.round.v1', strategyStateCodecId: 'sanma.strategy.v1', allowedTileSetIds: ['tiles.sanma-108'], allowedSeatModelIds: ['seats.riichi-sanma-east-south-west'] }, definition: root('mt-sanma-paper', 'family.riichi-sanma', 'riichi-han-fu', { playerCount: 3, seatModelId: 'seats.riichi-sanma-east-south-west' }, { presetId: 'tiles.sanma-108', options: { redFives: 3, nukiDoraTile: 'north' } }, { presetId: 'shape.four-sets-pair', options: { irregularCatalogueId: 'catalogue.pattern.sanma-profile-special-shapes' } }, { handShapePolicyId: 'validation.riichi-winning-shape', policyIds: ['validation.sanma-no-chii', 'validation.riichi-yaku-required'] }, riichi('sanma-profile'), { policyIds: ['evidence-policy.riichi-sanma'], alwaysRequired: ['evidence.winning-method', 'evidence.winning-tile-provenance', 'evidence.seat-wind'] }, 'settlement.riichi-sanma', 'progression.riichi-sanma-renchan', 'game-end.riichi-sanma', source('mahjong-time.sanma')), expectedCategories: { 'tiles.sanma-108': 'tiles', 'validation.sanma-no-chii': 'validation', 'settlement.riichi-sanma': 'settlement' } },
  { id: 'A07', family: { id: 'family.zung-jung', allowedGrammars: ['pattern-accumulator'], handEvidenceCodecId: 'zung.hand.v1', roundOutcomeCodecId: 'zung.round.v1', strategyStateCodecId: 'zung.strategy.v1', allowedTileSetIds: ['tiles.standard-136'], allowedSeatModelIds: ['seats.winds-4'] }, definition: root('zung-jung-1.03-paper', 'family.zung-jung', 'pattern-accumulator', { playerCount: 4, seatModelId: 'seats.winds-4' }, { presetId: 'tiles.standard-136', options: {} }, { presetId: 'shape.four-sets-pair', options: { irregularCatalogueId: 'catalogue.pattern.zung-jung-special-shapes' } }, { handShapePolicyId: 'validation.zung-jung-winning-shape', policyIds: [] }, accumulator('points', 'catalogue.pattern.zung-jung-1.03-44', 'interaction.zung-jung-same-series-highest-only', 'qualification.none', { floorPolicyId: 'value-policy.zung-jung-zero-pattern-one', capPolicyId: 'value-policy.zung-jung-320-listed-limit', conversionPolicyId: 'conversion.identity' }), { policyIds: ['evidence-policy.zung-jung-1.03'], alwaysRequired: ['evidence.winning-method', 'evidence.winning-tile-provenance'] }, 'settlement.zung-jung-formal', 'progression.always-pass', 'game-end.zung-jung-profile', source('zung-jung-1.03')), expectedCategories: { 'catalogue.pattern.zung-jung-1.03-44': 'catalogue.pattern', 'value-policy.zung-jung-320-listed-limit': 'value-policy' } },
  { id: 'A08', family: { id: 'family.american-nmjl-style', allowedGrammars: ['target-catalogue'], handEvidenceCodecId: 'american.hand.v1', roundOutcomeCodecId: 'american.round.v1', strategyStateCodecId: 'american.strategy.v1', allowedTileSetIds: ['tiles.american-joker-capable'], allowedSeatModelIds: ['seats.american-four-player'] }, definition: root('american-nmjl-style-paper', 'family.american-nmjl-style', 'target-catalogue', { playerCount: 4, seatModelId: 'seats.american-four-player' }, { presetId: 'tiles.american-joker-capable', options: {} }, { presetId: 'shape.target-catalogue', options: {} }, { handShapePolicyId: 'validation.target-catalogue-match', policyIds: [] }, { configVersion: 1, catalogueRef: { id: 'catalogue.target.nmjl-2026-external-placeholder', version: '2026' }, matchPolicyId: 'target-match.nmjl-style', substitutionPolicyId: 'substitution.nmjl-style-joker', exposurePolicyId: 'target-exposure.nmjl-style', valuePolicyId: 'target-value.catalogue-defined' }, { policyIds: ['evidence-policy.american-nmjl-style'], alwaysRequired: [] }, 'settlement.american-profile', 'progression.american-profile', 'game-end.american-profile', source('nmjl-annual-card-ecosystem')), expectedCategories: { 'catalogue.target.nmjl-2026-external-placeholder': 'catalogue.target', 'substitution.nmjl-style-joker': 'substitution' } },
];

const object = (value: unknown, keys: readonly string[]): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value as JsonObject).sort().join() !== [...keys].sort().join()) throw new Error('invalid');
  return value as JsonObject;
};
const bool = (key: string): JsonContract => ({ validate(value) { const result = object(value, [key]); if (typeof result[key] !== 'boolean') throw new Error('invalid'); return { value: result }; } });
const integer = (key: string, min: number, max: number): JsonContract => ({ validate(value) { const result = object(value, [key]); if (!Number.isInteger(result[key]) || (result[key] as number) < min || (result[key] as number) > max) throw new Error('invalid'); return { value: result }; } });
const irregular = (id: string): JsonContract => ({ validate(value) { const result = object(value, ['irregularCatalogueId']); if (result.irregularCatalogueId !== id) throw new Error('invalid'); return { value: result, references: [{ path: 'irregularCatalogueId', category: 'catalogue.pattern', id }] }; } });
const fiveSets = (id: string): JsonContract => ({ validate(value) { const result = object(value, ['dealtConcealedTiles', 'irregularCatalogueId', 'winningStructuralTiles']); if (result.dealtConcealedTiles !== 16 || result.winningStructuralTiles !== 17 || result.irregularCatalogueId !== id) throw new Error('invalid'); return { value: result, references: [{ path: 'irregularCatalogueId', category: 'catalogue.pattern', id }] }; } });
const seatModels = new Map([['seats.winds-4', 4], ['seats.riichi-winds-4', 4], ['seats.riichi-sanma-east-south-west', 3], ['seats.american-four-player', 4]]);
const envFor = (fixture: Fixture): ResolverEnvironment => {
  const parameterised = new Map<string, string>([['tiles.flowers-144', 'tiles.flowers-options'], ['tiles.riichi-136', 'riichi-tiles-options'], ['tiles.sanma-108', 'sanma-tiles-options'], ['shape.four-sets-pair', 'four-set-options'], ['shape.five-sets-pair', 'five-set-options'], ['settlement.classical-pairwise', 'classical-settlement-options']]);
  const registry = new RegistryBank([...architectureSeedEntries.map(entry => parameterised.has(entry.id) ? { ...entry, parameterSchemaId: parameterised.get(entry.id) } : entry), { id: 'classical.concealed-hand-additive-points', category: 'classical', status: 'architecture-only' }, { id: 'classical.concealed-hand-double', category: 'classical', status: 'architecture-only' }]);
  const contracts = new Map<string, JsonContract>([
    ['tiles.flowers-options', fixture.id === 'A01' || fixture.id === 'A04' ? bool('bonusTilesEnabled') : bool('flowersSeasonsEnabled')], ['riichi-tiles-options', integer('redFives', 0, 4)], ['sanma-tiles-options', { validate(value) { const result = object(value, ['nukiDoraTile', 'redFives']); if (result.nukiDoraTile !== 'north' || !Number.isInteger(result.redFives) || (result.redFives as number) < 0 || (result.redFives as number) > 4) throw new Error('invalid'); return { value: result }; } }], ['four-set-options', irregular(({ A01: 'catalogue.pattern.mt-european-classical-specials', A02: 'catalogue.pattern.hk-profile-specials', A03: 'catalogue.pattern.mcr-special-shapes', A05: 'catalogue.pattern.riichi-ema-2025-special-shapes', A06: 'catalogue.pattern.sanma-profile-special-shapes', A07: 'catalogue.pattern.zung-jung-special-shapes' } as Record<string, string>)[fixture.id])], ['five-set-options', fiveSets('catalogue.pattern.taiwanese-profile-specials')], ['classical-settlement-options', { validate(value) { const result = object(value, ['eastMultiplier', 'loserToLoser']); if (result.eastMultiplier !== 2 || result.loserToLoser !== true) throw new Error('invalid'); return { value: result }; } }],
  ]);
  const profiles = new Map([[`${fixture.definition.identity.id}@${fixture.definition.identity.version}`, fixture.definition as ProfileAuthoringDefinition]]);
  return { registry, families: { get: id => id === fixture.family.id ? fixture.family : undefined }, seatModels: { get: id => { const playerCount = seatModels.get(id); return playerCount ? { id, playerCount } : undefined; } }, profiles: { get: ref => profiles.get(`${ref.id}@${ref.version}`) }, contracts: { get: id => contracts.get(id) }, familyContracts: { get: id => id === 'family.classical-western' ? { validate: value => { const result = object(value, ['concealedHandAdditivePointsId', 'concealedHandDoubleId', 'configVersion', 'presetId', 'profileBindingsId']); if (result.configVersion !== 1 || result.presetId !== 'classical.standard' || result.profileBindingsId !== 'classical.bindings.mt-european-classical' || result.concealedHandAdditivePointsId !== 'classical.concealed-hand-additive-points' || result.concealedHandDoubleId !== 'classical.concealed-hand-double') throw new Error('invalid'); return { value: result, references: [{ path: 'presetId', category: 'classical' as const, id: 'classical.standard' }, { path: 'profileBindingsId', category: 'classical' as const, id: 'classical.bindings.mt-european-classical' }, { path: 'concealedHandAdditivePointsId', category: 'classical' as const, id: 'classical.concealed-hand-additive-points' }, { path: 'concealedHandDoubleId', category: 'classical' as const, id: 'classical.concealed-hand-double' }] }; } } : undefined }, targetCatalogues: { has: ref => ref.id === 'catalogue.target.nmjl-2026-external-placeholder' && ref.version === '2026' } };
};

const assertReference = (references: readonly { path: string; id: string }[], path: string, id: string) => expect(references).toContainEqual(expect.objectContaining({ path, id }));
const assertFixturePressure = (fixture: Fixture, inspection: ReturnType<typeof inspectProfile>) => {
  const profile = inspection.profile!;
  const definition = fixture.definition.definition as Record<string, any>;
  switch (fixture.id) {
    case 'A01':
      expect(profile.progression.id).toBe('progression.rotate-every-hand');
      expect(definition.scoring.config.concealedHandAdditivePointsId).not.toBe(definition.scoring.config.concealedHandDoubleId);
      assertReference(inspection.references, 'scoring.config.concealedHandAdditivePointsId', 'classical.concealed-hand-additive-points');
      assertReference(inspection.references, 'scoring.config.concealedHandDoubleId', 'classical.concealed-hand-double');
      return;
    case 'A02':
      expect(profile.validation.handShapePolicyId).toBe('validation.hk-profile');
      expect(profile.scoring.grammar).toBe('pattern-accumulator');
      expect((profile.scoring.config as { qualificationPolicyId: string }).qualificationPolicyId).toBe('qualification.hk-profile');
      expect((profile.scoring.config as { conversionPolicyId: string }).conversionPolicyId).toBe('conversion.hk-fan-payment-table');
      assertReference(inspection.references, 'validation.handShapePolicyId', 'validation.hk-profile');
      assertReference(inspection.references, 'scoring.config.qualificationPolicyId', 'qualification.hk-profile');
      assertReference(inspection.references, 'scoring.config.conversionPolicyId', 'conversion.hk-fan-payment-table');
      return;
    case 'A03':
      expect((profile.scoring.config as { patternCatalogueId: string }).patternCatalogueId).toBe('catalogue.pattern.mcr-wmo-2006');
      expect((profile.scoring.config as { qualificationPolicyId: string }).qualificationPolicyId).toBe('qualification.mcr-8-before-flowers');
      expect((profile.scoring.config as { postQualificationBonusPolicyId: string }).postQualificationBonusPolicyId).toBe('post-qualification-bonus.mcr-flowers');
      expect(profile.progression.id).toBe('progression.always-pass');
      assertReference(inspection.references, 'scoring.config.patternCatalogueId', 'catalogue.pattern.mcr-wmo-2006');
      assertReference(inspection.references, 'scoring.config.qualificationPolicyId', 'qualification.mcr-8-before-flowers');
      assertReference(inspection.references, 'scoring.config.postQualificationBonusPolicyId', 'post-qualification-bonus.mcr-flowers');
      assertReference(inspection.references, 'progression.id', 'progression.always-pass');
      return;
    case 'A04':
      expect(profile.handShape.presetId).toBe('shape.five-sets-pair');
      expect(profile.handShape.options).toMatchObject({ dealtConcealedTiles: 16, winningStructuralTiles: 17 });
      assertReference(inspection.references, 'handShape.options.irregularCatalogueId', 'catalogue.pattern.taiwanese-profile-specials');
      return;
    case 'A05':
      expect(Object.keys(profile.scoring.config).filter(key => key !== 'configVersion').sort()).toEqual(['decompositionPolicyId', 'doraPolicyId', 'fuPolicyId', 'handValuePolicyId', 'limitTierPolicyId', 'yakuCatalogueId', 'yakumanCatalogueId']);
      expect(profile.evidence.policyIds).toContain('evidence-policy.riichi-ema-2025');
      expect(profile.evidence.alwaysRequired).toEqual(expect.arrayContaining(['evidence.winning-method', 'evidence.winning-tile-provenance', 'evidence.seat-wind', 'evidence.round-wind']));
      return;
    case 'A06':
      expect(profile.identity.grammar).toBe('riichi-han-fu');
      expect(profile.table).toEqual({ playerCount: 3, seatModelId: 'seats.riichi-sanma-east-south-west' });
      expect(profile.tileSet.presetId).toBe('tiles.sanma-108');
      expect(profile.validation.policyIds).toContain('validation.sanma-no-chii');
      return;
    case 'A07':
      expect(profile.scoring.config).toMatchObject({ patternCatalogueId: 'catalogue.pattern.zung-jung-1.03-44', interactionPolicyId: 'interaction.zung-jung-same-series-highest-only', floorPolicyId: 'value-policy.zung-jung-zero-pattern-one', capPolicyId: 'value-policy.zung-jung-320-listed-limit' });
      for (const [path, id] of [['scoring.config.patternCatalogueId', 'catalogue.pattern.zung-jung-1.03-44'], ['scoring.config.interactionPolicyId', 'interaction.zung-jung-same-series-highest-only'], ['scoring.config.floorPolicyId', 'value-policy.zung-jung-zero-pattern-one'], ['scoring.config.capPolicyId', 'value-policy.zung-jung-320-listed-limit']] as const) assertReference(inspection.references, path, id);
      return;
    case 'A08':
      expect((profile.scoring.config as { catalogueRef: { id: string; version: string } }).catalogueRef).toEqual({ id: 'catalogue.target.nmjl-2026-external-placeholder', version: '2026' });
      for (const [path, id] of [['scoring.config.catalogueRef.id', 'catalogue.target.nmjl-2026-external-placeholder'], ['scoring.config.matchPolicyId', 'target-match.nmjl-style'], ['scoring.config.substitutionPolicyId', 'substitution.nmjl-style-joker'], ['scoring.config.exposurePolicyId', 'target-exposure.nmjl-style'], ['scoring.config.valuePolicyId', 'target-value.catalogue-defined']] as const) assertReference(inspection.references, path, id);
      return;
  }
};

describe('eight architecture fixtures', () => {
  it.each(fixtures)('$id is structurally representable and deliberately non-playable', async fixture => {
    const inspection = inspectProfile(fixture.definition, envFor(fixture));
    expect(inspection.profile?.identity.grammar).toBe(fixture.family.allowedGrammars[0]);
    assertFixturePressure(fixture, inspection);
    for (const [id, category] of Object.entries(fixture.expectedCategories)) expect(inspection.references).toContainEqual(expect.objectContaining({ id, expectedCategory: category }));
    expect(inspection.references.filter(reference => reference.role === 'metadata')).toEqual([expect.objectContaining({ id: (fixture.definition.definition.provenance as { sources: string[] }).sources[0], actualStatus: 'metadata' })]);
    expect(inspection.references.filter(reference => reference.role === 'functional').every(reference => reference.actualStatus === 'architecture-only' && reference.blockerCode === 'REFERENCE_NOT_EXECUTABLE'), JSON.stringify(inspection.references)).toBe(true);
    await expect(resolvePlayableProfile({ id: fixture.definition.identity.id, version: fixture.definition.identity.version }, envFor(fixture))).rejects.toThrow('PROFILE_NOT_PLAYABLE:REFERENCE_NOT_EXECUTABLE');
  });

  it('keeps family codecs distinct and seat cardinality explicit', () => {
    expect(new Set(fixtures.map(fixture => fixture.family.handEvidenceCodecId)).size).toBe(8);
    for (const fixture of fixtures) expect(() => assertFamilyCompatibility(fixture.family, fixture.family.allowedGrammars[0], fixture.family, (fixture.definition.definition.tileSet as { presetId: string }).presetId, (fixture.definition.definition.table as { seatModelId: string }).seatModelId)).not.toThrow();
    const mismatch = JSON.parse(JSON.stringify(fixtures[0].definition)) as RootProfileDefinition;
    (mismatch.definition.table as { playerCount: number }).playerCount = 3;
    expect(inspectProfile(mismatch, envFor(fixtures[0])).blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'SEAT_PLAYER_COUNT_MISMATCH' })]));
  });
});

const executableEntry = (id: string, category: ConstructorParameters<typeof RegistryBank>[0][number]['category'], semanticRevision = 1) => ({ id, category, status: 'executable' as const, semanticRevision, executableContract: { kind: 'deterministic' as const, dependencies: [] as const } });
const playableRoot = (): RootProfileDefinition => root('phase2-base', 'family.phase2', 'classical-points-doubles', { playerCount: 4, seatModelId: 'seats.phase2-four' }, { presetId: 'tiles.phase2', options: {} }, { presetId: 'shape.phase2', options: {} }, { handShapePolicyId: 'validation.phase2', policyIds: [] }, {}, { policyIds: [], alwaysRequired: [] }, 'settlement.phase2', 'progression.phase2', 'game-end.phase2', 'source.phase2');
const capabilityEnvironment = (overrides: JsonObject, capability: Record<string, unknown>, mutate = false): ResolverEnvironment => {
  const base = playableRoot();
  const derived: ProfileAuthoringDefinition = { kind: 'derived', schemaVersion: 1, identity: { id: 'phase2-derived', version: '1', name: 'phase2-derived', status: 'custom' }, baseProfile: { id: base.identity.id, version: base.identity.version }, overrides };
  const entries = [
    executableEntry('family.phase2', 'family'), executableEntry('seats.phase2-four', 'seats'), executableEntry('tiles.phase2', 'tiles'), executableEntry('shape.phase2', 'shape'), executableEntry('validation.phase2', 'validation'), executableEntry('settlement.phase2', 'settlement'), executableEntry('progression.phase2', 'progression'), executableEntry('game-end.phase2', 'game-end'), executableEntry('validation.phase2-capability', 'validation'), { id: 'source.phase2', category: 'source' as const, status: 'metadata' as const },
  ];
  const profiles = new Map([[`${base.identity.id}@${base.identity.version}`, base as ProfileAuthoringDefinition], ['phase2-derived@1', derived]]);
  return { registry: new RegistryBank(entries), families: { get: id => id === 'family.phase2' ? { id, allowedGrammars: ['classical-points-doubles'], handEvidenceCodecId: 'phase2.hand', roundOutcomeCodecId: 'phase2.round', strategyStateCodecId: 'phase2.strategy' } : undefined }, seatModels: { get: id => id === 'seats.phase2-four' ? { id, playerCount: 4 } : undefined }, profiles: { get: ref => profiles.get(`${ref.id}@${ref.version}`) }, capabilities: { get: id => id === 'validation.phase2-capability' ? capability as never : undefined }, capabilityState: { all: () => [] }, contracts: { get: id => id === 'phase2.value' ? { validate: value => { if (!value || typeof value !== 'object' || Array.isArray(value) || (value as Record<string, unknown>).enabled !== true || Object.keys(value as object).length !== 1) throw new Error('invalid'); return { value: { enabled: true } }; } } : undefined }, capabilityAdapters: { get: id => id === 'validation.phase2-capability' ? { apply: profile => mutate ? { ...profile, scoring: { grammar: 'riichi-han-fu', config: profile.scoring.config as never } } : profile, isActive: () => false } : undefined } };
};
const capability = (extra: Record<string, unknown> = {}) => ({ id: 'validation.phase2-capability', category: 'validation' as const, status: 'executable' as const, semanticRevision: 1, customisation: 'customisable' as const, valueSchemaId: 'phase2.value', presentation: { presentationKey: 'phase2' }, authoringDimensions: [], ...extra });

describe('phase 2 negative and metamorphic matrix', () => {
  const inspect = (fixtureId: string, mutate: (definition: RootProfileDefinition) => void) => { const fixture = fixtures.find(item => item.id === fixtureId)!; const definition = JSON.parse(JSON.stringify(fixture.definition)) as RootProfileDefinition; mutate(definition); return inspectProfile(definition, envFor(fixture)); };

  it('1 unknown IDs, 2 wrong categories, and 16 stale dealer state fail closed', () => {
    expect(inspect('A01', definition => ((definition.definition.evidence as { policyIds: string[] }).policyIds = ['evidence-policy.unknown'])).blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'REFERENCE_UNRESOLVED' })]));
    expect(inspect('A01', definition => ((definition.definition.validation as { handShapePolicyId: string }).handShapePolicyId = 'tiles.flowers-144')).blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'REFERENCE_CATEGORY_MISMATCH' })]));
    expect(inspect('A01', definition => ((definition.definition as Record<string, unknown>).dealerModelId = 'dealer.old')).blockers).toEqual([expect.objectContaining({ blockerCode: 'ROOT_INVALID' })]);
  });

  it('3 target category/version and 12 architecture-only playability preserve their real blockers', async () => {
    const wrongCatalogue = inspect('A08', definition => (((definition.definition.scoring as { config: { catalogueRef: { id: string } } }).config.catalogueRef.id) = 'catalogue.pattern.hk-profile'));
    expect(wrongCatalogue.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'REFERENCE_CATEGORY_MISMATCH' }), expect.objectContaining({ blockerCode: 'CATALOGUE_UNAVAILABLE' })]));
    const missingVersion = inspect('A08', definition => (((definition.definition.scoring as { config: { catalogueRef: { version: string } } }).config.catalogueRef.version) = ''));
    expect(missingVersion.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'CATALOGUE_VERSION_REQUIRED' }), expect.objectContaining({ blockerCode: 'CATALOGUE_UNAVAILABLE' })]));
    const fixture = fixtures[0]; await expect(resolvePlayableProfile({ id: fixture.definition.identity.id, version: fixture.definition.identity.version }, envFor(fixture))).rejects.toThrow('PROFILE_NOT_PLAYABLE:REFERENCE_NOT_EXECUTABLE');
  });

  it('4 cross-family, 5 cross-grammar, 10 protected grammar mutation, and 11 invalid overrides fail through #231', async () => {
    await expect(resolvePlayableProfile({ id: 'phase2-derived', version: '1' }, capabilityEnvironment({ 'validation.phase2-capability': { enabled: true } }, capability({ compatibleFamilyIds: ['family.other'] })))).rejects.toThrow('CAPABILITY_FAMILY_INCOMPATIBLE');
    await expect(resolvePlayableProfile({ id: 'phase2-derived', version: '1' }, capabilityEnvironment({ 'validation.phase2-capability': { enabled: true } }, capability({ compatibleGrammars: ['riichi-han-fu'] })))).rejects.toThrow('CAPABILITY_GRAMMAR_INCOMPATIBLE');
    await expect(resolvePlayableProfile({ id: 'phase2-derived', version: '1' }, capabilityEnvironment({ 'validation.phase2-capability': { enabled: true } }, capability(), true))).rejects.toThrow('CAPABILITY_PROTECTED_FIELD_MUTATION');
    await expect(resolvePlayableProfile({ id: 'phase2-derived', version: '1' }, capabilityEnvironment({ 'validation.phase2-capability': { enabled: 'yes' } }, capability()))).rejects.toThrow('CAPABILITY_VALUE_INVALID');
    await expect(resolvePlayableProfile({ id: 'phase2-derived', version: '1' }, capabilityEnvironment({ 'validation.unknown': true }, capability()))).rejects.toThrow('CAPABILITY_UNRESOLVED');
  });

  it('6 codec, 7 tile, 8 seat, and 9 cardinality incompatibilities are distinct', () => {
    const fixture = fixtures.find(item => item.id === 'A05')!;
    expect(() => assertFamilyCompatibility(fixture.family, 'riichi-han-fu', { ...fixture.family, handEvidenceCodecId: 'wrong' })).toThrow('Codec combination is incompatible');
    expect(inspect('A05', definition => { (definition.definition.tileSet as { presetId: string; options: JsonObject }).presetId = 'tiles.sanma-108'; (definition.definition.tileSet as { options: JsonObject }).options = { nukiDoraTile: 'north', redFives: 3 }; }).blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'FAMILY_TILESET_INCOMPATIBLE' })]));
    expect(inspect('A05', definition => ((definition.definition.table as { seatModelId: string }).seatModelId = 'seats.winds-4')).blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'FAMILY_SEATMODEL_INCOMPATIBLE' })]));
    expect(inspect('A06', definition => ((definition.definition.table as { playerCount: number }).playerCount = 4)).blockers).toEqual(expect.arrayContaining([expect.objectContaining({ blockerCode: 'SEAT_PLAYER_COUNT_MISMATCH' })]));
  });

  it('13 metadata is inert, 14 captures exact executable revisions, and 17 rejects executable fields', () => {
    const normal = inspectProfile(fixtures[0].definition, envFor(fixtures[0]));
    expect(normal.references.find(reference => reference.path === 'provenance.sources')).toMatchObject({ role: 'metadata', actualStatus: 'metadata', blockerCode: undefined });
    const executable = new RegistryBank([executableEntry('pattern.phase2', 'pattern', 7)]).requireExecutable('pattern', 'pattern.phase2');
    expect(executable.semanticRevision).toBe(7);
    expect(inspect('A01', definition => ((definition.definition as Record<string, unknown>).callback = () => true)).blockers).toEqual([expect.objectContaining({ blockerCode: 'ROOT_INVALID' })]);
    const inert = inspect('A01', definition => ((definition.definition.provenance as { metadata: JsonObject }).metadata.expression = '() => score'));
    expect(inert.profile).toBeDefined();
  });
});
