import type { MahjongHand } from './types';

export const validateHand = (hand: MahjongHand): string[] => {
  const errors: string[] = [];
  const pairCount = hand.sets.filter((set) => set.kind === 'pair').length;
  const setCount = hand.sets.filter((set) => set.kind !== 'pair').length;

  const isSevenPairsShape =
    hand.sets.length === 7 &&
    hand.sets.every((set) => set.kind === 'pair');
  const isIrregularShape =
    hand.sets.length === 0 && hand.looseTiles?.length === 14;

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
