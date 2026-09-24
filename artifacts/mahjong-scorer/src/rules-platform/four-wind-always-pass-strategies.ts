import { RegistryBank, type RegistryEntry } from './registry';
import type {
  ExecutableRegistryIdentity,
  ExplainedProgressionResult,
  GameEndResult,
  GameEndStrategy,
  ProgressionStrategy,
  ResolvedRoundOutcome,
  RoundResolution,
} from './types';

export type FourWind = 'east' | 'south' | 'west' | 'north';
export type FourWindAlwaysPassState = {
  seats: Record<string, FourWind>;
  prevailingWind: FourWind;
  dealerCycleStartPlayerId: string;
};
export type FourWindResolvedRound = RoundResolution<ResolvedRoundOutcome, unknown>;
export type FourWindAlwaysPassInput = {
  participants: readonly string[];
  current: FourWindAlwaysPassState;
  round: FourWindResolvedRound;
};
export type FourWindAlwaysPassGameEndInput = {
  participants: readonly string[];
  previous: FourWindAlwaysPassState;
  progression: ExplainedProgressionResult<FourWindAlwaysPassState>;
};

const deterministic = { kind: 'deterministic', dependencies: [] } as const;
export const fourWindAlwaysPassStrategyRegistryEntries: readonly RegistryEntry[] = [
  { id: 'progression.always-pass', category: 'progression', status: 'executable', semanticRevision: 1, executableContract: deterministic },
  { id: 'game-end.four-round-always-pass', category: 'game-end', status: 'executable', semanticRevision: 1, executableContract: deterministic },
];
export const fourWindAlwaysPassStrategyRegistry = new RegistryBank(fourWindAlwaysPassStrategyRegistryEntries);
export const ALWAYS_PASS_PROGRESSION: ExecutableRegistryIdentity = { id: 'progression.always-pass', semanticRevision: 1 };
export const FOUR_ROUND_ALWAYS_PASS_GAME_END: ExecutableRegistryIdentity = { id: 'game-end.four-round-always-pass', semanticRevision: 1 };

const winds: readonly FourWind[] = ['east', 'south', 'west', 'north'];
const rotateWind = (wind: FourWind): FourWind => ({ east: 'north', south: 'east', west: 'south', north: 'west' })[wind] as FourWind;
const nextWind = (wind: FourWind): FourWind => ({ east: 'south', south: 'west', west: 'north', north: 'north' })[wind] as FourWind;
const failClosed = (): never => { throw new Error('Invalid four-wind always-pass transition'); };
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

const validateState = (participants: readonly string[], state: FourWindAlwaysPassState): void => {
  if (!Array.isArray(participants) || participants.length !== 4 || participants.some((id) => typeof id !== 'string' || id.trim().length === 0) || new Set(participants).size !== 4) failClosed();
  if (!isRecord(state) || !isRecord(state.seats) || !winds.includes(state.prevailingWind) || typeof state.dealerCycleStartPlayerId !== 'string') failClosed();
  const ids = Object.keys(state.seats);
  if (ids.length !== 4 || ids.some((id) => !participants.includes(id)) || participants.some((id) => !Object.prototype.hasOwnProperty.call(state.seats, id))) failClosed();
  const assigned = participants.map((id) => state.seats[id]);
  if (assigned.some((wind) => !winds.includes(wind)) || new Set(assigned).size !== 4) failClosed();
  if (!participants.includes(state.dealerCycleStartPlayerId)) failClosed();
};

const validateRound = (round: FourWindResolvedRound): void => {
  if (!isRecord(round) || !Array.isArray(round.acceptedScores) || !isRecord(round.outcome) || typeof round.outcome.kind !== 'string' || round.outcome.kind.length === 0 || !isRecord(round.outcome.payload)) failClosed();
};

const playerAtEast = (seats: Record<string, FourWind>): string => {
  const player = Object.keys(seats).find((id) => seats[id] === 'east');
  if (!player) return failClosed();
  return player;
};

