export type ProductAnalyticsEvent =
  | 'ruleset_selected'
  | 'scorer_started'
  | 'hand_entry_started'
  | 'hand_scored'
  | 'score_accepted'
  | 'game_started'
  | 'hand_completed'
  | 'game_completed'
  | 'settlement_viewed';

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsValue>;

type PostHogClient = {
  capture?: (event: string, properties?: AnalyticsProperties) => void;
};

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

/**
 * Capture only deliberately designed product events.
 *
 * Analytics must never affect scoring or gameplay, so failures are ignored.
 * Do not pass player names, free text, tile/hand contents, or stable user IDs.
 */
export function captureProductEvent(
  event: ProductAnalyticsEvent,
  properties: AnalyticsProperties = {},
) {
  if (typeof window === 'undefined') return;
  try {
    window.posthog?.capture?.(event, properties);
  } catch {
    // Analytics is intentionally non-critical.
  }
}
