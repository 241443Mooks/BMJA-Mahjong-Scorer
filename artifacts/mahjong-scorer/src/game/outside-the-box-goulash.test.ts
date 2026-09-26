import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { dragon, set, suited, validateHand, wind, type MahjongHand } from '../scoring';
import { confirmHand, createBmjaGame, replayGame, undoLastHand } from './game';
import { loadGameRecovery, saveGameRecovery } from './persistence';
import { BMJA_RULESET, OUTSIDE_THE_BOX_PROFILE_REF, OUTSIDE_THE_BOX_RULESET } from './ruleset';

beforeAll(() => initialiseCurrentRulesRuntimes());

const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
const seats = { east: 'east', south: 'south', west: 'west', north: 'north' } as const;
const zeroes = { east: 0, south: 0, west: 0, north: 0 };
const storage = () => { const entries = new Map<string, string>(); return { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value), removeItem: (key: string) => entries.delete(key) }; };
const goulashContext = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000, handMode: 'goulash' as const };

describe('Outside the Box Goulash', () => {
  it('transitions, replays, and undoes the exact active mode', () => {
    const start = createBmjaGame(players, seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF);
    const firstDraw = confirmHand(start, { outcome: { type: 'draw' }, scores: zeroes });
    const secondDraw = confirmHand(firstDraw, { outcome: { type: 'draw' }, scores: zeroes });
    const winner = confirmHand(secondDraw, { outcome: { type: 'win', winnerId: 'east' }, scores: zeroes });

    expect(firstDraw).toMatchObject({ currentHandMode: 'goulash', prevailingWind: 'east', seats: start.seats });
    expect(firstDraw.handHistory[0]).toMatchObject({ handMode: 'normal', nextHandMode: 'goulash' });
    expect(secondDraw.handHistory[1]).toMatchObject({ handMode: 'goulash', nextHandMode: 'goulash' });
    expect(winner.handHistory[2]).toMatchObject({ handMode: 'goulash', nextHandMode: 'normal' });
    expect(replayGame(winner.setup, winner.handHistory.map(({ outcome, scores, scoreRecords }) => ({ outcome, scores, scoreRecords })))).toEqual(winner);
    expect(undoLastHand(winner).currentHandMode).toBe('goulash');
    expect(undoLastHand(secondDraw).currentHandMode).toBe('goulash');
    expect(undoLastHand(firstDraw).currentHandMode).toBe('normal');
    const memory = storage();
    saveGameRecovery(memory, secondDraw, 'win', 'east', { scores: {}, scoreRecords: {} });
    expect(loadGameRecovery(memory)?.game.currentHandMode).toBe('goulash');
  });

  it('keeps blank identity while scoring represented tiles and rejects unlawful physical composition', () => {
    const legal: MahjongHand = {
      sets: [
        set('pung', 'pung', suited('bamboo', 3)),
        { ...set('kong', 'kong', wind('east')), blankTileIds: ['blank-east-1', 'blank-east-2'] },
        set('two', 'pung', suited('characters', 5)),
        set('three', 'pung', suited('circles', 7)),
        set('pair', 'pair', suited('bamboo', 8)),
      ],
      bonusTiles: [], isWinner: true,
    };
    legal.sets[0].blankTileIds = ['blank-bamboo-1'];
    expect(validateHand(legal, goulashContext)).toEqual([]);
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: legal, ...goulashContext }).valid).toBe(true);
    expect(legal.sets[1].tile).toEqual(wind('east'));
    expect(legal.sets.flatMap((group) => group.blankTileIds ?? [])).toEqual(['blank-bamboo-1', 'blank-east-1', 'blank-east-2']);

    expect(validateHand({ ...legal, sets: [{ ...set('chow', 'chow', suited('bamboo', 1)) }] }, goulashContext)).toContain('A Goulash hand cannot contain Chows.');
    expect(validateHand({ ...legal, sets: [{ ...legal.sets[0], blankTileIds: ['a', 'b'] }, ...legal.sets.slice(1)] }, goulashContext)).toContain('A Goulash Pung needs two genuine tiles and at most one blank (pung).');
    expect(validateHand({ ...legal, sets: [{ ...legal.sets[1], blankTileIds: ['a', 'b', 'c'] }, ...legal.sets.filter((_, index) => index !== 1)] }, goulashContext)).toContain('A Goulash Kong needs two genuine tiles and at most two blanks (kong).');
    const pairWithOneBlank = { ...legal, sets: legal.sets.map((group) => group.id === 'pair' ? { ...group, blankTileIds: ['blank-pair-1'] } : group) };
    expect(validateHand(pairWithOneBlank, goulashContext)).toEqual([]);
    const pairWithTwoBlanks = { ...legal, sets: legal.sets.map((group) => group.id === 'pair' ? { ...group, blankTileIds: ['blank-pair-1', 'blank-pair-2'] } : { ...group, blankTileIds: undefined }) };
    expect(validateHand(pairWithTwoBlanks, goulashContext)).toEqual([]);
    expect(validateHand({ ...pairWithTwoBlanks, sets: pairWithTwoBlanks.sets.map((group) => group.id === 'pair' ? { ...group, blankTileIds: ['a', 'b', 'c'] } : group) }, goulashContext)).toContain('A Goulash Pair can contain at most two blanks (pair).');
    expect(validateHand({ ...pairWithOneBlank, sets: pairWithOneBlank.sets.map((group) => group.id === 'pair' ? { ...group, blankTileIds: ['pair-1', 'pair-2'] } : group) }, goulashContext)).toContain('A Goulash hand cannot use more than four blank tiles.');
    expect(validateHand(legal, { ...goulashContext, handMode: 'normal' })).toContain('Blank tiles are valid only in Goulash mode.');
    expect(validateHand(pairWithOneBlank, { ...goulashContext, handMode: 'normal' })).toContain('Blank tiles are valid only in Goulash mode.');
    expect(BMJA_RULESET.nextHandMode('normal', { type: 'draw' })).toBe('normal');
  });

  it('keeps physical blank identity separate from effective tiles and profile activation', () => {
    const effectiveFifth: MahjongHand = {
      sets: [
        set('one', 'pung', suited('bamboo', 1)),
        { ...set('pair', 'pair', suited('bamboo', 1)), blankTileIds: ['blank-bamboo-1'] },
      ], bonusTiles: [], isWinner: false,
    };
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: effectiveFifth, ...goulashContext }).valid).toBe(true);
    expect(BMJA_RULESET.scoreHand({ hand: effectiveFifth, ...goulashContext }).validationErrors).toContain('Blank tiles are valid only in Goulash mode.');
    expect(BMJA_RULESET.scoreHand({ hand: effectiveFifth, ...goulashContext }).validationErrors).toContain('A playing tile cannot appear more than four times.');
    expect(validateHand({ ...effectiveFifth, sets: effectiveFifth.sets.map((group) => ({ ...group, blankTileIds: undefined })) }, goulashContext)).toContain('A playing tile cannot appear more than four times.');

    const rubyJade: MahjongHand = {
      sets: [],
      looseTiles: [dragon('green'), dragon('green'), dragon('red'), dragon('red'), ...[1, 3, 5, 7, 9].flatMap((rank) => [suited('bamboo', rank as 1 | 3 | 5 | 7 | 9), suited('bamboo', rank as 1 | 3 | 5 | 7 | 9)])],
      ungroupedBlankTiles: [{ id: 'blank-ruby-jade', location: 'loose', tileIndex: 2 }],
      bonusTiles: [], isWinner: true,
    };
    expect(OUTSIDE_THE_BOX_RULESET.scoreHand({ hand: rubyJade, ...goulashContext }).specialHands)
      .toContainEqual(expect.objectContaining({ id: 'all-pair-ruby-jade', matched: true }));

    const duplicateId = {
      ...rubyJade,
      ungroupedBlankTiles: [
        { id: 'same-id', location: 'loose' as const, tileIndex: 2 },
        { id: 'same-id', location: 'loose' as const, tileIndex: 3 },
      ],
    };
    expect(validateHand(duplicateId, goulashContext)).toContain('Each physical blank tile must be used only once.');

    const duplicatePosition = {
      ...rubyJade,
      ungroupedBlankTiles: [
        { id: 'blank-a', location: 'loose' as const, tileIndex: 2 },
        { id: 'blank-b', location: 'loose' as const, tileIndex: 2 },
      ],
    };
    const duplicatePositionErrors = validateHand(duplicatePosition, goulashContext);
    expect(duplicatePositionErrors).toContain('Each ungrouped tile position can represent at most one physical blank.');
    expect(duplicatePositionErrors).not.toContain('A playing tile cannot appear more than four times.');

    const differentIndexes = validateHand({
      ...rubyJade,
      ungroupedBlankTiles: [
        { id: 'blank-a', location: 'loose', tileIndex: 2 },
        { id: 'blank-b', location: 'loose', tileIndex: 3 },
      ],
    }, goulashContext);
    expect(differentIndexes).not.toContain('Each ungrouped tile position can represent at most one physical blank.');

    const sameIndexDifferentLocation = validateHand({
      ...rubyJade,
      remainingTiles: [suited('bamboo', 1)],
      ungroupedBlankTiles: [
        { id: 'loose-zero', location: 'loose', tileIndex: 0 },
        { id: 'remaining-zero', location: 'remaining', tileIndex: 0 },
      ],
    }, goulashContext);
    expect(sameIndexDifferentLocation).not.toContain('Each ungrouped tile position can represent at most one physical blank.');

    const fifthWithDuplicatedBlankPosition: MahjongHand = {
      sets: [set('one', 'pung', suited('characters', 1))],
      remainingTiles: [suited('characters', 1), suited('characters', 1)],
      ungroupedBlankTiles: [
        { id: 'blank-a', location: 'remaining', tileIndex: 0 },
        { id: 'blank-b', location: 'remaining', tileIndex: 0 },
      ],
      bonusTiles: [], isWinner: false,
    };
    const fifthErrors = validateHand(fifthWithDuplicatedBlankPosition, goulashContext);
    expect(fifthErrors).toContain('Each ungrouped tile position can represent at most one physical blank.');
    expect(fifthErrors).not.toContain('A playing tile cannot appear more than four times.');
  });
});
