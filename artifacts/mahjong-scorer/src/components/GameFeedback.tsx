import { useState } from 'react';
import type { GameLength } from '../game';
import {
  submitProductInsight,
  type FeedbackRating,
} from '../insights/productInsights';

type GameFeedbackProps = {
  gameLength: GameLength;
  handCount: number;
};

export function GameFeedback({ gameLength, handCount }: GameFeedbackProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [ratingSent, setRatingSent] = useState(false);
  const [comment, setComment] = useState('');
  const [commentSent, setCommentSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitRating = async (nextRating: FeedbackRating) => {
    if (submitting) return;
    setRating(nextRating);
    setSubmitting(true);
    setError('');

    const saved = await submitProductInsight({
      event: 'feedback_rating',
      surface: 'game_complete',
      gameLength,
      handCount,
      rating: nextRating,
    });

    setSubmitting(false);
    if (saved) {
      setRatingSent(true);
      return;
    }

    setError("Couldn't save that just now. Please try again.");
  };

  const submitComment = async () => {
    if (!rating || submitting) return;
    const trimmed = comment.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError('');

    const saved = await submitProductInsight({
      event: 'feedback_comment',
      surface: 'game_complete',
      gameLength,
      handCount,
      rating,
      comment: trimmed,
    });

    setSubmitting(false);
    if (saved) {
      setCommentSent(true);
      return;
    }

    setError("Couldn't save your note just now. Please try again.");
  };

  return (
    <div className="mt-6 border-t border-[#55756c] pt-5">
      {!ratingSent ? (
        <>
          <div className="font-serif text-[19px] text-[#f8f4e9]">
            Did the scorer make this game easier?
          </div>
          <p className="mt-1 text-[10px] leading-5 text-[#b4c4bd]">
            One tap is enough. No player names, tiles or scores are sent.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitRating('yes')}
              className="rounded-md bg-[#f3e8d4] px-3 py-2.5 text-[11px] font-bold text-[#284d45] disabled:opacity-60"
            >
              Yes
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submitRating('no')}
              className="rounded-md border border-[#6a857d] px-3 py-2.5 text-[11px] font-semibold text-[#f8f4e9] disabled:opacity-60"
            >
              Not really
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[11px] font-semibold text-[#c8d8d1]">
            Thanks — that helps.
          </p>
          {!commentSent ? (
            <div className="mt-4">
              <label className="block">
                <span className="text-[11px] font-semibold text-[#f8f4e9]">
                  Anything you'd like me to know?
                </span>
                <span className="mt-1 block text-[9px] leading-4 text-[#b4c4bd]">
                  Optional. Please don't include names or contact details.
                </span>
                <textarea
                  value={comment}
                  maxLength={1000}
                  rows={3}
                  onChange={(event) => setComment(event.target.value)}
                  className="mt-2 w-full resize-y rounded-md border border-[#6a857d] bg-[#355e54] px-3 py-2.5 text-[11px] leading-5 text-[#f8f4e9] outline-none placeholder:text-[#9db0a8] focus:ring-2 focus:ring-[#d7a287]"
                  placeholder="What was confusing, useful, or missing?"
                />
              </label>
              <button
                type="button"
                disabled={submitting || !comment.trim()}
                onClick={submitComment}
                className="mt-2 w-full rounded-md border border-[#6a857d] px-3 py-2.5 text-[11px] font-semibold text-[#f8f4e9] disabled:opacity-40"
              >
                Send note
              </button>
            </div>
          ) : (
            <p className="mt-3 text-[10px] text-[#b4c4bd]">Thanks for the note.</p>
          )}
        </>
      )}

      {error && (
        <p className="mt-3 text-[10px] font-semibold text-[#f2b09a]" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
