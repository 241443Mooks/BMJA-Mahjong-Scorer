import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UnderTheHoodPage } from './UnderTheHoodPage';

describe('UnderTheHoodPage', () => {
  it('explains the trust pipeline without presenting the user walkthrough as the reasoning page', () => {
    const markup = renderToStaticMarkup(<UnderTheHoodPage />);

    expect(markup).toContain('How Mahjong Reference knows what it knows.');
    expect(markup).toContain('Rules → evidence → score → settlement → progression → record.');
    expect(markup).toContain('Unknown means unknown.');
    expect(markup).toContain('Sources are evidence, not decoration.');
    expect(markup).toContain('Establish what is true once. Reuse it everywhere.');
    expect(markup).toContain('href="/rules"');
    expect(markup).toContain('href="/how-it-works"');
    expect(markup).toContain('href="/help"');
    expect(markup).not.toContain('Amazon Associate');
  });
});
