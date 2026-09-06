import { describe, expect, it } from 'vitest';
import { detectSpecialHands, dragon, set, suited, wind } from '.';
import type { HandSet, MahjongHand } from '.';

const winning = (sets: HandSet[]): MahjongHand => ({
  sets,
  bonusTiles: [],
  isWinner: true,
});
const matched = (hand: MahjongHand, id: string) =>
  detectSpecialHands(hand).find((result) => result.id === id)?.matched;

describe('independent special-hand detectors', () => {
  it('detects all pair honours with terminals and repeated pairs', () => {
    const majors = [
      wind('east'),
      wind('south'),
      dragon('red'),
      dragon('green'),
      suited('bamboo', 1),
      suited('characters', 9),
      suited('bamboo', 1),
    ].map((tile, index) => set(String(index), 'pair', tile));
    expect(matched(winning(majors), 'all-pair-honours')).toBe(true);
  });

  it('detects thirteen unique wonders from ungrouped tiles', () => {
    const hand: MahjongHand = {
      sets: [],
      looseTiles: [
        suited('bamboo', 1),
        suited('bamboo', 9),
        suited('characters', 1),
        suited('characters', 9),
        suited('circles', 1),
        suited('circles', 9),
        wind('east'),
        wind('south'),
        wind('west'),
        wind('north'),
        dragon('red'),
        dragon('green'),
        dragon('white'),
        dragon('red'),
      ],
      bonusTiles: [],
      isWinner: true,
    };
    expect(matched(hand, 'thirteen-unique-wonders')).toBe(true);
  });

  it('detects all honours', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', wind('east')),
          set('2', 'pung', wind('south')),
          set('3', 'pung', dragon('red')),
          set('4', 'pung', dragon('green')),
          set('5', 'pair', dragon('white')),
        ]),
        'all-winds-and-dragons',
      ),
    ).toBe(true);
  });

  it('detects all terminals', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', suited('bamboo', 1)),
          set('2', 'pung', suited('bamboo', 9)),
          set('3', 'pung', suited('characters', 1)),
          set('4', 'pung', suited('circles', 9)),
          set('5', 'pair', suited('characters', 9)),
        ]),
        'heads-and-tails',
      ),
    ).toBe(true);
  });

  it('detects four kongs', () => {
    expect(
      matched(
        winning([
          set('1', 'kong', suited('bamboo', 2)),
          set('2', 'kong', suited('bamboo', 3)),
          set('3', 'kong', suited('characters', 4)),
          set('4', 'kong', dragon('red')),
          set('5', 'pair', suited('circles', 5)),
        ]),
        'fourfold-plenty',
      ),
    ).toBe(true);
  });

  it('detects three great scholars', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', dragon('red')),
          set('2', 'pung', dragon('green')),
          set('3', 'kong', dragon('white')),
          set('4', 'pung', suited('circles', 4)),
          set('5', 'pair', suited('bamboo', 2)),
        ]),
        'three-great-scholars',
      ),
    ).toBe(true);
  });

  it('detects four winds', () => {
    expect(
      matched(
        winning([
          set('1', 'pung', wind('east')),
          set('2', 'pung', wind('south')),
          set('3', 'kong', wind('west')),
          set('4', 'pung', wind('north')),
          set('5', 'pair', suited('circles', 2)),
        ]),
        'four-blessings',
      ),
    ).toBe(true);
  });

  it('detects buried treasure and rejects an exposed set', () => {
    const sets = [
      set('1', 'pung', suited('bamboo', 2)),
      set('2', 'pung', suited('bamboo', 3)),
      set('3', 'pung', suited('bamboo', 4)),
      set('4', 'pung', dragon('red')),
      set('5', 'pair', suited('bamboo', 5)),
    ];
    expect(matched(winning(sets), 'buried-treasure')).toBe(true);
    sets[0] = { ...sets[0], visibility: 'exposed' };
    expect(matched(winning(sets), 'buried-treasure')).toBe(false);
  });

  it('rejects kongs and mixed suits for buried treasure', () => {
    const base = [
      set('1', 'pung', suited('bamboo', 2)),
      set('2', 'pung', suited('bamboo', 3)),
      set('3', 'pung', suited('bamboo', 4)),
      set('4', 'pung', dragon('red')),
      set('5', 'pair', suited('bamboo', 5)),
    ];
    expect(
      matched(
        winning(base.map((group) => ({ ...group }))),
        'buried-treasure',
      ),
    ).toBe(true);
    expect(
      matched(
        winning(base.map((group, index) =>
          index === 3 ? { ...group, kind: 'kong' as const } : group,
        )),
        'buried-treasure',
      ),
    ).toBe(false);
    expect(
      matched(
        winning(base.map((group, index) =>
          index === 2 ? set('3', 'pung', suited('circles', 4)) : group,
        )),
        'buried-treasure',
      ),
    ).toBe(false);
  });

  it('reports every detector result independently', () => {
    const results = detectSpecialHands(winning([]));
    expect(results).toHaveLength(8);
    expect(new Set(results.map((result) => result.id)).size).toBe(results.length);
  });
});
