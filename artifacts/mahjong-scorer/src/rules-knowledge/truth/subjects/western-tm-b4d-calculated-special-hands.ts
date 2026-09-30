import type { SemanticSubject } from '../../../rules-platform/truth-model';
import { versioned } from '../records';

export const westernTmB4dBindingIds = [
  'purity-one-chow',
  'honours-and-one-suit-terminals-pung-kong-hand',
  'one-suit-with-honours-mostly-pung-kong-hand',
] as const;

export const westernTmB4dSpecialHandSubjects = westernTmB4dBindingIds.map((bindingId) => {
  const id = `pattern.western-tm.${bindingId}`;
  return versioned<SemanticSubject>(id, { id, kind: 'pattern' as const });
});
