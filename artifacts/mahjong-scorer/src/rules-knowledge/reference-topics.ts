import type { RulesDescriptor } from '../game/rules-presentation';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import type { RulesProfileRef } from '../game/types';
import { ATLAS_LEARNER_ENTRIES, SPECIAL_HANDS_ATLAS } from '../guide/special-hands-atlas';
import { projectLearningContent, sameReaderProfile } from '../guide/reader-content';
import type { RulesDimensionId } from '../rules-platform/profile-dimensions';
import { referenceTreatmentsForConcept, type ReferenceConceptId } from './reference-crosswalk';
import { projectPublicConcept, referencePublicationPolicy, type ReferencePublicationPolicy } from './reference-publication';
import { explainBritishFlowersAndSeasons } from './truth/explain-british-flowers-seasons';

export type ReferenceTopic = {
  id: string;
  href: string;
  title: string;
  summary: string;
  knowledge: { kind: 'concept'; conceptId: ReferenceConceptId; entryId: string }
    | { kind: 'dimension'; dimensionId: RulesDimensionId; article?: { profile: RulesProfileRef; available: () => boolean } };
};
const handTopic = (href: string, conceptId: string, entryId: string, summary: string): ReferenceTopic => ({
  id: conceptId, href, summary, title: ATLAS_LEARNER_ENTRIES.find(({ id }) => id === entryId)!.displayName,
  knowledge: { kind: 'concept', conceptId, entryId },
});
export const FLOWERS_REFERENCE_TOPIC = {
  id: 'dimension:tiles.bonus-tiles', href: '/encyclopaedia/flowers-and-seasons', title: 'Flowers and Seasons',
  summary: 'The eight bonus tiles and how British Mahjong scores them.',
  knowledge: { kind: 'dimension', dimensionId: 'tiles.bonus-tiles', article: { profile: BMJA_PROFILE_REF, available: () => explainBritishFlowersAndSeasons(BMJA_PROFILE_REF).available } },
} satisfies ReferenceTopic;
/** Published destinations, not a second database of rules or a future category taxonomy. */
export const PUBLIC_REFERENCE_TOPICS: readonly ReferenceTopic[] = [
  FLOWERS_REFERENCE_TOPIC,
  handTopic('/encyclopaedia/thirteen-orphans', 'pattern.thirteen-orphans', 'thirteen-unique-wonders', 'A special hand using every terminal and honour tile type, with one tile repeated.'),
  handTopic('/encyclopaedia/imperial-jade', 'pattern.bmja.imperial-jade', 'imperial-jade', 'A green-tile hand whose permitted groups vary by ruleset.'),
  handTopic('/encyclopaedia/wriggling-snake', 'pattern.bmja.wriggling-snake', 'wriggling-snake-family', 'A special hand built from one suit and all four Winds; the repeated tile can vary by ruleset.'),
  { id: 'dimension:scoring.grammar', href: '/encyclopaedia/scoring-systems', title: 'Mahjong scoring systems', summary: 'A plain-language guide to how the listed rulesets build an ordinary hand’s score.', knowledge: { kind: 'dimension', dimensionId: 'scoring.grammar' } },
];
export const PUBLIC_CONCEPT_ROUTES: Readonly<Record<string, ReferenceConceptId>> = Object.fromEntries(PUBLIC_REFERENCE_TOPICS.flatMap(({ href, knowledge }) => knowledge.kind === 'concept' ? [[href, knowledge.conceptId]] : []));
export const referenceTopic = (id: string) => PUBLIC_REFERENCE_TOPICS.find((topic) => topic.id === id)!;
export function referenceTopicEntry(topic: ReferenceTopic) {
  const knowledge = topic.knowledge;
  return knowledge.kind === 'concept' ? ATLAS_LEARNER_ENTRIES.find(({ id }) => id === knowledge.entryId) : undefined;
}

export type TopicApplicability = 'established' | 'provisional' | 'not-applicable' | 'unknown';
export type TopicPublication = 'published' | 'not-published' | 'withheld';
export type TopicDestination = { kind: 'article' | 'guide'; href: string };
/** Absence of a lesson is never evidence of absence of the concept. */
export function topicDestination({ applicability, publication, articleHref, guideHref }: {
  applicability: TopicApplicability; publication: TopicPublication; articleHref?: string; guideHref?: string;
}): TopicDestination | undefined {
  if (applicability === 'not-applicable' || applicability === 'unknown' || publication === 'withheld') return undefined;
  if (publication === 'published' && articleHref) return { kind: 'article', href: articleHref };
  return guideHref ? { kind: 'guide', href: guideHref } : undefined;
}

