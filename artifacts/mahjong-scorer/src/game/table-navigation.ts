import type { HandScorerResult } from './types';

type TableScoresTarget = {
  scrollIntoView: (options: ScrollIntoViewOptions) => void;
};

type FrameScheduler = (callback: () => void) => void;

export const returnAppliedScoreToTable = (
  result: HandScorerResult | null,
  target: TableScoresTarget | null,
  schedule: FrameScheduler = (callback) => requestAnimationFrame(callback),
): boolean => {
  if (!result || !target) return false;

  schedule(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return true;
};