import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Check, ChevronDown, Copy, RotateCcw, Sparkles, X, AlertCircle } from 'lucide-react';
import { GameScorer } from './game/GameScorer';
import { SiteHeader } from './components/SiteHeader';
import { specialHandReferenceHref } from './guide/special-hand-references';
import { exampleExitLabel, handForScorerMode, practiceScorerContext, practiceSetSummary, resolveScorerExample, scoringExampleBonusTiles, scoringExampleById, scoringExampleTiles, type ResolvedScorerExample } from './guide/scoring-examples';
import { TileStrip } from './guide/MahjongTileGallery';
import { ReturnToGame } from './components/ReturnToGame';
import { handScorerLocalContext } from './game';
import { BMJA_PROFILE_REF } from './game/ruleset';
import { ActiveRules, RulesProfilePicker } from './game/RulesProfilePicker';
import { descriptorForRulesProfile, isBritishRulesProfile } from './game/rules-presentation';
import { PUBLIC_RULES_DESCRIPTORS } from './game/rules-presentation';
import { specialHandExampleProvesTreatment } from './guide/special-hand-examples';
import { resolveAtlasScorerExample } from './guide/atlas-scorer-handoff';
import { getCurrentCompiledRulesRuntime } from './rules-platform/current-runtime-registry';
import { mapCurrentClassicalScoreBreakdown } from './rules-platform/current-runtime-compat';
import { toMcrScoringInput } from './game/mcr-hand-input';
import { presentMcrScore } from './game/mcr-score-presentation';
import { buildMcrHandScorerResult } from './game/hand-scorer-handoff';
import type { McrResolvedWinEvent, McrWinSource, McrWind } from './rules-platform/mcr-scoring-input';
import { handScorerInitialBaseline, hasHandScorerUnsavedWork } from './game/hand-scorer-dirty-state';
import { transitionStandaloneHandProfile } from './game/hand-scorer-profile-transition';
import { readPreferredRulesProfile, setPreferredRulesProfile } from './game/preferred-rules-profile';
import { normaliseStructuredChoiceForGroup, recoverWorkingDraft } from './game/hand-entry-workspace';
import { applicableUngroupedBlanks, hasUngroupedBlankAt, reindexUngroupedBlanksAfterRemoval, toggleUngroupedBlankAt } from './game/ungrouped-blank-state';
import type {
  HandScorerContext,
  HandScorerResult,
} from './game';
import {
  BONUS_TILE_DEFINITIONS,
  bonusTileDefinition,
  playingTileDefinition,
  tileAssetUrl,
} from './tiles/MahjongTileArtwork';

import type {
  GameContext,
  MahjongHand,
  PlayingTile,
  HandSet,
  BonusTile,
  WinningMethod,
  Wind,
  Suit,
  SuitTile,
  SetKind,
  Visibility,
  WinningTileProvenance,
  WinningEventEvidence,
  UngroupedBlankTile,
} from './scoring';
import {
  detectedPatterns,
  isFirstDiscardEvidenceCandidate,
  isReplacementSequenceEvidenceCandidate,
  isWinningEventEvidenceCompatible,
  resolveWinningTileProvenance,
  suited,
  wind,
  dragon,
  bonus,
  expandedTiles,
  tileKey,
  SUITS,
  WINDS,
  DRAGONS,
} from './scoring';

const queryClient = new QueryClient();

const suitNames: Record<string, string> = { characters: 'Characters', bamboo: 'Bamboo', circles: 'Circles', wind: 'Winds', dragon: 'Dragons' };
const suitOrder = ['characters', 'bamboo', 'circles', 'wind', 'dragon'] as const;

const allSuitTiles: PlayingTile[] = SUITS.flatMap((s) =>
  Array.from({ length: 9 }, (_, i) => suited(s, (i + 1) as SuitTile['rank']))
);
const allWindTiles: PlayingTile[] = WINDS.map(wind);
const allDragonTiles: PlayingTile[] = DRAGONS.map(dragon);

const allPlayingTiles = [...allSuitTiles, ...allWindTiles, ...allDragonTiles];
export const patternReferenceHref = (pattern: { id: string; type: string }, rulesProfile: import('./game').RulesProfileRef) => {
  if (!isBritishRulesProfile(rulesProfile)) return undefined;
  if (pattern.type === 'points') return '/guide#ordinary-scoring';
  if (pattern.type === 'doubles') return '/guide#doubles';
  if (pattern.type === 'special') return specialHandReferenceHref(pattern.id.replace('special-', ''));
  if (pattern.type === 'fishing') return specialHandReferenceHref(pattern.id.replace('fishing-', '')) ?? '/guide#fishing';
  return undefined;
};
const tileName = (tile: PlayingTile) => playingTileDefinition(tile).label;

type UIHandSet = Omit<HandSet, 'tile'> & { tile: PlayingTile | null };
const defaultSets: UIHandSet[] = [
  { id: 'set-1', kind: 'pung', visibility: 'concealed', tile: null },
];

function TileFace({
  tile,
  compact = false,
  onRemove,
  onActivate,
  actionLabel,
  actionTestId,
}: {
  tile: PlayingTile;
  compact?: boolean;
  onRemove?: () => void;
  onActivate?: () => void;
  actionLabel?: string;
  actionTestId?: string;
}) {
  const artwork = playingTileDefinition(tile);
  const className = `group relative flex shrink-0 items-center justify-center rounded-[7px] ${compact ? 'h-12 w-9' : 'h-[72px] w-[54px]'}`;
  const face = (
    <img
      src={tileAssetUrl(artwork.asset)}
      alt={onActivate ? '' : artwork.label}
      loading="lazy"
      className="h-full w-full rounded-[6px] bg-[#fffdf7] object-contain tile-shadow"
    />
  );

  if (onActivate) {
    return (
      <button
        type="button"
        aria-label={actionLabel ?? artwork.label}
        data-testid={actionTestId ?? `button-tile-${tileKey(tile)}`}
        onClick={onActivate}
        className={`${className} cursor-pointer touch-manipulation transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 active:translate-y-0 active:scale-95`}
      >
        {face}
      </button>
    );
  }

  return (
    <div className={className} data-testid={`tile-${tileKey(tile)}`}>
      {onRemove && <button type="button" aria-label="Remove" data-testid={`button-remove-${tileKey(tile)}`} onClick={onRemove} className="absolute -right-2 -top-2 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-[#ae6249] text-[#fff7e9] group-hover:flex focus:flex"><X size={12} /></button>}
      {face}
    </div>
  );
}

function BonusTileButton({
  family,
  number,
  selected,
  playerWind,
  onToggle,
  showOwn = true,
}: {
  family: BonusTile['family'];
  number: BonusTile['number'];
  selected: boolean;
  playerWind: Wind;
  onToggle: () => void;
  showOwn?: boolean;
}) {
  const artwork = bonusTileDefinition(family, number);
  const isOwn = artwork.wind === playerWind;
  const selectedClass = family === 'flower'
    ? 'border-[#ae6249] bg-[#f5eadb] ring-2 ring-[#ae6249]/20'
    : 'border-[#284d45] bg-[#e9efea] ring-2 ring-[#284d45]/20';

  return (
    <button
      type="button"
      data-testid={`button-${family}-${number}`}
      aria-label={artwork.label}
      aria-pressed={selected}
      onClick={onToggle}
      className={`relative flex min-w-[76px] flex-col items-center rounded-lg border p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] ${
        selected
          ? selectedClass
          : 'border-[#d8ceb8] bg-[#fdfbf5] hover:border-[#ae6249] hover:bg-[#fffaf0]'
      }`}
    >
      <img
        src={tileAssetUrl(artwork.asset)}
        alt=""
        loading="lazy"
        className="h-[64px] w-[48px] rounded-[5px] bg-[#fffdf7] object-contain shadow-[0_2px_6px_rgba(48,57,49,.12)]"
      />
      <span className="mt-1 text-center text-[9px] font-semibold leading-3 text-[#66746e]">{artwork.name}</span>
      <span className="mt-0.5 text-center text-[8px] leading-3 text-[#7a7769]">{family === 'flower' ? 'Flower' : 'Season'} {number} · {artwork.wind}</span>
      {showOwn && isOwn && <span className="mt-1 rounded bg-[#e6efe9] px-1 py-0.5 text-[8px] font-semibold text-[#284d45]">Own {family === 'flower' ? 'Flower' : 'Season'}</span>}
    </button>
  );
}

function SectionLabel({ eyebrow, title, count }: { eyebrow: string; title: string; count?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="hidden font-mono text-[10px] font-medium uppercase tracking-[.2em] text-[#ae6249] sm:block">{eyebrow}</div>
        <h2 className="mt-1 font-serif text-[22px] leading-tight text-[#284d45]">{title}</h2>
      </div>
      {count && <span className="font-mono text-[11px] text-[#7a7769]">{count}</span>}
    </div>
  );
}

const mcrEvents: readonly { value: McrResolvedWinEvent; label: string }[] = [
  { value: 'none', label: 'Normal win' }, { value: 'last-wall-draw', label: 'Last wall draw' },
  { value: 'last-discard', label: 'Last discard' }, { value: 'kong-replacement', label: 'Kong replacement' },
  { value: 'flower-replacement', label: 'Flower replacement' }, { value: 'rob-kong', label: 'Robbing a Kong' },
];
const eventSource: Partial<Record<McrResolvedWinEvent, McrWinSource>> = {
  'last-wall-draw': 'self-draw', 'kong-replacement': 'self-draw', 'flower-replacement': 'self-draw',
  'last-discard': 'discard', 'rob-kong': 'discard',
};
const mcrWinds: readonly McrWind[] = ['east', 'south', 'west', 'north'];

