// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExactProfileComparator, comparisonState, comparisonValuesDiffer } from './ExactProfileComparator';
import { MahjongRulesComparedPage } from './MahjongRulesComparedPage';
import type { ProfileDimensionValue } from '../rules-platform/profile-dimensions';

describe('exact profile comparator', () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;
  afterEach(async () => {
    if (root) await act(async () => root!.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
  });

  const value = (data: ProfileDimensionValue['value'], sourceStatus: ProfileDimensionValue['sourceStatus'] = 'source-verified', runtimeSupport: ProfileDimensionValue['runtimeSupport'] = 'executable'): ProfileDimensionValue => ({
    profile: { id: 'bmja', version: '1.0' }, dimensionId: 'scoring.grammar', value: data,
    displayValue: data.status === 'present' ? String(data.data) : data.status,
    sourceStatus, runtimeSupport, provenanceIds: [],
  });
  const mount = async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    await act(async () => root!.render(createElement(ExactProfileComparator)));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    return container;
  };

  it('classifies matching, different, identical unknown and provisional values separately', () => {
    const match = value({ status: 'present', data: 'classical-points-doubles' });
    const same = { ...match, profile: { id: 'outside-the-box', version: '0.1' }, sourceStatus: 'verified-club' as const };
    expect(match).toMatchObject({ value: { status: 'present' }, sourceStatus: 'source-verified' });
    expect(comparisonState(match, same)).toBe('same');
    expect(comparisonValuesDiffer(match, same)).toBe(false);
    expect(comparisonState(match, value({ status: 'present', data: 'pattern-accumulator' }))).toBe('different');
    expect(comparisonValuesDiffer(match, value({ status: 'present', data: 'pattern-accumulator' }))).toBe(true);
    const unknown = value({ status: 'unknown' }, 'source-unknown', 'not-modelled');
    expect(comparisonState(unknown, { ...unknown, profile: { id: 'outside-the-box', version: '0.1' } })).toBe('needs-checking');
    expect(comparisonValuesDiffer(unknown, unknown)).toBe(false);
    expect(comparisonState(match, unknown)).toBe('needs-checking');
    expect(comparisonState(match, value({ status: 'present', data: 'classical-points-doubles' }, 'source-provisional'))).toBe('needs-checking');
    expect(comparisonState(value({ status: 'present', data: 'known' }, 'source-verified', 'not-modelled'), match)).toBe('needs-checking');
    expect(comparisonState(value({ status: 'absent' }), value({ status: 'absent' }))).toBe('same');
    expect(comparisonState(value({ status: 'absent' }), match)).toBe('different');
  });

  it('defaults to exact BMJA and Bramhall profiles and explains the reviewed table difference', async () => {
    const node = await mount();
    const first = node.querySelector<HTMLSelectElement>('select[aria-label="First exact profile"]')!;
    const second = node.querySelector<HTMLSelectElement>('select[aria-label="Second exact profile"]')!;
    expect([...first.options].map(({ value: option }) => option)).toEqual(expect.arrayContaining(['bmja@1.0', 'buzzard-2000@0.1', 'mcr-wmo-2006@0.1']));
    expect(first.value).toBe('bmja@1.0'); expect(second.value).toBe('outside-the-box@0.1');
    expect(node.textContent).toContain('What happens after a draw?');
    expect(node.textContent).toContain('East stays East. The next hand is played normally.');
    expect(node.textContent).toContain('East stays East. The next hand is Goulash.');
    expect(node.textContent).toContain('profile status Stable');
    expect(node.textContent).toContain('profile status Configured club profile');
    expect(node.textContent).toContain('Bramhall plays Goulash after a draw.');
    expect(node.textContent).not.toContain('Losing players settle with each other using score differences.');
    expect(node.textContent).not.toContain('Same in both');
    expect(node.textContent).not.toContain('hand-mode.outside-the-box-goulash');
    expect(node.textContent).not.toContain('progression.classical-east-cycle');
    expect(node.querySelectorAll('a[href="/rules"]')).toHaveLength(1);
    await act(async () => { (node.querySelector<HTMLInputElement>('input[aria-label="Differences only"]')!).click(); });
    expect(node.textContent).toContain('Losing players settle with each other using score differences.');
    expect(node.textContent).toContain('No difference identified.');
    expect(node.querySelector('section[aria-label="Settlement & incidents"]')).not.toBeNull();
    const drawRow = [...node.querySelectorAll('article')].find((article) => article.textContent?.includes('What happens after a draw?'))!;
    await act(async () => { drawRow.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(drawRow.textContent).toContain('Source evidence source unknown');
    expect(drawRow.textContent).toContain('app support partial');
    expect(drawRow.textContent).toContain('Reviewed in audit');
    expect(drawRow.textContent).toContain('app support executable');
  });

  it('keeps unknown/provisional rows outside Differences and exposes source and app status in details', async () => {
    const node = await mount();
    const first = node.querySelector<HTMLSelectElement>('select[aria-label="First exact profile"]')!;
    await act(async () => { first.value = 'western-tm@0.1'; first.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(node.textContent).toContain('No established differences found for these profiles.');
    const needsChecking = node.querySelector('summary')!;
    expect(needsChecking.textContent).toMatch(/Needs checking/);
    expect(node.querySelector('details')?.open).toBe(false);
    await act(async () => { (node.querySelector<HTMLInputElement>('input[aria-label="Differences only"]')!).click(); });
    expect(node.querySelector('details')?.open).toBe(true);
    expect(node.textContent).toContain('Source evidence source provisional');
    expect(node.textContent).toContain('app support executable');
    expect(node.textContent).toContain('Not yet described in this comparison.');
  });

  it('renders visible labels, grouped comparison content and the selector on the canonical page', () => {
    const markup = renderToStaticMarkup(createElement(MahjongRulesComparedPage));
    expect(markup).toContain('id="exact-profile-title"');
    expect(markup).toContain('First exact profile');
    expect(markup).toContain('Differences only');
    expect(markup).toContain('Explore rules profiles');
  });
});
