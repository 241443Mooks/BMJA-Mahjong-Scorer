import { describe, expect, it } from 'vitest';
import { britishBeginnerLinkLabel } from './HomePage';

describe('homepage beginner link', () => {
  it('identifies its British gameplay destination', () => {
    expect(britishBeginnerLinkLabel).toBe('New to British Mahjong? Start here');
  });
});
