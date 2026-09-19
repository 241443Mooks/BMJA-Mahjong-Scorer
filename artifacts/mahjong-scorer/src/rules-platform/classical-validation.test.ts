import { describe, expect, it } from 'vitest';
import {
  dragon,
  set,
  suited,
  validateHand,
  wind,
  type GameContext,
  type MahjongHand,
} from '../scoring';
import {
  CLASSICAL_CURRENT_VALIDATION,
  CLASSICAL_WESTERN_VALIDATION_FAMILY,
  validateCurrentClassicalHand,
} from './classical-validation';

const context: GameContext = {
  playerWind: 'south', prevailingWind: 'east', limit: 1000, handMode: 'normal',
};

const adapted = (hand: MahjongHand) => validateCurrentClassicalHand(
  CLASSICAL_CURRENT_VALIDATION,
  {
    family: CLASSICAL_WESTERN_VALIDATION_FAMILY,
    evidenceCodecId: 'classical.hand.v1',
    input: { evidence: hand, context },
  },
);

describe('current Classical validation adapter', () => {
  it.each([
    ['ordinary complete hand', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)),
        set('two', 'pung', suited('characters', 4)),
        set('three', 'pung', dragon('red')),
        set('four', 'chow', suited('circles', 3)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
    }],
    ['maximum one Chow', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)),
        set('two', 'pung', suited('characters', 4)),
        set('three', 'chow', suited('circles', 3)),
        set('four', 'chow', suited('bamboo', 4)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
    }],
    ['supported loose special layout', {
      sets: [],
      looseTiles: [
        suited('characters', 1), suited('bamboo', 1),
        suited('characters', 2), suited('bamboo', 2),
        suited('characters', 3), suited('circles', 3),
        suited('bamboo', 4), suited('circles', 4),
        suited('characters', 6), suited('bamboo', 6),
        suited('characters', 8), suited('circles', 8),
        suited('bamboo', 9), suited('circles', 9),
      ], bonusTiles: [], isWinner: true,
    }],
    ['one-away special fishing', {
      sets: [
        set('one', 'pair', wind('east')), set('two', 'pair', wind('south')),
        set('three', 'pair', dragon('red')), set('four', 'pair', suited('bamboo', 1)),
        set('five', 'pair', suited('circles', 9)), set('six', 'pair', suited('characters', 1)),
      ], remainingTiles: [dragon('green')], bonusTiles: [], isWinner: false,
    }],
    ['winning-tile provenance', {
      sets: [
        set('one', 'pung', suited('bamboo', 2)), set('two', 'pung', suited('characters', 4)),
        set('three', 'pung', dragon('red')), set('four', 'chow', suited('circles', 3)),
        set('pair', 'pair', wind('east')),
      ], bonusTiles: [], isWinner: true,
      winningTileProvenance: {
        tile: suited('bamboo', 1),
        target: { type: 'grouped-set', setId: 'stale' },
      },
    }],
  ] satisfies readonly [string, MahjongHand][])(
    'preserves direct BMJA output for %s', (_name, hand) => {
      expect(adapted(hand)).toEqual(validateHand(hand, context));
    },
  );
});
