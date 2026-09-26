import { PUBLIC_RULES_DESCRIPTORS, descriptorForRulesProfile, publicRulesDescriptorsNewestFirst } from '../game/rules-presentation';
import type { RulesProfileRef } from '../game/types';
import content from './atlas-v02-content.json';
import { specialHandBindingsForCurrentClassicalProfile } from '../rules-knowledge/current-classical-special-hand-bindings';
import { specialHandTreatmentsForProfile, type ProfileLocalSpecialHandTreatment } from '../rules-knowledge/special-hand-treatments';

export const CLASSICAL_ATLAS_PROFILES = PUBLIC_RULES_DESCRIPTORS
  .filter(({ profile }) => specialHandBindingsForCurrentClassicalProfile(profile).length > 0)
  .map(({ profile }) => profile);

export const CLASSICAL_ATLAS_DISPLAY_PROFILES = publicRulesDescriptorsNewestFirst()
  .filter(({ profile }) => specialHandBindingsForCurrentClassicalProfile(profile).length > 0)
  .map(({ profile }) => profile);

export type SpecialHandsAtlasRecord = ProfileLocalSpecialHandTreatment & {
  profileTitle: string;
  profileLabel: string;
};

export type AtlasLearnerEntry = {
  id: string;
  state: 'reviewed-concept' | 'reviewed-family-topic' | 'standalone-verified-treatment' | 'standalone-unresolved';
  displayName: string;
  treatmentReferenceIds: string[];
  facets?: string[];
  summary: string;
  whatItIs: string;
  whatItMeans: string;
  whySpecial: string;
  howItWorks?: string[];
  exampleIds?: string[];
  localNames?: string[];
  variants?: Array<{ id: string; label: string; treatmentReferenceIds?: string[]; exampleIds?: string[]; definition?: string; [key: string]: unknown }>;
  treatmentTeaching?: Array<{ referenceId: string; difference: string }>;
  relatedEntryIds?: string[];
  referenceNote?: string;
  watchOutFor?: string[];
  evidenceBindings?: Array<{ kind: string; path: string; locator: string; supports: string[]; status: string }>;
  [key: string]: unknown;
};

export type AtlasExample = {
  id: string;
  kind: 'tile-hand' | 'event-sequence' | 'tile-hand-generator';
  source: { type: string; id?: string; patternId?: string; constraints?: string[]; groups?: Array<{ kind: string; tile?: string; tiles?: string[] }>; looseTiles?: string[]; looseGroups?: string[][]; pairs?: string[]; [key: string]: unknown };
  scope: string;
  visibleExplanation: string;
  accessibleDescription: string;
  steps?: string[];
  referenceNote?: string;
  [key: string]: unknown;
};

type AtlasRuntimeContent = {
  entries: AtlasLearnerEntry[];
  examples: AtlasExample[];
  facetDefinitions: Record<string, string>;
  treatmentOwnership: Record<string, string>;
  unresolvedTreatmentReferenceIds: string[];
  existingScorerExampleIds: string[];
};

const atlasContent = content as AtlasRuntimeContent;

export const ATLAS_LEARNER_ENTRIES: readonly AtlasLearnerEntry[] = Object.freeze(atlasContent.entries);
export const ATLAS_LEARNER_EXAMPLES: readonly AtlasExample[] = Object.freeze(atlasContent.examples);
export const ATLAS_FACET_DEFINITIONS = atlasContent.facetDefinitions;
export const ATLAS_TREATMENT_OWNERSHIP = atlasContent.treatmentOwnership;
export const ATLAS_UNRESOLVED_TREATMENTS = new Set(atlasContent.unresolvedTreatmentReferenceIds);
export const ATLAS_EXISTING_SCORER_EXAMPLES = new Set(atlasContent.existingScorerExampleIds);
export const ATLAS_EXAMPLE_BY_ID = new Map(ATLAS_LEARNER_EXAMPLES.map((example) => [example.id, example]));

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

