import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';
import { RouteContent } from './RouteContent';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

describe('Club rules route', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('renders the configured Club rules reference instead of falling through to NotFound', () => {
    const markup = renderToStaticMarkup(<RouteContent path="/rules/club" />);

    expect(markup).toContain('Club rules');
    expect(markup).toContain('configured local club profile');
    expect(markup).toContain('href="/game/club"');
    expect(markup).toContain('This is the Bramhall club’s configured local variation');
    expect(markup).toContain('Players and tiles');
    expect(markup).toContain('How hands work');
    expect(markup).toContain('Penalties and incidents');
    expect(markup).toContain('id="cannon"');
    expect(markup).toContain('No choice!');
    expect(markup).toContain('id="settlement"');
    expect(markup).toContain('After a draw there are no payments');
  });
});
