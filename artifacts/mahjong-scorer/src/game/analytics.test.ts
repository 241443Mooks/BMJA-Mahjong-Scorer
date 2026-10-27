import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureProductEvent } from '../lib/analytics';

afterEach(() => Reflect.deleteProperty(globalThis, 'window'));

describe('production analytics guard', () => {
  it.each(['localhost', 'preview.pages.dev', 'mahjong.smooks.co.uk.evil.test'])('does not initialize or capture on %s', (hostname) => {
    const capture = vi.fn();
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { hostname }, posthog: { capture } } });
    captureProductEvent('ruleset_selected', { ruleset: 'buzzard' });
    expect(capture).not.toHaveBeenCalled();
    const window = { location: { hostname } };
    runInNewContext(readFileSync('public/analytics.js', 'utf8'), { window });
    expect(window).not.toHaveProperty('posthog');
  });

  it('initializes the cookieless client on the production host', () => {
    const insertBefore = vi.fn();
    const document = { createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore } }] };
    const window = { location: { hostname: 'mahjong.smooks.co.uk' } };
    runInNewContext(readFileSync('public/analytics.js', 'utf8'), { window, document, get posthog() { return (window as any).posthog; } });
    expect(insertBefore).toHaveBeenCalledOnce();
    expect((window as any).posthog._i[0][1]).toMatchObject({ cookieless_mode: 'always', person_profiles: 'never', autocapture: false });
  });

  it('captures on production and tolerates missing or failing analytics', () => {
    const capture = vi.fn();
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { hostname: 'mahjong.smooks.co.uk' }, posthog: { capture } } });
    captureProductEvent('ruleset_selected', { ruleset: 'buzzard' });
    expect(capture).toHaveBeenCalledOnce();
    window.posthog = undefined;
    expect(() => captureProductEvent('game_completed')).not.toThrow();
    window.posthog = { capture: () => { throw new Error('offline'); } };
    expect(() => captureProductEvent('game_completed')).not.toThrow();
  });
});
