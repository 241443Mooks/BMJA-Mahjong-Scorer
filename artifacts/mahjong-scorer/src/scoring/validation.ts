import { detectSpecialHands } from './special-hands';
import { detectSpecialFishing } from './fishing';
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
  const fishing = detectSpecialFishing(hand);

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

  if (isIrregularShape && !isSupportedIrregularShape && !hand.fishingSpecial) {
    errors.push(
      'Ungrouped tiles must form a supported 14-tile special-hand layout.',
    );
  }

  if (hand.fishingSpecial) {
    if (hand.isWinner) {
      errors.push('Special-hand fishing applies only to a non-winning hand.');
    }
    if (hand.originalCall) {
      errors.push('Special-hand fishing is separate from Original Call.');
    }
    if (hand.incompleteSet && hand.looseTiles?.length) {
      errors.push(
        'A fishing hand cannot mix an incomplete group with ungrouped tiles.',
      );
    }
    if (!hand.incompleteSet && hand.looseTiles?.length !== 13) {
      errors.push(
        'An irregular fishing hand must contain exactly 13 ungrouped tiles.',
      );
    }
    if (!fishing) {
      errors.push(
        'The hand is not exactly one legal tile away from the selected special.',
      );
    }
  } else if (hand.incompleteSet) {
    errors.push('An incomplete group is only valid while fishing for a special.');
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
