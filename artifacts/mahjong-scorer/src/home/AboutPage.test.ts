import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('explains the table companion, its rules and its evidence in a restrained editorial sequence', () => {
    const markup = renderToStaticMarkup(createElement(AboutPage));

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('Useful at the table. Quite a lot going on underneath.');
    expect(markup).toContain('making sense of the rules your table actually plays');
    expect(markup).toContain('Mahjong is slightly inconvenient');
    expect(markup).toContain('The score is only part of it');
    expect(markup).toContain('It should be able to explain itself');
    expect(markup).toContain('Built to grow without becoming a mess');
    expect(markup).toContain('Where rules genuinely share something, the system can share it. Where they are different, they stay different.');
    expect(markup).toContain('A different scoring system does not have to pretend to be British Mahjong with different numbers.');
    expect(markup).toContain('Not everything is implemented');
    expect(markup).not.toContain('One question kept creating another.');
    expect(markup).not.toContain('What if?');
    expect(markup).toContain('Then we got to scoring.');
    expect(markup).toContain('I thought I was building a calculator.');
    expect(markup).toContain('Apparently not.');
    expect(markup).toContain('I am learning Mahjong as I build this.');
    expect(markup).toContain('The system should make that easier, not embarrassing.');
    expect(markup).not.toContain('I&#x27;m SMooks, I made this.');
    expect(markup).not.toContain('Question 01');
    expect(markup).not.toContain('rounded-full');
    expect(markup).not.toContain('Take fragmented human knowledge.');
    expect(markup).toContain('href="/hand"');
    expect(markup).toContain('href="/game"');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/how-it-works"');
    expect(markup).toContain('href="/under-the-hood"');
    expect(markup).toContain('href="/whats-new"');
    expect(markup).toContain('saved locally rather than to an account');
    expect(markup).toContain('does not require an account');
    expect(markup).toContain('feedback or contact form');
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
