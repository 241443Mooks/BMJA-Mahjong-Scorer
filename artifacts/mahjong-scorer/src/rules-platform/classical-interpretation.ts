import { expandedTiles, tileKey } from '../scoring/tiles';
import {
  partialClassicalDecompositions,
  standardClassicalDecompositions,
} from '../scoring/classical-decomposition';
import type {
  BonusTile,
  GameContext,
  HandSet,
  MahjongHand,
  PlayingTile,
  SetKind,
  UngroupedBlankTile,
  Visibility,
} from '../scoring/types';
import type { RulesProfileRef } from '../game/types';
import { getCurrentCompiledRulesRuntime } from './current-runtime-registry';

export type ClassicalInterpretationInput = {
  profile: RulesProfileRef;
  explicitSets: readonly HandSet[];
  unresolvedTiles: readonly PlayingTile[];
  bonusTiles: readonly BonusTile[];
  isWinner: boolean;
  context: GameContext;
  handMode: 'normal' | 'goulash';
  ungroupedBlankTiles?: readonly UngroupedBlankTile[];
};

export type InferredClassicalGroup = {
  id: string;
  kind: SetKind;
  tile: PlayingTile;
  physicalTileIndexes: readonly number[];
  structuralSlots: 2 | 3;
};

export type ClassicalInterpretationUnresolvedFact = {
  type: 'group-visibility';
  groupId: string;
  choices: readonly Visibility[];
};

export type ClassicalInterpretationCandidate = {
  id: string;
  profile: RulesProfileRef;
  layout: 'grouped' | 'irregular';
  structuralTileCount: number;
  wholeHandComplete: boolean;
  explicitSets: readonly HandSet[];
  inferredGroups: readonly InferredClassicalGroup[];
  unresolvedFacts: readonly ClassicalInterpretationUnresolvedFact[];
  unresolvedTileIndexes: readonly number[];
  lawfulVisibilityAssignments: readonly Readonly<Record<string, Visibility>>[];
};

export type ClassicalInterpretationRejection = {
  code:
    | 'classical-runtime-required'
    | 'profile-runtime-unavailable'
    | 'needs-explicit-goulash-blank-placement'
    | 'no-lawful-candidate';
  message: string;
  candidateId?: string;
  validationErrors?: readonly string[];
};

export type ClassicalInterpretationResult = {
  profile: RulesProfileRef;
  candidates: readonly ClassicalInterpretationCandidate[];
  rejected: readonly ClassicalInterpretationRejection[];
};

const sortedIndexes = (indexes: number[]) => indexes.sort((left, right) => left - right);

const inferredTileIndexes = (
  groups: readonly HandSet[],
  unresolvedTiles: readonly PlayingTile[],
): number[][] | undefined => {
  const used = new Set<number>();
  const indexes: number[][] = [];
  for (const group of groups) {
    const members = expandedTiles(group);
    const groupIndexes: number[] = [];
    for (const member of members) {
      const index = unresolvedTiles.findIndex((tile, tileIndex) => !used.has(tileIndex) && tileKey(tile) === tileKey(member));
      if (index < 0) return undefined;
      used.add(index);
      groupIndexes.push(index);
    }
    indexes.push(sortedIndexes(groupIndexes));
  }
  return indexes;
};

const uniqueInferredIds = (explicitSets: readonly HandSet[], count: number): string[] => {
  const used = new Set(explicitSets.map(({ id }) => id));
  const ids: string[] = [];
  for (let index = 1; ids.length < count; index += 1) {
    const id = `inferred-classical-group-${index}`;
    if (!used.has(id)) {
      used.add(id);
      ids.push(id);
    }
  }
  return ids;
};

