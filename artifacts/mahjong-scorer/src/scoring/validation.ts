import { detectSpecialHands } from './special-hands';
import { expandedTiles, tileKey } from './tiles';
import type { MahjongHand, PlayingTile } from './types';

export const validateHand = (hand: MahjongHand): string[] => {
  const errors: string[] = [];
  const pairCount = hand.sets.filter((set) => set.kind === 'pair').length;
  const setCount = hand.sets.filter((set) => set.kind !== 'pair').length;

  const isSevenPairsShape =
    hand.sets.length === 7 &&
    hand.sets.every((set) => set.kind === 'pair');
  const isIrregularShape =
    hand.sets.length === 0 && hand.looseTiles?.length === 14;
  const isSupportedIrregularShape =
    isIrregularShape &&
    detectSpecialHands({ ...hand, isWinner: true }).some(
      (special) => special.matched,
    );

  if (
    hand.isWinner &&
    hand.sets.length > 0 &&
    !isSevenPairsShape &&
    !isIrregularShape &&
    (pairCount !== 1 || setCount !== 4)
  ) {
    errors.push('A standard winning hand must contain four sets and one pair.');
  }

  if (hand.looseTiles && hand.looseTiles.length > 0 && hand.sets.length > 0) {
    errors.push('Ungrouped special-hand tiles cannot be mixed with ordinary sets.');
  }

  if (isIrregularShape && !isSupportedIrregularShape) {
    errors.push(
      'Ungrouped tiles must form a supported 14-tile special-hand layout.',
    );
  }

  const playingTiles: PlayingTile[] = [
    ...hand.sets.flatMap(expandedTiles),
    ...(hand.looseTiles ?? []),
  ];
  const playingTileCounts = playingTiles.reduce<Map<string, number>>(
    (tally, tile) => {
      const key = tileKey(tile);
      tally.set(key, (tally.get(key) ?? 0) + 1);
      return tally;
    },
    new Map(),
  );
  if ([...playingTileCounts.values()].some((count) => count > 4)) {
    errors.push('A playing tile cannot appear more than four times.');
  }

  for (const set of hand.sets) {
    if (
      set.kind === 'chow' &&
      (set.tile.family !== 'suit' || set.tile.rank > 7)
    ) {
      errors.push(`Chow ${set.id} must begin with a suited tile numbered 1 to 7.`);
    }
  }

  const bonuses = new Set(
    hand.bonusTiles.map((tile) => `${tile.family}-${tile.number}`),
  );
  if (bonuses.size !== hand.bonusTiles.length) {
    errors.push('A flower or season tile cannot appear more than once.');
  }

  return errors;
};
