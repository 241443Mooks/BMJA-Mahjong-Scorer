import { MCR_2006_FAN_BINDINGS } from '../rules-platform/mcr-detectors';
import type { HandScoreResult } from '../rules-platform/types';

type FanOccurrence = { bindingId?: string; id: string; value: number; reasonId?: string; sourceLocator?: string };
type McrDetails = { countedPatterns?: FanOccurrence[]; suppressedPatterns?: FanOccurrence[]; qualifyingSubtotal?: number; postQualificationBonus?: number; selectedInterpretationId?: string };
export type McrScoreView =
  | { kind: 'scored'; counted: { name: string; value: number; sourceLocator: string }[]; suppressed: { name: string; value: number; reasonId: string; reason: string; sourceLocator: string }[]; qualifyingSubtotal: number; flowers: number; basicPoints: number; interpretation?: string }
  | { kind: 'not-qualifying'; belowMinimum: true; flowersCannotRescue: boolean }
  | { kind: 'needs-evidence'; prompts: readonly { id: string; prompt: string }[] }
  | { kind: 'invalid'; reasonId: string };

const evidencePrompts: Record<string, string> = {
  'evidence.winning-method': 'Was the winning tile self-drawn or claimed from a discard?',
  'evidence.resolved-win-event': 'Was this a normal win, last-wall draw, last discard, Kong replacement, Flower replacement or robbing a Kong?',
  'evidence.last-visible-copy': 'Was this the last visible copy of the winning tile? Choose Yes, No or leave Unknown.',
  'evidence.seat-wind': 'What was the winner’s seat wind?',
  'evidence.round-wind': 'What was the prevailing wind?',
};
const readableReason = (id: string) => id.split('.').at(-1)?.replaceAll('-', ' ') ?? id;

export function presentMcrScore(result: Extract<HandScoreResult, { grammar: 'pattern-accumulator' }>): McrScoreView {
  if (result.disposition.kind === 'needs-evidence') return { kind: 'needs-evidence', prompts: result.disposition.missingEvidenceIds.map((id) => ({ id, prompt: evidencePrompts[id] ?? `Resolve ${id}.` })) };
  if (result.disposition.kind === 'not-qualifying') return { kind: 'not-qualifying', belowMinimum: true, flowersCannotRescue: true };
  if (result.disposition.kind !== 'scored') return { kind: 'invalid', reasonId: result.disposition.kind === 'invalid' ? result.disposition.reasonId : 'mcr.result.unsupported' };
  const details = (result.result.details ?? {}) as unknown as McrDetails;
  const fanName = (item: FanOccurrence) => MCR_2006_FAN_BINDINGS.find(({ id }) => id === item.bindingId)?.name ?? item.bindingId ?? item.id;
  return {
    kind: 'scored',
    counted: (details.countedPatterns ?? []).map((item) => ({ name: fanName(item), value: item.value, sourceLocator: item.sourceLocator ?? MCR_2006_FAN_BINDINGS.find(({ id }) => id === item.bindingId)?.sourceLocator ?? '' })),
    suppressed: (details.suppressedPatterns ?? []).map((item) => ({ name: fanName(item), value: item.value, reasonId: item.reasonId ?? 'unknown', reason: readableReason(item.reasonId ?? 'unknown'), sourceLocator: item.sourceLocator ?? MCR_2006_FAN_BINDINGS.find(({ id }) => id === item.bindingId)?.sourceLocator ?? '' })),
    qualifyingSubtotal: details.qualifyingSubtotal ?? 0,
    flowers: details.postQualificationBonus ?? 0,
    basicPoints: result.result.total,
    ...(details.selectedInterpretationId ? { interpretation: details.selectedInterpretationId } : {}),
  };
}
