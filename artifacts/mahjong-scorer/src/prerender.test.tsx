import { beforeAll, describe, expect, it } from 'vitest';
import siteSeo from './site-seo.json';
import { renderRoute } from './prerender';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

beforeAll(async () => {
  await initialiseCurrentRulesRuntimes();
});

describe('canonical route prerendering', () => {
  for (const route of siteSeo.routes) {
    it(`renders one visible route surface for ${route.path}`, () => {
      const html = renderRoute(route.path);
      expect(html.length).toBeGreaterThan(100);
      expect(html.match(/<h1\b/g) ?? []).toHaveLength(1);
      expect((html.match(/<a\b/g) ?? []).length).toBeGreaterThan(0);
    });
  }
});
