import { renderRoute } from './prerender';
// @vitest-environment happy-dom
import { createGame } from './game/game';
import { GAME_SNAPSHOT_STORAGE_KEY, saveGameRecoveryV2, loadInProgressGameRecoveryCore } from './game/persistence';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { RouteContent } from './RouteContent';
import { PUBLIC_RULES_DESCRIPTORS } from './game/rules-presentation';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY, setPreferredRulesProfile, clearPreferredRulesProfile } from './game/preferred-rules-profile';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { ReaderRulesProvider, resolveReaderRules } from './guide/ReaderRulesContext';
import { ProfileLearningPage } from './guide/ProfileLearningPage';

let root: Root | undefined;
let container: HTMLDivElement;
beforeAll(async () => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); await initialiseCurrentRulesRuntimes(); });
afterEach(async () => { if (root) await act(async () => root!.unmount()); root = undefined; container?.remove(); window.localStorage.clear(); window.history.replaceState(null, '', '/'); });
async function open(path: string) {
  if (root) await act(async () => root!.unmount());
  container?.remove();
  window.history.replaceState(null, '', path);
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
  await act(async () => root!.render(<RouteContent path={path.split('?')[0].split('#')[0]} />));
  return container.querySelector('main')!;
}
const descriptor = (slug: string) => PUBLIC_RULES_DESCRIPTORS.find((item) => item.slug === slug)!;

