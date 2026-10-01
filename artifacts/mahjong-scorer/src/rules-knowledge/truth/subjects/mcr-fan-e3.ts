import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { MCR_2006_FAN_BINDINGS } from '../../../rules-platform/mcr-detectors';
import { versioned } from '../records';

export const mcrFanE3SourceSemantics = [
  'Every set and the pair in an ordinary interpretation contains a suited terminal or an Honor; a Chow therefore uses 123 or 789.',
  'The completed hand has no melded set and is won by self-draw; a declared concealed Kong does not make the hand melded.',
  'The source-defined Two Melded Kongs fan covers two melded Kongs and its Appendix 1 mixed case of one melded Kong with one concealed Kong; two concealed Kongs are covered separately.',
  'The winning tile is the final visible copy of its tile kind.',
  'An ordinary interpretation contains a Pung or Kong of a Dragon.',
  'An ordinary interpretation contains a Pung or Kong of the prevailing Wind for the hand.',
  "An ordinary interpretation contains a Pung or Kong of the player's Seat Wind.",
  'The completed hand has no melded set and is won by discard; a declared concealed Kong does not make the hand melded.',
  'An ordinary interpretation consists of four Chows and a suited pair, with no Honors.',
  'All four physical copies of a suited tile kind occur in the hand without forming a Kong.',
  'An ordinary interpretation contains Pung or Kong sets of the same rank in two different numbered suits.',
  'An ordinary interpretation contains at least two Pung or Kong sets achieved without melding; a declared concealed Kong counts.',
  'A declared concealed Kong consists of four identical tiles declared as a Kong while concealed.',
  'Every tile in the hand is a suited rank from 2 through 8.',
  'An ordinary interpretation contains two identical Chows in the same numbered suit.',
  'An ordinary interpretation contains two Chows with the same start rank in different numbered suits.',
  'An ordinary interpretation contains two Chows in one numbered suit that form six consecutive ranks.',
  'An ordinary interpretation contains both the 123 Chow and the 789 Chow in one numbered suit.',
  'An ordinary interpretation contains a Pung or Kong of a suited terminal or a Wind; Dragon sets are identified by Dragon Pung.',
  'A declared Kong is melded, whether claimed from another player or promoted from an existing melded Pung.',
  'The hand contains tiles from exactly two of the three numbered suits; Honors may also occur.',
  'The hand contains no Wind or Dragon tiles.',
  'Before the win, the hand waits only on the winning face, which completes a 123 Chow as 3 or a 789 Chow as 7, with no competing winning face or wait class.',
  'Before the win, the hand waits only on the winning face, which fills the middle of a Chow, with no competing winning face or wait class.',
  'Before the win, the hand waits only on the winning face, which completes the pair, with no competing winning face or wait class.',
  'The winning tile is drawn by the player, including a replacement tile after a Kong or Flower.',
  'Fan #81 identifies Flower tiles retained by the winner as Flower Tiles.',
] as const;

export const mcrFanE3Bindings = MCR_2006_FAN_BINDINGS.slice(54, 81).map((binding, index) => ({
  fanNumber: index + 55,
  binding,
  subjectId: `pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`,
  claimId: `evidence.pattern.mcr-wmo-2006.${binding.id.slice('mcr2006.fan.'.length)}`,
  treatmentId: `mcr-wmo-2006@0.1:${binding.id.slice('mcr2006.fan.'.length)}`,
  sourceSemantics: mcrFanE3SourceSemantics[index],
}));

export const mcrFanE3Subjects = mcrFanE3Bindings.map(({ subjectId }) =>
  versioned<SemanticSubject>(subjectId, { id: subjectId, kind: 'pattern' }),
);
