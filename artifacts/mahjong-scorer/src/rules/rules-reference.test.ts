import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { RulesHubPage, RulesProfilePage, chooseRulesHubProfile } from './RulesReference';
import { familiesBySupportedProfileCount, MAHJONG_FAMILIES, supportedProfilesForFamily } from '../home/mahjong-family-presentation';
import { MahjongRulesComparedPage } from '../home/MahjongRulesComparedPage';
import { initialiseCurrentRulesRuntimes } from '../rules-platform/current-runtime-registry';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY, readPreferredRulesProfile } from '../game/preferred-rules-profile';
import type { RulesProfileRef } from '../game/types';

function memoryStorage(initial: string | null = null) {
  let value = initial;
  return {
    getItem: (_key: string) => value,
    setItem: (_key: string, next: string) => { value = next; },
    removeItem: (_key: string) => { value = null; },
    value: () => value,
  };
}

function renderRulesHubWithPreference(profile: RulesProfileRef | null) {
  const storage = memoryStorage(profile ? JSON.stringify(profile) : null);
  vi.stubGlobal('window', { localStorage: storage });
  try {
    return renderToStaticMarkup(createElement(RulesHubPage));
  } finally {
    vi.unstubAllGlobals();
  }
}

describe('public rules reference model', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());
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
    expect(hub).toContain('href="/game"');
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
    expect(hub).toContain('4 supported profiles available');
    expect(hub).toContain('1 supported profile available');
    expect(hub.match(/Not currently supported/g)).toHaveLength(3);
    expect(familiesBySupportedProfileCount().map(({ id }) => id)).toEqual(['classical-western', 'mcr', 'hong-kong', 'riichi', 'american']);
    expect(hub.indexOf('British / Western Classical')).toBeLessThan(hub.indexOf('Chinese Official / MCR'));
    expect(hub.indexOf('Chinese Official / MCR')).toBeLessThan(hub.indexOf('Hong Kong / Cantonese-style'));
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
    expect(hub).toMatch(/name="my-rules-profile" checked="" value="all"/);
    expect(hub).toContain('href="/hand"');
    expect(hub).toContain('href="/game"');
    expect(hub).toContain('href="/special-hands"');
    expect(hub).not.toContain('href="/hand?rules=');
    expect(hub).not.toContain('href="/game/club"');
  });

  it('loads a saved My rules selection and persists or clears changes through the existing preference store', () => {
    const british = PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === 'british')!;
    const selectedMarkup = renderRulesHubWithPreference(british.profile);
    expect(selectedMarkup).toMatch(/name="my-rules-profile" checked="" value="british"/);
    expect(selectedMarkup).toContain('My rules');

    const storage = memoryStorage();
    expect(chooseRulesHubProfile('western', storage)).toEqual(PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === 'western')!.profile);
    expect(storage.value()).toBe(JSON.stringify(PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === 'western')!.profile));
    expect(readPreferredRulesProfile(storage)).toEqual(PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === 'western')!.profile);
    expect(PREFERRED_RULES_PROFILE_STORAGE_KEY).toBe('mahjong-reference:preferred-rules-profile');
    chooseRulesHubProfile(null, storage);
    expect(storage.value()).toBeNull();
    expect(readPreferredRulesProfile(storage)).toBeNull();
  });

  it('preserves selected-profile context in one action area and only exposes truthful learning links', () => {
    const profiles = PUBLIC_RULES_DESCRIPTORS.map(({ slug }) => slug);
    for (const slug of profiles) {
      const descriptor = PUBLIC_RULES_DESCRIPTORS.find((candidate) => candidate.slug === slug)!;
      const hub = renderRulesHubWithPreference(descriptor.profile);
      const actionArea = hub.match(/<section aria-labelledby="rules-context-actions"[\s\S]*?<\/section>/)?.[0];
      expect(actionArea).toBeTruthy();
      expect(hub).toMatch(new RegExp(`name="my-rules-profile" checked="" value="${slug}"`));
      expect(actionArea).toContain(`href="/hand?rules=${slug}"`);
      expect(actionArea).toContain(`href="/game/${slug}"`);
      expect(actionArea).toContain(`href="/rules/${slug}"`);
      expect(actionArea?.match(/href="\/hand\?rules=/g)).toHaveLength(1);
      expect(actionArea?.match(new RegExp(`href="\\/game\\/${slug}"`, 'g'))).toHaveLength(1);
      if (slug === 'mcr') expect(actionArea).not.toContain('href="/special-hands"');
      else expect(actionArea).toContain('href="/special-hands"');
      if (slug === 'british') {
        expect(actionArea).toContain('href="/gameplay-basics"');
        expect(actionArea).toContain('href="/guide"');
        expect(actionArea).toContain('href="/scoring-examples"');
      } else {
        expect(actionArea).not.toContain('href="/gameplay-basics"');
        expect(actionArea).not.toContain('href="/guide"');
        expect(actionArea).not.toContain('href="/scoring-examples"');
      }
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
