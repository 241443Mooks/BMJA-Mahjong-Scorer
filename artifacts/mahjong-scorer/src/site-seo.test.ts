import siteSeo from './site-seo.json';

describe('public SEO configuration', () => {
  it('defines unique canonical, indexable routes', () => {
    const paths = siteSeo.routes.map((route) => route.path);

    expect(new Set(paths).size).toBe(paths.length);
    expect(siteSeo.routes.every((route) => route.indexable)).toBe(true);
    expect(siteSeo.routes.find((route) => route.path === '/')?.title).toContain('British Mahjong Scoring Calculator');
    expect(siteSeo.routes.find((route) => route.path === '/hand')?.title).toContain('British Mahjong Hand Calculator');
  });

  it('maps aliases to canonical public routes', () => {
    const paths = new Set(siteSeo.routes.map((route) => route.path));

    expect(siteSeo.aliases.every((alias) => paths.has(alias.target))).toBe(true);
  });
});
