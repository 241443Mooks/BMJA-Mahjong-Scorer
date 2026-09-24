import { describe, expect, it } from 'vitest';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { RulesHubPage, RulesProfilePage } from './RulesReference';

describe('public rules reference model', () => {
  it('keeps scorer availability, source status and implementation state distinct', () => {
    const british = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'british')!;
    const western = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'western')!;
    const club = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'club')!;

    expect(british.support).toMatchObject({ scorer: 'Available', implementation: 'Stable' });
    expect(western.support).toMatchObject({ scorer: 'Available', implementation: 'Provisional' });
    expect(western.support.source).toContain('source-verified');
    expect(western.support.source).toContain('under source review');
    expect(club.title).toBe('Club rules');
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
});
