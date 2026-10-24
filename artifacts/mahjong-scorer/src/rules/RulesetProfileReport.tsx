import { getCurrentCompiledRulesRuntime } from '../rules-platform/current-runtime-registry';
import {
  CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE,
  profileDimensionValue,
  projectProfileDimensions,
  RULES_DIMENSIONS,
  type ProfileDimensionValue,
  type RulesDimensionGroup,
  type RulesDimensionId,
} from '../rules-platform/profile-dimensions';
import type { RulesProfileRef } from '../rules-platform/types';
import { readGovernedFacts } from '../rules-knowledge/truth/read-contract';
import type { GovernedFact } from '../rules-knowledge/truth/read-contract';
import { explainBritishFlowersAndSeasons } from '../rules-knowledge/truth/explain-british-flowers-seasons';
import { specialHandTreatmentsForProfile } from '../rules-knowledge/special-hand-treatments';
import { ATLAS_LEARNER_ENTRIES, atlasExamplesForTreatment, ATLAS_TREATMENT_OWNERSHIP } from '../guide/special-hands-atlas';
import { AtlasExampleVisual } from '../guide/AtlasExampleVisual';
import { atlasExampleProvesTreatment } from '../guide/atlas-scorer-handoff';

/**
 * Reader-facing projection of the shared #406 profile x dimension contract.
 * No score, limit, source-confidence or profile-specific rule is authored here.
 * Unmapped dimensions remain visible as gaps in this report, not absent rules.
 */
const groups: readonly { id: RulesDimensionGroup; title: string }[] = [
  { id: 'identity-table-tiles', title: 'Table and tiles' },
  { id: 'hand-play', title: 'Hand structure and play' },
  { id: 'ready-declarations', title: 'Ready and waiting' },
  { id: 'scoring', title: 'Scoring' },
  { id: 'settlement-incidents', title: 'Payments and incidents' },
  { id: 'draws-progression', title: 'Draws and game progression' },
];

const highlights: readonly RulesDimensionId[] = [
  'table.player-count',
  'table.seat-model',
  'tiles.physical-set',
];

const sourceStatusLabel: Record<ProfileDimensionValue['sourceStatus'], string> = {
  'source-verified': 'Checked against the published rules',
  'verified-club': 'Checked against the club rules',
  'source-provisional': 'Some source details still need checking',
  'source-unknown': 'We haven’t confirmed this here yet',
  'not-applicable': 'No source check applies',
};

const runtimeStatusLabel: Record<ProfileDimensionValue['runtimeSupport'], string> = {
  executable: 'Used by the scorer',
  partial: 'Partly used by the scorer',
  'reference-only': 'Reference information',
  'not-modelled': 'We haven’t confirmed this here yet',
  'not-applicable': 'This does not apply here',
};

function readerValue(row: ProfileDimensionValue): string {
  if (row.playerAnswer) return row.playerAnswer;
  if (row.value.status === 'unknown') return 'Not yet established in this report';
  if (row.value.status === 'absent') return 'Established as absent under these exact rules';
  if (row.value.status === 'not-applicable') return 'Not applicable';
  const value = row.value.data;
  // Each translation is a vocabulary label for a *resolved* value, not a new rule.
  switch (row.dimensionId) {
    case 'profile.identity':
      return row.displayValue;
    case 'profile.authority-status':
      return typeof value === 'string' ? value : 'Status not translated';
    case 'table.player-count':
      return typeof value === 'number' ? `${value} players` : 'Value not translated';
    case 'table.seat-model':
      return value === 'seats.winds-4' ? 'East, South, West and North' : 'Value not translated';
    case 'tiles.physical-set':
      return value === 'tiles.flowers-144' ? '144 tiles, including Flowers and Seasons' : 'The tile set has not been confirmed here yet.';
    case 'hand.normal-winning-shape':
      return value === 'shape.four-sets-pair' ? 'Four sets and a pair' : 'Value not translated';
    case 'scoring.grammar':
      return value === 'classical-points-doubles' ? 'Points and doubles'
        : value === 'pattern-accumulator' ? 'Fan-pattern scoring'
          : 'Value not translated';
    case 'scoring.limit-cap':
      return typeof value === 'number' ? `${value.toLocaleString('en-GB')} points (configured default)` : 'Value not translated';
    case 'settlement.winner-payments':
      return value === 'settlement.classical-pairwise' ? 'Classical pairwise settlement'
        : 'Value not translated';
    case 'round.draw-follow-up':
      return value === 'hand-mode.none' ? 'The scorer does not switch hand mode automatically'
        : 'An alternate hand mode is configured';
    case 'progression.dealer-retention':
      return value === 'progression.classical-east-cycle' ? 'Classical East-cycle strategy' : 'Value not translated';
    case 'progression.game-end':
      return value === 'game-end.classical-east-cycle' ? 'Classical East-cycle game end' : 'Value not translated';
    default:
      return typeof value === 'string' || typeof value === 'number'
        ? `The scorer uses ${String(value)} for this setting.`
        : 'We haven’t confirmed this here yet.';
  }
}

