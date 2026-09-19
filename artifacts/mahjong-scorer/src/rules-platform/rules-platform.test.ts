import { describe, expect, it } from 'vitest';
import { profileAuthoringDefinitionSchema, resolvedScoringConfigSchema } from './schemas';
import type {
  CanonicalTileFace, CatalogueRef, ExecutableRegistryIdentity, GameEndResult, HandEvaluationInput,
  HandScoreResult, ProfileAuthoringDefinition, ResolvedTableConfig, RoundResolution,
  RulesFamilyDefinition, RulesProfileRef, SettlementTransaction,
} from './types';

const identity = { id: 'test', version: '1', name: 'Test', status: 'custom' as const };

describe('rules platform vocabulary', () => {
  it('represents root and derived authoring definitions with an exact derived base', () => {
    const root: ProfileAuthoringDefinition = { kind: 'root', schemaVersion: 1, identity, definition: { enabled: true } };
    expect(root.kind).toBe('root');
    expect(profileAuthoringDefinitionSchema.safeParse({ kind: 'derived', schemaVersion: 1, identity, overrides: {} }).success).toBe(false);
    expect(profileAuthoringDefinitionSchema.safeParse({ kind: 'derived', schemaVersion: 1, identity, baseProfile: { id: 'base', version: '2' }, overrides: {} }).success).toBe(true);
  });

  it('rejects executable values at authoring and scoring schema boundaries', () => {
    expect(profileAuthoringDefinitionSchema.safeParse({ kind: 'root', schemaVersion: 1, identity, definition: { callback: () => true } }).success).toBe(false);
    expect(resolvedScoringConfigSchema.safeParse({ grammar: 'classical-points-doubles', config: { callback: () => true } }).success).toBe(false);
  });

  it('fails closed at fixed-schema boundaries while retaining open JSON payloads', () => {
    expect(profileAuthoringDefinitionSchema.safeParse({
      kind: 'root', schemaVersion: 1, identity, definition: {}, unexpected: () => true,
    }).success).toBe(false);
    expect(profileAuthoringDefinitionSchema.safeParse({
      kind: 'root', schemaVersion: 1, identity: { ...identity, unexpected: 'field' }, definition: {},
    }).success).toBe(false);
    expect(profileAuthoringDefinitionSchema.safeParse({
      kind: 'derived', schemaVersion: 1, identity, baseProfile: { id: 'base', version: '1', execute: () => true }, overrides: {},
    }).success).toBe(false);
    expect(resolvedScoringConfigSchema.safeParse({
      grammar: 'pattern-accumulator', unexpected: () => true,
      config: { configVersion: 1, unit: 'fan', patternCatalogueId: 'p', interactionPolicyId: 'i', qualificationPolicyId: 'q', interpretationPolicyId: 'x' },
    }).success).toBe(false);
    expect(resolvedScoringConfigSchema.safeParse({
      grammar: 'target-catalogue',
      config: { configVersion: 1, catalogueRef: { id: 'c', version: '1', unexpected: 'field' }, matchPolicyId: 'm', substitutionPolicyId: 's', exposurePolicyId: 'e', valuePolicyId: 'v' },
    }).success).toBe(false);
    expect(resolvedScoringConfigSchema.safeParse({
      grammar: 'riichi-han-fu',
      config: { configVersion: 1, yakuCatalogueId: 'y', yakumanCatalogueId: 'k', decompositionPolicyId: 'd', doraPolicyId: 'd', fuPolicyId: 'f', limitTierPolicyId: 'l', handValuePolicyId: 'h', unexpected: 'field' },
    }).success).toBe(false);
    expect(profileAuthoringDefinitionSchema.safeParse({
      kind: 'root', schemaVersion: 1, identity, definition: { arbitraryMetadata: { stays: 'open' } },
    }).success).toBe(true);
  });

  it('keeps evidence and trusted context as separate generic contracts', () => {
    const input: HandEvaluationInput<{ tileIds: string[] }, { actorId: string }> = { evidence: { tileIds: ['a'] }, context: { actorId: 'p1' } };
    expect(input.context.actorId).toBe('p1');
  });

  it('keeps table count neutral and tiles structural with separate traits', () => {
    const table: ResolvedTableConfig = { playerCount: 3, seatModelId: 'sanma' };
    const face: CanonicalTileFace = { family: 'suit', suit: 'characters', rank: 5 };
    expect({ face, traitIds: ['red-five'] }).toEqual({ face, traitIds: ['red-five'] });
    expect(table.playerCount).toBe(3);
    expect('dealerModelId' in table).toBe(false);
  });

  it('keeps profile and catalogue references as separate contracts', () => {
    const profile: RulesProfileRef = { id: 'profile', version: '1' };
    const catalogue: CatalogueRef = { id: 'catalogue', version: '1' };
    expect(profile.id).not.toBe(catalogue.id);
  });

  it('discriminates scoring and score-result grammar bodies', () => {
    const config = resolvedScoringConfigSchema.parse({ grammar: 'pattern-accumulator', config: { configVersion: 1, unit: 'fan', patternCatalogueId: 'p', interactionPolicyId: 'i', qualificationPolicyId: 'q', interpretationPolicyId: 'x' } });
    expect(config.grammar).toBe('pattern-accumulator');
    const result: HandScoreResult = { grammar: 'riichi-han-fu', profile: { id: 'p', version: '1' }, rulesFingerprint: 'f', legal: true, explanation: [], matchedCanonicalPatternIds: [], result: { han: 3, fu: 40, value: 5200 } };
    expect(result.result.han).toBe(3);
  });

  it('supports multi-score rounds, neutral ledger parties, and distinct finalisation', () => {
    const resolution: RoundResolution<{ kind: 'draw' }, string> = { outcome: { kind: 'draw' }, acceptedScores: ['a', 'b'] };
    const transaction: SettlementTransaction = { from: 'house', to: 'player-1', amount: 100, reasonId: 'bonus' };
    const end: GameEndResult = { complete: true, finalisation: { transactions: [transaction] } };
    expect(resolution.acceptedScores).toHaveLength(2);
    expect(end.finalisation?.transactions?.[0].from).toBe('house');
  });

  it('defines registry identity and explicit family codec compatibility', () => {
    const registry: ExecutableRegistryIdentity = { id: 'registry', semanticRevision: 2 };
    const family: RulesFamilyDefinition = { id: 'family', allowedGrammars: ['target-catalogue'], handEvidenceCodecId: 'hand-v1', roundOutcomeCodecId: 'round-v1', strategyStateCodecId: 'strategy-v1' };
    expect(registry.semanticRevision).toBe(2);
    expect(family.handEvidenceCodecId).toBe('hand-v1');
  });
});
