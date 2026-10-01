import { describe, expect, it } from 'vitest';
import { publicEvidenceDocuments } from './public-evidence';
import { renderEvidenceMarkdown } from './render-markdown';

const currentDocument = publicEvidenceDocuments.find((document) => document.slug === 'eight-ruleset-architecture-stress-test')!;

describe('renderEvidenceMarkdown', () => {
  it('keeps semantic structure and maps allowlisted source links to internal pages', () => {
    const html = renderEvidenceMarkdown(
      '# Evidence title\n\n## Section\n\n| A | B |\n| --- | --- |\n| one | two |\n\n[Manifest](./EIGHT_RULESET_PAPER_MANIFESTS.md#1-acceptance-rule)',
      currentDocument,
    );

    expect(html).toContain('<h2 id="evidence-title">Evidence title</h2>');
    expect(html).toContain('<h3 id="section">Section</h3>');
    expect(html).toContain('<table>');
    expect(html).toContain('href="/evidence/eight-ruleset-paper-manifests#1-acceptance-rule"');
  });

  it('escapes embedded HTML, strips unsafe URLs, and does not publish unlisted source links', () => {
    const html = renderEvidenceMarkdown(
      '<script>alert(1)</script>\n\n[Unsafe](javascript:alert%281%29)\n\n[Private file](./ISSUE_440A_COVERAGE_AUDIT.md)',
      currentDocument,
    );

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('ISSUE_440A_COVERAGE_AUDIT.md');
    expect(html).toContain('Unsafe');
    expect(html).toContain('Private file');
  });
});
