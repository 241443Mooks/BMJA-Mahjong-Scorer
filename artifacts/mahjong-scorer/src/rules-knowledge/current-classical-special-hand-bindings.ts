import type { RulesProfileRef } from '../game/types';
import { BUZZARD_2000_PROFILE_REF, buzzard2000SpecialHandBindings } from '../game/buzzard-2000';
import { OUTSIDE_THE_BOX_PROFILE_REF, outsideTheBoxSpecialHandBindings } from '../game/outside-the-box-catalogue';
import { WESTERN_TM_PROFILE_REF, westernTmSpecialHandBindings } from '../game/western-tm-catalogue';
import { BMJA_PROFILE_REF } from '../game/ruleset';
import { bmjaSpecialHandBindings, type SpecialHandPatternBinding } from '../scoring/special-hands';

const profileKey = ({ id, version }: RulesProfileRef) => `${id}@${version}`;

const CURRENT_CLASSICAL_SPECIAL_HAND_BINDINGS = new Map<string, readonly SpecialHandPatternBinding[]>([
  [profileKey(BMJA_PROFILE_REF), bmjaSpecialHandBindings],
  [profileKey(WESTERN_TM_PROFILE_REF), westernTmSpecialHandBindings],
  [profileKey(OUTSIDE_THE_BOX_PROFILE_REF), outsideTheBoxSpecialHandBindings],
  [profileKey(BUZZARD_2000_PROFILE_REF), buzzard2000SpecialHandBindings],
]);

/** Returns the authoritative executable special-hand bindings for an exact current Classical profile. */
export const specialHandBindingsForCurrentClassicalProfile = (
  profile: RulesProfileRef,
): readonly SpecialHandPatternBinding[] =>
  CURRENT_CLASSICAL_SPECIAL_HAND_BINDINGS.get(profileKey(profile)) ?? [];
