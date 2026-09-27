import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited } from '../scoring';
import type { MahjongHand, Visibility } from '../scoring';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { getCurrentCompiledRulesRuntime, initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { requireClassicalWinningTile } from './classical-winning-tile-requirement';
import { resolveHybridWinner } from '../game/classical-hybrid-winner-entry';
import { interpretClassicalHand } from './classical-interpretation';

const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };

describe('exact-profile Classical winning-tile requirement', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());

  it('omits the question when lawful destinations leave the exact result unchanged', () => {
    const hand: MahjongHand = {
      isWinner: true, winningMethod: 'wall', bonusTiles: [],
      sets: [set('east', 'pung', { family: 'wind', wind: 'east' }), set('south', 'pung', { family: 'wind', wind: 'south' }), set('west', 'pung', { family: 'wind', wind: 'west' }), set('red', 'pung', dragon('red')), set('pair', 'pair', suited('bamboo', 9))],
    };
    expect(requireClassicalWinningTile(BMJA_PROFILE_REF, hand, context)).toEqual({ kind: 'irrelevant' });
  });

  it('requires provenance when real BMJA Buried Treasure treatment changes by claimed group', () => {
    const hand: MahjongHand = {
      isWinner: true, winningMethod: 'discard', bonusTiles: [],
      sets: [set('one', 'pung', suited('bamboo', 2), 'exposed'), set('two', 'pung', suited('bamboo', 3)), set('three', 'pung', suited('bamboo', 4)), set('four', 'pung', dragon('red')), set('pair', 'pair', suited('bamboo', 5))],
    };
    const result = requireClassicalWinningTile(BMJA_PROFILE_REF, hand, context);
    expect(result.kind).toBe('required');
    if (result.kind === 'required') {
      expect(result.alternatives).toContainEqual({ tile: suited('bamboo', 2), target: { type: 'grouped-set', setId: 'one' } });
      const runtime = getCurrentCompiledRulesRuntime(BMJA_PROFILE_REF);
      if (runtime.grammar !== 'classical-points-doubles') throw new Error('Expected Classical runtime');
      expect(result.alternatives.every((provenance) => runtime.runtime.validateHand({ evidence: { ...hand, winningTileProvenance: provenance }, context }).length === 0)).toBe(true);
    }
  });

  it('does not ask based on alternatives rejected by the exact runtime validator', () => {
    const hand: MahjongHand = {
      isWinner: true, winningMethod: 'discard', bonusTiles: [], remainingTiles: [suited('circles', 1)],
      sets: [set('one', 'pung', suited('bamboo', 2), 'exposed'), set('two', 'pung', suited('bamboo', 3)), set('three', 'pung', suited('bamboo', 4)), set('four', 'pung', dragon('red')), set('pair', 'pair', suited('bamboo', 5))],
    };
    expect(requireClassicalWinningTile(BMJA_PROFILE_REF, hand, context)).toEqual({ kind: 'unsupported' });
  });

  it('uses the same requirement for explicit and hybrid projections of the same resolved winner', () => {
    const explicit: MahjongHand = { isWinner: true, winningMethod: 'discard', bonusTiles: [], sets: [
      set('one', 'pung', suited('bamboo', 2), 'exposed'), set('two', 'pung', suited('bamboo', 3)), set('three', 'pung', suited('bamboo', 4)), set('four', 'pung', dragon('red')), set('pair', 'pair', suited('bamboo', 5)),
    ] };
    const state = {
      profile: BMJA_PROFILE_REF,
      explicitSets: explicit.sets.slice(0, 4),
      unresolvedTiles: [suited('bamboo', 5), suited('bamboo', 5)],
      bonusTiles: [], context, handMode: 'normal' as const,
      evidence: { winningMethod: 'discard' as const }, visibility: [],
    };
    const interpreted = interpretClassicalHand({ profile: state.profile, explicitSets: state.explicitSets, unresolvedTiles: state.unresolvedTiles, bonusTiles: [], isWinner: true, context, handMode: 'normal' });
    const candidate = interpreted.candidates[0];
    if (!candidate) throw new Error('Expected one hybrid candidate');
    const assignment = candidate.lawfulVisibilityAssignments.find((value) => candidate.inferredGroups.filter(({ kind }) => kind === 'pair').every(({ id }) => value[id] === 'concealed')) ?? candidate.lawfulVisibilityAssignments[0] ?? {};
    const hybrid = resolveHybridWinner({ ...state, candidateId: candidate.id, visibility: Object.entries(assignment).map(([groupId, value]) => ({ groupId, value: value as Visibility })) });
    expect(hybrid.kind).toBe('ready');
    if (hybrid.kind !== 'ready') return;
    const explicitRequirement = requireClassicalWinningTile(BMJA_PROFILE_REF, explicit, context);
    const hybridRequirement = requireClassicalWinningTile(BMJA_PROFILE_REF, hybrid.hand, context);
    expect(explicitRequirement.kind).toBe('required');
    expect(hybridRequirement.kind).toBe(explicitRequirement.kind);
    if (explicitRequirement.kind !== 'required' || hybridRequirement.kind !== 'required') return;
    const inferredPairId = hybrid.provenance.inferredGroups.find(({ kind }) => kind === 'pair')?.id;
    const normalizeInferredPair = (requirement: typeof hybridRequirement) => requirement.alternatives.map(({ tile, target }) => ({
      tile,
      target: target.type === 'grouped-set' && target.setId === inferredPairId ? { ...target, setId: 'pair' } : target,
    }));
    expect(normalizeInferredPair(hybridRequirement)).toEqual(explicitRequirement.alternatives);
  });
});
