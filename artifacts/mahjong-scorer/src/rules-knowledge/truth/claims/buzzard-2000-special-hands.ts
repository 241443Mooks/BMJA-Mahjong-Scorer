import type { EvidenceClaim } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const profile = { id: 'buzzard-2000', version: '0.1' } as const;
const sourceId = 'buzzard-2000-classical';
const snapshot = 'Buzzard 2000 Classical rules, retained original source snapshot';
const locator = (section: string, page = '11') => ({
  kind: 'publication' as const,
  title: snapshot,
  year: 2000,
  page,
  section,
});
const claim = (record: EvidenceClaim) => versioned(record.claimId, record);

export const buzzard2000SpecialHandClaims = [
  claim({ claimId: 'evidence.pattern.buzzard-2000.all-winds-and-dragons', subjectId: 'pattern.buzzard-2000.all-winds-and-dragons', sourceId, locator: locator('The following ten hands are Limit Hands — all Winds and Dragons (item 1)'), status: 'verified', claim: 'Buzzard lists All Winds and Dragons as a limit hand made from four Pungs or Kongs and a pair, with every playing tile a Wind or Dragon.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.three-winds-and-fourth-wind-pair', subjectId: 'pattern.buzzard-2000.three-winds-and-fourth-wind-pair', sourceId, locator: locator('The following ten hands are Limit Hands — three Winds and pair of the fourth, plus any final set (item 2)'), status: 'verified', claim: 'Buzzard lists a limit hand containing Pungs or Kongs of three distinct Winds, a pair of the fourth Wind, and any final set.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.original-hand', subjectId: 'pattern.buzzard-2000.original-hand', sourceId, locator: locator('The following ten hands are Limit Hands — Original Hand (item 3)'), status: 'verified', claim: 'For Buzzard, the Original Hand limit is an East win immediately from the original fourteen dealt tiles, with no bonus tiles.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.easts-first-discard', subjectId: 'pattern.buzzard-2000.easts-first-discard', sourceId, locator: locator('The following ten hands are Limit Hands — winning with East Wind’s first discard (item 4)'), status: 'verified', claim: 'Buzzard lists winning on East Wind’s first discard as a limit hand; the winner is a player other than East.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.all-ones-and-nines', subjectId: 'pattern.buzzard-2000.all-ones-and-nines', sourceId, locator: locator('The following ten hands are Limit Hands — all Ones and Nines (item 5)'), status: 'verified', claim: 'Buzzard lists All Ones and Nines as four Pungs or Kongs and a pair made only from suited rank 1 and rank 9 tiles; Winds and Dragons are excluded.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.three-dragons-winner', subjectId: 'pattern.buzzard-2000.three-dragons-winner', sourceId, locator: locator('The following ten hands are Limit Hands — Pungs/Kongs of at least three Dragons (item 6); incomplete non-winner exception, pp. 11–12', '11–12'), status: 'verified', claim: 'Buzzard lists a complete winning hand with Pungs or Kongs of at least three Dragons as a limit hand. The separate incomplete non-winner Three-Dragon result is not this winner binding or treatment.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.calling-nine-tile-hand', subjectId: 'pattern.buzzard-2000.calling-nine-tile-hand', sourceId, locator: locator('The following ten hands are Limit Hands — Calling Nine Tile Hand (item 9); 20 September 2026 source clarification'), status: 'verified', claim: 'Buzzard’s Calling Nine Tile Hand uses one suit and the thirteen-tile base 1112345678999; any added tile of that suit, rank 1 through 9, completes the limit hand.', checkedOn: '2026-09-29', supportsProfile: profile }),
  claim({ claimId: 'evidence.pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong', subjectId: 'pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong', sourceId, locator: locator('The following ten hands are Limit Hands — East Wind’s thirteenth consecutive Mahjong (item 10)'), status: 'verified', claim: 'Buzzard lists East Wind’s thirteenth consecutive Mahjong as a limit result. The qualifying consecutive-win history is supplied by table/history context; this is not a structural tile pattern.', checkedOn: '2026-09-29', supportsProfile: profile }),
];
