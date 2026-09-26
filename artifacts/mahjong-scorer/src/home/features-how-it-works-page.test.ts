import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FeaturesPage } from './FeaturesPage';
import { HowItWorksPage } from './HowItWorksPage';

describe('Features and How it works page roles', () => {
  it('keeps Features focused on capabilities and links to deeper references', () => {
    const markup = renderToStaticMarkup(createElement(FeaturesPage));

    expect(markup).toContain('At the table');
    expect(markup).toContain('Score a hand');
    expect(markup).toContain('Run the whole game');
    expect(markup).toContain('Review and recover');
    expect(markup).toContain('href="/how-it-works"');
    expect(markup).toContain('href="/help"');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/under-the-hood"');
    expect(markup).not.toContain('provisional');
    expect(markup).not.toContain('provenance');
  });

  it('keeps the practical walkthrough short and routes detailed tasks to Help', () => {
    const markup = renderToStaticMarkup(createElement(HowItWorksPage));

    expect(markup).toContain('Choose the table context');
    expect(markup).toContain('Enter or record a hand');
    expect(markup).toContain('Review the score and explanation');
    expect(markup).toContain('Settle the hand');
    expect(markup).toContain('Continue or keep the record');
    expect(markup).toContain('href="/help"');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/under-the-hood"');
    expect(markup).not.toContain('Eight steps');
    expect(markup).not.toContain('partial hands, the winning tile, recovery, correcting a hand');
  });
});
