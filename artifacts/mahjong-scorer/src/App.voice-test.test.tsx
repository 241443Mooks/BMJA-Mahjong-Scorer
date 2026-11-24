// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, afterEach, describe, it, expect, vi } from 'vitest';
import { HandScorer } from './App';
import { VoiceTestPanel } from './game/VoiceTestPanel';
import { BMJA_PROFILE_REF } from './game/ruleset';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

beforeAll(async () => { await initialiseCurrentRulesRuntimes(); });
afterEach(() => { vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });

describe('private interpretation failure diagnostics', () => {
  it.each([
    {
      label: 'provider HTTP error with both diagnostic headers',
      makeResponse: () => new Response('sensitive response body', {
        status: 502,
        headers: { 'X-Voice-Outcome': 'provider-http', 'X-Voice-Provider-Status': '401', 'X-Other': 'sensitive header' },
      }),
      diagnostics: ' HTTP 502 · X-Voice-Outcome: provider-http · X-Voice-Provider-Status: 401',
      bodyRead: false,
    },
    {
      label: 'limit response with no diagnostic headers',
      makeResponse: () => new Response('sensitive response body', { status: 429 }),
      diagnostics: ' HTTP 429',
      bodyRead: false,
    },
    {
      label: 'invalid outcome with a valid provider status',
      makeResponse: () => new Response('sensitive response body', {
        status: 502,
        headers: { 'X-Voice-Outcome': 'sensitive header', 'X-Voice-Provider-Status': '400' },
      }),
      diagnostics: ' HTTP 502 · X-Voice-Provider-Status: 400',
      bodyRead: false,
    },
    {
      label: 'valid outcome with an invalid provider status',
      makeResponse: () => new Response('sensitive response body', {
        status: 502,
        headers: { 'X-Voice-Outcome': 'schema', 'X-Voice-Provider-Status': 'sensitive header' },
      }),
      diagnostics: ' HTTP 502 · X-Voice-Outcome: schema',
      bodyRead: false,
    },
    {
      label: 'unusable evidence from an HTTP success',
      makeResponse: () => Response.json({ unexpected: 'sensitive response body' }, {
        headers: { 'X-Voice-Provider-Status': '200' },
      }),
      diagnostics: ' HTTP 200 · X-Voice-Provider-Status: 200',
      bodyRead: true,
    },
    {
      label: 'network failure without an HTTP response',
      makeResponse: () => undefined,
      diagnostics: '',
      bodyRead: undefined,
    },
  ])('shows only safe details for $label', async ({ makeResponse, diagnostics, bodyRead }) => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const response = makeResponse();
    vi.stubGlobal('fetch', vi.fn(async () => {
      if (!response) throw new Error('sensitive exception');
      return response;
    }));
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    const onAccept = vi.fn();
    try {
      await act(async () => root.render(<VoiceTestPanel onAccept={onAccept} />));
      const textarea = container.querySelector('textarea')!;
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'synthetic input');
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await act(async () => container.querySelector('button')!.click());
      expect(container.querySelector('[role="status"]')?.textContent).toBe(
        'Interpretation is unavailable. Try again or use manual entry.' + diagnostics,
      );
      expect(container.textContent).not.toMatch(/sensitive|What I heard/);
      expect(textarea.value).toBe('synthetic input');
      expect(response?.bodyUsed).toBe(bodyRead);
      expect(onAccept).not.toHaveBeenCalled();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});

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
      const result = () => container.querySelector('[data-testid="mobile-live-result"] summary')?.textContent;
      const interpretedScore = result();
      expect(interpretedScore).toContain('10 pts · 10 base · 0 doubles');
      const acceptedGroup = container.querySelector('[data-testid^="card-set-"]:last-child');
      await act(async () => acceptedGroup?.querySelector<HTMLButtonElement>('[aria-label="Remove set"]')?.click());
      expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(1);
      await act(async () => {
        const visibility = container.querySelector<HTMLSelectElement>('[aria-label="Working group visibility"]')!;
        visibility.value = 'exposed';
        visibility.dispatchEvent(new Event('change', { bubbles: true }));
        container.querySelector<HTMLButtonElement>('[data-testid="button-suit-circles"]')!.click();
      });
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-add-tile-circles-3"]')!.click());
      expect(result()).toBe(interpretedScore);
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

it('keeps the review when a queued manual edit makes acceptance stale', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({ groups: [{ source: 'pong of three dots', kind: 'pung', tile: { family: 'suit', suit: 'circles', rank: 3 }, visibility: null, ambiguity: null }], unparsed: [] }),
  })));
  window.history.replaceState({}, '', '/voice-test');
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const button = (label: string) => [...container.querySelectorAll('button')].find(b => b.textContent === label)!;
  try {
    await act(async () => root.render(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const textarea = container.querySelector('textarea')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(textarea, 'pong of three dots');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => button('Interpret').click());
    expect(container.textContent).toContain('Exposure unknown');
    expect(button('Accept groups').disabled).toBe(true);
    const exposure = container.querySelector<HTMLSelectElement>('section[aria-label="Private typed voice test"] select')!;
    await act(async () => {
      exposure.value = 'exposed';
      exposure.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="button-add-tile-characters-1"]')!.click();
      button('Accept groups').click();
    });
    expect(container.textContent).toContain('The hand changed while adding groups.');
    expect(container.textContent).not.toContain('Groups added.');
    expect(container.textContent).toContain('What I heard:');
    expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(1);
    await act(async () => button('Accept groups').click());
    expect(container.textContent).toContain('Groups added.');
    expect(container.querySelectorAll('[data-testid^="card-set-"]')).toHaveLength(2);
    expect(container.querySelector('[data-testid="working-picker"]')).not.toBeNull();
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
