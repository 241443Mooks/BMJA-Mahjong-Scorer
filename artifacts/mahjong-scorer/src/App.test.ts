import { describe, expect, it } from 'vitest';
import { patternReferenceHref } from './App';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from './game/ruleset';
import { BUZZARD_2000_PROFILE_REF } from './game/buzzard-2000';
import { SPECIAL_HANDS_ATLAS } from './guide/special-hands-atlas';

describe('detected-pattern references', () => {
  const pointPattern = { id: 'own-wind-pung', type: 'points' };
  const specialPattern = { id: 'special-all-pair-honours', type: 'special' };

  it('retains exact British reference links', () => {
    expect(patternReferenceHref(pointPattern, BMJA_PROFILE_REF)).toBe('/guide#ordinary-scoring');
    expect(patternReferenceHref(specialPattern, BMJA_PROFILE_REF)).toBe('/special-hands#all-pair-honours');
  });

  it.each([WESTERN_TM_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, BUZZARD_2000_PROFILE_REF])('links exact special and fishing treatments for %s', (profile) => {
    expect(patternReferenceHref(pointPattern, profile)).toBeUndefined();
    const treatment = SPECIAL_HANDS_ATLAS.find(({ identity }) => identity.profile.id === profile.id && identity.profile.version === profile.version);
    expect(treatment).toBeDefined();
    expect(patternReferenceHref({ id: `special-${treatment!.identity.patternId}`, type: 'special' }, profile)).toBe(treatment!.href);
    expect(treatment!.href).toMatch(/^\/special-hands#treatment-(western|club|buzzard)-/);
    expect(treatment!.href).not.toContain('outside-the-box');
    if (treatment!.fishingValue !== undefined) {
      expect(patternReferenceHref({ id: `fishing-${treatment!.identity.patternId}`, type: 'fishing' }, profile)).toBe(treatment!.href);
    }
  });

  it('keeps BMJA legacy anchors unchanged and fails closed for stale non-BMJA identities', () => {
    expect(patternReferenceHref(specialPattern, BMJA_PROFILE_REF)).toBe('/special-hands#all-pair-honours');
    expect(patternReferenceHref({ id: 'special-unknown-stale-pattern', type: 'special' }, WESTERN_TM_PROFILE_REF)).toBeUndefined();
    expect(patternReferenceHref({ id: 'special-unknown-stale-pattern', type: 'special' }, { id: 'mcr-wmo-2006', version: '0.1' })).toBeUndefined();
  });
});
