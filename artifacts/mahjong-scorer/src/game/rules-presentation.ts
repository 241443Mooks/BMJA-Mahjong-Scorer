import { bmjaSpecialHandBindings } from '../scoring';
import { OUTSIDE_THE_BOX_PROFILE_REF, outsideTheBoxSpecialHandBindings } from './outside-the-box-catalogue';
import { BMJA_PROFILE_REF } from './ruleset';
import { WESTERN_TM_PROFILE_REF, westernTmSpecialHandBindings } from './western-tm-catalogue';
import { BUZZARD_2000_PROFILE_REF, buzzard2000SpecialHandBindings } from './buzzard-2000';
import { getCurrentRulesRuntime } from '../rules-platform/current-runtime-registry';
import type { HandMode } from './types';
import type { RulesProfileRef } from './types';

export type PublicRulesSlug = 'british' | 'western' | 'club' | 'buzzard' | 'mcr';

export type RulesDescriptor = {
  profile: RulesProfileRef;
  slug: PublicRulesSlug;
  title: string;
  compactLabel: string;
  status: string;
  description: string;
  publiclySelectable: true;
  availability: { handScorer: boolean; gameTracker: boolean; rulesReference: boolean };
  configuredClubProfile: boolean;
  referenceKeys: readonly string[];
  atAGlance: readonly string[];
  support: {
    scorer: string;
    source: string;
    implementation: string;
    authority: string;
  };
};

const sameProfile = (left: RulesProfileRef, right: RulesProfileRef) =>
  left.id === right.id && left.version === right.version;

const catalogueCount = (bindings: readonly unknown[]) =>
  `${bindings.length} supported special-hand ${bindings.length === 1 ? 'pattern' : 'patterns'}`;

export const PUBLIC_RULES_DESCRIPTORS: readonly RulesDescriptor[] = Object.freeze([
  {
    profile: BMJA_PROFILE_REF,
    slug: 'british',
    title: 'British / BMJA-style',
    compactLabel: 'British / BMJA-style',
    status: 'Stable',
    description: 'The established British scorer and settlement model.',
    publiclySelectable: true,
    availability: { handScorer: true, gameTracker: true, rulesReference: true },
    configuredClubProfile: false,
    referenceKeys: ['british-scoring', 'british-settlement'],
    atAGlance: [catalogueCount(bmjaSpecialHandBindings), 'British settlement and game progression', 'Normal hand play'],
    support: {
      scorer: 'Available',
      source: 'Verified for the British / BMJA-style scorer baseline',
      implementation: 'Stable',
      authority: 'BMJA-approved British rules reference',
    },
  },
  {
    profile: WESTERN_TM_PROFILE_REF,
    slug: 'western',
    title: 'Western — Thompson & Maloney',
    compactLabel: 'Western — T&M',
    status: 'Scorer available. Special-hand catalogue source-verified; ordinary play is still under source review.',
    description: 'A selectable Western profile with its own source-verified special-hand catalogue.',
    publiclySelectable: true,
    availability: { handScorer: true, gameTracker: true, rulesReference: true },
    configuredClubProfile: false,
    referenceKeys: ['western-special-hands', 'western-ordinary-play-status'],
    atAGlance: [catalogueCount(westernTmSpecialHandBindings), 'Ordinary play and settlement remain provisional while source review continues', 'Normal hand play'],
    support: {
      scorer: 'Available',
      source: 'Companion special-hand catalogue source-verified; ordinary rules under source review',
      implementation: 'Provisional',
      authority: 'Thompson & Maloney Western references',
    },
  },
  {
    profile: OUTSIDE_THE_BOX_PROFILE_REF,
    slug: 'club',
    title: 'Club - Bramhall 2026',
    compactLabel: 'Club - Bramhall 2026',
    status: 'Configured club profile',
    description: 'A configured club profile with its own specials, Goulash and incident handling.',
    publiclySelectable: true,
    availability: { handScorer: true, gameTracker: true, rulesReference: true },
    configuredClubProfile: true,
    referenceKeys: ['club-special-hands', 'club-goulash', 'club-incidents'],
    atAGlance: [catalogueCount(outsideTheBoxSpecialHandBindings), 'Draws lead to a Goulash hand with physical blank tiles', 'Club incidents and liability are recorded at the table'],
    support: {
      scorer: 'Available',
      source: 'Configured local profile',
      implementation: 'Configured',
      authority: 'A local club rules profile',
    },
  },
  {
    profile: BUZZARD_2000_PROFILE_REF,
    slug: 'buzzard',
    title: 'British/Western Classical — Buzzard 2000',
    compactLabel: 'Buzzard 2000',
    status: 'Provisional, source-backed profile',
    description: 'A source-specific British/Western Classical profile with Buzzard table procedures.',
    publiclySelectable: true,
    availability: { handScorer: true, gameTracker: true, rulesReference: true },
    configuredClubProfile: false,
    referenceKeys: ['buzzard-2000'],
    atAGlance: [catalogueCount(buzzard2000SpecialHandBindings), 'Buzzard table incidents and configured limit', 'Source-specific Classical profile'],
    support: { scorer: 'Available', source: 'Buzzard 2000 evidence record', implementation: 'Provisional', authority: 'Buzzard 2000 source material' },
  },
  {
    profile: { id: 'mcr-wmo-2006', version: '0.1' }, slug: 'mcr',
    title: 'MCR / WMO 2006', compactLabel: 'MCR / WMO 2006', status: 'Provisional',
    description: 'Provisional MCR / WMO 2006 fan scoring for completed winning hands and Table Companion game tracking.',
    publiclySelectable: true, availability: { handScorer: true, gameTracker: true, rulesReference: true }, configuredClubProfile: false,
    referenceKeys: ['source.mcr-ema-green-book-2006'], atAGlance: ['8-point qualifying minimum before Flowers', 'Flowers are post-qualification', 'Winning-hand scoring and Table Companion game tracking available'],
    support: { scorer: 'Winning-hand scorer and Table Companion game tracking available', source: 'source.mcr-ema-green-book-2006 · 2006 MCR/EMA Green Book', implementation: 'Provisional', authority: 'Mahjong Competition Rules / WMO 2006' },
  },
]);

