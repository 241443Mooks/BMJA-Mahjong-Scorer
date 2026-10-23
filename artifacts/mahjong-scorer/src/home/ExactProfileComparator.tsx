import { useEffect, useState } from 'react';
import { PUBLIC_RULES_DESCRIPTORS } from '../game/rules-presentation';
import { MCR_WMO_2006_PROFILE, mcrProfileResolverEnvironment } from '../rules-platform/mcr-profile';
import { resolvePlayableProfile } from '../rules-platform/resolver';
import { currentPlayableResolverEnvironment, currentPlayableProfiles } from '../rules-platform/current-profiles';
import { projectProfileDimensions, RULES_DIMENSIONS, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE, type ProfileDimensionValue, type RulesDimensionGroup } from '../rules-platform/profile-dimensions';
import type { RulesProfileRef } from '../rules-platform/types';

const profiles: { ref: RulesProfileRef; name: string; slug?: string; mcr?: boolean }[] = [
  ...[...currentPlayableProfiles.map(({ identity }) => ({ id: identity.id, version: identity.version })), { id: MCR_WMO_2006_PROFILE.identity.id, version: MCR_WMO_2006_PROFILE.identity.version }].map((ref) => {
    const descriptor = PUBLIC_RULES_DESCRIPTORS.find(({ profile }) => profile.id === ref.id && profile.version === ref.version);
    return { ref, name: descriptor?.compactLabel ?? `${ref.id} ${ref.version}`, slug: descriptor?.slug, mcr: ref.id === MCR_WMO_2006_PROFILE.identity.id };
  }),
];
const groupNames: Record<RulesDimensionGroup,string> = { 'identity-table-tiles':'Identity, table & tiles','hand-play':'Hand & play','ready-declarations':'Ready & declarations','scoring':'Scoring','settlement-incidents':'Settlement & incidents','draws-progression':'Draws & progression' };
const why: Record<string,string> = {
  'play.ordinary-chow-policy':'Changes which ordinary hands can be completed.',
  'scoring.grammar':'Changes how a winning hand earns value.',
  'scoring.limit-cap':'Changes the maximum ordinary score at the table.',
  'settlement.loser-to-loser':'Changes whether losing hands still affect payments.',
  'settlement.liability':'Can make one player responsible for another player’s payment.',
  'round.draw-follow-up':'Changes the next hand after a wall draw.',
};
const unresolved = (v: ProfileDimensionValue) => v.sourceStatus === 'source-unknown' || v.sourceStatus === 'source-provisional' || v.runtimeSupport === 'not-modelled' || v.value.status === 'unknown';
export const comparisonValuesDiffer = (a: ProfileDimensionValue, b: ProfileDimensionValue) =>
  unresolved(a) || unresolved(b) || a.value.status !== b.value.status || JSON.stringify(a.value) !== JSON.stringify(b.value) || a.sourceStatus !== b.sourceStatus;
export const reviewedClassicalRelationship = (dimensionId: string, leftId: string, rightId: string): string | undefined => {
  const classicalPair = new Set([leftId, rightId]);
  if (classicalPair.size !== 2 || !classicalPair.has('bmja') || !classicalPair.has('buzzard-2000')) return undefined;
  switch (dimensionId) {
    case 'play.ordinary-chow-policy': return 'Audit-reviewed: Buzzard is broader than BMJA; it permits multiple Chows in an ordinary hand.';
    case 'scoring.ordinary-base': return 'Audit-reviewed: exact same ordinary base-score table.';
    case 'scoring.limit-cap': return 'Audit-reviewed: parameter variation; BMJA is normally 1,000 and Buzzard’s source example/default is 600.';
    case 'scoring.special-catalogue': return 'Audit-reviewed: Buzzard has a unique profile-local named limit-hand catalogue.';
    case 'ready.model': return 'Audit-reviewed analogue: BMJA fishing and Buzzard Calling / Standing Hand concepts are related, not equivalent.';
    case 'settlement.loser-to-loser': return 'Audit-reviewed: exact same ordinary settlement shape.';
    default: return undefined;
  }
};

