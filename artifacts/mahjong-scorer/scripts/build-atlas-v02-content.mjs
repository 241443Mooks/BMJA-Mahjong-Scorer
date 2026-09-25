import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = resolve(packageRoot, '../..');
const docsRoot = resolve(repoRoot, 'docs/rules/encyclopaedia');
const readJson = (path) => JSON.parse(readFileSync(resolve(docsRoot, path), 'utf8'));
const readContent = (key) => readJson(manifest.contentSources[key].split('/').at(-1));
const manifest = readJson('ATLAS_V02_FINAL_CONTENT_MANIFEST.json');
const contentFiles = ['batch1', 'batch2', 'batch3', 'batch4a', 'batch4b'].map((key) => manifest.contentSources[key]);
const entries = new Map();
const examples = new Map();

for (const path of contentFiles) {
  const batch = readJson(path.split('/').at(-1));
  for (const entry of batch.entries) {
    if (entries.has(entry.id)) throw new Error(`Duplicate learner entry id: ${entry.id}`);
    entries.set(entry.id, entry);
  }
  for (const example of batch.examples ?? []) {
    if (examples.has(example.id)) throw new Error(`Duplicate learner example id: ${example.id}`);
    examples.set(example.id, example);
  }
}

const batchOneEvidence = readJson(manifest.contentSources.batch1Evidence.split('/').at(-1));
for (const evidence of batchOneEvidence.entries) {
  const entry = entries.get(evidence.entryId);
  if (!entry) throw new Error(`Batch-one evidence has no learner entry: ${evidence.entryId}`);
  entry.evidenceBindings = evidence.evidenceBindings;
}

const byOwner = new Map();
for (const [referenceId, ownerId] of Object.entries(manifest.treatmentOwnership)) {
  if (!entries.has(ownerId)) throw new Error(`Treatment owner does not exist: ${ownerId}`);
  const owned = byOwner.get(ownerId) ?? [];
  owned.push(referenceId);
  byOwner.set(ownerId, owned);
}
for (const [entryId, referenceIds] of byOwner) {
  entries.get(entryId).treatmentReferenceIds = referenceIds;
}

for (const [entryId, override] of Object.entries(manifest.finalEntryOverrides)) {
  const entry = entries.get(entryId);
  if (!entry) throw new Error(`Final override has no learner entry: ${entryId}`);
  if (override.treatmentReferenceIds) entry.treatmentReferenceIds = override.treatmentReferenceIds;
  if (override.variantTreatmentReferenceIds) {
    for (const [variantId, treatmentReferenceIds] of Object.entries(override.variantTreatmentReferenceIds)) {
      const variant = entry.variants?.find(({ id }) => id === variantId);
      if (!variant) throw new Error(`Final variant override has no matching variant: ${entryId}/${variantId}`);
      variant.treatmentReferenceIds = treatmentReferenceIds;
    }
  }
  if (override.facets) entry.facets = override.facets;
  if (override.addFacets) entry.facets = [...new Set([...(entry.facets ?? []), ...override.addFacets])];
  if (override.removeFacets) entry.facets = (entry.facets ?? []).filter((facet) => !override.removeFacets.includes(facet));
}

const allRefs = Object.keys(manifest.treatmentOwnership);
const ownedRefs = [...entries.values()].flatMap((entry) => entry.treatmentReferenceIds ?? []);
if (allRefs.length !== 146 || new Set(allRefs).size !== allRefs.length) throw new Error(`Manifest must own 146 unique treatments; found ${allRefs.length}`);
if (ownedRefs.length !== allRefs.length || new Set(ownedRefs).size !== ownedRefs.length || allRefs.some((referenceId) => !ownedRefs.includes(referenceId))) {
  throw new Error('Final learner entries must own each manifest treatment exactly once');
}

const facetDefinitions = {
  ...(readContent('batch1').facetDefinitions ?? {}),
  ...(readContent('batch2').facetDefinitionAdditions ?? {}),
  ...(readContent('batch3').facetDefinitionAdditions ?? {}),
  ...(readContent('batch4a').facetDefinitionAdditions ?? {}),
  ...(readContent('batch4b').facetDefinitionAdditions ?? {}),
  'hybrid-layout': 'Represented melds and a separate loose structural component share one hand example.',
};
const model = {
  schemaVersion: 'atlas-v0.2-runtime-1',
  entries: [...entries.values()],
  examples: [...examples.values()],
  facetDefinitions,
  treatmentOwnership: manifest.treatmentOwnership,
  unresolvedTreatmentReferenceIds: manifest.unresolvedTreatmentReferenceIds,
  existingScorerExampleIds: manifest.exampleClassifications.existingScorerExampleIds,
};
const output = resolve(packageRoot, 'src/guide/atlas-v02-content.json');
const expected = `${JSON.stringify(model, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const actual = readFileSync(output, 'utf8');
  if (actual !== expected) {
    console.error('Atlas v0.2 runtime content is stale. Run `pnpm --filter @workspace/mahjong-scorer atlas:generate` and commit the updated snapshot.');
    process.exitCode = 1;
  } else {
    console.log(`Atlas v0.2 runtime content is current (${model.entries.length} learner entries, ${model.examples.length} examples, ${ownedRefs.length} treatment owners).`);
  }
} else {
  writeFileSync(output, expected);
  console.log(`Wrote ${model.entries.length} learner entries, ${model.examples.length} examples and ${ownedRefs.length} treatment owners.`);
}
