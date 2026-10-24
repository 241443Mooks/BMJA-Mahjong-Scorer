import { GameplayBasics } from './GameplayBasics';
import { BeginnerGuide } from './BeginnerGuide';
import { createElement } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteContent } from '../RouteContent';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';

const renderRoute = (path: string) => renderToStaticMarkup(createElement(RouteContent, { path }));

describe('British learner journey', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('keeps gameplay focused on the table and points learners to scoring next', () => {
    const html = renderToStaticMarkup(createElement(GameplayBasics));

    expect(html).toContain('<h1');
    expect(html).toContain('How to play a British Mahjong hand.');
    expect(html).toContain('href="/guide?rules=british#ordinary-scoring"');
    expect(html).toContain('href="/rules/british"');
    expect(html).toContain('href="/encyclopaedia/flowers-and-seasons"');
    expect(html).toContain('href="/special-hands?rules=british"');
    expect(html).not.toContain('Not sure which Mahjong rules you play?');
  });

  it('keeps the scoring guide British-specific and points table questions to gameplay', () => {
    const html = renderToStaticMarkup(createElement(BeginnerGuide, { onClose: () => {} }));

    expect(html).toContain('How British Mahjong scoring works.');
    expect(html).toContain('href="/gameplay-basics?rules=british"');
    expect(html).toContain('href="/gameplay-basics?rules=british#visibility"');
    expect(html).toContain('href="/rules/british"');
    expect(html).toContain('href="/special-hands?rules=british"');
    expect(html).not.toMatch(/MCR.{0,60}(turn|discard|claim)|(?:turn|discard|claim).{0,60}MCR/i);
  });

  it.each([
    ['/gameplay-basics', 'Gameplay basics'],
    ['/guide', 'Scoring guide'],
    ['/special-hands', 'Special Hands'],
    ['/rules/british', 'British Mahjong'],
    ['/encyclopaedia/flowers-and-seasons', 'Flowers and Seasons'],
  ])('loads the learning destination %s directly', (path, expectedContent) => {
    const html = renderRoute(path);

    expect(html).toContain(expectedContent);
    expect(html).not.toContain('404 · Page not found');
  });

  it('keeps the learner handoff links keyboard-focusable', () => {
    const gameplay = renderToStaticMarkup(createElement(GameplayBasics));
    const scoring = renderToStaticMarkup(createElement(BeginnerGuide, { onClose: () => {} }));

    expect(gameplay).toMatch(/<a(?=[^>]*href="\/guide\?rules=british#ordinary-scoring")(?=[^>]*focus-visible:ring)[^>]*>/);
    expect(scoring).toMatch(/<a(?=[^>]*href="\/gameplay-basics\?rules=british")(?=[^>]*focus-visible:ring)[^>]*>/);
  });
});
