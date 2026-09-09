import type { MahjongHand, PlayingTile, Visibility, Wind, WinningEventEvidence, WinningMethod, WinningTileProvenance } from '../scoring';

type EditableSet = { id: string; kind: string; visibility: Visibility; tile: PlayingTile | null };
export type HandScorerEditableState = {
  sets: EditableSet[]; layoutMode: 'sets' | 'special'; looseTiles: PlayingTile[]; remainingTiles: PlayingTile[];
  flowers: number[]; seasons: number[]; playerWind: Wind; prevailingWind: Wind; limit: number; isWinner: boolean;
  winningMethod: WinningMethod; originalCall: boolean; winningTileProvenance?: WinningTileProvenance; winningEventEvidence?: WinningEventEvidence;
};

export function handScorerInitialBaseline(hand: MahjongHand | undefined, context: Pick<HandScorerEditableState, 'playerWind' | 'prevailingWind' | 'limit' | 'isWinner' | 'winningMethod' | 'originalCall'>): HandScorerEditableState {
  return {
    sets: hand ? hand.sets.map((set) => ({ ...set })) : [{ id: 'set-1', kind: 'pung', visibility: 'concealed', tile: null }],
    layoutMode: hand?.looseTiles?.length ? 'special' : 'sets', looseTiles: hand?.looseTiles?.map((tile) => ({ ...tile })) ?? [], remainingTiles: hand?.remainingTiles?.map((tile) => ({ ...tile })) ?? [],
    flowers: hand?.bonusTiles.filter((tile) => tile.family === 'flower').map((tile) => tile.number) ?? [], seasons: hand?.bonusTiles.filter((tile) => tile.family === 'season').map((tile) => tile.number) ?? [],
    ...context, winningTileProvenance: hand?.winningTileProvenance, winningEventEvidence: hand?.winningEventEvidence,
  };
}

/** Serializes only editable state, making each scorer mode's explicit initial state its clean baseline. */
export const hasHandScorerUnsavedWork = (current: HandScorerEditableState, baseline: HandScorerEditableState) => JSON.stringify(current) !== JSON.stringify(baseline);
