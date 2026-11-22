// Run explicitly against the owner-approved Cloudflare Access preview.
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { compareEvidence } from './evidence-metrics.mjs';
import { MODEL } from './openai.mjs';

const [target, caseId, ...extra] = process.argv.slice(2);
const corpus = JSON.parse(await readFile(new URL('./evaluation.json', import.meta.url), 'utf8'));
const cases = caseId ? corpus.filter(item => item.id === caseId) : corpus;
let url;
try { url = new URL(target); } catch {}
if (!url || url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password || !cases.length || extra.length) {
  console.error('Usage: node artifacts/mahjong-scorer/voice-dev/evaluate.mjs https://<approved-preview-host> [01-26]');
  process.exit(2);
}

let token;
try {
  token = execFileSync('cloudflared', ['access', 'token', '--app', url.origin], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000,
  }).trim();
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) throw new Error();
} catch {
  console.error('Run cloudflared access login against the approved preview first.');
  process.exit(2);
}

process.env.PORT = '5173';
process.env.BASE_PATH = '/';
const server = await createServer({
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  server: { middlewareMode: true, watch: null, ws: false },
});
try {
  const evidence = await server.ssrLoadModule('/src/game/voice-evidence.ts');
  const registry = await server.ssrLoadModule('/src/rules-platform/current-runtime-registry.ts');
  const { BMJA_PROFILE_REF } = await server.ssrLoadModule('/src/game/ruleset.ts');
  await registry.initialiseCurrentRulesRuntimes();
  const { runtime } = registry.getCurrentCompiledRulesRuntime(BMJA_PROFILE_REF);
  const hand = { sets: [], bonusTiles: [], isWinner: false };
  const context = { playerWind: 'east', prevailingWind: 'east', limit: runtime.defaultTableLimit, handMode: 'normal' };
  const results = [];
  const latencies = [];
  let cost = 0;
  let metered = 0;
  let providerAttempts = 0;
  for (const [index, item] of cases.entries()) {
    if (index) await delay(12_500);
    const result = { id: item.id, pass: false };
    try {
      const start = performance.now();
      const response = await fetch(new URL('/__voice/interpret', url), {
        method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(40_000),
        headers: { 'Content-Type': 'application/json', Origin: url.origin, Cookie: `CF_Authorization=${token}` },
        body: JSON.stringify({ transcript: item.text }),
      });
      result.roundTripMs = Math.round(performance.now() - start);
      result.httpStatus = response.status;
      const number = name => {
        const value = response.headers.get(name);
        return value !== null && /^\d+$/.test(value) ? Number(value) : null;
      };
      result.providerStatus = number('X-Voice-Provider-Status');
      result.providerMs = number('X-Voice-Provider-Ms');
      if (result.providerMs !== null) latencies.push(result.providerMs);
      if (result.providerStatus !== null) providerAttempts++;
      const input = number('X-Voice-Input-Tokens');
      const cached = number('X-Voice-Cached-Tokens') ?? 0;
      const output = number('X-Voice-Output-Tokens');
      const model = response.headers.get('X-Voice-Model');
      if (model === MODEL && input !== null && output !== null && cached <= input) {
        result.usage = { input, cached, output };
        result.estimatedUsd = ((input - cached) * 0.15 + cached * 0.075 + output * 0.60) / 1e6;
        cost += result.estimatedUsd;
        metered++;
      }
      if (!response.ok) {
        const providerFailure = ({
          'provider-http': 'OpenAI returned an HTTP error',
          incomplete: 'OpenAI response incomplete', refusal: 'OpenAI refused the request',
          schema: 'OpenAI output failed evidence schema validation', source: 'group source does not occur in the input',
        })[response.headers.get('X-Voice-Outcome')];
        result.failure = providerFailure ?? ({
          302: 'Access login required', 401: 'Access denied', 403: 'Access or origin denied',
          429: 'preview quota reached', 502: 'provider or proposal validation failed', 503: 'preview configuration unavailable',
        })[response.status] ?? 'unexpected preview response';
        await response.body?.cancel();
      } else if (model !== MODEL || result.providerStatus !== 200) {
        result.failure = 'response missing the expected OpenAI metadata';
        await response.body?.cancel();
      } else {
        const parsed = evidence.voiceProposalSchema.safeParse(await response.json());
        if (!parsed.success) {
          result.failure = 'response violated the evidence schema';
        } else {
          const blockers = evidence.voiceProposalBlockers(parsed.data);
          if (!blockers.length) {
            const groups = evidence.appendConfirmedVoiceGroups([], parsed.data, parsed.data.groups.map((_, i) => `eval-${i}`));
            // Keep model text and validator messages out of the report.
            if (evidence.validateVoiceCandidate(groups, hand, context, runtime).length) blockers.push('British hand validator rejected the groups.');
          }
          Object.assign(result, compareEvidence(item, parsed.data, blockers));
        }
      }
    } catch {
      result.failure = 'request, decoding, or validation error';
    }
    results.push(result);
    console.log(JSON.stringify(result));
  }
  latencies.sort((a, b) => a - b);
  const percentile = p => latencies[Math.ceil(p * latencies.length) - 1] ?? null;
  console.log(JSON.stringify({
    model: MODEL, attempted: results.length, passed: results.filter(result => result.pass).length,
    measuredCases: results.filter(result => result.exact !== undefined).length,
    exactCases: results.filter(result => result.exact).length,
    casesWithGuesses: results.filter(result => result.guesses?.length).length,
    casesWithOmissions: results.filter(result => result.omissions?.length).length,
    readinessMatches: results.filter(result => result.readinessMatches).length,
    providerAttempts, p50ProviderMs: percentile(0.5), p95ProviderMs: percentile(0.95),
    meteredCases: metered, estimatedUsdForMeteredCases: metered ? cost : null,
  }));
  if (results.some(result => !result.pass)) process.exitCode = 1;
} finally {
  await server.close();
}
