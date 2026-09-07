import * as React from "react";
import { Check } from "lucide-react";
import {
  bonusTileDefinition,
  playingTileDefinition,
  tileAssetUrl,
} from "../tiles/MahjongTileArtwork";
import {
  expandedTiles,
  resolveWinningTileProvenance,
  tileKey,
} from "../scoring";
import type { HandSet, MahjongHand, PlayingTile } from "../scoring";
import type {
  DetailedHandRecord,
  GamePlayer,
  SettlementTransaction,
} from "./types";

export const settlementDescription = (
  transaction: SettlementTransaction,
  players: GamePlayer[],
  eastPlayerId: string,
): string => {
  const playerName = (id: string) =>
    players.find((player) => player.id === id)?.name ?? "Unknown player";
  const doubled =
    transaction.eastMultiplier === 2
      ? ` — doubled because ${playerName(eastPlayerId)} was East`
      : "";
  return `${playerName(transaction.fromPlayerId)} paid ${playerName(transaction.toPlayerId)} ${transaction.amount}${doubled}`;
};

export const detailedHandStatus = (record: DetailedHandRecord) =>
  record.breakdown.evidenceCompleteness === "partial"
    ? "Partial recorded hand"
    : "Recorded hand";

function RecordedTile({
  tile,
  winning = false,
}: {
  tile: PlayingTile;
  winning?: boolean;
}) {
  const artwork = playingTileDefinition(tile);
  return (
    <div
      className={`relative h-12 w-9 shrink-0 rounded-[5px] sm:h-[60px] sm:w-[45px] ${winning ? "ring-2 ring-[#ae6249] ring-offset-1" : ""}`}
      aria-label={winning ? `${artwork.label}, winning tile` : artwork.label}
    >
      <img
        src={tileAssetUrl(artwork.asset)}
        alt=""
        className="h-full w-full rounded-[5px] bg-[#fffdf7] object-contain tile-shadow"
      />
      {winning && (
        <Check
          aria-hidden="true"
          size={12}
          className="absolute -right-1.5 -top-1.5 rounded-full bg-[#ae6249] p-0.5 text-white"
        />
      )}
    </div>
  );
}

function RecordedGroup({ group, hand }: { group: HandSet; hand: MahjongHand }) {
  const provenance = resolveWinningTileProvenance(hand);
  const exactWinningTile =
    provenance?.target.type === "grouped-set" &&
    provenance.target.setId === group.id &&
    group.kind === "chow"
      ? provenance.target.tileIndex
      : undefined;
  const completedByWinningTile =
    provenance?.target.type === "grouped-set" &&
    provenance.target.setId === group.id &&
    group.kind !== "chow";
  return (
    <div className="rounded-md border border-[#e2d9c7] bg-[#fdfbf5] p-2">
      <div className="mb-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#7a7769]">
        {group.visibility} {group.kind}
      </div>
      <div className="flex gap-1">
        {expandedTiles(group).map((tile, index) => (
          <RecordedTile
            key={`${tileKey(tile)}-${index}`}
            tile={tile}
            winning={exactWinningTile === index}
          />
        ))}
      </div>
      {completedByWinningTile && (
        <div className="mt-1 text-[9px] text-[#ae6249]">
          Winning tile completed this {group.kind}
        </div>
      )}
    </div>
  );
}

