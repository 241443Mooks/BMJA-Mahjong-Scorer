import { createRemoteJWKSet, jwtVerify } from 'jose';
import { voiceProposalSchema } from '../src/game/voice-evidence';
import { readOpenAIInterpretation, requestOpenAIInterpretation, MAX_BODY_BYTES, MAX_DESCRIPTION_LENGTH, MODEL } from '../voice-dev/openai.mjs';
export { VoiceQuota } from './quota.mjs';

const apiPath = '/__voice/interpret';
const voicePage = '/voice-test';
const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const json = (status, body, headers) => Response.json(body, { status, headers: { ...privateHeaders, ...headers } });
let certificates;

async function authenticate(request, env) {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token || token.length > 8192) return null;
  try {
    if (certificates?.issuer !== env.ACCESS_ISSUER) {
      certificates = {
        issuer: env.ACCESS_ISSUER,
        keys: createRemoteJWKSet(new URL('/cdn-cgi/access/certs', env.ACCESS_ISSUER), { timeoutDuration: 3000 }),
      };
    }
    const { payload } = await jwtVerify(token, certificates.keys, {
      issuer: env.ACCESS_ISSUER,
      audience: env.ACCESS_AUD,
      algorithms: ['RS256'],
      requiredClaims: ['iat', 'exp', 'sub'],
    });
    return payload.type === 'app' && typeof payload.email === 'string' && payload.email.includes('@')
      && typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

async function readTranscript(request) {
  if (!request.body) return { status: 400 };
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return { status: 413 };
  const reader = request.body.getReader();
  const buffer = new Uint8Array(MAX_BODY_BYTES);
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.byteLength > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        return { status: 413 };
      }
      buffer.set(value, size);
      size += value.byteLength;
    }
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, size)));
    if (!data || Object.keys(data).join() !== 'transcript' || typeof data.transcript !== 'string'
      || !data.transcript.trim() || data.transcript.length > MAX_DESCRIPTION_LENGTH) return { status: 400 };
    return { transcript: data.transcript };
  } catch {
    return { status: 400 };
  } finally {
    reader.releaseLock();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' || url.host !== env.PREVIEW_HOST || url.host.endsWith('.invalid')) return json(404, { error: 'Not found.' });
    if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_ISSUER)
      || !/^[a-f0-9]{64}$/i.test(env.ACCESS_AUD)) return json(503, { error: 'Preview authentication unavailable.' });
    const subject = await authenticate(request, env);
    if (!subject) return json(403, { error: 'Preview access required.' });

    if (url.pathname !== apiPath) {
      if (!['GET', 'HEAD'].includes(request.method)) return json(405, { error: 'Method not allowed.' }, { Allow: 'GET, HEAD' });
      if (url.pathname === '/') return new Response(null, { status: 302, headers: { ...privateHeaders, Location: voicePage } });
      const assetUrl = new URL(url);
      if (url.pathname === voicePage || url.pathname === voicePage + '/') assetUrl.pathname = '/index.html';
      const asset = await env.ASSETS.fetch(new Request(assetUrl, request));
      const response = new Response(asset.body, asset);
      for (const [name, value] of Object.entries(privateHeaders)) response.headers.set(name, value);
      return response;
    }

    if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' }, { Allow: 'POST' });
    if (request.headers.get('Origin') !== url.origin) return json(403, { error: 'Origin not allowed.' });
    if (request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json'
      || request.headers.has('Content-Encoding')) return json(415, { error: 'Send uncompressed JSON.' });
    const input = await readTranscript(request);
    if (input.status) return json(input.status, { error: 'Send one description of at most 2,000 characters and 4 KiB of JSON.' });
    if (!env.OPENAI_API_KEY) return json(503, { error: 'OpenAI configuration is unavailable.' });

    let stage = 'quota-preparation';
    const metrics = {};
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(subject));
      const principal = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      const quota = await env.VOICE_QUOTA.getByName('typed-preview').fetch('https://quota.internal/reserve', { method: 'POST', body: principal });
      if (quota.status === 429) {
        const retry = quota.headers.get('Retry-After');
        return json(429, { error: 'Preview usage limit reached.' }, retry ? { 'Retry-After': retry } : {});
      }
      if (quota.status !== 204) throw new Error();

      stage = 'openai-transport';
      const start = performance.now();
      const response = await requestOpenAIInterpretation(input.transcript, env.OPENAI_API_KEY);
      stage = 'openai-response';
      metrics['X-Voice-Provider-Status'] = String(response.status);
      const result = await readOpenAIInterpretation(response);
      metrics['X-Voice-Provider-Ms'] = String(Math.round(performance.now() - start));
      const proposal = voiceProposalSchema.safeParse(result.proposal);
      if (result.model === MODEL) metrics['X-Voice-Model'] = MODEL;
      for (const [name, value] of Object.entries({
        'X-Voice-Input-Tokens': result.usage?.input_tokens,
        'X-Voice-Cached-Tokens': result.usage?.input_tokens_details?.cached_tokens,
        'X-Voice-Output-Tokens': result.usage?.output_tokens,
      })) {
        if (Number.isSafeInteger(value) && value >= 0) metrics[name] = String(value);
      }
      const failure = response.status !== 200 ? 'provider-http'
        : result.outcome !== 'completed' ? result.outcome
        : !proposal.success ? 'schema'
        : proposal.data.groups.some(group => !input.transcript.includes(group.source)) ? 'source' : null;
      if (failure) {
        return json(502, { error: 'OpenAI returned no verifiable interpretation. Try again or use manual entry.' }, {
          ...metrics, 'X-Voice-Outcome': failure,
        });
      }
      return json(200, proposal.data, metrics);
    } catch {
      return json(502, { error: 'Interpretation is unavailable. Try again or use manual entry.' }, {
        ...metrics, 'X-Voice-Outcome': stage,
      });
    }
  },
};
