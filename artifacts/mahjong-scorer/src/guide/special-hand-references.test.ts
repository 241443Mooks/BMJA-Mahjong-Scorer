import { describe, expect, it } from 'vitest';
import { SPECIAL_HAND_ANCHORS, specialHandReferenceHref } from './special-hand-references';

describe('special-hand public references', () => {
  it('keeps a canonical stable anchor for every catalogue special', () => {
    expect(Object.values(SPECIAL_HAND_ANCHORS)).toEqual([...new Set(Object.values(SPECIAL_HAND_ANCHORS))]);
    expect(SPECIAL_HAND_ANCHORS).toMatchObject({ purity: 'purity', 'all-pair-honours': 'all-pair-honours', 'heads-and-tails': 'heads-and-tails', 'thirteen-unique-wonders': 'thirteen-unique-wonders' });
  });
  it('links recognised scoring identities only when a catalogue target exists', () => {
    expect(specialHandReferenceHref('thirteen-unique-wonders')).toBe('/special-hands#thirteen-unique-wonders');
    expect(specialHandReferenceHref('not-a-special')).toBeUndefined();
  });
});
