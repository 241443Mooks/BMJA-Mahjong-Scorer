import { describe, expect, it } from 'vitest';
import {
  bonus,
  dragon,
  resolveWinningTileProvenance,
  scoreHand,
  set,
  suited,
  wind,
} from '.';
import type { MahjongHand } from '.';

describe('scoreHand breakdown', () => {
  it('returns a detailed standard score calculation', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', dragon('red'), 'exposed'),
        set('2', 'chow', suited('bamboo', 2), 'exposed'),
        set('3', 'pung', suited('bamboo', 5)),
        set('4', 'pung', suited('bamboo', 9)),
        set('5', 'pair', wind('south')),
      ],
      bonusTiles: [bonus('flower', 2)],
      isWinner: true,
      winningMethod: 'wall',
    };
    const score = scoreHand(hand, {
      playerWind: 'south',
      prevailingWind: 'east',
      limit: 1000,
    });
    expect(score.valid).toBe(true);
    expect(score.basePoints).toBe(44);
    expect(score.doubles).toBe(3);
    expect(score.uncappedScore).toBe(352);
    expect(score.finalScore).toBe(352);
    expect(score.pointRules.length).toBeGreaterThan(4);
    expect(score.doubleRules.map((rule) => rule.id)).toEqual([
      'dragon-set-1',
      'own-flower',
      'mixed-one-suit',
    ]);
  });

  it('caps a standard score at the table limit', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'kong', dragon('red')),
        set('2', 'kong', wind('east')),
        set('3', 'pung', suited('bamboo', 1)),
        set('4', 'pung', suited('bamboo', 9), 'exposed'),
        set('5', 'pair', suited('bamboo', 5)),
      ],
      bonusTiles: [
        bonus('flower', 1),
        bonus('flower', 2),
        bonus('flower', 3),
        bonus('flower', 4),
      ],
      isWinner: true,
    };
    const score = scoreHand(hand);
    expect(score.uncappedScore).toBeGreaterThan(1000);
    expect(score.finalScore).toBe(1000);
    expect(score.limitApplied).toBe(true);
  });

  it('uses a special hand fixed value instead of ordinary set scoring', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', wind('east')),
        set('2', 'pung', wind('south')),
        set('3', 'pung', dragon('red')),
        set('4', 'pung', dragon('green')),
        set('5', 'pair', dragon('white')),
      ],
      bonusTiles: [],
      isWinner: true,
    };
    const score = scoreHand(hand);
    expect(score.scoringMode).toBe('special');
    expect(score.finalScore).toBe(1000);
  });

  it('adds separately doubled bonus points to a half-limit special hand', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pair', wind('east')),
        set('2', 'pair', wind('south')),
        set('3', 'pair', wind('west')),
        set('4', 'pair', wind('north')),
        set('5', 'pair', dragon('red')),
        set('6', 'pair', dragon('green')),
        set('7', 'pair', dragon('white')),
      ],
      bonusTiles: [bonus('flower', 4), bonus('season', 2)],
      isWinner: true,
    };
    const score = scoreHand(hand, {
      playerWind: 'north',
      prevailingWind: 'east',
      limit: 1000,
    });
    expect(score.scoringMode).toBe('special');
    expect(score.basePoints).toBe(8);
    expect(score.doubles).toBe(1);
    expect(score.uncappedScore).toBe(516);
    expect(score.finalScore).toBe(516);
  });

  it('returns validation errors without hiding the provisional breakdown', () => {
    const score = scoreHand({
      sets: [set('bad', 'chow', suited('circles', 9))],
      bonusTiles: [],
      isWinner: true,
    });
    expect(score.valid).toBe(false);
    expect(score.validationErrors).toHaveLength(3);
    expect(score.basePoints).toBe(20);
  });

  it('rejects a normal grouped hand containing more than one chow', () => {
    const score = scoreHand({
      sets: [
        set('1', 'chow', suited('bamboo', 1)),
        set('2', 'chow', suited('circles', 4)),
        set('3', 'pung', dragon('red')),
        set('4', 'pung', wind('east')),
        set('5', 'pair', suited('characters', 9)),
      ],
      bonusTiles: [],
      isWinner: true,
    });
    expect(score.valid).toBe(false);
    expect(score.validationErrors).toContain(
      'A normal BMJA hand may contain at most one chow.',
    );
  });

  it('validates grouped winning provenance including the exact chow position', () => {
    const hand: MahjongHand = {
      sets: [
        set('chow', 'chow', suited('bamboo', 3)),
        set('pung-1', 'pung', suited('circles', 1)),
        set('pung-2', 'pung', suited('circles', 2)),
        set('pung-3', 'pung', dragon('red')),
        set('pair', 'pair', wind('east')),
      ],
      bonusTiles: [],
      isWinner: true,
      winningTileProvenance: {
        tile: suited('bamboo', 4),
        target: { type: 'grouped-set', setId: 'chow', tileIndex: 1 },
      },
    };
    expect(resolveWinningTileProvenance(hand)).toMatchObject({
      tile: suited('bamboo', 4),
      set: { id: 'chow' },
    });
    expect(
      resolveWinningTileProvenance({
        ...hand,
        winningTileProvenance: {
          tile: suited('bamboo', 4),
          target: { type: 'grouped-set', setId: 'chow', tileIndex: 0 },
        },
      }),
    ).toBeUndefined();
    expect(
      resolveWinningTileProvenance({ ...hand, isWinner: false }),
    ).toBeUndefined();
  });

  it('rejects provenance for incomplete winners and ambiguous set ids', () => {
    const incomplete: MahjongHand = {
      sets: [set('only', 'pair', suited('bamboo', 2))],
      bonusTiles: [],
      isWinner: true,
      winningTileProvenance: {
        tile: suited('bamboo', 2),
        target: { type: 'grouped-set', setId: 'only' },
      },
    };
    expect(resolveWinningTileProvenance(incomplete)).toBeUndefined();
    expect(scoreHand(incomplete).validationErrors).toContain(
      'A winning hand must be a complete grouped hand or a 14-tile special layout.',
    );

    const duplicateIds: MahjongHand = {
      sets: [
        set('duplicate', 'pung', suited('bamboo', 2), 'exposed'),
        set('duplicate', 'pung', suited('bamboo', 3)),
        set('four', 'pung', suited('bamboo', 4)),
        set('six', 'pung', suited('bamboo', 6)),
        set('pair', 'pair', suited('bamboo', 8)),
      ],
      bonusTiles: [],
      isWinner: true,
      winningMethod: 'discard',
      winningTileProvenance: {
        tile: suited('bamboo', 2),
        target: { type: 'grouped-set', setId: 'duplicate' },
      },
    };
    expect(resolveWinningTileProvenance(duplicateIds)).toBeUndefined();
    const result = scoreHand(duplicateIds);
    expect(result.validationErrors).toContain(
      'Each grouped set or pair must have a unique id.',
    );
    expect(
      result.specialHands.some(
        ({ id, matched }) => id === 'buried-treasure' && matched,
      ),
    ).toBe(false);
  });

  it("scores Heaven's Blessing only for East without replacement tiles", () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', dragon('red')),
        set('2', 'pung', suited('bamboo', 2)),
        set('3', 'pung', suited('bamboo', 3)),
        set('4', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('bamboo', 5)),
      ],
      bonusTiles: [],
      isWinner: true,
      winningMethod: 'initial-deal',
    };
    const east = scoreHand(hand, {
      playerWind: 'east',
      prevailingWind: 'south',
      limit: 1000,
    });
    expect(east.valid).toBe(true);
    expect(east.scoringMode).toBe('special');
    expect(east.specialHands.find(({ id }) => id === 'heavens-blessing'))
      .toMatchObject({ matched: true, value: 1000 });

    const south = scoreHand(hand, {
      playerWind: 'south',
      prevailingWind: 'south',
      limit: 1000,
    });
    expect(south.valid).toBe(false);
    expect(south.validationErrors).toContain(
      'Mah Jong in the original deal applies only to a winning East hand.',
    );

    const withReplacement = scoreHand(
      { ...hand, bonusTiles: [bonus('flower', 1)] },
      {
        playerWind: 'east',
        prevailingWind: 'south',
        limit: 1000,
      },
    );
    expect(withReplacement.valid).toBe(false);
    expect(withReplacement.validationErrors).toContain(
      'An original-deal win must use the original fourteen tiles without replacement draws.',
    );

    const withKong = scoreHand(
      {
        ...hand,
        sets: hand.sets.map((group, index) =>
          index === 0 ? { ...group, kind: 'kong' } : group,
        ),
      },
      {
        playerWind: 'east',
        prevailingWind: 'south',
        limit: 1000,
      },
    );
    expect(withKong.valid).toBe(false);
    expect(withKong.validationErrors).toContain(
      'An original-deal win must contain exactly fourteen playing tiles.',
    );
    expect(
      withKong.specialHands.find(({ id }) => id === 'heavens-blessing')?.matched,
    ).toBe(false);
  });

  it('keeps unknown event answers conservative and rejects incompatible evidence', () => {
    const hand: MahjongHand = {
      sets: [
        set('1', 'pung', dragon('red')),
        set('2', 'pung', suited('bamboo', 2)),
        set('3', 'pung', suited('bamboo', 3)),
        set('4', 'pung', suited('bamboo', 4)),
        set('pair', 'pair', suited('bamboo', 5)),
      ],
      bonusTiles: [],
      isWinner: true,
      winningMethod: 'discard',
    };
    const context = {
      playerWind: 'south' as const,
      prevailingWind: 'east' as const,
      limit: 1000,
    };
    const unknown = scoreHand(hand, context);
    expect(unknown.valid).toBe(true);
    expect(
      unknown.specialHands.find(({ id }) => id === 'earths-blessing')?.matched,
    ).toBe(false);

    const confirmed = scoreHand(
      {
        ...hand,
        winningEventEvidence: {
          type: 'discard',
          discardedBy: 'east',
          handDiscardOrdinal: 1,
        },
      },
      context,
    );
    expect(confirmed.valid).toBe(true);
    expect(
      confirmed.specialHands.find(({ id }) => id === 'earths-blessing')?.matched,
    ).toBe(true);

    const incompatible = scoreHand(
      {
        ...hand,
        winningMethod: 'wall',
        winningEventEvidence: {
          type: 'discard',
          discardedBy: 'east',
          handDiscardOrdinal: 1,
        },
      },
      context,
    );
    expect(incompatible.valid).toBe(false);
  });

  it('does not let an event-only match validate an unsupported loose layout', () => {
    const score = scoreHand(
      {
        sets: [],
        looseTiles: [
          suited('bamboo', 1),
          suited('bamboo', 1),
          suited('bamboo', 1),
          suited('bamboo', 1),
          suited('bamboo', 2),
          suited('bamboo', 2),
          suited('bamboo', 2),
          suited('bamboo', 2),
          suited('bamboo', 3),
          suited('bamboo', 3),
          suited('bamboo', 3),
          suited('bamboo', 3),
          suited('bamboo', 4),
          suited('bamboo', 4),
        ],
        bonusTiles: [],
        isWinner: true,
        winningMethod: 'initial-deal',
      },
      {
        playerWind: 'east',
        prevailingWind: 'east',
        limit: 1000,
      },
    );
    expect(score.valid).toBe(false);
    expect(score.validationErrors).toContain(
      'Ungrouped tiles must form a supported 14-tile special-hand layout.',
    );
  });
});
