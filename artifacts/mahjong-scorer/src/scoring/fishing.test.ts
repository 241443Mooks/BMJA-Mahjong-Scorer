import { describe, expect, it } from 'vitest';
import {
  detectSpecialFishing,
  bonus,
  dragon,
  scoreHand,
  set,
  suited,
  wind,
} from '.';
import type {
  LegacyFishingSpecialId,
  HandSet,
  MahjongHand,
  PlayingTile,
} from '.';

const fishing = (
  _target: LegacyFishingSpecialId,
  options: {
    sets?: HandSet[];
    looseTiles?: PlayingTile[];
    remainingTiles?: PlayingTile[];
  },
): MahjongHand => ({
  sets: options.sets ?? [],
  looseTiles: options.looseTiles,
  remainingTiles: options.remainingTiles,
  bonusTiles: [],
  isWinner: false,
  originalCall: false,
});

const irregular = (
  target: LegacyFishingSpecialId,
  completeTiles: PlayingTile[],
  removeIndex = completeTiles.length - 1,
) =>
  fishing(target, {
    looseTiles: completeTiles.filter((_, index) => index !== removeIndex),
  });

const cases: {
  name: string;
  id: LegacyFishingSpecialId;
  value: number | 'three-doubles';
  hand: MahjongHand;
}[] = [
  {
    name: 'Purity',
    id: 'purity',
    value: 'three-doubles',
    hand: fishing('purity', {
      sets: [
        set('1', 'pung', suited('bamboo', 2)),
        set('2', 'pung', suited('bamboo', 3)),
        set('3', 'kong', suited('bamboo', 6)),
        set('4', 'pair', suited('bamboo', 8)),
      ],
      remainingTiles: [suited('bamboo', 4), suited('bamboo', 4)],
    }),
  },
  {
    name: 'All Pair Honours',
    id: 'all-pair-honours',
    value: 200,
    hand: fishing('all-pair-honours', {
      sets: [
        set('1', 'pair', wind('east')),
        set('2', 'pair', wind('south')),
        set('3', 'pair', dragon('red')),
        set('4', 'pair', suited('bamboo', 1)),
        set('5', 'pair', suited('circles', 9)),
        set('6', 'pair', suited('characters', 1)),
      ],
      remainingTiles: [dragon('green')],
    }),
  },
  {
    name: 'Knitting',
    id: 'knitting',
    value: 200,
    hand: irregular('knitting', [
      suited('characters', 1),
      suited('bamboo', 1),
      suited('characters', 2),
      suited('circles', 2),
      suited('bamboo', 3),
      suited('circles', 3),
      suited('characters', 4),
      suited('bamboo', 4),
      suited('characters', 5),
      suited('circles', 5),
      suited('bamboo', 6),
      suited('circles', 6),
      suited('characters', 7),
      suited('bamboo', 7),
    ]),
  },
  {
    name: 'Triple Knitting',
    id: 'triple-knitting',
    value: 200,
    hand: irregular('triple-knitting', [
      suited('characters', 1),
      suited('bamboo', 1),
      suited('circles', 1),
      suited('characters', 3),
      suited('bamboo', 3),
      suited('circles', 3),
      suited('characters', 5),
      suited('bamboo', 5),
      suited('circles', 5),
      suited('characters', 7),
      suited('bamboo', 7),
      suited('circles', 7),
      suited('characters', 9),
      suited('bamboo', 9),
    ]),
  },
  {
    name: 'Buried Treasure',
    id: 'buried-treasure',
    value: 400,
    hand: fishing('buried-treasure', {
      sets: [
        set('1', 'pung', suited('circles', 2)),
        set('2', 'pung', suited('circles', 4)),
        set('3', 'pung', dragon('red')),
        set('4', 'pair', wind('east')),
      ],
      remainingTiles: [suited('circles', 6), suited('circles', 6)],
    }),
  },
  {
    name: 'Imperial Jade',
    id: 'imperial-jade',
    value: 400,
    hand: fishing('imperial-jade', {
      sets: [
        set('1', 'pung', dragon('green')),
        set('2', 'pung', suited('bamboo', 2)),
        set('3', 'kong', suited('bamboo', 4)),
        set('4', 'pair', suited('bamboo', 6)),
      ],
      remainingTiles: [suited('bamboo', 8), suited('bamboo', 8)],
    }),
  },
  {
    name: 'Heads and Tails',
    id: 'heads-and-tails',
    value: 400,
    hand: fishing('heads-and-tails', {
      sets: [
        set('1', 'pung', suited('bamboo', 1)),
        set('2', 'pung', suited('bamboo', 9)),
        set('3', 'kong', suited('circles', 1)),
        set('4', 'pair', suited('characters', 9)),
      ],
      remainingTiles: [suited('circles', 9), suited('circles', 9)],
    }),
  },
  {
    name: 'Three Great Scholars',
    id: 'three-great-scholars',
    value: 400,
    hand: fishing('three-great-scholars', {
      sets: [
        set('1', 'pung', dragon('red')),
        set('2', 'pung', dragon('green')),
        set('3', 'pung', suited('circles', 4)),
        set('4', 'pair', suited('bamboo', 2)),
      ],
      remainingTiles: [dragon('white'), dragon('white')],
    }),
  },
  {
    name: 'All Winds and Dragons',
    id: 'all-winds-and-dragons',
    value: 400,
    hand: fishing('all-winds-and-dragons', {
      sets: [
        set('1', 'pung', wind('east')),
        set('2', 'pung', wind('south')),
        set('3', 'pung', dragon('red')),
        set('4', 'pair', dragon('green')),
      ],
      remainingTiles: [wind('west'), wind('west')],
    }),
  },
  {
    name: 'Four Blessings',
    id: 'four-blessings',
    value: 400,
    hand: fishing('four-blessings', {
      sets: [
        set('1', 'pung', wind('east')),
        set('2', 'pung', wind('south')),
        set('3', 'pung', wind('west')),
        set('4', 'pair', dragon('red')),
      ],
      remainingTiles: [wind('north'), wind('north')],
    }),
  },
  {
    name: 'Fourfold Plenty',
    id: 'fourfold-plenty',
    value: 400,
    hand: fishing('fourfold-plenty', {
      sets: [
        set('1', 'kong', suited('bamboo', 2)),
        set('2', 'kong', suited('circles', 4)),
        set('3', 'kong', dragon('red')),
        set('4', 'kong', suited('characters', 6)),
      ],
      remainingTiles: [wind('south')],
    }),
  },
  {
    name: 'Gates of Heaven',
    id: 'gates-of-heaven',
    value: 400,
    hand: irregular('gates-of-heaven', [
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 1),
      suited('circles', 2),
      suited('circles', 3),
      suited('circles', 4),
      suited('circles', 5),
      suited('circles', 5),
      suited('circles', 6),
      suited('circles', 7),
      suited('circles', 8),
      suited('circles', 9),
      suited('circles', 9),
      suited('circles', 9),
    ]),
  },
  {
    name: 'Wriggling Snake',
    id: 'wriggling-snake',
    value: 400,
    hand: irregular('wriggling-snake', [
      suited('bamboo', 1),
      suited('bamboo', 1),
      suited('bamboo', 2),
      suited('bamboo', 3),
      suited('bamboo', 4),
      suited('bamboo', 5),
      suited('bamboo', 6),
      suited('bamboo', 7),
      suited('bamboo', 8),
      suited('bamboo', 9),
      wind('east'),
      wind('south'),
      wind('west'),
      wind('north'),
    ]),
  },
  {
    name: 'Thirteen Unique Wonders',
    id: 'thirteen-unique-wonders',
    value: 400,
    hand: fishing('thirteen-unique-wonders', {
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
      ],
    }),
  },
];

