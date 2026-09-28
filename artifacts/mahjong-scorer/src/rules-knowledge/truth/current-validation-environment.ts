import { specialHandBindingsForCurrentClassicalProfile } from '../current-classical-special-hand-bindings';
import { currentPlayableResolverEnvironment } from '../../rules-platform/current-profiles';
import type { RuntimeTreatmentRef } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import type { TruthValidationEnvironment } from './integrity';
import { mcrTruthValidationEnvironment } from './mcr-validation-environment';

/** Family-specific joins live at the edge; the truth validator only sees this family-neutral adapter. */
export const currentTruthValidationEnvironment: TruthValidationEnvironment = {
  profileExists: (profile: RulesProfileRef) => currentPlayableResolverEnvironment.profiles.get(profile) !== undefined
    || mcrTruthValidationEnvironment.profileExists(profile),
  runtimeTreatmentExists: (profile: RulesProfileRef, ref: RuntimeTreatmentRef) => {
    if (ref.kind === 'binding') {
      const classicalBinding = specialHandBindingsForCurrentClassicalProfile(profile).some((binding) =>
        binding.profile.id === profile.id
        && binding.profile.version === profile.version
        && binding.patternId === ref.id);
      return classicalBinding || mcrTruthValidationEnvironment.runtimeTreatmentExists(profile, ref);
    }
    return mcrTruthValidationEnvironment.runtimeTreatmentExists(profile, ref);
  },
};