export const progressFourWindAlwaysPass: ProgressionStrategy<FourWindAlwaysPassInput, FourWindAlwaysPassState> = ({ participants, current, round }) => {
  validateState(participants, current);
  validateRound(round);
  const seats = Object.fromEntries(participants.map((id) => [id, rotateWind(current.seats[id])])) as Record<string, FourWind>;
  const dealerCycleCompleted = playerAtEast(seats) === current.dealerCycleStartPlayerId;
  const prevailingWind = dealerCycleCompleted && current.prevailingWind !== 'north' ? nextWind(current.prevailingWind) : current.prevailingWind;
  const reasonId = !dealerCycleCompleted
    ? 'progression.always-pass.dealer-passed'
    : current.prevailingWind === 'north'
      ? 'progression.always-pass.dealer-cycle-completed'
      : 'progression.always-pass.prevailing-wind-advanced';
  const nextState = { seats, prevailingWind, dealerCycleStartPlayerId: current.dealerCycleStartPlayerId };
  return {
    nextState,
    reasonId,
    metadata: {
      previousPrevailingWind: current.prevailingWind,
      nextPrevailingWind: prevailingWind,
      previousDealerPlayerId: playerAtEast(current.seats),
      nextDealerPlayerId: playerAtEast(seats),
      dealerCycleCompleted,
      seatsRotated: true,
    },
  };
};

export const determineFourRoundAlwaysPassGameEnd: GameEndStrategy<FourWindAlwaysPassGameEndInput> = ({ participants, previous, progression }): GameEndResult => {
  validateState(participants, previous);
  if (!isRecord(progression) || !isRecord(progression.nextState) || typeof progression.reasonId !== 'string') failClosed();
  const expectedSeats = Object.fromEntries(participants.map((id) => [id, rotateWind(previous.seats[id])])) as Record<string, FourWind>;
  const cycleCompleted = playerAtEast(expectedSeats) === previous.dealerCycleStartPlayerId;
  const expectedWind = cycleCompleted && previous.prevailingWind !== 'north' ? nextWind(previous.prevailingWind) : previous.prevailingWind;
  const expectedReason = !cycleCompleted
    ? 'progression.always-pass.dealer-passed'
    : previous.prevailingWind === 'north'
      ? 'progression.always-pass.dealer-cycle-completed'
      : 'progression.always-pass.prevailing-wind-advanced';
  const next = progression.nextState;
  if (!isRecord(next.seats) || participants.some((id) => next.seats[id] !== expectedSeats[id]) || Object.keys(next.seats).length !== 4 || next.prevailingWind !== expectedWind || next.dealerCycleStartPlayerId !== previous.dealerCycleStartPlayerId || progression.reasonId !== expectedReason) failClosed();
  const complete = cycleCompleted && previous.prevailingWind === 'north';
  return { complete, reasonId: complete ? 'game-end.four-round-always-pass.four-rounds-complete' : 'game-end.four-round-always-pass.continues' };
};

const keyFor = ({ id, semanticRevision }: ExecutableRegistryIdentity) => `${id}@${semanticRevision}`;
const implementations = new Map<string, unknown>([
  [keyFor(ALWAYS_PASS_PROGRESSION), progressFourWindAlwaysPass],
  [keyFor(FOUR_ROUND_ALWAYS_PASS_GAME_END), determineFourRoundAlwaysPassGameEnd],
]);

function implementation<T>(category: 'progression' | 'game-end', identity: ExecutableRegistryIdentity): T {
  fourWindAlwaysPassStrategyRegistry.requireExecutable(category, identity.id);
  const found = implementations.get(keyFor(identity));
  if (!found) throw new Error(`Unknown four-wind strategy implementation: ${keyFor(identity)}`);
  return found as T;
}
export const alwaysPassProgressionImplementation = (identity: ExecutableRegistryIdentity) => implementation<ProgressionStrategy<FourWindAlwaysPassInput, FourWindAlwaysPassState>>('progression', identity);
export const fourRoundAlwaysPassGameEndImplementation = (identity: ExecutableRegistryIdentity) => implementation<GameEndStrategy<FourWindAlwaysPassGameEndInput>>('game-end', identity);
