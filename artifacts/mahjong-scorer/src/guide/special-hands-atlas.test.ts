import { beforeAll, describe, expect, it } from 'vitest';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, WESTERN_TM_PROFILE_REF } from '../game/ruleset';
import { BUZZARD_2000_PROFILE_REF } from '../game/buzzard-2000';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { readPreferredRulesProfile, PREFERRED_RULES_PROFILE_STORAGE_KEY } from '../game/preferred-rules-profile';
import { specialHandBindingsForCurrentClassicalProfile } from '../rules-knowledge/current-classical-special-hand-bindings';
import { specialHandTreatmentsForProfile } from '../rules-knowledge/special-hand-treatments';
import { ATLAS_EXAMPLE_BY_ID, ATLAS_FACET_DEFINITIONS, ATLAS_LEARNER_ENTRIES, ATLAS_TREATMENT_OWNERSHIP, ATLAS_UNRESOLVED_TREATMENTS, SPECIAL_HANDS_ATLAS, atlasBrowseRecords, atlasExamplesForTreatment, atlasScoreLabel, atlasTreatmentsForEntry, clearAtlasSearchAndProfileFilter, filterAtlasEntriesByFacets, filterSpecialHandsAtlasByProfile, searchAtlasLearnerEntries, searchSpecialHandsAtlas, selectAtlasLeadExample } from './special-hands-atlas';
import { specialHandExampleProvesBmjaTreatment } from './special-hand-examples';
import { materializeAtlasGenerator } from './AtlasExampleVisual';
import { detectSpecialHands } from '../scoring';
import { SPECIAL_HAND_ANCHORS, specialHandReferenceHref } from './special-hand-references';

