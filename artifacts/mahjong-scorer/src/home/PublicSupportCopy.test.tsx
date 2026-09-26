import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';
import { MahjongRulesComparedPage } from './MahjongRulesComparedPage';
import { MahjongSettlementPage } from './MahjongSettlementPage';

describe('public support copy', () => {
  it('keeps About current without duplicating a partial profile list', () => {
    const markup = renderToStaticMarkup(createElement(AboutPage));
    expect(markup).toContain('href="/rules"');
    expect(markup).not.toContain('a configured local Club profile');
    expect(markup).not.toContain('Club rules describe a configured local table');
  });

  it('distinguishes available profiles from comparison-only families', () => {
    const markup = renderToStaticMarkup(createElement(MahjongRulesComparedPage));
    expect(markup).toContain('Buzzard 2000');
    expect(markup).toContain('provisional MCR / WMO 2006');
    expect(markup).toContain('Hong Kong, Riichi and American Mahjong, which are not currently supported scorers');
    expect(markup).not.toContain('does not promise scoring support for Hong Kong, Riichi, MCR');
  });

  it('scopes settlement detail to British and delegates current support to the rules hub', () => {
    const markup = renderToStaticMarkup(createElement(MahjongSettlementPage));
    expect(markup).toContain('This detailed explanation is for British / BMJA-style settlement');
    expect(markup).toContain('Settlement is profile-owned, so other supported rules may differ');
    expect(markup).toContain('href="/rules"');
    expect(markup).not.toContain('A configured Club game can add rules-specific incidents');
  });
});
