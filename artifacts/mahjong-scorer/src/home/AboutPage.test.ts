import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('tells the project story in a restrained editorial sequence', () => {
    const markup = renderToStaticMarkup(createElement(AboutPage));

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('One question kept creating another.');
    expect(markup).toContain('Then we got to scoring.');
    expect(markup).toContain('I thought I was building a calculator.');
    expect(markup).toContain('What if?');
    expect(markup).toContain('That last question turned out to be quite a large one.');
    expect(markup).toContain('And I found that fascinating.');
    expect(markup).toContain('There is considerably more of the third category than I expected.');
    expect(markup).toContain('Apparently I find that extremely difficult to resist.');
    expect(markup).toContain('I&#x27;m learning as I build it');
    expect(markup).toContain('I misunderstood something confidently');
    expect(markup).not.toContain('I&#x27;m SMooks, I made this.');
    expect(markup).not.toContain('Question 01');
    expect(markup).not.toContain('rounded-full');
    expect(markup).not.toContain('Take fragmented human knowledge.');
    expect(markup).not.toContain('A growing rules-aware scoring, learning and table system built on structured Mahjong knowledge.');
    expect(markup).toContain('href="/hand"');
    expect(markup).toContain('href="/game"');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/under-the-hood"');
    expect(markup).toContain('Sources sometimes disagreed');
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
