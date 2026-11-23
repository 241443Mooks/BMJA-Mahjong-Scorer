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
  'tiles.physical-set',
  'hand.normal-winning-shape',
  'scoring.grammar',
  'scoring.limit-cap',
  'settlement.winner-payments',
];

const sourceStatusLabel: Record<ProfileDimensionValue['sourceStatus'], string> = {
  'source-verified': 'Source checked',
  'verified-club': 'Club rules checked',
  'source-provisional': 'Source review incomplete',
  'source-unknown': 'Source finding not recorded',
  'not-applicable': 'Source status not applicable',
};

const runtimeStatusLabel: Record<ProfileDimensionValue['runtimeSupport'], string> = {
  executable: 'In the current scorer',
  partial: 'Partly represented by the scorer',
  'reference-only': 'Reference only',
  'not-modelled': 'Not established by this report',
  'not-applicable': 'Not an executable rule',
};

function readerValue(row: ProfileDimensionValue): string {
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
      return value === 'tiles.flowers-144' ? '144 tiles, including Flowers and Seasons' : 'Value not translated';
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
      return 'A configured value is recorded; a plain-language summary is not available here yet';
  }
}

function DimensionDetail({ row }: { row: ProfileDimensionValue }) {
  const definition = RULES_DIMENSIONS.find(({ id }) => id === row.dimensionId)!;
  return <div className="border-t border-[#e4dccd] py-3 first:border-t-0">
    <dt className="font-semibold text-[#284d45]">{definition.label}</dt>
    <dd className="mt-1">{readerValue(row)}</dd>
    <dd className="mt-1 text-[13px] leading-5 text-[#536860]">
      {runtimeStatusLabel[row.runtimeSupport]} · {sourceStatusLabel[row.sourceStatus]}
    </dd>
    {row.caveat && <dd className="mt-1 text-[13px] leading-5 text-[#684f37]">{row.caveat}</dd>}
  </div>;
}

export function RulesetProfileReport({ profile }: { profile: RulesProfileRef }) {
  // The app initialises exact, sealed runtimes before it renders routes.
  const artifact = getCurrentCompiledRulesRuntime(profile).artifact;
  const values = projectProfileDimensions(artifact, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE);
  const gaps = values.filter(({ value }) => value.status === 'unknown').length;
  return <section aria-labelledby="ruleset-at-a-glance" className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12">
    <h2 id="ruleset-at-a-glance" className="font-serif text-[30px] leading-tight text-[#284d45]">Rules at a glance</h2>
    <p className="mt-3 max-w-[820px] text-[16px] leading-7 text-[#405650]">
      These are settings and mechanics used by the current scorer, not a substitute for the full rules.
      The exact profile is <strong>{profile.id}@{profile.version}</strong>.
    </p>
    <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {highlights.map((id) => {
        const row = profileDimensionValue(values, id)!;
        const definition = RULES_DIMENSIONS.find((dimension) => dimension.id === id)!;
        return <div key={id} className="rounded-xl border border-[#d8ceb8] bg-[#fdfbf5] p-4">
          <dt className="text-[13px] font-semibold text-[#536860]">{definition.label}</dt>
          <dd className="mt-2 text-[18px] font-semibold leading-6 text-[#284d45]">{readerValue(row)}</dd>
          <dd className="mt-2 text-[12px] leading-5 text-[#536860]">{runtimeStatusLabel[row.runtimeSupport]} · {sourceStatusLabel[row.sourceStatus]}</dd>
        </div>;
      })}
    </dl>
    <details className="mt-6 rounded-xl border border-[#d8ceb8] bg-white p-4 sm:p-5">
      <summary className="cursor-pointer font-semibold text-[#284d45]">See the detailed profile and what it doesn't yet cover</summary>
      <p className="mt-4 text-[14px] leading-6 text-[#405650]">
        The shared report currently defines {values.length} dimensions. {gaps} do not yet have a mapped value for this profile.
        That is a gap in this summary, <strong>not evidence that a rule is absent or unsupported by the scorer</strong>.
        Other parts of the scorer may already implement the rule. A working scorer also does not, by itself, verify a published source.
      </p>
      <p className="mt-3 break-all text-[12px] leading-5 text-[#536860]">
        Configuration fingerprint: <code>{artifact.rulesFingerprint}</code>
      </p>
      {groups.map((group) => {
        const rows = values.filter((row) => RULES_DIMENSIONS.find((definition) => definition.id === row.dimensionId)?.group === group.id);
        const mapped = rows.filter(({ value }) => value.status !== 'unknown').length;
        return <details key={group.id} className="mt-3 rounded-lg border border-[#e4dccd] bg-[#fdfbf5] p-4">
          <summary className="cursor-pointer font-serif text-[20px] text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{group.title}<span className="ml-2 font-sans text-[12px] text-[#536860]">{mapped} of {rows.length} values recorded</span></summary>
          <dl className="mt-3 text-[14px] leading-6 text-[#405650]">
            {rows.map((row) => <DimensionDetail key={row.dimensionId} row={row} />)}
          </dl>
        </details>;
      })}
      <p className="mt-6 text-[13px] leading-6 text-[#405650]">
        Source references and limitations for this ruleset are explained below. The same shared dimensions will also power comparisons with other exact profiles.
      </p>
    </details>
  </section>;
}