describe('BMJA special-hand fishing detection', () => {
  it.each(cases)(
    'detects a genuine one-tile-away $name hand',
    ({ id, value, hand }) => {
      const result = detectSpecialFishing(hand).find(
        (fishing) => fishing.id === id,
      );
      expect(result?.fishingValue).toBe(value);
      expect(result?.completingTiles.length).toBeGreaterThan(0);
      const score = scoreHand(hand);
      expect(score.valid).toBe(true);
      expect(score.scoringMode).toBe('special');
      expect(score.specialFishingMatches?.map((match) => match.id)).toContain(
        id,
      );
      if (typeof value === 'number') {
        expect(score.finalScore).toBeGreaterThanOrEqual(value);
      }
    },
  );

  it.each(cases)(
    'rejects a $name hand that is not one tile away',
    ({ hand }) => {
      const notFishing: MahjongHand = hand.remainingTiles
        ? { ...hand, remainingTiles: hand.remainingTiles.slice(0, -1) }
        : { ...hand, looseTiles: hand.looseTiles?.slice(0, 12) };
      expect(detectSpecialFishing(notFishing)).toEqual([]);
      if (hand.remainingTiles) {
        expect(scoreHand(notFishing)).toMatchObject({
          valid: true,
          evidenceCompleteness: 'partial',
          specialFishing: undefined,
        });
      } else {
        expect(scoreHand(notFishing).valid).toBe(false);
      }
    },
  );

  it('supports multiple legal completing tiles for Thirteen Unique Wonders', () => {
    const hand = cases.find(
      ({ id }) => id === 'thirteen-unique-wonders',
    )!.hand;
    expect(
      detectSpecialFishing(hand).find(
        ({ id }) => id === 'thirteen-unique-wonders',
      )?.completingTiles,
    ).toHaveLength(13);
  });

  it('collects overlapping specials and selects the highest lawful score', () => {
    const hand = fishing('purity', {
      sets: [
        set('two', 'kong', suited('bamboo', 2)),
        set('three', 'kong', suited('bamboo', 3)),
        set('four', 'kong', suited('bamboo', 4)),
        set('six', 'kong', suited('bamboo', 6)),
      ],
      remainingTiles: [suited('bamboo', 8)],
    });
    const score = scoreHand(hand);
    expect(score.specialFishingMatches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'purity', score: 512, selected: true }),
        expect.objectContaining({ id: 'imperial-jade', score: 400 }),
        expect.objectContaining({ id: 'fourfold-plenty', score: 400 }),
      ]),
    );
    expect(score.specialFishing?.id).toBe('purity');
    expect(score.finalScore).toBe(512);
  });

  it('retains equal-scoring overlapping interpretations transparently', () => {
    const hand = fishing('three-great-scholars', {
      sets: [
        set('red', 'pung', dragon('red')),
        set('green', 'pung', dragon('green')),
        set('white', 'pung', dragon('white')),
        set('east', 'pung', wind('east')),
      ],
      remainingTiles: [wind('south')],
    });
    const score = scoreHand(hand);
    expect(score.specialFishingMatches?.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        'three-great-scholars',
        'all-winds-and-dragons',
      ]),
    );
    expect(
      score.specialFishingMatches?.filter(({ selected }) => selected),
    ).toHaveLength(1);
  });

  it('keeps special fishing distinct from Original Call and completed winners', () => {
    const hand = cases.find(({ id }) => id === 'knitting')!.hand;
    expect(
      detectSpecialFishing({ ...hand, originalCall: true }).map(({ id }) => id),
    ).toContain('knitting');
    expect(
      detectSpecialFishing({ ...hand, isWinner: true }),
    ).toEqual([]);
    expect(scoreHand({ ...hand, originalCall: true }).valid).toBe(false);
  });

  it.each([
    [
      'Three Great Scholars',
      fishing('three-great-scholars', {
        sets: [
          set('red', 'kong', dragon('red')),
          set('green', 'kong', dragon('green')),
          set('white', 'kong', dragon('white')),
          set('other', 'pung', suited('circles', 8)),
        ],
        remainingTiles: [suited('circles', 2)],
      }),
      800,
    ],
    [
      'All Winds and Dragons',
      fishing('all-winds-and-dragons', {
        sets: [
          set('east', 'kong', wind('east')),
          set('south', 'kong', wind('south')),
          set('west', 'kong', wind('west')),
          set('north', 'kong', wind('north')),
        ],
        remainingTiles: [dragon('red')],
      }),
      512,
    ],
    [
      'Four Blessings',
      fishing('four-blessings', {
        sets: [
          set('east', 'kong', wind('east')),
          set('south', 'kong', wind('south')),
          set('west', 'kong', wind('west')),
          set('north', 'kong', wind('north')),
        ],
        remainingTiles: [suited('circles', 2)],
      }),
      512,
    ],
  ] as const)(
    'uses the higher intrinsic fishing value for %s',
    (_name, hand, expected) => {
      const score = scoreHand(hand);
      expect(score.valid).toBe(true);
      expect(score.specialFishing?.intrinsicApplied).toBe(true);
      expect(score.finalScore).toBe(expected);
    },
  );

  it('uses whole-hand intrinsic Purity scoring when it is greater', () => {
    const hand = fishing('purity', {
      sets: [
        set('one', 'kong', suited('bamboo', 1)),
        set('two', 'kong', suited('bamboo', 2)),
        set('four', 'kong', suited('bamboo', 4)),
        set('six', 'kong', suited('bamboo', 6)),
      ],
      remainingTiles: [suited('bamboo', 8)],
    });
    hand.bonusTiles = [bonus('flower', 1)];
    const score = scoreHand(hand);
    expect(score.valid).toBe(true);
    expect(score.specialFishing?.intrinsicApplied).toBe(true);
    expect(score.uncappedScore).toBe(1344);
    expect(score.finalScore).toBe(1000);
  });
});
