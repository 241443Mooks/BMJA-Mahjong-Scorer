import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { directDestinations, navigationGroups, SiteHeader } from './SiteHeader';

describe('site navigation', () => {
  it('exposes three direct user goals and only Learn and Rules disclosures', () => {
    expect(directDestinations).toEqual([
      ['Score a hand', '/hand'],
      ['Track a game', '/game'],
      ['Help', '/help'],
    ]);
    expect(navigationGroups).toEqual([
      {
        label: 'Learn',
        destinations: [
          ['British gameplay basics', '/gameplay-basics'],
          ['British scoring guide', '/guide'],
          ['Special Hands', '/special-hands'],
          ['Scoring examples', '/scoring-examples'],
        ],
      },
      {
        label: 'Rules',
        destinations: [
          ['Choose your rules', '/rules'],
          ['Compare Mahjong rules', '/mahjong-rules-compared'],
        ],
      },
    ]);
  });

  it('renders the same five top-level destinations on desktop and mobile with disclosures collapsed', () => {
    const markup = renderToStaticMarkup(createElement(SiteHeader));
    expect(markup.match(/aria-label="Primary navigation"/g)).toHaveLength(1);
    expect(markup).not.toContain('aria-label="Site navigation"');
    expect(markup.match(/aria-expanded="false"/g)).toHaveLength(3);
    expect(markup).toContain('Score a hand');
    expect(markup).toContain('Track a game');
    expect(markup).toContain('Help');
    expect(markup).not.toContain('British / BMJA-style');
    expect(markup).not.toContain('Special Hands Atlas');
    expect(markup).not.toContain('Understand settlement');
    expect(markup).not.toContain('More');
  });
});