function DimensionDetail({ row }: { row: ProfileDimensionValue }) {
  const definition = RULES_DIMENSIONS.find(({ id }) => id === row.dimensionId)!;
  return <div className="border-t border-[#e4dccd] py-3 first:border-t-0">
    <dt className="font-semibold text-[#284d45]">{definition.label}</dt>
    <dd className="mt-1">{readerValue(row)}</dd>
    <dd className="mt-1 text-[13px] leading-5 text-[#536860]">{row.value.status === 'unknown' ? 'We haven’t confirmed this here yet.' : `${runtimeStatusLabel[row.runtimeSupport]} · ${sourceStatusLabel[row.sourceStatus]}`}</dd>
    {row.caveat && <dd className="mt-1 text-[13px] leading-5 text-[#684f37]">{row.caveat}</dd>}
  </div>;
}

function specialHandScore(record: ReturnType<typeof specialHandTreatmentsForProfile>[number]) {
  if (record.winnerValue === undefined) return 'Score follows the hand’s scoring rules.';
  const format = (value: number) => new Intl.NumberFormat('en-GB').format(value);
  return `${format(record.winnerValue)} points when complete${record.fishingValue === undefined ? '' : `; ${format(record.fishingValue)} when one tile from winning${record.fishingUsesIntrinsicFloor ? ' (or the hand value if higher)' : ''}`}.`;
}

function specialHandConditions(record: ReturnType<typeof specialHandTreatmentsForProfile>[number]) {
  const facts: string[] = [];
  const policy = record.exposurePolicy?.policy as { allowed?: boolean; exposedValue?: number; exposedFishingValue?: number; multiplier?: number } | undefined;
  if (policy?.allowed === false) facts.push('All sets must be concealed.');
  else if (policy?.allowed === true && policy.exposedValue !== undefined) facts.push(`With exposed sets: ${policy.exposedValue} points${policy.exposedFishingValue === undefined ? '' : ` when one tile from winning: ${policy.exposedFishingValue} points`}.`);
  else if (policy?.allowed === true) facts.push('Exposed sets are allowed.');
  else if (policy?.multiplier !== undefined) facts.push(`Exposed sets multiply the score by ${policy.multiplier}.`);
  if (record.winningMethods?.length) facts.push(`Winning method: ${record.winningMethods.join(' or ')}.`);
  return facts;
}

export function BritishSpecialHands({ profile }: { profile: RulesProfileRef }) {
  const treatments = specialHandTreatmentsForProfile(profile);
  const cards = treatments.flatMap((treatment) => {
    const entryId = ATLAS_TREATMENT_OWNERSHIP[treatment.referenceId];
    const entry = ATLAS_LEARNER_ENTRIES.find((candidate) => candidate.id === entryId);
    return [{ treatment, entry, examples: entry ? atlasExamplesForTreatment(entry, treatment.referenceId).filter((example) => example.kind === 'tile-hand' && atlasExampleProvesTreatment(example.id, treatment.referenceId)) : [] }];
  });
  return <section id="british-special-hands" aria-labelledby="british-special-hands-title" className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
    <h2 id="british-special-hands-title" className="font-serif text-[30px] text-[#284d45]">Special hands</h2>
    <p className="mt-3 max-w-[820px] text-[16px] leading-7 text-[#405650]">These named hands have their own requirements and scores. Open a hand for its details and any reviewed tile example.</p>
    <details className="mt-4 rounded-xl border border-[#d8ceb8] bg-white p-4"><summary className="min-h-11 cursor-pointer font-semibold text-[#284d45]">Browse {cards.length} British special hands</summary>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">{cards.map(({ treatment, entry, examples }) => {
        const example = examples[0];
        const handName = treatment.name;
        return <li key={treatment.referenceId} className="min-w-0 rounded-lg border border-[#e4dccd] bg-[#fdfbf5] p-3">
          <h3 className="font-serif text-xl text-[#284d45]">{handName}</h3>
          <p className="mt-1 text-sm leading-5">{treatment.description}</p>
          <p className="mt-2 text-sm font-semibold">{specialHandScore(treatment)}</p>
          <details className="mt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-[#284d45]">Requirements and example</summary>
            <div className="space-y-2 text-sm leading-5"><p>{treatment.description}</p>{specialHandConditions(treatment).map((fact) => <p key={fact}>{fact}</p>)}
              {example ? <AtlasExampleVisual example={example} title={`${handName} tile example`} /> : <p>No reviewed tile example is available for this hand. See its guide entry for the reviewed description.</p>}
              <a className="inline-flex min-h-11 items-center font-semibold text-[#284d45] underline underline-offset-4" href={treatment.href ?? '/special-hands'}>{treatment.href ? `Read ${handName} in the Special Hands guide` : 'Browse the Special Hands guide'}</a>
            </div>
          </details>
        </li>;
      })}</ul>
    </details>
  </section>;
}

