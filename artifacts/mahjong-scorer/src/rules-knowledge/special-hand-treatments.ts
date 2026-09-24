import type { RulesProfileRef } from '../game/types';
import {
  isFixedSpecialHandBinding,
  type SpecialHandPatternBinding,
} from '../scoring/special-hands';
import { specialHandReferenceHref } from '../guide/special-hand-references';
import { specialHandBindingsForCurrentClassicalProfile } from './current-classical-special-hand-bindings';

type ExposurePolicy =
  | { scoreModel: 'fixed'; policy: NonNullable<Extract<SpecialHandPatternBinding, { value: number }>['exposure']> }
  | { scoreModel: 'calculated'; policy: NonNullable<Extract<SpecialHandPatternBinding, { scoreModel: { kind: 'calculated' } }>['scoreModel']['exposure']> };

export type ProfileLocalSpecialHandTreatment = {
  identity: { profile: RulesProfileRef; patternId: string };
  referenceId: string;
  name: string;
  description: string;
  scoreModel: 'fixed' | 'calculated' | 'configured-limit';
  winnerValue?: number;
  fishingValue?: number;
  fishingUsesIntrinsicFloor?: boolean;
  winningMethods?: NonNullable<SpecialHandPatternBinding['winningMethods']>;
  exposurePolicy?: ExposurePolicy;
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
  ...(binding.winningMethods === undefined ? {} : { winningMethods: [...binding.winningMethods] }),
  ...(isFixedSpecialHandBinding(binding) && binding.exposure !== undefined
    ? { exposurePolicy: { scoreModel: 'fixed' as const, policy: binding.exposure } }
    : {}),
  ...(binding.scoreModel?.kind === 'calculated' && binding.scoreModel.exposure !== undefined
    ? { exposurePolicy: { scoreModel: 'calculated' as const, policy: binding.scoreModel.exposure } }
    : {}),
  ...(isFixedSpecialHandBinding(binding)
    ? {
        winnerValue: binding.value,
        ...(binding.fishingValue === undefined ? {} : { fishingValue: binding.fishingValue }),
        ...(binding.fishingUsesIntrinsicFloor ? { fishingUsesIntrinsicFloor: true } : {}),
      }
    : {}),
  ...(binding.profile.id === 'bmja' && binding.profile.version === '1.0' && specialHandReferenceHref(binding.patternId)
    ? { href: specialHandReferenceHref(binding.patternId) }
    : {}),
});

export const specialHandTreatmentsForProfile = (
  profile: RulesProfileRef,
): ProfileLocalSpecialHandTreatment[] => specialHandBindingsForCurrentClassicalProfile(profile)
  .map(treatmentFromBinding);

export const resolveSpecialHandTreatment = (
  profile: RulesProfileRef,
  patternId: string,
): ProfileLocalSpecialHandTreatment | undefined => {
  const binding = specialHandBindingsForCurrentClassicalProfile(profile)
    .find((item) => item.profile.id === profile.id && item.profile.version === profile.version && item.patternId === patternId);
  return binding ? treatmentFromBinding(binding) : undefined;
};
