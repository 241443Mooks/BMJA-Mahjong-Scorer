import { z } from 'zod';
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
    ambiguity: z.string().max(500).nullable(),
  }).strict()).max(14),
  unparsed: z.array(z.string().min(1).max(500)).max(20),
}).strict();
export type VoiceProposal = z.infer<typeof voiceProposalSchema>;
export type DraftSet = Omit<HandSet, 'tile'> & { tile: PlayingTile | null };

/** Append only fully confirmed groups; preserve every existing picker entry and id. */
export function appendConfirmedVoiceGroups(
  current: readonly DraftSet[], proposal: unknown, ids: readonly string[],
): DraftSet[] {
  const parsed = voiceProposalSchema.parse(proposal);
  if (parsed.unparsed.length || parsed.groups.some(g => !g.kind || !g.tile || !g.visibility || g.ambiguity)) {
    throw new Error('Resolve all unknown or ambiguous evidence before adding groups.');
  }
  if (ids.length !== parsed.groups.length || ids.some(id => !id || current.some(s => s.id === id)) || new Set(ids).size !== ids.length) {
    throw new Error('Each new group needs a unique id.');
  }
  const additions: HandSet[] = parsed.groups.map((group, index) => {
    const { kind, tile, visibility } = group;
    if (!kind || !tile || !visibility) throw new Error('Unconfirmed group.');
    if (kind === 'chow' && (tile.family !== 'suit' || tile.rank > 7)) throw new Error('Invalid chow.');
    return { id: ids[index], kind, tile: tile as PlayingTile, visibility };
  });
  return [...current, ...additions];
}
