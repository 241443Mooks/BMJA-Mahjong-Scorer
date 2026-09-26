import { describe, expect, it } from 'vitest';
import {
  notFoundDescription,
  notFoundEyebrow,
  notFoundHeading,
  notFoundRecoveryLinks,
} from './not-found';

describe('not found page', () => {
  it('uses visitor-facing copy instead of developer router language', () => {
    expect(notFoundEyebrow).toBe('404 · Page not found');
    expect(notFoundHeading).toBe("We couldn't find that page.");
    expect(notFoundDescription).toContain('Mahjong Reference');
    expect(`${notFoundEyebrow} ${notFoundHeading} ${notFoundDescription}`).not.toContain(
      'Did you forget to add the page to the router?',
    );
  });

  it('offers clear recovery routes', () => {
    expect(notFoundRecoveryLinks).toEqual([
      ['Home', '/'],
      ['Score a hand', '/hand'],
      ['Track a game', '/game'],
      ['Browse rules', '/rules'],
    ]);
  });
});
