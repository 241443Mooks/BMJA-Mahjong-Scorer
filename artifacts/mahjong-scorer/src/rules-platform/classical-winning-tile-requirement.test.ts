import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited } from '../scoring';
import type { MahjongHand } from '../scoring';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { requireClassicalWinningTile } from './classical-winning-tile-requirement';

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
    if (result.kind === 'required') expect(result.alternatives).toContainEqual({ tile: suited('bamboo', 2), target: { type: 'grouped-set', setId: 'one' } });
  });
});