const sourceLabel = (status: GovernedFact['sourceState']) => ({
  verified: 'Source claim reviewed',
  'verified-club': 'Club source claim reviewed',
  provisional: 'Source review incomplete',
  conflict: 'Source conflict recorded',
  'multiple-claims': 'Multiple source claims retained',
  unknown: 'Source support not established',
}[status]);

function GovernedFactDetails({ fact }: { fact: GovernedFact }) {
  return <details className="mt-2 rounded-lg border border-[#e4dccd] bg-[#fdfbf5] p-3">
    <summary className="cursor-pointer break-words font-semibold text-[#284d45]">{fact.subject.id}<span className="ml-2 text-xs font-normal text-[#596b65]">{sourceLabel(fact.sourceState)} · {fact.runtime.mappingState === 'complete' && fact.runtime.ref ? 'scorer owner linked' : fact.runtime.mappingState === 'incomplete' ? 'scorer mapping incomplete' : fact.runtime.mappingState === 'ambiguous' ? 'multiple current treatments' : 'no executable scorer owner recorded'}</span></summary>
    <div className="mt-3 space-y-3 text-sm leading-6 text-[#405650]">
      <p>Exact treatment: <code>{fact.treatment?.recordId ?? 'not recorded'}</code> · version {fact.treatment?.recordVersion ?? '—'} · runtime state {typeof fact.runtime.state === 'string' ? fact.runtime.state : fact.runtime.state.kind}.</p>
      {fact.claims.length ? <ul className="list-disc space-y-2 pl-5">{fact.claims.map((claim) => <li key={`${claim.recordId}:${claim.recordVersion}`}>
        <p>{claim.text}</p>
        <p className="text-xs">Claim {claim.recordId} v{claim.recordVersion} · {claim.status}</p>
        {claim.source ? <p className="text-xs">{claim.source.citation} · {claim.source.locator.url ? <a className="underline" href={claim.source.locator.url} target="_blank" rel="noreferrer">{claim.source.locator.label}</a> : claim.source.locator.label} · source {claim.source.recordId} v{claim.source.recordVersion}</p> : <p className="text-xs">The linked source is missing or is not authoritative for this exact profile.</p>}
      </li>)}</ul> : <p>No current source claim is linked to this exact profile.</p>}
      <p>Runtime capability: {fact.runtime.capability}. Connection: {fact.runtime.ref ? `${fact.runtime.ref.kind}:${fact.runtime.ref.id} (${fact.runtime.mappingState})` : fact.runtime.mappingState}. {fact.runtime.conformance === 'exact-fact-fixture' ? 'An exact fact fixture is recorded.' : fact.runtime.conformance === 'representative-mechanism-fixture' ? 'Representative mechanism tests are recorded; they do not prove every individual rule.' : 'No representative runtime fixture is currently recorded.'}</p>
      {fact.runtime.fixturePaths.length > 0 && <ul className="list-disc break-all pl-5 text-xs">{fact.runtime.fixturePaths.map((path) => <li key={path}>{path}</li>)}</ul>}
      <p>Reader projection: {fact.projection === 'source-claim' ? 'one current supported source claim is available.' : 'not projected as a settled explanation because the evidence or treatment is incomplete, unsupported or ambiguous.'}</p>
    </div>
  </details>;
}

