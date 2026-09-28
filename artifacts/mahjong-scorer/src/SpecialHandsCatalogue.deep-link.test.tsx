// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY } from './game/preferred-rules-profile';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';

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
});