const treatmentByReference = new Map(SPECIAL_HANDS_ATLAS.map((record) => [record.referenceId, record]));
export const atlasTreatmentsForEntry = (entry: AtlasLearnerEntry): SpecialHandsAtlasRecord[] =>
  entry.treatmentReferenceIds.flatMap((referenceId) => {
    const record = treatmentByReference.get(referenceId);
    return record ? [record] : [];
  });

export function atlasExamplesForTreatment(entry: AtlasLearnerEntry, referenceId: string): AtlasExample[] {
  const matchingVariants = (entry.variants ?? []).filter(({ treatmentReferenceIds }) => treatmentReferenceIds?.includes(referenceId));
  const ids = matchingVariants.length ? matchingVariants.flatMap(({ exampleIds }) => exampleIds ?? []) : entry.exampleIds ?? [];
  return [...new Set(ids)].flatMap((id) => {
    const example = ATLAS_EXAMPLE_BY_ID.get(id);
    return example ? [example] : [];
  });
}

export function selectAtlasLeadExample(
  entry: AtlasLearnerEntry,
  preferredProfile: RulesProfileRef | null,
): { example: AtlasExample; variantLabel?: string } | undefined {
  const variants = entry.variants ?? [];
  if (preferredProfile) {
    const treatment = atlasTreatmentsForEntry(entry).find(({ identity }) =>
      identity.profile.id === preferredProfile.id && identity.profile.version === preferredProfile.version);
    const variant = treatment && variants.find(({ treatmentReferenceIds }) => treatmentReferenceIds?.includes(treatment.referenceId));
    const treatmentExample = variant?.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((example) => !!example);
    if (treatmentExample) return { example: treatmentExample, variantLabel: variant?.label };
  }

  const sharedExample = entry.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((example) => !!example);
  if (sharedExample) return { example: sharedExample };

  for (const variant of variants) {
    const example = variant.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((item) => !!item);
    if (example) return { example, variantLabel: variant.label };
  }
  return undefined;
}

/** Resolve the lead visual from the exact selected treatment so same-profile variants cannot borrow one another's examples. */
export function selectAtlasLeadExampleForTreatment(
  entry: AtlasLearnerEntry,
  referenceId: string,
): { example: AtlasExample; variantLabel?: string } | undefined {
  const exactVariant = entry.variants?.find(({ treatmentReferenceIds }) => treatmentReferenceIds?.includes(referenceId));
  if (exactVariant) {
    const example = exactVariant.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((item) => !!item);
    if (example) return { example, variantLabel: exactVariant.label };
    const sharedExample = entry.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((item) => !!item);
    return sharedExample ? { example: sharedExample } : undefined;
  }

  const selected = treatmentByReference.get(referenceId);
  if (entry.variants?.some(({ treatmentReferenceIds }) => treatmentReferenceIds?.some((id) => {
    const variantTreatment = treatmentByReference.get(id);
    return !!selected && !!variantTreatment &&
      variantTreatment.identity.profile.id === selected.identity.profile.id &&
      variantTreatment.identity.profile.version === selected.identity.profile.version;
  }))) {
    const sharedExample = entry.exampleIds?.map((id) => ATLAS_EXAMPLE_BY_ID.get(id)).find((item) => !!item);
    return sharedExample ? { example: sharedExample } : undefined;
  }

  return selectAtlasLeadExample(entry, selected?.identity.profile ?? null);
}

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
    const pattern = `${record.identity.profile.id}@${record.identity.profile.version}:${record.identity.patternId}`.toLocaleLowerCase('en-GB');
    const rank = name === normalized ? 0
      : name.startsWith(normalized) ? 1
        : name.includes(normalized) ? 2
          : title.includes(normalized) ? 3
            : pattern.includes(normalized) ? 4
              : description.includes(normalized) ? 5
                : -1;
    return rank < 0 ? [] : [{ record, rank, index }];
  });
  return ranked.sort((a, b) => a.rank - b.rank || a.index - b.index).map(({ record }) => record);
}

