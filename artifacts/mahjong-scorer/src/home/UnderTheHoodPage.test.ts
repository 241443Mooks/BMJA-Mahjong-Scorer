import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { publicEvidenceDocuments } from '../evidence/public-evidence';
import { UnderTheHoodPage } from './UnderTheHoodPage';

describe('UnderTheHoodPage', () => {
  it('makes the assurance chain, evidence limits and verification methods inspectable', () => {
    const markup = renderToStaticMarkup(createElement(UnderTheHoodPage));

    expect(markup).toContain('Built so you can check the answer.');
    expect(markup).toContain('Source-linked');
    expect(markup).toContain('Rules → evidence → score → settlement → progression → record.');
    expect(markup).toContain('Unknown means unknown.');
    expect(markup).toContain('pre-implementation architecture validation');
    expect(markup).toContain('Eight published ruleset families');
    expect(markup).toContain('Classical points × doubles');
    expect(markup).toContain('Pattern accumulator');
    expect(markup).toContain('Riichi han + fu');
    expect(markup).toContain('Versioned target catalogue');
    expect(markup).toContain('Source review');
    expect(markup).toContain('Human interpretation review');
    expect(markup).toContain('Behaviour checks');
    expect(markup).toContain('Architecture checks');
    expect(markup).toContain('Release gates');
    expect(markup).toContain('Three layers, with different authority');
    expect(markup).toContain('What this does not claim');
    expect(markup).toContain('A rule does not become true merely because it appears in the code.');
    expect(markup).toContain('href="/evidence/eight-ruleset-architecture-stress-test"');
    expect(markup).toContain('href="/evidence/reference-knowledge-architecture"');
    expect(markup).toContain('href="/evidence/assurance-verification-methods"');
    expect(markup).not.toContain('github.com/241443Mooks/BMJA-Mahjong-Scorer');
    for (const document of publicEvidenceDocuments) {
      expect(markup).toContain(`href="/evidence/${document.slug}"`);
    }
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/how-it-works"');
    expect(markup).toContain('href="/help"');
    expect(markup).toContain('href="/features"');
    expect(markup).not.toContain('Amazon Associate');
    expect(markup).not.toContain('independently certified');
    expect(markup).not.toContain('guaranteed accurate');
  });
});
