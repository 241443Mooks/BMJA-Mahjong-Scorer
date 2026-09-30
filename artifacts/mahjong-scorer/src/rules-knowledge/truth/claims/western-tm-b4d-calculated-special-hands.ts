import type { EvidenceClaim } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const profile = { id: 'western-tm', version: '0.1' } as const;
const sourceId = 'tm-companion';
const title = 'Thompson & Maloney, The Mah Jong Player’s Companion';
const claim = (record: EvidenceClaim) => versioned(record.claimId, record);

export const westernTmB4dSpecialHandClaims = [
  claim({
    claimId: 'evidence.pattern.western-tm.purity-one-chow',
    subjectId: 'pattern.western-tm.purity-one-chow', sourceId,
    locator: { kind: 'publication', title, year: 1997, page: 'detail p. 48; calculated synopsis entry, pp. 58–59' },
    status: 'verified',
    claim: 'Purity is a calculated one-suit hand of four Pungs/Kongs and a pair, with one Chow permitted in place of a Pung/Kong. Its one-dot marker supports represented Pung/Kong exposure at half score. The cited Companion evidence does not resolve exposed-Chow eligibility or fishing.',
    checkedOn: '2026-09-30', supportsProfile: profile,
  }),
  claim({
    claimId: 'evidence.pattern.western-tm.honours-and-one-suit-terminals-pung-kong-hand',
    subjectId: 'pattern.western-tm.honours-and-one-suit-terminals-pung-kong-hand', sourceId,
    locator: { kind: 'publication', title, year: 1997, page: 'detail p. 44; Full Synopsis p. 58' },
    status: 'verified',
    claim: 'All Honour Hand is calculated: four Pungs/Kongs and a pair use honours, with 1s/9s permitted from at most one suit. Its one-dot marker halves the ordinary calculated score when a represented Pung/Kong is exposed. No fishing value is specified here.',
    checkedOn: '2026-09-30', supportsProfile: profile,
  }),
  claim({
    claimId: 'evidence.pattern.western-tm.one-suit-with-honours-mostly-pung-kong-hand',
    subjectId: 'pattern.western-tm.one-suit-with-honours-mostly-pung-kong-hand', sourceId,
    locator: { kind: 'publication', title, year: 1997, page: 'detail p. 42; Full Synopsis p. 59' },
    status: 'verified',
    claim: 'Ordinary Mah Jong is a calculated catalogue hand with one suited family and optional Winds/Dragons, four Pung/Kong melds or three Pung/Kong melds and one Chow, plus a pair. Its one-dot marker permits exposed Pung/Kong melds at half score and does not mark a Chow as permitted exposure. No fishing value is specified here.',
    checkedOn: '2026-09-30', supportsProfile: profile,
  }),
];