const exactProfileMatches = (record: SpecialHandsAtlasRecord, profile: RulesProfileRef) =>
  record.identity.profile.id === profile.id && record.identity.profile.version === profile.version;

export function filterSpecialHandsAtlasByProfile(
  records: readonly SpecialHandsAtlasRecord[],
  profile: RulesProfileRef | null,
): SpecialHandsAtlasRecord[] {
  return profile ? records.filter((record) => exactProfileMatches(record, profile)) : [...records];
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

export function searchAtlasLearnerEntries(entries: readonly AtlasLearnerEntry[], query: string): AtlasLearnerEntry[] {
  const normalized = query.trim().toLocaleLowerCase('en-GB');
  if (!normalized) return [...entries];
  const ranked = entries.flatMap((entry, index) => {
    const treatments = atlasTreatmentsForEntry(entry);
    const names = [entry.displayName, ...(entry.localNames ?? []), ...(entry.variants ?? []).flatMap((variant) => [variant.label, ...((variant.localNames as string[] | undefined) ?? [])])];
    const aliases = names.map((name) => name.toLocaleLowerCase('en-GB'));
    const localTreatmentNames = treatments.map(({ name, referenceId, profileTitle, profileLabel }) => `${name} ${referenceId} ${profileTitle} ${profileLabel}`.toLocaleLowerCase('en-GB'));
    const descriptions = [entry.summary, entry.whatItIs, entry.whatItMeans, entry.whySpecial, ...(entry.facets ?? [])]
      .map((value) => value.toLocaleLowerCase('en-GB'));
    const examples = (entry.exampleIds ?? []).flatMap((id) => {
      const example = ATLAS_EXAMPLE_BY_ID.get(id);
      return example ? [example.visibleExplanation, example.accessibleDescription].map((value) => value.toLocaleLowerCase('en-GB')) : [];
    });
    const exactName = aliases.includes(normalized) || treatments.some(({ name }) => name.toLocaleLowerCase('en-GB') === normalized);
    const startsName = aliases.some((name) => name.startsWith(normalized)) || treatments.some(({ name }) => name.toLocaleLowerCase('en-GB').startsWith(normalized));
    const rank = exactName ? 0
      : startsName ? 1
        : aliases.some((name) => name.includes(normalized)) ? 2
          : localTreatmentNames.some((name) => name.includes(normalized)) ? 3
            : descriptions.some((value) => value.includes(normalized)) || examples.some((value) => value.includes(normalized)) ? 4
              : -1;
    return rank < 0 ? [] : [{ entry, rank, index }];
  });
  const exactMatches = ranked.filter(({ rank }) => rank === 0);
  return (exactMatches.length ? exactMatches : ranked).sort((a, b) => a.rank - b.rank || a.index - b.index).map(({ entry }) => entry);
}

export function filterAtlasEntriesByFacets(entries: readonly AtlasLearnerEntry[], selectedFacets: readonly string[]): AtlasLearnerEntry[] {
  if (selectedFacets.length === 0) return [...entries];
  const selected = new Set(selectedFacets);
  return entries.filter((entry) => (entry.facets ?? []).some((facet) => selected.has(facet)));
}

export function atlasEntriesForProfile(entries: readonly AtlasLearnerEntry[], profile: RulesProfileRef | null): AtlasLearnerEntry[] {
  if (!profile) return [...entries];
  return entries.filter((entry) => atlasTreatmentsForEntry(entry).some((record) => exactProfileMatches(record, profile)));
}

export type AtlasSearchFilterState<Mode extends string = 'my-rules' | 'all-rules'> = {
  mode: Mode;
  query: string;
  profileFilter: string;
};

/** Reset search and exact-profile filtering while retaining the selected browse mode. */
export function clearAtlasSearchAndProfileFilter<Mode extends string>(state: AtlasSearchFilterState<Mode>): AtlasSearchFilterState<Mode> {
  return { ...state, query: '', profileFilter: 'all' };
}
