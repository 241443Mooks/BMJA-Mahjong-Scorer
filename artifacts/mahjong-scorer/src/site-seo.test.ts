import siteSeo from './site-seo.json';
import { describe, expect, it } from 'vitest';

describe('public SEO configuration', () => {
  it('defines unique canonical, indexable routes', () => {
    const paths = siteSeo.routes.map((route) => route.path);

    expect(new Set(paths).size).toBe(paths.length);
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
  });

  it('maps aliases to canonical public routes', () => {
    const paths = new Set(siteSeo.routes.map((route) => route.path));

    expect(siteSeo.aliases.every((alias) => paths.has(alias.target))).toBe(true);
  });
});
