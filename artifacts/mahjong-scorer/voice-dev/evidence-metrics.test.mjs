import { beforeAll, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { compareEvidence } from './evidence-metrics.mjs';
import { appendConfirmedVoiceGroups, guardVoiceProposal, validateVoiceCandidate, voiceProposalBlockers, voiceProposalSchema } from '../src/game/voice-evidence';
import { getCurrentCompiledRulesRuntime, initialiseCurrentRulesRuntimes } from '../src/rules-platform/current-runtime-registry';
import { BMJA_PROFILE_REF } from '../src/game/ruleset';

const cases = JSON.parse(readFileSync(new URL('./evaluation.json', import.meta.url)));
const holdout = JSON.parse(readFileSync(new URL('./evaluation-holdout.json', import.meta.url)));
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

it.each([...cases, ...holdout])('$id checks evidence, preservation of unresolved facts, and acceptance', item => {
  const proposal = fixture(item);
  expect(assess(item, proposal)).toMatchObject({ exact: true, ready: item.ready, pass: true });
  expect(guardVoiceProposal(proposal)).toEqual(proposal);
  const lostEvidence = { groups: [], unparsed: [item.text] };
  if (item.expected.length) expect(assess(item, lostEvidence).pass).toBe(false);
  if (item.ready) expect(assess(item, lostEvidence).ready).toBe(false);
});

it('withholds a group inferred only from a tile count without duplicating the loose source', () => {
  const item = holdout.find(entry => entry.id === 'H07');
  const loose = { source: item.unparsed[0], kind: 'pair', tile: { family: 'dragon', dragon: 'white' }, visibility: null, ambiguity: null };
  const guarded = guardVoiceProposal({ groups: [loose], unparsed: item.unparsed });
  expect(guarded).toEqual(fixture(item));
  expect(assess(item, guarded)).toMatchObject({ exact: true, ready: false });
});

it('preserves other spoken fields while withholding an unsupported group type', () => {
  const item = holdout.find(entry => entry.id === 'H03');
  const proposal = fixture(item);
  const spoken = proposal.groups[0];
  proposal.groups[0] = { ...spoken, kind: 'pung' };
  const guarded = guardVoiceProposal(proposal);
  expect(guarded.groups[0]).toMatchObject({ ...spoken, kind: null, ambiguity: 'Confirm the group type.' });
  expect(assess(item, guarded).ready).toBe(false);
});

it('withholds a guessed tile for an unresolved conflicting honour name', () => {
  const item = holdout.find(entry => entry.id === 'H05');
  const proposal = fixture(item);
  const spoken = proposal.groups[0];
  proposal.groups[0] = { ...spoken, tile: { family: 'wind', wind: 'south' } };
  const guarded = guardVoiceProposal(proposal);
  expect(guarded.groups[0]).toMatchObject({ ...spoken, ambiguity: 'Confirm the Wind or Dragon tile.' });
  expect(assess(item, guarded)).toMatchObject({ exact: true, ready: false });
});

it('does not withhold a resolved correction merely because the superseded words are present', () => {
  const group = {
    source: 'open pair of west dragons, I mean red dragons',
    kind: 'pair',
    visibility: 'exposed',
    tile: { family: 'dragon', dragon: 'red' },
    ambiguity: null,
  };
  const proposal = { groups: [group], unparsed: [] };
  expect(guardVoiceProposal(proposal)).toEqual(proposal);
});

it.each([
  { family: 'suit', suit: 'characters', rank: 8 },
  { family: 'wind', wind: 'east' },
])('withholds an impossible Chow tile while keeping explicitly stated group fields', tile => {
  const item = holdout.find(entry => entry.id === 'H06');
  const proposal = fixture(item);
  const spoken = proposal.groups[0];
  proposal.groups[0] = { ...spoken, tile, ambiguity: null };
  const guarded = guardVoiceProposal(proposal);
  expect(guarded.groups[0]).toMatchObject({ ...spoken, ambiguity: expect.any(String) });
  expect(assess(item, guarded)).toMatchObject({ exact: true, ready: false });
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
