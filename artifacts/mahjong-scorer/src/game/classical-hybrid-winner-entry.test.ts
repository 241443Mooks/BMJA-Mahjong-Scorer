import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited, wind } from '../scoring';
import { BMJA_PROFILE_REF } from './ruleset';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { resolveHybridWinner } from './classical-hybrid-winner-entry';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
const explicitSets = [set('east', 'pung', wind('east')), set('south', 'pung', wind('south')), set('west', 'pung', wind('west')), set('pair', 'pair', suited('bamboo', 9))];

describe('Classical hybrid winner UI adapter', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());

  it('projects a resolved winner without putting UI rest tiles on the scorer hand', () => {
    const state = { profile: BMJA_PROFILE_REF, explicitSets, unresolvedTiles: Array.from({ length: 3 }, () => dragon('red')), bonusTiles: [], context, handMode: 'normal' as const, evidence: {}, visibility: [] };
    const facts = resolveHybridWinner(state);
    expect(facts.kind).toBe('facts-required');
    if (facts.kind !== 'facts-required') return;
    const result = resolveHybridWinner({ ...state, candidateId: facts.candidate.id, visibility: facts.unresolvedFacts.map(({ groupId, choices }) => ({ groupId, value: choices[0]! })) });
    expect(result.kind).toBe('ready');
    if (result.kind === 'ready') expect(result.hand.remainingTiles).toBeUndefined();
  });

  it('rejects a Not a Kong candidate and exposes another candidate or no score', () => {
    const unresolvedTiles = Array.from({ length: 4 }, () => dragon('red'));
    const base = { profile: BMJA_PROFILE_REF, explicitSets, unresolvedTiles, bonusTiles: [], context, handMode: 'normal' as const, evidence: {}, visibility: [] };
    const chosen = resolveHybridWinner(base);
    if (chosen.kind !== 'candidate-choice-required') return;
    const kong = chosen.candidates.find(({ inferredGroups }) => inferredGroups.some(({ kind }) => kind === 'kong'));
    if (!kong) return;
    const rejected = resolveHybridWinner({ ...base, rejectedCandidateIds: [kong.id] });
    expect(rejected.kind).not.toBe('candidate-not-found');
  });
});
