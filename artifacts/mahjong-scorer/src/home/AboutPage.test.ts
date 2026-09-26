import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('presents the project story and preserves the practical facts and links', () => {
    const markup = renderToStaticMarkup(createElement(AboutPage));

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('Hi. I’m SMooks. I accidentally built a Mahjong knowledge system.');
    expect(markup).toContain('One question kept creating another');
    expect(markup).toContain('I don&#x27;t want the software to become confident simply because I have misunderstood something confidently.');
    expect(markup).toContain('Mahjong Reference is not an official British Mah-Jong Association product and does not claim BMJA endorsement.');
    expect(markup).toContain('The project&#x27;s original software code is licensed under the MIT License.');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('https://creativecommons.org/licenses/by/4.0/');
    expect(markup).toContain('https://buymeacoffee.com/sharronmo');
    expect(markup).not.toContain('github.com/241443Mooks/BMJA-Mahjong-Scorer');
    expect(markup).not.toContain('View the GitHub repository');
    expect(markup).not.toContain('Built in the open');
    expect(markup).not.toContain('learning library is still explicitly British Mahjong material');
  });
});
