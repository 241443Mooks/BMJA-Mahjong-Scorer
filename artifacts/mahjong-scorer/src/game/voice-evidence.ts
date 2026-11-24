import { z } from 'zod';
import { expandedTiles, tileKey } from '../scoring/tiles';
import type { GameContext, MahjongHand } from '../scoring/types';
import type { RulesRuntime } from '../rules-platform/classical-runtime';
import { DRAGONS, SET_KINDS, SUITS, WINDS, type HandSet, type PlayingTile } from '../scoring/types';

// Proposals are deliberately not MahjongHand: the scorer cannot represent unknown visibility.
const tileSchema = z.discriminatedUnion('family', [
  z.object({ family: z.literal('suit'), suit: z.enum(SUITS), rank: z.number().int().min(1).max(9) }).strict(),
  z.object({ family: z.literal('wind'), wind: z.enum(WINDS) }).strict(),
  z.object({ family: z.literal('dragon'), dragon: z.enum(DRAGONS) }).strict(),
]);
export const voiceProposalSchema = z.object({
  groups: z.array(z.object({
    source: z.string().min(1).max(300),
    kind: z.enum(SET_KINDS).nullable(),
    tile: tileSchema.nullable(),
    visibility: z.enum(['exposed', 'concealed']).nullable(),
    ambiguity: z.string().trim().min(1).max(500).nullable(),
  }).strict()).max(14),
  unparsed: z.array(z.string().min(1).max(500)).max(20),
}).strict();
export type VoiceProposal = z.infer<typeof voiceProposalSchema>;
export type DraftSet = Omit<HandSet, 'tile'> & { tile: PlayingTile | null };

const groupNames = {
  pung: /\b(?:pung|pong)s?\b/i,
  kong: /\bkongs?\b/i,
  chow: /\bchows?\b/i,
  pair: /\bpairs?\b/i,
};
const conflictingHonourName = /\b(?:(?:east|south|west|north)\s+dragons?|(?:red|green|white)\s+winds?)\b/i;

function invalidChowTile({ kind, tile }: VoiceProposal['groups'][number]): boolean {
  return kind === 'chow' && tile !== null && (tile.family !== 'suit' || tile.rank > 7);
}

/** Withhold unsupported groups and structurally impossible tiles. Preserve their source for review. */
export function guardVoiceProposal(proposal: VoiceProposal): VoiceProposal {
  const groups: VoiceProposal['groups'] = [];
  const unparsed = [...proposal.unparsed];
  for (const group of proposal.groups) {
    if (!Object.values(groupNames).some(name => name.test(group.source))) {
      if (!unparsed.some(fragment => fragment.includes(group.source))) unparsed.push(group.source);
      continue;
    }
    if (group.kind && !groupNames[group.kind].test(group.source)) {
      groups.push({ ...group, kind: null, ambiguity: 'Confirm the group type.' });
    } else if (invalidChowTile(group)) {
      groups.push({ ...group, tile: null, ambiguity: 'A Chow needs three consecutive tiles in one suit.' });
    } else if (group.tile && group.ambiguity && conflictingHonourName.test(group.source)) {
      // An already unresolved honour name cannot support a proposed tile.
      groups.push({ ...group, tile: null, ambiguity: 'Confirm the Wind or Dragon tile.' });
    } else {
      groups.push(group);
    }
  }
  return { groups, unparsed };
}

/** Append only fully confirmed groups; preserve every existing picker entry and id. */
export function appendConfirmedVoiceGroups(
  current: readonly DraftSet[], proposal: unknown, ids: readonly string[],
): DraftSet[] {
  const parsed = voiceProposalSchema.parse(proposal);
  if (voiceProposalBlockers(parsed).length) {
    throw new Error('Resolve all unknown or ambiguous evidence before adding groups.');
  }
  if (ids.length !== parsed.groups.length || ids.some(id => !id || current.some(s => s.id === id)) || new Set(ids).size !== ids.length) {
    throw new Error('Each new group needs a unique id.');
  }
  const additions: HandSet[] = parsed.groups.map((group, index) => {
    const { kind, tile, visibility } = group;
    if (!kind || !tile || !visibility) throw new Error('Unconfirmed group.');
    return { id: ids[index], kind, tile: tile as PlayingTile, visibility };
  });
  return [...current, ...additions];
}

export function voiceProposalBlockers(proposal: VoiceProposal): string[] {
  const blockers: string[] = [];
  if (!proposal.groups.length) blockers.push('No groups identified.');
  proposal.groups.forEach((group, index) => {
    const label = `Group ${index + 1}`;
    if (!group.kind) blockers.push(`${label}: group type unknown.`);
    if (!group.tile) blockers.push(`${label}: tile unknown.`);
    if (!group.visibility) blockers.push(`${label}: exposure unknown.`);
    if (group.ambiguity) blockers.push(`${label}: needs clarification.`);
    if (invalidChowTile(group)) {
      blockers.push(`${label}: invalid Chow.`);
    }
  });
  if (proposal.unparsed.length) blockers.push(`${proposal.unparsed.length} unresolved description fragment(s).`);
  return blockers;
}

/** Validate the same candidate used by the typed review and the evaluation runner. */
export function validateVoiceCandidate(
  sets: readonly DraftSet[], hand: MahjongHand, context: GameContext, runtime: RulesRuntime,
): readonly string[] {
  const complete = sets.filter((item): item is HandSet => item.tile !== null);
  const physical = complete.flatMap(expandedTiles);
  if (physical.length - complete.filter(group => group.kind === 'kong').length > 13) return ['Too many tiles for this hand.'];
  const counts = new Map<string, number>();
  for (const tile of physical) {
    const key = tileKey(tile);
    const count = (counts.get(key) ?? 0) + 1;
    if (count > 4) return ['A tile appears more than four times.'];
    counts.set(key, count);
  }
  return runtime.validateHand({ evidence: { ...hand, sets: complete }, context });
}
