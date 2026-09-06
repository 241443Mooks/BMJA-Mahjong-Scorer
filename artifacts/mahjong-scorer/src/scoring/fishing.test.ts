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
  FishingSpecialId,
  HandSet,
  IncompleteSet,
  MahjongHand,
  PlayingTile,
} from '.';

const fishing = (
  target: FishingSpecialId,
  options: {
    sets?: HandSet[];
    looseTiles?: PlayingTile[];
    incompleteSet?: IncompleteSet;
  },
): MahjongHand => ({
  sets: options.sets ?? [],
  looseTiles: options.looseTiles,
  incompleteSet: options.incompleteSet,
  fishingSpecial: target,
  bonusTiles: [],
  isWinner: false,
  originalCall: false,
});

const incomplete = (
  kind: IncompleteSet['kind'],
  tile: PlayingTile,
  visibility: IncompleteSet['visibility'] = 'concealed',
): IncompleteSet => ({ kind, tile, visibility });

const irregular = (
  target: FishingSpecialId,
  completeTiles: PlayingTile[],
  removeIndex = completeTiles.length - 1,
) =>
  fishing(target, {
    looseTiles: completeTiles.filter((_, index) => index !== removeIndex),
  });

const cases: {
  name: string;
  id: FishingSpecialId;
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
      incompleteSet: incomplete('pair', suited('bamboo', 4)),
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
      incompleteSet: incomplete('single', dragon('green')),
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
      incompleteSet: incomplete('pair', suited('circles', 6)),
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
      incompleteSet: incomplete('pair', suited('bamboo', 8)),
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
      incompleteSet: incomplete('pair', suited('circles', 9)),
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
      incompleteSet: incomplete('pair', dragon('white')),
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
      incompleteSet: incomplete('pair', wind('west')),
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
      incompleteSet: incomplete('pair', wind('north')),
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
        set('4', 'pair', wind('south')),
      ],
      incompleteSet: incomplete('pung', suited('characters', 6)),
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
      const result = detectSpecialFishing(hand);
      expect(result?.id).toBe(id);
      expect(result?.fishingValue).toBe(value);
      expect(result?.completingTiles.length).toBeGreaterThan(0);
      const score = scoreHand(hand);
      expect(score.valid).toBe(true);
      expect(score.scoringMode).toBe('special');
      expect(score.specialFishing?.id).toBe(id);
      if (typeof value === 'number') {
        expect(score.finalScore).toBe(value);
      }
    },
  );

  it.each(cases)(
    'rejects a $name declaration that is not one tile away',
    ({ hand }) => {
      const notFishing: MahjongHand = hand.incompleteSet
        ? { ...hand, incompleteSet: undefined }
        : { ...hand, looseTiles: hand.looseTiles?.slice(0, 12) };
      expect(detectSpecialFishing(notFishing)).toBeUndefined();
      expect(scoreHand(notFishing).valid).toBe(false);
    },
  );

  it('supports multiple legal completing tiles for Thirteen Unique Wonders', () => {
    const hand = cases.find(
      ({ id }) => id === 'thirteen-unique-wonders',
    )!.hand;
    expect(detectSpecialFishing(hand)?.completingTiles).toHaveLength(13);
  });

  it('keeps special fishing distinct from Original Call and completed winners', () => {
    const hand = cases.find(({ id }) => id === 'knitting')!.hand;
    expect(
      detectSpecialFishing({ ...hand, originalCall: true })?.id,
    ).toBe('knitting');
    expect(
      detectSpecialFishing({ ...hand, isWinner: true }),
    ).toBeUndefined();
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
        incompleteSet: incomplete('single', suited('circles', 2)),
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
        incompleteSet: incomplete('single', dragon('red')),
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
        incompleteSet: incomplete('single', suited('circles', 2)),
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
      incompleteSet: incomplete('single', suited('bamboo', 8)),
    });
    hand.bonusTiles = [bonus('flower', 1)];
    const score = scoreHand(hand);
    expect(score.valid).toBe(true);
    expect(score.specialFishing?.intrinsicApplied).toBe(true);
    expect(score.uncappedScore).toBe(1344);
    expect(score.finalScore).toBe(1000);
  });
});