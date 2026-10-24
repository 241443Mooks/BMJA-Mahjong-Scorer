import { beforeAll, describe, expect, it } from 'vitest';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { availableReferenceTopics, projectReferenceTopic, referenceTopic, topicDestination } from '../rules-knowledge/reference-topics';
import { referencePublicationPolicy } from '../rules-knowledge/reference-publication';

beforeAll(() => initialiseCurrentRulesRuntimes());
const profile = (slug: string) => PUBLIC_RULES_DESCRIPTORS.find((item) => item.slug === slug)!;

describe('positive exact-profile topic availability', () => {
  it('keeps an applicable concept with guide content distinct from an unpublished or withheld pattern', () => {
    const flowers = projectReferenceTopic(referenceTopic('dimension:tiles.bonus-tiles'), profile('mcr'));
    expect(flowers).toMatchObject({ applicability: 'established', publication: 'not-published', destination: { kind: 'guide', href: '/guide?rules=mcr#fan-and-flowers' } });
    const withheld = projectReferenceTopic(referenceTopic('pattern.thirteen-orphans'), profile('mcr'));
    expect(withheld).toMatchObject({ applicability: 'established', publication: 'withheld' });
    expect(withheld.destination).toBeUndefined();
    const unknown = projectReferenceTopic(referenceTopic('pattern.bmja.wriggling-snake'), profile('mcr'));
    expect(unknown).toMatchObject({ applicability: 'unknown', publication: 'not-published' });
    expect(unknown.destination).toBeUndefined();
  });
  it('only offers relevant published treatments or a useful scoped guide for every current profile', () => {
    const originalPolicy = JSON.stringify(referencePublicationPolicy);
    for (const descriptor of PUBLIC_RULES_DESCRIPTORS) {
      const entries = availableReferenceTopics(descriptor);
      expect(entries.some(({ topic }) => topic.id === 'dimension:scoring.grammar')).toBe(true);
      for (const { applicability, publication, destination } of entries) {
        expect(['established', 'provisional']).toContain(applicability);
        expect(publication).not.toBe('withheld');
        expect(destination.href).toContain(`rules=${descriptor.slug}`);
      }
      if (descriptor.slug !== 'mcr') expect(entries.some(({ topic }) => topic.id === 'pattern.thirteen-orphans')).toBe(true);
      if (descriptor.slug !== 'british') expect(entries.some(({ topic }) => topic.id === 'pattern.bmja.imperial-jade' || topic.id === 'pattern.bmja.wriggling-snake')).toBe(false);
    }
    expect(JSON.stringify(referencePublicationPolicy)).toBe(originalPolicy);
  });
  it('preserves provisional Western ordinary-source status when linking the useful partial guide', () => {
    expect(projectReferenceTopic(referenceTopic('dimension:tiles.bonus-tiles'), profile('western'))).toMatchObject({ applicability: 'provisional', publication: 'not-published', destination: { kind: 'guide', href: '/guide?rules=western#known-rules' } });
    expect(projectReferenceTopic(referenceTopic('dimension:tiles.bonus-tiles'), profile('british')).destination).toEqual({ kind: 'article', href: '/encyclopaedia/flowers-and-seasons?rules=british' });
  });
  it('retains all published canonical articles for neutral discovery and Explore All', () => {
    const entries = availableReferenceTopics(null);
    expect(entries).toHaveLength(5);
    expect(entries.map(({ destination }) => destination.href)).toContain('/encyclopaedia/flowers-and-seasons');
    expect(entries.every(({ destination }) => destination.kind === 'article' && !destination.href.includes('?rules='))).toBe(true);
  });
  it('never turns unknown, withheld or affirmative non-applicability into personalised links', () => {
    for (const applicability of ['unknown', 'not-applicable'] as const) {
      expect(topicDestination({ applicability, publication: 'not-published', guideHref: '/guide' })).toBeUndefined();
    }
    expect(topicDestination({ applicability: 'established', publication: 'withheld', articleHref: '/article', guideHref: '/guide' })).toBeUndefined();
    expect(topicDestination({ applicability: 'established', publication: 'not-published' })).toBeUndefined();
    expect(topicDestination({ applicability: 'established', publication: 'published', articleHref: '/article' })).toEqual({ kind: 'article', href: '/article' });
  });
});
