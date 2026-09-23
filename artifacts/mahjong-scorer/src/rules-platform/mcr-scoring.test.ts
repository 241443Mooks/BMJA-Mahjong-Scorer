import { describe, expect, it } from 'vitest';
import { compileMcr2006HandScorer, MCR_2006_SCORING_IDENTITIES, selectMcrHighestLawfulAlternative } from './mcr-scoring';
import { detectMcr2006Fans } from './mcr-detectors';
import { interactMcr2006NonCombination } from './mcr-interaction';
import { architectureSeedEntries } from './architecture-seeds';
import type { McrScoringInput } from './mcr-scoring-input';
import type { ResolvedProfileArtifact } from './types';

const tile = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ face: { family: 'suit' as const, suit, rank } });
const wind = (value: 'east' | 'south' | 'west' | 'north') => ({ face: { family: 'wind' as const, wind: value } });
const pung = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => [tile(suit, rank), tile(suit, rank), tile(suit, rank)];
const meldedPung = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ kind: 'pung' as const, exposure: 'melded' as const, tiles: pung(suit, rank) });
const meldedKong = (suit: 'characters' | 'bamboo' | 'dots', rank: number) => ({ kind: 'kong' as const, exposure: 'melded' as const, tiles: [tile(suit, rank), tile(suit, rank), tile(suit, rank), tile(suit, rank)] });
const q001 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedPung('characters', 2), meldedPung('dots', 5), meldedPung('bamboo', 8)], freeTiles: [...pung('characters', 4), wind('west'), wind('west')], winningTile: tile('characters', 4), flowerCount: 2 }, context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const q002 = (): McrScoringInput => ({ evidence: { fixedGroups: [meldedKong('characters', 2), meldedPung('dots', 5), meldedPung('bamboo', 8)], freeTiles: [...pung('characters', 4), wind('west'), wind('west')], winningTile: tile('characters', 4), flowerCount: 2 }, context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const q003 = (): McrScoringInput => ({ evidence: { fixedGroups: [{ kind: 'chow', exposure: 'melded', tiles: [tile('characters', 1), tile('characters', 2), tile('characters', 3)] }], freeTiles: [tile('characters', 6), tile('characters', 7), tile('characters', 8), tile('dots', 3), tile('dots', 4), tile('dots', 5), tile('bamboo', 7), tile('bamboo', 8), tile('bamboo', 9), wind('west'), wind('west')], winningTile: tile('characters', 6), flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } });
const artifact = (): ResolvedProfileArtifact => {
  const identities = Object.values(MCR_2006_SCORING_IDENTITIES);
  return { profile: { schemaVersion: 1, identity: { id: 'mcr-scoring-proof', version: '0.0.1', status: 'provisional', familyId: 'family.mcr', grammar: 'pattern-accumulator' }, table: { playerCount: 4, seatModelId: 'seats.winds-4' }, tileSet: { presetId: 'tiles.flowers-144', options: {} }, handShape: { presetId: 'shape.four-sets-pair', options: {} }, validation: { handShapePolicyId: 'validation.mcr-winning-shape', policyIds: [] }, scoring: { grammar: 'pattern-accumulator', config: { configVersion: 1, unit: 'points', patternCatalogueId: identities[0]!.id, interactionPolicyId: identities[2]!.id, qualificationPolicyId: identities[4]!.id, interpretationPolicyId: identities[3]!.id, postQualificationBonusPolicyId: identities[5]!.id, conversionPolicyId: identities[6]!.id } }, evidence: { policyIds: [identities[1]!.id], alwaysRequired: [] }, settlement: { id: 'settlement.mcr-2006', params: {} }, progression: { id: 'progression.always-pass', params: {} }, gameEnd: { id: 'game-end.four-round-always-pass', params: {} }, provenance: {} }, rulesFingerprint: 'mcr-scoring-proof', executableDependencies: identities.map(({ id, semanticRevision }) => ({ id, semanticRevision })) } as ResolvedProfileArtifact;
};
const score = (input: McrScoringInput) => compileMcr2006HandScorer(artifact())(input);
const details = (result: ReturnType<ReturnType<typeof compileMcr2006HandScorer>>) => (result.result as unknown as { total: number; details: { candidatePatterns: readonly { bindingId?: string; id: string; value: number; sourceLocator?: string }[]; countedPatterns: readonly { id: string; value: number }[]; suppressedPatterns: readonly { id: string; reasonId: string }[]; selectedInterpretationId: string; qualifyingSubtotal: number; postQualificationBonus: number; provenance?: { kind: string; executableDependencies: readonly string[] } } }).details;
const candidateFans = (input: McrScoringInput) => detectMcr2006Fans(input).candidates.map(({ bindingId }) => bindingId).sort();

describe('MCR A1c Pass 2 scoring closure', () => {
  it('scores corrected Q001 and Q002 before Flowers and keeps their exact fan sets', () => {
    const rejected = score(q001());
    expect(rejected.disposition).toMatchObject({ kind: 'not-qualifying', reasonId: 'qualification.mcr.minimum-eight-fan' });
    expect(details(rejected)).toMatchObject({ qualifyingSubtotal: 7, postQualificationBonus: 0 });
    expect(details(rejected).countedPatterns.map(({ id }) => id.split('#')[0]).sort()).toEqual(['mcr2006.fan.all-pungs', 'mcr2006.fan.self-drawn']);
    expect(candidateFans(q001())).not.toContain('mcr2006.fan.chicken-hand');

    const accepted = score(q002());
    expect(accepted.disposition).toEqual({ kind: 'scored' });
    expect((accepted.result as { total: number }).total).toBe(10);
    expect(details(accepted)).toMatchObject({ qualifyingSubtotal: 8, postQualificationBonus: 2 });
    expect(details(accepted).countedPatterns.map(({ id }) => id.split('#')[0]).sort()).toEqual(['mcr2006.fan.all-pungs', 'mcr2006.fan.melded-kong', 'mcr2006.fan.self-drawn']);
  });

  it('finalizes the neutral Q003 zero-fan branch as Chicken Hand 8', () => {
    const input = q003();
    expect(candidateFans(input)).not.toContain('mcr2006.fan.chicken-hand');
    const result = score(input);
    expect(result.disposition).toEqual({ kind: 'scored' });
    expect((result.result as { total: number }).total).toBe(8);
    expect(details(result)).toMatchObject({ qualifyingSubtotal: 8, postQualificationBonus: 0 });
    expect(details(result).countedPatterns).toEqual([{ id: expect.stringMatching(/^mcr2006\.fan\.chicken-hand#/), value: 8 }]);
  });

  it('applies Chicken only to lawful zero, rejects no lawful branch, and preserves 1–7 and 8+ boundaries', () => {
    expect((score(q003()).result as { total: number }).total).toBe(8);
    const malformedShape = q003();
    const noInterpretation = { ...malformedShape, evidence: { ...malformedShape.evidence, freeTiles: malformedShape.evidence.freeTiles.map((item) => item.face.family === 'suit' && item.face.suit === 'dots' && item.face.rank === 3 ? { face: { family: 'dragon' as const, dragon: 'red' as const } } : item) } };
    expect(score(noInterpretation).disposition).toEqual({ kind: 'invalid', reasonId: 'pattern-accumulator.no-lawful-alternative' });
    const below = score(q001());
    expect(below.disposition.kind).toBe('not-qualifying');
    expect(details(below).countedPatterns.some(({ id }) => id.startsWith('mcr2006.fan.chicken-hand#'))).toBe(false);
    const above = score(q002());
    expect(above.disposition.kind).toBe('scored');
    expect(details(above).countedPatterns.some(({ id }) => id.startsWith('mcr2006.fan.chicken-hand#'))).toBe(false);
  });

  it('uses resolved event interaction before Chicken finalization', () => {
    const input = q003(); input.context.winSource = 'self-draw'; input.context.resolvedWinEvent = 'last-wall-draw';
    const result = score(input);
    expect((result.result as { total: number }).total).toBe(8);
    expect(details(result).countedPatterns.map(({ id }) => id.split('#')[0])).toEqual(['mcr2006.fan.last-tile-draw']);
    expect(details(result).suppressedPatterns).toContainEqual(expect.objectContaining({ id: expect.stringContaining('mcr2006.fan.self-drawn'), reasonId: expect.stringContaining('last-tile-draw-excludes-self-drawn') }));
  });

  it('selects the real highest lawful decomposition and resolves equal totals deterministically', () => {
    const ambiguous: McrScoringInput = { evidence: { fixedGroups: [], freeTiles: [...pung('characters', 1), ...pung('characters', 2), ...pung('characters', 3), ...pung('characters', 4), tile('characters', 5), tile('characters', 5)], winningTile: tile('characters', 5), flowerCount: 0 }, context: { winSource: 'self-draw', resolvedWinEvent: 'none', lastVisibleCopy: false } };
    const detected = detectMcr2006Fans(ambiguous);
    const alternatives = interactMcr2006NonCombination(detected.candidates, ambiguous).alternatives;
    const totals = alternatives.map((branch) => ({ id: branch.id, total: branch.counted.reduce((sum, item) => sum + item.value, 0) }));
    expect(totals.length).toBeGreaterThan(1);
    const maximum = Math.max(...totals.map(({ total }) => total));
    const tied = totals.filter(({ total }) => total === maximum).map(({ id }) => id).sort();
    const result = score(ambiguous);
    expect(details(result).selectedInterpretationId).toBe(tied[0]);
    expect(details(result).qualifyingSubtotal).toBe(maximum);
    expect(tied.length).toBeGreaterThan(0);
    expect(result.decisionTrace.filter((entry) => entry.kind === 'suppress').every((entry) => entry.identities.reasonId?.startsWith('interaction.mcr-2006-non-combination.'))).toBe(true);
    expect(result.decisionTrace.filter((entry) => entry.kind === 'suppress').map(({ id }) => id).sort()).toEqual(details(result).suppressedPatterns.map(({ id }) => `suppressed:${id}`).sort());
    expect(result.decisionTrace.filter((entry) => entry.kind === 'count').map(({ id }) => id).sort()).toEqual(details(result).countedPatterns.map(({ id }) => `counted:${id}`).sort());
    expect(selectMcrHighestLawfulAlternative({ alternatives: [
      { id: 'ordinary:z', counted: [{ id: 'z', value: 8, interpretationId: 'ordinary:z' }], suppressed: [] },
      { id: 'ordinary:a', counted: [{ id: 'a', value: 8, interpretationId: 'ordinary:a' }], suppressed: [] },
    ] })).toBe('ordinary:a');
  });

  it('dispatches canonical @1 identities, preserves source metadata, and never returns proof identities', () => {
    const result = score(q002()); const audit = details(result);
    expect(audit.provenance).toMatchObject({ kind: 'mcr-2006-scoring', executableDependencies: expect.arrayContaining(Object.values(MCR_2006_SCORING_IDENTITIES).map(({ id }) => `${id}@1`)) });
    expect(audit.provenance!.executableDependencies.some((id) => id.includes('a0-proof'))).toBe(false);
    expect(audit.candidatePatterns.every(({ id }) => !id.includes('a0-proof'))).toBe(true);
    expect(audit.candidatePatterns.find(({ bindingId }) => bindingId === 'mcr2006.fan.all-pungs')).toMatchObject({ bindingId: 'mcr2006.fan.all-pungs', id: expect.stringContaining('mcr2006.fan.all-pungs#'), sourceLocator: expect.stringContaining('§3.8.1') });
    expect(Object.values(MCR_2006_SCORING_IDENTITIES).every(({ id }) => architectureSeedEntries.find((entry) => entry.id === id)?.status === 'architecture-only')).toBe(true);
    const bad = artifact(); bad.executableDependencies = bad.executableDependencies.map((item) => item.id === 'qualification.mcr-8-before-flowers' ? { ...item, semanticRevision: 2 } : item);
    expect(() => compileMcr2006HandScorer(bad)).toThrow('IMPLEMENTATION_UNAVAILABLE');
  });
});
