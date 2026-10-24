import type { RulesProfileRef } from '../game/types';
import { PUBLIC_RULES_DESCRIPTORS, type RulesDescriptor } from '../game/rules-presentation';
import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import { projectProfileDimensions, type RulesDimensionId } from '../rules-platform/profile-dimensions';

export type LearningTopic = 'gameplay' | 'scoring';
export type ReaderContentCapability = {
  profile: RulesProfileRef;
  lessons: Record<LearningTopic, 'established-british' | 'partial'>;
  /** Reviewed vocabulary, never rule values. Facts come from the shared projection. */
  dimensions: Record<LearningTopic, readonly RulesDimensionId[]>;
  teaching?: readonly { title: string; text: string; sourceHref: string }[];
};
const gameplay: readonly RulesDimensionId[] = ['table.player-count', 'table.seat-model', 'tiles.physical-set', 'hand.structural-size', 'hand.normal-winning-shape', 'play.ordinary-chow-policy', 'play.exposure-model', 'round.draw-follow-up', 'progression.dealer-retention', 'progression.seat-rotation'];
const scoring: readonly RulesDimensionId[] = ['scoring.grammar', 'scoring.ordinary-base', 'scoring.winner-base-bonus', 'scoring.multiplier-bonus-policy', 'scoring.limit-cap', 'tiles.bonus-tiles', 'ready.model', 'ready.fishing-score', 'settlement.winner-payments', 'settlement.loser-to-loser', 'settlement.dealer-multiplier'];
const partial = (profile: RulesProfileRef): ReaderContentCapability => ({ profile, lessons: { gameplay: 'partial', scoring: 'partial' }, dimensions: { gameplay, scoring } });
/** Accepted MCR reference teaching, shared by the reference page and scoped guides. */
export const MCR_READER_TEACHING = [
    { title: 'Fan and qualifying to win', text: 'A winning hand must first reach the 8-point minimum from qualifying fan patterns. Flowers are added only after that qualification. Settlement uses the accepted Basic Points.', sourceHref: '/rules/mcr' },
    { title: 'Recording physical play', text: 'The scorer evaluates completed winning hands using fan. The Table Companion records resolved table and end-of-hand facts; it does not arbitrate physical play.', sourceHref: '/rules/mcr' },
  ] as const;
/** Content availability is an editorial declaration, separate from runtime availability.
 * The existing British lessons are retained; other profiles expose scoped source/scorer
 * projections, not a claim that a full physical-play lesson has been reviewed.
 */
export const READER_CONTENT_CAPABILITIES: readonly ReaderContentCapability[] = [
  { ...partial({ id: 'bmja', version: '1.0' }), lessons: { gameplay: 'established-british', scoring: 'established-british' } },
  partial({ id: 'outside-the-box', version: '0.1' }),
  partial({ id: 'buzzard-2000', version: '0.1' }),
  partial({ id: 'western-tm', version: '0.1' }),
  { ...partial({ id: 'mcr-wmo-2006', version: '0.1' }), teaching: MCR_READER_TEACHING },
];
export const sameReaderProfile = (a: RulesProfileRef, b: RulesProfileRef) => a.id === b.id && a.version === b.version;
export function readerContentCapability(profile: RulesProfileRef, records = READER_CONTENT_CAPABILITIES) {
  return records.find((record) => sameReaderProfile(record.profile, profile));
}
export function projectLearningContent(descriptor: RulesDescriptor, topic: LearningTopic, records = READER_CONTENT_CAPABILITIES, resolve = getCurrentCompiledRulesRuntime) {
  const capability = readerContentCapability(descriptor.profile, records);
  if (!capability) return { capability, rows: [] };
  const artifact = resolve(descriptor.profile).artifact;
  if (!sameReaderProfile(artifact.profile.identity, descriptor.profile)) throw new Error('Reader content requires an exact resolved profile');
  const values = projectProfileDimensions(artifact);
  // Only translated, scoped answers can enter the lesson; raw policy IDs cannot become prose.
  const rows = capability.dimensions[topic].flatMap((id) => {
    const row = values.find(({ dimensionId }) => dimensionId === id);
    return row?.playerAnswer && row.value.status !== 'unknown' ? [row] : [];
  });
  return { capability, rows };
}
/** All surface links come from a single exact descriptor; no profile-specific page list. */
export function readerSurfaceLinks(descriptor: RulesDescriptor) {
  const query = `?rules=${descriptor.slug}`;
  return { reference: `/rules/${descriptor.slug}`, gameplay: `/gameplay-basics${query}`, scoring: `/guide${query}`, specialHands: `/special-hands${query}`, encyclopaedia: `/encyclopaedia${query}` };
}
export const readerProfiles = (registry: readonly RulesDescriptor[] = PUBLIC_RULES_DESCRIPTORS) => registry.filter(({ publiclySelectable }) => publiclySelectable);
