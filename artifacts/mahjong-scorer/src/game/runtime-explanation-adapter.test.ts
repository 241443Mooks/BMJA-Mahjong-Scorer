import { beforeAll, describe, expect, it } from 'vitest';
import { dragon, set, suited, wind, type GameContext, type MahjongHand } from '../scoring';
import { initialiseCurrentRulesRuntimes, getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { currentPlayableProfiles } from '../rules-platform/current-profiles';
import { matchedClassicalBindingIds, explanationsForBindings } from './runtime-explanation-adapter';

beforeAll(() => initialiseCurrentRulesRuntimes());

const context: GameContext = { playerWind: 'south', prevailingWind: 'east', limit: 1000, handMode: 'normal' };
const bmjaWonders: MahjongHand = {
  sets: [], looseTiles: [suited('bamboo', 1), suited('bamboo', 9), suited('characters', 1), suited('characters', 9), suited('circles', 1), suited('circles', 9), wind('east'), wind('south'), wind('west'), wind('north'), dragon('red'), dragon('green'), dragon('white'), wind('east')], bonusTiles: [], isWinner: true,
};
const otbBuriedTreasure: MahjongHand = {
  sets: [set('one', 'pung', suited('bamboo', 2)), set('two', 'pung', suited('bamboo', 3)), set('three', 'pung', suited('bamboo', 4)), set('four', 'pung', dragon('red')), set('pair', 'pair', suited('bamboo', 5))], bonusTiles: [], isWinner: true, winningMethod: 'wall',
};

describe('runtime explanation result adapter', () => {
  it('resolves an actual BMJA runtime result from its count-trace binding identity', () => {
    const compiled = getCurrentCompiledRulesRuntime({ id: 'bmja', version: '1.0' });
    if (compiled.grammar !== 'classical-points-doubles') throw new Error('EXPECTED_CLASSICAL');
    const result = compiled.runtime.scoreHand({ evidence: bmjaWonders, context });
    const bindingIds = matchedClassicalBindingIds(result);
    expect(bindingIds).toContain('thirteen-unique-wonders');
    expect(explanationsForBindings(result.profile, bindingIds)).toMatchObject([
      { bindingId: 'thirteen-unique-wonders', explanation: { available: true, profile: { id: 'bmja', version: '1.0' }, sources: [{ citation: 'British Mahjong Association, Special Hands' }] } },
    ]);
  });

  it('resolves an actual Outside the Box special result through its own source chain', () => {
    const compiled = getCurrentCompiledRulesRuntime({ id: 'outside-the-box', version: '0.1' });
    if (compiled.grammar !== 'classical-points-doubles') throw new Error('EXPECTED_CLASSICAL');
    const result = compiled.runtime.scoreHand({ evidence: otbBuriedTreasure, context: { ...context, playerWind: 'east' } });
    const bindingIds = matchedClassicalBindingIds(result);
    expect(bindingIds).toContain('buried-treasure');
    expect(explanationsForBindings(result.profile, bindingIds)).toMatchObject([
      { bindingId: 'buried-treasure', explanation: { available: true, profile: { id: 'outside-the-box', version: '0.1' }, sources: [{ citation: 'Outside the Box club guide', authority: 'club-primary' }] } },
    ]);
  });

  it('keeps MCR in its non-public proof environment', () => {
    expect(currentPlayableProfiles.map(({ identity }) => identity.id)).not.toContain('mcr');
  });
});
