import type { PhysicalTileEvidence } from './types';
import type { McrHandEvidence, McrScoreContext } from './mcr-scoring-input';
import { removeMcrWinningTileFromFreeTiles, validateMcrScoringInput } from './mcr-scoring-input';
import type { PatternAccumulatorCandidate, PatternAccumulatorStageContracts } from './pattern-accumulator-runtime';

type Suit = 'characters' | 'bamboo' | 'dots';
type Face = string;
type Element = { id: string; kind: 'chow' | 'pung' | 'kong' | 'pair'; faces: readonly Face[]; fixed?: 'melded' | 'concealed' };
export type McrInterpretation = { id: string; kind: 'ordinary' | 'seven-pairs' | 'thirteen-orphans' | 'greater-knitted' | 'lesser-knitted'; elements: readonly Element[] };
export type McrFanBinding = { id: string; name: string; value: number; sourceLocator: string; stage: 'candidate' | 'fallback' | 'post-qualification' };
export type McrDetection = { bindings: readonly McrFanBinding[]; interpretations: readonly McrInterpretation[]; candidates: readonly PatternAccumulatorCandidate[]; missingEvidenceIds: readonly string[]; flowerCount: number };

const bindingRows: readonly [string, string, number][] = [
 ['big-four-winds','Big Four Winds',88],['big-three-dragons','Big Three Dragons',88],['all-green','All Green',88],['nine-gates','Nine Gates',88],['four-kongs','Four Kongs',88],['seven-shifted-pairs','Seven Shifted Pairs',88],['thirteen-orphans','Thirteen Orphans',88],['all-terminals','All Terminals',64],['little-four-winds','Little Four Winds',64],['little-three-dragons','Little Three Dragons',64],['all-honors','All Honors',64],['four-concealed-pungs','Four Concealed Pungs',64],['pure-terminal-chows','Pure Terminal Chows',64],['quadruple-chow','Quadruple Chow',48],['four-pure-shifted-pungs','Four Pure Shifted Pungs',48],['four-pure-shifted-chows','Four Pure Shifted Chows',32],['three-kongs','Three Kongs',32],['all-terminals-and-honors','All Terminals and Honors',32],['seven-pairs','Seven Pairs',24],['greater-honors-knitted','Greater Honors and Knitted Tiles',24],['all-even-pungs','All Even Pungs',24],['full-flush','Full Flush',24],['pure-triple-chow','Pure Triple Chow',24],['pure-shifted-pungs','Pure Shifted Pungs',24],['upper-tiles','Upper Tiles',24],['middle-tiles','Middle Tiles',24],['lower-tiles','Lower Tiles',24],['pure-straight','Pure Straight',16],['three-suited-terminal-chows','Three-Suited Terminal Chows',16],['pure-shifted-chows','Pure Shifted Chows',16],['all-fives','All Fives',16],['triple-pung','Triple Pung',16],['three-concealed-pungs','Three Concealed Pungs',16],['lesser-honors-knitted','Lesser Honors and Knitted Tiles',12],['knitted-straight','Knitted Straight',12],['upper-four','Upper Four',12],['lower-four','Lower Four',12],['big-three-winds','Big Three Winds',12],['mixed-straight','Mixed Straight',8],['reversible-tiles','Reversible Tiles',8],['mixed-triple-chow','Mixed Triple Chow',8],['mixed-shifted-pungs','Mixed Shifted Pungs',8],['chicken-hand','Chicken Hand',8],['last-tile-draw','Last Tile Draw',8],['last-tile-claim','Last Tile Claim',8],['out-with-replacement-tile','Out with Replacement Tile',8],['robbing-the-kong','Robbing The Kong',8],['two-concealed-kongs','Two Concealed Kongs',8],['all-pungs','All Pungs',6],['half-flush','Half Flush',6],['mixed-shifted-chows','Mixed Shifted Chows',6],['all-types','All Types',6],['melded-hand','Melded Hand',6],['two-dragon-pungs','Two Dragon Pungs',6],['outside-hand','Outside Hand',4],['fully-concealed-hand','Fully Concealed Hand',4],['two-melded-kongs','Two Melded Kongs',4],['last-tile','Last Tile',4],['dragon-pung','Dragon Pung',2],['prevalent-wind','Prevalent Wind',2],['seat-wind','Seat Wind',2],['concealed-hand','Concealed Hand',2],['all-chows','All Chows',2],['tile-hog','Tile Hog',2],['double-pung','Double Pung',2],['two-concealed-pungs','Two Concealed Pungs',2],['concealed-kong','Concealed Kong',2],['all-simples','All Simples',2],['pure-double-chow','Pure Double Chow',1],['mixed-double-chow','Mixed Double Chow',1],['short-straight','Short Straight',1],['two-terminal-chows','Two Terminal Chows',1],['pung-terminals-or-honors','Pung of Terminals or Honors',1],['melded-kong','Melded Kong',1],['one-voided-suit','One Voided Suit',1],['no-honors','No Honors',1],['edge-wait','Edge Wait',1],['closed-wait','Closed Wait',1],['single-wait','Single Wait',1],['self-drawn','Self-Drawn',1],['flower-tiles','Flower Tiles',1],
];
export const MCR_2006_FAN_BINDINGS: readonly McrFanBinding[] = bindingRows.map(([slug,name,value], index) => ({ id: `mcr2006.fan.${slug}`, name, value, sourceLocator: index === 80 ? '§3.8.1 #81; §3.11.6.6' : `§3.8.1 #${index + 1}; App.1 #${index + 1}`, stage: slug === 'chicken-hand' ? 'fallback' : slug === 'flower-tiles' ? 'post-qualification' : 'candidate' }));
const binding = (slug: string) => MCR_2006_FAN_BINDINGS.find((item) => item.id === `mcr2006.fan.${slug}`)!;