export function RulesetProfileReport({ profile }: { profile: RulesProfileRef }) {
  // The app initialises exact, sealed runtimes before it renders routes.
  const artifact = getCurrentCompiledRulesRuntime(profile).artifact;
  const values = projectProfileDimensions(artifact, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE);
  return <section aria-labelledby="ruleset-at-a-glance" className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
    <h2 id="ruleset-at-a-glance" className="font-serif text-[30px] leading-tight text-[#284d45]">Players and tiles</h2>
    {profile.id !== 'bmja' && <p className="mt-3 max-w-[820px] text-[16px] leading-7 text-[#405650]">These are settings and mechanics used by the current scorer, not a substitute for the full rules.</p>}
    <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {highlights.map((id) => {
        const row = profileDimensionValue(values, id)!;
        const definition = RULES_DIMENSIONS.find((dimension) => dimension.id === id)!;
        return <div key={id} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
          <dt className="text-[13px] font-semibold text-[#536860]">{definition.label}</dt>
          <dd className="mt-2 text-[18px] font-semibold leading-6 text-[#284d45]">{readerValue(row)}</dd>
          {profile.id !== 'bmja' && <dd className="mt-2 text-[12px] leading-5 text-[#536860]">{runtimeStatusLabel[row.runtimeSupport]} · {sourceStatusLabel[row.sourceStatus]}</dd>}
        </div>;
      })}
    </dl>
  </section>;
}

export function RulesetProfileDetails({ profile }: { profile: RulesProfileRef }) {
  const artifact = getCurrentCompiledRulesRuntime(profile).artifact;
  const values = projectProfileDimensions(artifact, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE);
  const governedFacts = readGovernedFacts(profile);
  const flowers = explainBritishFlowersAndSeasons(profile);
  return <details className="rounded-xl border border-[#d8ceb8] bg-white p-4 sm:p-5">
    <summary className="min-h-11 cursor-pointer font-semibold text-[#284d45]">More about these rules</summary>
    <p className="mt-4 text-[14px] leading-6 text-[#405650]">This summary separates what the published rules say from what the scorer currently does. Some details still need confirmation; a missing note here does not mean the scorer lacks that rule.</p>
    {groups.map((group) => {
      const rows = values.filter((row) => RULES_DIMENSIONS.find((definition) => definition.id === row.dimensionId)?.group === group.id);
      return <details key={group.id} className="mt-3 rounded-lg border border-[#e4dccd] bg-[#fdfbf5] p-4">
        <summary className="min-h-11 cursor-pointer font-serif text-[20px] text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{group.title}</summary>
        <dl className="mt-3 text-[14px] leading-6 text-[#405650]">{rows.map((row) => <DimensionDetail key={row.dimensionId} row={row} />)}</dl>
      </details>;
    })}
    <details className="mt-4 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
      <summary className="min-h-11 cursor-pointer font-semibold text-[#284d45]">How we checked these rules</summary>
      <p className="mt-3 text-sm leading-6 text-[#405650]">The published British reference is checked against the scorer and focused behaviour examples. These checks support the specific rules they cover; they do not prove every rule is complete.</p>
      <div className="mt-3">{governedFacts.map((fact) => <GovernedFactDetails key={fact.factId} fact={fact} />)}</div>
    </details>
    {flowers.available && <section className="mt-4 rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4" aria-labelledby="flowers-seasons-explanation">
      <h3 id="flowers-seasons-explanation" className="font-serif text-xl text-[#284d45]">{flowers.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#405650]">{flowers.summary}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#405650]">{flowers.scorerBehaviour.map((behaviour, index) => <li key={index}><span className="font-semibold">{['Ordinary hands', 'Fixed special hands', 'Fishing'][index]}:</span> {behaviour}</li>)}</ul>
      <details className="mt-3 border-t border-[#e5dccb] pt-2 text-xs text-[#596b65]"><summary className="min-h-11 cursor-pointer py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Source and scorer details</summary>
        <ul className="space-y-2 pb-2 leading-5">{flowers.sourceFacts.map(({ claim, source }) => <li key={claim.recordId}><p>{claim.text}</p><p>Claim {claim.recordId} v{claim.recordVersion} · {claim.reviewStatus} · {source.citation} · {source.locator.url ? <a className="underline" href={source.locator.url} target="_blank" rel="noreferrer">{source.locator.label}</a> : source.locator.label} · source {source.recordId} v{source.recordVersion}</p></li>)}</ul>
        <ul className="list-disc pl-5">{flowers.technical.map(({ subjectId, treatment, mapping, fixtures }) => <li key={subjectId}><code>{subjectId}</code> → {mapping.ruleRef.id} · {treatment.recordId} v{treatment.recordVersion} · tests: {fixtures.join(', ')}</li>)}</ul>
      </details>
    </section>}
  </details>;
}
