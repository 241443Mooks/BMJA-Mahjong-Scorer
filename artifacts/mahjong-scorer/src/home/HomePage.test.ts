import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HomePage, homeLearningLinks, homeRulesStatusLabel } from './HomePage';

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

  it('sends every rules discovery card to its rules reference page', () => {
    const markup = renderToStaticMarkup(createElement(HomePage));
    expect(markup).toContain('href="/rules/club"');
    expect(markup).not.toContain('href="/game/club"');
    expect(markup.match(/Read these rules/g)).toHaveLength(5);
  });
});
