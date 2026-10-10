import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compactFooterLinks, footerGroups, SiteFooter } from './SiteFooter';

describe('site footer', () => {
  it('keeps the full footer focused on Play, Learn and Project', () => {
    expect(footerGroups).toEqual([
      {
        label: 'Play',
        links: [
          ['Track a game', '/game'],
          ['Score a hand', '/hand'],
        ],
      },
      {
        label: 'Learn',
        links: [
          ['Rules', '/rules'],
          ['How it works', '/how-it-works'],
          ['User Guide', '/help'],
          ['Scoring examples', '/scoring-examples'],
        ],
      },
      {
        label: 'Project',
        links: [
          ['About', '/about'],
          ["What’s new", '/whats-new'],
          ['Privacy & analytics', '/privacy'],
        ],
      },
    ]);
  });

  it('keeps the compact variant closed and quiet by default', () => {
    expect(compactFooterLinks).toEqual([
      ['User Guide', '/help'],
      ['About', '/about'],
      ['Privacy', '/privacy'],
    ]);
    const markup = renderToStaticMarkup(SiteFooter({ variant: 'compact' }));
    expect(markup).toContain('Site links');
    expect(markup).toContain('© 2026 SMooks');
    expect(markup).toContain('Support the project');
    expect(markup).not.toContain('Mahjong tile artwork');
  });

  it('shows project ownership without exposing the repository link', () => {
    const markup = renderToStaticMarkup(SiteFooter({}));
    expect(markup).toContain('© 2026 SMooks');
    expect(markup).not.toContain('not an official BMJA publication');
    expect(markup).toContain('Privacy &amp; analytics');
    expect(markup).toContain('What’s new');
    expect(markup).not.toContain('Source on GitHub');
    expect(markup).toContain('Support the project');
    expect(markup.indexOf('© 2026 SMooks')).toBeLessThan(markup.indexOf('Support the project'));
    expect(markup).toContain('justify-between');
  });

  it('shows tile artwork credit only when requested', () => {
    const credited = renderToStaticMarkup(SiteFooter({ showTileCredit: true }));
    const plain = renderToStaticMarkup(SiteFooter({}));
    expect(credited).toContain('Mahjong tile artwork from xhokir/riichi-mahjong-tiles');
    expect(plain).not.toContain('Mahjong tile artwork from xhokir/riichi-mahjong-tiles');
  });
});
