import { describe, expect, it, vi } from 'vitest';
import {
  MAHJONG_REFERENCE_SHARE_TITLE,
  MAHJONG_REFERENCE_SHARE_URL,
  shareMahjongReference,
} from './ShareAction';

describe('Mahjong Reference sharing', () => {
  it('uses native sharing with only the canonical URL and table companion message', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();

    const result = await shareMahjongReference({ share, clipboard: { writeText } });

    expect(result).toBe('shared');
    expect(share).toHaveBeenCalledWith({
      title: MAHJONG_REFERENCE_SHARE_TITLE,
      text: MAHJONG_REFERENCE_SHARE_TITLE,
      url: MAHJONG_REFERENCE_SHARE_URL,
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the canonical URL when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    const result = await shareMahjongReference({ clipboard: { writeText } });

    expect(result).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(MAHJONG_REFERENCE_SHARE_URL);
  });

  it('does not copy when the user dismisses the native share sheet', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('Dismissed', 'AbortError'));
    const writeText = vi.fn();

    const result = await shareMahjongReference({ share, clipboard: { writeText } });

    expect(result).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });
});
