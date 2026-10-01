import { describe, expect, it } from 'vitest';
import { publicEvidenceDocuments, publicEvidenceDocumentForSlug } from './public-evidence';

describe('public evidence manifest', () => {
  it('is a complete, explicit allowlist with unique routes and source documents', () => {
    const slugs = publicEvidenceDocuments.map((document) => document.slug);
    const sourcePaths = publicEvidenceDocuments.map((document) => document.sourcePath);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(sourcePaths).size).toBe(sourcePaths.length);
    for (const document of publicEvidenceDocuments) {
      expect(document.slug).toMatch(/^[a-z0-9-]+$/);
      expect(document.title.trim()).not.toBe('');
      expect(document.description.trim()).not.toBe('');
      expect(document.category.trim()).not.toBe('');
      expect(document.status.trim()).not.toBe('');
      expect(document.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(document.date))).toBe(false);
      expect(document.sourcePath).toMatch(/^docs\/(rules|product)\/.+\.md$/);
      expect(document.markdown.trim()).not.toBe('');
    }
  });

  it('resolves only documents in the public allowlist', () => {
    expect(publicEvidenceDocumentForSlug('eight-ruleset-architecture-stress-test')).toBeDefined();
    expect(publicEvidenceDocumentForSlug('issue-440a-coverage-audit')).toBeUndefined();
    expect(publicEvidenceDocumentForSlug('../rules/BUZZARD_2000_RULE_EVIDENCE.md')).toBeUndefined();
  });
});
