import { bmjaSpecialHandBindings } from '../scoring';
import { OUTSIDE_THE_BOX_PROFILE_REF, outsideTheBoxSpecialHandBindings } from './outside-the-box-catalogue';
import { BMJA_PROFILE_REF } from './ruleset';
import { WESTERN_TM_PROFILE_REF, westernTmSpecialHandBindings } from './western-tm-catalogue';
import type { RulesProfileRef } from './types';
import type { HandMode } from './types';

export type PublicRulesSlug = 'british' | 'western' | 'club';

export type RulesDescriptor = {
  profile: RulesProfileRef;
  slug: PublicRulesSlug;
  title: string;
  compactLabel: string;
  status: string;
  description: string;
  publiclySelectable: true;
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
    title: 'Club rules',
    compactLabel: 'Club rules',
    status: 'Configured club profile',
    description: 'A configured club profile with its own specials, Goulash and incident handling.',
    publiclySelectable: true,
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
]);

export const descriptorForRulesProfile = (profile: RulesProfileRef): RulesDescriptor => {
  const descriptor = PUBLIC_RULES_DESCRIPTORS.find((candidate) => sameProfile(candidate.profile, profile));
  if (!descriptor) throw new Error(`No public descriptor for rules profile ${profile.id}@${profile.version}.`);
  return descriptor;
};

export const descriptorForSlug = (slug: PublicRulesSlug): RulesDescriptor =>
  PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === slug)!;

export const isConfiguredClubProfile = (profile: RulesProfileRef) =>
  descriptorForRulesProfile(profile).configuredClubProfile;

export const isBritishRulesProfile = (profile: RulesProfileRef) =>
  sameProfile(profile, BMJA_PROFILE_REF);

export const normaliseStandaloneHandMode = (profile: RulesProfileRef, handMode: HandMode): HandMode =>
  isConfiguredClubProfile(profile) ? handMode : 'normal';

export const publicRulesSlugFromGamePath = (path: string): PublicRulesSlug =>
  path === '/game/western' ? 'western' : path === '/game/club' ? 'club' : 'british';
