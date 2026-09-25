import { detectSpecialHands, dragon, suited, wind } from '../scoring';
import type { MahjongHand, PlayingTile, Wind } from '../scoring';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { specialHandBindingsForCurrentClassicalProfile } from '../rules-knowledge/current-classical-special-hand-bindings';
import { ATLAS_EXAMPLE_BY_ID, ATLAS_LEARNER_ENTRIES } from './special-hands-atlas';
import { exampleHandScorerContext, handScorerContextForAtlasExample, specialHandExampleById } from './special-hand-examples';
import type { ResolvedScorerExample } from './scoring-examples';

function tile(id: string): PlayingTile | undefined {
  const suitedMatch = /^(\d)-(bamboo|circles|characters)$/.exec(id);
  if (suitedMatch) return suited(suitedMatch[2] as 'bamboo' | 'circles' | 'characters', Number(suitedMatch[1]) as 1|2|3|4|5|6|7|8|9);
  const windMatch = /^(east|south|west|north)-wind$/.exec(id);
  if (windMatch) return wind(windMatch[1] as Wind);
  const dragonMatch = /^(red|green|white)-dragon$/.exec(id);
  if (dragonMatch) return dragon(dragonMatch[1] as 'red' | 'green' | 'white');
  return undefined;
}

function materialize(exampleId: string): MahjongHand | undefined {
  const example = ATLAS_EXAMPLE_BY_ID.get(exampleId);
  if (!example || example.kind !== 'tile-hand') return undefined;
  if (example.source.type === 'existing-example' && example.source.id) return specialHandExampleById(example.source.id)?.hand;
  if (example.source.type !== 'structured-proof') return undefined;
  const sets: NonNullable<MahjongHand['sets']> = [];
  for (const [index, group] of (example.source.groups ?? []).entries()) {
    const members = group.tiles?.map(tile) ?? (group.tile ? [tile(group.tile)] : []);
    if (members.length === 0 || members.some((member) => !member)) return undefined;
    const parsed = members as PlayingTile[];
    if (group.kind === 'chow') {
      if (parsed.length !== 3 || !parsed.every((member): member is Extract<PlayingTile, { family: 'suit' }> => member.family === 'suit')) return undefined;
      const [first, second, third] = parsed;
      if (second.suit !== first.suit || third.suit !== first.suit || second.rank !== first.rank + 1 || third.rank !== first.rank + 2) return undefined;
      sets.push({ id: `atlas-${index}`, kind: 'chow', tile: first, visibility: 'concealed' });
      continue;
    }
    if (group.kind !== 'pung' && group.kind !== 'kong' && group.kind !== 'pair') return undefined;
    if (parsed.length !== 1) return undefined;
    sets.push({ id: `atlas-${index}`, kind: group.kind as 'pung' | 'kong' | 'pair', tile: parsed[0], visibility: 'concealed' });
  }
  if (!sets.length) return undefined;
  return { sets, looseTiles: (example.source.looseTiles ?? []).map(tile).filter((member): member is PlayingTile => !!member), bonusTiles: [], isWinner: true, winningMethod: 'wall' };
}

export function atlasExampleProvesTreatment(exampleId: string, referenceId: string): boolean {
  const match = /^([^@]+)@([^:]+):(.+)$/.exec(referenceId);
  const descriptor = match && PUBLIC_RULES_DESCRIPTORS.find(({ profile }) => profile.id === match[1] && profile.version === match[2]);
  const hand = materialize(exampleId);
  if (!match || !descriptor || !hand) return false;
  const associated = ATLAS_LEARNER_ENTRIES.some((entry) =>
    entry.exampleIds?.includes(exampleId) && entry.treatmentReferenceIds.includes(referenceId) ||
    entry.variants?.some((variant) => variant.exampleIds?.includes(exampleId) && variant.treatmentReferenceIds?.includes(referenceId)),
  );
  if (!associated) return false;
  return detectSpecialHands(hand, { playerWind: 'east', prevailingWind: 'east', limit: 1000 }, [...specialHandBindingsForCurrentClassicalProfile(descriptor.profile)]).some(({ id }) => id === match[3]);
}

export function resolveAtlasScorerExample(exampleId: string, rulesSlug: string, patternId: string): ResolvedScorerExample | undefined {
  const descriptor = PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === rulesSlug);
  const example = ATLAS_EXAMPLE_BY_ID.get(exampleId);
  if (!descriptor || !example || !atlasExampleProvesTreatment(exampleId, `${descriptor.profile.id}@${descriptor.profile.version}:${patternId}`)) return undefined;
  const existing = example.source.type === 'existing-example' && example.source.id ? specialHandExampleById(example.source.id) : undefined;
  const hand = materialize(exampleId);
  if (!hand) return undefined;
  const name = ATLAS_LEARNER_ENTRIES.find((entry) => entry.exampleIds?.includes(exampleId) || entry.variants?.some((variant) => variant.exampleIds?.includes(exampleId)))?.displayName ?? 'Special hand';
  return {
    id: exampleId,
    name,
    hand,
    context: existing ? exampleHandScorerContext(existing) : handScorerContextForAtlasExample(name, hand),
    returnHref: `/special-hands#atlas-entry-${ATLAS_LEARNER_ENTRIES.find((entry) => entry.exampleIds?.includes(exampleId) || entry.variants?.some((variant) => variant.exampleIds?.includes(exampleId)) )?.id ?? ''}`,
    returnLabel: 'Back to Special Hands Atlas',
  };
}