const face = (tile: PhysicalTileEvidence): Face => { const f = tile.face; if (f.family === 'suit') return `${f.suit}:${f.rank}`; if (f.family === 'wind') return `wind:${f.wind}`; if (f.family === 'dragon') return `dragon:${f.dragon}`; return 'invalid'; };
const suit = (f: Face): Suit | undefined => { const [a] = f.split(':'); return a === 'characters' || a === 'bamboo' || a === 'dots' ? a : undefined; };
const rank = (f: Face): number | undefined => { const n = Number(f.split(':')[1]); return Number.isInteger(n) ? n : undefined; };
const isHonor = (f: Face) => f.startsWith('wind:') || f.startsWith('dragon:');
const isTerminal = (f: Face) => rank(f) === 1 || rank(f) === 9;
const combinations = <T>(items: readonly T[], n: number): T[][] => n === 0 ? [[]] : items.flatMap((item, i) => combinations(items.slice(i + 1), n - 1).map((rest) => [item, ...rest]));
const sorted = <T>(items: readonly T[], f: (x: T) => string) => [...items].sort((a,b) => f(a).localeCompare(f(b)));

const counts = (faces: readonly Face[]) => new Map(faces.map((f) => [f, faces.filter((x) => x === f).length]));
/** Physical group order is presentation-only; faces and occurrence ordinals are canonical. */
const fixedElements = (evidence: McrHandEvidence): Element[] => {
 const groups = evidence.fixedGroups.map((group) => ({ kind: group.kind, fixed: group.exposure, faces: group.tiles.map(face).sort() }));
 const ordered = groups.sort((a,b)=>`${a.kind}:${a.fixed}:${a.faces.join(',')}`.localeCompare(`${b.kind}:${b.fixed}:${b.faces.join(',')}`));
 return ordered.map((group,index)=>({ ...group, id:`fixed:${group.kind}:${group.fixed}:${group.faces.join(',')}:${ordered.slice(0,index).filter(x=>x.kind===group.kind&&x.fixed===group.fixed&&x.faces.join(',')===group.faces.join(',')).length}` }));
};
const ordinary = (evidence: McrHandEvidence): McrInterpretation[] => {
 const fixed = fixedElements(evidence); const needSets = 4 - fixed.length; if (needSets < 0) return [];
 const free = evidence.freeTiles.map(face); const needed = needSets * 3 + 2; if (free.length !== needed) return [];
 const out: McrInterpretation[] = [];
 const visit = (rest: Face[], sets: Element[], pair?: Element) => {
  if (!rest.length) { if (sets.length === needSets && pair) { const els = [...fixed, ...sets, pair]; const id = `ordinary:${els.map((x) => `${x.kind}:${[...x.faces].sort().join(',')}:${x.fixed ?? 'free'}`).sort().join('|')}`; out.push({ id, kind: 'ordinary', elements: els }); } return; }
  const first = rest[0]!; const take = (used: Face[]) => { const remaining = [...rest]; for (const u of used) remaining.splice(remaining.indexOf(u),1); return remaining; };
  if (!pair && rest.filter((f) => f === first).length >= 2) visit(take([first,first]),sets,{id:`free:pair:${first}`,kind:'pair',faces:[first,first]});
  if (sets.length < needSets && rest.filter((f) => f === first).length >= 3) visit(take([first,first,first]),[...sets,{id:`free:set:${sets.length}:${first}`,kind:'pung',faces:[first,first,first]}],pair);
  const s=suit(first), r=rank(first); if (sets.length < needSets && s && r && r <= 7) { const next=[`${s}:${r+1}`,`${s}:${r+2}`]; if(next.every((f)=>rest.includes(f))) visit(take([first,...next]),[...sets,{id:`free:set:${sets.length}:${first}`,kind:'chow',faces:[first,...next]}],pair); }
 };
 visit(sorted(free,x=>x),[]); return sorted(out,x=>x.id).filter((v,i,a)=>i===0||a[i-1]!.id!==v.id);
};
const allFaces = (evidence:McrHandEvidence) => [...evidence.fixedGroups.flatMap((g)=>g.tiles.map(face)),...evidence.freeTiles.map(face)];
const pairs = (faces:readonly Face[]) => faces.length===14 && [...counts(faces).values()].every((n)=>n%2===0);
const terminalsHonors = new Set(['characters:1','characters:9','bamboo:1','bamboo:9','dots:1','dots:9','wind:east','wind:south','wind:west','wind:north','dragon:red','dragon:green','dragon:white']);
const knitted = (faces:readonly Face[]) => { const groups=[[1,4,7],[2,5,8],[3,6,9]]; const ss:Suit[]=['characters','bamboo','dots']; return [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]].map((permutation)=>new Set(permutation.flatMap((p,i)=>groups[i]!.map((r)=>`${ss[p]!}:${r}`)))); };
const irregular = (evidence:McrHandEvidence): McrInterpretation[] => { if(evidence.fixedGroups.length) return []; const fs=evidence.freeTiles.map(face); const out:McrInterpretation[]=[];
 if (fs.length===14 && pairs(fs)) out.push({id:'seven-pairs',kind:'seven-pairs',elements:[]});
 if (fs.length===14 && counts(fs).size===13 && [...terminalsHonors].every((f)=>fs.includes(f)) && [...counts(fs).values()].every(n=>n===1||n===2)) out.push({id:'thirteen-orphans',kind:'thirteen-orphans',elements:[]});
 for(const [index,set] of knitted(fs).entries()) { if(fs.length!==14||counts(fs).size!==14||!fs.every(f=>isHonor(f)||set.has(f))) continue; const honors=fs.filter(isHonor).length; if(honors===7) out.push({id:`greater-knitted:${index}`,kind:'greater-knitted',elements:[]}); else if(honors===5||honors===6) out.push({id:`lesser-knitted:${index}`,kind:'lesser-knitted',elements:[]}); }
 return out;
};

