import { PUBLIC_RULES_DESCRIPTORS, type PublicRulesSlug, type RulesDescriptor } from '../game/rules-presentation';

export type MahjongFamilyId = 'classical-western' | 'hong-kong' | 'riichi' | 'mcr' | 'american';

export type MahjongFamilyPresentation = {
  id: MahjongFamilyId;
  name: string;
  clue: string;
  supportedProfileSlugs: readonly PublicRulesSlug[];
};

/** Broad recognition copy for public pages; this does not define scoring or profile identity. */
export const MAHJONG_FAMILIES: readonly MahjongFamilyPresentation[] = [
  {
    id: 'classical-western',
    name: 'British / Western Classical',
    clue: 'Points, doubles, limits or named special hands shape the score.',
    supportedProfileSlugs: ['club', 'british', 'buzzard', 'western'],
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong / Cantonese-style',
    clue: 'Your table talks about faan/fan and usually allows multiple Chows.',
    supportedProfileSlugs: [],
  },
  {
    id: 'riichi',
    name: 'Japanese Riichi',
    clue: 'You hear yaku, han, fu, dora, furiten and Riichi.',
    supportedProfileSlugs: [],
  },
  {
    id: 'mcr',
    name: 'Chinese Official / MCR',
    clue: 'A large standard fan catalogue and an 8-point minimum guide winning hands.',
    supportedProfileSlugs: ['mcr'],
  },
  {
    id: 'american',
    name: 'American / NMJL-style',
    clue: 'Jokers, the Charleston and a changing annual card point to this style.',
    supportedProfileSlugs: [],
  },
];

export const supportedProfilesForFamily = (family: MahjongFamilyPresentation): RulesDescriptor[] =>
  family.supportedProfileSlugs
    .map((slug) => PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === slug))
    .filter((descriptor): descriptor is RulesDescriptor => Boolean(descriptor?.availability.rulesReference))
    .sort((left, right) => right.editionYear - left.editionYear);
