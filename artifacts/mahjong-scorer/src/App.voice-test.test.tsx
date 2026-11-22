// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, afterEach, describe, it, expect, vi } from 'vitest';
import { HandScorer } from './App';
import { BMJA_PROFILE_REF } from './game/ruleset';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

beforeAll(async () => { await initialiseCurrentRulesRuntimes(); });
afterEach(() => { vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });
describe('local voice test integration', () => {
  it('keeps manual work intact until accepting a confirmed interpretation', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ groups: [{ source: 'exposed pong of three dots', kind: 'pung', tile: { family: 'suit', suit: 'circles', rank: 3 }, visibility: 'exposed', ambiguity: null }], unparsed: [] }) })));
    window.history.replaceState({}, '', '/voice-test');
    const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
    try {
      await act(async () => root.render(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-add-tile-characters-1"]')!.click());
      expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(1);
      const textarea = container.querySelector('textarea')!;
      await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'exposed pong of three dots'); textarea.dispatchEvent(new Event('input', { bubbles: true })); });
      const button = (label: string) => [...container.querySelectorAll('button')].find(b => b.textContent === label)!;
      await act(async () => { button('Interpret').click(); });
      expect(container.textContent).toContain('What I heard:');
      expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(1);
      await act(async () => { button('Accept groups').click(); });
      expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(2);
      expect(container.textContent).toContain('Groups added.');
      expect(container.querySelector('[data-testid="working-picker"]')).not.toBeNull();
      expect(container.textContent).toContain('Pung');
    } finally { await act(async () => root.unmount()); container.remove(); }
  });
});

it('rejects a fifth physical copy while keeping the original hand', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ groups: [{ source: 'concealed pair of one character', kind: 'pair', tile: { family: 'suit', suit: 'characters', rank: 1 }, visibility: 'concealed', ambiguity: null }], unparsed: [] }) })));
  window.history.replaceState({}, '', '/voice-test');
  const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
  try {
    await act(async () => root.render(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-add-tile-characters-1"]')!.click());
    const textarea = container.querySelector('textarea')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'concealed pair of one character'); textarea.dispatchEvent(new Event('input', { bubbles: true })); });
    const button = (label: string) => [...container.querySelectorAll('button')].find(b => b.textContent === label)!;
    await act(async () => button('Interpret').click());
    await act(async () => button('Accept groups').click());
    expect(container.textContent).toContain('A tile appears more than four times.');
    expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(1);
  } finally { await act(async () => root.unmount()); container.remove(); }
});
