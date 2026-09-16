import { describe, expect, it } from 'vitest';
import { compactFooterLinks, footerGroups } from './SiteFooter';

describe('site footer', () => {
  it('keeps the full footer focused on Play, Learn and Project', () => {
    expect(footerGroups).toEqual([
      {
        label: 'Play',
        links: [
          ['Track a game', '/game'],
          ['Score a hand', '/hand'],
        ],
      },
      {
        label: 'Learn',
        links: [
          ['Rules', '/rules'],
          ['How it works', '/how-it-works'],
          ['User Guide', '/help'],
          ['Scoring examples', '/scoring-examples'],
        ],
      },
      {
        label: 'Project',
        links: [
          ['About', '/about'],
          ['Source on GitHub', 'https://github.com/241443Mooks/BMJA-Mahjong-Scorer'],
          ['Support the project', 'https://buymeacoffee.com/sharronmo'],
        ],
      },
    ]);
  });

  it('keeps the compact variant deliberately small', () => {
    expect(compactFooterLinks).toEqual([
      ['User Guide', '/help'],
      ['About', '/about'],
    ]);
  });
});
