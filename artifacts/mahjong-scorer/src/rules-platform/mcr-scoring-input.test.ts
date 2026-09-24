import { describe, expect, it } from 'vitest';
import { removeMcrWinningTileFromFreeTiles, validateMcrScoringInput } from './mcr-scoring-input';
import type { McrGroupExposure, McrScoringInput } from './mcr-scoring-input';

const tile = (rank: number) => ({ face: { family: 'suit' as const, suit: 'characters', rank } });
const reorderedTile = (rank: number) => ({ face: { rank, suit: 'characters' as const, family: 'suit' as const } });
const input = (): McrScoringInput => ({ evidence: { fixedGroups: [{ kind: 'chow', exposure: 'melded', tiles: [tile(1), tile(2), tile(3)] }], freeTiles: [tile(3), tile(3)], winningTile: tile(3), flowerCount: 2 }, context: { seatWind: 'east', prevailingWind: 'south', winSource: 'self-draw', resolvedWinEvent: 'flower-replacement', lastVisibleCopy: false } });

describe('MCR scoring evidence boundary', () => {
  it('keeps free tiles decomposition-neutral and trusted context separate', () => {
    const evidence = input().evidence;
    expect(evidence.freeTiles).toEqual([tile(3), tile(3)]);
    expect(validateMcrScoringInput(input())).toEqual({ valid: true });
  });
  it('accepts melded groups and declared concealed Kongs as physically fixed evidence', () => {
    const meldedPung = input(); meldedPung.evidence.fixedGroups = [{ kind: 'pung', exposure: 'melded', tiles: [tile(1), tile(1), tile(1)] }];
    const concealedKong = input(); concealedKong.evidence.fixedGroups = [{ kind: 'kong', exposure: 'concealed', tiles: [tile(1), tile(1), tile(1), tile(1)] }];
    const meldedKong = input(); meldedKong.evidence.fixedGroups = [{ kind: 'kong', exposure: 'melded', tiles: [tile(1), tile(1), tile(1), tile(1)] }];
    expect(validateMcrScoringInput(input())).toEqual({ valid: true });
    expect(validateMcrScoringInput(meldedPung)).toEqual({ valid: true }); expect(validateMcrScoringInput(concealedKong)).toEqual({ valid: true }); expect(validateMcrScoringInput(meldedKong)).toEqual({ valid: true });
  });
  it('rejects contradictory events and invalid evidence rather than inferring table procedure', () => {
    const contradictory = input(); contradictory.context.winSource = 'discard'; expect(validateMcrScoringInput(contradictory)).toEqual({ valid: false, reasonId: 'mcr.context.contradictory-win-event' });
    const invalid = input(); invalid.evidence.flowerCount = 9; expect(validateMcrScoringInput(invalid)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-flower-count' });
    const unresolved = input(); unresolved.evidence.winningTile = tile(9); expect(validateMcrScoringInput(unresolved)).toEqual({ valid: false, reasonId: 'mcr.evidence.winning-tile-not-free' });
    const unsupportedExposure = input(); unsupportedExposure.evidence.fixedGroups[0]!.exposure = 'unknown' as McrGroupExposure; expect(validateMcrScoringInput(unsupportedExposure)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
    const concealedChow = input(); concealedChow.evidence.fixedGroups[0]!.exposure = 'concealed'; expect(validateMcrScoringInput(concealedChow)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
    const concealedPung = input(); concealedPung.evidence.fixedGroups = [{ kind: 'pung', exposure: 'concealed', tiles: [tile(1), tile(1), tile(1)] }]; expect(validateMcrScoringInput(concealedPung)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
  });
  it('removes exactly one winning tile from the free multiset in source order', () => {
    const freeTiles = [tile(1), tile(3), tile(2), tile(3)];
    expect(removeMcrWinningTileFromFreeTiles(freeTiles, tile(3))).toEqual([tile(1), tile(2), tile(3)]);
    expect(removeMcrWinningTileFromFreeTiles(freeTiles, tile(9))).toBeUndefined();
  });
  it('counts fixed and free tiles together and fails closed on malformed overlap evidence', () => {
    const tooManyCopies = input(); tooManyCopies.evidence.fixedGroups = [{ kind: 'pung', exposure: 'melded', tiles: [tile(3), tile(3), tile(3)] }]; tooManyCopies.evidence.freeTiles = [reorderedTile(3), tile(3)]; tooManyCopies.evidence.winningTile = reorderedTile(3);
    expect(validateMcrScoringInput(tooManyCopies)).toEqual({ valid: false, reasonId: 'mcr.evidence.impossible-tile-multiplicity' });
    const malformed = input() as unknown as { evidence: { fixedGroups: unknown; freeTiles: unknown; winningTile: unknown; flowerCount: number }; context: McrScoringInput['context'] };
    malformed.evidence.fixedGroups = [{ kind: 'chow', exposure: 'melded', tiles: [tile(1), tile(2)] }];
    expect(validateMcrScoringInput(malformed as McrScoringInput)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
    expect(validateMcrScoringInput({ evidence: null, context: null } as unknown as McrScoringInput)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
  });
  it('uses semantic face identity regardless of object property insertion order', () => {
    expect(removeMcrWinningTileFromFreeTiles([tile(3)], reorderedTile(3))).toEqual([]);
  });
});
