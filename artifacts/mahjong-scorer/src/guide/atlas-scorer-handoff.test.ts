import { beforeAll, describe, expect, it } from 'vitest';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { ATLAS_EXAMPLE_BY_ID } from './special-hands-atlas';
import { atlasExampleProvesTreatment, resolveAtlasScorerExample } from './atlas-scorer-handoff';

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('Atlas exact-profile scorer handoff', () => {
  it('validates the Western Imperial Jade Chow variant and loads it into the Western scorer', () => {
    const exampleId = 'example-imperial-jade-western-chow';
    const treatment = 'western-tm@0.1:green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow';
    expect(atlasExampleProvesTreatment(exampleId, treatment)).toBe(true);
    expect(atlasExampleProvesTreatment(exampleId, 'bmja@1.0:imperial-jade')).toBe(false);
    const resolved = resolveAtlasScorerExample(exampleId, 'western', 'green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow');
    expect(resolved?.hand.sets.map(({ kind }) => kind)).toContain('chow');
    expect(resolved?.returnHref).toBe('/special-hands#atlas-entry-imperial-jade');
    expect(resolveAtlasScorerExample(exampleId, 'western', 'imperial-jade')).toBeUndefined();
  });

  it('keeps exact legacy BMJA examples resolvable while validating profile-scoped Four Blessings', () => {
    const example = ATLAS_EXAMPLE_BY_ID.get('example-four-blessings-existing')!;
    expect(atlasExampleProvesTreatment(example.id, 'western-tm@0.1:four-blessings')).toBe(true);
    expect(resolveAtlasScorerExample(example.id, 'western', 'four-blessings')?.hand.sets).toHaveLength(5);
    expect(resolveAtlasScorerExample(example.id, 'buzzard', 'four-blessings')).toBeUndefined();
  });
});
