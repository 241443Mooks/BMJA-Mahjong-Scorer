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
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('Score this hand');
    expect(html).not.toMatch(/aria-label="[^"]+ rules version"/);
    expect(html).toContain('Rules');
    expect(html).toContain('Filters');
    expect(html).toMatch(/Western — T&amp;M \(\d+\)/);
    expect(html).not.toContain('docs/rules/');
    expect(html).not.toContain('concept-membership');
    expect(html).not.toContain('Outside the Box');
    expect(html).not.toContain('outside-the-box');
    expect(html).not.toContain('Calculated British guidance');
    expect(html).toContain('Special Hands Guide');
    expect(html).toContain('Why it is special');
    expect([...html.matchAll(/Special Hands Atlas|Atlas currently|Atlas learner|predicate|runtime|executable|qualification|provenance|reviewed concept|learner entr(?:y|ies)|exact treatment|exact profile treatment|under this treatment|accepted by this profile|Facets overlap|Outside the Box|outside-the-box/gi)].map(([copy]) => copy)).toEqual([]);
  });

  it('scopes supplemental Purity guidance to British and All rules, excluding Buzzard and Western', () => {
    for (const profile of [{ id: 'buzzard-2000', version: '0.1' }, { id: 'western-tm', version: '0.1' }]) {
      preference.profile = profile;
    expect(renderToStaticMarkup(<SpecialHandsCatalogue />)).not.toContain('British scoring note');
    }
    preference.profile = { id: 'bmja', version: '1.0' };
    expect(renderToStaticMarkup(<SpecialHandsCatalogue />)).toContain('British scoring note');
    preference.profile = { id: 'western-tm', version: '0.1' };
  });

  it('explains the MCR catalogue limit in player-facing language', () => {
    preference.profile = { id: 'mcr-wmo-2006', version: '0.1' };
    const html = renderToStaticMarkup(<SpecialHandsCatalogue />);
    expect(html).toContain('Your remembered rules are MCR. This guide currently covers the supported Classical rules');
    expect(html).not.toContain('Your remembered profile');
    expect(html).not.toContain('supported Classical profiles');
    preference.profile = { id: 'western-tm', version: '0.1' };
  });
});
