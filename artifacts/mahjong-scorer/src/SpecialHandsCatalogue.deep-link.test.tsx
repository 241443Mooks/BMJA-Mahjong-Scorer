// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY } from './game/preferred-rules-profile';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';
import { ATLAS_LEARNER_ENTRIES, atlasTreatmentsForEntry } from './guide/special-hands-atlas';

describe('Special Hands exact treatment deep links', () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  beforeAll(() => initialiseCurrentRulesRuntimes());
  afterEach(async () => {
    if (root) await act(async () => root!.unmount());
    container?.remove();
    window.localStorage.removeItem(PREFERRED_RULES_PROFILE_STORAGE_KEY);
    root = undefined;
    container = undefined;
    vi.unstubAllGlobals();
  });

  it('opens the owning entry and selects the exact Club variant without changing the remembered rules', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const rememberedRules = { id: 'western-tm', version: '0.1' };
    window.localStorage.setItem(PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(rememberedRules));
    const targetReference = 'outside-the-box@0.1:seven-pairs-one-suit';
    const anchor = 'treatment-club-seven-pairs-one-suit';
    window.history.replaceState(null, '', `/special-hands#${anchor}`);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);

    await act(async () => root!.render(<SpecialHandsCatalogue />));

    const entry = container.querySelector<HTMLElement>('#atlas-entry-pair-hand-family');
    expect(entry).not.toBeNull();
    expect(entry!.querySelector('details[open]')).not.toBeNull();
    expect(container.querySelector<HTMLSelectElement>('[aria-label="Rules"]')?.value).toBe('club');
    expect(entry!.querySelector<HTMLSelectElement>('select[aria-label^="Hand name under these rules"]')?.value).toBe(targetReference);
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(rememberedRules));
  });

  it('compares exact Thirteen Unique Wonders facts without changing remembered rules or the prominent treatment', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const rememberedRules = { id: 'western-tm', version: '0.1' };
    window.localStorage.setItem(PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(rememberedRules));
    window.history.replaceState(null, '', '/special-hands');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(<SpecialHandsCatalogue />));

    const entry = container.querySelector<HTMLElement>('#atlas-entry-thirteen-unique-wonders')!;
    const compare = [...entry.querySelectorAll<HTMLButtonElement>('button')].find(({ textContent }) => textContent === 'Compare rules')!;
    await act(async () => compare.click());
    const comparison = entry.querySelector<HTMLElement>('[id^="comparison-"]')!;
    const britishOption = [...comparison.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
      .find(({ parentElement }) => parentElement?.textContent?.includes('British / BMJA-style'))!;
    await act(async () => { britishOption.click(); });
    expect(comparison.textContent).toContain('reviewed versions of the same Special Hands concept.');
    expect(comparison.textContent).toContain('Concealed only');
    expect(comparison.textContent).toContain('British');
    expect(comparison.textContent).toContain('Western');
    expect(comparison.querySelector('[aria-live="polite"]')?.textContent).toContain('3 of 4 available treatments; choose up to 3.');
    expect(comparison.querySelector('dl')?.textContent).toContain('Fixed · 1,000 winner · 400 fishing');
    expect(comparison.querySelector('dl')?.textContent).toContain('Fixed · 2,000 winner · 800 fishing');
    expect(comparison.textContent).not.toContain('outside-the-box');
    expect(comparison.textContent).not.toMatch(/(?:\.md|src\/|docs\/|evidence\.pattern\.)/i);
    expect(window.localStorage.getItem(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(rememberedRules));
    expect(entry.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.textContent).toContain('Western');
  });

  it('keeps Imperial Jade family language and the broader Western difference explicit', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    window.history.replaceState(null, '', '/special-hands');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(<SpecialHandsCatalogue />));
    const entry = container.querySelector<HTMLElement>('#atlas-entry-imperial-jade')!;
    const compare = [...entry.querySelectorAll<HTMLButtonElement>('button')].find(({ textContent }) => textContent === 'Compare rules')!;
    await act(async () => compare.click());
    const comparison = entry.querySelector<HTMLElement>('[id^="comparison-"]')!;
    const westernOption = [...comparison.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
      .find(({ parentElement }) => parentElement?.textContent?.includes('Thompson & Maloney Western form'))!;
    await act(async () => { westernOption.click(); });
    expect(comparison.textContent).toContain('related hands and are not necessarily equivalent');
    expect(comparison.textContent).toContain('One 2-3-4 Bamboo Chow is allowed.');
  });

  it('offers no comparison action for a single-treatment entry and keeps same-profile pair names distinct', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    window.history.replaceState(null, '', '/special-hands');
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root!.render(<SpecialHandsCatalogue />));
    const singleTreatmentEntry = ATLAS_LEARNER_ENTRIES.find((entry) => atlasTreatmentsForEntry(entry).length === 1)!;
    const singleTreatment = container.querySelector<HTMLElement>(`#atlas-entry-${singleTreatmentEntry.id}`)!;
    expect([...singleTreatment.querySelectorAll('button')].filter(({ textContent }) => textContent === 'Compare rules')).toHaveLength(0);
    const pairEntry = container.querySelector<HTMLElement>('#atlas-entry-pair-hand-family')!;
    const compare = [...pairEntry.querySelectorAll<HTMLButtonElement>('button')].find(({ textContent }) => textContent === 'Compare rules')!;
    await act(async () => compare.click());
    const checkboxes = [...pairEntry.querySelectorAll<HTMLInputElement>('[id^="comparison-"] input[type="checkbox"]')];
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    expect(new Set(checkboxes.map(({ parentElement }) => parentElement?.textContent)).size).toBe(checkboxes.length);
    expect(pairEntry.querySelector('[aria-live="polite"]')?.textContent).toMatch(/^Comparing 2 of \d+ available treatments; choose up to 3\.$/);
  });
});
