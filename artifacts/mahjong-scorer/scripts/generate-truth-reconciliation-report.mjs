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
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});
try {
  const reportModule = await server.ssrLoadModule('/src/rules-knowledge/truth/reconciliation-report.ts');
  const profiles = reportModule.governedProfileInventory();
  const reports = profiles.map((profile) => reportModule.buildTruthReconciliationReport(profile));
  const outputDir = resolve(root, 'reports');
  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, 'rules-evidence-reconciliation.json'), `${JSON.stringify({ schemaVersion: 1, reports }, null, 2)}\n`);
  const markdown = reports.map((report) => reportModule.renderTruthReconciliationMarkdown(report)).join('\n');
  await writeFile(resolve(outputDir, 'rules-evidence-reconciliation.md'), markdown);
  process.stdout.write(`Wrote deterministic evidence reconciliation for ${reports.length} exact profiles.\n`);
} finally {
  await server.close();
}