export const descriptorForRulesProfile = (profile: RulesProfileRef): RulesDescriptor => {
  const descriptor = PUBLIC_RULES_DESCRIPTORS.find((candidate) => sameProfile(candidate.profile, profile));
  if (!descriptor) throw new Error(`No public descriptor for rules profile ${profile.id}@${profile.version}.`);
  return descriptor;
};

export const descriptorForSlug = (slug: PublicRulesSlug): RulesDescriptor =>
  PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === slug)!;

export const isBritishRulesProfile = (profile: RulesProfileRef) =>
  sameProfile(profile, BMJA_PROFILE_REF);

/** Compatibility seam backed by the resolved runtime, never presentation data. */
export const currentClassicalScorerDefaultLimit = (profile: RulesProfileRef) =>
  getCurrentRulesRuntime(profile).defaultTableLimit;

export const normaliseStandaloneHandMode = (profile: RulesProfileRef, handMode: HandMode): HandMode =>
  getCurrentRulesRuntime(profile).supportedCapabilities().includes('hand.goulash') ? handMode : 'normal';

export const publicRulesSlugFromGamePath = (path: string): PublicRulesSlug | undefined => {
  if (path === '/game') return PUBLIC_RULES_DESCRIPTORS.find(({ slug, availability }) => slug === 'british' && availability.gameTracker)?.slug;
  const match = /^\/game\/([^/]+)$/.exec(path);
  if (!match) return undefined;
  return PUBLIC_RULES_DESCRIPTORS.find(({ slug, availability }) => slug === match[1] && availability.gameTracker)?.slug;
};

export const canonicalPublicGamePath = (path: string): '/game' | undefined =>
  publicRulesSlugFromGamePath(path) ? '/game' : undefined;

export const publicGamePathForRulesProfile = (profile: RulesProfileRef): string | undefined => {
  const descriptor = PUBLIC_RULES_DESCRIPTORS.find((candidate) => sameProfile(candidate.profile, profile) && candidate.availability.gameTracker);
  return descriptor ? `/game/${descriptor.slug}` : undefined;
};
