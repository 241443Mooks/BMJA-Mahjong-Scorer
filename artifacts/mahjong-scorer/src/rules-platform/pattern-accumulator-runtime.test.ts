import { describe, expect, it } from 'vitest';
import { compileHandScorer, compilePatternAccumulatorHandScorer, PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES } from './pattern-accumulator-runtime';
import { detectMcr2006Fans } from './mcr-detectors';
import type { McrScoringInput } from './mcr-scoring-input';
import type { PatternAccumulatorConfigV1, ResolvedProfileArtifact } from './types';
import type { PatternAccumulatorImplementationBank } from './pattern-accumulator-runtime';

it('fails closed when a second evidence policy is configured', () => {
  const profile = artifact();
  profile.profile.evidence = { ...profile.profile.evidence, policyIds: ['evidence-policy.a0-proof', 'evidence-policy.second'] };
  expect(() => compileHandScorer(profile)).toThrow('EVIDENCE_POLICIES_UNSUPPORTED');
});
const artifact=():ResolvedProfileArtifact=>({profile:{schemaVersion:1,identity:{id:'proof.pattern-accumulator-a0',version:'0.0.1',status:'provisional',familyId:'family.proof',grammar:'pattern-accumulator'},table:{playerCount:4,seatModelId:'seats.proof'},tileSet:{presetId:'tiles.proof',options:{}},handShape:{presetId:'shape.proof',options:{}},validation:{handShapePolicyId:'validation.proof',policyIds:[]},scoring:{grammar:'pattern-accumulator',config:{configVersion:1,unit:'points',patternCatalogueId:'catalogue.pattern.a0-proof',interactionPolicyId:'interaction.a0-proof-highest-only',qualificationPolicyId:'qualification.a0-proof-eight-before-flowers',interpretationPolicyId:'interpretation.a0-proof-highest-lawful',postQualificationBonusPolicyId:'post-qualification-bonus.a0-proof-flowers',conversionPolicyId:'conversion.a0-proof-identity'}},evidence:{policyIds:['evidence-policy.a0-proof'],alwaysRequired:[]},settlement:{id:'settlement.unfinished',params:{}},progression:{id:'progression.unfinished',params:{}},gameEnd:{id:'game-end.unfinished',params:{}},provenance:{}},rulesFingerprint:'proof',executableDependencies:Object.values(PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES).filter(Boolean)});
describe('pattern accumulator banks',()=>{const total=(r:ReturnType<ReturnType<typeof compileHandScorer>>)=>(r.result as {total:number}).total;it('dispatches exact proof implementations and fails closed',()=>{const bad=artifact();bad.executableDependencies=bad.executableDependencies.map(x=>x.id==='catalogue.pattern.a0-proof'?{...x,semanticRevision:2}:x);expect(()=>compileHandScorer(bad)).toThrow('IMPLEMENTATION_UNAVAILABLE');expect(()=>compileHandScorer(artifact())).not.toThrow()});it('catalogue detects candidates and evidence policy owns unresolved facts',()=>{const s=compileHandScorer(artifact());expect(total(s({structurallyValid:true,detectedFacts:['ordinary-eight'],flowerCount:2,knownEvidenceIds:[]}))).toBe(10);expect(s({structurallyValid:true,detectedFacts:['ordinary-eight'],flowerCount:0,knownEvidenceIds:[],requiresResolvedWinEvent:true}).disposition).toEqual({kind:'needs-evidence',missingEvidenceIds:['evidence.resolved-win-event']});expect(s({structurallyValid:false,detectedFacts:[],flowerCount:0,knownEvidenceIds:[]}).disposition.kind).toBe('invalid')});it('keeps A0 order, suppression, and proof provenance',()=>{const s=compileHandScorer(artifact());expect(s({structurallyValid:true,detectedFacts:['ordinary-three','ordinary-four'],flowerCount:2,knownEvidenceIds:[]}).disposition.kind).toBe('not-qualifying');const r=s({structurallyValid:true,detectedFacts:['ordinary-eight','ordinary-nine','suppression-target'],flowerCount:0,knownEvidenceIds:[]});expect(total(r)).toBe(9);expect(r.decisionTrace.some(x=>x.kind==='suppress')).toBe(true);expect(r.decisionTrace.find(x=>x.kind==='suppress')?.identities.reasonId).toBe('interaction.a0-proof.highest-only');expect((r.result as {details:{provenance:{kind:string}}}).details.provenance.kind).toBe('non-production-a0-proof')});it('is safe without optional bonus/conversion and rejects ignored policies',()=>{const a=artifact();const c=a.profile.scoring.config as PatternAccumulatorConfigV1;a.profile.scoring={grammar:'pattern-accumulator',config:{...c,postQualificationBonusPolicyId:undefined,conversionPolicyId:undefined}};expect(total(compileHandScorer(a)({structurallyValid:true,detectedFacts:['ordinary-eight'],flowerCount:2,knownEvidenceIds:[]}))).toBe(8);const b=artifact();b.profile.scoring={grammar:'pattern-accumulator',config:{...(b.profile.scoring.config as PatternAccumulatorConfigV1),capPolicyId:'value-policy.unimplemented'}};expect(()=>compileHandScorer(b)).toThrow('POLICY_UNSUPPORTED')});it('never accepts canonical MCR identity',()=>{const a=artifact();a.profile.scoring={grammar:'pattern-accumulator',config:{...(a.profile.scoring.config as PatternAccumulatorConfigV1),patternCatalogueId:'catalogue.pattern.mcr-wmo-2006'}};expect(()=>compileHandScorer(a)).toThrow('DEPENDENCY_UNAVAILABLE')})});

