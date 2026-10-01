import type { EvidenceClaim } from '../../../rules-platform/truth-model';
import { versioned } from '../records';
import { mcrFanE1Bindings } from '../subjects/mcr-fan-e1';

const sourceId = 'source.mcr-ema-green-book-2006';
const supportsProfile = { id: 'mcr-wmo-2006', version: '0.1' } as const;
const greenBook = (fanNumber: number) => ({
  kind: 'publication' as const,
  title: 'Mahjong Competition Rules (2006), European Mahjong Association (EMA) English edition',
  edition: '2006',
  year: 2006,
  section: `§3.8.1 #${fanNumber}; Appendix 1 #${fanNumber}`,
});

export const mcrFanE1Claims = mcrFanE1Bindings.map(({ fanNumber, subjectId, claimId, binding, sourceSemantics }) =>
  versioned<EvidenceClaim>(claimId, {
    claimId,
    subjectId,
    sourceId,
    locator: greenBook(fanNumber),
    status: 'verified',
    claim: `The 2006 MCR identifies fan #${fanNumber}, ${binding.name}, by this structural condition: ${sourceSemantics}`,
    checkedOn: '2026-10-01',
    supportsProfile,
  }),
);
