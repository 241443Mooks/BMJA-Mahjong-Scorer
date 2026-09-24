import { PUBLIC_RULES_DESCRIPTORS, descriptorForRulesProfile } from '../game/rules-presentation';
import type { RulesProfileRef } from '../game/types';
import { specialHandBindingsForCurrentClassicalProfile } from '../rules-knowledge/current-classical-special-hand-bindings';
import { specialHandTreatmentsForProfile, type ProfileLocalSpecialHandTreatment } from '../rules-knowledge/special-hand-treatments';

export const CLASSICAL_ATLAS_PROFILES = PUBLIC_RULES_DESCRIPTORS
  .filter(({ profile }) => specialHandBindingsForCurrentClassicalProfile(profile).length > 0)
  .map(({ profile }) => profile);

export type SpecialHandsAtlasRecord = ProfileLocalSpecialHandTreatment & {
  profileTitle: string;
  profileLabel: string;
};

export const SPECIAL_HANDS_ATLAS: readonly SpecialHandsAtlasRecord[] = Object.freeze(
  CLASSICAL_ATLAS_PROFILES.flatMap((profile) => {
    const descriptor = descriptorForRulesProfile(profile);
    return specialHandTreatmentsForProfile(profile).map((treatment) => ({
      ...treatment,
      profileTitle: descriptor.title,
      profileLabel: descriptor.compactLabel,
    }));
  }),
);

export function atlasScoreLabel(record: SpecialHandsAtlasRecord): string {
  if (record.scoreModel === 'calculated') return 'Calculated under this profile';
  if (record.scoreModel === 'configured-limit') return 'Configured/table limit';
  const winner = new Intl.NumberFormat('en-GB').format(record.winnerValue!);
  return `Fixed · ${winner} winner${record.fishingValue === undefined ? '' : ` · ${new Intl.NumberFormat('en-GB').format(record.fishingValue)} fishing${record.fishingUsesIntrinsicFloor ? ' or intrinsic if greater' : ''}`}`;
}

export function searchSpecialHandsAtlas(records: readonly SpecialHandsAtlasRecord[], query: string): SpecialHandsAtlasRecord[] {
  const normalized = query.trim().toLocaleLowerCase('en-GB');
  if (!normalized) return [...records];
  const ranked = records.flatMap((record, index) => {
    const name = record.name.toLocaleLowerCase('en-GB');
    const title = `${record.profileTitle} ${record.profileLabel}`.toLocaleLowerCase('en-GB');
    const description = record.description.toLocaleLowerCase('en-GB');
    const pattern = record.identity.patternId.toLocaleLowerCase('en-GB');
    const rank = name === normalized ? 0
      : name.startsWith(normalized) ? 1
        : name.includes(normalized) ? 2
          : title.includes(normalized) ? 3
            : description.includes(normalized) ? 4
              : pattern.includes(normalized) ? 5
                : -1;
    return rank < 0 ? [] : [{ record, rank, index }];
  });
  return ranked.sort((a, b) => a.rank - b.rank || a.index - b.index).map(({ record }) => record);
}

export function filterSpecialHandsAtlasByProfile(
  records: readonly SpecialHandsAtlasRecord[],
  profile: RulesProfileRef | null,
): SpecialHandsAtlasRecord[] {
  return profile ? records.filter(({ identity }) => identity.profile.id === profile.id && identity.profile.version === profile.version) : [...records];
}

export function atlasBrowseRecords(
  records: readonly SpecialHandsAtlasRecord[],
  preferredProfile: RulesProfileRef | null,
  mode: 'my-rules' | 'all-rules',
  profileFilter: RulesProfileRef | null,
): SpecialHandsAtlasRecord[] {
  const myRulesProfile = mode === 'my-rules' && preferredProfile && CLASSICAL_ATLAS_PROFILES.some(
    ({ id, version }) => id === preferredProfile.id && version === preferredProfile.version,
  ) ? preferredProfile : null;
  return filterSpecialHandsAtlasByProfile(records, myRulesProfile ?? (mode === 'all-rules' ? profileFilter : null));
}
