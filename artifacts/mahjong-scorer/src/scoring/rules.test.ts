import { describe, expect, it } from 'vitest';
import {
  bonus,
  dragon,
  scoreBonusDoubles,
  scoreBonusTiles,
  scoreHonorDoubles,
  scoreHonorPairs,
  scoreKongs,
  scorePungs,
  scoreWinnerDoubles,
  scoreWinningPoints,
  set,
  suited,
  wind,
} from '.';
import type { GameContext, MahjongHand } from '.';

const context: GameContext = {
  playerWind: 'east',
  prevailingWind: 'east',
  limit: 1000,
};
const hand = (sets: MahjongHand['sets'] = []): MahjongHand => ({
  sets,
  bonusTiles: [],
  isWinner: false,
});
const amounts = (rules: { amount: number }[]) => rules.map((rule) => rule.amount);

describe('documented basic point rules', () => {
  it('scores no points for chows', () => {
    expect(scorePungs(hand([set('c', 'chow', suited('bamboo', 2))]))).toEqual([]);
  });

  it.each([
    ['exposed', 2],
    ['concealed', 4],
  ] as const)('scores a %s minor pung as %i', (visibility, expected) => {
    expect(
      amounts(scorePungs(hand([set('p', 'pung', suited('bamboo', 5), visibility)]))),
    ).toEqual([expected]);
  });

  it.each([
    ['exposed', 4],
    ['concealed', 8],
  ] as const)('scores a %s major pung as %i', (visibility, expected) => {
    expect(
      amounts(scorePungs(hand([set('p', 'pung', wind('south'), visibility)]))),
    ).toEqual([expected]);
  });

  it.each([
    ['exposed', 8],
    ['concealed', 16],
  ] as const)('scores a %s minor kong as %i', (visibility, expected) => {
    expect(
      amounts(scoreKongs(hand([set('k', 'kong', suited('circles', 4), visibility)]))),
    ).toEqual([expected]);
  });

  it.each([
    ['exposed', 16],
    ['concealed', 32],
  ] as const)('scores a %s major kong as %i', (visibility, expected) => {
    expect(
      amounts(scoreKongs(hand([set('k', 'kong', dragon('red'), visibility)]))),
    ).toEqual([expected]);
  });

  it('scores a dragon pair as 2', () => {
    expect(amounts(scoreHonorPairs(hand([set('p', 'pair', dragon('white'))]), context))).toEqual([2]);
  });

  it('scores own and prevailing wind separately on the same pair', () => {
    expect(amounts(scoreHonorPairs(hand([set('p', 'pair', wind('east'))]), context))).toEqual([2, 2]);
  });

  it('scores every flower and season as 4', () => {
    const value = hand();
    value.bonusTiles = [bonus('flower', 1), bonus('season', 4)];
    expect(amounts(scoreBonusTiles(value))).toEqual([4, 4]);
  });

  it('scores 20 for Mah-Jong and 2 for a live-wall win', () => {
    const value = hand();
    value.isWinner = true;
    value.winningMethod = 'wall';
    expect(amounts(scoreWinningPoints(value))).toEqual([20, 2]);
  });
});

describe('documented double rules', () => {
  it('gives one double for each dragon pung or kong', () => {
    expect(
      amounts(
        scoreHonorDoubles(
          hand([
            set('r', 'pung', dragon('red')),
            set('g', 'kong', dragon('green')),
          ]),
          context,
        ),
      ),
    ).toEqual([1, 1]);
  });

  it('gives two doubles when a wind set is both own and prevailing', () => {
    expect(
      amounts(scoreHonorDoubles(hand([set('e', 'pung', wind('east'))]), context)),
    ).toEqual([1, 1]);
  });

  it('gives one double for an own flower or season', () => {
    const value = hand();
    value.bonusTiles = [bonus('flower', 1), bonus('season', 1)];
    expect(amounts(scoreBonusDoubles(value, context))).toEqual([1, 1]);
  });

  it('scores a bouquet as two doubles inclusive of the own tile', () => {
    const value = hand();
    value.bonusTiles = [1, 2, 3, 4].map((number) =>
      bonus('flower', number as 1 | 2 | 3 | 4),
    );
    expect(amounts(scoreBonusDoubles(value, context))).toEqual([2]);
  });

  it('gives winner doubles for no chows, mixed suit, all concealed, and original call', () => {
    const value: MahjongHand = {
      sets: [
        set('1', 'pung', suited('bamboo', 2)),
        set('2', 'pung', suited('bamboo', 3)),
        set('3', 'pung', suited('bamboo', 4)),
        set('4', 'pung', wind('south')),
        set('5', 'pair', dragon('red')),
      ],
      bonusTiles: [],
      isWinner: true,
      originalCall: true,
    };
    expect(scoreWinnerDoubles(value).map((rule) => rule.id)).toEqual([
      'no-chows',
      'mixed-one-suit',
      'concealed-hand',
      'original-call',
    ]);
  });

  it('gives purity three doubles', () => {
    const value: MahjongHand = {
      sets: [
        set('1', 'chow', suited('characters', 1)),
        set('2', 'chow', suited('characters', 3)),
        set('3', 'pung', suited('characters', 6)),
        set('4', 'pung', suited('characters', 9)),
        set('5', 'pair', suited('characters', 5)),
      ],
      bonusTiles: [],
      isWinner: true,
    };
    expect(scoreWinnerDoubles(value).find((rule) => rule.id === 'purity')?.amount).toBe(3);
  });

  it.each([
    'loose-tile',
    'last-wall-tile',
    'final-discard',
    'robbing-kong',
  ] as const)('gives one double for winning by %s', (winningMethod) => {
    const value = hand();
    value.isWinner = true;
    value.winningMethod = winningMethod;
    expect(scoreWinnerDoubles(value)).toContainEqual(
      expect.objectContaining({ id: `win-${winningMethod}`, amount: 1 }),
    );
  });
});
