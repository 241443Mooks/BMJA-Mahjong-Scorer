import { describe, expect, it } from 'vitest';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { RulesHubPage, RulesProfilePage } from './RulesReference';
import { MAHJONG_FAMILIES, supportedProfilesForFamily } from '../home/mahjong-family-presentation';
import { MahjongRulesComparedPage } from '../home/MahjongRulesComparedPage';

describe('public rules reference model', () => {
  it('keeps scorer availability, source status and implementation state distinct', () => {
    const british = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'british')!;
    const western = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'western')!;
    const club = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'club')!;

    expect(british.support).toMatchObject({ scorer: 'Available', implementation: 'Stable' });
    expect(western.support).toMatchObject({ scorer: 'Available', implementation: 'Provisional' });
    expect(western.support.source).toContain('source-verified');
    expect(western.support.source).toContain('under source review');
    expect(club.title).toBe('Club - Bramhall 2026');
    expect(club.configuredClubProfile).toBe(true);
    const mcr = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'mcr')!;
    expect(mcr).toMatchObject({ profile: { id: 'mcr-wmo-2006', version: '0.1' }, status: 'Provisional', availability: { gameTracker: true } });
  });

  it('exposes MCR game tracking through the availability-driven Hub and reference page', () => {
    const hub = renderToStaticMarkup(createElement(RulesHubPage));
    const mcr = renderToStaticMarkup(createElement(RulesProfilePage, { slug: 'mcr' }));
    expect(hub).toContain('href="/game/mcr"');
    expect(mcr).toContain('Track an MCR game');
    expect(mcr).toContain('href="/game/mcr"');
    expect(mcr).toContain('Provisional');
    expect(mcr).toContain('0.1');
    expect(mcr).toContain('Accepted Basic Points drive settlement');
    expect(mcr).toContain('dealer passes after every completed hand');
    expect(mcr).toContain('does not arbitrate physical play');
    expect(mcr).not.toContain('not yet exposed');
  });

  it('keeps the five presentation families, exact support truth and supported membership distinct', () => {
    expect(MAHJONG_FAMILIES.map(({ id }) => id)).toEqual(['classical-western', 'hong-kong', 'riichi', 'mcr', 'american']);
    expect(MAHJONG_FAMILIES.map((family) => [family.id, supportedProfilesForFamily(family).map(({ slug }) => slug)])).toEqual([
      ['classical-western', ['club', 'british', 'buzzard', 'western']],
      ['hong-kong', []],
      ['riichi', []],
      ['mcr', ['mcr']],
      ['american', []],
    ]);
    const hub = renderToStaticMarkup(createElement(RulesHubPage));
    expect(hub.match(/Supported profiles available/g)).toHaveLength(2);
    expect(hub.match(/Not currently supported/g)).toHaveLength(3);
    expect(hub).toContain('Not seeing your rules?');
    expect(hub).not.toContain('Source status');
    expect(hub).not.toContain('Implementation</dt>');
  });

  it('orders exact profiles newest first and preserves each reference, Score and Track route', () => {
    const club = MAHJONG_FAMILIES.find(({ id }) => id === 'classical-western')!;
    const classical = supportedProfilesForFamily(club);
    expect(classical.map(({ slug, editionYear }) => [slug, editionYear])).toEqual([
      ['club', 2026], ['british', 2008], ['buzzard', 2000], ['western', 1997],
    ]);
    expect(supportedProfilesForFamily(MAHJONG_FAMILIES.find(({ id }) => id === 'mcr')!).map(({ slug, editionYear }) => [slug, editionYear])).toEqual([['mcr', 2006]]);

    const hub = renderToStaticMarkup(createElement(RulesHubPage));
    for (const slug of ['club', 'british', 'buzzard', 'western', 'mcr']) {
      expect(hub).toContain(`href="/rules/${slug}"`);
      expect(hub).toContain(`href="/hand?rules=${slug}"`);
      expect(hub).toContain(`href="/game/${slug}"`);
    }
  });

  it('uses the same family names and recognition clues in the Hub and comparison quick clues', () => {
    const hub = renderToStaticMarkup(createElement(RulesHubPage));
    const comparison = renderToStaticMarkup(createElement(MahjongRulesComparedPage));
    for (const family of MAHJONG_FAMILIES) {
      expect(hub).toContain(family.name);
      expect(hub).toContain(family.clue);
      expect(comparison).toContain(family.name);
      expect(comparison).toContain(family.clue);
    }
  });
});
