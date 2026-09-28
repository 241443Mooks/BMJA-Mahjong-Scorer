import { MCR_2006_FAN_BINDINGS } from '../../rules-platform/mcr-detectors';
import { MCR_2006_SCORING_IDENTITIES } from '../../rules-platform/mcr-scoring';
import { MCR_WMO_2006_PROFILE, mcrProfileResolverEnvironment } from '../../rules-platform/mcr-profile';
import { categoryForId } from '../../rules-platform/registry';
import type { RuntimeTreatmentRef } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import type { TruthValidationEnvironment } from './integrity';

const exactProfile = (profile: RulesProfileRef) => mcrProfileResolverEnvironment.profiles.get(profile);

/** MCR-specific runtime joins stay at the adapter edge; corpus validation remains family-neutral. */
export const mcrTruthValidationEnvironment: TruthValidationEnvironment = {
  profileExists: (profile) => exactProfile(profile) !== undefined,
  runtimeTreatmentExists: (profile, ref: RuntimeTreatmentRef) => {
    const resolved = exactProfile(profile);
    if (!resolved) return false;
    if (ref.kind === 'binding') return MCR_2006_FAN_BINDINGS.some(({ id }) => id === ref.id);
    if (ref.kind !== 'policy') return false;
    const scoring = (MCR_WMO_2006_PROFILE as unknown as { definition: { scoring: { grammar: string; config: Record<string, unknown> } } }).definition.scoring;
    if (scoring.grammar !== 'pattern-accumulator') return false;
    const configuredPolicyIds = [scoring.config.interactionPolicyId, scoring.config.qualificationPolicyId];
    if (!configuredPolicyIds.includes(ref.id)) return false;
    const identity = Object.values(MCR_2006_SCORING_IDENTITIES).find(({ id }) => id === ref.id);
    if (!identity) return false;
    try {
      const entry = mcrProfileResolverEnvironment.registry.requireExecutable(categoryForId(ref.id), ref.id);
      return entry.semanticRevision === identity.semanticRevision;
    } catch {
      return false;
    }
  },
};