const inferredGroupRecords = (
  groups: readonly HandSet[],
  explicitSets: readonly HandSet[],
  unresolvedTiles: readonly PlayingTile[],
): InferredClassicalGroup[] | undefined => {
  const indexes = inferredTileIndexes(groups, unresolvedTiles);
  if (!indexes) return undefined;
  const ids = uniqueInferredIds(explicitSets, groups.length);
  return groups.map((group, index) => ({
    id: ids[index]!,
    kind: group.kind,
    tile: group.tile,
    physicalTileIndexes: indexes[index]!,
    structuralSlots: group.kind === 'pair' ? 2 : 3,
  }));
};

const candidateId = (
  profile: RulesProfileRef,
  layout: ClassicalInterpretationCandidate['layout'],
  explicitSets: readonly HandSet[],
  groups: readonly InferredClassicalGroup[],
  unresolvedTileIndexes: readonly number[],
) => {
  const explicit = JSON.stringify(explicitSets.map(({ id, kind, tile, visibility, blankTileIds }) => ({ id, kind, tile: tileKey(tile), visibility, blankTileIds })));
  const structure = groups
    .map(({ kind, tile, physicalTileIndexes }) => `${kind}:${tileKey(tile)}[${physicalTileIndexes.join(',')}]`)
    .join('|');
  return `${profile.id}@${profile.version}:${layout}:explicit=${explicit}:${structure}:remaining[${unresolvedTileIndexes.join(',')}]`;
};

export const projectClassicalInterpretation = (
  input: ClassicalInterpretationInput,
  candidate: ClassicalInterpretationCandidate,
  visibilityByGroupId: Readonly<Record<string, Visibility>> = {},
): MahjongHand => {
  if (candidate.profile.id !== input.profile.id || candidate.profile.version !== input.profile.version) {
    throw new Error('CLASSICAL_INTERPRETATION_PROFILE_MISMATCH');
  }
  if (candidate.layout === 'irregular') {
    return {
      sets: [],
      looseTiles: [...input.unresolvedTiles],
      ...(input.ungroupedBlankTiles?.length
        ? { ungroupedBlankTiles: input.ungroupedBlankTiles.map((blank) => ({ ...blank, location: 'loose' as const })) }
        : {}),
      bonusTiles: [...input.bonusTiles],
      isWinner: input.isWinner,
    };
  }
  if (input.ungroupedBlankTiles?.some((blank) => blank.location === 'loose')) {
    throw new Error('CLASSICAL_INTERPRETATION_LOOSE_BLANK_REQUIRES_IRREGULAR_LAYOUT');
  }
  const inferred = candidate.inferredGroups.map((group): HandSet => {
    const visibility = visibilityByGroupId[group.id];
    const fact = candidate.unresolvedFacts.find(({ type, groupId }) => type === 'group-visibility' && groupId === group.id);
    if (!visibility || !fact?.choices.includes(visibility)) {
      throw new Error(`CLASSICAL_INTERPRETATION_VISIBILITY_REQUIRED:${group.id}`);
    }
    return { id: group.id, kind: group.kind, tile: group.tile, visibility };
  });
  const usedIndexes = new Set(candidate.inferredGroups.flatMap(({ physicalTileIndexes }) => physicalTileIndexes));
  if (input.ungroupedBlankTiles?.some((blank) => usedIndexes.has(blank.tileIndex))) {
    throw new Error('CLASSICAL_INTERPRETATION_CANNOT_ASSIGN_UNRESOLVED_BLANK');
  }
  const remainingTiles = candidate.unresolvedTileIndexes.map((index) => input.unresolvedTiles[index]!);
  const remainingIndexBySourceIndex = new Map(candidate.unresolvedTileIndexes.map((sourceIndex, remainingIndex) => [sourceIndex, remainingIndex]));
  const ungroupedBlankTiles = input.ungroupedBlankTiles?.flatMap((blank) => {
    if (blank.location !== 'remaining' || usedIndexes.has(blank.tileIndex)) return [];
    const tileIndex = remainingIndexBySourceIndex.get(blank.tileIndex);
    return tileIndex === undefined ? [] : [{ ...blank, tileIndex }];
  });
  return {
    sets: [...input.explicitSets, ...inferred],
    ...(remainingTiles.length > 0 ? { remainingTiles } : {}),
    bonusTiles: [...input.bonusTiles],
    isWinner: input.isWinner,
    ...(ungroupedBlankTiles?.length ? { ungroupedBlankTiles } : {}),
  };
};

