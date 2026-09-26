import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { RouteContent } from '../RouteContent';
import { HomePage } from './HomePage';

function homeBody() {
  const markup = renderToStaticMarkup(createElement(HomePage));
  return markup.slice(markup.indexOf('<main'), markup.indexOf('</main>'));
}

describe('homepage front door', () => {
  it('keeps the hero, primary actions, local recovery reassurance and Features link', () => {
    const markup = homeBody();

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain('Rules, scoring and play — made clear.');
    expect(markup).toContain('Your Mahjong table companion.');
    expect(markup).toContain('Track a game');
    expect(markup).toContain('Score a hand');
    expect(markup).toContain('Free · No signup required · Works in your browser');
    expect(markup).toContain('you can usually pick up your game again on this device');
    expect(markup).toContain('saved in this browser, not to an account');
    expect(markup).toContain('href="/features"');
    expect(markup).toContain('See what the Table Companion can do');
  });

  it('ends after orientation without duplicating Rules, Learn or trust content', () => {
    const markup = homeBody();

    expect(markup).not.toContain('Play by the rules your table uses');
    expect(markup).not.toContain('See all supported rules');
    expect(markup).not.toContain('Learn and understand');
    expect(markup).not.toContain('British gameplay basics');
    expect(markup).not.toContain('Try British scoring examples');
    expect(markup).not.toContain('One game. One record.');
    expect(markup).not.toContain('Available — provisional');
    expect(markup).not.toMatch(/href="\/rules(?:\/|"|\?)/);
    expect(markup).not.toContain('href="/gameplay-basics"');
    expect(markup).not.toContain('href="/guide');
  });

  it('lets the shared footer follow the shortened Home body', () => {
    const markup = renderToStaticMarkup(createElement(RouteContent, { path: '/' }));

    expect(markup.indexOf('</main>')).toBeGreaterThan(-1);
    expect(markup.indexOf('<footer')).toBeGreaterThan(markup.indexOf('</main>'));
  });
});
