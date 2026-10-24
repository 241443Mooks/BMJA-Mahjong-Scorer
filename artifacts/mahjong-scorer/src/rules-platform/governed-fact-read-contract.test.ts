import { describe, expect, it } from 'vitest';
import { currentTruthCorpus } from '../rules-knowledge/truth/current';
import { readGovernedFacts } from '../rules-knowledge/truth/read-contract';
import type { TruthCorpus } from '../rules-knowledge/truth/records';

const bmja = { id: 'bmja', version: '1.0' } as const;
const flowerFact = 'rule.classical.flower-season-base-scoring';
const claimId = `evidence.${flowerFact}.bmja`;

type MutableCorpus = {
  sources: [...TruthCorpus['sources']];
  subjects: [...TruthCorpus['subjects']];
  claims: [...TruthCorpus['claims']];
  treatments: [...TruthCorpus['treatments']];
};

const altered = (change: (copy: MutableCorpus) => void): TruthCorpus => {
  const copy: MutableCorpus = {
    sources: [...currentTruthCorpus.sources],
    subjects: [...currentTruthCorpus.subjects],
    claims: [...currentTruthCorpus.claims],
    treatments: [...currentTruthCorpus.treatments],
  };
  change(copy);
  return copy;
};

const factFor = (corpus: TruthCorpus = currentTruthCorpus) =>
  readGovernedFacts(bmja, corpus).find(({ subject }) => subject.id === flowerFact);

describe('shared governed fact read contract', () => {
  it('joins exact-profile claim, source, versioned treatment and typed scorer connection without copying rule values', () => {
    const fact = factFor();
    expect(fact).toMatchObject({
      factId: `bmja@1.0:${flowerFact}`,
      profile: bmja,
      subject: { id: flowerFact, kind: 'rule', recordVersion: 1 },
      treatment: {
        recordId: `bmja@1.0:${flowerFact}`,
        recordVersion: 1,
        state: { kind: 'executable', ref: { kind: 'rule', id: 'scoring.scoreBonusTiles' } },
      },
      claims: [{
        recordId: claimId,
        recordVersion: 1,
        status: 'verified',
        text: 'Each Flower or Season scores 4 points.',
        source: { recordId: 'bmja-scoring', sourceId: 'bmja-scoring', authority: 'governing' },
      }],
      sourceState: 'verified',
      runtime: {
        state: { kind: 'executable', ref: { kind: 'rule', id: 'scoring.scoreBonusTiles' } },
        mappingState: 'complete',
        capability: 'executable',
        conformance: 'exact-fact-fixture',
      },
      projection: 'source-claim',
    });
  });

  it('keeps exact profile identity and fails closed for missing, ambiguous, unresolved or unsupported links', () => {
    expect(readGovernedFacts({ id: 'bmja', version: '0.9' }).some(({ subject }) => subject.id === flowerFact)).toBe(false);
    expect(factFor(altered((copy) => {
      copy.claims = copy.claims.filter(({ record }) => record.claimId !== claimId);
    }))?.projection).toBe('not-projectable');
    expect(factFor(altered((copy) => {
      const entry = copy.claims.find(({ record }) => record.claimId === claimId)!;
      copy.claims = [...copy.claims, entry];
    }))?.projection).toBe('not-projectable');
    expect(factFor(altered((copy) => {
      const index = copy.treatments.findIndex(({ record }) => record.treatmentId === `bmja@1.0:${flowerFact}`);
      copy.treatments.splice(index, 1);
    }))?.runtime).toMatchObject({ state: 'no-current-treatment', mappingState: 'unavailable' });
    expect(factFor(altered((copy) => {
      const index = copy.treatments.findIndex(({ record }) => record.treatmentId === `bmja@1.0:${flowerFact}`);
      copy.treatments.push(copy.treatments[index]!);
    }))?.runtime).toMatchObject({ state: 'ambiguous-current-treatment', mappingState: 'ambiguous' });
    expect(factFor(altered((copy) => {
      const index = copy.treatments.findIndex(({ record }) => record.treatmentId === `bmja@1.0:${flowerFact}`);
      const entry = copy.treatments[index]!;
      copy.treatments[index] = { ...entry, record: { ...entry.record, runtimeState: { kind: 'executable', ref: { kind: 'rule', id: 'rule.notRegistered' } } } };
    }))?.runtime).toMatchObject({ mappingState: 'incomplete', conformance: 'not-established' });
    expect(factFor(altered((copy) => {
      const index = copy.claims.findIndex(({ record }) => record.claimId === claimId);
      const entry = copy.claims[index]!;
      copy.claims[index] = { ...entry, record: { ...entry.record, status: 'needs-primary-source' } };
    }))?.sourceState).toBe('provisional');
    expect(factFor(altered((copy) => {
      const index = copy.claims.findIndex(({ record }) => record.claimId === claimId);
      const entry = copy.claims[index]!;
      copy.claims[index] = { ...entry, record: { ...entry.record, status: 'conflict' } };
    }))?.sourceState).toBe('conflict');
  });
});
