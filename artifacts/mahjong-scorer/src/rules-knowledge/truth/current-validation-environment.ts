import { specialHandBindingsForCurrentClassicalProfile } from '../current-classical-special-hand-bindings';
import { currentPlayableResolverEnvironment } from '../../rules-platform/current-profiles';
import type { RuntimeTreatmentRef } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import type { TruthValidationEnvironment } from './integrity';

/** Family-specific joins live at the edge; the truth validator only sees this family-neutral adapter. */
export const currentTruthValidationEnvironment: TruthValidationEnvironment = {
  profileExists: (profile: RulesProfileRef) => currentPlayableResolverEnvironment.profiles.get(profile) !== undefined,
  runtimeTreatmentExists: (profile: RulesProfileRef, ref: RuntimeTreatmentRef) => {
    if (ref.kind === 'binding') {
      return specialHandBindingsForCurrentClassicalProfile(profile).some((binding) =>
        binding.profile.id === profile.id
        && binding.profile.version === profile.version
        && binding.patternId === ref.id);
    }
    return false;
  },
};
