import type { MahjongHand, PlayingTile, UngroupedBlankTile } from '../scoring/types';

export type WorkingDraft<T extends { id: string; tile: unknown | null }> = T;

export type HandEntryWorkspaceSeed = {
  layoutMode: 'sets' | 'special';
  looseTiles: PlayingTile[];
  remainingTiles: PlayingTile[];
  ungroupedBlankTiles: UngroupedBlankTile[];
};

/** Normalises legacy Classical loose layouts for editing without changing the saved hand. */
export function seedHandEntryWorkspace(hand: MahjongHand | undefined, isClassical: boolean): HandEntryWorkspaceSeed {
  const looseTiles = hand?.looseTiles?.map((tile) => ({ ...tile })) ?? [];
  const remainingTiles = hand?.remainingTiles?.map((tile) => ({ ...tile })) ?? [];
  const ungroupedBlankTiles = hand?.ungroupedBlankTiles?.map((blank) => ({ ...blank })) ?? [];
  if (!isClassical) {
    return { layoutMode: looseTiles.length ? 'special' : 'sets', looseTiles, remainingTiles, ungroupedBlankTiles };
  }
  return {
    layoutMode: 'sets',
    looseTiles: [],
    remainingTiles: [...looseTiles, ...remainingTiles],
    ungroupedBlankTiles: ungroupedBlankTiles.map((blank) => ({
      ...blank,
      location: blank.location === 'loose' ? 'remaining' : blank.location,
      tileIndex: blank.location === 'loose' ? blank.tileIndex : blank.tileIndex + looseTiles.length,
    })),
  };
}

/** Winner-only blank facts attached to the unresolved UI buffer. These never become scorer-domain remainingTiles. */
export const unresolvedWinnerBlankEvidence = (blanks: readonly UngroupedBlankTile[]) =>
  blanks.filter((blank) => blank.location === 'remaining').map((blank) => ({ ...blank }));

export function recoverWorkingDraft<T extends { id: string; tile: unknown | null }>(
  sets: T[],
  createDraft: () => T,
): { sets: T[]; draftId: string } {
  const draft = sets.find((set) => set.tile === null);
  if (draft) return { sets, draftId: draft.id };
  const next = createDraft();
  return { sets: [...sets, next], draftId: next.id };
}

export function normaliseStructuredChoiceForGroup(
  kind: 'pung' | 'kong' | 'chow' | 'pair',
  family: 'characters' | 'bamboo' | 'circles' | 'wind' | 'dragon',
  value: string,
) {
  if (kind !== 'chow') return { family, value };
  const suitedFamily = family === 'wind' || family === 'dragon' ? 'characters' : family;
  const rank = Number(value);
  return { family: suitedFamily, value: Number.isFinite(rank) && rank >= 1 && rank <= 7 ? value : '1' };
}
