import type { EvidenceClaim } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const url = 'https://mahjongbritishrules.wordpress.com/scoring/special-hands/';
const sourceRows = [
  ['knitting', 'Knitting', 'The source documents BMJA Knitting as seven pairs formed from matching numbers in two suits, with no Winds or Dragons.'],
  ['triple-knitting', 'Triple knitting', 'The source documents BMJA Triple Knitting as four matching-number triplets across three suits and a matching-number pair.'],
  ['all-pair-honours', 'All pair honours', 'The source documents BMJA All Pair Honours as seven pairs of 1s, 9s, Winds or Dragons.'],
  ['imperial-jade', 'Imperial jade', 'The source documents BMJA Imperial Jade using only Green Dragons and the specified green Bamboo tiles.'],
  ['gates-of-heaven', 'The Gates of heaven', 'The source documents BMJA The Gates of Heaven as a concealed one-suit hand with a pung of 1s, a pung of 9s and a paired 2-to-8 run.'],
  ['wriggling-snake', 'The wriggling snake', 'The source documents BMJA The Wriggling Snake as a pair of 1s, a 2-to-9 run in that suit and one of each Wind.'],
  ['all-winds-and-dragons', 'All Winds and Dragons', 'The source documents BMJA All Winds and Dragons as Pungs or Kongs of Winds or Dragons and a Wind or Dragon pair, with no Suit tiles.'],
  ['heads-and-tails', 'Heads and tails', 'The source documents BMJA Heads and Tails using Pungs or Kongs of 1s and 9s.'],
  ['fourfold-plenty', 'Fourfold plenty', 'The source documents BMJA Fourfold Plenty as four Kongs and a pair.'],
  ['three-great-scholars', 'Three great scholars', 'The source documents BMJA Three Great Scholars as a Pung or Kong of each Dragon, another Pung or Kong, and any pair.'],
  ['four-blessings', 'Four blessings hovering over the door', 'The source documents BMJA Four Blessings Hovering over the Door as a Pung or Kong of each Wind and any pair.'],
  ['buried-treasure', 'Buried treasure', 'The source documents BMJA Buried Treasure as concealed Pungs and a pair using one suit and optionally Winds or Dragons.'],
  ['heavens-blessing', 'Heaven’s blessing', 'The source documents BMJA Heaven’s Blessing as East making Mah-Jong immediately with the original fourteen dealt tiles.'],
  ['earths-blessing', 'Earth’s blessing', 'The source documents BMJA Earth’s Blessing as a non-East player making Mah-Jong with East’s first discard.'],
  ['gathering-plum-blossom', 'Gathering the plum blossom from the roof', 'The source documents BMJA Gathering the Plum Blossom from the Roof as Mah-Jong completed by drawing the 5 Circles as a loose replacement tile.'],
  ['plucking-moon', 'Plucking the moon from the bottom of the Sea', 'The source documents BMJA Plucking the Moon from the Bottom of the Sea as Mah-Jong completed by drawing the 1 Circles as the last wall tile.'],
  ['twofold-fortune', 'Twofold fortune', 'The source documents BMJA Twofold Fortune as a Kong replacement enabling another Kong whose replacement enables Mah-Jong.'],
] as const;

const evidenceClaims = sourceRows.map(([slug, section, claim]) => {
  const subjectId = `pattern.bmja.${slug === 'four-blessings' ? 'four-blessings-hovering-over-the-door' : slug === 'gathering-plum-blossom' ? 'gathering-plum-blossom-from-the-roof' : slug === 'plucking-moon' ? 'plucking-moon-from-bottom-of-the-sea' : slug}`;
  const claimId = `evidence.pattern.bmja.${slug}`;
  const record: EvidenceClaim = {
    claimId,
    subjectId,
    sourceId: 'bmja-special-hands',
    locator: { kind: 'url', url, section },
    status: 'verified',
    claim,
    checkedOn: '2026-09-29',
    supportsProfile: { id: 'bmja', version: '1.0' },
  };
  return versioned(claimId, record);
});

export const bmjaSpecialHandClaims = evidenceClaims;
