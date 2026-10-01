import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RouteContent } from './RouteContent';

describe('public evidence routes', () => {
  it('renders selected canonical Markdown inside the product shell', () => {
    const html = renderToStaticMarkup(createElement(RouteContent, { path: '/evidence/eight-ruleset-architecture-stress-test' }));

    expect(html).toContain('Evidence &amp; methods');
    expect(html).toContain('Eight-ruleset architecture stress test');
    expect(html).toContain('pre-implementation architecture validation');
    expect(html).toContain('source document remains canonical');
    expect(html).toContain('href="/under-the-hood"');
    expect(html).not.toContain('docs/rules/EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md');
  });

  it('returns the regular not-found page for unlisted Markdown', () => {
    const html = renderToStaticMarkup(createElement(RouteContent, { path: '/evidence/issue-440a-coverage-audit' }));

    expect(html).toContain('Page not found');
    expect(html).not.toContain('Issue 440A — current-corpus coverage');
  });
});
