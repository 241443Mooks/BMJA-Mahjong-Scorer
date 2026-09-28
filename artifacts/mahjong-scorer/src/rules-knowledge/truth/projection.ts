import type { TruthCorpus } from './records';

/** Small Markdown view of migrated source records; the register remains the broader editorial index. */
export const projectSourceRegister = (corpus: TruthCorpus): string => [
  '| Source ID | Citation | Authority | Profile scope |',
  '| --- | --- | --- | --- |',
  ...[...corpus.sources].sort((a, b) => (a.record.sourceId < b.record.sourceId ? -1 : a.record.sourceId > b.record.sourceId ? 1 : 0)).map(({ record }) =>
    `| ${record.sourceId} | ${record.citation} | ${record.authority} | ${record.authorityForProfileIds.join(', ') || '—'} |`),
].join('\n');
