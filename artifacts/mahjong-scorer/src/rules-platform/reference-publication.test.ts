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
    expect(hub).toContain('/encyclopaedia/flowers-and-seasons');
    expect(hub).toContain('A green-tile hand whose permitted groups vary by ruleset.');
    expect(hub).toContain('A plain-language guide to how the listed rulesets build an ordinary hand’s score.');
    expect(hub).toContain('The relationship between Gates of Heaven and Nine Gates is unresolved');
    expect(hub).not.toContain('scoring.grammar');
    const guide = renderToStaticMarkup(React.createElement(RouteContent, { path: '/special-hands' }));
    expect(guide).toContain('href="/encyclopaedia"');
  });

  it('publishes the source-to-scorer Flowers and Seasons explanation from governed facts', () => {
    const html = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/flowers-and-seasons' }));
    expect(html).toContain('Encyclopaedia</a> / <a class="underline" href="/rules/british">British Mahjong');
    expect((html.match(/<img\b/g) ?? [])).toHaveLength(8);
    for (const tile of [
      'Flower 1', 'Flower 2', 'Flower 3', 'Flower 4',
      'Season 1', 'Season 2', 'Season 3', 'Season 4',
      'East', 'South', 'West', 'North',
    ]) expect(html).toContain(tile);
    expect(html).toContain('Each Flower or Season adds 4 points');
    expect(html).toContain('matching Flower or Season gives 1 double');
    expect(html).toContain('including that matching-tile double');
    expect(html).toContain('Ordinary hands');
    expect(html).toContain('Fixed special hands');
    expect(html).toContain('Fishing means the hand needs one more tile to win');
    expect(html).toContain('A South player’s Flower 2 (Orchid) adds 4 points');
    expect(html).toContain('Four Seasons add 16 points and give 2 doubles in total');
    expect(html).toContain('Where these rules come from');
    expect(html).toContain('British Mahjong Association, Working out the scores');
    expect(html).toContain('https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/');
    expect(html).toContain('Published-rule difference:');
    expect(html).toContain('below 1,000 points');
    expect(html).toContain('without increasing the final score');
    expect(html).not.toContain('scoreBonusDoubles');
    expect(html).not.toMatch(/evidence\.rule\.classical|bmja@1\.0|\.test\.ts|repository path/i);
    expect(html).not.toContain('The source-to-scorer explanation is unavailable');
  });

  it('publishes the Thirteen Orphans vertical while withholding the governed MCR treatment', () => {
    const html = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/thirteen-orphans' }));
    expect(html).toContain('Thirteen Unique Wonders');
    expect(html).toContain('What it looks like');
    expect(html).toContain('How to make the hand');
    expect(html).toContain('How each ruleset scores it');
    expect(html).toContain('British / BMJA-style');
    expect(html).toContain('Western — T&amp;M');
    expect(html).toContain('Club - Bramhall 2026');
    expect(html).toContain('Buzzard 2000');
    expect(html).toContain('Sources and checking');
    expect(html).toContain('Score');
    expect(html).toContain('Checked against a published source');
    expect(html).not.toContain('source-verified');
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
    expect(jade).toContain('How the forms differ');
    expect(jade).toContain('British / Club - Bramhall 2026 form');
    expect(jade).toContain('Thompson &amp; Maloney Western form');
    expect(jade).toContain('Open British / BMJA-style treatment in Special Hands');
    expect(jade).toContain('Open Club - Bramhall 2026 treatment in Special Hands');
    expect((jade.match(/<img\b/g) ?? []).length).toBeGreaterThan(0);
    expect(jade).not.toContain('broader than imperial jade no chow');
    expect(jade).not.toContain('profile treatments');

    const snake = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/wriggling-snake' }));
    expect(snake).toContain('Wriggling Snake');
    expect(snake).toContain('Wriggly Snake');
    expect(snake).toContain('with the suited 1 duplicated');
    expect(snake).toContain('with any one tile in that thirteen-tile base duplicated');
    expect(snake).toContain('How each ruleset scores it');
    expect(snake).toContain('British / BMJA-style');
    expect(snake).not.toContain('MCR');
  });

  it('explains ordinary scoring in plain language and keeps profile evidence optional', () => {
    const html = renderToStaticMarkup(React.createElement(RouteContent, { path: '/encyclopaedia/scoring-systems' }));
    expect(html).toContain('Scoring system');
    expect(html).toContain('A ruleset first awards points for the hand, then applies any doubles that hand qualifies for.');
    expect(html).toContain('How the listed rulesets score ordinary hands');
    expect(html).toContain('Ordinary hands score points, then apply doubles.');
    expect(html).toContain('Sources and checking');
    expect(html).toContain('Source basis remains provisional');
    expect(html).not.toContain('source-verified');
    expect(html).not.toContain('pattern-accumulator');
    expect(html).not.toContain('Mapped from #406 dimension');
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
