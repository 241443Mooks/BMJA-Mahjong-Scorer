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

  it('prioritises the heading, actions and free-use message before introductory copy', () => {
    const markup = homeBody();
    const heading = markup.indexOf('Your Mahjong table companion.');
    const actions = markup.indexOf('data-testid="home-primary-actions"');
    const reassurance = markup.indexOf('data-testid="home-free-use"');
    const desktopEyebrow = markup.indexOf('Rules, scoring and play — made clear.');
    const mobileEyebrow = markup.indexOf('Rules, scoring and play — made clear.', reassurance);
    const introduction = markup.indexOf('data-testid="home-introduction"');

    expect(heading).toBeGreaterThan(-1);
    expect(desktopEyebrow).toBeLessThan(heading);
    expect(actions).toBeGreaterThan(heading);
    expect(reassurance).toBeGreaterThan(actions);
    expect(mobileEyebrow).toBeGreaterThan(reassurance);
    expect(introduction).toBeGreaterThan(mobileEyebrow);
    expect(markup).toContain('<a href="/game"');
    expect(markup).toContain('<a href="/hand"');
    expect(markup).toContain('text-[clamp(31px,8.3vw,40px)]');
    expect(markup).toContain('min-h-[156px]');
    expect(markup).toContain('sm:min-h-[190px]');
    expect(markup).toContain('order-1 max-w-[760px]');
    expect(markup).toContain('order-2 mt-3');
    expect(markup).toContain('order-3 mt-3');
    expect(markup).toContain('order-4 mb-2');
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
