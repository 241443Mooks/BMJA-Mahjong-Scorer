import { describe, expect, it } from 'vitest';
import { patternReferenceHref } from './App';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from './game/ruleset';

describe('detected-pattern references', () => {
  const pointPattern = { id: 'own-wind-pung', type: 'points' };
  const specialPattern = { id: 'special-all-pair-honours', type: 'special' };

  it('retains exact British reference links', () => {
    expect(patternReferenceHref(pointPattern, BMJA_PROFILE_REF)).toBe('/guide#ordinary-scoring');
    expect(patternReferenceHref(specialPattern, BMJA_PROFILE_REF)).toBe('/special-hands#all-pair-honours');
  });

  it.each([WESTERN_TM_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF])('does not link non-British detected patterns to British reference material', (profile) => {
    expect(patternReferenceHref(pointPattern, profile)).toBeUndefined();
    expect(patternReferenceHref(specialPattern, profile)).toBeUndefined();
  });
});
