import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { bmjaSpecialHandBindings } from '../scoring';
import { outsideTheBoxSpecialHandBindings } from './outside-the-box-catalogue';
import { canonicalPublicGamePath, currentClassicalScorerDefaultLimit, descriptorForRulesProfile, descriptorForSlug, isBritishRulesProfile, normaliseStandaloneHandMode, PUBLIC_RULES_DESCRIPTORS, publicGamePathForRulesProfile, publicRulesSlugFromGamePath } from './rules-presentation';
import { descriptorsForPickerSurface, rulesCardStatus } from './RulesProfilePicker';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from './ruleset';
import { westernTmSpecialHandBindings } from './western-tm-catalogue';
import { BUZZARD_2000_PROFILE_REF } from './buzzard-2000';

describe('public rules presentation', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());
  it('maps five public descriptors while retaining surface-specific availability', () => {
    expect(PUBLIC_RULES_DESCRIPTORS.map((descriptor) => descriptor.title)).toEqual(['British / BMJA-style', 'Western — Thompson & Maloney', 'Club - Bramhall 2026', 'British/Western Classical — Buzzard 2000', 'MCR / WMO 2006']);
    expect(descriptorForSlug('british').profile).toEqual(BMJA_PROFILE_REF);
    expect(descriptorForSlug('western').profile).toEqual(WESTERN_TM_PROFILE_REF);
    expect(descriptorForSlug('club').profile).toEqual(OUTSIDE_THE_BOX_PROFILE_REF);
    expect(descriptorForSlug('buzzard').profile).toEqual(BUZZARD_2000_PROFILE_REF);
    expect(descriptorForSlug('mcr').profile).toEqual({ id: 'mcr-wmo-2006', version: '0.1' });
    expect(descriptorsForPickerSurface('hand')).toHaveLength(5);
    expect(descriptorsForPickerSurface('game')).toHaveLength(5);
    expect(descriptorsForPickerSurface('game').map(({ slug }) => slug)).toEqual(['british', 'western', 'club', 'buzzard', 'mcr']);
    expect(descriptorForSlug('mcr').availability).toEqual({ handScorer: true, gameTracker: true, rulesReference: true });
    expect(descriptorForSlug('mcr')).toMatchObject({ status: 'Provisional', profile: { id: 'mcr-wmo-2006', version: '0.1' }, support: { source: expect.stringContaining('source.mcr-ema-green-book-2006') } });
    expect(JSON.stringify(descriptorForRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF))).not.toContain('Outside the Box');
  });

  it('keeps entry routes as public intent, with British as the safe default', () => {
    expect(publicRulesSlugFromGamePath('/game')).toBe('british');
    expect(publicRulesSlugFromGamePath('/game/british')).toBe('british');
    expect(publicRulesSlugFromGamePath('/game/western')).toBe('western');
    expect(publicRulesSlugFromGamePath('/game/club')).toBe('club');
    expect(publicRulesSlugFromGamePath('/game/buzzard')).toBe('buzzard');
    expect(publicRulesSlugFromGamePath('/game/mcr')).toBe('mcr');
    expect(publicRulesSlugFromGamePath('/game/foo')).toBeUndefined();
    expect(publicRulesSlugFromGamePath('/game/mcr/foo')).toBeUndefined();
    for (const path of ['/game', '/game/british', '/game/western', '/game/club', '/game/buzzard', '/game/mcr']) expect(canonicalPublicGamePath(path)).toBe('/game');
    expect(canonicalPublicGamePath('/game/foo')).toBeUndefined();
    expect(publicGamePathForRulesProfile(BMJA_PROFILE_REF)).toBe('/game/british');
    expect(publicGamePathForRulesProfile(WESTERN_TM_PROFILE_REF)).toBe('/game/western');
    expect(publicGamePathForRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF)).toBe('/game/club');
    expect(publicGamePathForRulesProfile(BUZZARD_2000_PROFILE_REF)).toBe('/game/buzzard');
    expect(publicGamePathForRulesProfile({ id: 'mcr-wmo-2006', version: '0.1' })).toBe('/game/mcr');
  });

  it('derives catalogue claims from the executable binding collections', () => {
    expect(descriptorForSlug('british').atAGlance[0]).toContain(String(bmjaSpecialHandBindings.length));
    expect(descriptorForSlug('western').atAGlance[0]).toContain(String(westernTmSpecialHandBindings.length));
    expect(descriptorForSlug('club').atAGlance[0]).toContain(String(outsideTheBoxSpecialHandBindings.length));
  });

  it('allows standalone Goulash only under the configured Club profile', () => {
    expect(normaliseStandaloneHandMode(OUTSIDE_THE_BOX_PROFILE_REF, 'goulash')).toBe('goulash');
    expect(normaliseStandaloneHandMode(BMJA_PROFILE_REF, 'goulash')).toBe('normal');
    expect(normaliseStandaloneHandMode(WESTERN_TM_PROFILE_REF, 'goulash')).toBe('normal');
  });

  it('keeps British stable, Western provisional and Club configured at first glance', () => {
    expect(rulesCardStatus(descriptorForSlug('british'))).toBe('Stable scorer');
    expect(rulesCardStatus(descriptorForSlug('western'))).toBe('Provisional scorer');
    expect(rulesCardStatus(descriptorForSlug('club'))).toBe('Configured profile');
    expect(descriptorForSlug('western').atAGlance).toContain('Ordinary play and settlement remain provisional while source review continues');
  });

  it('identifies British by its exact active profile rather than its display text', () => {
    expect(isBritishRulesProfile(BMJA_PROFILE_REF)).toBe(true);
    expect(isBritishRulesProfile(WESTERN_TM_PROFILE_REF)).toBe(false);
    expect(isBritishRulesProfile(OUTSIDE_THE_BOX_PROFILE_REF)).toBe(false);
  });

  it('keeps the current scorer limit in presentation and fails closed for unknown profiles', () => {
    expect(currentClassicalScorerDefaultLimit(BMJA_PROFILE_REF)).toBe(1000);
    expect(currentClassicalScorerDefaultLimit(WESTERN_TM_PROFILE_REF)).toBe(1000);
    expect(currentClassicalScorerDefaultLimit(OUTSIDE_THE_BOX_PROFILE_REF)).toBe(1000);
    expect(currentClassicalScorerDefaultLimit(BUZZARD_2000_PROFILE_REF)).toBe(600);
    expect(() => currentClassicalScorerDefaultLimit({ id: 'unknown', version: '1.0' })).toThrow(
      'CURRENT_RULES_RUNTIME_UNAVAILABLE:unknown@1.0',
    );
  });
});
