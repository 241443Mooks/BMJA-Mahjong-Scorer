import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('follows the project questions into their discoveries and current destinations', () => {
    const markup = renderToStaticMarkup(createElement(AboutPage));

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('I&#x27;m SMooks, I made this.');
    expect(markup).toContain('Could I build something that worked it out for us?');
    expect(markup).toContain('I thought I was making a calculator. That escalated.');
    expect(markup).toContain('What if another table plays differently?');
    expect(markup).toContain('I misunderstood something confidently');
    expect(markup).toContain('A growing rules-aware scoring, learning and table system built on structured Mahjong knowledge.');
    expect(markup).toContain('href="/hand"');
    expect(markup).toContain('href="/game"');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/mahjong-rules-compared"');
    expect(markup).toContain('href="/scoring-examples"');
    expect(markup).toContain('href="/how-it-works"');
    expect(markup).toContain('href="/under-the-hood"');
    expect(markup).toContain('sources disagree');
    expect(markup).toContain('saved in the browser rather than to an account');
    expect(markup).toContain('https://creativecommons.org/licenses/by/4.0/');
    expect(markup).toContain('https://buymeacoffee.com/sharronmo');
    expect(markup).not.toContain('Independent project');
    expect(markup).not.toContain('BMJA endorsement');
    expect(markup).not.toContain('Where this might go');
    expect(markup).not.toContain('No account required');
    expect(markup).not.toContain('Licensing');
    expect(markup).not.toContain('MIT License');
  });
});
