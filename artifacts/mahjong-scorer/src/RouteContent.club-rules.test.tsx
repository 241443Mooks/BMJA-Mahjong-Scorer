import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RouteContent } from './RouteContent';

describe('Club rules route', () => {
  it('renders the configured Club rules reference instead of falling through to NotFound', () => {
    const markup = renderToStaticMarkup(<RouteContent path="/rules/club" />);

    expect(markup).toContain('Club rules');
    expect(markup).toContain('configured local club profile');
    expect(markup).toContain('href="/game/club"');
    expect(markup).toContain('A local club rules profile');
  });
});
