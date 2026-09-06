import type { Wind } from '../scoring';
import type {
  GamePlayer,
  HandOutcome,
  PlayerId,
  ProgressionResult,
  ProgressionState,
  SeatAssignments,
} from './types';

const nextPrevailingWind = (wind: Wind): Wind =>
  ({ east: 'south', south: 'west', west: 'north', north: 'east' })[wind] as Wind;

const rotateSeats = (seats: SeatAssignments): SeatAssignments =>
  Object.fromEntries(
    Object.entries(seats).map(([playerId, wind]) => [
      playerId,
      ({ east: 'north', south: 'east', west: 'south', north: 'west' })[
        wind
      ] as Wind,
    ]),
  ) as SeatAssignments;

const playerAt = (seats: SeatAssignments, wind: Wind): PlayerId => {
  const entry = Object.entries(seats).find(([, seat]) => seat === wind);
  if (!entry) throw new Error(`No player is assigned to ${wind}.`);
  return entry[0];
};

const assertProgressionState = (
  players: GamePlayer[],
  current: ProgressionState,
) => {
  if (players.length !== 4 || new Set(players.map((player) => player.id)).size !== 4) {
    throw new Error('BMJA progression requires four unique players.');
  }
  if (new Set(Object.values(current.seats)).size !== 4) {
    throw new Error('Each wind must be assigned to exactly one player.');
  }
  if (!players.some((player) => player.id === current.eastCycleStartPlayerId)) {
    throw new Error('The East-cycle start player must belong to the game.');
  }
};

/**
 * BMJA progression:
 * - East remains East after an East win or a drawn hand;
 * - after another player wins, seats rotate anti-clockwise (South becomes East);
 * - the prevailing wind advances after every player has served as East.
 */
export const progressBmjaGame = (
  players: GamePlayer[],
  current: ProgressionState,
  outcome: HandOutcome,
): ProgressionResult => {
  assertProgressionState(players, current);
  const currentEast = playerAt(current.seats, 'east');
  const retainEast =
    outcome.type === 'draw' ||
    (outcome.type === 'win' && outcome.winnerId === currentEast);

  if (retainEast) {
    return {
      ...current,
      seatsRotated: false,
      prevailingWindAdvanced: false,
    };
  }

  const seats = rotateSeats(current.seats);
  const eastPlayerId = playerAt(seats, 'east');
  const prevailingWindAdvanced =
    eastPlayerId === current.eastCycleStartPlayerId;

  return {
    seats,
    prevailingWind: prevailingWindAdvanced
      ? nextPrevailingWind(current.prevailingWind)
      : current.prevailingWind,
    eastCycleStartPlayerId: current.eastCycleStartPlayerId,
    seatsRotated: true,
    prevailingWindAdvanced,
  };
};