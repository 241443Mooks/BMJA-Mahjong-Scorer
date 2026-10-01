import type { EvidenceClaim } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const sourceId = 'source.mcr-ema-green-book-2006';
const supportsProfile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const claim = (record: EvidenceClaim) => versioned(record.claimId, record);
const greenBook = (section: string) => ({ kind: 'publication' as const, title: 'Mahjong Competition Rules (2006), European Mahjong Association (EMA) English edition', edition: '2006', year: 2006, section });

export const mcrE4ProfileClaims = [
  claim({ claimId: 'evidence.rule.mcr-e4-permitted-winning-structures', subjectId: 'rule.mcr-e4-permitted-winning-structures', sourceId, locator: greenBook('§3.7.2'), status: 'verified', claim: 'A scoreable MCR Hu must conform to one of the winning structures permitted by the 2006 rules.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-basic-points-from-lawful-fan', subjectId: 'rule.mcr-e4-basic-points-from-lawful-fan', sourceId, locator: greenBook('§3.9.1(2), §3.9.1(5)'), status: 'verified', claim: 'Basic Points are determined from the fan lawfully counted under the MCR counting principles.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-discard-win-settlement', subjectId: 'rule.mcr-e4-discard-win-settlement', sourceId, locator: greenBook('§3.9.1(2)–(3)'), status: 'verified', claim: 'For a discard win with accepted Basic Points B, the discarder pays the winner 8 + B and each other nonwinner pays the winner 8.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-self-draw-settlement', subjectId: 'rule.mcr-e4-self-draw-settlement', sourceId, locator: greenBook('§3.9.1(2)–(3)'), status: 'verified', claim: 'For a self-drawn win with accepted Basic Points B, each nonwinner pays the winner 8 + B.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-dealer-always-passes', subjectId: 'rule.mcr-e4-dealer-always-passes', sourceId, locator: greenBook('§3.4.8'), status: 'verified', claim: 'After a hand is completed, the dealer passes the dice to the right whether or not the dealer won.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-four-dealer-positions-complete-round', subjectId: 'rule.mcr-e4-four-dealer-positions-complete-round', sourceId, locator: greenBook('§3.4.3'), status: 'verified', claim: 'An MCR round is complete when every player has occupied the dealer position once.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-prevailing-wind-order', subjectId: 'rule.mcr-e4-prevailing-wind-order', sourceId, locator: greenBook('§3.4.5'), status: 'verified', claim: 'The prevailing-Wind rounds proceed East, South, West, then North.', checkedOn: '2026-10-01', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-e4-four-wind-rounds-complete-game', subjectId: 'rule.mcr-e4-four-wind-rounds-complete-game', sourceId, locator: greenBook('§3.4.4–3.4.5'), status: 'verified', claim: 'In the normal full-game form represented by this profile, completion of the East, South, West and North rounds completes the game.', checkedOn: '2026-10-01', supportsProfile }),
];
