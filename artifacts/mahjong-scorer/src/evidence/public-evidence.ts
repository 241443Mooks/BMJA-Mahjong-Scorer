import eightRulesetStressTest from '../../../../docs/rules/EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md?raw';
import eightRulesetManifests from '../../../../docs/rules/EIGHT_RULESET_PAPER_MANIFESTS.md?raw';
import classicalComparator from '../../../../docs/rules/CLASSICAL_COMPARATOR_AUDIT_V1.md?raw';
import finalCorpusCloseout from '../../../../docs/rules/ISSUE_440F_FINAL_CORPUS_CLOSEOUT.md?raw';
import buzzardEvidence from '../../../../docs/rules/BUZZARD_2000_RULE_EVIDENCE.md?raw';
import knowledgeArchitecture from '../../../../docs/product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md?raw';
import assuranceMethods from '../../../../docs/product/ASSURANCE_VERIFICATION_METHODS.md?raw';

/**
 * Explicit allowlist of repository documents rendered as public evidence pages.
 * Each Markdown import reads the canonical document directly; there is no
 * second content copy under src/.
 */
export const publicEvidenceDocuments = [
  {
    slug: 'eight-ruleset-architecture-stress-test',
    title: 'Eight-ruleset architecture stress test',
    description: 'How Mahjong Reference tested its rules architecture against eight materially different Mahjong families, and what that test does not claim.',
    category: 'Architecture',
    status: 'Pre-implementation architecture validation',
    date: '2026-09-16',
    sourcePath: 'docs/rules/EIGHT_RULESET_ARCHITECTURE_STRESS_TEST.md',
    markdown: eightRulesetStressTest,
  },
  {
    slug: 'eight-ruleset-paper-manifests',
    title: 'Eight-ruleset paper manifests',
    description: 'Paper profiles used to check that distinct Mahjong traditions can retain their own hand, scoring, settlement and progression models.',
    category: 'Architecture',
    status: 'Architecture acceptance input',
    date: '2026-09-16',
    sourcePath: 'docs/rules/EIGHT_RULESET_PAPER_MANIFESTS.md',
    markdown: eightRulesetManifests,
  },
  {
    slug: 'classical-comparator-audit',
    title: 'Classical rules comparator audit v1',
    description: 'A reviewed audit of which Classical-family comparisons are source-established, provisional, runtime-only or unresolved.',
    category: 'Comparison method',
    status: 'Reviewed calibration audit',
    date: '2026-09-20',
    sourcePath: 'docs/rules/CLASSICAL_COMPARATOR_AUDIT_V1.md',
    markdown: classicalComparator,
  },
  {
    slug: 'final-truth-corpus-closeout',
    title: 'Final truth-corpus closeout',
    description: 'How the current rules truth corpus was accounted for, with profile boundaries and explicit unresolved dispositions.',
    category: 'Coverage method',
    status: 'Deterministic corpus closeout',
    date: '2026-10-01',
    sourcePath: 'docs/rules/ISSUE_440F_FINAL_CORPUS_CLOSEOUT.md',
    markdown: finalCorpusCloseout,
  },
  {
    slug: 'buzzard-2000-rule-evidence',
    title: 'Buzzard 2000 rule evidence ledger',
    description: 'A profile-specific evidence ledger recording the source basis, scope and implementation boundaries for Buzzard 2000.',
    category: 'Source provenance',
    status: 'Source-complete for scoring and table-companion design',
    date: '2026-09-16',
    sourcePath: 'docs/rules/BUZZARD_2000_RULE_EVIDENCE.md',
    markdown: buzzardEvidence,
  },
  {
    slug: 'reference-knowledge-architecture',
    title: 'Structured reference and knowledge architecture',
    description: 'The design for keeping executable rules, evidence-backed facts and editorial explanations distinct.',
    category: 'Knowledge architecture',
    status: 'Product design decision; implementation not yet complete',
    date: '2026-09-19',
    sourcePath: 'docs/product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md',
    markdown: knowledgeArchitecture,
  },
  {
    slug: 'assurance-verification-methods',
    title: 'Assurance and verification methods',
    description: 'What human source review, automated checks, typechecking, production builds and architecture reviews can establish, and where their limits remain.',
    category: 'Verification methods',
    status: 'Current project method summary',
    date: '2026-10-01',
    sourcePath: 'docs/product/ASSURANCE_VERIFICATION_METHODS.md',
    markdown: assuranceMethods,
  },
] as const;

export type PublicEvidenceDocument = (typeof publicEvidenceDocuments)[number];

export function publicEvidenceDocumentForSlug(slug: string): PublicEvidenceDocument | undefined {
  return publicEvidenceDocuments.find((document) => document.slug === slug);
}