const profiles = [BMJA_PROFILE_REF, WESTERN_TM_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF, BUZZARD_2000_PROFILE_REF];

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('Special Hands Atlas directory projection', () => {
  it('uses only defined facet IDs on every learner entry and variant', () => {
    const facetIds = ATLAS_LEARNER_ENTRIES.flatMap((entry) => [
      ...(entry.facets ?? []),
      ...(entry.variants ?? []).flatMap((variant) =>
        Array.isArray(variant.facets)
          ? variant.facets.filter((facet): facet is string => typeof facet === 'string')
          : [],
      ),
    ]);
    expect(facetIds.filter((facetId) => !Object.hasOwn(ATLAS_FACET_DEFINITIONS, facetId))).toEqual([]);
  });

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

  it('proves final manifest ownership against all 146 exact treatment projection keys', () => {
    const ownerIds = Object.values(ATLAS_TREATMENT_OWNERSHIP);
    expect(SPECIAL_HANDS_ATLAS).toHaveLength(146);
    expect(Object.keys(ATLAS_TREATMENT_OWNERSHIP)).toHaveLength(146);
    expect(new Set(Object.keys(ATLAS_TREATMENT_OWNERSHIP)).size).toBe(146);
    expect(ownerIds).toHaveLength(146);
    expect(new Set(SPECIAL_HANDS_ATLAS.map(({ referenceId }) => referenceId))).toEqual(new Set(Object.keys(ATLAS_TREATMENT_OWNERSHIP)));
    expect(ATLAS_TREATMENT_OWNERSHIP['outside-the-box@0.1:club-three-great-scholars']).toBe('three-great-scholars-club-verified');
    expect(ATLAS_TREATMENT_OWNERSHIP['buzzard-2000@0.1:buzzard-three-dragons-winner']).toBe('three-dragons-buzzard-winner-verified');
    for (const record of SPECIAL_HANDS_ATLAS) {
      const owner = ATLAS_LEARNER_ENTRIES.find(({ id }) => id === ATLAS_TREATMENT_OWNERSHIP[record.referenceId]);
      expect(owner, record.referenceId).toBeDefined();
      expect(owner?.treatmentReferenceIds.filter((referenceId) => referenceId === record.referenceId), record.referenceId).toHaveLength(1);
    }
  });

  it('groups Knitting and Triple Knitting with the exact profile treatments and resolves only their four open items', () => {
    const knittingRefs = [
      'bmja@1.0:knitting',
      'western-tm@0.1:two-suit-knitting',
      'outside-the-box@0.1:knitting',
    ];
    const tripleKnittingRefs = [
      'bmja@1.0:triple-knitting',
      'western-tm@0.1:three-suit-knitting-with-pair',
      'outside-the-box@0.1:triple-knitting',
    ];
    for (const [entryId, referenceIds] of [
      ['knitting-reviewed', knittingRefs],
      ['triple-knitting-reviewed', tripleKnittingRefs],
    ] as const) {
      const entry = ATLAS_LEARNER_ENTRIES.find(({ id }) => id === entryId)!;
      expect(entry.state).toBe('reviewed-concept');
      expect([...entry.treatmentReferenceIds].sort()).toEqual([...referenceIds].sort());
      expect([...(entry.variants?.[0].treatmentReferenceIds ?? [])].sort()).toEqual([...referenceIds].sort());
      expect(atlasTreatmentsForEntry(entry).map(({ referenceId }) => referenceId).sort()).toEqual([...referenceIds].sort());
    }
    const resolvedRefs = [
      'bmja@1.0:knitting',
      'outside-the-box@0.1:knitting',
      'bmja@1.0:triple-knitting',
      'outside-the-box@0.1:triple-knitting',
    ];
    expect(ATLAS_UNRESOLVED_TREATMENTS.size).toBe(3);
    expect(resolvedRefs.filter((referenceId) => ATLAS_UNRESOLVED_TREATMENTS.has(referenceId))).toEqual([]);
    expect([...ATLAS_UNRESOLVED_TREATMENTS].sort()).toEqual([
      'buzzard-2000@0.1:heavens-blessing',
      'buzzard-2000@0.1:thirteen-unique-wonders',
      'buzzard-2000@0.1:three-winds-and-fourth-wind-pair',
    ]);
  });

  it('resolves reviewed concept aliases, profile-local names and exact treatment IDs', () => {
    expect(searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, 'Unique Wonder').map(({ id }) => id)).toContain('thirteen-unique-wonders');
    expect(searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, '13 Unique Wonders').map(({ id }) => id)).toContain('thirteen-unique-wonders');
    expect(searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, 'Imperial Jade').map(({ id }) => id)).toContain('imperial-jade');
    expect(searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, 'Three Dragons').map(({ id }) => id)).toEqual(['three-dragons-buzzard-winner-verified']);
    expect(searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, 'western-tm@0.1:purity-one-chow').map(({ id }) => id)).toContain('purity-western-calculated');
    expect(searchAtlasLearnerEntries(ATLAS_LEARNER_ENTRIES, 'Golden Gates').map(({ id }) => id)).toContain('western-gates-named-topic');
  });

  it('keeps overlapping facet results de-duplicated and applies facets as filters', () => {
    const blessings = ATLAS_LEARNER_ENTRIES.find(({ id }) => id === 'four-blessings')!;
    expect(blessings.facets).toEqual(expect.arrayContaining(['ordinary-grouped', 'winds', 'pungs-kongs']));
    const results = filterAtlasEntriesByFacets(ATLAS_LEARNER_ENTRIES, ['winds', 'ordinary-grouped']);
    expect(results.filter(({ id }) => id === 'four-blessings')).toHaveLength(1);
    expect(new Set(results.map(({ id }) => id)).size).toBe(results.length);
    expect(ATLAS_FACET_DEFINITIONS['hybrid-layout']).toBeTruthy();
    expect(filterAtlasEntriesByFacets(ATLAS_LEARNER_ENTRIES, ['hybrid-layout']).map(({ id }) => id)).toContain('windy-ones');
  });

  it('applies final pair-family variant memberships from the authoritative manifest', () => {
    const pairFamily = ATLAS_LEARNER_ENTRIES.find(({ id }) => id === 'pair-hand-family')!;
    const variants = new Map(pairFamily.variants?.map(({ id, treatmentReferenceIds }) => [id, treatmentReferenceIds]));
    expect(variants.get('all-pair-western')).toEqual([
      'western-tm@0.1:seven-pairs-one-suit-with-honours',
      'outside-the-box@0.1:seven-pairs-one-suit-with-honours',
    ]);
    expect(variants.get('heavenly-twins')).toEqual([
      'western-tm@0.1:seven-pairs-one-suit',
      'outside-the-box@0.1:seven-pairs-one-suit',
    ]);
    expect(atlasExamplesForTreatment(pairFamily, 'outside-the-box@0.1:seven-pairs-one-suit-with-honours').map(({ id }) => id)).toEqual(['example-all-pair-western']);
    expect(atlasExamplesForTreatment(pairFamily, 'outside-the-box@0.1:seven-pairs-one-suit').map(({ id }) => id)).toEqual(['example-heavenly-twins']);
  });

  it('leads Imperial Jade with the preferred treatment variant example', () => {
    const imperialJade = ATLAS_LEARNER_ENTRIES.find(({ id }) => id === 'imperial-jade')!;
    expect(selectAtlasLeadExample(imperialJade, WESTERN_TM_PROFILE_REF)).toMatchObject({
      example: { id: 'example-imperial-jade-western-chow' },
      variantLabel: 'Thompson & Maloney Western form',
    });
    expect(selectAtlasLeadExample(imperialJade, BMJA_PROFILE_REF)).toMatchObject({
      example: { id: 'example-imperial-jade-narrow-existing' },
      variantLabel: 'British / Outside the Box form',
    });
    expect(selectAtlasLeadExample(imperialJade, OUTSIDE_THE_BOX_PROFILE_REF)).toMatchObject({
      example: { id: 'example-imperial-jade-narrow-existing' },
    });
  });

  it('keeps preference reads and All rules browsing free of writes', () => {
    const state = new Map([[PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(WESTERN_TM_PROFILE_REF)]]);
    let writes = 0;
    const storage = {
      getItem: (key: string) => state.get(key) ?? null,
      setItem: (key: string, value: string) => { writes += 1; state.set(key, value); },
      removeItem: (key: string) => { writes += 1; state.delete(key); },
    };
    const preferenceBefore = state.get(PREFERRED_RULES_PROFILE_STORAGE_KEY);
    const preferred = readPreferredRulesProfile(storage);
    const rows = atlasBrowseRecords(SPECIAL_HANDS_ATLAS, preferred, 'all-rules', OUTSIDE_THE_BOX_PROFILE_REF);
    expect(rows.every(({ identity }) => identity.profile.id === OUTSIDE_THE_BOX_PROFILE_REF.id)).toBe(true);
    expect(writes).toBe(0);
    expect(state.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(preferenceBefore);
  });

  it('preserves the twelve required content journeys and unresolved boundaries', () => {
    const entry = (id: string) => ATLAS_LEARNER_ENTRIES.find((item) => item.id === id)!;
    expect(entry('four-blessings').exampleIds).toContain('example-four-blessings-existing');
    expect(entry('thirteen-unique-wonders').localNames).toEqual(expect.arrayContaining(['Unique Wonder', '13 Unique Wonders']));
    expect(ATLAS_EXAMPLE_BY_ID.get('example-heavens-blessing-existing')?.kind).toBe('event-sequence');
    expect(entry('imperial-jade').variants?.map(({ id }) => id)).toEqual(expect.arrayContaining(['imperial-jade-no-chow', 'imperial-jade-western-broader']));
    expect(atlasTreatmentsForEntry(entry('twofold-fortune-bmja')).map(({ referenceId }) => referenceId)).toEqual(['bmja@1.0:twofold-fortune']);
    expect(ATLAS_UNRESOLVED_TREATMENTS.has('outside-the-box@0.1:club-three-great-scholars')).toBe(false);
    expect(ATLAS_UNRESOLVED_TREATMENTS.has('buzzard-2000@0.1:buzzard-three-dragons-winner')).toBe(false);
    expect(entry('three-great-scholars-club-verified').state).toBe('standalone-verified-treatment');
    expect(entry('three-dragons-buzzard-winner-verified').state).toBe('standalone-verified-treatment');
    expect(entry('wriggling-snake-family').variants?.map(({ label }) => label)).toEqual(expect.arrayContaining(['Wriggling Snake', 'Wriggly Snake']));
    expect(entry('pair-hand-family').variants?.map(({ label }) => label)).toEqual(expect.arrayContaining(['All Pair Honours', 'All Pair', 'Heavenly Twins', 'Seven Twins']));
    expect(entry('windy-ones').facets).toContain('hybrid-layout');
    expect(entry('mixed-chow-family-western').variants).toHaveLength(4);
    expect(entry('up-down-you-go-family-western').variants?.flatMap(({ exampleIds }) => exampleIds ?? [])).toEqual(expect.arrayContaining(['example-up-you-go', 'example-down-you-go']));
    expect(atlasTreatmentsForEntry(entry('purity-western-calculated')).map(({ referenceId }) => referenceId)).toEqual(['western-tm@0.1:purity-one-chow']);
    expect(SPECIAL_HANDS_ATLAS.some(({ referenceId }) => referenceId === 'bmja@1.0:purity')).toBe(false);
  });

  it('shows scorer actions only for an existing BMJA example that the exact BMJA treatment accepts', () => {
    expect(specialHandExampleProvesBmjaTreatment('four-blessings', 'bmja@1.0:four-blessings')).toBe(true);
    expect(specialHandExampleProvesBmjaTreatment('four-blessings', 'western-tm@0.1:four-blessings')).toBe(false);
    expect(specialHandExampleProvesBmjaTreatment('four-blessings', 'bmja@1.0:three-great-scholars')).toBe(false);
    expect(specialHandExampleProvesBmjaTreatment('example-up-you-go', 'bmja@1.0:four-blessings')).toBe(false);
  });

  it('materialises every authored generator by validating candidates against the exact canonical runtime predicate', () => {
    const generators = [...ATLAS_EXAMPLE_BY_ID.values()].filter(({ kind }) => kind === 'tile-hand-generator');
    expect(generators).toHaveLength(4);
    for (const example of generators) {
      const hand = materializeAtlasGenerator(example.source.patternId ?? '');
      expect(hand, example.id).toBeDefined();
      expect(detectSpecialHands(hand!, { playerWind: 'east', prevailingWind: 'east', limit: 1000 }, [...specialHandBindingsForCurrentClassicalProfile(WESTERN_TM_PROFILE_REF)]).some(({ id }) => id === example.source.patternId), example.id).toBe(true);
      expect(example.accessibleDescription).toBeTruthy();
    }
  });
});
