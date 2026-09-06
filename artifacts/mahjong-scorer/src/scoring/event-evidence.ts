import type {
  Wind,
  WinningEventEvidence,
  WinningMethod,
} from './types';

export type WinningEventCandidate = {
  isWinner: boolean;
  playerWind?: Wind;
  winningMethod?: WinningMethod;
  completedKongs: number;
};

export const isFirstDiscardEvidenceCandidate = ({
  isWinner,
  playerWind,
  winningMethod,
}: WinningEventCandidate) =>
  isWinner &&
  playerWind !== undefined &&
  playerWind !== 'east' &&
  winningMethod === 'discard';

export const isReplacementSequenceEvidenceCandidate = ({
  isWinner,
  winningMethod,
  completedKongs,
}: WinningEventCandidate) =>
  isWinner && winningMethod === 'loose-tile' && completedKongs >= 2;

export const isWinningEventEvidenceCompatible = (
  evidence: WinningEventEvidence | undefined,
  candidate: WinningEventCandidate,
) => {
  if (!evidence) return false;
  if (evidence.type === 'discard') {
    return (
      evidence.discardedBy === 'east' &&
      evidence.handDiscardOrdinal === 1 &&
      isFirstDiscardEvidenceCandidate(candidate)
    );
  }
  return (
    evidence.kongDeclarations === 2 &&
    isReplacementSequenceEvidenceCandidate(candidate)
  );
};