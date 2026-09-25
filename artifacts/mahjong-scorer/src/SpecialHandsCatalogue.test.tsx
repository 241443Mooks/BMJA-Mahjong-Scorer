import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

const preference = vi.hoisted(() => ({ profile: { id: 'western-tm', version: '0.1' } }));

vi.mock('./game/preferred-rules-profile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./game/preferred-rules-profile')>();
  return { ...actual, readPreferredRulesProfile: () => preference.profile };
});

import { SpecialHandsCatalogue } from './guide/SpecialHandsCatalogue';

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('Special Hands Catalogue rendering', () => {
  it('keeps the BMJA legacy treatment anchor in the DOM with Western as My rules', () => {
    const html = renderToStaticMarkup(<SpecialHandsCatalogue />);
    expect(html.match(/id="thirteen-unique-wonders"/g)).toHaveLength(1);
    expect(html).toMatch(/<summary id="thirteen-unique-wonders"[^>]*>[\s\S]*?Thirteen Unique Wonders/);
    expect(html).toContain('Your rules');
    expect(html).toContain('Rules');
    expect(html).toContain('Filters');
    expect(html).toMatch(/Western — T&amp;M \(\d+\)/);
    expect(html).not.toContain('docs/rules/');
    expect(html).not.toContain('concept-membership');
    expect(html).not.toContain('Outside the Box');
    expect(html).not.toContain('outside-the-box');
    expect(html).not.toContain('Calculated British guidance');
  });

  it('scopes supplemental Purity guidance to British and All rules, excluding Buzzard and Western', () => {
    for (const profile of [{ id: 'buzzard-2000', version: '0.1' }, { id: 'western-tm', version: '0.1' }]) {
      preference.profile = profile;
      expect(renderToStaticMarkup(<SpecialHandsCatalogue />)).not.toContain('Calculated British guidance');
    }
    preference.profile = { id: 'bmja', version: '1.0' };
    expect(renderToStaticMarkup(<SpecialHandsCatalogue />)).toContain('Calculated British guidance');
    preference.profile = { id: 'western-tm', version: '0.1' };
  });
});
