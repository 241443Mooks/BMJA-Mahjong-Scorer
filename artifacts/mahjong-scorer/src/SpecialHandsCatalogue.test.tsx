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
  });
});
