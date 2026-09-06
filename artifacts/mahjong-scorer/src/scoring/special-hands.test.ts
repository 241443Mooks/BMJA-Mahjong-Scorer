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
  it('detects seven pairs and rejects a duplicate pair', () => {
    const pairs = [
      suited('bamboo', 1),
      suited('bamboo', 2),
      suited('characters', 3),
      suited('characters', 4),
      suited('circles', 5),
      wind('east'),
      dragon('red'),
    ].map((tile, index) => set(String(index), 'pair', tile));
    expect(matched(winning(pairs), 'seven-pairs')).toBe(true);
    pairs[6] = set('6', 'pair', suited('bamboo', 1));
    expect(matched(winning(pairs), 'seven-pairs')).toBe(false);
  });

  it('detects all pair honours', () => {
    const honors = [
      wind('east'),
      wind('south'),
      wind('west'),
      wind('north'),
      dragon('red'),
      dragon('green'),
      dragon('white'),
    ].map((tile, index) => set(String(index), 'pair', tile));
    expect(matched(winning(honors), 'all-pair-honours')).toBe(true);
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
        'all-honours',
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
        'all-terminals',
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
        'four-kongs',
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
          set('4', 'pair', wind('north')),
        ]),
        'four-winds',
      ),
    ).toBe(true);
  });

  it('detects buried treasure and rejects an exposed set', () => {
    const sets = [
      set('1', 'pung', suited('bamboo', 2)),
      set('2', 'pung', suited('bamboo', 3)),
      set('3', 'pung', suited('characters', 4)),
      set('4', 'kong', dragon('red')),
      set('5', 'pair', suited('circles', 5)),
    ];
    expect(matched(winning(sets), 'buried-treasure')).toBe(true);
    sets[0] = { ...sets[0], visibility: 'exposed' };
    expect(matched(winning(sets), 'buried-treasure')).toBe(false);
  });

  it('reports every detector result independently', () => {
    const results = detectSpecialHands(winning([]));
    expect(results.length).toBeGreaterThanOrEqual(8);
    expect(new Set(results.map((result) => result.id)).size).toBe(results.length);
  });
});
