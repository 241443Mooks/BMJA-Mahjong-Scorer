import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteContent } from './RouteContent';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY } from './game/preferred-rules-profile';

describe('public game route seam', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());
  afterEach(() => vi.unstubAllGlobals());

  const browserStorage = (preferred: string | null) => {
    const values = new Map<string, string>();
    if (preferred !== null) values.set(PREFERRED_RULES_PROFILE_STORAGE_KEY, preferred);
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
  };

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

  it('uses a valid preference on plain /game and /hand while explicit game routes win', () => {
    vi.stubGlobal('window', { localStorage: browserStorage(JSON.stringify({ id: 'mcr-wmo-2006', version: '0.1' })), location: { search: '' } });
    const plainGame = renderToStaticMarkup(<RouteContent path="/game" />);
    const hand = renderToStaticMarkup(<RouteContent path="/hand" />);
    const explicitGame = renderToStaticMarkup(<RouteContent path="/game/club" />);
    expect(plainGame).toMatch(/data-testid="rules-card-mcr"[\s\S]*?checked=""/);
    expect(hand).toMatch(/data-testid="rules-card-mcr"[\s\S]*?checked=""/);
    expect(explicitGame).toMatch(/data-testid="rules-card-club"[\s\S]*?checked=""/);
  });

  it('retains the British first-visit default when no preference exists', () => {
    vi.stubGlobal('window', { localStorage: browserStorage(null), location: { search: '' } });
    expect(renderToStaticMarkup(<RouteContent path="/game" />)).toMatch(/data-testid="rules-card-british"[\s\S]*?checked=""/);
    expect(renderToStaticMarkup(<RouteContent path="/hand" />)).toMatch(/data-testid="rules-card-british"[\s\S]*?checked=""/);
  });

  it.each(['british', 'western', 'club', 'buzzard', 'mcr'] as const)('links the %s rules reference to its exact hand context', (slug) => {
    const path = slug === 'club' ? '/rules/club' : `/rules/${slug}`;
    const html = renderToStaticMarkup(<RouteContent path={path} />);
    expect(html).toContain(`href="/hand?rules=${slug}"`);
  });

  it('offers every exact profile in the rules chooser and keeps default actions generic', () => {
    const rulesHtml = renderToStaticMarkup(<RouteContent path="/rules" />);
    for (const slug of ['british', 'western', 'club', 'buzzard', 'mcr']) {
      expect(rulesHtml).toContain(`value="${slug}"`);
    }
    expect(rulesHtml).toMatch(/name="my-rules-profile" checked="" value="all"/);
    expect(rulesHtml).toContain('href="/hand"');
    expect(rulesHtml).toContain('href="/game"');
    expect(rulesHtml).toContain('href="/special-hands"');
    expect(rulesHtml).not.toContain('href="/hand?rules=');
    expect(rulesHtml).not.toContain('href="/game/');
    const homeHtml = renderToStaticMarkup(<RouteContent path="/" />);
    expect(homeHtml).toContain('href="/hand"');
    expect(homeHtml).not.toContain('/hand?rules=');
  });

  it('loads the scorer when the browser storage getter itself throws', () => {
    vi.stubGlobal('window', { get localStorage() { throw new Error('blocked'); }, location: { search: '' } });
    expect(() => renderToStaticMarkup(<RouteContent path="/hand" />)).not.toThrow();
  });

  it('renders the privacy and analytics route with its current footer', () => {
    const html = renderToStaticMarkup(<RouteContent path="/privacy" />);
    expect(html).toContain('Privacy &amp; analytics.');
    expect(html).toContain('PostHog Cloud EU');
    expect(html).toContain('Privacy &amp; analytics');
    expect(html).not.toContain('Source on GitHub');
  });

  it.each(['/game/foo', '/game/mcr/foo'])('%s is not a game route and does not fall back to British', (path) => {
    const html = renderToStaticMarkup(<RouteContent path={path} />);
    expect(html).toContain('404 Page Not Found');
    expect(html).not.toContain('British / BMJA-style');
  });
});
