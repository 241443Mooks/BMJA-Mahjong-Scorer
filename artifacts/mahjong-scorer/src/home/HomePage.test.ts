import { describe, expect, it } from 'vitest';
import { homeLearningLinks, homeRulesStatusLabel } from './HomePage';

describe('homepage public wording', () => {
  it('uses simple user-facing rules statuses', () => {
    expect(homeRulesStatusLabel('british')).toBe('Ready to use');
    expect(homeRulesStatusLabel('western')).toBe('Available — still being checked');
    expect(homeRulesStatusLabel('club')).toBe('Set up');
  });

  it('keeps British learning links explicitly British', () => {
    expect(homeLearningLinks.map((link) => link.title)).toEqual([
      'British gameplay basics',
      'British scoring guide',
      'British special hands',
      'How the Table Companion works',
    ]);
    expect(homeLearningLinks[3]?.href).toBe('/how-it-works');
  });
});
