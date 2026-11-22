const fields = ['kind', 'tile family', 'tile identity', 'rank', 'exposure'];
const groupFields = group => [
  group.kind,
  group.tile?.family ?? null,
  group.tile?.suit ?? group.tile?.wind ?? group.tile?.dragon ?? null,
  group.tile?.rank ?? null,
  group.visibility,
];

export function compareEvidence(item, actual, blockers) {
  const omissions = [];
  const guesses = [];
  const sourceErrors = [];
  let unresolved = 0;
  let matchedFacts = 0;
  const remaining = [...actual.groups];

  item.expected.forEach((expected, index) => {
    const label = `group ${index + 1}`;
    const source = item.sources[index];
    const grounded = remaining.findIndex(group => item.text.includes(group.source) && group.source.includes(source));
    let match = grounded;
    if (match < 0) {
      // Prefer the closest group for diagnostics when the source span is wrong.
      const distance = group => groupFields(group).filter((field, i) => field !== expected[i]).length;
      match = remaining.reduce((best, group, i) => best < 0 || distance(group) < distance(remaining[best]) ? i : best, -1);
      if (match < 0) {
        omissions.push(`${label} missing`);
        return;
      }
      sourceErrors.push(`${label} missing its supporting source span`);
    }
    const [group] = remaining.splice(match, 1);
    const actualFields = groupFields(group);
    expected.forEach((value, i) => {
      const found = actualFields[i];
      if (found === value) {
        if (value !== null) matchedFacts++;
        return;
      }
      if (found === null) omissions.push(`${label} missing ${fields[i]}`);
      else guesses.push(`${label} incorrect or unsupported ${fields[i]}`);
    });
    if (expected[4] === null && group.visibility === null) unresolved++;
    if (expected[0] === null && group.kind === null) unresolved++;
    if (expected[1] === null) {
      if (!group.tile && group.ambiguity) unresolved++;
      else if (!group.tile) omissions.push(`${label} missing tile clarification`);
    } else if (group.ambiguity) {
      omissions.push(`${label} marked ambiguous despite specified tile`);
    }
  });
  remaining.forEach(() => guesses.push('unexpected group'));

  const unmatched = [...actual.unparsed];
  item.unparsed.forEach((fragment, i) => {
    const index = unmatched.findIndex(value => item.text.includes(value) && value.includes(fragment));
    if (index < 0) omissions.push(`unresolved fragment ${i + 1} missing its source span`);
    else {
      unresolved++;
      unmatched.splice(index, 1);
    }
  });
  unmatched.forEach(() => omissions.push('unexpected unresolved fragment'));

  const ready = blockers.length === 0;
  const exact = !omissions.length && !guesses.length && !sourceErrors.length;
  return {
    exact, matchedFacts, unresolved, guesses, omissions, sourceErrors, ready,
    readinessMatches: ready === item.ready, blockers,
    pass: exact && ready === item.ready,
  };
}
