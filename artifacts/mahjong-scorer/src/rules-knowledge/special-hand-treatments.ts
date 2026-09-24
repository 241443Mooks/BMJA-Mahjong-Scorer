import type { RulesProfileRef } from '../game/types';
import {
  bmjaSpecialHandBindings,
  isFixedSpecialHandBinding,
  type SpecialHandPatternBinding,
} from '../scoring/special-hands';
import { specialHandReferenceHref } from '../guide/special-hand-references';

export type ProfileLocalSpecialHandTreatment = {
  identity: { profile: RulesProfileRef; patternId: string };
  referenceId: string;
  name: string;
  description: string;
  scoreModel: 'fixed' | 'calculated' | 'configured-limit';
  winnerValue?: number;
  fishingValue?: number;
  fishingUsesIntrinsicFloor?: boolean;
  href?: string;
};

const scoreModelFor = (binding: SpecialHandPatternBinding): ProfileLocalSpecialHandTreatment['scoreModel'] =>
  isFixedSpecialHandBinding(binding)
    ? 'fixed'
    : binding.scoreModel.kind;

const treatmentFromBinding = (binding: SpecialHandPatternBinding): ProfileLocalSpecialHandTreatment => ({
  identity: {
    profile: { id: binding.profile.id, version: binding.profile.version },
    patternId: binding.patternId,
  },
  referenceId: `${binding.profile.id}@${binding.profile.version}:${binding.patternId}`,
  name: binding.name,
  description: binding.description,
  scoreModel: scoreModelFor(binding),
  ...(isFixedSpecialHandBinding(binding)
    ? {
        winnerValue: binding.value,
        ...(binding.fishingValue === undefined ? {} : { fishingValue: binding.fishingValue }),
        ...(binding.fishingUsesIntrinsicFloor ? { fishingUsesIntrinsicFloor: true } : {}),
      }
    : {}),
  ...(specialHandReferenceHref(binding.patternId) ? { href: specialHandReferenceHref(binding.patternId) } : {}),
});

export const specialHandTreatmentsForProfile = (
  profile: RulesProfileRef,
  bindings: readonly SpecialHandPatternBinding[] = bmjaSpecialHandBindings,
): ProfileLocalSpecialHandTreatment[] => bindings
  .filter((binding) => binding.profile.id === profile.id && binding.profile.version === profile.version)
  .map(treatmentFromBinding);

export const resolveSpecialHandTreatment = (
  profile: RulesProfileRef,
  patternId: string,
  bindings: readonly SpecialHandPatternBinding[] = bmjaSpecialHandBindings,
): ProfileLocalSpecialHandTreatment | undefined => {
  const binding = bindings.find((item) => item.profile.id === profile.id && item.profile.version === profile.version && item.patternId === patternId);
  return binding ? treatmentFromBinding(binding) : undefined;
};
