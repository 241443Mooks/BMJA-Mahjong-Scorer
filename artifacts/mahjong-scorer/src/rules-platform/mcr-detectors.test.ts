import { describe, expect, it } from 'vitest';
import { detectMcr2006Fans, MCR_2006_FAN_BINDINGS, MCR_2006_EVIDENCE_POLICY_ID, MCR_2006_INPUT_EVIDENCE } from './mcr-detectors';
import type { McrScoringInput } from './mcr-scoring-input';

const t=(s:'characters'|'bamboo'|'dots',rank:number)=>({face:{family:'suit' as const,suit:s,rank}});
const w=(wind:'east'|'south'|'west'|'north')=>({face:{family:'wind' as const,wind}});
const base=():McrScoringInput=>({evidence:{fixedGroups:[],freeTiles:[t('characters',1),t('characters',2),t('characters',3),t('dots',4),t('dots',5),t('dots',6),t('bamboo',7),t('bamboo',8),t('bamboo',9),t('characters',7),t('characters',7),t('characters',7),t('dots',5),t('dots',5)],winningTile:t('dots',5),flowerCount:0},context:{winSource:'self-draw',resolvedWinEvent:'none',lastVisibleCopy:false}});
const ids=(input:McrScoringInput)=>detectMcr2006Fans(input).candidates.map(x=>x.bindingId);

