import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import worker from './worker.mjs';
import { LIMITS, VoiceQuota } from './quota.mjs';

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
