/** Public anchors deliberately kept separate from display copy. */
export const SPECIAL_HAND_ANCHORS = {
  purity: 'purity', 'all-pair-honours': 'all-pair-honours', 'all-winds-and-dragons': 'all-winds-and-dragons',
  'heads-and-tails': 'heads-and-tails', 'fourfold-plenty': 'fourfold-plenty', 'three-great-scholars': 'three-great-scholars',
  'four-blessings': 'four-blessings', 'buried-treasure': 'buried-treasure', 'imperial-jade': 'imperial-jade',
  knitting: 'knitting', 'triple-knitting': 'triple-knitting', 'thirteen-unique-wonders': 'thirteen-unique-wonders',
  'gates-of-heaven': 'gates-of-heaven', 'wriggling-snake': 'wriggling-snake', 'heavens-blessing': 'heavens-blessing',
  'earths-blessing': 'earths-blessing', 'gathering-the-plum-blossom-from-the-roof': 'gathering-the-plum-blossom-from-the-roof',
  'plucking-the-moon-from-the-bottom-of-the-sea': 'plucking-the-moon-from-the-bottom-of-the-sea', 'twofold-fortune': 'twofold-fortune',
} as const;

export const specialHandReferenceHref = (id: string): string | undefined => {
  const anchor = SPECIAL_HAND_ANCHORS[id as keyof typeof SPECIAL_HAND_ANCHORS];
  return anchor ? `/special-hands#${anchor}` : undefined;
};
