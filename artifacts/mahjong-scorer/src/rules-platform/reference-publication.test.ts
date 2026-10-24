import { describe, expect, it, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RouteContent } from '../RouteContent';
import { initialiseCurrentRulesRuntimes } from './current-runtime-registry';
import { referencePublicationPolicy, projectPublicConcept } from '../rules-knowledge/reference-publication';
import { referenceConceptsForDimension, unresolvedReferenceRelationships } from '../rules-knowledge/reference-crosswalk';
import { PublicTreatmentCard } from '../rules-knowledge/PublicReferencePage';

beforeAll(() => initialiseCurrentRulesRuntimes());

describe('Issue 251B public reference projection', () => {
  it('provides an Encyclopaedia hub and keeps the established Special Hands guide discoverable', () => {
    const hub = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia' }));
    expect(hub).toContain('Mahjong concepts across rules');
    expect(hub).toContain('/encyclopaedia/thirteen-orphans');
    expect(hub).toContain('Gates of Heaven and Nine Gates remains unresolved');
    const guide = renderToStaticMarkup(React.createElement(RouteContent, { path: '/special-hands' }));
    expect(guide).toContain('href="/encyclopaedia"');
  });

  it('publishes the Thirteen Orphans vertical while withholding the governed MCR treatment', () => {
    const html = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/thirteen-orphans' }));
    expect(html).toContain('Thirteen Unique Wonders');
    expect(html).toContain('British / BMJA-style');
    expect(html).toContain('Western — T&amp;M');
    expect(html).toContain('Club - Bramhall 2026');
    expect(html).toContain('Buzzard 2000');
    expect(html).toContain('Provenance');
    expect(html).toContain('Scoring treatment');
    expect(html).toContain('Fixed');
    expect(html).toContain('Thirteen unique wonders');
    expect(html).toContain('/hand?rules=british');
    expect(html).not.toContain('MCR');
  });

  it('publishes Imperial Jade and Wriggling Snake without leaking withheld MCR relationships', () => {
    const jade = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/imperial-jade' }));
    expect(jade).toContain('Imperial Jade');
    expect(jade).toContain('British / BMJA-style');
    expect(jade).not.toContain('All Green');
    expect(jade).toContain('Related profile forms');
    expect(jade).toContain('does not assert that the forms are equivalent');
    expect(jade).toContain('broader than imperial jade no chow');
    expect(jade).toContain('Open exact profile treatment in Special Hands');

    const snake = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/wriggling-snake' }));
    expect(snake).toContain('Wriggling Snake');
    expect(snake).toContain('British / BMJA-style');
    expect(snake).not.toContain('MCR');
  });

  it('projects the #406 scoring grammar from runtime data and omits the unpublished profile', () => {
    const html = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/scoring-systems' }));
    expect(html).toContain('Scoring system');
    expect(html).toContain('Mapped from #406 dimension');
    expect(html).toContain('scoring.grammar');
    expect(html).toContain('Ordinary hands score points, then apply doubles.');
    expect(html).not.toContain('pattern-accumulator');
    expect(referenceConceptsForDimension('scoring.grammar').map(({ conceptId }) => conceptId))
      .toContain('dimension:scoring.grammar');
  });

  it('keeps the Gates of Heaven / Nine Gates relationship internal and unresolved', () => {
    expect(unresolvedReferenceRelationships()).toHaveLength(1);
    expect(referencePublicationPolicy.relationships['gates-of-heaven-nine-gates-unresolved']).toBe('withheld');
    expect(renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/gates-of-heaven' }))).toContain('Page not found');
  });

  it('accepts a future publishable profile treatment with no profile-specific projection change', () => {
    const future = {
      treatmentId: 'future-rules@1.0:thirteen-unique-wonders',
      profile: { id: 'future-rules', version: '1.0' },
      label: 'Thirteen Unique Wonders under Future Rules',
    };
    const policy = {
      concepts: { 'pattern.thirteen-orphans': 'publishable' as const },
      treatments: { [future.treatmentId]: 'publishable' as const },
      relationships: {},
      profiles: {},
    };
    const projection = projectPublicConcept({
      conceptId: 'pattern.thirteen-orphans',
      policy,
      treatments: [future],
      relationships: [],
      presentTreatment: (treatment) => treatment.label,
    });
    expect(projection?.treatments).toEqual([{
      treatment: future,
      treatmentId: future.treatmentId,
      profile: future.profile,
      presentation: future.label,
    }]);
    const card = renderToStaticMarkup(React.createElement(PublicTreatmentCard, {
      treatmentId: future.treatmentId,
      presentation: { name: future.label, profile: 'Future Rules', scorerHref: '/hand?rules=future', value: 'Fixed · 10 winner', description: 'Synthetic source-backed example.' },
    }));
    expect(card).toContain('Future Rules');
    expect(card).toContain('Thirteen Unique Wonders under Future Rules');
    expect(card).toContain('/hand?rules=future');
  });
});
