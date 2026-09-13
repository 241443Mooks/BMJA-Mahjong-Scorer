import { describe, expect, it } from 'vitest';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';

describe('public rules reference model', () => {
  it('keeps scorer availability, source status and implementation state distinct', () => {
    const british = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'british')!;
    const western = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'western')!;
    const club = PUBLIC_RULES_DESCRIPTORS.find((descriptor) => descriptor.slug === 'club')!;

    expect(british.support).toMatchObject({ scorer: 'Available', implementation: 'Stable' });
    expect(western.support).toMatchObject({ scorer: 'Available', implementation: 'Provisional' });
    expect(western.support.source).toContain('source-verified');
    expect(western.support.source).toContain('under source review');
    expect(club.title).toBe('Club rules');
    expect(club.configuredClubProfile).toBe(true);
  });
});
