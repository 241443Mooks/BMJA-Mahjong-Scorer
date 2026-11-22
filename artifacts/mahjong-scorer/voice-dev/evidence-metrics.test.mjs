import { beforeAll, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { compareEvidence } from './evidence-metrics.mjs';
import { appendConfirmedVoiceGroups, validateVoiceCandidate, voiceProposalBlockers, voiceProposalSchema } from '../src/game/voice-evidence';
import { getCurrentCompiledRulesRuntime, initialiseCurrentRulesRuntimes } from '../src/rules-platform/current-runtime-registry';
import { BMJA_PROFILE_REF } from '../src/game/ruleset';

const cases = JSON.parse(readFileSync(new URL('./evaluation.json', import.meta.url)));
let runtime;
beforeAll(async () => {
  await initialiseCurrentRulesRuntimes();
  ({ runtime } = getCurrentCompiledRulesRuntime(BMJA_PROFILE_REF));
});

function fixture(item) {
  return voiceProposalSchema.parse({
    groups: item.expected.map(([kind, family, identity, rank, visibility], index) => ({
      source: item.sources[index],
      kind, visibility,
      tile: family === 'suit' ? { family, suit: identity, rank } : family ? { family, [family]: identity } : null,
      ambiguity: family === null ? 'Tile requires clarification.' : null,
    })),
    unparsed: item.unparsed,
  });
}

function assess(item, proposal) {
  const blockers = voiceProposalBlockers(proposal);
  if (!blockers.length) {
    const groups = appendConfirmedVoiceGroups([], proposal, proposal.groups.map((_, i) => `test-${i}`));
    const hand = { sets: [], bonusTiles: [], isWinner: false };
    const context = { playerWind: 'east', prevailingWind: 'east', limit: runtime.defaultTableLimit, handMode: 'normal' };
    blockers.push(...validateVoiceCandidate(groups, hand, context, runtime));
  }
  return compareEvidence(item, proposal, blockers);
}

it.each(cases)('$id checks evidence, preservation of unresolved facts, and acceptance', item => {
  const proposal = fixture(item);
  expect(assess(item, proposal)).toMatchObject({ exact: true, ready: item.ready, pass: true });
  const lostEvidence = { groups: [], unparsed: [item.text] };
  if (item.expected.length) expect(assess(item, lostEvidence).pass).toBe(false);
  if (item.ready) expect(assess(item, lostEvidence).ready).toBe(false);
});

it('rejects guesses even when a proposal carries an ambiguity flag', () => {
  const item = cases.find(entry => entry.id === '17');
  const proposal = fixture(item);
  proposal.groups[0].tile = { family: 'wind', wind: 'west' };
  expect(assess(item, proposal)).toMatchObject({
    exact: false, ready: false, readinessMatches: true, guesses: ['group 1 incorrect or unsupported tile family', 'group 1 incorrect or unsupported tile identity'],
  });
});

it('distinguishes exact unknown exposure from a guessed exposure or a missing known fact', () => {
  const item = cases.find(entry => entry.id === '07');
  const proposal = fixture(item);
  expect(assess(item, proposal)).toMatchObject({ exact: true, unresolved: 1, ready: false });
  proposal.groups[0].visibility = 'concealed';
  expect(assess(item, proposal)).toMatchObject({ exact: false, unresolved: 0, ready: true, guesses: ['group 1 incorrect or unsupported exposure'] });
  proposal.groups[0].visibility = null;
  proposal.groups[0].tile = null;
  expect(assess(item, proposal)).toMatchObject({ exact: false, ready: false, guesses: [] });
  expect(assess(item, proposal).omissions).toContain('group 1 missing tile identity');
});

it('accepts valid evidence in a different group order and rejects fabricated source spans', () => {
  const item = cases.find(entry => entry.id === '11');
  const proposal = fixture(item);
  proposal.groups.reverse();
  expect(assess(item, proposal).pass).toBe(true);
  proposal.groups[0].source = 'something nobody said';
  expect(assess(item, proposal).sourceErrors).toEqual(['group 2 missing its supporting source span']);
});

it('rejects an unrelated unresolved fragment and preserves supported groups in mixed cases', () => {
  const item = cases.find(entry => entry.id === '22');
  const proposal = fixture(item);
  proposal.unparsed = ['chatter'];
  expect(assess(item, proposal)).toMatchObject({ exact: false, ready: false, unresolved: 0 });
  expect(assess(item, proposal).omissions).toContain('unresolved fragment 1 missing its source span');
  expect(assess(item, { groups: [], unparsed: item.unparsed }).omissions).toContain('group 1 missing');
});
