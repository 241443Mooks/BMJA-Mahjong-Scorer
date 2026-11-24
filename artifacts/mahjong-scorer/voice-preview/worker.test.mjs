import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import worker from './worker.mjs';
import { LIMITS, VoiceQuota } from './quota.mjs';
import { MODEL } from '../voice-dev/openai.mjs';

const env = {
  PREVIEW_HOST: 'voice-preview.example.com',
  ACCESS_ISSUER: 'https://example-team.cloudflareaccess.com',
  ACCESS_AUD: 'a'.repeat(64),
  ASSETS: { fetch: vi.fn(() => new Response('preview')) },
  VOICE_QUOTA: { getByName: vi.fn() },
};
const origin = `https://${env.PREVIEW_HOST}`;
let keys;
let jwk;

beforeAll(async () => {
  keys = await generateKeyPair('RS256');
  jwk = { ...await exportJWK(keys.publicKey), kid: 'test' };
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); vi.useRealTimers(); });

async function signed({ audience = env.ACCESS_AUD, issuer = env.ACCESS_ISSUER, expiry = '15m', type = 'app' } = {}) {
  return new SignJWT({ type, email: 'tester@example.com' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' })
    .setAudience(audience).setIssuer(issuer).setSubject('test-subject').setIssuedAt().setExpirationTime(expiry)
    .sign(keys.privateKey);
}

describe('private preview boundary', () => {
  it('denies unauthenticated page, assets and API, and rejects alternate origins before asset lookup', async () => {
    for (const path of ['/voice-test', '/assets/main.js', '/__voice/interpret']) {
      const response = await worker.fetch(new Request(origin + path), env);
      expect(response.status).toBe(403);
      expect(response.headers.get('Cache-Control')).toContain('no-store');
    }
    const alternate = await worker.fetch(new Request('https://unintended.workers.dev/voice-test'), env);
    expect(alternate.status).toBe(404);
    expect(env.ASSETS.fetch).not.toHaveBeenCalled();
    expect(env.VOICE_QUOTA.getByName).not.toHaveBeenCalled();
  });

  it('requires a valid application signature, team, audience and lifetime for page and API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ keys: [jwk] })));
    const valid = await signed();
    const invalid = [
      await signed({ audience: 'b'.repeat(64) }),
      await signed({ issuer: 'https://different.cloudflareaccess.com' }),
      await signed({ expiry: '-5m' }),
      await signed({ type: 'org' }),
      valid.slice(0, valid.lastIndexOf('.') + 1) + 'A'.repeat(342),
    ];
    for (const token of invalid) {
      const headers = { 'Cf-Access-Jwt-Assertion': token };
      expect((await worker.fetch(new Request(origin + '/voice-test', { headers }), env)).status).toBe(403);
      expect((await worker.fetch(new Request(origin + '/__voice/interpret', { headers, method: 'POST' }), env)).status).toBe(403);
    }
    expect(env.ASSETS.fetch).not.toHaveBeenCalled();
    const response = await worker.fetch(new Request(origin + '/voice-test', { headers: { 'Cf-Access-Jwt-Assertion': valid } }), env);
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(new URL(env.ASSETS.fetch.mock.calls[0][0].url).pathname).toBe('/index.html');
  });

  it('rejects bad method, origin, media, and size before quota and fails closed when the secret is absent', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ keys: [jwk] })));
    const headers = { 'Cf-Access-Jwt-Assertion': await signed(), Origin: origin, 'Content-Type': 'application/json' };
    const endpoint = origin + '/__voice/interpret';
    const post = (body, overrides) => worker.fetch(new Request(endpoint, { method: 'POST', body, headers: { ...headers, ...overrides } }), env);
    expect((await worker.fetch(new Request(endpoint, { headers }), env)).status).toBe(405);
    expect((await post('{}', { Origin: 'https://other.example.com' })).status).toBe(403);
    expect((await post('{}', { 'Content-Type': 'text/plain' })).status).toBe(415);
    expect((await post(JSON.stringify({ transcript: 'A'.repeat(5000) }))).status).toBe(413);
    expect((await post(JSON.stringify({ transcript: 'A'.repeat(2001) }))).status).toBe(400);
    expect((await post('{}')).status).toBe(400);
    expect((await post('{"transcript":"pung of circles"}')).status).toBe(503);
    expect(env.VOICE_QUOTA.getByName).not.toHaveBeenCalled();
  });
});

