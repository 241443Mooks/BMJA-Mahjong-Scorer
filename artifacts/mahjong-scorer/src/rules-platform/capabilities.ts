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

export function decisionTraceIdentities(metadata: CapabilityMetadata, reasonId: string, policyId?: string) {
  return {
    ruleId: metadata.id,
    bindingId: metadata.bindingId,
    policyId,
    reasonId,
    sourceId: metadata.provenance?.sourceId,
  };
}
