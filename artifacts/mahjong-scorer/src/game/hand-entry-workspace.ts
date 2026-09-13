export type WorkingDraft<T extends { id: string; tile: unknown | null }> = T;

export function recoverWorkingDraft<T extends { id: string; tile: unknown | null }>(
  sets: T[],
  createDraft: () => T,
): { sets: T[]; draftId: string } {
  const draft = sets.find((set) => set.tile === null);
  if (draft) return { sets, draftId: draft.id };
  const next = createDraft();
  return { sets: [...sets, next], draftId: next.id };
}

export function normaliseStructuredChoiceForGroup(
  kind: 'pung' | 'kong' | 'chow' | 'pair',
  family: 'characters' | 'bamboo' | 'circles' | 'wind' | 'dragon',
  value: string,
) {
  if (kind !== 'chow') return { family, value };
  const suitedFamily = family === 'wind' || family === 'dragon' ? 'characters' : family;
  const rank = Number(value);
  return { family: suitedFamily, value: Number.isFinite(rank) && rank >= 1 && rank <= 7 ? value : '1' };
}
