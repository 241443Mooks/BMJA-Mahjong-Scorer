import type { JsonObject, ScoringGrammarId } from './types';
import type { RegistryCategory, RegistryStatus } from './registry';

export type AuthoringDimension =
  | 'membership-binding' | 'score-selector' | 'incident-liability' | 'hand-mode'
  | 'progression' | 'table-limit' | 'bonus-tile-presence' | 'grammar-bonus';

export type CapabilityMetadata = {
  id: string;
  category: RegistryCategory;
  bindingId?: string;
  compatibleGrammars?: readonly ScoringGrammarId[];
  compatibleFamilyIds?: readonly string[];
  customisation: 'customisable' | 'locked';
  parameterSchemaId?: string;
  valueSchemaId?: string;
  requires?: readonly string[];
  conflicts?: readonly string[];
  evidenceIds?: readonly string[];
  status: RegistryStatus;
  semanticRevision?: number;
  presentation: { presentationKey: string; group?: string; advanced?: boolean };
  provenance?: { sourceId: string; locator?: string; metadata?: JsonObject };
  authoringDimensions: readonly AuthoringDimension[];
};

/** Small, closed presentation discovery vocabulary for the current runtimes. */
export type CurrentCapabilityId =
  | 'hand.standing-hand' | 'hand.only-possible-winning-tile' | 'hand.winning-event-evidence'
  | 'context.east-thirteenth-consecutive-mahjong' | 'table.buzzard-profile-results'
  | 'table.buzzard-dangerous-discard' | 'table.buzzard-false-mah-jong'
  | 'table.incorrect-hand' | 'table.configurable-limit' | 'table.round-incidents' | 'hand.goulash';

export const CURRENT_CAPABILITY_METADATA: Readonly<Record<CurrentCapabilityId, Pick<CapabilityMetadata, 'id' | 'presentation'>>> = Object.freeze({
  'hand.standing-hand': { id: 'hand.standing-hand', presentation: { presentationKey: 'standing-hand' } },
  'hand.only-possible-winning-tile': { id: 'hand.only-possible-winning-tile', presentation: { presentationKey: 'only-possible-winning-tile' } },
  'hand.winning-event-evidence': { id: 'hand.winning-event-evidence', presentation: { presentationKey: 'winning-event-evidence' } },
  'context.east-thirteenth-consecutive-mahjong': { id: 'context.east-thirteenth-consecutive-mahjong', presentation: { presentationKey: 'east-thirteenth' } },
  'table.buzzard-profile-results': { id: 'table.buzzard-profile-results', presentation: { presentationKey: 'buzzard-profile-results' } },
  'table.buzzard-dangerous-discard': { id: 'table.buzzard-dangerous-discard', presentation: { presentationKey: 'buzzard-dangerous-discard' } },
  'table.buzzard-false-mah-jong': { id: 'table.buzzard-false-mah-jong', presentation: { presentationKey: 'buzzard-false-mah-jong' } },
  'table.incorrect-hand': { id: 'table.incorrect-hand', presentation: { presentationKey: 'incorrect-hand' } },
  'table.configurable-limit': { id: 'table.configurable-limit', presentation: { presentationKey: 'table-limit' } },
  'table.round-incidents': { id: 'table.round-incidents', presentation: { presentationKey: 'round-incidents' } },
  'hand.goulash': { id: 'hand.goulash', presentation: { presentationKey: 'goulash' } },
});

export function decisionTraceIdentities(metadata: CapabilityMetadata, reasonId: string, policyId?: string) {
  return {
    ruleId: metadata.id,
    bindingId: metadata.bindingId,
    policyId,
    reasonId,
    sourceId: metadata.provenance?.sourceId,
  };
}
