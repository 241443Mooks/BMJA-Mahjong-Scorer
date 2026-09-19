import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import NotFound, { notFoundRecoveryLinks } from './not-found';

describe('not found page', () => {
  it('uses visitor-facing copy instead of developer router language', () => {
    const markup = renderToStaticMarkup(NotFound());

    expect(markup).toContain('404');
    expect(markup).toContain('Page not found');
    expect(markup).not.toContain('Did you forget to add the page to the router?');
  });

  it('offers clear recovery routes', () => {
    expect(notFoundRecoveryLinks).toEqual([
      ['Home', '/'],
      ['Score a hand', '/hand'],
      ['Track a game', '/game'],
      ['Browse rules', '/rules'],
    ]);

    const markup = renderToStaticMarkup(NotFound());
    for (const [label, href] of notFoundRecoveryLinks) {
      expect(markup).toContain(`href=\"${href}\"`);
      expect(markup).toContain(label);
    }
  });
});
