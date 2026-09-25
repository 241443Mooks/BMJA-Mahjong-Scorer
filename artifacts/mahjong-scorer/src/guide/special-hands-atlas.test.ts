import { beforeAll, describe, expect, it } from 'vitest';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from '../game/ruleset';
import { BUZZARD_2000_PROFILE_REF } from '../game/buzzard-2000';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { readPreferredRulesProfile, PREFERRED_RULES_PROFILE_STORAGE_KEY } from '../game/preferred-rules-profile';
import { specialHandBindingsForCurrentClassicalProfile } from '../rules-knowledge/current-classical-special-hand-bindings';
import { specialHandTreatmentsForProfile } from '../rules-knowledge/special-hand-treatments';
import { SPECIAL_HANDS_ATLAS, atlasBrowseRecords, atlasScoreLabel, clearAtlasSearchAndProfileFilter, filterSpecialHandsAtlasByProfile, searchSpecialHandsAtlas } from './special-hands-atlas';
import { SPECIAL_HAND_ANCHORS, specialHandReferenceHref } from './special-hand-references';

const profiles = [BMJA_PROFILE_REF, WESTERN_TM_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, BUZZARD_2000_PROFILE_REF];

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('Special Hands Atlas directory projection', () => {
  it('contains every current Classical authoritative treatment identity exactly once', () => {
    const expected = profiles.flatMap((profile) => specialHandTreatmentsForProfile(profile).map(({ referenceId }) => referenceId)).sort();
    const actual = SPECIAL_HANDS_ATLAS.map(({ referenceId }) => referenceId).sort();
    expect(actual).toEqual(expected);
    expect(new Set(actual).size).toBe(actual.length);
    expect(SPECIAL_HANDS_ATLAS.length).toBe(profiles.reduce((sum, profile) => sum + specialHandBindingsForCurrentClassicalProfile(profile).length, 0));
  });

  it('keeps MCR outside the Classical Atlas', () => {
    expect(specialHandTreatmentsForProfile({ id: 'mcr-wmo-2006', version: '0.1' })).toEqual([]);
    expect(SPECIAL_HANDS_ATLAS.some(({ identity }) => identity.profile.id === 'mcr-wmo-2006')).toBe(false);
  });

  it('keeps same-pattern treatments as distinct profile identities', () => {
    const samePattern = SPECIAL_HANDS_ATLAS.filter(({ identity }) => identity.patternId === 'all-pair-honours');
    expect(samePattern.map(({ referenceId }) => referenceId)).toContain('bmja@1.0:all-pair-honours');
    expect(samePattern.map(({ referenceId }) => referenceId)).toContain('western-tm@0.1:all-pair-honours');
    expect(new Set(samePattern.map(({ referenceId }) => referenceId)).size).toBe(samePattern.length);
  });

  it('shows Western all-pair-honours facts without a borrowed BMJA anchor', () => {
    const western = SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === 'western-tm@0.1:all-pair-honours')!;
    expect(western).toMatchObject({ name: 'All Pair Honours', scoreModel: 'fixed', winnerValue: 1000, fishingValue: 400 });
    expect(western.href).toBeUndefined();
  });

  it('describes fixed, calculated and configured-limit score models without inventing numbers', () => {
    const fixed = SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === 'western-tm@0.1:all-pair-honours')!;
    const calculated = SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === 'western-tm@0.1:purity-one-chow')!;
    const configured = SPECIAL_HANDS_ATLAS.find(({ identity }) => identity.profile.id === BUZZARD_2000_PROFILE_REF.id && identity.patternId === 'all-winds-and-dragons')!;
    expect(atlasScoreLabel(fixed)).toContain('1,000 winner');
    expect(atlasScoreLabel(calculated)).toBe('Calculated under this profile');
    expect(calculated).not.toHaveProperty('winnerValue');
    expect(calculated).not.toHaveProperty('fishingValue');
    expect(atlasScoreLabel(configured)).toBe('Configured/table limit');
    expect(configured).not.toHaveProperty('winnerValue');
  });

  it('searches deterministically with exact and prefix names ranked ahead of weaker matches', () => {
    const first = searchSpecialHandsAtlas(SPECIAL_HANDS_ATLAS, 'all pair honours');
    expect(first.map(({ referenceId }) => referenceId)).toEqual(searchSpecialHandsAtlas(SPECIAL_HANDS_ATLAS, 'all pair honours').map(({ referenceId }) => referenceId));
    expect(first.slice(0, 2).map(({ identity }) => identity.profile.id)).toContain('western-tm');
    expect(searchSpecialHandsAtlas(SPECIAL_HANDS_ATLAS, 'all pair').slice(0, 2).every(({ name }) => name.toLocaleLowerCase('en-GB').startsWith('all pair'))).toBe(true);
  });

  it('searches factual descriptions and public profile labels case-insensitively', () => {
    expect(searchSpecialHandsAtlas(SPECIAL_HANDS_ATLAS, 'a concealed one-suit layout').length).toBeGreaterThan(0);
    expect(searchSpecialHandsAtlas(SPECIAL_HANDS_ATLAS, 'THOMPSON & MALONEY').every(({ identity }) => identity.profile.id === 'western-tm')).toBe(true);
  });

  it('filters by exact profile identity', () => {
    expect(filterSpecialHandsAtlasByProfile(SPECIAL_HANDS_ATLAS, WESTERN_TM_PROFILE_REF).every(({ identity }) => identity.profile.id === 'western-tm' && identity.profile.version === '0.1')).toBe(true);
    expect(filterSpecialHandsAtlasByProfile(SPECIAL_HANDS_ATLAS, { id: 'western-tm', version: '0.2' })).toEqual([]);
  });

  it('defaults a valid Classical preference to My rules and keeps All rules browsing read-only', () => {
    const state = new Map([[PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(WESTERN_TM_PROFILE_REF)]]);
    let writes = 0;
    const storage = {
      getItem: (key: string) => state.get(key) ?? null,
      setItem: (key: string, value: string) => { writes += 1; state.set(key, value); },
      removeItem: (key: string) => { writes += 1; state.delete(key); },
    };
    const preferred = readPreferredRulesProfile(storage);
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, 'my-rules', null).every(({ identity }) => identity.profile.id === 'western-tm')).toBe(true);
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, 'all-rules', OUTSIDE_THE_BOX_PROFILE_REF).every(({ identity }) => identity.profile.id === 'outside-the-box')).toBe(true);
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, 'all-rules', null).length).toBe(SPECIAL_HANDS_ATLAS.length);
    expect(writes).toBe(0);
    expect(state.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(WESTERN_TM_PROFILE_REF));
  });

  it('clears search and profile filters without leaving remembered Western My rules', () => {
    const state = new Map([[PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(WESTERN_TM_PROFILE_REF)]]);
    const storage = {
      getItem: (key: string) => state.get(key) ?? null,
      setItem: (key: string, value: string) => { state.set(key, value); },
      removeItem: (key: string) => { state.delete(key); },
    };
    const preferred = readPreferredRulesProfile(storage);
    const mode = 'my-rules' as const;
    const searchState = { mode, query: 'all pair honours', profileFilter: 'all' };
    const myRulesResults = atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, searchState.mode, null);
    expect(searchSpecialHandsAtlas(myRulesResults, searchState.query)).toHaveLength(1);

    const clearedSearch = clearAtlasSearchAndProfileFilter(searchState);
    expect(clearedSearch).toEqual({ mode: 'my-rules', query: '', profileFilter: 'all' });
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, clearedSearch.mode, null)).toHaveLength(85);

    const noResults = { mode, query: 'no matching treatment', profileFilter: 'all' };
    expect(searchSpecialHandsAtlas(myRulesResults, noResults.query)).toEqual([]);
    const clearedNoResults = clearAtlasSearchAndProfileFilter(noResults);
    expect(clearedNoResults.mode).toBe('my-rules');
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, clearedNoResults.mode, null)).toHaveLength(85);
    expect(state.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(WESTERN_TM_PROFILE_REF));
  });

  it('uses neutral All rules behavior with no preference and exposes no My rules default for MCR', () => {
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, null, 'all-rules', null)).toEqual(SPECIAL_HANDS_ATLAS);
    const mcr = { id: 'mcr-wmo-2006', version: '0.1' };
    expect(atlasBrowseRecords(SPECIAL_HANDS_ATLAS, mcr, 'my-rules', null)).toEqual(SPECIAL_HANDS_ATLAS);
    expect(specialHandTreatmentsForProfile(mcr)).toEqual([]);
  });

  it('retains all BMJA public anchors and legacy event aliases on their owning records', () => {
    for (const [patternId, anchor] of Object.entries(SPECIAL_HAND_ANCHORS)) {
      if (patternId === 'purity') continue;
      const row = SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === `bmja@1.0:${patternId === 'gathering-the-plum-blossom-from-the-roof' ? 'gathering-plum-blossom' : patternId === 'plucking-the-moon-from-the-bottom-of-the-sea' ? 'plucking-moon' : patternId}`);
      if (row) expect(row.href ?? specialHandReferenceHref(patternId)).toBe(`/special-hands#${anchor}`);
      else expect(specialHandReferenceHref(patternId)).toBe(`/special-hands#${anchor}`);
    }
    expect(SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === 'bmja@1.0:all-pair-honours')?.href).toBe('/special-hands#all-pair-honours');
  });

  it('keeps Purity as authored guidance outside the executable identity union', () => {
    expect(SPECIAL_HANDS_ATLAS.some(({ identity }) => identity.patternId === 'purity')).toBe(false);
    expect(SPECIAL_HAND_ANCHORS.purity).toBe('purity');
  });

  it('returns an empty result for unmatched queries, allowing an explicit UI reset', () => {
    expect(searchSpecialHandsAtlas(SPECIAL_HANDS_ATLAS, 'no such treatment')).toEqual([]);
  });
});
