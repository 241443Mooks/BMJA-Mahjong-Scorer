import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WhatsNewPage } from './WhatsNewPage';

describe('WhatsNewPage', () => {
  it('shows curated updates in reverse chronological month groups', () => {
    const markup = renderToStaticMarkup(createElement(WhatsNewPage));

    expect(markup).toContain('A few of the things that have changed as Mahjong Reference has grown.');
    expect(markup.indexOf('October 2026')).toBeLessThan(markup.indexOf('September 2026'));
    expect(markup).toContain('Tracked games keep the winner’s scoring context');
    expect(markup).toContain('Explore special hands across Classical rules');
    expect(markup).not.toContain('pull/');
    expect(markup).not.toContain('PR #');
  });

  it('has a quiet empty state', () => {
    const markup = renderToStaticMarkup(createElement(WhatsNewPage, { updates: [] }));
    expect(markup).toContain('There are no updates to share just yet.');
  });
});
