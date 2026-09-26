import type { ExecutableRegistryIdentity, JsonObject, RulesFamilyDefinition, ScoringGrammarId } from './types';

export const REGISTRY_CATEGORIES = [
  'family', 'source', 'tiles', 'seats', 'shape', 'validation', 'pattern', 'condition', 'wait', 'event',
  'evidence', 'evidence-policy', 'interpretation', 'classical', 'catalogue.pattern', 'catalogue.yaku',
  'catalogue.yakuman', 'catalogue.target', 'interaction', 'qualification', 'conversion', 'value-policy',
  'post-qualification-bonus', 'dora', 'fu', 'riichi-decomposition', 'riichi-limit-tier', 'riichi-hand-value',
  'target-match', 'substitution', 'target-exposure', 'target-value', 'settlement', 'progression', 'game-end',
  'hand-mode', 'incident', 'procedure',
] as const;

export type RegistryCategory = (typeof REGISTRY_CATEGORIES)[number];
export type RegistryStatus = 'architecture-only' | 'metadata' | 'executable';
export type PureExecutableContract = { kind: 'deterministic'; dependencies: readonly [] };

export type RegistryEntry<C extends RegistryCategory = RegistryCategory> = {
  id: string;
  category: C;
  status: RegistryStatus;
  parameterSchemaId?: string;
  valueSchemaId?: string;
  metadata?: JsonObject;
  semanticRevision?: number;
  executableContract?: PureExecutableContract;
};

const categoriesByLength = [...REGISTRY_CATEGORIES].sort((a, b) => b.length - a.length);

export function categoryForId(id: string): RegistryCategory {
  const category = categoriesByLength.find((candidate) => id.startsWith(`${candidate}.`));
  if (!category) throw new Error(`Unknown registry category for ID: ${id}`);
  return category;
}

export class RegistryBank {
  private readonly entries = new Map<string, RegistryEntry>();

  constructor(entries: readonly RegistryEntry[]) {
    for (const entry of entries) this.add(entry);
  }

  private add(entry: RegistryEntry): void {
    if (categoryForId(entry.id) !== entry.category) throw new Error(`Category mismatch for ID: ${entry.id}`);
    if (entry.category === 'source' && entry.status !== 'metadata') throw new Error('Source entries are metadata only');
    const hasValidRevision = entry.semanticRevision !== undefined && Number.isInteger(entry.semanticRevision) && entry.semanticRevision >= 1;
    if (entry.status === 'executable' && (!hasValidRevision || !entry.executableContract)) {
      throw new Error(`Executable entry requires identity and deterministic contract: ${entry.id}`);
    }
    if (entry.status !== 'executable' && (entry.semanticRevision !== undefined || entry.executableContract !== undefined)) {
      throw new Error(`Non-executable entry cannot carry executable semantics: ${entry.id}`);
    }
    if (this.entries.has(entry.id)) throw new Error(`Duplicate registry ID: ${entry.id}`);
    this.entries.set(entry.id, entry);
  }

  get<C extends RegistryCategory>(category: C, id: string): RegistryEntry<C> {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`Unknown registry ID: ${id}`);
    if (entry.category !== category) throw new Error(`Registry category mismatch for ID: ${id}`);
    return entry as RegistryEntry<C>;
  }

  requireExecutable<C extends RegistryCategory>(category: C, id: string): RegistryEntry<C> & { status: 'executable'; semanticRevision: number; executableContract: PureExecutableContract } {
    const entry = this.get(category, id);
    if (entry.status !== 'executable') throw new Error(`Registry entry is not executable: ${id}`);
    return entry as RegistryEntry<C> & { status: 'executable'; semanticRevision: number; executableContract: PureExecutableContract };
  }
}

export function executableIdentity(entry: RegistryEntry): ExecutableRegistryIdentity {
  if (entry.status !== 'executable') throw new Error(`Registry entry is not executable: ${entry.id}`);
  return { id: entry.id, semanticRevision: entry.semanticRevision! };
}

export function assertFamilyCompatibility(
  family: RulesFamilyDefinition,
  grammar: ScoringGrammarId,
  codecs: Pick<RulesFamilyDefinition, 'handEvidenceCodecId' | 'roundOutcomeCodecId' | 'strategyStateCodecId'>,
  tileSetId?: string,
  seatModelId?: string,
): void {
  if (!family.allowedGrammars.includes(grammar)) throw new Error(`Grammar is incompatible with family: ${grammar}`);
  if (family.handEvidenceCodecId !== codecs.handEvidenceCodecId || family.roundOutcomeCodecId !== codecs.roundOutcomeCodecId || family.strategyStateCodecId !== codecs.strategyStateCodecId) {
    throw new Error(`Codec combination is incompatible with family: ${family.id}`);
  }
  if (tileSetId && family.allowedTileSetIds && !family.allowedTileSetIds.includes(tileSetId)) throw new Error(`Tile set is incompatible with family: ${tileSetId}`);
  if (seatModelId && family.allowedSeatModelIds && !family.allowedSeatModelIds.includes(seatModelId)) throw new Error(`Seat model is incompatible with family: ${seatModelId}`);
}
