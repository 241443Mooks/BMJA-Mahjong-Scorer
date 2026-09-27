import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('presents the project story and preserves the useful facts and links', () => {
    const markup = renderToStaticMarkup(createElement(AboutPage));

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('About Mahjong Reference');
    expect(markup).toContain('One question kept creating another');
    expect(markup).toContain('Where it is now');
    expect(markup).toContain('score hands, explain scores, track a game');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('sources disagree');
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
