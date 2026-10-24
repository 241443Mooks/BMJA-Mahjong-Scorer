import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
process.env.PORT ??= '5173';
process.env.BASE_PATH ??= '/';
const server = await createServer({
  configFile: false,
  root,
  resolve: { alias: { '@': resolve(root, 'src'), '@assets': resolve(root, '../../attached_assets') } },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
});
try {
  const reportModule = await server.ssrLoadModule('/src/rules-knowledge/truth/reconciliation-report.ts');
  const profiles = reportModule.governedProfileInventory();
  const reports = profiles.map((profile) => reportModule.buildTruthReconciliationReport(profile));
  const outputDir = resolve(root, 'reports');
  await mkdir(outputDir, { recursive: true });
  const coverage = reports.map(({ profile, coverage: facts, mechanisms }) => ({ profile, mechanisms, facts }));
  const exceptions = reports.flatMap(({ profile, exceptions: entries }) => entries.map((entry) => ({ ...entry, profile: entry.profile ?? `${profile.id}@${profile.version}` })));
  const coverageMarkdown = reports.map((report) => reportModule.renderTruthReconciliationMarkdown({ ...report, exceptions: [] }))
    .join('\n');
  const exceptionMarkdown = [
    '# Actionable rules exceptions', '',
    'This queue contains source conflicts, broken exact-profile runtime links, missing treatments for sourced claims, ambiguous treatments, and reviewed unresolved decisions. Coverage and migration gaps are reported separately.', '',
    ...(exceptions.length ? exceptions.map((entry) => `- **${entry.id}** · ${entry.profile} · ${entry.disposition} · ${entry.ownerClass}: ${entry.impact} Evidence: ${entry.evidence.join(', ')}. Check: ${entry.assertion}`) : ['No actionable exceptions are currently recorded.']),
    '',
  ].join('\n');
  await writeFile(resolve(outputDir, 'rules-knowledge-coverage.json'), `${JSON.stringify({ schemaVersion: 1, profiles: coverage }, null, 2)}\n`);
  await writeFile(resolve(outputDir, 'rules-knowledge-coverage.md'), coverageMarkdown);
  await writeFile(resolve(outputDir, 'rules-actionable-exceptions.json'), `${JSON.stringify({ schemaVersion: 1, exceptions }, null, 2)}\n`);
  await writeFile(resolve(outputDir, 'rules-actionable-exceptions.md'), exceptionMarkdown);
  process.stdout.write(`Wrote knowledge coverage and ${exceptions.length} actionable exceptions for ${reports.length} exact profiles.\n`);
} finally {
  await server.close();
}
