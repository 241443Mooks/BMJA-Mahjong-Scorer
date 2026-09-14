import { describe, expect, it } from 'vitest';
import { isHorizontallyScrollable } from './HorizontalScrollRegion';

describe('isHorizontallyScrollable', () => {
  it('is false when content fits exactly', () => {
    expect(isHorizontallyScrollable(420, 420)).toBe(false);
  });

  it('is false when content is narrower than its viewport', () => {
    expect(isHorizontallyScrollable(320, 420)).toBe(false);
  });

  it('is true when content is wider than its viewport', () => {
    expect(isHorizontallyScrollable(421, 420)).toBe(true);
  });
});
