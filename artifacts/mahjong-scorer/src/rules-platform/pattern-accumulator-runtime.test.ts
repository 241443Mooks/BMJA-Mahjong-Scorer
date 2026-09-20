import { describe, expect, it } from 'vitest';
import { compileHandScorer, PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES } from './pattern-accumulator-runtime';
import type { PatternAccumulatorConfigV1, ResolvedProfileArtifact } from './types';

const artifact = (): ResolvedProfileArtifact => ({
  profile: {
    schemaVersion: 1,
    identity: { id: 'proof.pattern-accumulator-a0', version: '0.0.1', status: 'provisional', familyId: 'family.proof', grammar: 'pattern-accumulator' },
    table: { playerCount: 4, seatModelId: 'seats.proof' }, tileSet: { presetId: 'tiles.proof', options: {} }, handShape: { presetId: 'shape.proof', options: {} }, validation: { handShapePolicyId: 'validation.proof', policyIds: [] },
    scoring: { grammar: 'pattern-accumulator', config: { configVersion: 1, unit: 'points', patternCatalogueId: 'catalogue.pattern.a0-proof', interactionPolicyId: 'interaction.a0-proof-highest-only', qualificationPolicyId: 'qualification.a0-proof-eight-before-flowers', interpretationPolicyId: 'interpretation.a0-proof-highest-lawful', postQualificationBonusPolicyId: 'post-qualification-bonus.a0-proof-flowers', conversionPolicyId: 'conversion.a0-proof-identity' } },
    evidence: { policyIds: ['evidence-policy.a0-proof'], alwaysRequired: [] }, settlement: { id: 'settlement.unfinished', params: {} }, progression: { id: 'progression.unfinished', params: {} }, gameEnd: { id: 'game-end.unfinished', params: {} }, provenance: { metadata: { kind: 'non-production-a0-proof' } },
  },
  rulesFingerprint: 'a0-proof-fingerprint',
  executableDependencies: Object.values(PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES).filter(Boolean),
});

describe('pattern-accumulator A0 proof hand scorer', () => {
  it('dispatches by grammar and exact revision, without table strategy compilation', () => {
    expect(() => compileHandScorer(artifact())).not.toThrow();
    const wrong = artifact();
    wrong.executableDependencies = wrong.executableDependencies.map((identity) => identity.id === 'catalogue.pattern.a0-proof' ? { ...identity, semanticRevision: 2 } : identity);
    expect(() => compileHandScorer(wrong)).toThrow('PATTERN_ACCUMULATOR_IMPLEMENTATION_UNAVAILABLE');
  });

  it('counts, suppresses with a stable policy reason, and selects the highest lawful interpretation', () => {
    const result = compileHandScorer(artifact())({ structurallyValid: true, flowerCount: 0, knownEvidenceIds: [], candidates: [
      { id: 'proof.low', value: 8, interpretationId: 'low' },
      { id: 'proof.high', value: 9, interpretationId: 'high' },
      { id: 'proof.suppressed', value: 4, interpretationId: 'high' },
    ] });
    expect(result).toMatchObject({ grammar: 'pattern-accumulator', disposition: { kind: 'scored' }, result: { total: 9, details: { qualifyingSubtotal: 9, selectedInterpretationId: 'high' } } });
    expect(result.decisionTrace).toContainEqual(expect.objectContaining({ kind: 'suppress', identities: expect.objectContaining({ reasonId: 'interaction.a0-proof.highest-only', policyId: 'interaction.a0-proof-highest-only@1' }) }));
  });

  it('qualifies before Flowers, then applies the proof-only post-qualification bonus', () => {
    const scorer = compileHandScorer(artifact());
    const seven = scorer({ structurallyValid: true, flowerCount: 2, knownEvidenceIds: [], candidates: [{ id: 'proof.seven', value: 7 }] });
    expect(seven).toMatchObject({ disposition: { kind: 'not-qualifying' }, result: { total: 0, details: { qualifyingSubtotal: 7, postQualificationBonus: 0 } } });
    const eight = scorer({ structurallyValid: true, flowerCount: 2, knownEvidenceIds: [], candidates: [{ id: 'proof.eight', value: 8 }] });
    expect(eight).toMatchObject({ disposition: { kind: 'scored' }, result: { total: 10, details: { qualifyingSubtotal: 8, postQualificationBonus: 2, provenance: { kind: 'non-production-a0-proof' } } } });
  });

  it('fails closed for missing material evidence and structural invalidity', () => {
    const scorer = compileHandScorer(artifact());
    expect(scorer({ structurallyValid: true, flowerCount: 0, knownEvidenceIds: [], candidates: [{ id: 'proof.event', value: 8, requiresEvidenceId: 'evidence.resolved-win-event' }] }).disposition).toEqual({ kind: 'needs-evidence', missingEvidenceIds: ['evidence.resolved-win-event'] });
    expect(scorer({ structurallyValid: true, flowerCount: 0, knownEvidenceIds: ['evidence.resolved-win-event'], candidates: [{ id: 'proof.event', value: 8, requiresEvidenceId: 'evidence.resolved-win-event' }] }).disposition).toEqual({ kind: 'scored' });
    expect(scorer({ structurallyValid: false, flowerCount: 0, knownEvidenceIds: [], candidates: [] }).disposition).toEqual({ kind: 'invalid', reasonId: 'pattern-accumulator.a0-proof.invalid-input' });
  });

  it('cannot present the incomplete canonical MCR catalogue as executable', () => {
    const canonical = artifact();
    const config = canonical.profile.scoring.config as PatternAccumulatorConfigV1;
    canonical.profile.scoring = { grammar: 'pattern-accumulator', config: { ...config, patternCatalogueId: 'catalogue.pattern.mcr-wmo-2006' } };
    canonical.executableDependencies = canonical.executableDependencies.map((identity) => identity.id === 'catalogue.pattern.a0-proof' ? { id: 'catalogue.pattern.mcr-wmo-2006', semanticRevision: 1 } : identity);
    expect(() => compileHandScorer(canonical)).toThrow('PATTERN_ACCUMULATOR_IMPLEMENTATION_UNAVAILABLE');
  });
});
