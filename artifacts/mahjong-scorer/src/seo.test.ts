import { describe, expect, it } from 'vitest';

import {
  homepageStructuredData,
  publicRoutes,
  publicRoutesByPath,
  siteSeo,
} from './seo.mjs';
import { metadata, redirects, robotsTxt, sitemapXml } from '../scripts/prerender-seo.mjs';

describe('public SEO configuration', () => {
  it('keeps canonical routes, aliases, and sitemap entries in one route list', () => {
    const indexablePaths = publicRoutes.filter((route) => route.indexable).map((route) => route.path);

    expect(sitemapXml()).toContain(`${siteSeo.siteUrl}/hand</loc>`);
    expect(sitemapXml()).not.toContain('/beginner-guide</loc>');
    expect(redirects()).toBe('/beginner-guide /guide 301\n/special-hand-catalogue /special-hands 301\n');
    expect(indexablePaths).toEqual(Object.keys(publicRoutesByPath));
  });

  it('generates route-specific crawler metadata from the route configuration', () => {
    const hand = publicRoutesByPath['/hand'];
    const html = metadata(hand);

    expect(html).toContain(hand.title);
    expect(html).toContain(hand.description);
    expect(html).toContain(`href="${siteSeo.siteUrl}/hand"`);
    expect(html).toContain('twitter:title');
    expect(html).toContain('og:title');
  });

  it('publishes truthful homepage WebApplication details and permissive robots', () => {
    expect(homepageStructuredData).toMatchObject({
      name: 'British Mahjong Scorer',
      alternateName: ['British Mahjong Calculator', 'British Mahjong Scoring Calculator'],
      inLanguage: 'en-GB',
      isAccessibleForFree: true,
      offers: { price: '0', priceCurrency: 'GBP' },
    });
    expect(homepageStructuredData.featureList).toHaveLength(4);
    expect(robotsTxt()).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${siteSeo.siteUrl}/sitemap.xml\n`);
  });
});
