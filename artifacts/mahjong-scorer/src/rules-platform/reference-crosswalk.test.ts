import { describe, expect, it } from 'vitest';
import { MCR_2006_FAN_BINDINGS } from './mcr-detectors';
import { rulesDimension } from './profile-dimensions';
import { currentTruthIndex } from '../rules-knowledge/truth';
import {
  referenceConceptsForDimension,
  referenceConceptsForTreatment,
  referenceRelationshipsBetweenConcepts,
  referenceRelationshipsBetweenTreatments,
  referenceRelationshipsForConcept,
  referenceTreatmentsForConcept,
  reviewedReferenceRelationships,
  unresolvedReferenceRelationships,
} from '../rules-knowledge/reference-crosswalk';

describe('Issue 251A2 sparse reference crosswalk', () => {
  it('projects the existing shared Thirteen Orphans subject and preserves exact treatments', () => {
    const treatments = referenceTreatmentsForConcept('pattern.thirteen-orphans').map(({ record }) => record);
    expect(treatments.map(({ treatmentId }) => treatmentId).sort()).toEqual([
      'bmja@1.0:thirteen-unique-wonders',
      'buzzard-2000@0.1:thirteen-unique-wonders',
      'mcr-wmo-2006@0.1:thirteen-orphans',
      'outside-the-box@0.1:thirteen-unique-wonders',
      'western-tm@0.1:thirteen-unique-wonders',
    ]);
    expect(treatments.find(({ treatmentId }) => treatmentId === 'mcr-wmo-2006@0.1:thirteen-orphans')).toMatchObject({
      profile: { id: 'mcr-wmo-2006', version: '0.1' },
      subjectId: 'pattern.thirteen-orphans',
      runtimeState: { kind: 'executable', ref: { kind: 'binding', id: 'mcr2006.fan.thirteen-orphans' } },
      evidenceClaimIds: ['evidence.pattern.thirteen-orphans.mcr-wmo-2006'],
    });
    expect(referenceConceptsForTreatment('bmja@1.0:thirteen-unique-wonders').map(({ conceptId }) => conceptId))
      .toEqual(['pattern.thirteen-orphans']);
    expect(referenceRelationshipsBetweenTreatments(
      'bmja@1.0:thirteen-unique-wonders',
      'mcr-wmo-2006@0.1:thirteen-orphans',
    )).toMatchObject([{ kind: 'equivalent', conceptIds: ['pattern.thirteen-orphans'] }]);
  });

  it('records Imperial Jade as narrower than MCR All Green without merging treatments', () => {
    const relationship = referenceRelationshipsBetweenTreatments(
      'bmja@1.0:imperial-jade',
      'mcr-wmo-2006@0.1:all-green',
    );
    expect(relationship).toMatchObject([{
      kind: 'narrower-than',
      conceptIds: ['pattern.bmja.imperial-jade', 'pattern.mcr-wmo-2006.all-green'],
      treatmentIds: ['bmja@1.0:imperial-jade', 'mcr-wmo-2006@0.1:all-green'],
    }]);
    expect(referenceTreatmentsForConcept('pattern.bmja.imperial-jade').map(({ record }) => record.treatmentId))
      .toContain('bmja@1.0:imperial-jade');
    expect(referenceTreatmentsForConcept('pattern.mcr-wmo-2006.all-green').map(({ record }) => record.treatmentId))
      .toContain('mcr-wmo-2006@0.1:all-green');
    expect(referenceRelationshipsBetweenConcepts(
      'pattern.bmja.imperial-jade',
      'pattern.mcr-wmo-2006.all-green',
    )).toMatchObject([{ kind: 'narrower-than' }]);
  });

  it('exposes Wriggling Snake as profile-specific with no MCR catalogue partner', () => {
    const relationships = referenceRelationshipsForConcept('pattern.bmja.wriggling-snake');
    expect(relationships).toMatchObject([{
      kind: 'profile-specific',
      treatmentIds: ['bmja@1.0:wriggling-snake'],
      peerProfile: { id: 'mcr-wmo-2006', version: '0.1' },
    }]);
    expect(referenceConceptsForTreatment('bmja@1.0:wriggling-snake').map(({ conceptId }) => conceptId))
      .toEqual(['pattern.bmja.wriggling-snake']);
    expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
    expect(MCR_2006_FAN_BINDINGS.some(({ id }) => id === 'mcr2006.fan.wriggling-snake')).toBe(false);
    expect(currentTruthIndex.treatmentById('bmja@1.0:wriggling-snake')?.record.evidenceClaimIds)
      .toEqual(['evidence.pattern.bmja.wriggling-snake']);
  });

  it('maps the scoring grammar dimension to its dimension-backed concept projection', () => {
    const mapping = referenceConceptsForDimension('scoring.grammar');
    expect(mapping).toMatchObject([{ conceptId: 'dimension:scoring.grammar', dimensionIds: ['scoring.grammar'] }]);
    expect(rulesDimension(mapping[0]!.dimensionIds[0]!).id).toBe('scoring.grammar');
  });

  it('keeps Gates of Heaven and Nine Gates explicitly unresolved', () => {
    const unresolved = unresolvedReferenceRelationships();
    expect(unresolved).toMatchObject([{
      id: 'gates-of-heaven-nine-gates-unresolved',
      kind: 'unresolved',
      conceptIds: ['pattern.bmja.gates-of-heaven', 'pattern.mcr-wmo-2006.nine-gates'],
      treatmentIds: ['bmja@1.0:gates-of-heaven', 'mcr-wmo-2006@0.1:nine-gates'],
    }]);
    expect(referenceRelationshipsBetweenTreatments(
      'bmja@1.0:gates-of-heaven',
      'mcr-wmo-2006@0.1:nine-gates',
    )).toEqual(unresolved);
  });

  it('keeps every relationship attached to existing governed treatment and claim identities', () => {
    for (const relationship of reviewedReferenceRelationships) {
      const treatments = relationship.treatmentIds.map((id) => currentTruthIndex.treatmentById(id)?.record);
      expect(treatments.every(Boolean), relationship.id).toBe(true);
      for (const claimId of relationship.evidenceClaimIds) {
        expect(currentTruthIndex.claimById(claimId), `${relationship.id}: ${claimId}`).toBeDefined();
        expect(treatments.some((treatment) => treatment?.evidenceClaimIds.includes(claimId)), `${relationship.id}: ${claimId}`)
          .toBe(true);
      }
    }
  });
});
