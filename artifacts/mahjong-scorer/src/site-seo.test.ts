import siteSeo from './site-seo.json';

describe('public SEO configuration', () => {
  it('defines unique canonical, indexable routes', () => {
    const paths = siteSeo.routes.map((route) => route.path);

    expect(new Set(paths).size).toBe(paths.length);
    expect(siteSeo.routes.every((route) => route.indexable)).toBe(true);
    expect(siteSeo.routes.find((route) => route.path === '/')?.title).toContain('British Mahjong Scoring Calculator');
    expect(siteSeo.routes.find((route) => route.path === '/hand')?.title).toContain('British Mahjong Hand Calculator');
    expect(siteSeo.routes.find((route) => route.path === '/mahjong-rules-compared')?.title).toContain('British vs Riichi vs Hong Kong vs American Mahjong Rules');
    expect(siteSeo.routes.every((route) => route.title.includes('Mahjong Reference'))).toBe(true);
    expect(siteSeo.webSite.name).toBe('Mahjong Reference');
    expect(siteSeo.webSite.url).toBe(siteSeo.siteUrl);
    expect(siteSeo.webApplication.name).toBe('British Mahjong Scoring Calculator');
  });

  it('maps aliases to canonical public routes', () => {
    const paths = new Set(siteSeo.routes.map((route) => route.path));

    expect(siteSeo.aliases.every((alias) => paths.has(alias.target))).toBe(true);
  });
});