export function HandScorer({ context, onClose, standaloneHand, standaloneRulesProfile, onStandaloneRulesProfileChange, example, practice }: { context: HandScorerContext | null; onClose: (result?: HandScorerResult) => void; standaloneHand: boolean; standaloneRulesProfile: import('./game').RulesProfileRef; onStandaloneRulesProfileChange: (profile: import('./game').RulesProfileRef) => void; example?: ResolvedScorerExample; practice?: boolean }) {
  // An example borrows the hand contract only; it must never acquire the game callback.
  const hasContext = !!context && !example;
  const practiceContext = practiceScorerContext(example);
  const initialContext = practice ? practiceContext : handScorerLocalContext(context, standaloneRulesProfile);
  const initialCompiledRuntime = getCurrentCompiledRulesRuntime(context?.rulesProfile ?? standaloneRulesProfile);
  const initialIsMcr = initialCompiledRuntime.grammar === 'pattern-accumulator' && initialCompiledRuntime.artifact.profile.identity.familyId === 'family.mcr';
  const initialHand = handForScorerMode(context, example, !!practice);
  const [sets, setSets] = useState<UIHandSet[]>(() =>
    initialHand
      ? [...initialHand.sets.map((handSet) => ({ ...handSet })), { id: 'set-working', kind: 'pung', visibility: 'concealed', tile: null }]
      : defaultSets.map((handSet) => ({ ...handSet })),
  );
  const [layoutMode, setLayoutMode] = useState<'sets' | 'special'>(() =>
    initialHand?.looseTiles?.length ? 'special' : 'sets',
  );
  const [looseTiles, setLooseTiles] = useState<PlayingTile[]>(() =>
    initialHand?.looseTiles?.map((tile) => ({ ...tile })) ?? [],
  );
  const [remainingTiles, setRemainingTiles] = useState<PlayingTile[]>(() =>
    initialHand?.remainingTiles?.map((tile) => ({ ...tile })) ?? [],
  );
  const [ungroupedBlankTiles, setUngroupedBlankTiles] = useState<UngroupedBlankTile[]>(() =>
    initialHand?.ungroupedBlankTiles?.map((blank) => ({ ...blank })) ?? [],
  );
  const [flowers, setFlowers] = useState<number[]>(() =>
    initialHand?.bonusTiles
      .filter((tile) => tile.family === 'flower')
      .map((tile) => tile.number) ?? [],
  );
  const [seasons, setSeasons] = useState<number[]>(() =>
    initialHand?.bonusTiles
      .filter((tile) => tile.family === 'season')
      .map((tile) => tile.number) ?? [],
  );

  const [playerWind, setPlayerWind] = useState<Wind>(initialContext.playerWind);
  const [prevailingWind, setPrevailingWind] = useState<Wind>(
    initialContext.prevailingWind,
  );
  const [limit, setLimit] = useState<number | undefined>(initialContext.limit);
  const [handMode, setHandMode] = useState(initialContext.handMode);
  const standaloneProfileRef = useRef(standaloneRulesProfile);

  const [isWinner, setIsWinner] = useState<boolean>(initialIsMcr || initialContext.isWinner);
  const [winningMethod, setWinningMethod] = useState<WinningMethod>(
    initialHand?.winningMethod ?? (practice ? practiceContext.winningMethod : 'wall'),
  );
  const [originalCall, setOriginalCall] = useState<boolean>(
    initialContext.isWinner ? initialHand?.originalCall ?? (practice ? practiceContext.originalCall : false) : false,
  );
  const [standingHand, setStandingHand] = useState(initialHand?.classicalEvidence?.standingHand ?? false);
  const [onlyPossibleWinningTile, setOnlyPossibleWinningTile] = useState(initialHand?.classicalEvidence?.onlyPossibleWinningTile ?? false);
  const [eastThirteenthConsecutiveMahjong, setEastThirteenthConsecutiveMahjong] = useState(('eastThirteenthConsecutiveMahjong' in initialContext ? initialContext.eastThirteenthConsecutiveMahjong : undefined) ?? false);
  const [winningTileProvenance, setWinningTileProvenance] = useState<WinningTileProvenance | undefined>(
    initialHand?.winningTileProvenance
      ? {
          tile: { ...initialHand.winningTileProvenance.tile },
          target: { ...initialHand.winningTileProvenance.target },
        }
      : undefined,
  );
  const [winningEventEvidence, setWinningEventEvidence] = useState<WinningEventEvidence | undefined>(
    initialHand?.winningEventEvidence ? { ...initialHand.winningEventEvidence } : undefined
  );
  const [discardAnswer, setDiscardAnswer] = useState<'yes' | 'no' | 'unsure' | null>(
    initialHand?.winningEventEvidence?.type === 'discard' ? 'yes' : null
  );
  const [replacementAnswer, setReplacementAnswer] = useState<'yes' | 'no' | 'unsure' | null>(
    initialHand?.winningEventEvidence?.type === 'replacement-chain' ? 'yes' : null
  );
  const [mcrWinSource, setMcrWinSource] = useState<McrWinSource | undefined>(context?.mcr?.winSource);
  const [mcrResolvedWinEvent, setMcrResolvedWinEvent] = useState<McrResolvedWinEvent | undefined>(context?.mcr?.acceptedScore?.input.context.resolvedWinEvent);
  const [mcrLastVisibleCopy, setMcrLastVisibleCopy] = useState<boolean | undefined>(context?.mcr?.acceptedScore?.input.context.lastVisibleCopy);
  const [mcrSeatWind, setMcrSeatWind] = useState<McrWind | undefined>(context?.mcr?.lockedTableContext ? context.playerWind : undefined);
  const [mcrPrevailingWind, setMcrPrevailingWind] = useState<McrWind | undefined>(context?.mcr?.lockedTableContext ? context.prevailingWind : undefined);
  const lockedMcrContext = !!context?.mcr?.lockedTableContext;
  const classicalWinnerRef = useRef(initialContext.isWinner);
  const standaloneWasMcrRef = useRef(initialIsMcr);

  const availableWinningMethods = useMemo(() => {
    const baseMethods: { value: WinningMethod; label: string }[] = [
      { value: 'wall', label: 'Self-drawn from wall' },
      { value: 'discard', label: 'From discard' },
      { value: 'loose-tile', label: 'Replacement (loose) tile' },
      { value: 'last-wall-tile', label: 'Last wall tile' },
      { value: 'final-discard', label: 'Final discard' },
      { value: 'robbing-kong', label: 'Robbing a Kong' },
    ];
    if (playerWind === 'east') {
      baseMethods.unshift({ value: 'initial-deal', label: 'Mah Jong in original deal' });
    }
    return baseMethods;
  }, [playerWind]);

  const [selectedSet, setSelectedSet] = useState<string>(initialHand ? 'set-working' : 'set-1');
  const [remainingTilesExpanded, setRemainingTilesExpanded] = useState(false);
  const [activeSuit, setActiveSuit] = useState<string>('characters');
  const [showAllTiles, setShowAllTiles] = useState(false);
  const [structuredFamily, setStructuredFamily] = useState<'characters' | 'bamboo' | 'circles' | 'wind' | 'dragon'>('characters');
  const [structuredValue, setStructuredValue] = useState<string>('1');
  const [remainingStructuredFamily, setRemainingStructuredFamily] = useState<'characters' | 'bamboo' | 'circles' | 'wind' | 'dragon'>('characters');
  const [remainingStructuredValue, setRemainingStructuredValue] = useState<string>('1');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const practiceTarget = practice ? scoringExampleById(example?.id) : undefined;
  const initialBaseline = useMemo(() => handScorerInitialBaseline(initialHand, {
    playerWind: initialContext.playerWind, prevailingWind: initialContext.prevailingWind, limit: initialContext.limit,
    isWinner: initialIsMcr || initialContext.isWinner, winningMethod: initialHand?.winningMethod ?? (practice ? practiceContext.winningMethod : 'wall'),
    originalCall: initialContext.isWinner ? initialHand?.originalCall ?? (practice ? practiceContext.originalCall : false) : false,
  }), [context, example, practice]);
  const hasUnsavedWork = !hasContext && hasHandScorerUnsavedWork({ sets, layoutMode, looseTiles, remainingTiles, ungroupedBlankTiles, flowers, seasons, playerWind, prevailingWind, limit, isWinner, winningMethod, originalCall, winningTileProvenance, winningEventEvidence }, initialBaseline);
  const leaveHand = () => {
    if (hasUnsavedWork && !window.confirm('Leave this hand? The hand details you entered will be discarded.')) return;
    if (example) { window.location.assign(example.returnHref); return; }
    onClose();
  };
  const navigateAway = (href: string) => {
    if (hasUnsavedWork && !window.confirm('Leave this hand? The hand details you entered will be discarded.')) return false;
    window.location.assign(href);
    return false;
  };

  const activeSet = sets.find(s => s.id === selectedSet);
  const numberOfKongs =
    layoutMode === 'sets'
      ? sets.filter((set) => set.kind === 'kong' && set.tile !== null).length
      : 0;
  const winningEventCandidate = {
    isWinner,
    playerWind,
    winningMethod: isWinner ? winningMethod : undefined,
    completedKongs: numberOfKongs,
  };
  const shouldAskFirstDiscard =
    isFirstDiscardEvidenceCandidate(winningEventCandidate);
  const shouldAskReplacementSequence =
    isReplacementSequenceEvidenceCandidate(winningEventCandidate);
  const effectiveWinningEventEvidence =
    isWinningEventEvidenceCompatible(
      winningEventEvidence,
      winningEventCandidate,
    )
      ? winningEventEvidence
      : undefined;

  useEffect(() => {
    const nextPracticeContext = practiceScorerContext(example);
    const nextContext = practice ? nextPracticeContext : handScorerLocalContext(context, standaloneRulesProfile);
    const savedHand = handForScorerMode(context, example, !!practice);
    const nextSets = savedHand
      ? [...savedHand.sets.map((handSet) => ({ ...handSet })), { id: 'set-working', kind: 'pung' as const, visibility: 'concealed' as const, tile: null }]
      : defaultSets.map((handSet) => ({ ...handSet }));

    setSets(nextSets);
    setLayoutMode(savedHand?.looseTiles?.length ? 'special' : 'sets');
    setLooseTiles(savedHand?.looseTiles?.map((tile) => ({ ...tile })) ?? []);
    setRemainingTiles(
      savedHand?.remainingTiles?.map((tile) => ({ ...tile })) ?? [],
    );
    setUngroupedBlankTiles(
      savedHand?.ungroupedBlankTiles?.map((blank) => ({ ...blank })) ?? [],
    );
    setFlowers(
      savedHand?.bonusTiles
        .filter((tile) => tile.family === 'flower')
        .map((tile) => tile.number) ?? [],
    );
    setSeasons(
      savedHand?.bonusTiles
        .filter((tile) => tile.family === 'season')
        .map((tile) => tile.number) ?? [],
    );
    setPlayerWind(nextContext.playerWind);
    setPrevailingWind(nextContext.prevailingWind);
    setLimit(nextContext.limit);
    setHandMode(nextContext.handMode);
    setIsWinner(nextContext.isWinner);
    setWinningMethod(savedHand?.winningMethod ?? (practice ? nextPracticeContext.winningMethod : 'wall'));
    setOriginalCall(
      nextContext.isWinner ? savedHand?.originalCall ?? (practice ? nextPracticeContext.originalCall : false) : false,
    );
    setStandingHand(savedHand?.classicalEvidence?.standingHand ?? false);
    setOnlyPossibleWinningTile(savedHand?.classicalEvidence?.onlyPossibleWinningTile ?? false);
    setEastThirteenthConsecutiveMahjong(('eastThirteenthConsecutiveMahjong' in nextContext ? nextContext.eastThirteenthConsecutiveMahjong : undefined) ?? false);
    setWinningTileProvenance(
      savedHand?.winningTileProvenance
        ? {
            tile: { ...savedHand.winningTileProvenance.tile },
            target: { ...savedHand.winningTileProvenance.target },
          }
        : undefined,
    );
    setWinningEventEvidence(
      savedHand?.winningEventEvidence ? { ...savedHand.winningEventEvidence } : undefined
    );
    setDiscardAnswer(
      savedHand?.winningEventEvidence?.type === 'discard' ? 'yes' : null
    );
    setReplacementAnswer(
      savedHand?.winningEventEvidence?.type === 'replacement-chain' ? 'yes' : null
    );
    setSelectedSet(savedHand ? 'set-working' : nextSets[0]?.id ?? '');
    setRemainingTilesExpanded(false);
    setExpandedRule(null);
    setCopied(false);
  }, [context, example, practice]);

  useEffect(() => {
    if (hasContext || practice) return;
    const profileChanged = standaloneProfileRef.current.id !== standaloneRulesProfile.id
      || standaloneProfileRef.current.version !== standaloneRulesProfile.version;
    standaloneProfileRef.current = standaloneRulesProfile;
    if (!profileChanged) return;

    const compiled = getCurrentCompiledRulesRuntime(standaloneRulesProfile);
    const nextIsMcr = compiled.grammar === 'pattern-accumulator' && compiled.artifact.profile.identity.familyId === 'family.mcr';
    const supportsGoulash = compiled.grammar === 'classical-points-doubles' && compiled.runtime.supportedCapabilities().includes('hand.goulash');
    const transition = transitionStandaloneHandProfile({
      shared: { sets, layoutMode, looseTiles, flowers, seasons, winningTileProvenance },
      classical: { handMode, ungroupedBlankTiles, standingHand, onlyPossibleWinningTile, eastThirteenthConsecutiveMahjong, originalCall, winningMethod, winningEventEvidence, discardAnswer, replacementAnswer },
      mcr: { winSource: mcrWinSource, resolvedWinEvent: mcrResolvedWinEvent, lastVisibleCopy: mcrLastVisibleCopy, seatWind: mcrSeatWind, prevailingWind: mcrPrevailingWind },
      currentWinner: isWinner, savedClassicalWinner: classicalWinnerRef.current, wasMcr: standaloneWasMcrRef.current,
      nextIsMcr, supportsGoulash,
    });
    classicalWinnerRef.current = transition.savedClassicalWinner;
    standaloneWasMcrRef.current = transition.wasMcr;
    setSets(transition.shared.sets);
    setIsWinner(transition.isWinner);
    setHandMode(transition.classical.handMode);
    setUngroupedBlankTiles(transition.classical.ungroupedBlankTiles);
    setStandingHand(transition.classical.standingHand);
    setOnlyPossibleWinningTile(transition.classical.onlyPossibleWinningTile);
    setEastThirteenthConsecutiveMahjong(transition.classical.eastThirteenthConsecutiveMahjong);
    setOriginalCall(transition.classical.originalCall);
    setWinningMethod(transition.classical.winningMethod);
    setWinningEventEvidence(transition.classical.winningEventEvidence);
    setDiscardAnswer(transition.classical.discardAnswer);
    setReplacementAnswer(transition.classical.replacementAnswer);
    setMcrWinSource(context?.mcr?.winSource ?? transition.mcr.winSource); setMcrResolvedWinEvent(context?.mcr?.acceptedScore ? context.mcr.acceptedScore.input.context.resolvedWinEvent : transition.mcr.resolvedWinEvent); setMcrLastVisibleCopy(context?.mcr?.acceptedScore ? context.mcr.acceptedScore.input.context.lastVisibleCopy : transition.mcr.lastVisibleCopy); setMcrSeatWind(context?.mcr?.lockedTableContext ? context.playerWind : transition.mcr.seatWind); setMcrPrevailingWind(context?.mcr?.lockedTableContext ? context.prevailingWind : transition.mcr.prevailingWind);
    if (compiled.grammar === 'classical-points-doubles') setLimit(compiled.runtime.defaultTableLimit);
  }, [hasContext, practice, standaloneRulesProfile]);

  const activeProfile = context?.rulesProfile ?? standaloneRulesProfile;
  const compiledRuntime = useMemo(() => getCurrentCompiledRulesRuntime(activeProfile), [activeProfile]);
  const isMcr = compiledRuntime.grammar === 'pattern-accumulator'
    && compiledRuntime.artifact.profile.identity.familyId === 'family.mcr';

  const hand = useMemo<MahjongHand>(() => {
    const validSets = sets.filter((s): s is HandSet => s.tile !== null);
    return {
      sets: layoutMode === 'sets' ? validSets : [],
      looseTiles: layoutMode === 'special' ? looseTiles : undefined,
      remainingTiles:
        !isWinner && layoutMode === 'sets' ? remainingTiles : undefined,
      ungroupedBlankTiles:
        ungroupedBlankTiles.length > 0
          ? applicableUngroupedBlanks(ungroupedBlankTiles, layoutMode, isWinner)
          : undefined,
      bonusTiles: [
        ...flowers.map(n => bonus('flower', n as BonusTile['number'])),
        ...seasons.map(n => bonus('season', n as BonusTile['number']))
      ],
      isWinner,
      winningMethod: isWinner ? winningMethod : undefined,
      winningTileProvenance: isWinner && winningMethod !== 'initial-deal' ? winningTileProvenance : undefined,
      winningEventEvidence: effectiveWinningEventEvidence,
      originalCall: isWinner ? originalCall : false,
      classicalEvidence: standingHand || onlyPossibleWinningTile ? { standingHand, onlyPossibleWinningTile } : undefined,
    };
  }, [sets, looseTiles, remainingTiles, ungroupedBlankTiles, layoutMode, flowers, seasons, isWinner, winningMethod, originalCall, standingHand, onlyPossibleWinningTile, winningTileProvenance, effectiveWinningEventEvidence]);

  useEffect(() => {
    if (isMcr) return;
    if (winningTileProvenance) {
      const validSets = sets.filter((s): s is HandSet => s.tile !== null);
      const tempHand: MahjongHand = {
        sets: layoutMode === 'sets' ? validSets : [],
        looseTiles: layoutMode === 'special' ? looseTiles : undefined,
        bonusTiles: [],
        isWinner,
        winningMethod: isWinner ? winningMethod : undefined,
        originalCall: isWinner ? originalCall : false,
        winningTileProvenance,
      };
      if (!resolveWinningTileProvenance(tempHand)) {
        setWinningTileProvenance(undefined);
      }
    }
  }, [sets, looseTiles, layoutMode, isWinner, winningMethod, winningTileProvenance, isMcr]);

  useEffect(() => {
    if (playerWind !== 'east' && winningMethod === 'initial-deal') {
      setWinningMethod('wall');
    }
  }, [playerWind, winningMethod]);

  useEffect(() => {
    if (winningMethod === 'initial-deal') {
      setWinningTileProvenance(undefined);
    }
  }, [winningMethod]);

  useEffect(() => {
    setWinningEventEvidence((current) => {
      if (!current) return current;
      if (!isWinner) return undefined;

      if (current.type === 'discard') {
        if (playerWind === 'east' || winningMethod !== 'discard') return undefined;
      }
      if (current.type === 'replacement-chain') {
        if (winningMethod !== 'loose-tile' || numberOfKongs < 2) return undefined;
      }
      return current;
    });
  }, [isWinner, playerWind, winningMethod, numberOfKongs]);

  useEffect(() => {
    if (!isWinner || playerWind === 'east' || winningMethod !== 'discard') {
      setDiscardAnswer(null);
    }
  }, [isWinner, playerWind, winningMethod]);

  useEffect(() => {
    if (!isWinner || winningMethod !== 'loose-tile' || numberOfKongs < 2) {
      setReplacementAnswer(null);
    }
  }, [isWinner, winningMethod, numberOfKongs]);

  const gameContext = useMemo<GameContext>(
    () => ({ playerWind, prevailingWind, limit: limit as number, handMode, eastThirteenthConsecutiveMahjong }),
    [handMode, limit, playerWind, prevailingWind, eastThirteenthConsecutiveMahjong],
  );

  const scoringRuntime = compiledRuntime.grammar === 'classical-points-doubles' ? compiledRuntime.runtime : undefined;

  const isStructureComplete = useMemo(() => {
    if (!isWinner) return false;
    const tempHand: MahjongHand = {
      ...hand,
      winningMethod: 'wall',
      winningTileProvenance: undefined,
    };
    const represented = layoutMode === 'sets' ? sets.filter((item) => item.tile && item.kind === 'kong').length : 0;
    const physical = layoutMode === 'special' ? looseTiles.length : sets.filter((item) => item.tile).flatMap((item) => expandedTiles(item as HandSet)).length + (!isWinner ? remainingTiles.length : 0);
    return scoringRuntime ? scoringRuntime.validateHand({ evidence: tempHand, context: gameContext }).length === 0 : physical - represented === 14;
  }, [hand, isWinner, gameContext, scoringRuntime, layoutMode, sets, looseTiles, remainingTiles]);

  const score = useMemo(
    () => scoringRuntime ? mapCurrentClassicalScoreBreakdown(scoringRuntime.scoreHand({ evidence: hand, context: gameContext })) : undefined,
    [gameContext, hand, scoringRuntime],
  );
  const mcrPass = useMemo(() => {
    if (!isMcr || compiledRuntime.grammar !== 'pattern-accumulator' || !mcrWinSource || !mcrResolvedWinEvent) return undefined;
    const adapted = toMcrScoringInput(hand, { winSource: mcrWinSource, resolvedWinEvent: mcrResolvedWinEvent, lastVisibleCopy: mcrLastVisibleCopy, seatWind: mcrSeatWind, prevailingWind: mcrPrevailingWind });
    if (adapted.kind !== 'ready') return undefined;
    const result = compiledRuntime.runtime.scoreHand(adapted.input);
    return { input: adapted.input, result, view: presentMcrScore(result) };
  }, [compiledRuntime, hand, isMcr, mcrLastVisibleCopy, mcrPrevailingWind, mcrResolvedWinEvent, mcrSeatWind, mcrWinSource]);
  const mcrResult = mcrPass?.view;
  const mcrCanApply = !!(lockedMcrContext && context && mcrPass && mcrPass.view.kind === 'scored' && mcrPass.result.grammar === 'pattern-accumulator' && mcrPass.result.legal && mcrPass.result.disposition.kind === 'scored' && mcrPass.result.result.unit === 'points' && Number.isInteger(mcrPass.result.result.total) && mcrPass.result.result.total === mcrPass.view.basicPoints && mcrPass.input.context.winSource === context.mcr?.winSource && mcrPass.input.context.seatWind === context.playerWind && mcrPass.input.context.prevailingWind === context.prevailingWind);
  const patterns = useMemo(() => score ? detectedPatterns(score) : [], [score]);

  const enteredSets = sets.filter((s): s is HandSet => s.tile !== null);
  const representedKongs =
    layoutMode === 'sets'
      ? enteredSets.filter((handSet) => handSet.kind === 'kong').length
      : 0;
  const physicalTileCount =
    layoutMode === 'special'
      ? looseTiles.length
      : enteredSets.flatMap(expandedTiles).length +
        (!isWinner ? remainingTiles.length : 0);
  const structuralTileCount = physicalTileCount - representedKongs;
  const structuralTarget = isWinner ? 14 : 13;
  const tileProgressLabel = `${structuralTileCount}/${structuralTarget} hand tiles${
    representedKongs > 0
      ? ` · ${physicalTileCount} physical with ${representedKongs} ${representedKongs === 1 ? 'Kong' : 'Kongs'}`
      : ''
  }`;

  function updateSet(id: string, updates: Partial<UIHandSet>) {
    if ('kind' in updates || 'tile' in updates) {
      setWinningTileProvenance(undefined);
    }
    setSets((current) => {
      if (
        updates.kind === 'chow' &&
        current.some((handSet) => handSet.id !== id && handSet.kind === 'chow')
      ) {
        return current;
      }
      return current.map((s) => s.id === id ? { ...s, ...updates } : s);
    });
  }
  function removeSet(id: string) {
    setWinningTileProvenance(undefined);
    setSets((current) => {
      const newSets = current.filter(s => s.id !== id);
      if (selectedSet === id) {
        const recovered = recoverWorkingDraft(newSets, () => ({ id: `set-${Date.now()}`, kind: 'pung' as const, visibility: 'concealed' as const, tile: null }));
        setSelectedSet(recovered.draftId);
        return recovered.sets;
      }
      return newSets;
    });
  }
  function startNormalGroup() {
    const draftId = `set-${Date.now()}`;
    setSets((current) => {
      const recovered = recoverWorkingDraft(current, () => ({ id: draftId, kind: 'pung' as const, visibility: 'concealed' as const, tile: null }));
      setSelectedSet(recovered.draftId);
      return recovered.sets;
    });
  }
  function editSet(id: string) {
    // There is deliberately only one editable group. Reuse it when revisiting
    // evidence, and discard the unused next-group draft while it is open.
    const set = sets.find((handSet) => handSet.id === id);
    if (set?.tile) {
      if (set.tile.family === 'suit') {
        setStructuredFamily(set.tile.suit);
        setStructuredValue(String(set.tile.rank));
      } else if (set.tile.family === 'wind') {
        setStructuredFamily('wind');
        setStructuredValue(set.tile.wind);
      } else {
        setStructuredFamily('dragon');
        setStructuredValue(set.tile.dragon);
      }
    }
    setSets((current) => current.filter((handSet) => handSet.tile !== null || handSet.id === id));
    setSelectedSet(id);
  }
  function toggleUngroupedBlank(location: UngroupedBlankTile['location'], tileIndex: number) {
    setUngroupedBlankTiles((current) => {
      return toggleUngroupedBlankAt(
        current,
        location,
        tileIndex,
        `blank-${location}-${tileIndex}-${Date.now()}`,
      );
    });
  }
  function removeUngroupedTile(location: UngroupedBlankTile['location'], tileIndex: number) {
    setWinningTileProvenance(undefined);
    if (location === 'loose') {
      setLooseTiles((current) => current.filter((_, index) => index !== tileIndex));
    } else {
      setRemainingTiles((current) => current.filter((_, index) => index !== tileIndex));
    }
    setUngroupedBlankTiles((current) =>
      reindexUngroupedBlanksAfterRemoval(current, location, tileIndex),
    );
  }
  function isUngroupedBlank(location: UngroupedBlankTile['location'], tileIndex: number) {
    return hasUngroupedBlankAt(ungroupedBlankTiles, location, tileIndex);
  }
  function addTile(tile: PlayingTile, destination = selectedSet) {
    if (layoutMode === 'special') {
      const matchingCopies = looseTiles.filter(
        (candidate) => tileKey(candidate) === tileKey(tile),
      ).length;
      const specialTileLimit = isWinner ? 14 : 13;
      const possibleBlankSlots = 4 - ungroupedBlankTiles.length;
      const maximumEffectiveCopies = handMode === 'goulash'
        ? 4 + possibleBlankSlots
        : 4;
      if (looseTiles.length < specialTileLimit && matchingCopies < maximumEffectiveCopies) {
        setWinningTileProvenance(undefined);
        setLooseTiles((current) => [...current, tile]);
      }
      return;
    }
    if (!canAddStandardTile(tile, destination)) return;
    if (!isWinner && destination === 'remaining-tiles') {
      setRemainingTiles((current) => [...current, tile]);
      return;
    }
    if (!selectedSet) return;
    const selected = sets.find((handSet) => handSet.id === destination);
    if (!selected) return;
    const nextId = `set-${Date.now()}`;
    // A normal set is confirmed by its representative tile. Immediately make a
    // fresh draft so the one picker is ready for the next group in the same place.
    setWinningTileProvenance(undefined);
    setSets((current) => [
      ...current.map((handSet) => handSet.id === destination ? { ...handSet, tile } : handSet),
      { id: nextId, kind: 'pung', visibility: 'concealed', tile: null },
    ]);
    setSelectedSet(nextId);
  }
  function canAddStandardTile(tile: PlayingTile, destination = selectedSet): boolean {
    if (layoutMode !== 'sets') return false;
    let candidateSets = enteredSets;
    let candidateRemaining = !isWinner ? remainingTiles : [];

    if (!isWinner && destination === 'remaining-tiles') {
      candidateRemaining = [...candidateRemaining, tile];
    } else {
      const selected = sets.find((handSet) => handSet.id === destination);
      if (!selected) return false;
      candidateSets = [
        ...enteredSets.filter((handSet) => handSet.id !== selected.id),
        { ...selected, tile },
      ];
    }

    const candidatePhysicalTiles = [
      ...candidateSets.flatMap(expandedTiles),
      ...candidateRemaining,
    ];
    const candidateStructuralCount =
      candidatePhysicalTiles.length -
      candidateSets.filter((handSet) => handSet.kind === 'kong').length;
    if (candidateStructuralCount > structuralTarget) return false;

    const tally = new Map<string, number>();
    for (const candidate of candidatePhysicalTiles) {
      const key = tileKey(candidate);
      const count = (tally.get(key) ?? 0) + 1;
      if (count > 4) return false;
      tally.set(key, count);
    }
    return true;
  }
  function clearHand() {
    setSets([{ id: 'set-1', kind: 'pung', visibility: 'concealed', tile: null }]);
    setFlowers([]);
    setSeasons([]);
    setLooseTiles([]);
    setRemainingTiles([]);
    setUngroupedBlankTiles([]);
    setWinningTileProvenance(undefined);
    setWinningEventEvidence(undefined);
    setDiscardAnswer(null);
    setReplacementAnswer(null);
    setIsWinner(context?.isWinner ?? false);
    setSelectedSet('set-1');
  }
  function loadExample() {
    setLayoutMode('sets');
    setWinningTileProvenance(undefined);
    setWinningEventEvidence(undefined);
    setDiscardAnswer(null);
    setReplacementAnswer(null);
    const exampleIsWinner = context?.isWinner ?? true;
    const exampleSets: UIHandSet[] = [
      { id: 'set-1', kind: 'chow', visibility: 'concealed', tile: suited('bamboo', 1) },
      { id: 'set-2', kind: 'pung', visibility: 'exposed', tile: suited('circles', 9) },
      { id: 'set-3', kind: 'pung', visibility: 'exposed', tile: suited('characters', 7) },
      { id: 'set-4', kind: 'pung', visibility: 'concealed', tile: wind('east') },
      { id: 'set-5', kind: 'pair', visibility: 'concealed', tile: dragon('red') },
    ];
    setSets([
      ...(exampleIsWinner ? exampleSets : exampleSets.slice(0, 4)),
      { id: 'set-working', kind: 'pung', visibility: 'concealed', tile: null },
    ]);
    setRemainingTiles(
      exampleIsWinner
        ? []
        : [suited('bamboo', 9)],
    );
    setUngroupedBlankTiles([]);
    setFlowers([1, 4]);
    setSeasons([]);
    setIsWinner(exampleIsWinner);
    setWinningMethod('wall');
    setOriginalCall(false);
    setSelectedSet(exampleIsWinner ? 'set-1' : 'set-working');
    setRemainingTilesExpanded(false);
  }
  function toggleBonus(kind: 'flower' | 'season', num: number) {
    if (kind === 'flower') {
      setFlowers(current => current.includes(num) ? current.filter(n => n !== num) : [...current, num]);
    } else {
      setSeasons(current => current.includes(num) ? current.filter(n => n !== num) : [...current, num]);
    }
  }
  function copyScore() {
    if (!score) return;
    navigator.clipboard?.writeText(`${playerWind} Player: ${score!.finalScore} points (${score!.basePoints} base, ${score!.doubles} doubles)`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function applyScore() {
    if (isMcr || !context || example || !score?.valid) return;
      onClose({
      grammar: 'classical-points-doubles',
      playerId: context.playerId,
      score: score!.finalScore,
      isWinner,
      detailedHand: {
        source: 'detailed-scorer',
        hand: {
          ...hand,
          sets: hand.sets.map((handSet) => ({
            ...handSet,
            tile: { ...handSet.tile },
          })),
          bonusTiles: hand.bonusTiles.map((tile) => ({ ...tile })),
          looseTiles: hand.looseTiles?.map((tile) => ({ ...tile })),
          remainingTiles: hand.remainingTiles?.map((tile) => ({ ...tile })),
          ungroupedBlankTiles: hand.ungroupedBlankTiles?.map((blank) => ({ ...blank })),
          winningTileProvenance: hand.winningTileProvenance
            ? {
                tile: { ...hand.winningTileProvenance.tile },
                target: { ...hand.winningTileProvenance.target },
              }
            : undefined,
          winningEventEvidence: hand.winningEventEvidence
            ? { ...hand.winningEventEvidence }
            : undefined,
        },
        context: { ...gameContext },
        breakdown: score,
        finalScore: score!.finalScore,
      },
    });
  }
  function applyMcrScore() {
    if (!context || !lockedMcrContext || !mcrPass || mcrPass.view.kind !== 'scored' || mcrPass.result.disposition.kind !== 'scored' || mcrPass.result.result.total !== mcrPass.view.basicPoints) return;
    onClose(buildMcrHandScorerResult(context, hand, mcrPass.input, mcrPass.result));
  }

  const visibleTilesFor = (destination = selectedSet) => allPlayingTiles.filter(tile => {
    if (!showAllTiles) {
      if (activeSuit === 'characters' || activeSuit === 'bamboo' || activeSuit === 'circles') {
        if (tile.family !== 'suit' || tile.suit !== activeSuit) return false;
      } else if (activeSuit === 'wind') {
        if (tile.family !== 'wind') return false;
      } else if (activeSuit === 'dragon') {
        if (tile.family !== 'dragon') return false;
      }
    }
    if (layoutMode === 'sets' && destination !== 'remaining-tiles' && activeSet?.kind === 'chow') {
      if (tile.family !== 'suit') return false;
      if (tile.rank > 7) return false;
    }
    return true;
  });
  const visibleTiles = visibleTilesFor();

  const tileIsDisabled = (tile: PlayingTile, destination = selectedSet) =>
    (layoutMode === 'special' &&
      (looseTiles.length >= (isWinner ? 14 : 13) ||
        looseTiles.filter((candidate) => tileKey(candidate) === tileKey(tile)).length >=
          (handMode === 'goulash'
            ? 4 + (4 - ungroupedBlankTiles.length)
            : 4))) ||
    (layoutMode === 'sets' && !canAddStandardTile(tile, destination));

  const structuredValues = structuredFamily === 'wind'
    ? ['east', 'south', 'west', 'north']
    : structuredFamily === 'dragon'
      ? ['red', 'green', 'white']
      : Array.from({ length: activeSet?.kind === 'chow' ? 7 : 9 }, (_, index) => String(index + 1));
  const structuredTile = useMemo<PlayingTile | null>(() => {
    if (activeSet?.kind === 'chow' && (structuredFamily === 'wind' || structuredFamily === 'dragon')) return null;
    if (structuredFamily === 'wind') return wind(structuredValue as Wind);
    if (structuredFamily === 'dragon') return dragon(structuredValue as 'red' | 'green' | 'white');
    const rank = Number(structuredValue);
    return rank >= 1 && rank <= (activeSet?.kind === 'chow' ? 7 : 9)
      ? suited(structuredFamily, rank as SuitTile['rank'])
      : null;
  }, [activeSet?.kind, structuredFamily, structuredValue]);
  const remainingStructuredValues = remainingStructuredFamily === 'wind'
    ? ['east', 'south', 'west', 'north']
    : remainingStructuredFamily === 'dragon'
      ? ['red', 'green', 'white']
      : Array.from({ length: 9 }, (_, index) => String(index + 1));
  const remainingStructuredTile = useMemo<PlayingTile | null>(() => {
    if (remainingStructuredFamily === 'wind') return wind(remainingStructuredValue as Wind);
    if (remainingStructuredFamily === 'dragon') return dragon(remainingStructuredValue as 'red' | 'green' | 'white');
    const rank = Number(remainingStructuredValue);
    return rank >= 1 && rank <= 9 ? suited(remainingStructuredFamily, rank as SuitTile['rank']) : null;
  }, [remainingStructuredFamily, remainingStructuredValue]);

  const mobileDestinationLabel = (destination: string) => (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="font-serif text-[18px] text-[#284d45]">Choose a tile</h3>
      <span className="text-right font-mono text-[10px] text-[#ae6249]">{destination}</span>
    </div>
  );

  const renderMobileTilePicker = (destination: string, tileDestination = selectedSet) => (
    <div className="mt-3 rounded-md border border-[#d8ceb8] bg-[#f8f4e9] p-3 sm:hidden" data-testid="mobile-tile-picker">
      {mobileDestinationLabel(destination)}
      <div className="flex gap-1 overflow-x-auto border-b border-[#e2d9c7] pb-2">
        {suitOrder.map((suit) => (
          <button
            type="button"
            key={suit}
            data-testid={`mobile-button-suit-${suit}`}
            onClick={() => { setActiveSuit(suit); setShowAllTiles(false); }}
            className={`shrink-0 rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.12em] transition ${activeSuit === suit && !showAllTiles ? 'bg-[#284d45] text-[#f8f4e9]' : 'text-[#7a7769] hover:bg-[#eee6d5]'}`}
          >
            {suitNames[suit]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {visibleTilesFor(tileDestination).map((tile) => (
          <button
            type="button"
            key={tileKey(tile)}
            data-testid={`mobile-button-add-tile-${tileKey(tile)}`}
            aria-label={`Add ${tileName(tile)}`}
            onClick={() => addTile(tile, tileDestination)}
            disabled={tileIsDisabled(tile, tileDestination)}
            className="shrink-0 rounded-[7px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <TileFace tile={tile} compact />
          </button>
        ))}
        {visibleTilesFor(tileDestination).length === 0 && <div className="py-3 text-[11px] text-[#7a7769]">No valid tiles for this set type.</div>}
      </div>
    </div>
  );

  const mobileLiveResult = isMcr
    ? <details data-testid="mobile-live-result" className="mt-3 rounded-md border border-[#b8cdbf] bg-[#edf3ed] px-3 py-2 sm:hidden"><summary className="cursor-pointer text-[11px] font-semibold text-[#284d45]">{mcrResult?.kind === 'scored' ? `${mcrResult.basicPoints} Basic Points` : mcrResult?.kind === 'not-qualifying' ? 'Not qualifying' : 'MCR evidence needed'}</summary><div className="mt-2 text-[10px]">Fan · qualifying subtotal · Flowers · Basic Points</div></details>
    : score && <details data-testid="mobile-live-result" className="mt-3 rounded-md border border-[#b8cdbf] bg-[#edf3ed] px-3 py-2 sm:hidden"><summary className="cursor-pointer text-[11px] font-semibold text-[#284d45]">{score.valid ? `${score.finalScore} pts · ${score.basePoints} base · ${score.doubles} doubles${score.evidenceCompleteness === 'partial' ? ' · Partial evidence' : ''}` : structuralTileCount === structuralTarget && score.validationErrors[0] ? score.validationErrors[0] : tileProgressLabel}</summary><div className="mt-2 text-[10px] leading-4 text-[#66746e]">{score.valid ? score.evidenceCompleteness === 'partial' ? 'Score from entered evidence; add remaining tiles for whole-hand checks.' : 'Open for the full score breakdown below.' : 'Keep adding or correcting evidence; partial hands remain supported.'}</div>{hasContext && score.valid && <button type="button" data-testid="button-apply-score-compact" onClick={applyScore} className="mt-2 rounded bg-[#284d45] px-3 py-2 text-[11px] font-semibold text-[#f8f4e9]">Apply {score.finalScore} to {context.playerName}</button>}</details>;

  return (
    <div className="mahjong-shell">
      <SiteHeader onNavigate={navigateAway} />

      <main className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-6 px-5 py-7 lg:px-8 lg:py-9">
        <section className="min-w-0">
          <div className="mb-7 animate-rise">
            {example && <>
              <a data-testid="link-back-to-example" href={example.returnHref} className="mb-4 inline-flex min-h-10 items-center rounded-md border border-[#b8cdbf] bg-[#edf3ed] px-3 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#dceade]">{example.returnLabel} · {example.name}</a>
              <p className="mb-3 text-[11px] leading-5 text-[#66746e]">{practice ? 'Build this hand yourself with the normal scorer. The target is shown below; the worked result stays hidden until you ask for it.' : 'Example hand — change tiles or context to explore.'} Your saved game, if any, remains separate.</p>
              <ReturnToGame />
              {practiceTarget && <section className="mb-5 rounded-xl border border-[#d8ceb8] bg-[#f5f1e6] p-4" data-testid="practice-target"><div className="font-mono text-[9px] uppercase tracking-[.16em] text-[#ae6249]">Build this hand yourself</div><p className="mt-2 text-[11px] leading-5 text-[#66746e]">Target: {practiceTarget.hand.isWinner ? 'winner' : 'non-winner'} · {practiceTarget.hand.winningMethod ?? 'wall'} · {practiceTarget.context.playerWind} player · {practiceTarget.context.prevailingWind} prevailing · limit {practiceTarget.context.limit}. Your tiles and bonus selections begin empty.</p>{practiceTarget.hand.sets.length > 0 && <ul className="mt-3 space-y-1 text-[11px] text-[#284d45]" aria-label="Target set structure">{practiceSetSummary(practiceTarget).map((set) => <li key={set.id} className="rounded bg-[#eee6d5] px-2 py-1.5"><b>{set.label}</b> · {set.visibility}</li>)}</ul>}<div className="mt-3"><TileStrip tiles={scoringExampleTiles(practiceTarget)} ariaLabel={`Target tiles for ${practiceTarget.title}`} /></div>{scoringExampleBonusTiles(practiceTarget).length > 0 && <div className="mt-3"><div className="font-mono text-[9px] uppercase tracking-[.14em] text-[#ae6249]">Bonus tiles</div><TileStrip tiles={scoringExampleBonusTiles(practiceTarget)} ariaLabel={`Bonus tiles for ${practiceTarget.title}`} /></div>}<button type="button" data-testid="button-reveal-practice-answer" onClick={() => setShowPracticeAnswer(true)} className="mt-3 min-h-10 rounded-md border border-[#c9b99d] bg-[#fdfbf5] px-3 text-[11px] font-semibold">{showPracticeAnswer ? `Worked answer: ${practiceTarget.expected.finalScore} points` : 'Reveal worked answer'}</button>{showPracticeAnswer && <p className="mt-2 text-[11px] leading-5 text-[#66746e]">{practiceTarget.explanation}</p>}</section>}
            </>}
            <div className="mb-3 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">New hand · ready to enter</span></div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-[clamp(36px,5vw,62px)] leading-[.97] tracking-[-.03em] text-[#284d45]">{standaloneHand ? <>Mahjong<br /><span className="text-[#ae6249]">hand calculator.</span></> : <>Score a hand<br /><span className="text-[#ae6249]">with confidence.</span></>}</h1>
                <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#66746e]">
                  {example
                    ? `Example: ${example.name}. This uses the normal scorer; change it to explore.`
                    : hasContext
                    ? `Calculating ${context.playerName}’s ${context.playerWind} hand during the ${context.prevailingWind} prevailing round.`
                    : standaloneHand
                      ? isMcr ? 'Enter a completed winning hand. The MCR scorer evaluates fan, the qualifying subtotal, Flowers and Basic Points.' : 'Enter your tiles visually as they sit on the table. The calculator shows supported points, doubles, special hands and fishing in a clear score breakdown. Playing a whole game? Use the full-game tracker for settlement and running totals.'
                      : 'Enter each set as it sits on the table. The score builds beside you, with every point and double accounted for.'}
                </p>
                {hasContext ? <ActiveRules profile={context.rulesProfile} inherited /> : <ActiveRules profile={standaloneRulesProfile} />}
                {standaloneHand && !hasContext && !isMcr && <p className="mt-3 text-[15px] leading-6 text-[#66746e]">Need to see who pays whom after scoring? <a className="font-semibold underline decoration-[#ae6249] underline-offset-4" href="/mahjong-settlement">Understand settlement</a> or <a className="font-semibold underline decoration-[#ae6249] underline-offset-4" href="/game">track a full game</a>.</p>}
                {context?.requiresRecalculation && (
                  <div
                    data-testid="notice-recalculation-required"
                    className="mt-4 max-w-[560px] rounded-md border border-[#ae6249]/40 bg-[#fff4e8] px-3 py-2 text-[11px] font-semibold text-[#8a4d38]"
                  >
                    The round winner changed. Review this hand and apply it again before confirming the round.
                  </div>
                )}
                <button type="button" onClick={leaveHand} className="mt-4 rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                  {exampleExitLabel(example, hasContext ? 'Back to game without applying a score' : 'Leave hand and go home')}
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" data-testid="button-load-example" onClick={loadExample} className="flex items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#f8f4e9] px-3 py-2 text-[11px] font-semibold text-[#284d45] transition hover:-translate-y-0.5 hover:border-[#ae6249] focus:ring-2"><Sparkles size={14} /> Load example</button>
                <button type="button" data-testid="button-clear-hand" onClick={clearHand} className="flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-semibold text-[#7a7769] transition hover:bg-[#e9e3d5] focus:ring-2"><RotateCcw size={14} /> Clear</button>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-5">
            <div className="min-w-0 space-y-5">
              <section className="animate-rise animate-rise-delay-1 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6">
                <SectionLabel eyebrow="01 / hand" title="Arrange the tiles" count={tileProgressLabel} />
                {layoutMode === 'sets' ? (
                  <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#284d45]">Build with normal sets</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#7a7769]">Add chows, pungs, kongs and a pair below.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[#d8ceb8] bg-[#f7f1e3] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#284d45]">Irregular special hand</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#7a7769]">Enter each tile individually. Your normal-set entry stays available if you switch back.</p>
                    </div>
                    <button
                      type="button"
                      data-testid="button-layout-sets"
                      onClick={() => {
                        setWinningTileProvenance(undefined);
                        setLayoutMode('sets');
                      }}
                      className="shrink-0 self-start rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[10px] font-semibold text-[#66746e] transition hover:border-[#ae6249] hover:text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] sm:self-auto"
                    >
                      Back to Standard sets
                    </button>
                  </div>
                )}
                {layoutMode === 'special' ? (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold text-[#ae6249]">
                      Tap an entered tile to remove it.
                    </p>
                    <div className="flex min-h-[92px] flex-wrap items-center gap-2 rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-3">
                      {looseTiles.map((tile, index) => {
                        const isBlank = isUngroupedBlank('loose', index);
                        return (
                          <div key={`${tileKey(tile)}-${index}`} className="flex flex-col items-center gap-1">
                            <TileFace
                              tile={tile}
                              actionLabel={`Remove ${tileName(tile)} from the irregular hand`}
                              actionTestId={`button-remove-loose-tile-${index}`}
                              onActivate={() => removeUngroupedTile('loose', index)}
                            />
                            {handMode === 'goulash' && (
                              <button
                                type="button"
                                data-testid={`button-toggle-loose-blank-${index}`}
                                aria-pressed={isBlank}
                                onClick={() => toggleUngroupedBlank('loose', index)}
                                className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${isBlank ? 'bg-[#ae6249] text-white' : 'border border-[#cfc3aa] text-[#66746e]'}`}
                              >
                                {isBlank ? 'Blank' : 'Mark blank'}
                              </button>
                            )}
                            {isBlank && <span className="text-[9px] text-[#ae6249]">Blank representing {tileName(tile)}</span>}
                          </div>
                        );
                      })}
                      {looseTiles.length === 0 && (
                        <div className="w-full text-center text-[11px] text-[#9b988d]">
                          Add the {isWinner ? 14 : 13} tiles in the {isWinner ? 'completed' : 'one-tile-away'} special-hand layout.
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-[#7a7769]">
                      {isMcr ? 'Use this workspace when the physical hand does not fit the normal group layout. The MCR runtime interprets the entered tiles.' : 'Use this for irregular layouts. When fishing, enter only the tiles currently held; the scorer finds every legal completing tile.'}
                    </p>
                    {renderMobileTilePicker('Special layout')}
                    <div className="mt-3 hidden rounded-md border border-[#d8ceb8] bg-[#f8f4e9] p-3 sm:block"><div className="mb-2 flex gap-1 overflow-x-auto">{suitOrder.map((suit) => <button type="button" key={suit} data-testid={`button-suit-${suit}`} onClick={() => { setActiveSuit(suit); setShowAllTiles(false); }} className={`shrink-0 rounded px-3 py-1.5 font-mono text-[10px] uppercase ${activeSuit === suit && !showAllTiles ? 'bg-[#284d45] text-[#f8f4e9]' : 'text-[#7a7769] hover:bg-[#eee6d5]'}`}>{suitNames[suit]}</button>)}</div><div className="flex flex-wrap gap-2">{visibleTiles.map((tile) => <button type="button" key={tileKey(tile)} data-testid={`button-add-tile-${tileKey(tile)}`} aria-label={`Add ${tileName(tile)}`} onClick={() => addTile(tile)} disabled={tileIsDisabled(tile)} className="rounded-[7px] disabled:cursor-not-allowed disabled:opacity-35"><TileFace tile={tile} compact /></button>)}</div></div>
                  </div>
                ) : (
                <>
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.8fr)]">
                    <section data-testid="working-picker" className="rounded-lg border border-[#ae6249]/60 bg-[#f7f1e3] p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-2"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#ae6249]">Working picker</div><h3 className="font-serif text-[20px] text-[#284d45]">{selectedSet === 'remaining-tiles' ? 'Add remaining tiles' : 'What are you entering?'}</h3></div><span className="text-[10px] text-[#66746e]">{selectedSet === 'remaining-tiles' ? 'For a partial hand' : 'Choose details, then a tile'}</span></div>
                      {activeSet && <div className="grid grid-cols-2 gap-2">
                        <label className="text-[10px] font-semibold text-[#66746e]">Group<select aria-label="Working group type" data-testid="select-working-set-type" value={activeSet.kind} onChange={(e) => { const kind = e.target.value as SetKind; const maximumBlanks = kind === 'pung' ? 1 : kind === 'kong' || kind === 'pair' ? 2 : 0; const blankTileIds = (activeSet.blankTileIds ?? []).slice(0, maximumBlanks); const choice = normaliseStructuredChoiceForGroup(kind, structuredFamily, structuredValue); setStructuredFamily(choice.family); setStructuredValue(choice.value); updateSet(activeSet.id, { kind, tile: null, blankTileIds: blankTileIds.length ? blankTileIds : undefined }); }} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px] font-semibold text-[#284d45]"><option value="pung">Pung</option><option value="chow" disabled={handMode === 'goulash' || sets.some((other) => other.id !== activeSet.id && other.kind === 'chow')}>Chow</option><option value="kong">Kong</option><option value="pair">Pair</option></select></label>
                        <label className="text-[10px] font-semibold text-[#66746e]">Visibility<select aria-label="Working group visibility" data-testid="select-working-set-visibility" value={activeSet.visibility} onChange={(e) => updateSet(activeSet.id, { visibility: e.target.value as Visibility })} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px] font-semibold text-[#284d45]"><option value="concealed">Concealed</option><option value="exposed">Exposed</option></select></label>
                        {handMode === 'goulash' && activeSet.kind !== 'chow' && <label className="text-[10px] font-semibold text-[#66746e]">Blank tiles<select aria-label="Working group blank tiles" data-testid="select-working-set-blanks" value={activeSet.blankTileIds?.length ?? 0} onChange={(e) => { const count = Number(e.target.value); updateSet(activeSet.id, { blankTileIds: Array.from({ length: count }, (_, blankIndex) => `blank-${activeSet.id}-${blankIndex + 1}`) }); }} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px] font-semibold text-[#284d45]">{Array.from({ length: activeSet.kind === 'pung' ? 2 : 3 }, (_, count) => <option key={count} value={count}>{count} blank{count === 1 ? '' : 's'}</option>)}</select></label>}
                      </div>}
                      <div className="mt-3 sm:hidden">
                        {activeSet ? <><div className="grid grid-cols-2 gap-2"><label className="text-[10px] font-semibold text-[#66746e]">Family<select data-testid="select-working-family" value={structuredFamily} onChange={(e) => { const family = e.target.value as typeof structuredFamily; setStructuredFamily(family); setStructuredValue(family === 'wind' ? 'east' : family === 'dragon' ? 'red' : '1'); }} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px]"><option value="characters">Characters</option><option value="bamboo">Bamboo</option><option value="circles">Circles</option>{activeSet.kind !== 'chow' && <><option value="wind">Wind</option><option value="dragon">Dragon</option></>}</select></label><label className="text-[10px] font-semibold text-[#66746e]">Value<select data-testid="select-working-value" value={structuredValue} onChange={(e) => setStructuredValue(e.target.value)} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px]">{structuredValues.map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div>{structuredTile && <div className="mt-3 flex items-center justify-between rounded-md border border-[#e2d9c7] bg-[#fdfbf5] p-2"><div className="flex items-center gap-2"><TileFace tile={structuredTile} compact /><span className="text-[11px] font-semibold text-[#284d45] capitalize">{activeSet.kind} · {tileName(structuredTile)}</span></div><button type="button" data-testid="button-add-working-group" disabled={tileIsDisabled(structuredTile)} onClick={() => addTile(structuredTile)} className="rounded-md bg-[#284d45] px-3 py-2 text-[11px] font-semibold text-[#f8f4e9] disabled:opacity-40">Add group</button></div>}<details className="mt-2"><summary className="cursor-pointer text-[11px] font-semibold text-[#66746e]">Pick visually instead</summary>{renderMobileTilePicker('Confirm this group')}</details></> : <div className="rounded-md border border-dashed border-[#d7cbb5] p-3 text-[11px] text-[#7a7769]">Choose a completed group to edit, or add another normal group.</div>}
                      </div>
                      <div className="mt-3 hidden sm:block"><div className="mb-2 flex gap-1 overflow-x-auto">{suitOrder.map((suit) => <button type="button" key={suit} data-testid={`button-suit-${suit}`} onClick={() => { setActiveSuit(suit); setShowAllTiles(false); }} className={`shrink-0 rounded px-3 py-1.5 font-mono text-[10px] uppercase ${activeSuit === suit && !showAllTiles ? 'bg-[#284d45] text-[#f8f4e9]' : 'text-[#7a7769] hover:bg-[#eee6d5]'}`}>{suitNames[suit]}</button>)}</div><div className="flex flex-wrap gap-2">{visibleTiles.map((tile) => <button type="button" key={tileKey(tile)} data-testid={`button-add-tile-${tileKey(tile)}`} aria-label={`Add ${tileName(tile)}`} onClick={() => addTile(tile)} disabled={tileIsDisabled(tile)} className="rounded-[7px] disabled:cursor-not-allowed disabled:opacity-35"><TileFace tile={tile} compact /></button>)}</div></div>
                    </section>
                    <section data-testid="hand-so-far" className="rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-3 sm:p-4"><div className="mb-3 flex items-baseline justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.15em] text-[#ae6249]">Hand so far</div><h3 className="font-serif text-[20px] text-[#284d45]">Completed groups</h3></div><span className="font-mono text-[10px] text-[#66746e]">{enteredSets.length} entered</span></div><div className="space-y-2">{enteredSets.map((s) => <div key={s.id} data-testid={`card-set-${sets.findIndex((candidate) => candidate.id === s.id) + 1}`} className="flex items-center justify-between gap-2 rounded-md border border-[#e2d9c7] bg-[#fbf8ed] p-2"><button type="button" onClick={() => editSet(s.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><div className="flex shrink-0 -space-x-3">{expandedTiles(s).map((tile, i) => <span key={i} className="first:ml-0"><TileFace tile={tile} compact /></span>)}</div><span className="min-w-0 text-[11px] font-semibold capitalize text-[#284d45]">{s.kind} · {s.visibility}<span className="block text-[10px] font-normal text-[#7a7769]">Tap to edit</span></span></button><button type="button" aria-label="Remove set" onClick={() => removeSet(s.id)} className="shrink-0 text-[#ae6249]"><X size={14}/></button></div>)}{enteredSets.length === 0 && <p className="rounded-md border border-dashed border-[#d7cbb5] p-3 text-[11px] text-[#7a7769]">Your confirmed groups will collect here. The picker stays ready above.</p>}</div>{!isMcr && !isWinner && <details data-testid="remaining-tiles-disclosure" open={remainingTilesExpanded} onToggle={(event) => setRemainingTilesExpanded(event.currentTarget.open)} className="mt-3 rounded-md border border-[#d8ceb8] bg-[#fbf8ed] px-3 py-2"><summary data-testid="button-select-remaining-tiles" className="flex cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-semibold text-[#284d45]"><span>Remaining tiles <span className="font-normal text-[#66746e]">· {remainingTiles.length} entered</span></span><span className="flex min-w-0 items-center gap-1">{remainingTiles.slice(0, 5).map((tile, index) => { const isBlank = isUngroupedBlank("remaining", index); return <span key={tileKey(tile) + "-" + index} className="relative"><TileFace tile={tile} compact />{isBlank && <span className="absolute -right-1 -top-1 rounded bg-[#ae6249] px-1 text-[8px] font-bold text-white" aria-label={"Blank representing " + tileName(tile)}>B</span>}</span>; })}<span aria-hidden="true">▾</span></span></summary>{score!.evidenceCompleteness === 'partial' && <p data-testid="notice-partial-hand" className="mt-2 text-[10px] leading-4 text-[#66746e]"><strong className="text-[#284d45]">Partial evidence</strong> — add Remaining tiles only for whole-hand pattern or fishing checks. <a href="/help#partial-losing-hand" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Partial-hand help</a></p>}<div className="mt-3 border-t border-[#e2d9c7] pt-3"><p className="mb-2 text-[10px] font-semibold text-[#ae6249]">Tap an entered tile to remove it.</p><div className="flex flex-wrap gap-2">{remainingTiles.map((tile, index) => { const isBlank = isUngroupedBlank('remaining', index); return <div key={`${tileKey(tile)}-${index}`} className="flex flex-col items-center gap-1"><TileFace tile={tile} compact actionLabel={`Remove ${tileName(tile)} from the remaining tiles`} actionTestId={`button-remove-remaining-tile-${index}`} onActivate={() => removeUngroupedTile('remaining', index)} />{handMode === 'goulash' && <button type="button" data-testid={`button-toggle-remaining-blank-${index}`} aria-pressed={isBlank} onClick={() => toggleUngroupedBlank('remaining', index)} className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${isBlank ? 'bg-[#ae6249] text-white' : 'border border-[#cfc3aa] text-[#66746e]'}`}>{isBlank ? 'Blank' : 'Mark blank'}</button>}</div>; })}</div><div className="mt-3 sm:hidden"><div className="grid grid-cols-2 gap-2"><label className="text-[10px] font-semibold text-[#66746e]">Family<select data-testid="select-remaining-family" value={remainingStructuredFamily} onChange={(event) => { const family = event.target.value as typeof remainingStructuredFamily; setRemainingStructuredFamily(family); setRemainingStructuredValue(family === 'wind' ? 'east' : family === 'dragon' ? 'red' : '1'); }} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px]"><option value="characters">Characters</option><option value="bamboo">Bamboo</option><option value="circles">Circles</option><option value="wind">Winds</option><option value="dragon">Dragons</option></select></label><label className="text-[10px] font-semibold text-[#66746e]">Value<select data-testid="select-remaining-value" value={remainingStructuredValue} onChange={(event) => setRemainingStructuredValue(event.target.value)} className="mt-1 w-full rounded border border-[#cfc3aa] bg-[#fdfbf5] px-2 py-2 text-[12px]">{remainingStructuredValues.map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div>{remainingStructuredTile && <div className="mt-3 flex items-center justify-between rounded-md border border-[#e2d9c7] bg-[#fdfbf5] p-2"><div className="flex items-center gap-2"><TileFace tile={remainingStructuredTile} compact /><span className="text-[11px] font-semibold text-[#284d45]">Loose · {tileName(remainingStructuredTile)}</span></div><button type="button" data-testid="button-add-remaining-tile" disabled={tileIsDisabled(remainingStructuredTile, 'remaining-tiles')} onClick={() => addTile(remainingStructuredTile, 'remaining-tiles')} className="rounded-md bg-[#284d45] px-3 py-2 text-[11px] font-semibold text-[#f8f4e9] disabled:opacity-40">Add tile</button></div>}<details className="mt-2"><summary className="cursor-pointer text-[11px] font-semibold text-[#66746e]">Pick visually instead</summary>{renderMobileTilePicker('Remaining tiles', 'remaining-tiles')}</details></div><div className="mt-3 hidden sm:block"><div className="mb-2 flex gap-1 overflow-x-auto">{suitOrder.map((suit) => <button type="button" key={suit} onClick={() => { setActiveSuit(suit); setShowAllTiles(false); }} className={`shrink-0 rounded px-3 py-1.5 font-mono text-[10px] uppercase ${activeSuit === suit && !showAllTiles ? 'bg-[#284d45] text-[#f8f4e9]' : 'text-[#7a7769] hover:bg-[#eee6d5]'}`}>{suitNames[suit]}</button>)}</div><div className="flex flex-wrap gap-2">{visibleTilesFor('remaining-tiles').map((tile) => <button type="button" key={tileKey(tile)} aria-label={`Add ${tileName(tile)}`} onClick={() => addTile(tile, 'remaining-tiles')} disabled={tileIsDisabled(tile, 'remaining-tiles')} className="rounded-[7px] disabled:opacity-35"><TileFace tile={tile} compact /></button>)}</div></div><button type="button" data-testid="button-return-normal-groups" onClick={() => setRemainingTilesExpanded(false)} className="mt-3 text-[11px] font-semibold text-[#66746e] underline decoration-[#cfc3aa] underline-offset-4">Return to normal group entry</button></div></details>}</section>
                  </div>
                  <button
                    type="button"
                    data-testid="button-layout-special"
                    onClick={() => {
                      setWinningTileProvenance(undefined);
                      setLayoutMode('special');
                    }}
                    className="mt-4 text-left text-[11px] font-semibold text-[#66746e] underline decoration-[#cfc3aa] underline-offset-4 transition hover:text-[#284d45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
                  >
                    Hand doesn’t fit normal sets? <span className="text-[#ae6249]">Use special layout</span>
                  </button>
                </>
                )}
              </section>

              {isWinner && isStructureComplete && (isMcr || winningMethod !== 'initial-deal') && (
                <section className="animate-rise rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6">
                  <SectionLabel eyebrow="03 / completion" title="The winning tile" />
                  <p className="mb-4 text-[13px] text-[#66746e]">
                    Which tile completed Mah Jong? <a href="/help#winning-tile" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Why this matters</a>
                  </p>

                  <div className="space-y-4">
                    {layoutMode === 'sets' ? (
                      <div className="flex flex-wrap gap-3">
                        {sets.filter(s => s.tile !== null).map(set => (
                          <div key={set.id} className="min-w-0 rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-2 shadow-sm">
                            <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-[#7a7769]">
                              {set.kind}
                            </div>
                            <div className="flex flex-wrap gap-1">
                            {expandedTiles(set as HandSet).map((tile, idx) => {
                              const isSelected = winningTileProvenance?.target.type === 'grouped-set'
                                  && winningTileProvenance.target.setId === set.id
                                  && (set.kind !== 'chow' || winningTileProvenance.target.tileIndex === idx);

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  data-testid={`button-winning-tile-${set.id}-${idx}`}
                                  aria-label={`${tileName(tile)} in ${set.kind}`}
                                  aria-pressed={isSelected}
                                  onClick={() => setWinningTileProvenance({
                                    tile: { ...tile },
                                    target: {
                                      type: 'grouped-set',
                                      setId: set.id,
                                      ...(set.kind === 'chow' ? { tileIndex: idx as 0 | 1 | 2 } : {})
                                    }
                                  })}
                                  className={`group relative rounded-[7px] transition-transform ${isSelected ? 'scale-[1.05] ring-2 ring-[#ae6249] ring-offset-2 ring-offset-[#fbf8ed]' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                                >
                                  <TileFace tile={tile} compact />
                                  {isSelected && (
                                    <div className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ae6249] text-white shadow-sm">
                                      <Check size={11} strokeWidth={3} />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-3 shadow-sm">
                        {looseTiles.map((tile, idx) => {
                          const isSelected = winningTileProvenance?.target.type === 'loose-layout'
                            && tileKey(winningTileProvenance.tile) === tileKey(tile);

                          return (
                            <button
                              key={idx}
                              type="button"
                              data-testid={`button-winning-loose-${tileKey(tile)}-${idx}`}
                              aria-label={`${tileName(tile)} in special layout`}
                              aria-pressed={isSelected}
                              onClick={() => setWinningTileProvenance({
                                tile: { ...tile },
                                target: { type: 'loose-layout' }
                              })}
                              className={`group relative rounded-[7px] transition-transform ${isSelected ? 'scale-[1.05] ring-2 ring-[#ae6249] ring-offset-2 ring-offset-[#fdfbf5]' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                            >
                              <TileFace tile={tile} compact />
                              {isSelected && (
                                <div className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ae6249] text-white shadow-sm">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {winningTileProvenance ? (
                        <div className="flex flex-1 items-center justify-between rounded-md border border-[#b8cdbf] bg-[#edf3ed] px-4 py-3">
                          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#284d45]">
                            <Check size={16} className="text-[#477562]" />
                            <span>
                              Completed {winningTileProvenance.target.type === 'loose-layout' ? 'special layout' : sets.find(s => s.id === (winningTileProvenance.target.type === 'grouped-set' ? winningTileProvenance.target.setId : ''))?.kind} with {tileName(winningTileProvenance.tile)}
                            </span>
                          </div>
                          <button
                            type="button"
                            data-testid="button-winning-tile-unknown"
                            onClick={() => setWinningTileProvenance(undefined)}
                            className="text-[11px] font-semibold text-[#477562] transition hover:text-[#284d45] focus:underline"
                          >
                            I'm not sure
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-1 flex-col items-start gap-2 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-[11px] leading-relaxed text-[#7a7769]">
                            Winning-tile-sensitive special exceptions may not be applied without this detail, so scoring remains conservative.
                          </p>
                          <button
                            type="button"
                            data-testid="button-winning-tile-unknown"
                            aria-pressed="true"
                            onClick={() => setWinningTileProvenance(undefined)}
                            className="shrink-0 rounded-md border border-[#cfc3aa] bg-[#f4eddf] px-3 py-2 text-[11px] font-semibold text-[#284d45] focus:ring-2"
                          >
                            I'm not sure
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section data-testid="bonus-tiles" className="animate-rise animate-rise-delay-3 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6">
                <SectionLabel eyebrow="04 / bonus tiles" title="Flowers & seasons" count={`${flowers.length + seasons.length} selected`} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Flowers</div>
                    <div className="flex flex-wrap gap-2">
                      {BONUS_TILE_DEFINITIONS.filter((tile) => tile.family === 'flower').map((tile) => (
                        <BonusTileButton
                          key={`${tile.family}-${tile.number}`}
                          family={tile.family}
                          number={tile.number}
                          selected={flowers.includes(tile.number)}
                          playerWind={playerWind}
                          showOwn={!isMcr}
                          onToggle={() => toggleBonus(tile.family, tile.number)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Seasons</div>
                    <div className="flex flex-wrap gap-2">
                      {BONUS_TILE_DEFINITIONS.filter((tile) => tile.family === 'season').map((tile) => (
                        <BonusTileButton
                          key={`${tile.family}-${tile.number}`}
                          family={tile.family}
                          number={tile.number}
                          selected={seasons.includes(tile.number)}
                          playerWind={playerWind}
                          showOwn={!isMcr}
                          onToggle={() => toggleBonus(tile.family, tile.number)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
              {standaloneHand && !hasContext && !example && !practice && <div className="max-w-[900px]"><RulesProfilePicker surface="hand" prompt="Which rules are you scoring?" selectedProfile={standaloneRulesProfile} onSelect={onStandaloneRulesProfileChange} />
                {compiledRuntime.grammar === 'classical-points-doubles' && compiledRuntime.runtime.supportedCapabilities().includes('hand.goulash') && <label className="mb-6 block rounded-lg border border-[#d8ceb8] bg-[#fbf8ed] p-4 text-[12px] text-[#284d45]"><span className="mb-2 block font-semibold">Hand mode</span><select data-testid="select-standalone-hand-mode" value={handMode} onChange={(event) => setHandMode(event.target.value as 'normal' | 'goulash')} className="w-full rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2"><option value="normal">Normal hand</option><option value="goulash">Goulash hand (blank tiles; no chows)</option></select></label>}</div>}
              {compiledRuntime.grammar === 'classical-points-doubles' && (() => { const capabilities = compiledRuntime.runtime.supportedCapabilities(); return (capabilities.includes('hand.standing-hand') || capabilities.includes('hand.only-possible-winning-tile') || capabilities.includes('context.east-thirteenth-consecutive-mahjong')) && <section data-testid="profile-hand-evidence" className="mx-auto mb-5 max-w-[900px] rounded-lg border border-[#d8ceb8] bg-[#fbf8ed] p-4 text-[12px] text-[#284d45]"><h2 className="font-serif text-[20px]">Scoring evidence</h2>{capabilities.includes('hand.standing-hand') && <label className="mt-3 flex gap-2"><input type="checkbox" checked={standingHand} onChange={(event) => setStandingHand(event.target.checked)} />Standing Hand (declared/locked table state)</label>}{capabilities.includes('hand.only-possible-winning-tile') && <label className="mt-2 flex gap-2"><input type="checkbox" checked={onlyPossibleWinningTile} onChange={(event) => setOnlyPossibleWinningTile(event.target.checked)} />Only possible winning tile</label>}{capabilities.includes('context.east-thirteenth-consecutive-mahjong') && <label className="mt-2 flex gap-2"><input type="checkbox" checked={eastThirteenthConsecutiveMahjong} onChange={(event) => setEastThirteenthConsecutiveMahjong(event.target.checked)} />East's thirteenth consecutive Mah Jong</label>}</section>; })()}
              <section className="rounded-xl border border-[#d8ceb8] bg-[#e8e1d1] p-4 sm:hidden" data-testid="mobile-hand-context">
                <h2 className="font-serif text-[22px] leading-tight text-[#284d45]">Hand context</h2>
                <p className="mt-1 text-[11px] leading-5 text-[#66746e]">{hasContext ? 'Your game has supplied these facts.' : 'Review or set the scoring context below.'}</p>
                <div className="mt-3 space-y-3">
                  {hasContext && <p data-testid="mobile-inherited-context" className="rounded-md border border-[#cfc3aa] bg-[#f4eddf] px-3 py-2 text-[10px] leading-4 text-[#66746e]">{context.playerName} · {playerWind} player · {prevailingWind} prevailing · {limit} limit<br />{descriptorForRulesProfile(context.rulesProfile).compactLabel} · {isWinner ? 'Winner' : 'Non-winner'} · inherited from game</p>}
                </div>
              </section>
            </div>

            <aside className="min-w-0 space-y-5">
              {!isMcr && score && <>
              <section id="game-status-controls" className={`animate-rise animate-rise-delay-1 min-w-0 rounded-xl border border-[#d8ceb8] bg-[#e8e1d1] p-5 sm:p-6 ${hasContext ? 'hidden sm:block' : ''}`}>
                <SectionLabel eyebrow="05 / context" title="Game status" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Player wind</span>
                      {hasContext ? (
                        <div className="w-full rounded-md border border-[#cfc3aa] bg-[#f0e9da] px-3 py-2.5 text-[12px] font-semibold text-[#66746e]">
                          {playerWind.charAt(0).toUpperCase() + playerWind.slice(1)} (Inherited)
                        </div>
                      ) : (
                        <select data-testid="select-player-wind" value={playerWind} onChange={(e) => setPlayerWind(e.target.value as Wind)} className="w-full min-w-0 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] focus:ring-2">
                          <option value="east">East</option>
                          <option value="south">South</option>
                          <option value="west">West</option>
                          <option value="north">North</option>
                        </select>
                      )}
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Prevailing wind</span>
                      {hasContext ? (
                        <div className="w-full rounded-md border border-[#cfc3aa] bg-[#f0e9da] px-3 py-2.5 text-[12px] font-semibold text-[#66746e]">
                          {prevailingWind.charAt(0).toUpperCase() + prevailingWind.slice(1)} (Inherited)
                        </div>
                      ) : (
                        <select data-testid="select-prevailing-wind" value={prevailingWind} onChange={(e) => setPrevailingWind(e.target.value as Wind)} className="w-full min-w-0 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] focus:ring-2">
                          <option value="east">East</option>
                          <option value="south">South</option>
                          <option value="west">West</option>
                          <option value="north">North</option>
                        </select>
                      )}
                    </label>
                  </div>
                  
                  <div className="space-y-2 border-t border-[#d1c7b4] pt-4">
                    <label className={`flex items-center justify-between rounded-md bg-[#f4eddf] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] ${hasContext ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <span>
                        Hand is winner
                        {hasContext && (
                          <span className="ml-1 font-normal text-[#7a7769]">
                            (Set on game screen)
                          </span>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        data-testid="checkbox-is-winner"
                        checked={isWinner}
                        disabled={hasContext || isMcr}
                        aria-readonly={hasContext}
                        onChange={(e) => {
                           if (!hasContext) {
                             setIsWinner(e.target.checked);
                              if (e.target.checked) {
                                if (selectedSet === 'remaining-tiles') {
                                  startNormalGroup();
                                }
                              } else {
                               setWinningTileProvenance(undefined);
                             }
                           }
                        }}
                        className="h-4 w-4 accent-[#284d45] disabled:cursor-not-allowed"
                      />
                    </label>
                    {isWinner && !isMcr && (
                      <div className="mt-2 space-y-4">
                        <label className="block min-w-0">
                          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Winning method</span>
                          <select data-testid="select-winning-method" value={winningMethod} onChange={(e) => setWinningMethod(e.target.value as WinningMethod)} className="w-full min-w-0 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] focus:ring-2">
                            {availableWinningMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                          </select>
                        </label>

                        {shouldAskFirstDiscard && (
                          <div className="animate-rise rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-3">
                            <div className="mb-2 text-[11px] font-semibold text-[#284d45]">Was this East’s very first discard of the hand?</div>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                                { value: 'unsure', label: 'I’m not sure' }
                              ].map(opt => {
                                const isSelected = discardAnswer === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    data-testid={`button-discard-answer-${opt.value}`}
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                      setDiscardAnswer(opt.value as 'yes' | 'no' | 'unsure');
                                      if (opt.value === 'yes') {
                                        setWinningEventEvidence({ type: 'discard', discardedBy: 'east', handDiscardOrdinal: 1 });
                                      } else {
                                        setWinningEventEvidence(undefined);
                                      }
                                    }}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                                      isSelected
                                        ? 'bg-[#284d45] text-[#f8f4e9] shadow-sm'
                                        : 'border border-[#d8ceb8] bg-[#fdfbf5] text-[#66746e] hover:border-[#cfc3aa] hover:bg-[#f8f4e9]'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {shouldAskReplacementSequence && (
                          <div className="animate-rise rounded-lg border border-[#e2d9c7] bg-[#fdfbf5] p-3">
                            <div className="mb-2 text-[11px] font-semibold text-[#284d45]">Did one Kong’s replacement tile complete another Kong, then the next replacement tile complete Mah Jong?</div>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' },
                                { value: 'unsure', label: 'I’m not sure' }
                              ].map(opt => {
                                const isSelected = replacementAnswer === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    data-testid={`button-replacement-answer-${opt.value}`}
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                      setReplacementAnswer(opt.value as 'yes' | 'no' | 'unsure');
                                      if (opt.value === 'yes') {
                                        setWinningEventEvidence({ type: 'replacement-chain', kongDeclarations: 2 });
                                      } else {
                                        setWinningEventEvidence(undefined);
                                      }
                                    }}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                                      isSelected
                                        ? 'bg-[#284d45] text-[#f8f4e9] shadow-sm'
                                        : 'border border-[#d8ceb8] bg-[#fdfbf5] text-[#66746e] hover:border-[#cfc3aa] hover:bg-[#f8f4e9]'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {!isWinner && (
                      <div
                        data-testid="notice-automatic-special-fishing"
                        className="rounded-md border border-[#d8ceb8] bg-[#fdfbf5] px-3 py-2.5"
                      >
                        <div className="text-[12px] font-semibold text-[#284d45]">
                          Special fishing is detected automatically
                        </div>
                        <p className="mt-1 text-[10px] leading-4 text-[#7a7769]">
                          Enter the tiles currently held. The scorer checks
                          every supported special and every legal winning tile.
                          This remains separate from Original Call.
                        </p>
                      </div>
                    )}
                    {isWinner && (
                      <label className="flex cursor-pointer items-center justify-between rounded-md bg-[#f4eddf] px-3 py-2.5 text-[12px] font-semibold text-[#284d45]">
                        <span>Original Call (First turn win)</span>
                        <input type="checkbox" data-testid="checkbox-original-call" checked={originalCall} onChange={(e) => setOriginalCall(e.target.checked)} className="h-4 w-4 accent-[#284d45]" />
                      </label>
                    )}
                  </div>

                  <label className="block border-t border-[#d1c7b4] pt-4">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Table Limit</span>
                    {hasContext ? (
                      <div className="w-full rounded-md border border-[#cfc3aa] bg-[#f0e9da] px-3 py-2.5 text-[12px] font-semibold text-[#66746e]">
                        {limit} points (Inherited)
                      </div>
                    ) : (
                      <select data-testid="select-limit" value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full min-w-0 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] focus:ring-2">
                        {[...new Set([300, 500, ...(limit === undefined ? [] : [limit]), 1000, 2000])].sort((a, b) => a - b).map((value) => <option key={value} value={value}>{value.toLocaleString()} points</option>)}
                      </select>
                    )}
                  </label>
                </div>
              </section>
              {mobileLiveResult}

              <section className="animate-rise animate-rise-delay-2 overflow-hidden rounded-xl bg-[#284d45] text-[#f8f4e9] shadow-[var(--shadow-lg)]">
                <div className="border-b border-[#55756c] px-5 pb-4 pt-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#d7a287]">Current score</div>
                      <div className="mt-2 font-serif text-[60px] leading-none">{score!.finalScore}<span className="ml-2 text-[17px] text-[#b4c4bd]">pts</span></div>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#6e8d84] text-[#d7a287]"><Check size={22} /></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[.1em] text-[#b4c4bd]">
                    {score!.scoringMode === 'standard' ? (
                      <>
                        <span><b className="text-[#f8f4e9]">{score!.basePoints}</b> points</span>
                        <span><b className="text-[#f8f4e9]">{score!.doubles}</b> doubles</span>
                      </>
                    ) : (
                      <span className="text-[#d7a287]">Special hand</span>
                    )}
                    {score!.limitApplied && <span className="text-[#d7a287]">Limit applied ({limit})</span>}
                  </div>
                </div>
                
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b4c4bd]">Breakdown</span><button type="button" data-testid="button-copy-score" onClick={copyScore} className="flex items-center gap-1.5 text-[10px] font-semibold text-[#d7a287] transition hover:text-[#f8f4e9]">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy score'}</button></div>
                  
                  {score!.validationErrors.length > 0 && (
                    <div className="mb-4 rounded-md border border-[#8a3c32] bg-[#3a201c] p-3 text-[11px] text-[#f0e9da]">
                      <div className="mb-2 flex items-center gap-1.5 font-semibold text-[#d7a287]"><AlertCircle size={14} /> Invalid hand</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {score!.validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1">
                    {score!.pointRules.length > 0 && <div className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#b4c4bd]">Points</div>}
                    {score!.pointRules.map((rule) => (
                      <div key={rule.id} className="border-b border-[#45665d] last:border-0">
                        <button type="button" data-testid={`button-rule-${rule.id}`} onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)} className="flex w-full items-center justify-between py-2 text-left text-[12px] text-[#f0e9da]">
                          <span>{rule.label}</span>
                          <span className="flex items-center gap-2 font-mono text-[11px] text-[#d7a287]">+{rule.amount}<ChevronDown size={13} className={`transition ${expandedRule === rule.id ? 'rotate-180' : ''}`} /></span>
                        </button>
                        {expandedRule === rule.id && <p className="pb-2 text-[11px] leading-5 text-[#b4c4bd]">{rule.description}</p>}
                      </div>
                    ))}
                    
                    {score!.doubleRules.length > 0 && <div className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#b4c4bd]">Doubles</div>}
                    {score!.doubleRules.map((rule) => (
                      <div key={rule.id} className="border-b border-[#45665d] last:border-0">
                        <button type="button" data-testid={`button-rule-${rule.id}`} onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)} className="flex w-full items-center justify-between py-2 text-left text-[12px] text-[#f0e9da]">
                          <span>{rule.label}</span>
                          <span className="flex items-center gap-2 font-mono text-[11px] text-[#d7a287]">×{rule.amount}<ChevronDown size={13} className={`transition ${expandedRule === rule.id ? 'rotate-180' : ''}`} /></span>
                        </button>
                        {expandedRule === rule.id && <p className="pb-2 text-[11px] leading-5 text-[#b4c4bd]">{rule.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#55756c] bg-[#1f3f38] p-5 sm:hidden">
                  {hasContext ? (
                    <>
                      <button type="button" data-testid="button-apply-score-mobile" disabled={!score!.valid} onClick={applyScore} className="flex w-full items-center justify-center rounded-md bg-[#f3e8d4] px-4 py-3 text-[13px] font-bold text-[#284d45] disabled:cursor-not-allowed disabled:opacity-40">
                        Apply {score!.finalScore} to {context.playerName}
                      </button>
                      <button type="button" onClick={leaveHand} className="mt-3 flex w-full items-center justify-center rounded-md border border-[#45665d] py-3 text-[13px] font-semibold text-[#c8d8d1]">
                        Back to game without applying a score
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={leaveHand} className="flex w-full items-center justify-center rounded-md border border-[#45665d] bg-[#284d45] py-3 text-[13px] font-semibold text-[#f8f4e9]">
                      {exampleExitLabel(example, 'Leave hand and go home')}
                    </button>
                  )}
                </div>
              </section>

              {patterns.length > 0 && (
                <section className="animate-rise animate-rise-delay-3 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6" data-testid="detected-patterns">
                  <div className="mb-4 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Detected patterns</div><h2 className="mt-1 font-serif text-[22px] text-[#284d45]">Why this hand scores</h2></div><Sparkles size={18} className="text-[#ae6249]" /></div>
                  <div className="space-y-2">
                    {patterns.map((pattern) => {
                      const referenceHref = patternReferenceHref(pattern, context?.rulesProfile ?? standaloneRulesProfile);
                      return <div key={pattern.id} data-testid={`pattern-${pattern.id}`} className={`rounded-md border p-3 ${pattern.selected ? 'border-[#ae6249]/60 bg-[#fff4e8]' : 'border-[#b8cdbf] bg-[#edf3ed]'}`}>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#284d45]"><Check size={14} className="text-[#477562]" />{referenceHref ? <a href={referenceHref} className="underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{pattern.name}</a> : pattern.name}<span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-[#477562]">{pattern.effect}{pattern.selected ? ' · used' : ''}</span></div>
                        <p className="mt-1 pl-5 text-[10px] leading-4 text-[#7a7769]">{pattern.explanation}</p>
                      </div>;
                    })}
                  </div>
                </section>
              )}
              </>}
              {isMcr && <>
                <section data-testid="mcr-evidence-controls" className="rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5">
                  <SectionLabel eyebrow="05 / MCR evidence" title="Win context" />
                  {lockedMcrContext ? <div data-testid="mcr-locked-table-context" className="mt-2 space-y-1 text-sm"><p>Win source <strong>{mcrWinSource === 'discard' ? 'Discard' : 'Self-draw'}</strong> <span className="text-xs">(from table)</span></p><p>Seat wind <strong>{context!.playerWind}</strong> <span className="text-xs">(from table)</span></p><p>Prevailing wind <strong>{context!.prevailingWind}</strong> <span className="text-xs">(from table)</span></p></div> : <label className="mt-2 block text-sm">Win source<select data-testid="mcr-win-source" value={mcrWinSource ?? ''} onChange={(event) => { const next = (event.target.value || undefined) as McrWinSource | undefined; setMcrWinSource(next); if (mcrResolvedWinEvent && eventSource[mcrResolvedWinEvent] && eventSource[mcrResolvedWinEvent] !== next) setMcrResolvedWinEvent(undefined); }} className="mt-1 w-full rounded border p-2"><option value="">Choose source</option><option value="discard">Discard</option><option value="self-draw">Self-draw</option></select></label>}
                  <label className="mt-3 block text-sm">Resolved win event<select data-testid="mcr-win-event" value={mcrResolvedWinEvent ?? ''} onChange={(event) => setMcrResolvedWinEvent((event.target.value || undefined) as McrResolvedWinEvent | undefined)} className="mt-1 w-full rounded border p-2"><option value="">Choose event</option>{mcrEvents.filter((item) => !eventSource[item.value] || eventSource[item.value] === mcrWinSource).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                  <label className="mt-3 block text-sm">Last visible copy<select value={mcrLastVisibleCopy === undefined ? 'unknown' : String(mcrLastVisibleCopy)} onChange={(event) => setMcrLastVisibleCopy(event.target.value === 'unknown' ? undefined : event.target.value === 'true')} className="mt-1 w-full rounded border p-2"><option value="unknown">Unknown</option><option value="true">Yes</option><option value="false">No</option></select></label>
                  {!lockedMcrContext && <><label className="mt-3 block text-sm">Seat wind<select data-testid="mcr-seat-wind" value={mcrSeatWind ?? ''} onChange={(event) => setMcrSeatWind((event.target.value || undefined) as McrWind | undefined)} className="mt-1 w-full rounded border p-2"><option value="">Not entered</option>{mcrWinds.map((wind) => <option key={wind}>{wind}</option>)}</select></label><label className="mt-3 block text-sm">Prevailing wind<select data-testid="mcr-prevailing-wind" value={mcrPrevailingWind ?? ''} onChange={(event) => setMcrPrevailingWind((event.target.value || undefined) as McrWind | undefined)} className="mt-1 w-full rounded border p-2"><option value="">Not entered</option>{mcrWinds.map((wind) => <option key={wind}>{wind}</option>)}</select></label></>}
                </section>
                {mobileLiveResult}
                <section data-testid="mcr-score-result" className="rounded-xl border border-[#b8cdbf] bg-[#edf3ed] p-5"><h2 className="font-serif text-2xl text-[#284d45]">MCR result</h2>{!mcrWinSource || !mcrResolvedWinEvent ? <p className="mt-3 text-sm">Choose a win source and resolved win event before scoring.</p> : !winningTileProvenance ? <p className="mt-3 text-sm">Identify the winning tile in the shared hand workspace.</p> : !mcrResult ? <p className="mt-3 text-sm">This selected profile is not available for standalone scoring.</p> : mcrResult.kind === 'needs-evidence' ? <><p className="mt-3 font-semibold">More evidence is needed.</p><ul className="list-disc pl-5 text-sm">{mcrResult.prompts.map(({ id, prompt }) => <li key={id} data-evidence-id={id}>{prompt}</li>)}</ul></> : mcrResult.kind === 'not-qualifying' ? <p className="mt-3 text-sm">The hand is below the 8-point minimum before Flowers. Flowers cannot rescue a hand below the minimum.</p> : mcrResult.kind === 'invalid' ? <p className="mt-3 text-sm">Invalid / not scoreable ({mcrResult.reasonId}).</p> : <><p className="mt-3 text-sm">Qualifying subtotal: <strong>{mcrResult.qualifyingSubtotal}</strong></p><p className="text-sm">Flowers: <strong>{mcrResult.flowers}</strong></p><p className="mt-2 text-3xl">{mcrResult.basicPoints} Basic Points</p><h3 className="mt-4 font-semibold">Counted fan</h3><ul className="text-sm">{mcrResult.counted.map((fan) => <li key={`${fan.name}-${fan.sourceLocator}`}>{fan.name} · {fan.value} <small>{fan.sourceLocator}</small></li>)}</ul>{mcrResult.suppressed.length > 0 && <><h3 className="mt-4 font-semibold">Suppressed fan</h3><ul className="text-sm">{mcrResult.suppressed.map((fan) => <li key={`${fan.name}-${fan.reasonId}`}>{fan.name} · {fan.value} — {fan.reason} <small>{fan.sourceLocator} · {fan.reasonId}</small></li>)}</ul></>}{mcrCanApply && <button type="button" data-testid="button-apply-mcr-score" onClick={applyMcrScore} className="mt-5 w-full rounded-md bg-[#284d45] px-4 py-3 text-sm font-bold text-[#f8f4e9]">Apply {mcrResult.basicPoints} Basic Points to {context!.playerName}</button>}</>}</section>
              </>}
            </aside>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#8c8a7f]">Local tool · no hand data leaves this device</p><p className="text-[11px] text-[#8c8a7f]">Built for the quiet moment before the next deal.</p></footer>
    </div>
  );
}

export default function App({ initialView = 'game', standaloneHand = false, initialRulesProfile, prerenderOnly = false }: { initialView?: 'game' | 'hand'; standaloneHand?: boolean; initialRulesProfile?: import('./game').RulesProfileRef; prerenderOnly?: boolean }) {
  const search = standaloneHand && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const practice = !!search?.get('practice');
  const requestedDescriptor = search?.get('rules') ? PUBLIC_RULES_DESCRIPTORS.find(({ slug }) => slug === search.get('rules')) : undefined;
  const exampleId = search?.get('example') ?? search?.get('practice');
  const treatmentPatternId = search?.get('treatment');
  const atlasExample = search?.get('atlasExample') && search.get('rules') && treatmentPatternId ? resolveAtlasScorerExample(search.get('atlasExample')!, search.get('rules')!, treatmentPatternId) : undefined;
  const example = atlasExample ?? (search ? resolveScorerExample(exampleId) : undefined);
  const validatedExampleProfile = atlasExample && requestedDescriptor ? requestedDescriptor.profile : example && requestedDescriptor && treatmentPatternId && specialHandExampleProvesTreatment(exampleId ?? '', `${requestedDescriptor.profile.id}@${requestedDescriptor.profile.version}:${treatmentPatternId}`) ? requestedDescriptor.profile : undefined;
  const resolvedInitialRulesProfile = example
    ? validatedExampleProfile ?? BMJA_PROFILE_REF
    : initialRulesProfile ?? requestedDescriptor?.profile ?? readPreferredRulesProfile() ?? BMJA_PROFILE_REF;
  const [view, setView] = useState<'game' | 'hand'>(initialView);
  const [scorerContext, setScorerContext] = useState<HandScorerContext | null>(null);
  const [returnedScore, setReturnedScore] = useState<
    HandScorerResult | null | undefined
  >(undefined);
  const [scorerSession, setScorerSession] = useState(0);
  const [standaloneRulesProfile, setStandaloneRulesProfile] = useState(resolvedInitialRulesProfile);

  const changeStandaloneRulesProfile = (profile: import('./game').RulesProfileRef) => {
    setStandaloneRulesProfile(profile);
    setPreferredRulesProfile(profile);
  };

  const handleOpenHandScorer = (ctx?: HandScorerContext) => {
    setScorerContext(ctx ?? null);
    setScorerSession((current) => current + 1);
    setView('hand');
  };

  const handleCloseHandScorer = (result?: HandScorerResult) => {
    if (standaloneHand) {
      window.location.assign('/');
      return;
    }
    setReturnedScore(result ?? null);
    setView('game');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          {(!prerenderOnly || view === 'game') && (
            <div className={view === 'game' ? 'block' : 'hidden'}>
              <GameScorer
                onOpenHandScorer={handleOpenHandScorer}
                returnedScore={returnedScore}
                onClearReturnedScore={() => setReturnedScore(undefined)}
                initialRulesProfile={resolvedInitialRulesProfile}
                initialRulesProfileIsExplicit={initialRulesProfile !== undefined}
              />
            </div>
          )}
          {(!prerenderOnly || view === 'hand') && (
            <div className={view === 'hand' ? 'block' : 'hidden'}>
              <HandScorer
                key={scorerSession}
                context={scorerContext}
                onClose={handleCloseHandScorer}
                standaloneHand={standaloneHand}
                standaloneRulesProfile={standaloneRulesProfile}
                onStandaloneRulesProfileChange={changeStandaloneRulesProfile}
                example={example}
                practice={practice && !!example}
              />
            </div>
          )}
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
