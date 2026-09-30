import type { ProfileTreatment } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

const profile = { id: 'western-tm', version: '0.1' } as const;
const executableBindingIds = [
  'honours-and-one-suit-terminals-pung-kong-hand',
  'one-suit-with-honours-mostly-pung-kong-hand',
] as const;

export const westernTmB4dSpecialHandTreatments = executableBindingIds.map((patternId) => {
  const id = `${profile.id}@${profile.version}:${patternId}`;
  return versioned<ProfileTreatment>(id, {
    treatmentId: id,
    profile,
    subjectId: `pattern.western-tm.${patternId}`,
    runtimeState: { kind: 'executable', ref: { kind: 'binding', id: patternId } },
    evidenceClaimIds: [`evidence.pattern.western-tm.${patternId}`],
  });
});