describe('rules-aware reading', () => {
  for (const item of PUBLIC_RULES_DESCRIPTORS) for (const path of ['/guide', '/gameplay-basics']) {
    it(`${item.slug} opens its own ${path} without borrowing a British lesson`, async () => {
      setPreferredRulesProfile(item.profile);
      const main = await open(path);
      expect(main.textContent).toContain(item.slug === 'british' ? 'British' : item.title);
      if (item.slug !== 'british') {
        expect(main.textContent).toContain('partial guide');
        expect(main.querySelector('#matching-bonus-tiles')).toBeNull();
        expect(main.querySelector('#getting-started')).toBeNull();
        expect(main.querySelector('#deal')).toBeNull();
        expect(main.querySelector(`a[href="/rules/${item.slug}"]`)).not.toBeNull();
      }
      if (item.slug === 'western') expect(main.textContent).toContain('source review');
      if (item.slug === 'mcr') {
        expect(main.textContent).toContain('8-point minimum');
        expect(main.textContent).toContain('Flowers are added only after');
        expect(main.textContent).not.toContain('Each Flower or Season adds 4');
        expect(main.textContent).not.toContain('at most one Chow');
        expect(main.textContent).not.toContain('East pays or receives double');
      }
    });
  }
  it('no preference opens a neutral choice, never a guessed British lesson', async () => {
    const main = await open('/guide');
    expect(main.textContent).toContain('Choose the rules your table uses');
    expect(main.querySelector('#getting-started')).toBeNull();
    expect(main.querySelectorAll('a[href^="/guide?rules="]')).toHaveLength(5);
  });
  it('changes, clears and reloads the same validated preference without touching game storage', async () => {
    const players = ['east', 'south', 'west', 'north'].map((id) => ({ id, name: id }));
    const game = createGame(players, { east: 'east', south: 'south', west: 'west', north: 'north' }, undefined, 'full-game', descriptor('club').profile);
    expect(saveGameRecoveryV2(window.localStorage, game, { grammar: 'classical-points-doubles', draft: { scores: {}, scoreRecords: {} } })).toBe(true);
    const original = window.localStorage.getItem(GAME_SNAPSHOT_STORAGE_KEY);
    await open('/guide');
    const picker = container.querySelector<HTMLSelectElement>('[aria-label="My rules"]')!;
    await act(async () => { picker.value = 'mcr'; picker.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(container.textContent).toContain('8-point minimum');
    await open('/guide');
    expect(container.textContent).toContain('8-point minimum');
    await act(async () => clearPreferredRulesProfile());
    expect(container.textContent).toContain('Choose the rules your table uses');
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(GAME_SNAPSHOT_STORAGE_KEY)).toBe(original);
    expect(loadInProgressGameRecoveryCore(window.localStorage)?.game).toEqual(game);
  });
  it('an explicit URL overrides the saved profile for that page and survives reload', async () => {
    setPreferredRulesProfile(descriptor('mcr').profile);
    await open('/gameplay-basics?rules=british');
    expect(container.querySelector('#deal')).not.toBeNull();
    await act(async () => setPreferredRulesProfile(descriptor('buzzard').profile));
    expect(container.querySelector('#deal')).not.toBeNull();
    await open('/gameplay-basics?rules=british');
    expect(container.querySelector('#deal')).not.toBeNull();
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor('buzzard').profile));
  });
  it('invalid URLs and stale versions fail closed rather than using the saved British lesson', async () => {
    setPreferredRulesProfile(descriptor('british').profile);
    await open('/guide?rules=unregistered');
    expect(container.textContent).toContain('That rules profile is unavailable');
    expect(container.querySelector('#getting-started')).toBeNull();
    window.localStorage.setItem(PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify({ id: 'bmja', version: 'obsolete' }));
    await open('/guide');
    expect(container.textContent).toContain('Choose the rules your table uses');
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBeNull();
  });
  it('MCR Special Hands stays empty until explicit cross-profile exploration', async () => {
    setPreferredRulesProfile(descriptor('mcr').profile);
    await open('/special-hands');
    expect(container.querySelectorAll('article[id^="atlas-entry-"]')).toHaveLength(0);
    expect(container.querySelector('#purity')).toBeNull();
    expect(container.querySelector('a[href="/guide?rules=mcr"]')).not.toBeNull();
    expect(container.textContent).not.toContain('0 hands');
    expect(container.querySelector('#atlas-search')).toBeNull();
    await open('/special-hands?rules=all');
    expect(container.querySelectorAll('article[id^="atlas-entry-"]').length).toBeGreaterThan(0);
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor('mcr').profile));
  });
  it('Special Hands local browsing shares the reader context and preserves the saved preference', async () => {
    setPreferredRulesProfile(descriptor('british').profile);
    await open('/special-hands');
    const picker = container.querySelector<HTMLSelectElement>('[aria-label="Rules"]')!;
    await act(async () => { picker.value = 'mcr'; picker.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(window.location.search).toBe('?rules=mcr');
    expect(container.textContent).toContain('Reading: MCR');
    expect(container.querySelectorAll('article[id^="atlas-entry-"]')).toHaveLength(0);
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor('british').profile));
  });
  it('puts only the selected published treatment first and withholds MCR topic cards and examples', async () => {
    setPreferredRulesProfile(descriptor('western').profile);
    await open('/encyclopaedia/thirteen-orphans');
    const cards = container.querySelector('#treatments')!;
    expect(cards.textContent).toContain('Western');
    expect(cards.querySelectorAll('li[id]')).toHaveLength(1);
    expect(cards.querySelector('li[id]')?.id).toBe('western-tm@0.1:thirteen-unique-wonders');
    expect(container.querySelectorAll('figure').length).toBeGreaterThan(0);
    await open('/encyclopaedia/thirteen-orphans?rules=mcr');
    expect(container.querySelector('#treatments')!.textContent).toContain('Published treatments across rules');
    expect(container.querySelector('aside[aria-label="Reading rules"]')?.textContent).not.toContain('Reading: MCR');
    expect(container.querySelectorAll('figure').length).toBeGreaterThan(0);
    expect(container.querySelector('li[id="mcr-wmo-2006@0.1:thirteen-orphans"]')).toBeNull();
  });
  it('keeps Imperial Jade and Snake tile examples attached to their proven British treatments', async () => {
    await open('/encyclopaedia/imperial-jade?rules=british');
    const jadeTiles = [...container.querySelectorAll('main img')].map((tile) => tile.getAttribute('src'));
    expect(jadeTiles.length).toBeGreaterThan(0);
    expect(jadeTiles.every((src) => /(?:Sou[23468]|Hatsu)\.svg/.test(src!))).toBe(true);
    await open('/encyclopaedia/wriggling-snake?rules=british');
    const snakeTiles = [...container.querySelectorAll('main img')].map((tile) => tile.getAttribute('src'));
    expect(snakeTiles.some((src) => src!.includes('Ton.svg'))).toBe(true);
    expect(snakeTiles.some((src) => src!.includes('Hatsu.svg'))).toBe(false);
    expect(snakeTiles).not.toEqual(jadeTiles);
  });
  it('keeps canonical British articles readable as cross-profile reading rather than unavailable stubs', async () => {
    setPreferredRulesProfile(descriptor('western').profile);
    for (const path of ['/encyclopaedia/imperial-jade', '/encyclopaedia/wriggling-snake', '/encyclopaedia/flowers-and-seasons']) {
      await open(path);
      expect(container.textContent).toContain('This published article describes British');
      expect(container.textContent).not.toContain('not currently covered');
      expect(container.querySelectorAll('main img').length).toBeGreaterThan(0);
      expect(container.querySelector('aside[aria-label="Reading rules"]')?.textContent).toContain('Reading: British');
      expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor('western').profile));
    }
  });
  for (const saved of [null, 'british', 'mcr'] as const) {
    it(`preserves the full eight-tile British Flowers article for a direct visitor with ${saved ?? 'no preference'}`, async () => {
      if (saved) setPreferredRulesProfile(descriptor(saved).profile);
      const original = window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY);
      for (const path of ['/encyclopaedia/flowers-and-seasons', '/encyclopaedia/flowers-and-seasons?rules=mcr', '/encyclopaedia/flowers-and-seasons?rules=british']) {
        await open(path);
        expect(container.querySelectorAll('main img')).toHaveLength(8);
        expect(container.textContent).toContain('British Mahjong · BMJA 1.0');
        expect(container.textContent).toContain('The eight bonus tiles');
        expect(container.textContent).toContain('Where these rules come from');
        expect(container.textContent).not.toContain('not currently covered');
        expect(container.querySelector('aside[aria-label="Reading rules"]')?.textContent).toContain('Reading: British');
        expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(original);
        if (saved === 'mcr' && !path.includes('rules=british')) expect(container.querySelector('a[href="/guide?rules=mcr#fan-and-flowers"]')).not.toBeNull();
      }
    });
  }
  it('MCR discovery offers useful fan/Flowers reading and omits British-only or withheld topic destinations', async () => {
    setPreferredRulesProfile(descriptor('mcr').profile);
    await open('/encyclopaedia');
    const entries = container.querySelector('[aria-labelledby="concept-list-heading"]')!;
    expect(entries.querySelector('a[href="/guide?rules=mcr#fan-and-flowers"]')).not.toBeNull();
    expect(entries.querySelector('a[href="/encyclopaedia/scoring-systems?rules=mcr"]')).not.toBeNull();
    for (const path of ['flowers-and-seasons', 'thirteen-orphans', 'imperial-jade', 'wriggling-snake']) expect(entries.querySelector(`a[href^="/encyclopaedia/${path}"]`)).toBeNull();
    expect(entries.textContent).not.toContain('British');
    await open('/encyclopaedia/scoring-systems?rules=mcr');
    expect(container.querySelectorAll('li[id^="profile-"]')).toHaveLength(1);
    expect(container.querySelector('li[id^="profile-"]')?.textContent).toContain('Fan-pattern scoring');
    expect(container.querySelector('a[href="/guide?rules=mcr#fan-and-flowers"]')).not.toBeNull();
    await open('/guide?rules=mcr#fan-and-flowers');
    expect(container.querySelector('#fan-and-flowers')?.textContent).toContain('8-point minimum');
    expect(container.querySelector('#fan-and-flowers')?.textContent).toContain('Flowers are added only after');
  });
  it('MCR can deliberately explore every published article without changing the saved profile', async () => {
    setPreferredRulesProfile(descriptor('mcr').profile);
    await open('/encyclopaedia?rules=all');
    expect(container.querySelector('a[href="/encyclopaedia/flowers-and-seasons"]')).not.toBeNull();
    await open('/encyclopaedia/flowers-and-seasons');
    expect(container.querySelectorAll('main img')).toHaveLength(8);
    expect(container.querySelector('aside[aria-label="Reading rules"]')?.textContent).toContain('Reading: British');
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor('mcr').profile));
  });
  for (const selected of ['british', 'club', 'buzzard', 'western']) {
    it(`${selected} discovery filters treatment matches, while Explore All retains published articles`, async () => {
      setPreferredRulesProfile(descriptor(selected).profile);
      await open('/encyclopaedia');
      const entries = container.querySelector('[aria-labelledby="concept-list-heading"]')!;
      expect(entries.querySelector(`a[href="/encyclopaedia/thirteen-orphans?rules=${selected}"]`)).not.toBeNull();
      if (selected === 'british') expect(entries.querySelector('a[href="/encyclopaedia/flowers-and-seasons?rules=british"]')).not.toBeNull();
      else {
        expect(entries.querySelector('a[href^="/encyclopaedia/imperial-jade"]')).toBeNull();
        expect(entries.querySelector('a[href^="/encyclopaedia/wriggling-snake"]')).toBeNull();
        expect(entries.querySelector(`a[href="/guide?rules=${selected}#known-rules"]`)).not.toBeNull();
      }
      await open('/encyclopaedia?rules=all');
      expect(container.querySelector('a[href="/encyclopaedia/flowers-and-seasons"]')).not.toBeNull();
      expect(container.querySelector('a[href="/encyclopaedia/imperial-jade"]')).not.toBeNull();
      expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor(selected).profile));
    });
  }
  it('preserves the saved preference when a legacy exact-treatment anchor overrides it', () => {
    const reader = resolveReaderRules('', '#treatment-club-seven-pairs-one-suit', descriptor('mcr'), true);
    expect(reader.selected?.slug).toBe('club');
    expect(reader.saved?.slug).toBe('mcr');
    expect(reader.explicit).toBe(true);
  });
  it('keeps all four known rule exceptions visible in the relevant guides', async () => {
    await open('/guide?rules=british');
    expect(container.textContent).toContain('current scorer does not switch hand mode automatically');
    expect(container.textContent).toContain('Robbing-Kong eligibility validation remains unresolved');
    expect(container.textContent).toContain('Published blessing/Chow wording has conflicting interpretations');
    await open('/guide?rules=western');
    expect(container.textContent).toContain('A sourced rule still needs a reviewed explanation');
    expect(container.textContent).toContain('Source wording awaiting review:');
  });
  it('a current rules reference overrides My rules without changing the saved profile', async () => {
    setPreferredRulesProfile(descriptor('mcr').profile);
    await open('/rules/british');
    expect(container.querySelector('aside[aria-label="Reading rules"]')?.textContent).toContain('Reading: British');
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(descriptor('mcr').profile));
  });
  for (const path of ['/guide', '/gameplay-basics']) {
    it(`prerenders meaningful neutral initial HTML for ${path} despite a saved MCR preference`, () => {
      setPreferredRulesProfile(descriptor('mcr').profile);
      const html = renderRoute(path);
      const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
      expect(main).toContain('Choose the rules your table uses');
      expect(main).not.toContain('Loading your rules');
      expect(main).not.toContain('id="getting-started"');
      expect(main).not.toContain('id="deal"');
      for (const { slug, title } of PUBLIC_RULES_DESCRIPTORS) {
        expect(main).toContain(`href="${path}?rules=${slug}"`);
        expect(main).toContain(`href="/rules/${slug}"`);
        expect(main).toContain(title.replaceAll('&', '&amp;'));
      }
    });
  }
  it('hydrates a neutral server shell without a flash of British lessons or hydration errors', async () => {
    setPreferredRulesProfile(descriptor('mcr').profile);
    const element = <ReaderRulesProvider><ProfileLearningPage topic="scoring" /></ReaderRulesProvider>;
    const html = renderToString(element);
    expect(html).toContain('Choose the rules your table uses');
    expect(html).not.toContain('Loading your rules');
    expect(html).toContain('/rules/mcr');
    expect(html).toContain('/guide?rules=british');
    expect(html).not.toContain('Each Flower or Season adds');
    container = document.createElement('div'); container.innerHTML = html; document.body.append(container);
    const errors: unknown[] = [];
    await act(async () => { root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(error) }); });
    expect(errors).toEqual([]);
    expect(container.textContent).toContain('8-point minimum');
    expect(container.querySelector('#getting-started')).toBeNull();
  });
});