describe('MCR 2006 detector catalogue',()=>{
 it('pins all 81 source bindings with source locator and the two later-stage boundaries',()=>{
  expect(MCR_2006_FAN_BINDINGS).toHaveLength(81);
  expect(MCR_2006_FAN_BINDINGS.map(x=>x.id)).toEqual(Array.from({length:81},(_,i)=>`mcr2006.fan.${MCR_2006_FAN_BINDINGS[i]!.id.slice('mcr2006.fan.'.length)}`));
  expect(MCR_2006_FAN_BINDINGS.every(x=>x.sourceLocator.length>0)).toBe(true);
  expect(MCR_2006_FAN_BINDINGS.find(x=>x.id==='mcr2006.fan.chicken-hand')?.stage).toBe('fallback');
  expect(MCR_2006_FAN_BINDINGS.find(x=>x.id==='mcr2006.fan.flower-tiles')?.stage).toBe('post-qualification');
 });
 it('enumerates free tiles rather than treating a UI grouping as authoritative',()=>{
  const r=detectMcr2006Fans(base()); expect(r.interpretations.filter(x=>x.kind==='ordinary').length).toBeGreaterThan(0); expect(ids(base())).toContain('mcr2006.fan.self-drawn');
 });
 it('keeps legal repeated occurrences distinct from their stable binding',()=>{
  const input=base(); input.evidence.freeTiles=[t('characters',5),t('characters',5),t('characters',5),t('dots',5),t('dots',5),t('dots',5),t('bamboo',5),t('bamboo',5),t('bamboo',5),t('characters',1),t('characters',2),t('characters',3),t('dots',2),t('dots',2)]; input.evidence.winningTile=t('dots',2);
  const matches=detectMcr2006Fans(input).candidates.filter(x=>x.bindingId==='mcr2006.fan.double-pung'); expect(matches.length).toBe(3); expect(new Set(matches.map(x=>x.id)).size).toBe(3);
 });
 it('uses the exact reversible set and rejects an excluded face',()=>{
  const input=base(); input.evidence.freeTiles=[t('dots',1),t('dots',2),t('dots',3),t('dots',3),t('dots',4),t('dots',5),t('bamboo',4),t('bamboo',5),t('bamboo',6),t('bamboo',8),t('bamboo',8),t('bamboo',8),{face:{family:'dragon',dragon:'white'}},{face:{family:'dragon',dragon:'white'}}]; input.evidence.winningTile={face:{family:'dragon',dragon:'white'}};
  expect(ids(input)).toContain('mcr2006.fan.reversible-tiles'); input.evidence.freeTiles=[t('bamboo',1),...input.evidence.freeTiles.slice(1)]; expect(ids(input)).not.toContain('mcr2006.fan.reversible-tiles');
 });
 it('keeps flower points and Chicken Hand outside ordinary candidates',()=>{
  const input=base(); input.evidence.flowerCount=8; const r=detectMcr2006Fans(input); expect(r.candidates.some(x=>x.bindingId==='mcr2006.fan.flower-tiles'||x.bindingId==='mcr2006.fan.chicken-hand')).toBe(false); expect(r.flowerCount).toBe(8);
 });
 it('distinguishes flower and Kong replacement while preserving Self-Drawn',()=>{
  const flower=base(); flower.context.resolvedWinEvent='flower-replacement'; expect(ids(flower)).toContain('mcr2006.fan.self-drawn'); expect(ids(flower)).not.toContain('mcr2006.fan.out-with-replacement-tile'); const kong=base(); kong.context.resolvedWinEvent='kong-replacement'; expect(ids(kong)).toContain('mcr2006.fan.out-with-replacement-tile'); expect(ids(kong)).toContain('mcr2006.fan.self-drawn');
 });
 it('reconstructs waits globally before assigning an exclusive wait class',()=>{
  const edge:McrScoringInput={evidence:{fixedGroups:[{kind:'chow',exposure:'melded',tiles:[t('dots',1),t('dots',2),t('dots',3)]},{kind:'pung',exposure:'melded',tiles:[t('bamboo',5),t('bamboo',5),t('bamboo',5)]},{kind:'pung',exposure:'melded',tiles:[w('east'),w('east'),w('east')]}],freeTiles:[t('characters',1),t('characters',2),t('dots',7),t('dots',7),t('characters',3)],winningTile:t('characters',3),flowerCount:0},context:{winSource:'discard',resolvedWinEvent:'none',lastVisibleCopy:false}};
  expect(ids(edge)).toContain('mcr2006.fan.edge-wait');
  const closed={...edge,evidence:{...edge.evidence,freeTiles:[t('characters',2),t('characters',4),t('dots',7),t('dots',7),t('characters',3)]}}; expect(ids(closed)).toContain('mcr2006.fan.closed-wait');
  const single:McrScoringInput={evidence:{fixedGroups:[{kind:'chow',exposure:'melded',tiles:[t('characters',1),t('characters',2),t('characters',3)]},{kind:'chow',exposure:'melded',tiles:[t('dots',4),t('dots',5),t('dots',6)]},{kind:'chow',exposure:'melded',tiles:[t('bamboo',7),t('bamboo',8),t('bamboo',9)]},{kind:'pung',exposure:'melded',tiles:[w('east'),w('east'),w('east')]}],freeTiles:[t('dots',7),t('dots',7)],winningTile:t('dots',7),flowerCount:0},context:{winSource:'discard',resolvedWinEvent:'none',lastVisibleCopy:false}}; expect(ids(single)).toContain('mcr2006.fan.single-wait');
 });
 it('fails closed for malformed evidence and surfaces only material trusted wind evidence',()=>{
  const malformed=base(); malformed.evidence.winningTile=t('dots',1); expect(detectMcr2006Fans(malformed).interpretations).toEqual([]); expect(detectMcr2006Fans(base()).missingEvidenceIds).not.toContain('evidence.seat-wind'); const withWind=base(); withWind.evidence.freeTiles=[t('characters',1),t('characters',2),t('characters',3),t('dots',4),t('dots',5),t('dots',6),t('bamboo',7),t('bamboo',8),t('bamboo',9),w('east'),w('east'),w('east'),t('dots',5),t('dots',5)]; withWind.evidence.winningTile=t('dots',5); expect(detectMcr2006Fans(withWind).missingEvidenceIds).toContain('evidence.seat-wind');
 });
 it('treats Last Tile evidence as true, known false, or unknown',()=>{
  const yes=base(); yes.context.lastVisibleCopy=true; expect(ids(yes)).toContain('mcr2006.fan.last-tile'); const no=base(); no.context.lastVisibleCopy=false; expect(ids(no)).not.toContain('mcr2006.fan.last-tile'); expect(detectMcr2006Fans(no).missingEvidenceIds).not.toContain('evidence.last-visible-copy'); const unknown=base(); delete unknown.context.lastVisibleCopy; expect(detectMcr2006Fans(unknown).missingEvidenceIds).toContain('evidence.last-visible-copy');
 });
 it('requires exact suit ownership for terminal Chow fan predicates',()=>{
  const pure=base(); pure.evidence.freeTiles=[t('characters',1),t('characters',2),t('characters',3),t('characters',1),t('characters',2),t('characters',3),t('characters',7),t('characters',8),t('characters',9),t('characters',7),t('characters',8),t('characters',9),t('characters',5),t('characters',5)]; pure.evidence.winningTile=t('characters',5); expect(ids(pure)).toContain('mcr2006.fan.pure-terminal-chows'); const wrongPair={...pure,evidence:{...pure.evidence,freeTiles:[...pure.evidence.freeTiles.slice(0,12),t('dots',5),t('dots',5)],winningTile:t('dots',5)}}; expect(ids(wrongPair)).not.toContain('mcr2006.fan.pure-terminal-chows');
  const three=base(); three.evidence.freeTiles=[t('characters',1),t('characters',2),t('characters',3),t('characters',7),t('characters',8),t('characters',9),t('dots',1),t('dots',2),t('dots',3),t('dots',7),t('dots',8),t('dots',9),t('bamboo',5),t('bamboo',5)]; three.evidence.winningTile=t('bamboo',5); expect(ids(three)).toContain('mcr2006.fan.three-suited-terminal-chows'); const wrongSuit={...three,evidence:{...three.evidence,freeTiles:[...three.evidence.freeTiles.slice(0,12),t('dots',5),t('dots',5)],winningTile:t('dots',5)}}; expect(ids(wrongSuit)).not.toContain('mcr2006.fan.three-suited-terminal-chows');
 });
 it('does not emit direct fan paths without a lawful completion',()=>{
  const bad=base(); bad.evidence.freeTiles=[t('characters',5),t('characters',5),t('characters',5),t('characters',5),t('dots',1),t('dots',4),t('dots',7),t('bamboo',2),t('bamboo',5),t('bamboo',8),t('dots',2),t('dots',5),t('dots',8),t('characters',9)]; bad.evidence.winningTile=t('characters',9); const r=detectMcr2006Fans(bad); expect(r.interpretations).toEqual([]); expect(r.candidates.map(x=>x.bindingId)).not.toEqual(expect.arrayContaining(['mcr2006.fan.tile-hog','mcr2006.fan.knitted-straight','mcr2006.fan.nine-gates']));
 });
 it('canonicalises fixed Chow faces and fixed-group occurrence identities',()=>{
  const input:McrScoringInput={evidence:{fixedGroups:[{kind:'chow',exposure:'melded',tiles:[t('characters',1),t('characters',2),t('characters',3)]},{kind:'chow',exposure:'melded',tiles:[t('dots',1),t('dots',2),t('dots',3)]},{kind:'pung',exposure:'melded',tiles:[w('east'),w('east'),w('east')]}],freeTiles:[t('bamboo',4),t('bamboo',5),t('bamboo',6),t('bamboo',7),t('bamboo',7)],winningTile:t('bamboo',7),flowerCount:0},context:{winSource:'discard',resolvedWinEvent:'none',lastVisibleCopy:false}}; const permuted={...input,evidence:{...input.evidence,fixedGroups:[{...input.evidence.fixedGroups[1]!,tiles:[t('dots',3),t('dots',1),t('dots',2)]},input.evidence.fixedGroups[2]!,{...input.evidence.fixedGroups[0]!,tiles:[t('characters',2),t('characters',3),t('characters',1)]}]}}; const a=detectMcr2006Fans(input),b=detectMcr2006Fans(permuted); expect(a.interpretations.map(x=>x.id)).toEqual(b.interpretations.map(x=>x.id)); expect(a.candidates.map(x=>x.id)).toEqual(b.candidates.map(x=>x.id));
 });
 it('exposes the production MCR evidence-policy seam',()=>{
  expect(MCR_2006_EVIDENCE_POLICY_ID).toBe('evidence-policy.mcr-wmo-2006'); expect(MCR_2006_INPUT_EVIDENCE.validate(base())).toEqual({valid:true}); const unknown=base(); delete unknown.context.lastVisibleCopy; expect(MCR_2006_INPUT_EVIDENCE.requiredEvidence(unknown)).toContain('evidence.last-visible-copy');
 });
});