const visibilityAssignments = (facts: readonly ClassicalInterpretationUnresolvedFact[]): Readonly<Record<string, Visibility>>[] => {
  let assignments: Record<string, Visibility>[] = [{}];
  for (const fact of facts) {
    assignments = assignments.flatMap((assignment) => fact.choices.map((visibility) => ({ ...assignment, [fact.groupId]: visibility })));
  }
  return assignments;
};

const hasStructuralValidationErrors = (
  input: ClassicalInterpretationInput,
  candidate: ClassicalInterpretationCandidate,
  visibility: Readonly<Record<string, Visibility>>,
  validate: (evidence: MahjongHand, context: GameContext) => readonly string[],
) => validate(projectClassicalInterpretation(input, candidate, visibility), { ...input.context, handMode: input.handMode });

export const interpretClassicalHand = (
  input: ClassicalInterpretationInput,
): ClassicalInterpretationResult => {
  const profile = Object.freeze({ id: input.profile.id, version: input.profile.version });
  const result = (candidates: ClassicalInterpretationCandidate[], rejected: ClassicalInterpretationRejection[] = []): ClassicalInterpretationResult => ({ profile, candidates, rejected });

  let compiled: ReturnType<typeof getCurrentCompiledRulesRuntime>;
  try {
    compiled = getCurrentCompiledRulesRuntime(profile);
  } catch {
    return result([], [{ code: 'profile-runtime-unavailable', message: `No current compiled runtime is available for ${profile.id}@${profile.version}.` }]);
  }
  if (compiled.grammar !== 'classical-points-doubles') {
    return result([], [{ code: 'classical-runtime-required', message: `The Classical interpreter does not accept ${profile.id}@${profile.version}.` }]);
  }

  if (input.handMode === 'goulash' && (input.ungroupedBlankTiles?.length ?? 0) > 0) {
    return result([], [{ code: 'needs-explicit-goulash-blank-placement', message: 'Place unresolved Goulash blanks explicitly before structural interpretation.' }]);
  }

  const validationContext = { ...input.context, handMode: input.handMode };
  const validate = (evidence: MahjongHand, context: GameContext) =>
    compiled.runtime.validateHand({ evidence, context });
  const candidates = new Map<string, ClassicalInterpretationCandidate>();
  const rejected: ClassicalInterpretationRejection[] = [];

  const addCandidate = (
    layout: ClassicalInterpretationCandidate['layout'],
    inferredGroups: InferredClassicalGroup[],
    unresolvedTileIndexes: number[],
  ) => {
    const id = candidateId(profile, layout, input.explicitSets, inferredGroups, unresolvedTileIndexes);
    const candidate: ClassicalInterpretationCandidate = {
      id,
      profile,
      layout,
      structuralTileCount: input.explicitSets.reduce((count, group) => count + (group.kind === 'pair' ? 2 : 3), 0)
        + inferredGroups.reduce((count, group) => count + group.structuralSlots, 0)
        + unresolvedTileIndexes.length,
      wholeHandComplete: false,
      explicitSets: Object.freeze([...input.explicitSets]),
      inferredGroups: Object.freeze(inferredGroups),
      unresolvedFacts: Object.freeze(inferredGroups.map(({ id }) => ({ type: 'group-visibility' as const, groupId: id, choices: ['exposed', 'concealed'] as const }))),
      unresolvedTileIndexes: Object.freeze(sortedIndexes([...unresolvedTileIndexes])),
      lawfulVisibilityAssignments: Object.freeze([]),
    };
    const targetStructuralCount = input.isWinner ? 14 : 13;
    const completedCandidate = { ...candidate, wholeHandComplete: candidate.structuralTileCount === targetStructuralCount };
    const possibleAssignments = visibilityAssignments(candidate.unresolvedFacts);
    const lawfulAssignments = possibleAssignments.filter((assignment) => {
      try {
        return hasStructuralValidationErrors(input, completedCandidate, assignment, validate).length === 0;
      } catch {
        return false;
      }
    });
    if (lawfulAssignments.length === 0) {
      const firstFailure = possibleAssignments.map((assignment) => {
        try { return hasStructuralValidationErrors(input, completedCandidate, assignment, validate); }
        catch { return []; }
      }).find((errors) => errors.length > 0);
      rejected.push({
        code: 'no-lawful-candidate',
        message: 'The candidate was rejected by the selected profile validation runtime.',
        candidateId: id,
        ...(firstFailure ? { validationErrors: firstFailure } : {}),
      });
      return;
    }
    candidates.set(id, { ...completedCandidate, lawfulVisibilityAssignments: Object.freeze(lawfulAssignments) });
  };

  const makeCandidateGroups = (sets: readonly HandSet[]) => inferredGroupRecords(sets.slice(input.explicitSets.length), input.explicitSets, input.unresolvedTiles);
  const allIndexes = input.unresolvedTiles.map((_, index) => index);
  if (input.unresolvedTiles.length === 0) {
    const groups = makeCandidateGroups([]);
    if (groups) addCandidate('grouped', groups, []);
  } else {
    for (const sets of standardClassicalDecompositions(input.explicitSets, input.unresolvedTiles, { allowKongs: true })) {
      const groups = makeCandidateGroups(sets);
      if (!groups) continue;
      const used = new Set(groups.flatMap(({ physicalTileIndexes }) => physicalTileIndexes));
      addCandidate('grouped', groups, allIndexes.filter((index) => !used.has(index)));
    }

    const enteredStructuralUpperBound = input.explicitSets.reduce((count, group) => count + (group.kind === 'pair' ? 2 : 3), 0) + input.unresolvedTiles.length;
    if (candidates.size === 0 && !input.isWinner && enteredStructuralUpperBound < 13) {
      for (const sets of partialClassicalDecompositions(input.explicitSets, input.unresolvedTiles, { allowKongs: true })) {
        const groups = makeCandidateGroups(sets);
        if (!groups || groups.length === 0) continue;
        const used = new Set(groups.flatMap(({ physicalTileIndexes }) => physicalTileIndexes));
        addCandidate('grouped', groups, allIndexes.filter((index) => !used.has(index)));
      }
    }

    if (input.explicitSets.length === 0) {
      const specialCandidate: ClassicalInterpretationCandidate = {
        id: candidateId(profile, 'irregular', [], [], allIndexes),
        profile,
        layout: 'irregular',
        structuralTileCount: input.unresolvedTiles.length,
        wholeHandComplete: input.unresolvedTiles.length === (input.isWinner ? 14 : 13),
        explicitSets: Object.freeze([]),
        inferredGroups: Object.freeze([]),
        unresolvedFacts: Object.freeze([]),
        unresolvedTileIndexes: Object.freeze([...allIndexes]),
        lawfulVisibilityAssignments: Object.freeze([Object.freeze({})]),
      };
      const errors = validate(projectClassicalInterpretation(input, specialCandidate), validationContext);
      if (errors.length === 0) candidates.set(specialCandidate.id, specialCandidate);
      else if (candidates.size === 0) rejected.push({ code: 'no-lawful-candidate', message: 'The unresolved layout is not accepted by the selected profile special-hand validator.', candidateId: specialCandidate.id, validationErrors: errors });
    }
  }

  const ordered = [...candidates.values()].sort((left, right) => left.id.localeCompare(right.id));
  return result(ordered, ordered.length > 0 ? rejected.filter(({ candidateId: rejectedId }) => !rejectedId || !candidates.has(rejectedId)) : rejected.length > 0 ? rejected : [{ code: 'no-lawful-candidate', message: 'No structural candidate is lawful under the selected profile.' }]);
};
