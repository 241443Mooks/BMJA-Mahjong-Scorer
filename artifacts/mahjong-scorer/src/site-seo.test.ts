import siteSeo from './site-seo.json';
import { describe, expect, it } from 'vitest';

const canonicalPublicPaths = [
  '/',
  '/about',
  '/features',
  '/game',
  '/gameplay-basics',
  '/guide',
  '/hand',
  '/help',
  '/how-it-works',
  '/mahjong-rules-compared',
  '/mahjong-settlement',
  '/privacy',
  '/rules',
  '/rules/british',
  '/rules/western',
  '/scoring-examples',
  '/special-hands',
] as const;

describe('public SEO configuration', () => {
  it('defines the complete canonical, indexable public route set', () => {
    const paths = siteSeo.routes.map((route) => route.path);
    const titles = siteSeo.routes.map((route) => route.title);

    expect([...paths].sort()).toEqual([...canonicalPublicPaths]);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(siteSeo.routes.every((route) => route.indexable)).toBe(true);
    expect(siteSeo.routes.find((route) => route.path === '/')?.title).toContain('Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/hand')?.title).toContain('Mahjong Hand Calculator');
    expect(siteSeo.routes.find((route) => route.path === '/mahjong-settlement')?.title).toContain('Mahjong Settlement Explained');
    expect(siteSeo.routes.find((route) => route.path === '/mahjong-rules-compared')?.title).toContain('British vs Riichi vs Hong Kong vs American Mahjong Rules');
    expect(siteSeo.routes.every((route) => route.title.includes('Mahjong Reference'))).toBe(true);
    expect(siteSeo.webSite.name).toBe('Mahjong Reference');
    expect(siteSeo.webSite.url).toBe(siteSeo.siteUrl);
    expect(siteSeo.webApplication.name).toBe('Mahjong Reference Table Companion');
    expect(siteSeo.webApplication.featureList).toContain('Supported rules profiles for British, Western and club Mahjong contexts');
    expect(siteSeo.routes.find((route) => route.path === '/guide')?.title).toContain('British Mahjong Scoring Guide');
    expect(siteSeo.routes.find((route) => route.path === '/gameplay-basics')?.title).toContain('British Mahjong Gameplay Basics');
    expect(siteSeo.routes.find((route) => route.path === '/rules')?.title).toContain('Mahjong Rules We Support');
    expect(siteSeo.routes.find((route) => route.path === '/rules/british')?.title).toContain('British Mahjong Rules');
    expect(siteSeo.routes.find((route) => route.path === '/rules/western')?.description).toContain('provisional ordinary-rule boundary');
    expect(siteSeo.routes.find((route) => route.path === '/help')?.title).toContain('User Guide & Help');
    expect(siteSeo.routes.find((route) => route.path === '/help')?.description).toContain('Table Companion workflows');
    expect(siteSeo.routes.find((route) => route.path === '/how-it-works')?.title).toContain('Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/features')?.title).toBe('Mahjong Table Companion Features | Mahjong Reference');
    expect(siteSeo.routes.find((route) => route.path === '/features')?.description).toContain('whole-game tracking');
    expect(siteSeo.routes.find((route) => route.path === '/about')?.title).toBe('About Mahjong Reference | Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/about')?.description).toContain('rules-aware Mahjong Table Companion');
    expect(siteSeo.routes.find((route) => route.path === '/privacy')?.title).toContain('Privacy & Analytics');
    expect(siteSeo.routes.find((route) => route.path === '/privacy')?.description).toContain('cookieless analytics');
  });

  it('keeps product-wide metadata broader than British-only learning content', () => {
    const productWidePaths = ['/', '/features', '/how-it-works', '/help', '/about'];
    for (const path of productWidePaths) {
      const route = siteSeo.routes.find((candidate) => candidate.path === path);
      expect(`${route?.title} ${route?.description}`).not.toContain('British Mahjong Scoring Calculator');
    }
  });

  it('maps legacy aliases onto canonical routes without duplicating sitemap surfaces', () => {
    const paths = new Set(siteSeo.routes.map((route) => route.path));
    const aliasPaths = siteSeo.aliases.map((alias) => alias.path);

    expect(siteSeo.aliases).toEqual([
      { path: '/beginner-guide', target: '/guide' },
      { path: '/special-hand-catalogue', target: '/special-hands' },
    ]);
    expect(siteSeo.aliases.every((alias) => paths.has(alias.target))).toBe(true);
    expect(aliasPaths.every((path) => !paths.has(path))).toBe(true);
    expect(new Set(aliasPaths).size).toBe(aliasPaths.length);
  });
});
