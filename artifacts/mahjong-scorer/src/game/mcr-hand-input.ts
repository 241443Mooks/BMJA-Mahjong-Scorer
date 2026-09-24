import { expandedTiles } from '../scoring/tiles';
import type { MahjongHand, PlayingTile } from '../scoring/types';
import type { McrScoringInput, McrResolvedGroup } from '../rules-platform/mcr-scoring-input';

export type McrPhysicalHand = Pick<MahjongHand, 'sets' | 'looseTiles' | 'bonusTiles' | 'winningTileProvenance'>;
export type McrHandInputResult = { kind: 'ready'; input: McrScoringInput } | { kind: 'winning-tile-required' };

export const toMcrTile = (tile: PlayingTile) => ({ face: tile.family === 'suit'
  ? { family: 'suit' as const, suit: tile.suit === 'circles' ? 'dots' as const : tile.suit, rank: tile.rank }
  : tile.family === 'wind' ? { family: 'wind' as const, wind: tile.wind }
  : { family: 'dragon' as const, dragon: tile.dragon } });

export function toMcrScoringInput(hand: McrPhysicalHand, context: McrScoringInput['context']): McrHandInputResult {
  const provenance = hand.winningTileProvenance;
  if (!provenance) return { kind: 'winning-tile-required' };
  const fixedGroups: McrResolvedGroup[] = [];
  const freeTiles = [...(hand.looseTiles ?? [])];
  for (const set of hand.sets) {
    const tiles = expandedTiles(set);
    const winningTarget = provenance.target.type === 'grouped-set' && provenance.target.setId === set.id;
    const isFixed = !winningTarget && (set.visibility === 'exposed' && ['chow', 'pung', 'kong'].includes(set.kind)
      || set.kind === 'kong' && set.visibility === 'concealed');
    if (isFixed) fixedGroups.push({ kind: set.kind as 'chow' | 'pung' | 'kong', exposure: set.visibility === 'exposed' ? 'melded' : 'concealed', tiles: tiles.map(toMcrTile) });
    else freeTiles.push(...tiles);
  }
  const winningTile = toMcrTile(provenance.tile);
  const input: McrScoringInput = {
    evidence: { fixedGroups, freeTiles: freeTiles.map(toMcrTile), winningTile, flowerCount: hand.bonusTiles.length },
    context,
  };
  return { kind: 'ready', input };
}

export const hasMcrWinningTileOccurrence = (input: McrScoringInput) =>
  input.evidence.freeTiles.some((tile) => tileKeyForCanonical(tile) === tileKeyForCanonical(input.evidence.winningTile));

const tileKeyForCanonical = (tile: { face: { family: string; suit?: string; rank?: number; wind?: string; dragon?: string } }) => {
  const f = tile.face;
  return f.family === 'suit' ? `${f.suit}-${f.rank}` : f.family === 'wind' ? `wind-${f.wind}` : `dragon-${f.dragon}`;
};