/** The existing guide manifest identifies useful destinations; it owns no new rule facts. */
export function learningTopicDestination(descriptor: RulesDescriptor, dimensionId: RulesDimensionId) {
  const content = projectLearningContent(descriptor, 'scoring');
  const teaching = content.capability?.teaching?.find((item) => item.dimensions?.includes(dimensionId));
  if (teaching?.id) return `/guide?rules=${descriptor.slug}#${teaching.id}`;
  if (content.capability?.lessons.scoring === 'established-british') return `/guide?rules=${descriptor.slug}${dimensionId === 'tiles.bonus-tiles' ? '#matching-bonus-tiles' : '#ordinary-scoring'}`;
  if (content.rows.some((row) => row.dimensionId === dimensionId && row.sourceStatus !== 'source-unknown' && row.sourceStatus !== 'not-applicable')) return `/guide?rules=${descriptor.slug}#known-rules`;
  return undefined;
}
export function projectReferenceTopic(topic: ReferenceTopic, descriptor: RulesDescriptor, policy: ReferencePublicationPolicy = referencePublicationPolicy) {
  let applicability: TopicApplicability = 'unknown';
  let publication: TopicPublication = 'not-published';
  let guideHref: string | undefined;
  if (topic.knowledge.kind === 'concept') {
    const { conceptId } = topic.knowledge;
    const candidates = referenceTreatmentsForConcept(conceptId).filter(({ record }) => sameReaderProfile(record.profile, descriptor.profile));
    const released = projectPublicConcept({ conceptId, policy, presentTreatment: (treatment) => SPECIAL_HANDS_ATLAS.find(({ referenceId }) => referenceId === treatment.treatmentId) });
    const available = released?.treatments.some(({ profile }) => sameReaderProfile(profile, descriptor.profile));
    if (candidates.length) applicability = 'established';
    publication = available ? 'published' : policy.concepts[conceptId] === 'withheld' || candidates.some(({ record }) => policy.treatments[record.treatmentId] === 'withheld') ? 'withheld' : 'not-published';
  } else {
    const { dimensionId, article } = topic.knowledge;
    guideHref = learningTopicDestination(descriptor, dimensionId);
    const content = projectLearningContent(descriptor, 'scoring');
    const row = content.rows.find((item) => item.dimensionId === dimensionId);
    if (guideHref) applicability = row?.sourceStatus === 'source-provisional' ? 'provisional' : 'established';
    if (article) {
      if (sameReaderProfile(article.profile, descriptor.profile) && article.available()) { publication = 'published'; applicability = 'established'; }
    } else if (guideHref) publication = 'published';
  }
  const articleHref = `${topic.href}?rules=${descriptor.slug}`;
  return { topic, applicability, publication, destination: topicDestination({ applicability, publication, articleHref, guideHref }) };
}
/** One projection shared by discovery, article scope and future search indexing. */
export function referenceTopicProfiles(topic: ReferenceTopic) {
  return PUBLIC_RULES_DESCRIPTORS.filter((descriptor) => projectReferenceTopic(topic, descriptor).destination?.kind === 'article');
}
export function availableReferenceTopics(descriptor: RulesDescriptor | null) {
  if (descriptor) return PUBLIC_REFERENCE_TOPICS.flatMap((topic) => {
    const coverage = projectReferenceTopic(topic, descriptor);
    return coverage.destination ? [{ ...coverage, destination: coverage.destination }] : [];
  });
  return PUBLIC_REFERENCE_TOPICS.flatMap((topic) => referenceTopicProfiles(topic).length ? [{ topic, applicability: 'established' as const, publication: 'published' as const, destination: { kind: 'article' as const, href: topic.href } }] : []);
}

export const hasPublishedSpecialHands = (profile: RulesProfileRef) => SPECIAL_HANDS_ATLAS.some(({ identity }) => sameReaderProfile(identity.profile, profile));
