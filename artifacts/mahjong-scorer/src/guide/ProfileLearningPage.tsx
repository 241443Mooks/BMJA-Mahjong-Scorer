import { hasPublishedSpecialHands } from '../rules-knowledge/reference-topics';
import { ReaderRuleLimits } from './ReaderRuleLimits';
import { SiteHeader } from '../components/SiteHeader';
import { BeginnerGuide } from './BeginnerGuide';
import { GameplayBasics } from './GameplayBasics';
import { ReaderRulesControl, readerHref, useReaderRules } from './ReaderRulesContext';
import { projectLearningContent, readerProfiles, readerSurfaceLinks, type LearningTopic } from './reader-content';
import { rulesDimension } from '../rules-platform/profile-dimensions';
import type { RulesDescriptor } from '../game/rules-presentation';

export function PartialLearningContent({ descriptor, topic, content = projectLearningContent(descriptor, topic) }: {
  descriptor: RulesDescriptor; topic: LearningTopic; content?: ReturnType<typeof projectLearningContent>;
}) {
  const links = readerSurfaceLinks(descriptor);
  return <>
    <p className="mt-3 text-lg">{descriptor.title}</p>
    <p className="mt-3">This is a partial guide. It covers the rules and scorer behaviour established here; a complete lesson on dealing, turn order, claiming and replacement tiles still needs source review.</p>
    <p className="mt-3 text-sm">Source basis: {descriptor.support.authority}. {descriptor.status}.</p>
    <ReaderRuleLimits profile={descriptor.profile} />
    {!content.capability && <p role="status" className="mt-6">Teaching material is not currently covered by the available reference for these exact rules. No other profile’s lesson has been substituted.</p>}
    {content.capability?.teaching?.map(({ id, title, text, sourceHref }) => <section id={id} key={title} className="mt-6"><h2 className="font-serif text-2xl">{title}</h2><p className="mt-2">{text}</p><a className="inline-block py-2 text-sm underline" href={sourceHref}>Read the source context</a></section>)}
    {content.rows.length > 0 && <section className="mt-7" aria-labelledby="known-rules"><h2 id="known-rules" className="font-serif text-2xl">What is known for these rules</h2>
      <dl className="mt-3 divide-y divide-[#cbd8d0]">{content.rows.map((row) => <div key={row.dimensionId} className="py-4">
        <dt className="font-semibold">{rulesDimension(row.dimensionId).label}</dt><dd className="mt-1">{row.playerAnswer}</dd>
        <dd className="mt-2 text-sm text-[#596b65]">{row.sourceStatus === 'source-verified' ? 'Checked against the published rules' : row.sourceStatus === 'verified-club' ? 'Checked against the club rules' : 'Source review is incomplete'} · {row.runtimeSupport === 'executable' ? 'Used by the scorer' : row.runtimeSupport === 'partial' ? 'Partly supported by the scorer' : 'Not modelled by the scorer'}</dd>
        {row.playerQualification || row.caveat ? <dd className="mt-1 text-sm">{row.playerQualification ?? row.caveat}</dd> : null}
      </div>)}</dl></section>}
    <section className="mt-7"><h2 className="font-serif text-2xl">Continue with these rules</h2><ul className="mt-3 space-y-2">
      <li><a className="underline" href={links.reference}>Rules, source details and known differences</a></li>
      <li><a className="underline" href={topic === 'gameplay' ? links.scoring : links.gameplay}>{topic === 'gameplay' ? 'Scoring guide' : 'Gameplay basics'}</a></li>
      {hasPublishedSpecialHands(descriptor.profile) && <li><a className="underline" href={links.specialHands}>Special hands and currently supported tile examples</a></li>}
      <li><a className="underline" href={links.encyclopaedia}>Encyclopaedia topics</a></li>
    </ul></section>
  </>;
}
export function ProfileLearningPage({ topic }: { topic: LearningTopic }) {
  const reader = useReaderRules();
  const title = topic === 'gameplay' ? 'Gameplay basics' : 'Scoring guide';
  const content = reader.selected && projectLearningContent(reader.selected, topic);
  if (reader.ready && reader.selected && content?.capability?.lessons[topic] === 'established-british') {
    return topic === 'gameplay' ? <GameplayBasics readerControl={<><ReaderRulesControl /><ReaderRuleLimits profile={reader.selected.profile} /></>} /> : <BeginnerGuide onClose={() => window.location.assign('/')} readerControl={<><ReaderRulesControl /><ReaderRuleLimits profile={reader.selected.profile} /></>} />;
  }
  return <div className="mahjong-shell"><SiteHeader /><main className="mx-auto max-w-4xl px-5 py-8 leading-7 text-[#284d45]">
    <h1 className="font-serif text-4xl">{title}</h1><ReaderRulesControl />
    {reader.ready && reader.selected ? <PartialLearningContent descriptor={reader.selected} topic={topic} content={content || undefined} /> : <>
      <p>Choose the rules your table uses to open a guide. Each guide keeps its own source status, scoring and limits.</p>
      <ul className="mt-5 space-y-3">{readerProfiles().map((item) => <li key={item.slug}><a className="inline-block py-2 font-semibold underline" href={readerHref(topic === 'gameplay' ? '/gameplay-basics' : '/guide', item)}>{item.title}</a><span className="mx-2">·</span><a className="inline-block py-2 underline" href={readerSurfaceLinks(item).reference}>Rules reference</a></li>)}</ul>
    </>}
  </main></div>;
}
