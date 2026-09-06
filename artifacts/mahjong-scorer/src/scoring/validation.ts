import { matchesSupportedIrregularLayout } from './special-hands';
import { detectSpecialFishing } from './fishing';
import {
  expandedTiles,
  hasCompleteWinningShape,
  resolveWinningTileProvenance,
  tileKey,
} from './tiles';
import type { GameContext, MahjongHand, PlayingTile } from './types';

export const validateHand = (
  hand: MahjongHand,
  context?: GameContext,
): string[] => {
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
    matchesSupportedIrregularLayout({ ...hand, isWinner: true });
  const fishingMatches = detectSpecialFishing(hand);

  if (hand.isWinner && !hasCompleteWinningShape(hand)) {
    errors.push(
      'A winning hand must be a complete grouped hand or a 14-tile special layout.',
    );
  }

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

  if (new Set(hand.sets.map((group) => group.id)).size !== hand.sets.length) {
    errors.push('Each grouped set or pair must have a unique id.');
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

  if (hand.winningMethod === 'initial-deal') {
    if (!hand.isWinner || context?.playerWind !== 'east') {
      errors.push(
        'Mah Jong in the original deal applies only to a winning East hand.',
      );
    }
    if (hand.winningTileProvenance) {
      errors.push(
        'An original-deal win does not have a separately drawn or claimed winning tile.',
      );
    }
    if (hand.bonusTiles.length > 0) {
      errors.push(
        'An original-deal win must use the original fourteen tiles without replacement draws.',
      );
    }
    const playingTileCount =
      hand.sets.flatMap(expandedTiles).length + (hand.looseTiles?.length ?? 0);
    if (playingTileCount !== 14) {
      errors.push(
        'An original-deal win must contain exactly fourteen playing tiles.',
      );
    }
  }

  if (hand.winningEventEvidence) {
    if (!hand.isWinner) {
      errors.push('Winning-event details apply only to a winning hand.');
    } else if (
      hand.winningEventEvidence.type === 'discard' &&
      (hand.winningMethod !== 'discard' ||
        hand.winningEventEvidence.discardedBy !== 'east' ||
        hand.winningEventEvidence.handDiscardOrdinal !== 1 ||
        context?.playerWind === 'east')
    ) {
      errors.push(
        "East's first-discard detail requires a non-East winner from an ordinary discard.",
      );
    } else if (
      hand.winningEventEvidence.type === 'replacement-chain' &&
      (hand.winningMethod !== 'loose-tile' ||
        hand.winningEventEvidence.kongDeclarations !== 2 ||
        hand.sets.filter((set) => set.kind === 'kong').length < 2)
    ) {
      errors.push(
        'The replacement sequence requires two kongs and a replacement-tile win.',
      );
    }
  }

  if (
    hand.winningTileProvenance &&
    !resolveWinningTileProvenance(hand)
  ) {
    errors.push(
      'Winning-tile provenance must identify a tile destination in the completed winning hand.',
    );
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
