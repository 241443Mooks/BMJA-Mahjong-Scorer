import { describe, expect, it } from 'vitest';
import { appendConfirmedVoiceGroups, voiceProposalSchema } from './voice-evidence';
import { scoreHand, suited } from '../scoring';

const pung = { source: 'exposed pong of three dots', kind: 'pung', tile: { family: 'suit', suit: 'circles', rank: 3 }, visibility: 'exposed', ambiguity: null };
const proposal = (group: object) => ({ groups: [group], unparsed: [] });
const draft = [{ id: 'manual', kind: 'pair' as const, tile: suited('bamboo', 2), visibility: 'concealed' as const }, { id: 'working', kind: 'chow' as const, tile: null, visibility: 'exposed' as const }];
describe('voice proposal boundary', () => {
  it('preserves existing groups and the unfinished picker when appending confirmed evidence', () => {
    const result = appendConfirmedVoiceGroups(draft, proposal(pung), ['voice-1']);
    expect(result.slice(0, 2)).toEqual(draft);
    expect(result[2]).toEqual({ id: 'voice-1', kind: 'pung', tile: suited('circles', 3), visibility: 'exposed' });
    expect(draft).toHaveLength(2);
  });
  it('keeps omitted exposure and ambiguous words out of the hand', () => {
    expect(() => appendConfirmedVoiceGroups(draft, proposal({ ...pung, visibility: null }), ['v'])).toThrow();
    expect(() => appendConfirmedVoiceGroups(draft, proposal({ ...pung, tile: null, ambiguity: 'west dragon' }), ['v'])).toThrow();
    expect(() => appendConfirmedVoiceGroups(draft, { groups: [], unparsed: ['no, green dragon'] }, [])).toThrow();
  });
  it('rejects invalid tiles, impossible chows, extra fields and duplicate ids', () => {
    expect(voiceProposalSchema.safeParse(proposal({ ...pung, tile: { family: 'suit', suit: 'circles', rank: 10 } })).success).toBe(false);
    expect(voiceProposalSchema.safeParse({ ...proposal(pung), score: 999 }).success).toBe(false);
    expect(() => appendConfirmedVoiceGroups(draft, proposal({ ...pung, kind: 'chow', tile: { family: 'wind', wind: 'west' } }), ['v'])).toThrow();
    expect(() => appendConfirmedVoiceGroups(draft, proposal(pung), ['manual'])).toThrow();
  });
  it('produces the same deterministic score as the equivalent manual groups', () => {
    const voice = appendConfirmedVoiceGroups([], proposal(pung), ['v']) as import('../scoring').HandSet[];
    const manual = [{ id: 'v', kind: 'pung' as const, tile: suited('circles', 3), visibility: 'exposed' as const }];
    const context = { playerWind: 'east' as const, prevailingWind: 'east' as const, limit: 1000 };
    expect(scoreHand({ sets: voice, bonusTiles: [], isWinner: false }, context)).toEqual(scoreHand({ sets: manual, bonusTiles: [], isWinner: false }, context));
  });
});
