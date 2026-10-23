// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExactProfileComparator, comparisonValuesDiffer, reviewedClassicalRelationship } from './ExactProfileComparator';
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

  it('distinguishes matching, different and unresolved values for difference filtering', () => {
    const match = value({ status: 'present', data: 'classical-points-doubles' });
    expect(comparisonValuesDiffer(match, { ...match, profile: { id: 'buzzard-2000', version: '0.1' } })).toBe(false);
    expect(comparisonValuesDiffer(match, value({ status: 'present', data: 'pattern-accumulator' }))).toBe(true);
    expect(comparisonValuesDiffer(match, value({ status: 'unknown' }, 'source-unknown', 'not-modelled'))).toBe(true);
    expect(comparisonValuesDiffer(match, value({ status: 'present', data: 'classical-points-doubles' }, 'source-provisional'))).toBe(true);
  });

  it('offers exact selectable profile versions and renders grouped values with metadata and rules links', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    await act(async () => root!.render(createElement(ExactProfileComparator)));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });

    const first = container.querySelector<HTMLSelectElement>('select[aria-label="First exact profile"]')!;
    const second = container.querySelector<HTMLSelectElement>('select[aria-label="Second exact profile"]')!;
    expect([...first.options].map(({ value }) => value)).toEqual(expect.arrayContaining(['bmja@1.0', 'buzzard-2000@0.1', 'mcr-wmo-2006@0.1']));
    expect(first.value).toBe('bmja@1.0'); expect(second.value).toBe('buzzard-2000@0.1');
    expect(container.querySelector('section[aria-label="Scoring"]')).not.toBeNull();
    expect(container.textContent).toContain('Source: source verified');
    expect(container.textContent).toContain('Runtime: executable');
    expect(container.textContent).toContain('Audit-reviewed: Buzzard is broader than BMJA');
    expect(reviewedClassicalRelationship('scoring.limit-cap', 'bmja', 'buzzard-2000')).toContain('parameter variation');
    expect(reviewedClassicalRelationship('scoring.limit-cap', 'bmja', 'mcr-wmo-2006')).toBeUndefined();
    expect(container.querySelector('a[href="/rules/british"]')).not.toBeNull();
    expect(container.querySelector('a[href="/rules/buzzard"]')).not.toBeNull();

    await act(async () => { first.value = 'mcr-wmo-2006@0.1'; first.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(container.querySelectorAll('select')[0].value).toBe('mcr-wmo-2006@0.1');
    expect(container.textContent).toContain('pattern-accumulator');
    expect(container.querySelector('a[href="/rules/mcr"]')).not.toBeNull();
  });

  it('keeps unknown and provisional evidence rows in Differences only', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div'); document.body.append(container); root = createRoot(container);
    await act(async () => root!.render(createElement(ExactProfileComparator)));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
    expect(container.querySelector<HTMLInputElement>('input[aria-label="Differences only"]')?.checked).toBe(true);
    const first = container.querySelector<HTMLSelectElement>('select[aria-label="First exact profile"]')!;
    await act(async () => { first.value = 'western-tm@0.1'; first.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(container.textContent).toContain('Rules/source status');
    expect(container.textContent).toContain('unknown');
    expect(container.textContent).toContain('Source: source provisional');
    const toggle = container.querySelector<HTMLInputElement>('input[aria-label="Differences only"]')!;
    await act(async () => { toggle.click(); });
    expect(toggle.checked).toBe(false);
    expect(container.querySelectorAll('article')).toHaveLength(37);
  });

  it('mounts the selector on the existing canonical comparison page', () => {
    const markup = renderToStaticMarkup(createElement(MahjongRulesComparedPage));
    expect(markup).toContain('id="exact-profile-title"');
    expect(markup).toContain('First exact profile');
    expect(markup).toContain('id="exact-profile-title"');
  });
});
