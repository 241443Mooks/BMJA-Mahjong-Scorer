import type { MahjongHand, PlayingTile, UngroupedBlankTile, Visibility, Wind, WinningEventEvidence, WinningMethod, WinningTileProvenance } from '../scoring';
import { seedHandEntryWorkspace } from './hand-entry-workspace';

type EditableSet = { id: string; kind: string; visibility: Visibility; tile: PlayingTile | null };
export type HandScorerEditableState = {
  sets: EditableSet[]; layoutMode: 'sets' | 'special'; looseTiles: PlayingTile[]; remainingTiles: PlayingTile[];
  ungroupedBlankTiles: UngroupedBlankTile[];
  flowers: number[]; seasons: number[]; playerWind: Wind; prevailingWind: Wind; limit?: number; isWinner: boolean;
  winningMethod: WinningMethod; originalCall: boolean; winningTileProvenance?: WinningTileProvenance; winningEventEvidence?: WinningEventEvidence;
  hybridInterpretation?: unknown;
};

export function handScorerInitialBaseline(hand: MahjongHand | undefined, context: Pick<HandScorerEditableState, 'playerWind' | 'prevailingWind' | 'limit' | 'isWinner' | 'winningMethod' | 'originalCall' | 'hybridInterpretation'>, isClassical = false): HandScorerEditableState {
  const workspace = seedHandEntryWorkspace(hand, isClassical);
  const workingDraft: EditableSet = { id: 'set-working', kind: 'pung', visibility: 'concealed', tile: null };
  const sets: EditableSet[] = hand
    ? [
        ...hand.sets.map((set) => ({ ...set })),
        ...(isClassical ? [workingDraft] : []),
      ]
    : [{ id: 'set-1', kind: 'pung', visibility: 'concealed', tile: null }];
  const editableHand = {
    sets,
    ...workspace,
    flowers: hand?.bonusTiles.filter((tile) => tile.family === 'flower').map((tile) => tile.number) ?? [], seasons: hand?.bonusTiles.filter((tile) => tile.family === 'season').map((tile) => tile.number) ?? [],
  };
  const winnerFacts = { winningTileProvenance: hand?.winningTileProvenance, winningEventEvidence: hand?.winningEventEvidence };
  if (!isClassical) return { ...editableHand, ...context, ...winnerFacts };
  const { hybridInterpretation, ...editableContext } = context;
  return {
    ...editableHand,
    ...editableContext,
    ...winnerFacts,
    ...(hybridInterpretation !== undefined ? { hybridInterpretation } : {}),
  };
}

/** Serializes only editable state, making each scorer mode's explicit initial state its clean baseline. */
export const hasHandScorerUnsavedWork = (current: HandScorerEditableState, baseline: HandScorerEditableState) => JSON.stringify(current) !== JSON.stringify(baseline);
