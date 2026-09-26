import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited, wind, type HandSet, type PlayingTile } from '../scoring';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { BUZZARD_2000_PROFILE_REF } from '../game/buzzard-2000';
import { OUTSIDE_THE_BOX_PROFILE_REF } from '../game/outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF } from '../game/western-tm-catalogue';
import { MCR_WMO_2006_PROFILE } from './mcr-profile';
import { getCurrentCompiledRulesRuntime, initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { resolveClassicalWinner, type ClassicalWinnerVisibilityResolution } from './classical-winner-resolution';
import { interpretClassicalHand } from './classical-interpretation';
import type { ClassicalInterpretationInput } from './classical-interpretation';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const inputFor = (extra: Partial<ClassicalInterpretationInput> = {}): ClassicalInterpretationInput => ({
  profile: BMJA_PROFILE_REF, explicitSets: [], unresolvedTiles: [], bonusTiles: [], isWinner: true,
  context, handMode: 'normal', ...extra,
});
const knownWinner = (): HandSet[] => [
  set('east', 'pung', wind('east')), set('south', 'pung', wind('south')),
  set('west', 'pung', wind('west')), set('red', 'pung', dragon('red')),
  set('pair', 'pair', suited('bamboo', 9)),
];
const resolvedAll = (result: Extract<ReturnType<typeof resolveClassicalWinner>, { kind: 'facts-required' }>): ClassicalWinnerVisibilityResolution[] =>
  result.unresolvedFacts.map(({ groupId }) => ({ groupId, value: 'exposed' }));

describe('pure Classical complete-winner resolution', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());

  it('preserves all-explicit scoring through the selected exact runtime', () => {
    const explicitSets = knownWinner();
    const input = inputFor({ explicitSets });
    const result = resolveClassicalWinner(input);
    expect(result.kind).toBe('ready');
    if (result.kind !== 'ready') return;
    const direct = getCurrentCompiledRulesRuntime(BMJA_PROFILE_REF);
    if (direct.grammar !== 'classical-points-doubles') throw new Error('Expected Classical runtime');
    expect(result.scoreResult).toEqual(direct.runtime.scoreHand({ evidence: result.hand, context }));
    expect(result.hand.remainingTiles).toBeUndefined();
    expect(result.provenance).toMatchObject({ explicitSetIds: explicitSets.map(({ id }) => id), inferredGroups: [], factResolutions: [] });
  });

  it.each([
    ['BMJA', BMJA_PROFILE_REF], ['Club', OUTSIDE_THE_BOX_PROFILE_REF],
    ['Buzzard', BUZZARD_2000_PROFILE_REF], ['Western', WESTERN_TM_PROFILE_REF],
  ] as const)('scores the explicit winner through exact %s runtime identity', (_label, profile) => {
    const result = resolveClassicalWinner(inputFor({ profile, explicitSets: knownWinner() }));
    expect(result.kind).toBe('ready');
    if (result.kind !== 'ready') return;
    expect(result.scoreResult.profile).toEqual(profile);
    expect(result.scoreResult.legal).toBe(true);
    expect(result.hand.remainingTiles).toBeUndefined();
  });

  it('keeps multiple structural candidates unranked until a candidate is selected', () => {
    const repeatedRanks = [1, 2, 3].flatMap((rank) => Array.from({ length: 3 }, () => suited('bamboo', rank as 1 | 2 | 3)));
    const tiles: PlayingTile[] = [...repeatedRanks, ...Array.from({ length: 3 }, () => suited('circles', 4)), ...Array.from({ length: 2 }, () => suited('characters', 9))];
    const result = resolveClassicalWinner(inputFor({ profile: BUZZARD_2000_PROFILE_REF, unresolvedTiles: tiles }));
    expect(result.kind).toBe('candidate-choice-required');
    if (result.kind === 'candidate-choice-required') expect(result.candidates.length).toBeGreaterThan(1);
  });

  it('requires inferred visibility and rejects stale visibility resolutions', () => {
    const repeatedRanks = [1, 2, 3].flatMap((rank) => Array.from({ length: 3 }, () => suited('bamboo', rank as 1 | 2 | 3)));
    const tiles: PlayingTile[] = [...repeatedRanks, ...Array.from({ length: 3 }, () => suited('circles', 4)), ...Array.from({ length: 2 }, () => suited('characters', 9))];
    const input = inputFor({ profile: BUZZARD_2000_PROFILE_REF, unresolvedTiles: tiles });
    const ambiguous = resolveClassicalWinner(input);
    if (ambiguous.kind !== 'candidate-choice-required') throw new Error('Expected ambiguity');
    const candidateId = ambiguous.candidates[0]!.id;
    const facts = resolveClassicalWinner(input, { candidateId });
    expect(facts.kind).toBe('facts-required');
    expect(() => resolveClassicalWinner(input, { candidateId, visibility: [{ groupId: 'stale-id', value: 'exposed' }] })).toThrow(/INVALID_VISIBILITY/);
    if (facts.kind !== 'facts-required') return;
    expect(resolvedAll(facts)).toHaveLength(facts.unresolvedFacts.length);
  });

  it('uses an exact-runtime conservative exposed default for a sole inferred Kong', () => {
    const explicitSets = [
      set('east', 'pung', wind('east')), set('south', 'pung', wind('south')),
      set('west', 'pung', wind('west')), set('pair', 'pair', suited('bamboo', 9)),
    ];
    const input = inputFor({ explicitSets, unresolvedTiles: Array.from({ length: 4 }, () => dragon('red')) });
    const candidates = interpretClassicalHand(input);
    const chosen = candidates.candidates.find(({ inferredGroups }) => inferredGroups.some(({ kind }) => kind === 'kong'));
    if (!chosen) throw new Error('Expected inferred Kong candidate');
    const result = resolveClassicalWinner(input, { candidateId: chosen.id });
    expect(result.kind).toBe('ready');
    if (result.kind !== 'ready') return;
    expect(result.hand.sets.find(({ kind }) => kind === 'kong')?.visibility).toBe('exposed');
    expect(result.provenance.factResolutions).toContainEqual(expect.objectContaining({ groupId: chosen.inferredGroups.find(({ kind }) => kind === 'kong')!.id, value: 'exposed', origin: 'default' }));
    const concealed = resolveClassicalWinner(input, { candidateId: chosen.id, visibility: [{ groupId: chosen.inferredGroups.find(({ kind }) => kind === 'kong')!.id, value: 'concealed' }] });
    expect(concealed.kind).toBe('ready');
    if (concealed.kind === 'ready') expect(concealed.scoreResult.result).not.toEqual(result.scoreResult.result);
  });

  it('preserves supplied winner evidence and rejects MCR at the interpreter boundary', () => {
    const explicitSets = knownWinner();
    const result = resolveClassicalWinner(inputFor({ explicitSets }), {
      evidence: { winningMethod: 'discard', originalCall: true, classicalEvidence: { standingHand: true }, winningEventEvidence: { type: 'discard', discardedBy: 'south', handDiscardOrdinal: 2 } },
    });
    expect(result.kind).toBe('runtime-rejected');
    if (result.kind === 'runtime-rejected') expect(result.hand).toMatchObject({ winningMethod: 'discard', originalCall: true, classicalEvidence: { standingHand: true }, winningEventEvidence: { type: 'discard', discardedBy: 'south', handDiscardOrdinal: 2 } });
    expect(resolveClassicalWinner(inputFor({ profile: MCR_WMO_2006_PROFILE.identity })).kind).toBe('no-lawful-candidate');
  });
});