const candidate = (out: PatternAccumulatorCandidate[], slug: string, interpretationId: string, occurrence: string) => { const b=binding(slug); out.push({id:`${b.id}#${interpretationId}#${occurrence}`,bindingId:b.id,value:b.value,interpretationId,sourceLocator:b.sourceLocator}); };
const groups = (i:McrInterpretation, kinds:readonly Element['kind'][]=['pung','kong']) => i.elements.filter((e)=>kinds.includes(e.kind));
const same = (a:Element,b:Element) => a.faces[0] === b.faces[0];
const hasFace = (e:Element, f:Face) => e.faces.includes(f);
const isConcealed = (e:Element) => !e.fixed || e.fixed === 'concealed';
/** Every free element that can consume the recorded physical winning occurrence is a completion route. */
const roles = (i:McrInterpretation, winning:Face): readonly ('edge'|'closed'|'single'|'other')[] => i.kind !== 'ordinary' ? ['other'] : i.elements.filter((e)=>!e.fixed&&hasFace(e,winning)).map((e) => { if(e.kind==='pair') return 'single'; if(e.kind!=='chow') return 'other'; const rs=e.faces.map(rank).sort() as number[]; const r=rank(winning)!; return (r===3&&rs[0]===1)||(r===7&&rs[0]===7)?'edge':r===rs[1]?'closed':'other'; });
const legalWith = (evidence:McrHandEvidence, f:Face): McrInterpretation[] => { const [s,r]=f.split(':'); const tile:PhysicalTileEvidence = s==='wind'?{face:{family:'wind',wind:r}}:s==='dragon'?{face:{family:'dragon',dragon:r}}:{face:{family:'suit',suit:s as Suit,rank:Number(r)}}; const next={...evidence,freeTiles:[...evidence.freeTiles,tile],winningTile:tile}; return [...ordinary(next),...irregular(next)]; };
const winningFaces = (evidence:McrHandEvidence): readonly Face[] => { const pre=removeMcrWinningTileFromFreeTiles(evidence.freeTiles,evidence.winningTile); if(!pre)return []; const base={...evidence,freeTiles:pre}; const all=[...terminalsHonors,...(['characters','bamboo','dots'] as Suit[]).flatMap(s=>Array.from({length:9},(_,i)=>`${s}:${i+1}`))]; const used=allFaces(base); return all.filter(f=>(used.filter(x=>x===f).length<4)&&legalWith(base,f).length>0); };

