import type { HandScoreResult, RulesProfileRef } from '../rules-platform/types';
import { explainRuntimeTreatment, type RuntimeTreatmentExplanation } from '../rules-knowledge/truth';

export type RuntimeExplanationItem = {
  bindingId: string;
  explanation: RuntimeTreatmentExplanation;
};

/** Read special-hand bindings from the score result's stable runtime trace. */
export const matchedClassicalBindingIds = (result: HandScoreResult): string[] => {
  if (result.grammar !== 'classical-points-doubles') return [];
  return [...new Set(result.decisionTrace.flatMap((entry) =>
    entry.kind === 'count' && entry.id.startsWith('special:') && entry.identities.bindingId
      ? [entry.identities.bindingId]
      : []))];
};

/** Resolve recorded runtime identities under the exact profile that scored them. */
export const explanationsForBindings = (
  profile: RulesProfileRef,
  bindingIds: readonly string[],
): RuntimeExplanationItem[] => bindingIds.flatMap((bindingId) => {
  const explanation = explainRuntimeTreatment({ profile, ref: { kind: 'binding', id: bindingId } });
  return explanation.available ? [{ bindingId, explanation }] : [];
});
