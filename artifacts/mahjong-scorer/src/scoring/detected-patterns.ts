import { FISHING_SPECIALS } from "./fishing";
import type { RuleReferenceId, ScoreBreakdown } from "./types";

export type DetectedPattern = {
  id: string;
  name: string;
  type: "points" | "doubles" | "special" | "fishing";
  effect: string;
  explanation: string;
  referenceId?: RuleReferenceId;
  selected?: boolean;
};

const amountLabel = (amount: number, unit: "point" | "double") =>
  `${amount} ${unit}${amount === 1 ? "" : "s"}`;

const fishingValueById = new Map(
  FISHING_SPECIALS.map(({ id, fishingValue }) => [id, fishingValue]),
);

/** Presentation-only projection of positive matches from the score engine. */
export const detectedPatterns = (score: ScoreBreakdown): DetectedPattern[] => [
  ...score.pointRules.map((rule) => ({
    id: `points-${rule.id}`,
    name: rule.label,
    type: "points" as const,
    effect: `+${amountLabel(rule.amount, "point")}`,
    explanation: rule.description,
    ...(rule.referenceId ? { referenceId: rule.referenceId } : {}),
  })),
  ...score.doubleRules.map((rule) => ({
    id: `doubles-${rule.id}`,
    name: rule.label,
    type: "doubles" as const,
    effect: amountLabel(rule.amount, "double"),
    explanation: rule.description,
    ...(rule.referenceId ? { referenceId: rule.referenceId } : {}),
  })),
  ...score.specialHands
    .filter((special) => special.matched)
    .map((special) => ({
      id: `special-${special.id}`,
      name: special.name,
      type: "special" as const,
      effect: `${special.value} points`,
      explanation: special.description,
    })),
  ...(score.specialFishingMatches ?? []).map((fishing) => {
    const value = fishingValueById.get(fishing.id);
    return {
      id: `fishing-${fishing.id}`,
      name: `${fishing.name} fishing`,
      type: "fishing" as const,
      effect:
        value === "three-doubles"
          ? "3 doubles while fishing"
          : `${value ?? fishing.score ?? 0} points while fishing`,
      explanation: `This hand is one tile away from ${fishing.name}.`,
      selected: fishing.selected,
    };
  }),
];