export function ExactProfileComparator() {
  const [values, setValues] = useState<Record<string, readonly ProfileDimensionValue[]>>({});
  const [left, setLeft] = useState('bmja@1.0');
  const [right, setRight] = useState('buzzard-2000@0.1');
  const [differencesOnly, setDifferencesOnly] = useState(true);
  useEffect(() => {
    let live = true;
    Promise.all(profiles.map(async ({ ref, mcr }) => {
      const artifact = await resolvePlayableProfile(ref, mcr ? mcrProfileResolverEnvironment : currentPlayableResolverEnvironment);
      return [`${ref.id}@${ref.version}`, projectProfileDimensions(artifact, CLASSICAL_COMPARATOR_REVIEWED_EVIDENCE)] as const;
    })).then((entries) => { if (live) setValues(Object.fromEntries(entries)); });
    return () => { live = false; };
  }, []);
  const l = values[left], r = values[right];
  const selectedLeft = profiles.find(({ref}) => `${ref.id}@${ref.version}` === left)!;
  const selectedRight = profiles.find(({ref}) => `${ref.id}@${ref.version}` === right)!;
  const rows = l && r ? RULES_DIMENSIONS.filter((d) => {
    const a = l.find((v) => v.dimensionId === d.id)!; const b = r.find((v) => v.dimensionId === d.id)!;
    return !differencesOnly || comparisonValuesDiffer(a, b);
  }) : [];
  return <section className="border-b border-[#ddd3bf] px-5 py-9 sm:px-8 sm:py-11 lg:px-12" aria-labelledby="exact-profile-title">
    <div className="font-mono text-[10px] uppercase tracking-[.18em] text-[#ae6249]">Exact profile comparison</div>
    <h2 id="exact-profile-title" className="mt-2 font-serif text-[34px] leading-tight text-[#284d45]">Compare the rules Mahjong Reference can score</h2>
    <p className="mt-3 max-w-[780px] text-[13px] leading-6 text-[#596b65]">Values come from current resolved profiles. Source status describes the evidence behind each value; matching runtime values do not establish matching source rules.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {[{value:left,set:setLeft,label:'First exact profile'},{value:right,set:setRight,label:'Second exact profile'}].map((control) => <label key={control.label} className="grid gap-2 text-[12px] font-semibold text-[#284d45]">{control.label}<select aria-label={control.label} value={control.value} onChange={(e) => control.set(e.target.value)} className="min-h-11 rounded-lg border border-[#b8c8c1] bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{profiles.map(({ref,name}) => <option key={`${ref.id}@${ref.version}`} value={`${ref.id}@${ref.version}`}>{name} · {ref.version}</option>)}</select></label>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#efe8da] p-3 text-[12px] text-[#405650]"><span>{selectedLeft.name} {selectedLeft.ref.version} · {selectedRight.name} {selectedRight.ref.version}</span><label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" aria-label="Differences only" checked={differencesOnly} onChange={(e) => setDifferencesOnly(e.target.checked)} className="h-4 w-4 accent-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"/>Differences only</label><button type="button" className="min-h-11 rounded border border-[#b8c8c1] bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]" onClick={() => setDifferencesOnly(false)}>All</button></div>
    {!l || !r ? <p className="mt-5 text-sm text-[#596b65]" role="status">Loading resolved profiles…</p> : <div className="mt-5 space-y-5">{Object.entries(groupNames).map(([group,title]) => { const sectionRows=rows.filter((d)=>d.group===group); return sectionRows.length ? <section key={group} aria-label={title}><h3 className="mb-2 font-serif text-xl text-[#284d45]">{title}</h3><div className="space-y-2">{sectionRows.map((d)=>{const a=l.find((v)=>v.dimensionId===d.id)!; const b=r.find((v)=>v.dimensionId===d.id)!; const relationship = reviewedClassicalRelationship(d.id, selectedLeft.ref.id, selectedRight.ref.id); return <article key={d.id} className="grid gap-2 rounded-lg border border-[#d8ceb8] bg-[#fdfbf5] p-3 sm:grid-cols-[1fr_1fr_1fr]"><div><h4 className="text-[12px] font-semibold text-[#284d45]">{d.label}</h4>{why[d.id] && <p className="mt-1 text-[11px] leading-5 text-[#596b65]">{why[d.id]}</p>}{relationship && <p className="mt-1 text-[10px] leading-5 text-[#7a5a42]">{relationship}</p>}</div>{[a,b].map((v,i)=><div key={i} className="text-[11px] leading-5 text-[#405650]"><strong>{i===0?selectedLeft.name:selectedRight.name}:</strong> {v.displayValue}<div className="text-[10px] text-[#7a7769]">Source: {v.sourceStatus.replaceAll('-',' ')} · Runtime: {v.runtimeSupport.replaceAll('-',' ')}{v.caveat ? ` · ${v.caveat}` : ''}</div>{(selectedLeft.slug&&i===0||selectedRight.slug&&i===1) && <a className="font-semibold text-[#284d45] underline" href={`/rules/${i===0?selectedLeft.slug:selectedRight.slug}`}>View exact profile rules</a>}</div>)}</article>})}</div></section> : null; })}</div>}
    <p className="mt-4 text-[11px] leading-5 text-[#7a7769]">Relationship evidence is limited to the reviewed Classical audit. MCR values are projected using its pattern scoring grammar and remain unreviewed for Classical pairwise relationships.</p>
  </section>;
}
