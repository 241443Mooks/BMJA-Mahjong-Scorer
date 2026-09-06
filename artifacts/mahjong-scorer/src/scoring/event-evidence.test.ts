import { describe, expect, it } from 'vitest';
import {
  isFirstDiscardEvidenceCandidate,
  isReplacementSequenceEvidenceCandidate,
  isWinningEventEvidenceCompatible,
} from './event-evidence';

describe('winning-event evidence lifecycle', () => {
  const discardEvidence = {
    type: 'discard' as const,
    discardedBy: 'east' as const,
    handDiscardOrdinal: 1,
  };
  const replacementEvidence = {
    type: 'replacement-chain' as const,
    kongDeclarations: 2,
  };

  it('asks the first-discard question only for a winning non-East discard hand', () => {
    expect(
      isFirstDiscardEvidenceCandidate({
        isWinner: true,
        playerWind: 'south',
        winningMethod: 'discard',
        completedKongs: 0,
      }),
    ).toBe(true);
    for (const candidate of [
      {
        isWinner: false,
        playerWind: 'south' as const,
        winningMethod: 'discard' as const,
        completedKongs: 0,
      },
      {
        isWinner: true,
        playerWind: 'east' as const,
        winningMethod: 'discard' as const,
        completedKongs: 0,
      },
      {
        isWinner: true,
        playerWind: 'south' as const,
        winningMethod: 'wall' as const,
        completedKongs: 0,
      },
    ]) {
      expect(isFirstDiscardEvidenceCandidate(candidate)).toBe(false);
    }
  });

  it('asks the replacement question only for a winning loose-tile hand with two completed kongs', () => {
    expect(
      isReplacementSequenceEvidenceCandidate({
        isWinner: true,
        playerWind: 'east',
        winningMethod: 'loose-tile',
        completedKongs: 2,
      }),
    ).toBe(true);
    expect(
      isReplacementSequenceEvidenceCandidate({
        isWinner: true,
        playerWind: 'east',
        winningMethod: 'loose-tile',
        completedKongs: 1,
      }),
    ).toBe(false);
    expect(
      isReplacementSequenceEvidenceCandidate({
        isWinner: false,
        playerWind: 'east',
        winningMethod: 'loose-tile',
        completedKongs: 2,
      }),
    ).toBe(false);
  });

  it('invalidates first-discard evidence after winner, wind, or method changes', () => {
    expect(
      isWinningEventEvidenceCompatible(discardEvidence, {
        isWinner: true,
        playerWind: 'south',
        winningMethod: 'discard',
        completedKongs: 0,
      }),
    ).toBe(true);
    expect(
      isWinningEventEvidenceCompatible(discardEvidence, {
        isWinner: false,
        playerWind: 'south',
        winningMethod: 'discard',
        completedKongs: 0,
      }),
    ).toBe(false);
    expect(
      isWinningEventEvidenceCompatible(discardEvidence, {
        isWinner: true,
        playerWind: 'east',
        winningMethod: 'discard',
        completedKongs: 0,
      }),
    ).toBe(false);
    expect(
      isWinningEventEvidenceCompatible(discardEvidence, {
        isWinner: true,
        playerWind: 'south',
        winningMethod: 'wall',
        completedKongs: 0,
      }),
    ).toBe(false);
  });

  it('invalidates replacement evidence after method or kong-count changes', () => {
    expect(
      isWinningEventEvidenceCompatible(replacementEvidence, {
        isWinner: true,
        playerWind: 'south',
        winningMethod: 'loose-tile',
        completedKongs: 2,
      }),
    ).toBe(true);
    expect(
      isWinningEventEvidenceCompatible(replacementEvidence, {
        isWinner: true,
        playerWind: 'south',
        winningMethod: 'wall',
        completedKongs: 2,
      }),
    ).toBe(false);
    expect(
      isWinningEventEvidenceCompatible(replacementEvidence, {
        isWinner: true,
        playerWind: 'south',
        winningMethod: 'loose-tile',
        completedKongs: 1,
      }),
    ).toBe(false);
  });
});