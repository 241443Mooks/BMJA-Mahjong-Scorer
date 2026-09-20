import { describe, expect, it } from 'vitest';
import { removeMcrWinningTileFromFreeTiles, validateMcrScoringInput } from './mcr-scoring-input';
import type { McrGroupExposure, McrScoringInput } from './mcr-scoring-input';

const tile = (rank: number) => ({ face: { family: 'suit' as const, suit: 'characters', rank } });
const input = (exposure: McrGroupExposure = 'concealed'): McrScoringInput => ({ evidence: { fixedGroups: [{ kind: 'chow', exposure, tiles: [tile(1), tile(2), tile(3)] }], freeTiles: [tile(3), tile(3)], winningTile: tile(3), flowerCount: 2 }, context: { seatWind: 'east', prevailingWind: 'south', winSource: 'self-draw', resolvedWinEvent: 'flower-replacement', lastVisibleCopy: false } });

describe('MCR scoring evidence boundary', () => {
  it('keeps free tiles decomposition-neutral and trusted context separate', () => {
    const evidence = input().evidence;
    expect(evidence.freeTiles).toEqual([tile(3), tile(3)]);
    expect(validateMcrScoringInput(input())).toEqual({ valid: true });
  });
  it('represents otherwise-identical groups as concealed or melded evidence', () => {
    const concealed = input('concealed'); const melded = input('melded');
    expect(concealed.evidence.fixedGroups[0]?.tiles).toEqual(melded.evidence.fixedGroups[0]?.tiles);
    expect(concealed.evidence.fixedGroups[0]?.exposure).toBe('concealed'); expect(melded.evidence.fixedGroups[0]?.exposure).toBe('melded');
    expect(validateMcrScoringInput(concealed)).toEqual({ valid: true }); expect(validateMcrScoringInput(melded)).toEqual({ valid: true });
  });
  it('rejects contradictory events and invalid evidence rather than inferring table procedure', () => {
    const contradictory = input(); contradictory.context.winSource = 'discard'; expect(validateMcrScoringInput(contradictory)).toEqual({ valid: false, reasonId: 'mcr.context.contradictory-win-event' });
    const invalid = input(); invalid.evidence.flowerCount = 9; expect(validateMcrScoringInput(invalid)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-flower-count' });
    const unresolved = input(); unresolved.evidence.winningTile = tile(9); expect(validateMcrScoringInput(unresolved)).toEqual({ valid: false, reasonId: 'mcr.evidence.winning-tile-not-free' });
    const unsupportedExposure = input(); unsupportedExposure.evidence.fixedGroups[0]!.exposure = 'unknown' as McrGroupExposure; expect(validateMcrScoringInput(unsupportedExposure)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
  });
  it('removes exactly one winning tile from the free multiset in source order', () => {
    const freeTiles = [tile(1), tile(3), tile(2), tile(3)];
    expect(removeMcrWinningTileFromFreeTiles(freeTiles, tile(3))).toEqual([tile(1), tile(2), tile(3)]);
    expect(removeMcrWinningTileFromFreeTiles(freeTiles, tile(9))).toBeUndefined();
  });
  it('counts fixed and free tiles together and fails closed on malformed overlap evidence', () => {
    const tooManyCopies = input(); tooManyCopies.evidence.fixedGroups = [{ kind: 'pung', exposure: 'melded', tiles: [tile(3), tile(3), tile(3)] }];
    expect(validateMcrScoringInput(tooManyCopies)).toEqual({ valid: false, reasonId: 'mcr.evidence.impossible-tile-multiplicity' });
    const malformed = input() as unknown as { evidence: { fixedGroups: unknown; freeTiles: unknown; winningTile: unknown; flowerCount: number }; context: McrScoringInput['context'] };
    malformed.evidence.fixedGroups = [{ kind: 'chow', exposure: 'melded', tiles: [tile(1), tile(2)] }];
    expect(validateMcrScoringInput(malformed as McrScoringInput)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
    expect(validateMcrScoringInput({ evidence: null, context: null } as unknown as McrScoringInput)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-resolved-tiles' });
  });
});
