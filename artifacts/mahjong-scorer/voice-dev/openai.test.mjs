import { expect, it } from 'vitest';
import { estimateOpenAICostUsd, MODEL } from './openai.mjs';

it('uses the pinned GPT-5.4 mini standard rates for uncached, cached and output tokens', () => {
  expect(MODEL).toBe('gpt-5.4-mini-2026-03-17');
  expect(estimateOpenAICostUsd(MODEL, { input: 1_500, cached: 1_000, output: 200 })).toBeCloseTo(0.00135, 10);
  expect(estimateOpenAICostUsd(MODEL, { input: 1_500, cached: 0, output: 200 })).toBeCloseTo(0.002025, 10);
  expect(estimateOpenAICostUsd(MODEL, { input: 0, cached: 0, output: 0 })).toBe(0);
});

it('leaves usage unpriced for a different snapshot or missing and invalid counts', () => {
  expect(estimateOpenAICostUsd('gpt-4o-mini-2024-07-18', { input: 1, cached: 0, output: 1 })).toBeNull();
  expect(estimateOpenAICostUsd(MODEL, { input: null, cached: 0, output: 1 })).toBeNull();
  expect(estimateOpenAICostUsd(MODEL, { input: 1, cached: 0, output: null })).toBeNull();
  expect(estimateOpenAICostUsd(MODEL, { input: 1, cached: 2, output: 1 })).toBeNull();
});