function ScoreEvidence({ record }: { record: DetailedHandRecord }) {
  const { breakdown } = record;
  const points = breakdown.pointRules.filter((rule) => rule.amount > 0);
  const doubles = breakdown.doubleRules.filter((rule) => rule.amount > 0);
  const specialHands = breakdown.specialHands.filter((hand) => hand.matched);
  const fishing =
    breakdown.specialFishingMatches?.find((result) => result.selected) ??
    breakdown.specialFishing;
  return (
    <div className="mt-3 border-t border-[#e2d9c7] pt-3 text-[10px] leading-5 text-[#66746e]">
      <div className="font-mono uppercase tracking-[.12em] text-[#7a7769]">
        Stored score evidence
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Final score: <b>{breakdown.finalScore}</b>
        </span>
        <span>
          Base points: <b>{breakdown.basePoints}</b>
        </span>
        <span>
          Doubles: <b>{breakdown.doubles}</b>
        </span>
        {breakdown.limitApplied && <span>Score limit applied</span>}
      </div>
      {points.length > 0 && (
        <div>
          Points:{" "}
          {points.map((rule) => `${rule.label} (${rule.amount})`).join(" · ")}
        </div>
      )}
      {doubles.length > 0 && (
        <div>
          Doubles:{" "}
          {doubles.map((rule) => `${rule.label} (${rule.amount})`).join(" · ")}
        </div>
      )}
      {specialHands.length > 0 && (
        <div>
          Special hand: {specialHands.map((hand) => hand.name).join(" · ")}
        </div>
      )}
      {fishing?.selected && <div>Special hand / fishing: {fishing.name}</div>}
    </div>
  );
}

/** Read-only rendering of the exact MahjongHand saved by the detailed scorer. */
export function HandRecord({
  playerName,
  record,
}: {
  playerName: string;
  record: DetailedHandRecord;
}) {
  const { hand } = record;
  const looseWinning =
    resolveWinningTileProvenance(hand)?.target.type === "loose-layout";
  return (
    <section
      className="recorded-hand mt-3 rounded-lg border border-[#e2d9c7] bg-[#fbf8ed] p-3"
      aria-label={`${playerName} · ${detailedHandStatus(record)} with score ${record.finalScore}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#ae6249]">
          {playerName} · {detailedHandStatus(record)}
        </div>
        {hand.isWinner && hand.winningMethod && (
          <div className="text-[10px] text-[#66746e]">
            Won by {hand.winningMethod.replaceAll("-", " ")}
          </div>
        )}
      </div>
      {hand.sets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {hand.sets.map((group) => (
            <RecordedGroup key={group.id} group={group} hand={hand} />
          ))}
        </div>
      )}
      {(hand.looseTiles?.length ?? 0) > 0 && (
        <div className="mt-2">
          <div className="mb-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#7a7769]">
            Loose tiles{hand.sets.length === 0 ? " / special layout" : ""}
          </div>
          <div className="flex flex-wrap gap-1">
            {hand.looseTiles?.map((tile, index) => (
              <RecordedTile
                key={`${tileKey(tile)}-${index}`}
                tile={tile}
              />
            ))}
          </div>
          {looseWinning && (
            <div className="mt-1 text-[9px] text-[#ae6249]">
              Winning tile: {playingTileDefinition(hand.winningTileProvenance!.tile).label}
            </div>
          )}
        </div>
      )}
      {(hand.remainingTiles?.length ?? 0) > 0 && (
        <div className="mt-2">
          <div className="mb-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#7a7769]">
            Remaining tiles recorded
          </div>
          <div className="flex flex-wrap gap-1">
            {hand.remainingTiles?.map((tile, index) => (
              <RecordedTile key={`${tileKey(tile)}-${index}`} tile={tile} />
            ))}
          </div>
        </div>
      )}
      {hand.bonusTiles.length > 0 && (
        <div className="mt-2">
          <div className="mb-1 font-mono text-[8px] uppercase tracking-[.12em] text-[#7a7769]">
            Flowers and Seasons
          </div>
          <div className="flex flex-wrap gap-1">
            {hand.bonusTiles.map((tile, index) => {
              const artwork = bonusTileDefinition(tile.family, tile.number);
              return (
                <img
                  key={`${tile.family}-${tile.number}-${index}`}
                  src={tileAssetUrl(artwork.asset)}
                  alt={artwork.label}
                  className="h-12 w-9 rounded-[5px] bg-[#fffdf7] object-contain tile-shadow sm:h-[60px] sm:w-[45px]"
                />
              );
            })}
          </div>
        </div>
      )}
      {record.breakdown.evidenceCompleteness === "partial" && (
        <p className="mt-2 text-[10px] text-[#7a7769]">
          Only the tiles recorded while scoring are shown.
        </p>
      )}
      <ScoreEvidence record={record} />
    </section>
  );
}
