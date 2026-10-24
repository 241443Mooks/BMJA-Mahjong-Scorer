// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExactProfileComparator, comparisonGroupRows, comparisonState, comparisonValuesDiffer } from './ExactProfileComparator';
import { MahjongRulesComparedPage } from './MahjongRulesComparedPage';
import { RULES_DIMENSIONS, type ProfileDimensionValue } from '../rules-platform/profile-dimensions';

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
    expect(comparisonState(match, value({ status: 'present', data: 'classical-points-doubles' }, 'source-provisional'))).toBe('same');
    expect(comparisonState(match, value({ status: 'present', data: 'pattern-accumulator' }, 'source-provisional'))).toBe('different');
    expect(comparisonState(value({ status: 'present', data: 'known' }, 'source-verified', 'not-modelled'), match)).toBe('needs-checking');
    expect(comparisonState(value({ status: 'absent' }), value({ status: 'absent' }))).toBe('same');
    expect(comparisonState(value({ status: 'absent' }), match)).toBe('different');
    const noTransfers = { ...value({ status: 'present', data: 'product-wording-a' }), comparisonKey: 'draw:no-payments', playerAnswer: 'Nobody pays after a draw.' };
    const noSettlement = { ...value({ status: 'present', data: 'product-wording-b' }), comparisonKey: 'draw:no-payments', playerAnswer: 'No score or settlement is made.' };
    expect(comparisonState(noTransfers, noSettlement)).toBe('same');
    expect(comparisonState({ ...noSettlement, comparisonKey: 'draw:payments-made' }, noTransfers)).toBe('different');
  });

  it('keeps an all-same category visible when same rules are requested', () => {
    const makeRow = (dimensionId: string, state: 'same' | 'different') => ({
      definition: RULES_DIMENSIONS.find(({ id }) => id === dimensionId)!,
      a: value({ status: 'present', data: dimensionId }),
      b: value({ status: 'present', data: state === 'same' ? dimensionId : `${dimensionId}-other` }),
      state,
    });
    const rows = [makeRow('play.ordinary-chow-policy', 'different'), makeRow('settlement.winner-payments', 'same')];
    const grouped = comparisonGroupRows(rows.filter(({ state }) => state === 'different'), rows.filter(({ state }) => state === 'same'), true);
    expect(grouped.find(({ title }) => title === 'Tiles and hands')).toMatchObject({ differences: [{ state: 'different' }], same: [], rows: [{ state: 'different' }] });
    expect(grouped.find(({ title }) => title === 'Payments and what happens next')).toMatchObject({ differences: [], same: [{ state: 'same' }], rows: [{ state: 'same' }] });
  });

  it('defaults to exact BMJA and Bramhall profiles and shows shared player-facing facts', async () => {
    const node = await mount();
    const first = node.querySelector<HTMLSelectElement>('select[aria-label="First ruleset"]')!;
    const second = node.querySelector<HTMLSelectElement>('select[aria-label="Second ruleset"]')!;
    expect([...first.options].map(({ value: option }) => option)).toEqual(expect.arrayContaining(['bmja@1.0', 'buzzard-2000@0.1', 'mcr-wmo-2006@0.1']));
    expect(first.value).toBe('bmja@1.0'); expect(second.value).toBe('outside-the-box@0.1');
    expect(node.textContent).toContain('What happens after a draw?');
    expect(node.textContent).toContain('The published rules restart as Goulash after a drawn hand; the current scorer does not switch hand mode automatically.');
    expect(node.textContent).toContain('East stays East and the next hand is Goulash.');
    expect(node.textContent).toContain('profile status Stable');
    expect(node.textContent).toContain('profile status Configured club profile');
    expect(node.textContent).toContain('Largest established differences');
    expect(node.textContent).toContain('The club catalogue lists 33 unique named special hands.');
    expect(node.textContent).toContain('18 inventoried named-hand entries');
    expect(node.textContent).toContain('A waiting hand needs one tile to complete it.');
    expect(node.textContent).not.toContain('Losing players settle score differences with each other.');
    expect(node.textContent).not.toContain('Same in both');
    expect(node.textContent).toContain('A drawn BMJA hand scores nothing and has no settlement.');
    expect(node.textContent).toContain('rule.classical.goulash-round-transition');
    expect(node.textContent).toContain('rule.otb.goulash-round-transition');
    expect(node.textContent).toContain('scoring.scoreBonusTiles');
    expect(node.textContent).toContain('evidence.rule.classical.flower-season-base-scoring.bmja');
    expect(node.textContent).not.toContain('progression.classical-east-cycle');
    expect(node.querySelectorAll('a[href="/rules"]')).toHaveLength(1);
    expect(node.querySelectorAll('a[href="/special-hands"]')).toHaveLength(1);
    expect(node.textContent).not.toContain('current product interpretation');
    expect(node.textContent).not.toContain('source interpretation needs checking');
    await act(async () => { (node.querySelector<HTMLInputElement>('input[aria-label="Show the same rules too"]')!).click(); });
    expect(node.textContent).toContain('Showing a set changes its points.');
    expect(node.textContent).toContain('Chows score no points. Pungs score 2/4');
    expect(node.textContent).toContain('A player may win on a tile taken from another player’s Kong. The win earns one double.');
    expect(node.textContent).toContain('13 tiles while waiting and 14 when complete');
    expect(node.textContent).toContain('four blank substitute tiles');
    expect(node.textContent).toContain('Ask your table how exposure affects ordinary sets.');
    expect(node.textContent).toContain('Check with your table whether ordinary hands may contain more than one Chow.');
    expect(node.textContent).toContain('Losing players settle score differences with each other.');
    expect(node.textContent).toContain('Nobody pays anything after a drawn hand.');
    expect(node.textContent).toContain('Payments and what happens next');
    const drawRow = [...node.querySelectorAll('details article')].find((article) => article.textContent?.includes('What happens after a draw?'))!;
    await act(async () => { drawRow.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(drawRow.textContent).toContain('source evidence source verified');
    expect(drawRow.textContent).toContain('app support partial');
    expect(drawRow.textContent).toContain('verified club');
    expect(drawRow.textContent).toContain('app support executable');
    const exposureRow = [...node.querySelectorAll('li')].find((item) => item.textContent?.includes('Exposed vs concealed'))!;
    expect(exposureRow.textContent).toContain('Ask your table how exposure affects ordinary sets.');
    const governedEvidence = [...node.querySelectorAll('details')].find((details) => details.textContent?.includes('Where this comparison comes from'))!;
    await act(async () => { governedEvidence.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(governedEvidence.textContent).toContain('rule.classical.goulash-round-transition');
    expect(governedEvidence.textContent).toContain('rule.classical.flower-season-base-scoring');
  });

  it('keeps unknown facts out of difference cards and retains them in collapsed coverage details', async () => {
    const node = await mount();
    const first = node.querySelector<HTMLSelectElement>('select[aria-label="First ruleset"]')!;
    await act(async () => { first.value = 'mcr-wmo-2006@0.1'; first.dispatchEvent(new Event('change', { bubbles: true })); });
    const second = node.querySelector<HTMLSelectElement>('select[aria-label="Second ruleset"]')!;
    await act(async () => { second.value = 'buzzard-2000@0.1'; second.dispatchEvent(new Event('change', { bubbles: true })); });
    const coverage = [...node.querySelectorAll('details')].find(({ textContent }) => textContent?.includes('Still to check'))!;
    expect(coverage.open).toBe(false);
    expect(node.textContent).not.toContain('Not yet described in this comparison.');
    expect(node.textContent).not.toContain('Not established in comparison data');
    await act(async () => { coverage.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(coverage.open).toBe(true);
    expect(coverage.textContent).toContain('The available Buzzard source does not establish whether substitute tiles are used in ordinary play.');
  });

  it('uses profile-local answers after switching away from the default pair', async () => {
    const node = await mount();
    const first = node.querySelector<HTMLSelectElement>('select[aria-label="First ruleset"]')!;
    await act(async () => { first.value = 'buzzard-2000@0.1'; first.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(node.textContent).toContain('Ordinary hands may contain more than one Chow.');
    expect(node.textContent).toContain('a completed Standing Hand adds 100 points.');
    expect(node.textContent).toContain('The Buzzard source lists 10 named limit hands.');
    expect(node.textContent).not.toContain('Bramhall plays Goulash after a draw.');
  });

  it('explains identical profile selection and shows same answers when requested', async () => {
    const node = await mount();
    const second = node.querySelector<HTMLSelectElement>('select[aria-label="Second ruleset"]')!;
    await act(async () => { second.value = 'bmja@1.0'; second.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(node.textContent).toContain('Both selectors show British / BMJA-style 1.0, so there are no cross-profile differences to show.');
    expect(node.textContent).toContain('Still to check');
    const showSame = node.querySelector<HTMLInputElement>('input[aria-label="Show the same rules too"]')!;
    await act(async () => { showSame.click(); });
    expect(node.textContent).toContain('Tiles and hands');
    expect(node.textContent).toContain('Payments and what happens next');
    expect(node.textContent).toContain('same');
  });

  it('labels each answer with its selected profile and exposes the labels to assistive technology on wide layouts', async () => {
    const node = await mount();
    const details = [...node.querySelectorAll('details')].find(({ textContent }) => textContent?.includes('Payments and what happens next'))!;
    const drawRow = [...details.querySelectorAll('article')].find(({ textContent }) => textContent?.includes('What happens after a draw?'))!;
    const labels = [...drawRow.querySelectorAll('p')].filter(({ className }) => className.includes('sm:sr-only'));
    expect(labels[0].textContent).toContain('BMJA');
    expect(labels[1].textContent).toContain('Bramhall');
    expect(labels).toHaveLength(2);
  });

  it('renders visible labels, grouped comparison content and the selector on the canonical page', () => {
    const markup = renderToStaticMarkup(createElement(MahjongRulesComparedPage));
    expect(markup).toContain('id="exact-profile-title"');
    expect(markup).toContain('First ruleset');
    expect(markup).toContain('Show the same rules too');
    expect(markup).toContain('Explore other Mahjong traditions');
  });
});
