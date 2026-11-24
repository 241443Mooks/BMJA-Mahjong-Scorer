const MINUTE = 60_000;
const DAY = 86_400_000;
export const LIMITS = { perMinute: 5, globalPerMinute: 10, perDay: 80, globalPerDay: 90, lifetime: 100 };

export class VoiceQuota {
  constructor(ctx) {
    this.storage = ctx.storage;
  }

  async fetch(request) {
    if (request.method !== 'POST') return new Response(null, { status: 405 });
    const principal = await request.text();
    if (!/^[a-f0-9]{64}$/.test(principal)) return new Response(null, { status: 400 });
    const outcome = await this.storage.transaction(async txn => {
      const now = Date.now();
      const day = Math.floor(now / DAY);
      const state = await txn.get('quota') ?? { lifetime: 0, recent: [], daily: {} };
      if (state.lifetime >= LIMITS.lifetime) return { status: 429 };
      const daily = state.day === day ? state.daily : {};
      const recent = state.recent.filter(attempt => now - attempt.time < MINUTE);
      const recentForUser = recent.filter(attempt => attempt.principal === principal);
      const today = state.day === day ? state.today : 0;
      const count = daily[principal] ?? 0;
      if (today >= LIMITS.globalPerDay || count >= LIMITS.perDay) {
        return { status: 429, retry: Math.ceil(((day + 1) * DAY - now) / 1000) };
      }
      if (recent.length >= LIMITS.globalPerMinute || recentForUser.length >= LIMITS.perMinute) {
        return { status: 429, retry: 60 };
      }
      await txn.put('quota', {
        lifetime: state.lifetime + 1, day, today: today + 1,
        recent: [...recent, { principal, time: now }],
        daily: { ...daily, [principal]: count + 1 },
      });
      return { status: 204 };
    });
    return new Response(null, {
      status: outcome.status, headers: outcome.retry ? { 'Retry-After': String(outcome.retry) } : {},
    });
  }
}