describe('private interpretation diagnostics', () => {
  const transcript = 'Pung 3 circles concealed';
  const providerUrl = 'https://api.openai.com/v1/responses';
  const secret = 'synthetic-test-secret';
  const privateFailure = 'synthetic private exception text';
  const reserved = () => new Response(null, { status: 204 });
  const fail = () => { throw new Error(privateFailure); };

  async function interpret(reserve, provider) {
    const reserveQuota = vi.fn(reserve);
    vi.stubGlobal('fetch', vi.fn(async (url, options) => {
      if (String(url) === providerUrl) return provider(url, options);
      expect(String(url)).toBe(`${env.ACCESS_ISSUER}/cdn-cgi/access/certs`);
      return Response.json({ keys: [jwk] });
    }));

    const assertion = await signed();
    const response = await worker.fetch(new Request(origin + '/__voice/interpret', {
      method: 'POST',
      headers: { 'Cf-Access-Jwt-Assertion': assertion, Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    }), {
      ...env,
      OPENAI_API_KEY: secret,
      VOICE_QUOTA: {
        getByName(name) {
          expect(name).toBe('typed-preview');
          return { fetch: reserveQuota };
        },
      },
    });
    expect(reserveQuota).toHaveBeenCalledTimes(1);
    return { response, assertion };
  }

  it.each([
    ['quota exception', fail, undefined, 'quota-preparation', null],
    ['unexpected quota status', () => new Response(null, { status: 500 }), undefined, 'quota-preparation', null],
    ['OpenAI transport exception', reserved, fail, 'openai-transport', null],
    ['unreadable provider envelope', reserved, () => new Response(privateFailure), 'openai-response', '200'],
    ['unreadable structured output', reserved, () => Response.json({
      status: 'completed', output: [{ content: [{ type: 'output_text', text: privateFailure }] }],
    }), 'openai-response', '200'],
    ['provider HTTP failure', reserved, () => new Response(privateFailure, { status: 401 }), 'provider-http', '401'],
    ['failure to discard a provider error body', reserved, () => new Response(new ReadableStream({ cancel: fail }), { status: 503 }),
      'openai-response', '503'],
    ['invalid evidence shape', reserved, () => Response.json({
      status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ unexpected: privateFailure }) }] }],
    }), 'schema', '200'],
    ['fabricated unresolved fragment', reserved, () => Response.json({
      status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ groups: [], unparsed: [privateFailure] }) }] }],
    }), 'source', '200'],
  ])('reports only fixed metadata for %s', async (_label, reserve, fetchProvider, outcome, providerStatus) => {
    const provider = vi.fn(fetchProvider);
    const { response, assertion } = await interpret(reserve, provider);
    expect(provider).toHaveBeenCalledTimes(fetchProvider ? 1 : 0);
    expect(response.status).toBe(502);
    expect(response.headers.get('X-Voice-Outcome')).toBe(outcome);
    expect(response.headers.get('X-Voice-Provider-Status')).toBe(providerStatus);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    const diagnostics = JSON.stringify([...response.headers]) + await response.text();
    for (const privateValue of [privateFailure, transcript, secret, assertion]) {
      expect(diagnostics.includes(privateValue)).toBe(false);
    }
  });

  it('preserves the validated proposal, usage and OpenAI request settings on success', async () => {
    const proposal = {
      groups: [{ source: transcript, kind: 'pung', visibility: 'concealed', tile: { family: 'suit', suit: 'circles', rank: 3 }, ambiguity: null }],
      unparsed: [],
    };
    const provider = vi.fn(async (_url, options) => {
      expect(JSON.parse(options.body)).toMatchObject({
        model: MODEL, store: false, text: { format: { type: 'json_schema', strict: true } },
      });
      return Response.json({
        status: 'completed',
        model: MODEL,
        output: [{ content: [{ type: 'output_text', text: JSON.stringify(proposal) }] }],
        usage: { input_tokens: 40, output_tokens: 20, input_tokens_details: { cached_tokens: 0 } },
      });
    });
    const { response } = await interpret(reserved, provider);
    expect(provider).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Voice-Outcome')).toBeNull();
    expect(response.headers.get('X-Voice-Provider-Status')).toBe('200');
    expect(response.headers.get('X-Voice-Model')).toBe(MODEL);
    expect(response.headers.get('X-Voice-Input-Tokens')).toBe('40');
    expect(response.headers.get('X-Voice-Cached-Tokens')).toBe('0');
    expect(response.headers.get('X-Voice-Output-Tokens')).toBe('20');
    expect(await response.json()).toEqual(proposal);
  });
});

it('charges attempts durably across instances and enforces user, global, and lifetime ceilings', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T01:00:00Z'));
  const saved = new Map();
  const storage = { transaction: run => run({ get: key => saved.get(key), put: (key, value) => saved.set(key, value) }) };
  const reserve = symbol => new VoiceQuota({ storage }).fetch(new Request('https://quota.internal/reserve', { method: 'POST', body: symbol.repeat(64) }));
  for (let i = 0; i < LIMITS.perMinute; i++) expect((await reserve('a')).status).toBe(204);
  expect((await reserve('a')).status).toBe(429);
  for (let i = 0; i < LIMITS.perMinute; i++) expect((await reserve('b')).status).toBe(204);
  expect((await reserve('c')).status).toBe(429);

  for (let i = LIMITS.perMinute; i < LIMITS.perDay; i++) {
    vi.advanceTimersByTime(60_000);
    expect((await reserve('a')).status).toBe(204);
  }
  expect((await reserve('a')).status).toBe(429);
  for (let i = LIMITS.perDay + LIMITS.perMinute; i < LIMITS.globalPerDay; i++) {
    vi.advanceTimersByTime(60_000);
    expect((await reserve('c')).status).toBe(204);
  }
  expect((await reserve('d')).status).toBe(429);
  vi.advanceTimersByTime(86_400_000);
  for (let i = LIMITS.globalPerDay; i < LIMITS.lifetime; i++) {
    vi.advanceTimersByTime(60_000);
    expect((await reserve('d')).status).toBe(204);
  }
  vi.advanceTimersByTime(86_400_000);
  expect((await reserve('e')).status).toBe(429);
});
