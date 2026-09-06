import { detectSpecialHands } from './special-hands';
import { detectSpecialFishing } from './fishing';
import { expandedTiles, tileKey } from './tiles';
import type { MahjongHand, PlayingTile } from './types';

export const validateHand = (hand: MahjongHand): string[] => {
  const errors: string[] = [];
  const pairCount = hand.sets.filter((set) => set.kind === 'pair').length;
  const setCount = hand.sets.filter((set) => set.kind !== 'pair').length;
  const chowCount = hand.sets.filter((set) => set.kind === 'chow').length;

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
  const fishingMatches = detectSpecialFishing(hand);

  if (
    hand.isWinner &&
    hand.sets.length > 0 &&
    !isSevenPairsShape &&
    !isIrregularShape &&
    (pairCount !== 1 || setCount !== 4)
  ) {
    errors.push('A standard winning hand must contain four sets and one pair.');
  }

  if (chowCount > 1) {
    errors.push('A normal BMJA hand may contain at most one chow.');
  }

  if (hand.looseTiles && hand.looseTiles.length > 0 && hand.sets.length > 0) {
    errors.push('Ungrouped special-hand tiles cannot be mixed with ordinary sets.');
  }

  if (isIrregularShape && !isSupportedIrregularShape) {
    errors.push(
      'Ungrouped tiles must form a supported 14-tile special-hand layout.',
    );
  }

  if (hand.originalCall && !hand.isWinner) {
    errors.push('Original Call applies only to a winning hand.');
  }

  if (hand.incompleteSet) {
    if (hand.isWinner) {
      errors.push('An incomplete group is only valid in a non-winning hand.');
    }
    if (hand.incompleteSet && hand.looseTiles?.length) {
      errors.push(
        'A fishing hand cannot mix an incomplete group with ungrouped tiles.',
      );
    }
    if (fishingMatches.length === 0) {
      errors.push(
        'The incomplete hand is not exactly one legal tile away from a supported special.',
      );
    }
  }

  if (!hand.isWinner && hand.looseTiles?.length) {
    if (hand.looseTiles.length !== 13) {
      errors.push(
        'An irregular non-winning hand must contain exactly 13 ungrouped tiles.',
      );
    } else if (fishingMatches.length === 0) {
      errors.push(
        'The ungrouped hand is not exactly one legal tile away from a supported special.',
      );
    }
  }

  const playingTiles: PlayingTile[] = [
    ...hand.sets.flatMap(expandedTiles),
    ...(hand.looseTiles ?? []),
    ...(hand.incompleteSet
      ? Array.from(
          {
            length:
              hand.incompleteSet.kind === 'single'
                ? 1
                : hand.incompleteSet.kind === 'pair'
                  ? 2
                  : 3,
          },
          () => hand.incompleteSet!.tile,
        )
      : []),
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
