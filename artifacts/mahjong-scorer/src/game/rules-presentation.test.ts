import { describe, expect, it } from 'vitest';
import { bmjaSpecialHandBindings } from '../scoring';
import { outsideTheBoxSpecialHandBindings } from './outside-the-box-catalogue';
import { descriptorForRulesProfile, descriptorForSlug, PUBLIC_RULES_DESCRIPTORS, publicRulesSlugFromGamePath } from './rules-presentation';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';

describe('public rules presentation', () => {
  it('maps the three public choices to their exact persisted profiles without exposing the club name', () => {
    expect(PUBLIC_RULES_DESCRIPTORS.map((descriptor) => descriptor.title)).toEqual(['British / BMJA-style', 'Western — Thompson & Maloney', 'Club rules']);
    expect(descriptorForSlug('british').profile).toEqual(BMJA_PROFILE_REF);
    expect(descriptorForSlug('western').profile).toEqual(WESTERN_TM_PROFILE_REF);
    expect(descriptorForSlug('club').profile).toEqual(OUTSIDE_THE_BOX_PROFILE_REF);
    expect(JSON.stringify(descriptorForRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF))).not.toContain('Outside the Box');
  });

  it('keeps entry routes as public intent, with British as the safe default', () => {
    expect(publicRulesSlugFromGamePath('/game')).toBe('british');
    expect(publicRulesSlugFromGamePath('/game/british')).toBe('british');
    expect(publicRulesSlugFromGamePath('/game/western')).toBe('western');
    expect(publicRulesSlugFromGamePath('/game/club')).toBe('club');
  });

  it('derives catalogue claims from the executable binding collections', () => {
    expect(descriptorForSlug('british').atAGlance[0]).toContain(String(bmjaSpecialHandBindings.length));
    expect(descriptorForSlug('western').atAGlance[0]).toContain(String(westernTmSpecialHandBindings.length));
    expect(descriptorForSlug('club').atAGlance[0]).toContain(String(outsideTheBoxSpecialHandBindings.length));
  });
});
