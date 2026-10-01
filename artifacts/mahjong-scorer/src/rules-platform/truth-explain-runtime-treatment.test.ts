import { describe, expect, it } from 'vitest';
import { explainRuntimeTreatment, formatSourceLocator } from '../rules-knowledge/truth/explain-runtime-treatment';

describe('runtime treatment explanation projection', () => {
  it('joins a BMJA binding through its exact treatment, subject, claim and registered source', () => {
    const explanation = explainRuntimeTreatment({
      profile: { id: 'bmja', version: '1.0' },
      ref: { kind: 'binding', id: 'thirteen-unique-wonders' },
    });
    expect(explanation).toMatchObject({
      available: true,
      profile: { id: 'bmja', version: '1.0' },
      subject: { id: 'pattern.thirteen-orphans', kind: 'pattern' },
      evidenceStatus: 'verified',
      sources: [{ citation: 'British Mahjong Association, Special Hands', authority: 'governing', locator: { label: expect.stringContaining('The thirteen unique wonders') } }],
    });
    if (explanation.available) {
      expect(explanation.ruleBasis).toContain('Thirteen Unique Wonders');
      expect(explanation.sources[0]?.locator.url).toBe('https://mahjongbritishrules.wordpress.com/scoring/special-hands/');
    }
  });

  it('uses only the exact profile treatment and never borrows a similar binding', () => {
    expect(explainRuntimeTreatment({ profile: { id: 'bmja', version: '1.0' }, ref: { kind: 'binding', id: 'club-three-great-scholars' } })).toEqual({ available: false });
    expect(explainRuntimeTreatment({ profile: { id: 'outside-the-box', version: '0.1' }, ref: { kind: 'binding', id: 'three-great-scholars' } })).toEqual({ available: false });
    const otb = explainRuntimeTreatment({ profile: { id: 'outside-the-box', version: '0.1' }, ref: { kind: 'binding', id: 'club-three-great-scholars' } });
    expect(otb).toMatchObject({ available: true, profile: { id: 'outside-the-box', version: '0.1' }, subject: { id: 'pattern.otb.club-three-great-scholars' }, evidenceStatus: 'verified-club', sources: [{ citation: 'Outside the Box club guide', authority: 'club-primary', locator: { label: expect.stringContaining('p. 12') } }] });
  });

  it('fails closed for the Western and Buzzard executable truth gaps', () => {
    expect(explainRuntimeTreatment({ profile: { id: 'western-tm', version: '0.1' }, ref: { kind: 'binding', id: 'purity-one-chow' } })).toEqual({ available: false });
    expect(explainRuntimeTreatment({ profile: { id: 'buzzard-2000', version: '0.1' }, ref: { kind: 'binding', id: 'four-concealed-pung-kong-hand' } })).toEqual({ available: false });
  });

  it('formats the locator forms used by registered evidence', () => {
    expect(formatSourceLocator({ kind: 'publication', title: 'Rules', page: '23' })).toBe('Rules · p. 23');
    expect(formatSourceLocator({ kind: 'publication', title: 'Rules', section: '§3.8.1', page: '48–49' })).toBe('Rules · §3.8.1 · pp. 48–49');
    expect(formatSourceLocator({ kind: 'publication', title: 'Companion', page: 'detail pp. 22, 44; synopsis pp. 57–58' })).toBe('Companion · detail pp. 22, 44; synopsis pp. 57–58');
    expect(formatSourceLocator({ kind: 'url', url: 'https://example.test/rules', section: 'Scoring' })).toBe('Scoring');
    expect(formatSourceLocator({ kind: 'club-material', title: 'OTB guide', section: 'Scoring' })).toBe('OTB guide · Scoring');
    expect(formatSourceLocator({ kind: 'image', collection: 'Club archive', imageId: 'Table 3', page: '2' })).toBe('Club archive · Table 3 · p. 2');
  });
});