it('keeps structurally valid A0 empty facts on the default qualification path', () => {
  const result = compileHandScorer(artifact())({ structurallyValid: true, detectedFacts: [], flowerCount: 0, knownEvidenceIds: [] });
  expect(result.disposition).toEqual({ kind: 'not-qualifying', reasonId: 'qualification.a0-proof.eight-before-flowers' });
  expect((result.result as unknown as { details: { selectedInterpretationId: string; countedPatterns: readonly unknown[] } }).details).toMatchObject({ selectedInterpretationId: 'default', countedPatterns: [] });
  expect(result.decisionTrace.some((entry) => entry.id === 'qualification:decision')).toBe(true);
});

it('preserves branch-specific interaction alternatives through deterministic selection', () => {
  type AlternateInput = { amount: number; lawful: boolean };
  const ids = PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES;
  let qualificationCalls = 0;
  const bank: PatternAccumulatorImplementationBank<AlternateInput> = {
    resultProvenance: { kind: 'production-style-alternate' },
    inputEvidence: new Map([[`${ids.evidencePolicy.id}@1`, { validate: (input: AlternateInput) => input.amount >= 0 ? { valid: true as const } : { valid: false as const, reasonId: 'alternate.invalid' }, requiredEvidence: () => [] }]]),
    catalogue: new Map([[`${ids.catalogue.id}@1`, (input: AlternateInput) => [{ id: 'alternate.low', value: input.amount - 1, interpretationId: 'low' }, { id: 'alternate.high', value: input.amount, interpretationId: 'high', bindingId: 'binding.alternate.high', sourceLocator: 'source:alternate-high' }, { id: 'alternate.low-suppressed', value: 1, interpretationId: 'low' }, { id: 'alternate.high-suppressed', value: 1, interpretationId: 'high', bindingId: 'binding.alternate.high-suppressed', sourceLocator: 'source:alternate-high-suppressed' }]]]),
    interaction: new Map([[`${ids.interaction.id}@1`, (candidates, input) => input.lawful ? { alternatives: [{ id: 'low', counted: candidates.filter((candidate) => candidate.id === 'alternate.low'), suppressed: candidates.filter((candidate) => candidate.id === 'alternate.low-suppressed').map((candidate) => ({ candidate, reasonId: 'alternate.low-reason' })) }, { id: 'high', counted: candidates.filter((candidate) => candidate.id === 'alternate.high'), suppressed: candidates.filter((candidate) => candidate.id === 'alternate.high-suppressed').map((candidate) => ({ candidate, reasonId: 'alternate.high-reason' })) }] } : { alternatives: [] }]]),
    interpretation: new Map([[`${ids.interpretation.id}@1`, (interaction) => [...interaction.alternatives].sort((left, right) => right.counted.reduce((sum, candidate) => sum + candidate.value, 0) - left.counted.reduce((sum, candidate) => sum + candidate.value, 0))[0]?.id]]),
    qualification: new Map([[`${ids.qualification.id}@1`, (subtotal: number) => { qualificationCalls += 1; return subtotal >= 8 ? undefined : 'alternate.too-small'; }]]),
    postQualificationBonus: new Map([[`${ids.postQualificationBonus!.id}@1`, () => 0]]),
    conversion: new Map([[`${ids.conversion!.id}@1`, (value: number) => value]]),
  };
  const score = compilePatternAccumulatorHandScorer(artifact(), bank);
  const result = score({ amount: 8, lawful: true });
  expect((result.result as { total: number }).total).toBe(8);
  const details = (result.result as unknown as { details: { provenance: { kind: string }; suppressedPatterns: readonly { id: string; reasonId: string; bindingId?: string; sourceLocator?: string }[] } }).details;
  expect(details.provenance.kind).toBe('production-style-alternate');
  expect(details.suppressedPatterns.map((item) => item.reasonId)).toEqual(['alternate.high-reason']);
  expect(details.suppressedPatterns[0]).toMatchObject({ bindingId: 'binding.alternate.high-suppressed', sourceLocator: 'source:alternate-high-suppressed' });
  expect(result.decisionTrace.filter((entry) => entry.kind === 'suppress')).toMatchObject([{ identities: { bindingId: 'binding.alternate.high-suppressed', reasonId: 'alternate.high-reason' }, metadata: { sourceLocator: 'source:alternate-high-suppressed' } }]);
  expect((result.result as unknown as { details: { countedPatterns: readonly { id: string; bindingId?: string; sourceLocator?: string }[]; selectedInterpretationId: string } }).details).toMatchObject({ countedPatterns: [{ id: 'alternate.high', bindingId: 'binding.alternate.high', sourceLocator: 'source:alternate-high' }], selectedInterpretationId: 'high' });
  expect(result.decisionTrace.filter((entry) => entry.kind === 'count')).toMatchObject([{ identities: { bindingId: 'binding.alternate.high' }, metadata: { sourceLocator: 'source:alternate-high' } }]);
  const noLawful = score({ amount: 8, lawful: false });
  expect(noLawful.disposition).toEqual({ kind: 'invalid', reasonId: 'pattern-accumulator.no-lawful-alternative' });
  expect((noLawful.result as unknown as { details: Record<string, unknown> }).details).not.toHaveProperty('selectedInterpretationId');
  expect(qualificationCalls).toBe(1);
});

