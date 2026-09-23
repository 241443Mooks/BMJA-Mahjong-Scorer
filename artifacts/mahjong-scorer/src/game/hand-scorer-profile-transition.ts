import type { McrResolvedWinEvent, McrWinSource, McrWind } from '../rules-platform/mcr-scoring-input';
import type { PlayingTile, UngroupedBlankTile, WinningEventEvidence, WinningMethod, WinningTileProvenance } from '../scoring/types';

export type ClassicalScorerEvidence = {
  handMode: 'normal' | 'goulash';
  ungroupedBlankTiles: UngroupedBlankTile[];
  standingHand: boolean;
  onlyPossibleWinningTile: boolean;
  eastThirteenthConsecutiveMahjong: boolean;
  originalCall: boolean;
  winningMethod: WinningMethod;
  winningEventEvidence?: WinningEventEvidence;
  discardAnswer: 'yes' | 'no' | 'unsure' | null;
  replacementAnswer: 'yes' | 'no' | 'unsure' | null;
};

export type McrScorerEvidence = {
  winSource?: McrWinSource;
  resolvedWinEvent?: McrResolvedWinEvent;
  lastVisibleCopy?: boolean;
  seatWind?: McrWind;
  prevailingWind?: McrWind;
};

export type SharedScorerPhysicalState<Set> = {
  sets: Set[];
  layoutMode: 'sets' | 'special';
  looseTiles: PlayingTile[];
  flowers: number[];
  seasons: number[];
  winningTileProvenance?: WinningTileProvenance;
};

/** Only profiles/evidence switch here; physical tile entry and scoring stay in their existing seams. */
export function transitionStandaloneHandProfile<Set extends { id: string; blankTileIds?: string[] }>(input: {
  shared: SharedScorerPhysicalState<Set>;
  classical: ClassicalScorerEvidence;
  mcr: McrScorerEvidence;
  currentWinner: boolean;
  savedClassicalWinner: boolean;
  wasMcr: boolean;
  nextIsMcr: boolean;
  supportsGoulash: boolean;
}) {
  const sets = input.shared.sets.map(({ blankTileIds: _ignored, ...handSet }) => handSet);
  const classicalWinner = input.nextIsMcr && !input.wasMcr ? input.currentWinner : input.savedClassicalWinner;
  const mcr: McrScorerEvidence = {};
  return {
    shared: { ...input.shared, sets },
    classical: {
      ...input.classical,
      handMode: input.classical.handMode === 'goulash' && input.supportsGoulash && !input.nextIsMcr ? 'goulash' as const : 'normal' as const,
      ungroupedBlankTiles: [],
      standingHand: false,
      onlyPossibleWinningTile: false,
      eastThirteenthConsecutiveMahjong: false,
      ...(input.nextIsMcr ? {
        originalCall: false,
        winningMethod: 'wall' as const,
        winningEventEvidence: undefined,
        discardAnswer: null,
        replacementAnswer: null,
      } : {}),
    },
    mcr,
    isWinner: input.nextIsMcr ? true : input.wasMcr ? input.savedClassicalWinner : input.currentWinner,
    savedClassicalWinner: classicalWinner,
    wasMcr: input.nextIsMcr,
  };
}
