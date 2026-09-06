import { describe, expect, it, vi } from 'vitest';
import { returnAppliedScoreToTable } from './table-navigation';
import type { HandScorerResult } from './types';

const appliedResult = {
  playerId: 'anna',
  score: 44,
} as HandScorerResult;

describe('detailed scorer table navigation', () => {
  it('returns an applied score to the current table-scores section', () => {
    const scrollIntoView = vi.fn();
    const schedule = vi.fn((callback: () => void) => callback());

    expect(
      returnAppliedScoreToTable(
        appliedResult,
        { scrollIntoView },
        schedule,
      ),
    ).toBe(true);
    expect(schedule).toHaveBeenCalledOnce();
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('does not force table navigation when the scorer is cancelled', () => {
    const scrollIntoView = vi.fn();
    const schedule = vi.fn();

    expect(
      returnAppliedScoreToTable(null, { scrollIntoView }, schedule),
    ).toBe(false);
    expect(schedule).not.toHaveBeenCalled();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});