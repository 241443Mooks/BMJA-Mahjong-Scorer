import type { UngroupedBlankTile } from '../scoring';

export const hasUngroupedBlankAt = (
  blanks: readonly UngroupedBlankTile[],
  location: UngroupedBlankTile['location'],
  tileIndex: number,
) => blanks.some((blank) => blank.location === location && blank.tileIndex === tileIndex);

export const toggleUngroupedBlankAt = (
  blanks: readonly UngroupedBlankTile[],
  location: UngroupedBlankTile['location'],
  tileIndex: number,
  id: string,
) => hasUngroupedBlankAt(blanks, location, tileIndex)
  ? blanks.filter((blank) => !(blank.location === location && blank.tileIndex === tileIndex))
  : [...blanks, { id, location, tileIndex }];

/** Removes a physical slot and shifts only the later blank references in that location. */
export const reindexUngroupedBlanksAfterRemoval = (
  blanks: readonly UngroupedBlankTile[],
  location: UngroupedBlankTile['location'],
  tileIndex: number,
) => blanks
  .filter((blank) => !(blank.location === location && blank.tileIndex === tileIndex))
  .map((blank) =>
    blank.location === location && blank.tileIndex > tileIndex
      ? { ...blank, tileIndex: blank.tileIndex - 1 }
      : { ...blank },
  );

export const applicableUngroupedBlanks = (
  blanks: readonly UngroupedBlankTile[],
  layoutMode: 'sets' | 'special',
  isWinner: boolean,
) => blanks
  .filter((blank) =>
    layoutMode === 'special'
      ? blank.location === 'loose'
      : !isWinner && blank.location === 'remaining',
  )
  .map((blank) => ({ ...blank }));
