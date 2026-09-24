import { beforeAll, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteContent } from './RouteContent';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

describe('public game route seam', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it.each([
    ['/game', 'british'],
    ['/game/british', 'british'],
    ['/game/western', 'western'],
    ['/game/club', 'club'],
    ['/game/buzzard', 'buzzard'],
    ['/game/mcr', 'mcr'],
  ])('%s enters its descriptor-owned game setup', (path, slug) => {
    const html = renderToStaticMarkup(<RouteContent path={path} />);
    expect(html).toMatch(new RegExp(`data-testid="rules-card-${slug}"[\\s\\S]*?checked=""`));
    expect(html).not.toContain('Page not found');
  });

  it('routes MCR into full-game setup without table limit or Classical setup leakage', () => {
    const html = renderToStaticMarkup(<RouteContent path="/game/mcr" />);
    expect(html).toContain('Full Game (East, South, West, North)');
    expect(html).not.toMatch(/table limit/i);
    expect(html).not.toMatch(/1000 points|600 points|one-round/i);
    expect(html).toMatch(/data-testid="rules-card-mcr"[\s\S]*?checked=""/);
  });

  it.each(['/game/foo', '/game/mcr/foo'])('%s is not a game route and does not fall back to British', (path) => {
    const html = renderToStaticMarkup(<RouteContent path={path} />);
    expect(html).toContain('404 Page Not Found');
    expect(html).not.toContain('British / BMJA-style');
  });
});
