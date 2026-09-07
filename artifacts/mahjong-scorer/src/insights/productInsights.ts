import type { GameLength } from '../game';

export type FeedbackRating = 'yes' | 'no';
export type PrintMode = 'summary' | 'full';

export type ProductInsight =
  | {
      event: 'game_started';
      gameLength: GameLength;
    }
  | {
      event: 'game_completed';
      gameLength: GameLength;
      handCount: number;
    }
  | {
      event: 'game_recovered';
      gameLength: GameLength;
      handCount: number;
    }
  | {
      event: 'game_printed';
      gameLength: GameLength;
      handCount: number;
      printMode: PrintMode;
    }
  | {
      event: 'feedback_rating';
      surface: 'game_complete';
      gameLength: GameLength;
      handCount: number;
      rating: FeedbackRating;
    }
  | {
      event: 'feedback_comment';
      surface: 'game_complete';
      gameLength: GameLength;
      handCount: number;
      rating: FeedbackRating;
      comment: string;
    };

const INSIGHTS_ENDPOINT = '/api/insights';

export async function submitProductInsight(
  insight: ProductInsight,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetcher(INSIGHTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(insight),
      credentials: 'same-origin',
      keepalive: true,
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function recordProductInsight(insight: ProductInsight): void {
  if (typeof fetch === 'undefined') return;
  void submitProductInsight(insight);
}
