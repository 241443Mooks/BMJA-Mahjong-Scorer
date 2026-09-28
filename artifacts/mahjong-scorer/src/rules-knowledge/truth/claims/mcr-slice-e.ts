import type { EvidenceClaim } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const sourceId = 'source.mcr-ema-green-book-2006';
const supportsProfile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const claim = (record: EvidenceClaim) => versioned(record.claimId, record);
const greenBook = (section: string) => ({ kind: 'publication' as const, title: 'Mahjong Competition Rules (2006), European Mahjong Association (EMA) English edition', edition: '2006', year: 2006, section });

export const mcrSliceEClaims = [
  claim({ claimId: 'evidence.pattern.thirteen-orphans.mcr-wmo-2006', subjectId: 'pattern.thirteen-orphans', sourceId, locator: greenBook('§3.8.1 #7; Appendix 1 #7'), status: 'verified', claim: 'The 2006 MCR defines Thirteen Orphans as fan #7.', checkedOn: '2026-09-28', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-2006-non-combination', subjectId: 'rule.mcr-2006-non-combination', sourceId, locator: greenBook('§3.9.1'), status: 'verified', claim: 'The 2006 MCR counting rules define which fan combinations may not be counted together.', checkedOn: '2026-09-28', supportsProfile }),
  claim({ claimId: 'evidence.rule.mcr-8-before-flowers', subjectId: 'rule.mcr-8-before-flowers', sourceId, locator: greenBook('§3.11.6.6'), status: 'verified', claim: 'The 2006 MCR requires at least 8 points before Flower Tiles are added.', checkedOn: '2026-09-28', supportsProfile }),
];
