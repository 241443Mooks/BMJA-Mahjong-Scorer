import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PUBLIC_RULES_DESCRIPTORS, type RulesDescriptor } from './game/rules-presentation';
import { currentPlayableResolverEnvironment } from './rules-platform/current-profiles';
import { resolvePlayableProfile } from './rules-platform/resolver';
import { compileRulesRuntime } from './rules-platform/classical-runtime';
import * as runtimes from './rules-platform/current-runtime-registry';
import { projectProfileDimensions } from './rules-platform/profile-dimensions';
import type { ProfileAuthoringDefinition } from './rules-platform/types';
import { RulesHubPage, RulesProfilePage } from './rules/RulesReference';
import { ExactProfileComparator, comparatorProfiles, comparisonState } from './home/ExactProfileComparator';
import { projectPublicConcept } from './rules-knowledge/reference-publication';
import { PublicTreatmentCard } from './rules-knowledge/PublicReferencePage';
import { PartialLearningContent } from './guide/ProfileLearningPage';
import { projectLearningContent, readerSurfaceLinks, type ReaderContentCapability } from './guide/reader-content';

beforeAll(() => runtimes.initialiseCurrentRulesRuntimes());
afterEach(() => vi.restoreAllMocks());

describe('new-profile acceptance through common templates', () => {
  it('attaches a resolved synthetic registry entry and reviewed records without five bespoke pages', async () => {
    const profile = { id: 'synthetic-reader-fixture', version: '1.0' };
    const definition: ProfileAuthoringDefinition = {
      kind: 'derived', schemaVersion: 1,
      identity: { ...profile, name: 'Synthetic reader fixture', status: 'custom' },
      baseProfile: { id: 'bmja', version: '1.0' }, overrides: {},
    };
    const artifact = await resolvePlayableProfile(profile, {
      ...currentPlayableResolverEnvironment,
      profiles: { get: (ref) => ref.id === profile.id && ref.version === profile.version ? definition : currentPlayableResolverEnvironment.profiles.get(ref) },
    });
    const compiled: runtimes.CurrentCompiledRulesRuntime = { grammar: 'classical-points-doubles', artifact, runtime: compileRulesRuntime(artifact) };
    const resolveOriginal = runtimes.getCurrentCompiledRulesRuntime;
    vi.spyOn(runtimes, 'getCurrentCompiledRulesRuntime').mockImplementation((ref) => ref.id === profile.id && ref.version === profile.version ? compiled : resolveOriginal(ref));
    const descriptor: RulesDescriptor = {
      ...PUBLIC_RULES_DESCRIPTORS[0], profile, slug: 'synthetic-reader', title: 'Synthetic reader fixture', shortLabel: 'Synthetic reader', compactLabel: 'Synthetic reader',
      description: 'Synthetic source-backed acceptance fixture; not a public profile.',
      support: { scorer: 'Fixture compiled', source: 'Synthetic reviewed source', implementation: 'Provisional', authority: 'Synthetic acceptance evidence' },
    };
    const registry = [...PUBLIC_RULES_DESCRIPTORS, descriptor];
    const hub = renderToStaticMarkup(<RulesHubPage registry={registry} />);
    expect(hub).toContain('value="synthetic-reader"');
    expect(hub).toContain('Other supported rules');
    const reference = renderToStaticMarkup(<RulesProfilePage slug={descriptor.slug} descriptor={descriptor} />);
    expect(reference).toContain('Synthetic reader fixture');
    expect(reference).toContain('Players and tiles');
    expect(reference).toContain('/guide?rules=synthetic-reader');
    expect(reference).toContain('not currently covered');
    expect(comparatorProfiles(registry).find(({ ref }) => ref.id === profile.id)?.slug).toBe(descriptor.slug);
    expect(renderToStaticMarkup(<ExactProfileComparator registry={registry} />)).toContain('value="synthetic-reader-fixture@1.0"');
    const rows = projectProfileDimensions(artifact);
    const british = projectProfileDimensions(resolveOriginal({ id: 'bmja', version: '1.0' }).artifact);
    expect(comparisonState(rows.find(({ dimensionId }) => dimensionId === 'table.player-count')!, british.find(({ dimensionId }) => dimensionId === 'table.player-count')!)).toBe('needs-checking');
    expect(rows.every(({ sourceStatus }) => sourceStatus !== 'source-verified')).toBe(true);
    const reviewed: ReaderContentCapability = {
      profile, lessons: { gameplay: 'partial', scoring: 'partial' }, dimensions: { gameplay: ['table.player-count'], scoring: ['scoring.grammar'] },
      teaching: [{ title: 'Fixture lesson', text: 'Synthetic teaching reviewed only for this fixture.', sourceHref: '/evidence/synthetic-fixture' }],
    };
    for (const topic of ['gameplay', 'scoring'] as const) {
      const content = projectLearningContent(descriptor, topic, [reviewed]);
      const lesson = renderToStaticMarkup(<PartialLearningContent descriptor={descriptor} topic={topic} content={content} />);
      expect(lesson).toContain('Fixture lesson');
      expect(lesson).toContain('partial guide');
      expect(lesson).toContain('/evidence/synthetic-fixture');
      expect(lesson).not.toContain('at most one Chow');
      expect(lesson).not.toContain('20 points');
      expect(content.rows).toEqual([]); // Inheritance alone never certifies a teaching fact.
    }
    const missing = projectLearningContent(descriptor, 'scoring', []);
    const gap = renderToStaticMarkup(<PartialLearningContent descriptor={descriptor} topic="scoring" content={missing} />);
    expect(gap).toContain('Teaching material is not currently covered');
    expect(gap).not.toContain('Fixture lesson');
    expect(projectLearningContent({ ...descriptor, profile: { ...profile, version: 'old' } }, 'gameplay', [reviewed]).rows).toEqual([]);
    const treatment = { profile, treatmentId: `${profile.id}@${profile.version}:fixture-concept` };
    const presentation = { name: 'Fixture concept', profile: descriptor.title, value: 'Synthetic source value', description: 'Synthetic exact-profile treatment', scorerHref: `/hand?rules=${descriptor.slug}` };
    const policy = { concepts: { 'pattern.thirteen-orphans': 'publishable' as const }, profiles: {}, relationships: {}, treatments: { [treatment.treatmentId]: 'publishable' as const } };
    const topic = projectPublicConcept({ conceptId: 'pattern.thirteen-orphans', treatments: [treatment], policy, relationships: [], presentTreatment: () => presentation });
    expect(topic?.treatments).toHaveLength(1);
    const card = renderToStaticMarkup(<PublicTreatmentCard treatmentId={topic!.treatments[0].treatmentId} presentation={topic!.treatments[0].presentation} />);
    expect(card).toContain('Synthetic exact-profile treatment');
    expect(card).toContain('/hand?rules=synthetic-reader');
    expect(projectPublicConcept({ conceptId: 'pattern.thirteen-orphans', treatments: [treatment], policy: { ...policy, treatments: {} }, relationships: [], presentTreatment: () => presentation })?.treatments).toEqual([]);
    expect(readerSurfaceLinks(descriptor)).toEqual({ reference: '/rules/synthetic-reader', gameplay: '/gameplay-basics?rules=synthetic-reader', scoring: '/guide?rules=synthetic-reader', specialHands: '/special-hands?rules=synthetic-reader', encyclopaedia: '/encyclopaedia?rules=synthetic-reader' });
  });
});
