# Actionable rules exceptions

This queue contains source conflicts, broken exact-profile runtime links, missing treatments for sourced claims, ambiguous treatments, and reviewed unresolved decisions. Coverage and migration gaps are reported separately.

- **C1-bmja-goulash** · bmja@1.0 · disclosed · known-discrepancy: Published BMJA follow-up is Goulash; the current scorer does not switch hand mode automatically. Evidence: #539 C1, rule.classical.goulash-round-transition. Check: The player explanation and comparator disclose the source/runtime difference.
- **C3-rob-kong-validation** · bmja@1.0 · unresolved · known-discrepancy: Robbing-Kong eligibility validation remains unresolved. Evidence: #539 C3, src/rules-platform/reconciliation-report.test.ts. Check: The regression assertion requires this unresolved item to remain reported until an exact BMJA eligibility fixture and owner link exist.
- **C6-blessing-chow-wording** · bmja@1.0 · unresolved · source-review: Published blessing/Chow wording has conflicting interpretations. Evidence: #539 C6, src/rules-platform/reconciliation-report.test.ts. Check: The regression assertion requires the source conflict to remain visible until an adjudicated claim is recorded.
- **western-tm@0.1:pattern.western-tm.purity-one-chow:missing-treatment** · western-tm@0.1 · unresolved · truth-record: A sourced claim has no exact-profile treatment record. Evidence: evidence.pattern.western-tm.purity-one-chow. Check: A claim should not imply scorer behaviour without an exact treatment.
