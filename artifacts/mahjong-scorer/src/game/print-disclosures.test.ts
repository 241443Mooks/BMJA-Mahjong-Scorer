import { describe, expect, it } from 'vitest';
import { prepareFullPrintDisclosures } from './print-disclosures';

describe('prepareFullPrintDisclosures', () => {
  it('opens the outer ledger and each hand, then restores their individual states', () => {
    const ledger = { open: false };
    const firstHand = { open: true };
    const secondHand = { open: false };

    const restore = prepareFullPrintDisclosures([ledger, firstHand, secondHand]);

    expect([ledger.open, firstHand.open, secondHand.open]).toEqual([true, true, true]);
    restore();
    expect([ledger.open, firstHand.open, secondHand.open]).toEqual([false, true, false]);
  });
});
