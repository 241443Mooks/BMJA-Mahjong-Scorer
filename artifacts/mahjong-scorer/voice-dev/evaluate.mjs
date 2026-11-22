// Requires the explicitly started local server and an owner-configured key. Outputs aggregate only.
import { readFile } from 'node:fs/promises';
const cases = JSON.parse(await readFile(new URL('./evaluation.json', import.meta.url), 'utf8'));
let passed = 0, failed = 0;
for (const item of cases) {
  const r = await fetch('http://127.0.0.1:5173/__voice/interpret', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://127.0.0.1:5173' }, body: JSON.stringify({ transcript: item.text }) });
  if (r.status === 429) { console.error('Rate limit reached; run the evaluation in smaller batches.'); process.exit(1); }
  if (!r.ok) { console.error('Evaluation unavailable; configure and start the local server.'); process.exit(1); }
  const actual = await r.json();
  const groups = actual.groups.map(g => [g.kind, g.tile?.family ?? null, g.tile?.suit ?? g.tile?.wind ?? g.tile?.dragon ?? null, g.tile?.rank ?? null, g.visibility]);
  const uncertain = actual.unparsed.length > 0 || actual.groups.some(g => !g.kind || !g.tile || g.ambiguity);
  const match = item.uncertain ? uncertain : !uncertain && JSON.stringify(groups) === JSON.stringify(item.expected);
  if (match) passed++; else failed++;
  await new Promise(resolve => setTimeout(resolve, 6500));
}
console.log(`Exact evidence / uncertainty checks: ${passed}/${cases.length} passed; ${failed} failed.`);