export const detectMcr2006Fans = (input:{ evidence:McrHandEvidence; context:McrScoreContext }): McrDetection => {
 const valid=validateMcrScoringInput(input); if(!valid.valid) return {bindings:MCR_2006_FAN_BINDINGS,interpretations:[],candidates:[],missingEvidenceIds:[],flowerCount:0};
 const {evidence,context}=input; const fs=allFaces(evidence); const interpretations=[...ordinary(evidence),...irregular(evidence)]; const out:PatternAccumulatorCandidate[]=[]; const missing:string[]=[];
 const hand=(slug:string, predicate:boolean)=>interpretations.length>0&&predicate&&candidate(out,slug,'hand','hand');
 const ordinaryOnly=interpretations.filter(i=>i.kind==='ordinary');
 const kongs=fixedElements(evidence).filter(e=>e.kind==='kong'); const melded=kongs.filter(e=>e.fixed==='melded'); const concealed=kongs.filter(e=>e.fixed==='concealed');
 const suits=new Set(fs.map(suit).filter(Boolean)); const honors=fs.filter(isHonor); const ps=ordinaryOnly.flatMap(i=>groups(i)); const chows=(i:McrInterpretation)=>groups(i,['chow']);
 const pface=(e:Element)=>e.faces[0]!;
 // Hand-wide composition and fixed physical facts.
 hand('all-green',fs.every(f=>['bamboo:2','bamboo:3','bamboo:4','bamboo:6','bamboo:8','dragon:green'].includes(f)));
 hand('four-kongs',kongs.length===4); for(const i of ordinaryOnly) if(kongs.length>=3) candidate(out,'three-kongs',i.id,'kongs');
 hand('all-terminals',fs.every(f=>!!rank(f)&&isTerminal(f))); hand('all-terminals-and-honors',fs.every(f=>isTerminal(f)||isHonor(f)));
 hand('all-honors',fs.every(isHonor)); hand('full-flush',suits.size===1&&honors.length===0); hand('half-flush',suits.size===1&&honors.length>0);
 hand('upper-tiles',fs.every(f=>{const r=rank(f);return r!==undefined&&r>=7})); hand('middle-tiles',fs.every(f=>{const r=rank(f);return r!==undefined&&r>=4&&r<=6})); hand('lower-tiles',fs.every(f=>{const r=rank(f);return r!==undefined&&r<=3}));
 hand('upper-four',fs.every(f=>{const r=rank(f);return r!==undefined&&r>=6})); hand('lower-four',fs.every(f=>{const r=rank(f);return r!==undefined&&r<=4})); hand('all-simples',fs.every(f=>{const r=rank(f);return r!==undefined&&r>=2&&r<=8})); hand('no-honors',honors.length===0); hand('one-voided-suit',suits.size===2);
 hand('reversible-tiles',fs.every(f=>['dots:1','dots:2','dots:3','dots:4','dots:5','dots:8','dots:9','bamboo:2','bamboo:4','bamboo:5','bamboo:6','bamboo:8','bamboo:9','dragon:white'].includes(f)));
 hand('seven-pairs',interpretations.some(i=>i.kind==='seven-pairs')); hand('thirteen-orphans',interpretations.some(i=>i.kind==='thirteen-orphans')); for(const i of interpretations.filter(x=>x.kind==='greater-knitted')) candidate(out,'greater-honors-knitted',i.id,`assignment:${i.id.split(':')[1]}`); for(const i of interpretations.filter(x=>x.kind==='lesser-knitted')) candidate(out,'lesser-honors-knitted',i.id,`assignment:${i.id.split(':')[1]}`);
 const count=counts(fs); if(interpretations.length) for(const [f,n] of count) if(n===4&&!!suit(f)&&!kongs.some(k=>pface(k)===f)) candidate(out,'tile-hog','hand',f);
 if(interpretations.length) for(const [index,set] of knitted(fs).entries()) if([...set].every(f=>fs.includes(f))) candidate(out,'knitted-straight','hand',`assignment:${index}`);
 const pre=removeMcrWinningTileFromFreeTiles(evidence.freeTiles,evidence.winningTile)?.map(face); const winner=face(evidence.winningTile); if(interpretations.length&&!evidence.fixedGroups.some(g=>g.exposure==='melded')&&pre&&pre.length===13){ const sf=suit(winner), rr=rank(winner); const wanted=sf?[1,1,1,2,3,4,5,6,7,8,9,9,9].map(r=>`${sf}:${r}`):[]; if(rr&&pre.slice().sort().join('|')===wanted.slice().sort().join('|')) candidate(out,'nine-gates','hand','pre-win'); }
 if(fs.length===14&&suits.size===1&&[...count.values()].every(n=>n===2)&&[...count.keys()].map(rank).every(r=>r!==undefined)&&Math.max(...[...count.keys()].map(rank) as number[])-Math.min(...[...count.keys()].map(rank) as number[])===6) hand('seven-shifted-pairs',true);
 // Context and each ordinary interpretation.
 if(interpretations.length&&context.resolvedWinEvent==='last-wall-draw') candidate(out,'last-tile-draw','context','last-wall-draw'); if(interpretations.length&&context.resolvedWinEvent==='last-discard') candidate(out,'last-tile-claim','context','last-discard'); if(interpretations.length&&context.resolvedWinEvent==='kong-replacement') candidate(out,'out-with-replacement-tile','context','kong-replacement'); if(interpretations.length&&context.resolvedWinEvent==='rob-kong') candidate(out,'robbing-the-kong','context','rob-kong'); if(interpretations.length&&context.winSource==='self-draw') candidate(out,'self-drawn','context','self-draw');
 if(interpretations.length&&context.lastVisibleCopy===true) candidate(out,'last-tile','context',winner); else if(interpretations.length&&context.lastVisibleCopy===undefined) missing.push('evidence.last-visible-copy');
 if(ordinaryOnly.some(i=>groups(i).some(e=>pface(e).startsWith('wind:')))) { if(context.seatWind===undefined) missing.push('evidence.seat-wind'); if(context.prevailingWind===undefined) missing.push('evidence.round-wind'); }
 for(const i of ordinaryOnly){ const es=i.elements, pung=groups(i), chow=chows(i), pair=es.find(e=>e.kind==='pair')!; const iid=i.id;
  const emit=(slug:string, ok:boolean, occurrence='match')=>ok&&candidate(out,slug,iid,occurrence);
  const windP=pung.filter(e=>pface(e).startsWith('wind:')), dragonP=pung.filter(e=>pface(e).startsWith('dragon:'));
  emit('big-four-winds',new Set(windP.map(pface)).size===4); emit('big-three-winds',new Set(windP.map(pface)).size>=3); emit('big-three-dragons',new Set(dragonP.map(pface)).size===3);
  emit('little-four-winds',new Set(windP.map(pface)).size===3&&pface(pair).startsWith('wind:')&&!windP.some(e=>same(e,pair))); emit('little-three-dragons',new Set(dragonP.map(pface)).size===2&&pface(pair).startsWith('dragon:')&&!dragonP.some(e=>same(e,pair)));
  emit('four-concealed-pungs',pung.length===4&&pung.every(isConcealed)); emit('three-concealed-pungs',pung.filter(isConcealed).length>=3); emit('all-pungs',pung.length===4); emit('all-chows',chow.length===4&&!!suit(pface(pair)));
  emit('all-even-pungs',pung.length===4&&es.every(e=>e.faces.every(f=>{const r=rank(f);return r!==undefined&&r%2===0}))); emit('all-fives',es.every(e=>e.faces.some(f=>rank(f)===5))); emit('outside-hand',es.every(e=>e.faces.some(f=>isTerminal(f)||isHonor(f))));
  const chowSuits=[...new Set(chow.map(e=>suit(pface(e))))] as Suit[];
  emit('pure-terminal-chows',chow.length===4&&chowSuits.length===1&&chow.filter(e=>rank(pface(e))===1).length===2&&chow.filter(e=>rank(pface(e))===7).length===2&&suit(pface(pair))===chowSuits[0]&&rank(pface(pair))===5);
  emit('three-suited-terminal-chows',chow.length===4&&chowSuits.length===2&&chowSuits.every(s=>chow.some(e=>suit(pface(e))===s&&rank(pface(e))===1)&&chow.some(e=>suit(pface(e))===s&&rank(pface(e))===7))&&rank(pface(pair))===5&&!!suit(pface(pair))&&!chowSuits.includes(suit(pface(pair))!));
  emit('all-types',new Set(es.map(e=>suit(pface(e))??(pface(e).startsWith('wind')?'wind':'dragon'))).size===5);
  emit('fully-concealed-hand',!es.some(e=>e.fixed==='melded')&&context.winSource==='self-draw'); emit('concealed-hand',!es.some(e=>e.fixed==='melded')&&context.winSource==='discard');
  for(const e of dragonP) candidate(out,'dragon-pung',iid,e.id); for(const e of pung.filter(e=>isTerminal(pface(e))||pface(e).startsWith('wind:'))) candidate(out,'pung-terminals-or-honors',iid,e.id);
  if(context.seatWind) for(const e of windP.filter(e=>pface(e)===`wind:${context.seatWind}`)) candidate(out,'seat-wind',iid,e.id); if(context.prevailingWind) for(const e of windP.filter(e=>pface(e)===`wind:${context.prevailingWind}`)) candidate(out,'prevalent-wind',iid,e.id);
  for(const e of concealed) candidate(out,'concealed-kong',iid,e.id); for(const e of melded) candidate(out,'melded-kong',iid,e.id); for(const pairK of combinations(concealed,2)) candidate(out,'two-concealed-kongs',iid,pairK.map(e=>e.id).join('+')); for(const pairK of combinations(kongs,2).filter(x=>x.some(e=>e.fixed==='melded'))) candidate(out,'two-melded-kongs',iid,pairK.map(e=>e.id).join('+'));
  for(const p of combinations(pung,2).filter(([a,b])=>!!suit(pface(a))&&suit(pface(a))!==suit(pface(b))&&rank(pface(a))===rank(pface(b)))) candidate(out,'double-pung',iid,p.map(e=>e.id).sort().join('+'));
  for(const p of combinations(pung.filter(isConcealed),2)) candidate(out,'two-concealed-pungs',iid,p.map(e=>e.id).sort().join('+'));
  for(const p of combinations(dragonP,2)) candidate(out,'two-dragon-pungs',iid,p.map(e=>e.id).sort().join('+'));
  for(const p of combinations(chow,2)){ const [a,b]=p, sa=suit(pface(a)),sb=suit(pface(b)),ra=rank(pface(a))!,rb=rank(pface(b))!; if(sa===sb&&ra===rb)candidate(out,'pure-double-chow',iid,p.map(e=>e.id).sort().join('+')); if(sa!==sb&&ra===rb)candidate(out,'mixed-double-chow',iid,p.map(e=>e.id).sort().join('+')); if(sa===sb&&Math.abs(ra-rb)===3)candidate(out,'short-straight',iid,p.map(e=>e.id).sort().join('+')); if(sa===sb&&new Set([ra,rb]).size===2&&[ra,rb].sort().join(',')==='1,7')candidate(out,'two-terminal-chows',iid,p.map(e=>e.id).sort().join('+')); }
 }
 // Relational three/four element patterns are intentionally emitted per subset.
 for(const i of ordinaryOnly){ const iid=i.id, pung=groups(i), chow=chows(i); for(const xs of combinations(chow,3)){const rs=xs.map(e=>rank(pface(e))!),ss=xs.map(e=>suit(pface(e))!); const key=xs.map(e=>e.id).sort().join('+'); if(new Set(ss).size===1&&new Set(rs).size===1)candidate(out,'pure-triple-chow',iid,key); if(new Set(ss).size===1&&[...rs].sort((a,b)=>a-b).join(',')===`${Math.min(...rs)},${Math.min(...rs)+1},${Math.min(...rs)+2}`)candidate(out,'pure-shifted-chows',iid,key); if(new Set(ss).size===1&&[...rs].sort((a,b)=>a-b).join(',')===`${Math.min(...rs)},${Math.min(...rs)+2},${Math.min(...rs)+4}`)candidate(out,'pure-shifted-chows',iid,key); if(new Set(ss).size===3&&new Set(rs).size===1)candidate(out,'mixed-triple-chow',iid,key); if(new Set(ss).size===3&&[...rs].sort((a,b)=>a-b).join(',')===`${Math.min(...rs)},${Math.min(...rs)+1},${Math.min(...rs)+2}`)candidate(out,'mixed-shifted-chows',iid,key); if(new Set(ss).size===3&&[...rs].sort((a,b)=>a-b).join(',')==='1,4,7')candidate(out,'mixed-straight',iid,key); if(new Set(ss).size===1&&[...rs].sort((a,b)=>a-b).join(',')==='1,4,7')candidate(out,'pure-straight',iid,key); }
  for(const xs of combinations(pung,3)){const rs=xs.map(e=>rank(pface(e))),ss=xs.map(e=>suit(pface(e)));const key=xs.map(e=>e.id).sort().join('+'); if(rs.every(Boolean)&&new Set(ss).size===1&&Math.max(...rs as number[])-Math.min(...rs as number[])===2&&new Set(rs).size===3)candidate(out,'pure-shifted-pungs',iid,key); if(rs.every(Boolean)&&new Set(ss).size===3&&new Set(rs).size===1)candidate(out,'triple-pung',iid,key); if(rs.every(Boolean)&&new Set(ss).size===3&&Math.max(...rs as number[])-Math.min(...rs as number[])===2&&new Set(rs).size===3)candidate(out,'mixed-shifted-pungs',iid,key); }
  for(const xs of combinations(chow,4)){const rs=xs.map(e=>rank(pface(e))!),ss=xs.map(e=>suit(pface(e))!),key=xs.map(e=>e.id).sort().join('+'),ordered=[...rs].sort((a,b)=>a-b);if(new Set(ss).size===1&&new Set(rs).size===1)candidate(out,'quadruple-chow',iid,key);if(new Set(ss).size===1&&(['0,1,2,3','0,2,4,6'].includes(ordered.map(x=>x-ordered[0]!).join(','))))candidate(out,'four-pure-shifted-chows',iid,key);}
  for(const xs of combinations(pung,4)){const rs=xs.map(e=>rank(pface(e))),ss=xs.map(e=>suit(pface(e))),key=xs.map(e=>e.id).sort().join('+');if(rs.every(Boolean)&&new Set(ss).size===1&&Math.max(...rs as number[])-Math.min(...rs as number[])===3&&new Set(rs).size===4)candidate(out,'four-pure-shifted-pungs',iid,key);}
 }
 const faces=winningFaces(evidence); if(faces.length===1&&faces[0]===winner){const routeRoles=interpretations.flatMap(i=>roles(i,winner).map(r=>({i,r}))); const kinds=new Set(routeRoles.map(x=>x.r)); if(routeRoles.length&&kinds.size===1&&![...kinds][0]!.includes('other')) for(const {i,r} of routeRoles) candidate(out,`${r}-wait`,i.id,'winning-role');}
 const preFree=removeMcrWinningTileFromFreeTiles(evidence.freeTiles,evidence.winningTile); if(context.winSource==='discard'&&evidence.fixedGroups.length===4&&evidence.fixedGroups.every(g=>g.exposure==='melded')&&preFree?.length===1&&face(preFree[0]!)===winner&&faces.length===1) candidate(out,'melded-hand',ordinaryOnly[0]?.id??'ordinary','pair');
 return {bindings:MCR_2006_FAN_BINDINGS,interpretations,candidates:sorted(out,x=>x.id),missingEvidenceIds:[...new Set(missing)].sort(),flowerCount:evidence.flowerCount};
};

/** Production catalogue evidence seam; #300 supplies only the later interaction stages. */
export const MCR_2006_EVIDENCE_POLICY_ID = 'evidence-policy.mcr-wmo-2006';
export const MCR_2006_INPUT_EVIDENCE: PatternAccumulatorStageContracts<{ evidence:McrHandEvidence; context:McrScoreContext }>['inputEvidence'] = {
 validate: validateMcrScoringInput,
 requiredEvidence: (input) => detectMcr2006Fans(input).missingEvidenceIds,
};
