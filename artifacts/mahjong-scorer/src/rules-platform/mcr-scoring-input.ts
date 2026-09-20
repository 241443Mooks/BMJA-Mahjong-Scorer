import type { HandEvaluationInput, PhysicalTileEvidence } from './types';

export type McrWind = 'east' | 'south' | 'west' | 'north';
export type McrWinSource = 'discard' | 'self-draw';
export type McrResolvedWinEvent = 'none' | 'last-wall-draw' | 'last-discard' | 'kong-replacement' | 'flower-replacement' | 'rob-kong';
export type McrGroupExposure = 'concealed' | 'melded';
export type McrResolvedGroup = { kind: 'chow' | 'pung' | 'kong'; exposure: McrGroupExposure; tiles: readonly PhysicalTileEvidence[] };
/** A declared group is physically fixed; free tiles deliberately carry no chosen decomposition. */
export type McrHandEvidence = { fixedGroups: readonly McrResolvedGroup[]; freeTiles: readonly PhysicalTileEvidence[]; winningTile: PhysicalTileEvidence; flowerCount: number };
/** Trusted table facts are intentionally separate from player-entered hand evidence. */
export type McrScoreContext = { seatWind?: McrWind; prevailingWind?: McrWind; winSource: McrWinSource; resolvedWinEvent: McrResolvedWinEvent; lastVisibleCopy?: boolean };
export type McrScoringInput = HandEvaluationInput<McrHandEvidence, McrScoreContext>;
export type McrInputValidation = { valid: true } | { valid: false; reasonId: string };

const winds = new Set<McrWind>(['east', 'south', 'west', 'north']);
const winSources = new Set<McrWinSource>(['discard', 'self-draw']);
const winEvents = new Set<McrResolvedWinEvent>(['none', 'last-wall-draw', 'last-discard', 'kong-replacement', 'flower-replacement', 'rob-kong']);
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const faceKey = (tile: PhysicalTileEvidence) => JSON.stringify(tile.face);
const validTile = (tile: unknown): tile is PhysicalTileEvidence => {
  if (!isRecord(tile) || !isRecord(tile.face)) return false;
  const face = tile.face;
  return (face.family === 'suit' && ['characters', 'bamboo', 'dots'].includes(face.suit as string) && Number.isInteger(face.rank) && typeof face.rank === 'number' && face.rank >= 1 && face.rank <= 9)
    || (face.family === 'wind' && winds.has(face.wind as McrWind))
    || (face.family === 'dragon' && ['red', 'green', 'white'].includes(face.dragon as string));
};
const validGroup = (group: unknown): group is McrResolvedGroup => {
  if (!isRecord(group) || !['chow', 'pung', 'kong'].includes(group.kind as string) || !['concealed', 'melded'].includes(group.exposure as string) || !Array.isArray(group.tiles)) return false;
  const tiles = group.tiles;
  if (!tiles.every(validTile) || tiles.length !== (group.kind === 'kong' ? 4 : 3)) return false;
  if (group.kind !== 'chow') return tiles.every((tile) => faceKey(tile) === faceKey(tiles[0]!));
  const faces = tiles.map((tile) => tile.face);
  const suit = faces[0]?.family === 'suit' ? faces[0].suit : undefined;
  if (!suit || !faces.every((face) => face.family === 'suit' && face.suit === suit)) return false;
  const ranks = faces.map((face) => (face as { rank: number }).rank).sort((a, b) => a - b); return ranks.every((rank, index) => rank === ranks[0]! + index);
};

/** Removes the first matching face, preserving free-tile order; undefined means the win is not reconstructable. */
export const removeMcrWinningTileFromFreeTiles = (freeTiles: readonly PhysicalTileEvidence[], winningTile: PhysicalTileEvidence): readonly PhysicalTileEvidence[] | undefined => {
  const winningIndex = freeTiles.findIndex((tile) => faceKey(tile) === faceKey(winningTile));
  return winningIndex < 0 ? undefined : [...freeTiles.slice(0, winningIndex), ...freeTiles.slice(winningIndex + 1)];
};

/** Validates score evidence only; it neither simulates procedure nor decides win legality. */
export const validateMcrScoringInput = (input: McrScoringInput): McrInputValidation => {
  if (!isRecord(input) || !isRecord(input.evidence) || !isRecord(input.context)) return { valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' };
  const { evidence, context } = input;
  if (!Number.isInteger(evidence.flowerCount) || evidence.flowerCount < 0 || evidence.flowerCount > 8) return { valid: false, reasonId: 'mcr.evidence.invalid-flower-count' };
  if (!Array.isArray(evidence.fixedGroups) || !Array.isArray(evidence.freeTiles) || !validTile(evidence.winningTile) || !evidence.freeTiles.every(validTile) || !evidence.fixedGroups.every(validGroup)) return { valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' };
  const tiles = [...evidence.fixedGroups.flatMap((group) => group.tiles), ...evidence.freeTiles];
  if (!removeMcrWinningTileFromFreeTiles(evidence.freeTiles, evidence.winningTile)) return { valid: false, reasonId: 'mcr.evidence.winning-tile-not-free' };
  if ([...new Set(tiles.map(faceKey))].some((identity) => tiles.filter((tile) => faceKey(tile) === identity).length > 4)) return { valid: false, reasonId: 'mcr.evidence.impossible-tile-multiplicity' };
  if ((context.seatWind && !winds.has(context.seatWind)) || (context.prevailingWind && !winds.has(context.prevailingWind))) return { valid: false, reasonId: 'mcr.context.invalid-wind' };
  if (!winSources.has(context.winSource) || !winEvents.has(context.resolvedWinEvent)) return { valid: false, reasonId: 'mcr.context.invalid-win-event' };
  const selfDrawEvent = ['last-wall-draw', 'kong-replacement', 'flower-replacement'].includes(context.resolvedWinEvent); const discardEvent = ['last-discard', 'rob-kong'].includes(context.resolvedWinEvent);
  if ((selfDrawEvent && context.winSource !== 'self-draw') || (discardEvent && context.winSource !== 'discard')) return { valid: false, reasonId: 'mcr.context.contradictory-win-event' };
  return { valid: true };
};
