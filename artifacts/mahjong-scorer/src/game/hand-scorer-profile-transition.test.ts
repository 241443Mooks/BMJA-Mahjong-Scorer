import { describe, expect, it } from 'vitest';
import { set, suited } from '../scoring/tiles';
import { transitionStandaloneHandProfile } from './hand-scorer-profile-transition';

describe('standalone hand scorer profile transition', () => {
  it('retains shared physical entry across Classical → MCR → Classical and clears grammar-specific evidence', () => {
    const exposed = set('physical-pung', 'pung', suited('characters', 5), 'exposed');
    const initial = {
      shared: {
        sets: [{ ...exposed, blankTileIds: ['classical-blank'] }, { id: 'working', kind: 'pair' as const, visibility: 'concealed' as const, tile: null }],
        layoutMode: 'sets' as const,
        looseTiles: [suited('circles', 8)],
        flowers: [1],
        seasons: [3],
        winningTileProvenance: { tile: suited('characters', 5), target: { type: 'grouped-set' as const, setId: 'physical-pung' } },
      },
      classical: {
        handMode: 'goulash' as const, ungroupedBlankTiles: [{ id: 'blank', location: 'loose' as const, tileIndex: 0 }],
        standingHand: true, onlyPossibleWinningTile: true, eastThirteenthConsecutiveMahjong: true,
        originalCall: true, winningMethod: 'discard' as const,
        winningEventEvidence: { type: 'discard' as const, discardedBy: 'south' as const, handDiscardOrdinal: 1 },
        discardAnswer: 'yes' as const, replacementAnswer: 'yes' as const,
      },
      mcr: {},
      currentWinner: false,
      savedClassicalWinner: false,
      wasMcr: false,
      nextIsMcr: true,
      supportsGoulash: false,
    };

    const enteredMcr = transitionStandaloneHandProfile(initial);
    expect(enteredMcr.shared).toEqual({
      ...initial.shared,
      sets: [exposed, { id: 'working', kind: 'pair', visibility: 'concealed', tile: null }],
    });
    expect(enteredMcr.isWinner).toBe(true);
    expect(enteredMcr.classical).toMatchObject({
      handMode: 'normal', ungroupedBlankTiles: [], standingHand: false,
      onlyPossibleWinningTile: false, eastThirteenthConsecutiveMahjong: false,
      originalCall: false, winningMethod: 'wall', winningEventEvidence: undefined,
      discardAnswer: null, replacementAnswer: null,
    });

    const withMcrEvidence = {
      ...enteredMcr,
      mcr: { winSource: 'discard' as const, resolvedWinEvent: 'none' as const, lastVisibleCopy: false, seatWind: 'west' as const, prevailingWind: 'south' as const },
      currentWinner: true,
      nextIsMcr: false,
      supportsGoulash: true,
    };
    const returnedClassical = transitionStandaloneHandProfile(withMcrEvidence);
    expect(returnedClassical.shared).toEqual(enteredMcr.shared);
    expect(returnedClassical.isWinner).toBe(false);
    expect(returnedClassical.mcr).toEqual({});
    expect(returnedClassical.classical).toMatchObject({
      handMode: 'normal', standingHand: false, onlyPossibleWinningTile: false,
      eastThirteenthConsecutiveMahjong: false, originalCall: false,
      winningMethod: 'wall', winningEventEvidence: undefined,
      discardAnswer: null, replacementAnswer: null,
    });
    expect(returnedClassical.shared.flowers).toEqual([1]);
    expect(returnedClassical.shared.seasons).toEqual([3]);
    expect(returnedClassical.shared.winningTileProvenance).toEqual(initial.shared.winningTileProvenance);
    expect(returnedClassical.shared.looseTiles).toEqual(initial.shared.looseTiles);
    expect(returnedClassical.shared.layoutMode).toBe('sets');
  });
});
