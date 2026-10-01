import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
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
    expect(markup).toContain('Behaviour checks');
    expect(markup).toContain('Architecture checks');
    expect(markup).toContain('Release gates');
    expect(markup).toContain('Three layers, with different authority');
    expect(markup).toContain('What this does not claim');
    expect(markup).toContain('A rule does not become true merely because it appears in the code.');
    expect(markup).toContain('EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md');
    expect(markup).toContain('REFERENCE_KNOWLEDGE_ARCHITECTURE.md');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/how-it-works"');
    expect(markup).toContain('href="/help"');
    expect(markup).toContain('href="/features"');
    expect(markup).not.toContain('Amazon Associate');
    expect(markup).not.toContain('independently certified');
    expect(markup).not.toContain('guaranteed accurate');
  });
});
