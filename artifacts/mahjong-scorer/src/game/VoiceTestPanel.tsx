import { useState } from 'react';
import { expandedTiles, type HandSet } from '../scoring';
import { playingTileDefinition, tileAssetUrl } from '../tiles/MahjongTileArtwork';
import { voiceProposalSchema, type VoiceProposal } from './voice-evidence';

export function VoiceTestPanel({ onAccept, disabledReason }: { onAccept: (proposal: VoiceProposal) => string | null; disabledReason?: string }) {
  const [transcript, setTranscript] = useState('');
  const [heard, setHeard] = useState('');
  const [proposal, setProposal] = useState<VoiceProposal | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  async function interpret() {
    setError(''); setProposal(null); setHeard(transcript); setPending(true);
    try {
      const response = await fetch('/__voice/interpret', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) });
      if (!response.ok) throw new Error('Interpretation unavailable. Check the local server or use manual entry.');
      setProposal(voiceProposalSchema.parse(await response.json()));
    } catch { setError('Interpretation unavailable or invalid. Check the local server or use manual entry.'); }
    finally { setPending(false); }
  }
  return <section className="mb-5 rounded-xl border border-[#c9b99d] bg-[#fbf8ed] p-4" aria-label="Private typed voice test">
    <h2 className="font-serif text-xl text-[#284d45]">Private typed voice test</h2>
    <p className="mt-2 text-sm">Your description is sent to OpenAI for interpretation. Review it before adding anything to this hand.</p>
    <label className="mt-3 block text-sm font-semibold">Description<textarea className="mt-1 block w-full rounded border p-2 font-normal" rows={3} maxLength={2000} disabled={pending} value={transcript} onChange={e => { setTranscript(e.target.value); setProposal(null); }} /></label>
    <button type="button" className="mt-2 rounded bg-[#284d45] px-4 py-2 text-white disabled:opacity-50" disabled={pending || !transcript.trim()} onClick={interpret}>{pending ? 'Interpreting…' : 'Interpret'}</button>
    {heard && <p className="mt-3 whitespace-pre-wrap text-sm"><b>What I heard:</b> {heard}</p>}
    {proposal && <div className="mt-3 space-y-3"><h3 className="font-semibold">Interpretation</h3>
      {proposal.groups.map((group, index) => <div key={index} className="rounded border border-[#cfc3aa] p-3 text-sm"><p>“{group.source}”</p><p className="capitalize">{group.kind ?? 'Unknown group'} · {group.visibility ?? 'Exposure unknown'}</p>
        {group.tile && group.kind && <div className="my-2 flex flex-wrap gap-1">{expandedTiles({ id: 'preview', kind: group.kind, tile: group.tile as HandSet['tile'], visibility: 'concealed' }).map((tile, i) => { const art = playingTileDefinition(tile); return <img key={i} className="h-12 w-9" src={tileAssetUrl(art.asset)} alt={art.label} />; })}</div>}
        {group.ambiguity && <p role="status">Needs clarification: {group.ambiguity}</p>}
        {!group.tile && <p>Tile unknown</p>}
        {!group.visibility && <label>Confirm exposure <select className="rounded border p-1" value="" onChange={e => setProposal(current => current && ({ ...current, groups: current.groups.map((g, i) => i === index ? { ...g, visibility: e.target.value as 'exposed' | 'concealed' } : g) }))}><option value="">Choose…</option><option value="exposed">Exposed</option><option value="concealed">Concealed</option></select></label>}
      </div>)}
      {proposal.unparsed.map((text, index) => <p className="text-sm" key={index}>Needs clarification: {text}</p>)}
      {proposal.groups.length === 0 && <p>No groups identified. Edit the description and try again.</p>}
      <p className="text-sm">Edit the description above and interpret again to correct a tile or group.</p>
      <button type="button" className="rounded border px-3 py-2" onClick={() => { setProposal(null); setHeard(''); }}>Edit</button>{' '}
      <button type="button" className="rounded bg-[#284d45] px-3 py-2 text-white disabled:opacity-50" disabled={!!disabledReason || !proposal.groups.length} onClick={() => { const message = onAccept(proposal); if (message) setError(message); else { setProposal(null); setHeard(''); setTranscript(''); setError('Groups added. You can edit them in the hand below.'); } }}>Accept groups</button>
      {disabledReason && <p>{disabledReason}</p>}
    </div>}
    {error && <p role="status" className="mt-2 text-sm">{error}</p>}
  </section>;
}
