import { describe, expect, it } from 'vitest';
import { validateMcrScoringInput } from './mcr-scoring-input';
import type { McrGroupExposure, McrScoringInput } from './mcr-scoring-input';

const tile = (rank: number) => ({ face: { family: 'suit' as const, suit: 'characters', rank } });
const input = (exposure: McrGroupExposure = 'concealed'): McrScoringInput => ({ evidence: { groups: [{ kind: 'chow', exposure, tiles: [tile(1), tile(2), tile(3)] }], pairOrIrregularTiles: [tile(3), tile(3)], winningTile: tile(3), flowerCount: 2 }, context: { seatWind: 'east', prevailingWind: 'south', winSource: 'self-draw', resolvedWinEvent: 'flower-replacement', lastVisibleCopy: false } });

describe('MCR scoring evidence boundary', () => {
  it('keeps resolved hand evidence separate from trusted context', () => expect(validateMcrScoringInput(input())).toEqual({ valid: true }));
  it('represents otherwise-identical groups as concealed or melded evidence', () => {
    const concealed = input('concealed'); const melded = input('melded');
    expect(concealed.evidence.groups[0]?.tiles).toEqual(melded.evidence.groups[0]?.tiles);
    expect(concealed.evidence.groups[0]?.exposure).toBe('concealed'); expect(melded.evidence.groups[0]?.exposure).toBe('melded');
    expect(validateMcrScoringInput(concealed)).toEqual({ valid: true }); expect(validateMcrScoringInput(melded)).toEqual({ valid: true });
  });
  it('rejects contradictory events and invalid evidence rather than inferring table procedure', () => {
    const contradictory = input(); contradictory.context.winSource = 'discard'; expect(validateMcrScoringInput(contradictory)).toEqual({ valid: false, reasonId: 'mcr.context.contradictory-win-event' });
    const invalid = input(); invalid.evidence.flowerCount = 9; expect(validateMcrScoringInput(invalid)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-flower-count' });
    const unresolved = input(); unresolved.evidence.winningTile = tile(9); expect(validateMcrScoringInput(unresolved)).toEqual({ valid: false, reasonId: 'mcr.evidence.winning-tile-not-resolved' });
    const unsupportedExposure = input(); unsupportedExposure.evidence.groups[0]!.exposure = 'unknown' as McrGroupExposure; expect(validateMcrScoringInput(unsupportedExposure)).toEqual({ valid: false, reasonId: 'mcr.evidence.invalid-group-exposure' });
  });
});
