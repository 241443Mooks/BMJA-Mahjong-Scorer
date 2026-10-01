import type { EvidenceClaim, SourceAuthority, SourceLocator } from '../../rules-platform/truth-model';
import type { RulesProfileRef } from '../../rules-platform/types';
import { currentTruthIndex } from './current';

export type RuntimeBindingRef = { kind: 'binding'; id: string };
export type RuntimeTreatmentExplanation =
  | { available: false }
  | {
      available: true;
      profile: RulesProfileRef;
      subject: { id: string; kind: 'rule' | 'pattern' | 'concept' };
      ruleBasis: string;
      evidenceStatus: EvidenceClaim['status'];
      sources: {
        citation: string;
        authority: SourceAuthority;
        locator: { label: string; url?: string };
      }[];
    };

const unavailable: RuntimeTreatmentExplanation = { available: false };
const sameProfile = (a: RulesProfileRef, b: RulesProfileRef) => a.id === b.id && a.version === b.version;

export const formatSourceLocator = (locator: SourceLocator): string => {
  const page = locator.page ? (/\bp{1,2}\.?\s*\d/i.test(locator.page)
    ? locator.page
    : `${/[–—,-]/.test(locator.page) ? 'pp.' : 'p.'} ${locator.page}`) : undefined;
  switch (locator.kind) {
    case 'publication':
      return [locator.title, locator.edition, locator.section, page].filter(Boolean).join(' · ');
    case 'club-material':
      return [locator.title, locator.section, page].filter(Boolean).join(' · ');
    case 'url':
      return [locator.section, page].filter(Boolean).join(' · ') || locator.url;
    case 'image':
      return [locator.collection, locator.imageId, page].filter(Boolean).join(' · ');
  }
};

/** Resolve only an executable binding treatment authorized by this exact profile. */
export const explainRuntimeTreatment = ({
  profile,
  ref,
}: {
  profile: RulesProfileRef;
  ref: RuntimeBindingRef;
}): RuntimeTreatmentExplanation => {
  const treatments = currentTruthIndex.treatmentsForProfile(profile)
    .map(({ record }) => record)
    .filter((treatment) => treatment.runtimeState.kind === 'executable'
      && treatment.runtimeState.ref.kind === ref.kind
      && treatment.runtimeState.ref.id === ref.id);
  if (treatments.length !== 1) return unavailable;

  const treatment = treatments[0]!;
  const subject = currentTruthIndex.subjectById(treatment.subjectId)?.record;
  if (!subject) return unavailable;

  const authorizedClaims = treatment.evidenceClaimIds.flatMap((claimId) => {
    const claim = currentTruthIndex.claimById(claimId)?.record;
    if (!claim || claim.subjectId !== subject.id || (claim.supportsProfile && !sameProfile(claim.supportsProfile, profile))) return [];
    if (claim.status !== 'verified' && claim.status !== 'verified-club') return [];
    const source = currentTruthIndex.sourceById(claim.sourceId)?.record;
    if (!source || !source.authorityForProfileIds.includes(profile.id)) return [];
    return [{ claim, source }];
  });
  if (authorizedClaims.length === 0) return unavailable;

  return {
    available: true,
    profile: { id: profile.id, version: profile.version },
    subject: { id: subject.id, kind: subject.kind },
    ruleBasis: authorizedClaims.map(({ claim }) => claim.claim).join(' '),
    evidenceStatus: authorizedClaims.every(({ claim }) => claim.status === 'verified') ? 'verified' : 'verified-club',
    sources: authorizedClaims.map(({ claim, source }) => ({
      citation: source.citation,
      authority: source.authority,
      locator: {
        label: formatSourceLocator(claim.locator),
        ...(claim.locator.kind === 'url' ? { url: claim.locator.url } : {}),
      },
    })),
  };
};