it('keeps a typed MCR detector result compatible without making an MCR policy executable', () => {
  const ids = PATTERN_ACCUMULATOR_A0_PROOF_IDENTITIES;
  let qualificationCalls = 0;
  const input: McrScoringInput = { evidence: { fixedGroups: [], freeTiles: [{ face: { family: 'suit', suit: 'characters', rank: 1 } }, { face: { family: 'suit', suit: 'characters', rank: 2 } }, { face: { family: 'suit', suit: 'characters', rank: 3 } }, { face: { family: 'suit', suit: 'bamboo', rank: 4 } }, { face: { family: 'suit', suit: 'bamboo', rank: 5 } }, { face: { family: 'suit', suit: 'bamboo', rank: 6 } }, { face: { family: 'suit', suit: 'dots', rank: 7 } }, { face: { family: 'suit', suit: 'dots', rank: 8 } }, { face: { family: 'suit', suit: 'dots', rank: 9 } }, { face: { family: 'wind', wind: 'east' } }, { face: { family: 'wind', wind: 'east' } }, { face: { family: 'wind', wind: 'east' } }, { face: { family: 'suit', suit: 'dots', rank: 5 } }, { face: { family: 'suit', suit: 'dots', rank: 5 } }], winningTile: { face: { family: 'suit', suit: 'dots', rank: 5 } }, flowerCount: 0 }, context: { winSource: 'discard', resolvedWinEvent: 'none', lastVisibleCopy: false } };
  const bank: PatternAccumulatorImplementationBank<McrScoringInput> = { resultProvenance: { kind: 'mcr-compatibility-proof' }, inputEvidence: new Map([[`${ids.evidencePolicy.id}@1`, { validate: () => ({ valid: true }), requiredEvidence: () => [] }]]), catalogue: new Map([[`${ids.catalogue.id}@1`, (value) => detectMcr2006Fans(value).candidates]]), interaction: new Map([[`${ids.interaction.id}@1`, (candidates, value) => ({ alternatives: value.evidence.flowerCount === 0 ? [{ id: 'detected-facts', counted: candidates, suppressed: [] }, { id: 'lawful-zero', counted: [], suppressed: [] }] : [] })]]), interpretation: new Map([[`${ids.interpretation.id}@1`, () => 'lawful-zero']]), qualification: new Map([[`${ids.qualification.id}@1`, (subtotal) => { qualificationCalls += 1; return subtotal === 0 ? 'compatibility.zero-not-qualifying' : undefined; }]]), postQualificationBonus: new Map([[`${ids.postQualificationBonus!.id}@1`, () => 0]]), conversion: new Map([[`${ids.conversion!.id}@1`, (value) => value]]) };
  const detected = detectMcr2006Fans(input).candidates;
  const result = compilePatternAccumulatorHandScorer(artifact(), bank)(input);
  expect((result.result as unknown as { details: { candidatePatterns: readonly { id: string; value: number }[] } }).details.candidatePatterns).toEqual(detected.map(({ interpretationId: _, ...candidate }) => candidate));
  expect(result.disposition).toEqual({ kind: 'not-qualifying', reasonId: 'compatibility.zero-not-qualifying' });
  expect((result.result as unknown as { details: { selectedInterpretationId: string; countedPatterns: readonly unknown[] } }).details).toMatchObject({ selectedInterpretationId: 'lawful-zero', countedPatterns: [] });
  expect(qualificationCalls).toBe(1);
});
