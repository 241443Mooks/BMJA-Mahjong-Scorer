import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Check, ChevronDown, CircleHelp, Copy, Plus, RotateCcw, Sparkles, X, AlertCircle } from 'lucide-react';
import { GameScorer } from './game/GameScorer';
import { SiteHeader } from './components/SiteHeader';
import { specialHandReferenceHref } from './guide/special-hand-references';
import { exampleHandScorerContext, specialHandExampleById, type SpecialHandExample } from './guide/special-hand-examples';
import { ReturnToGame } from './components/ReturnToGame';
import { handScorerLocalContext } from './game';
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
} from './scoring';
import {
  scoreHand,
  detectedPatterns,
  isFirstDiscardEvidenceCandidate,
  isReplacementSequenceEvidenceCandidate,
  isWinningEventEvidenceCompatible,
  validateHand,
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
const patternReferenceHref = (pattern: { id: string; type: string }) => {
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
}: {
  family: BonusTile['family'];
  number: BonusTile['number'];
  selected: boolean;
  playerWind: Wind;
  onToggle: () => void;
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
      {isOwn && <span className="mt-1 rounded bg-[#e6efe9] px-1 py-0.5 text-[8px] font-semibold text-[#284d45]">Own {family === 'flower' ? 'Flower' : 'Season'}</span>}
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

function HandScorer({ context, onClose, standaloneHand, example }: { context: HandScorerContext | null; onClose: (result?: HandScorerResult) => void; standaloneHand: boolean; example?: SpecialHandExample }) {
  // An example borrows the hand contract only; it must never acquire the game callback.
  const hasContext = !!context && !example;
  const initialContext = handScorerLocalContext(context);
  const initialHand = context?.detailedHand?.hand;
  const [sets, setSets] = useState<UIHandSet[]>(() =>
    initialHand
      ? initialHand.sets.map((handSet) => ({ ...handSet }))
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
  const [limit, setLimit] = useState<number>(initialContext.limit);

  const [isWinner, setIsWinner] = useState<boolean>(initialContext.isWinner);
  const [winningMethod, setWinningMethod] = useState<WinningMethod>(
    initialHand?.winningMethod ?? 'wall',
  );
  const [originalCall, setOriginalCall] = useState<boolean>(
    initialContext.isWinner ? initialHand?.originalCall ?? false : false,
  );
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

  const [selectedSet, setSelectedSet] = useState<string>(
    initialHand?.remainingTiles?.length
      ? 'remaining-tiles'
      : initialHand?.sets[0]?.id ?? 'set-1',
  );
  const [activeSuit, setActiveSuit] = useState<string>('characters');
  const [showAllTiles, setShowAllTiles] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasUnsavedWork = !hasContext && (
    sets.length !== defaultSets.length || sets.some((set) => set.tile !== null) || layoutMode !== 'sets' || looseTiles.length > 0 || remainingTiles.length > 0 || flowers.length > 0 || seasons.length > 0 || playerWind !== 'east' || prevailingWind !== 'east' || limit !== 1000 || isWinner || winningMethod !== 'wall' || originalCall || winningTileProvenance !== undefined || winningEventEvidence !== undefined
  );
  const leaveHand = () => {
    if (hasUnsavedWork && !window.confirm('Leave this hand? The hand details you entered will be discarded.')) return;
    if (example) { window.location.assign(`/special-hands#${example.id}`); return; }
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
    const nextContext = handScorerLocalContext(context);
    const savedHand = context?.detailedHand?.hand;
    const nextSets = savedHand
      ? savedHand.sets.map((handSet) => ({ ...handSet }))
      : defaultSets.map((handSet) => ({ ...handSet }));

    setSets(nextSets);
    setLayoutMode(savedHand?.looseTiles?.length ? 'special' : 'sets');
    setLooseTiles(savedHand?.looseTiles?.map((tile) => ({ ...tile })) ?? []);
    setRemainingTiles(
      savedHand?.remainingTiles?.map((tile) => ({ ...tile })) ?? [],
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
    setIsWinner(nextContext.isWinner);
    setWinningMethod(savedHand?.winningMethod ?? 'wall');
    setOriginalCall(
      nextContext.isWinner ? savedHand?.originalCall ?? false : false,
    );
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
    setSelectedSet(
      savedHand?.remainingTiles?.length
        ? 'remaining-tiles'
        : nextSets[0]?.id ?? '',
    );
    setExpandedRule(null);
    setCopied(false);
  }, [context]);

  const hand = useMemo<MahjongHand>(() => {
    const validSets = sets.filter((s): s is HandSet => s.tile !== null);
    return {
      sets: layoutMode === 'sets' ? validSets : [],
      looseTiles: layoutMode === 'special' ? looseTiles : undefined,
      remainingTiles:
        !isWinner && layoutMode === 'sets' ? remainingTiles : undefined,
      bonusTiles: [
        ...flowers.map(n => bonus('flower', n as BonusTile['number'])),
        ...seasons.map(n => bonus('season', n as BonusTile['number']))
      ],
      isWinner,
      winningMethod: isWinner ? winningMethod : undefined,
      winningTileProvenance: isWinner && winningMethod !== 'initial-deal' ? winningTileProvenance : undefined,
      winningEventEvidence: effectiveWinningEventEvidence,
      originalCall: isWinner ? originalCall : false,
    };
  }, [sets, looseTiles, remainingTiles, layoutMode, flowers, seasons, isWinner, winningMethod, originalCall, winningTileProvenance, effectiveWinningEventEvidence]);

  useEffect(() => {
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
  }, [sets, looseTiles, layoutMode, isWinner, winningMethod, winningTileProvenance]);

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

  const isStructureComplete = useMemo(() => {
    if (!isWinner) return false;
    const tempHand: MahjongHand = {
      ...hand,
      winningMethod: 'wall',
      winningTileProvenance: undefined,
    };
    return validateHand(tempHand).length === 0;
  }, [hand, isWinner]);

  const gameContext = useMemo<GameContext>(
    () => ({ playerWind, prevailingWind, limit }),
    [limit, playerWind, prevailingWind],
  );

  const score = useMemo(
    () => scoreHand(hand, gameContext),
    [gameContext, hand],
  );
  const patterns = useMemo(() => detectedPatterns(score), [score]);

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
      if (selectedSet === id) setSelectedSet(newSets[0]?.id || '');
      return newSets;
    });
  }
  function addTile(tile: PlayingTile) {
    if (layoutMode === 'special') {
      const matchingCopies = looseTiles.filter(
        (candidate) => tileKey(candidate) === tileKey(tile),
      ).length;
      const specialTileLimit = isWinner ? 14 : 13;
      if (looseTiles.length < specialTileLimit && matchingCopies < 4) {
        setWinningTileProvenance(undefined);
        setLooseTiles((current) => [...current, tile]);
      }
      return;
    }
    if (!canAddStandardTile(tile)) return;
    if (!isWinner && selectedSet === 'remaining-tiles') {
      setRemainingTiles((current) => [...current, tile]);
      return;
    }
    if (!selectedSet) return;
    updateSet(selectedSet, { tile });
  }
  function addSet() {
    setWinningTileProvenance(undefined);
    const id = `set-${Date.now()}`;
    setSets((current) => [
      ...current,
      {
        id,
        kind: 'pung',
        visibility: 'concealed',
        tile: null,
      },
    ]);
    setSelectedSet(id);
  }
  function canAddStandardTile(tile: PlayingTile): boolean {
    if (layoutMode !== 'sets') return false;
    let candidateSets = enteredSets;
    let candidateRemaining = !isWinner ? remainingTiles : [];

    if (!isWinner && selectedSet === 'remaining-tiles') {
      candidateRemaining = [...candidateRemaining, tile];
    } else {
      const selected = sets.find((handSet) => handSet.id === selectedSet);
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
    setSets(exampleIsWinner ? exampleSets : exampleSets.slice(0, 4));
    setRemainingTiles(
      exampleIsWinner
        ? []
        : [suited('bamboo', 9)],
    );
    setFlowers([1, 4]);
    setSeasons([]);
    setIsWinner(exampleIsWinner);
    setWinningMethod('wall');
    setOriginalCall(false);
    setSelectedSet(exampleIsWinner ? 'set-1' : 'remaining-tiles');
  }
  function toggleBonus(kind: 'flower' | 'season', num: number) {
    if (kind === 'flower') {
      setFlowers(current => current.includes(num) ? current.filter(n => n !== num) : [...current, num]);
    } else {
      setSeasons(current => current.includes(num) ? current.filter(n => n !== num) : [...current, num]);
    }
  }
  function copyScore() {
    navigator.clipboard?.writeText(`${playerWind} Player: ${score.finalScore} points (${score.basePoints} base, ${score.doubles} doubles)`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function applyScore() {
    if (!context || example || !score.valid) return;
    onClose({
      playerId: context.playerId,
      score: score.finalScore,
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
        finalScore: score.finalScore,
      },
    });
  }

  const visibleTiles = allPlayingTiles.filter(tile => {
    if (!showAllTiles) {
      if (activeSuit === 'characters' || activeSuit === 'bamboo' || activeSuit === 'circles') {
        if (tile.family !== 'suit' || tile.suit !== activeSuit) return false;
      } else if (activeSuit === 'wind') {
        if (tile.family !== 'wind') return false;
      } else if (activeSuit === 'dragon') {
        if (tile.family !== 'dragon') return false;
      }
    }
    if (layoutMode === 'sets' && activeSet?.kind === 'chow') {
      if (tile.family !== 'suit') return false;
      if (tile.rank > 7) return false;
    }
    return true;
  });

  const tileIsDisabled = (tile: PlayingTile) =>
    (layoutMode === 'special' &&
      (looseTiles.length >= (isWinner ? 14 : 13) ||
        looseTiles.filter((candidate) => tileKey(candidate) === tileKey(tile)).length >= 4)) ||
    (layoutMode === 'sets' && !canAddStandardTile(tile));

  const mobileDestinationLabel = (destination: string) => (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="font-serif text-[18px] text-[#284d45]">Choose a tile</h3>
      <span className="text-right font-mono text-[10px] text-[#ae6249]">{destination}</span>
    </div>
  );

  const renderMobileTilePicker = (destination: string) => (
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
        {visibleTiles.map((tile) => (
          <button
            type="button"
            key={tileKey(tile)}
            data-testid={`mobile-button-add-tile-${tileKey(tile)}`}
            aria-label={`Add ${tileName(tile)}`}
            onClick={() => addTile(tile)}
            disabled={tileIsDisabled(tile)}
            className="shrink-0 rounded-[7px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <TileFace tile={tile} compact />
          </button>
        ))}
        {visibleTiles.length === 0 && <div className="py-3 text-[11px] text-[#7a7769]">No valid tiles for this set type.</div>}
      </div>
    </div>
  );

  return (
    <div className="mahjong-shell">
      <SiteHeader onNavigate={navigateAway} />

      <main className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-6 px-5 py-7 lg:grid-cols-[minmax(0,1fr)_376px] lg:px-8 lg:py-9">
        <section className="min-w-0">
          <div className="mb-7 animate-rise">
            {example && <>
              <a data-testid="link-back-to-special-hand" href={`/special-hands#${example.id}`} className="mb-4 inline-flex min-h-10 items-center rounded-md border border-[#b8cdbf] bg-[#edf3ed] px-3 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#dceade]">Back to Special hands · {example.name}</a>
              <p className="mb-3 text-[11px] leading-5 text-[#66746e]">Example hand — change tiles or context to explore. Your saved game, if any, remains separate.</p>
              <ReturnToGame />
            </>}
            <div className="mb-3 flex items-center gap-3"><div className="fine-rule w-10" /><span className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">New hand · ready to enter</span></div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-[clamp(36px,5vw,62px)] leading-[.97] tracking-[-.03em] text-[#284d45]">{standaloneHand ? <>British Mahjong<br /><span className="text-[#ae6249]">hand calculator.</span></> : <>Score a hand<br /><span className="text-[#ae6249]">with confidence.</span></>}</h1>
                <p className="mt-4 max-w-[560px] text-[14px] leading-6 text-[#66746e]">
                  {example
                    ? `Example: ${example.name}. This uses the normal scorer; change it to explore.`
                    : hasContext
                    ? `Calculating ${context.playerName}’s ${context.playerWind} hand during the ${context.prevailingWind} prevailing round.`
                    : standaloneHand
                      ? 'Enter your tiles visually as they sit on the table. The calculator shows supported points, doubles, special hands and fishing in a clear score breakdown.'
                      : 'Enter each set as it sits on the table. The score builds beside you, with every point and double accounted for.'}
                </p>
                {context?.requiresRecalculation && (
                  <div
                    data-testid="notice-recalculation-required"
                    className="mt-4 max-w-[560px] rounded-md border border-[#ae6249]/40 bg-[#fff4e8] px-3 py-2 text-[11px] font-semibold text-[#8a4d38]"
                  >
                    The round winner changed. Review this hand and apply it again before confirming the round.
                  </div>
                )}
                <button type="button" onClick={leaveHand} className="mt-4 rounded-md border border-[#cfc3aa] bg-[#fbf8ed] px-3 py-2 text-[11px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">
                  {example ? 'Back to Special hands' : hasContext ? 'Back to game without applying a score' : 'Leave hand and go home'}
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" data-testid="button-load-example" onClick={loadExample} className="flex items-center gap-2 rounded-md border border-[#cfc3aa] bg-[#f8f4e9] px-3 py-2 text-[11px] font-semibold text-[#284d45] transition hover:-translate-y-0.5 hover:border-[#ae6249] focus:ring-2"><Sparkles size={14} /> Load example</button>
                <button type="button" data-testid="button-clear-hand" onClick={clearHand} className="flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-semibold text-[#7a7769] transition hover:bg-[#e9e3d5] focus:ring-2"><RotateCcw size={14} /> Clear</button>
              </div>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(280px,.82fr)]">
            <div className="min-w-0 space-y-5">
              <section className="rounded-xl border border-[#d8ceb8] bg-[#e8e1d1] p-4 sm:hidden" data-testid="mobile-hand-context">
                <h2 className="font-serif text-[22px] leading-tight text-[#284d45]">Hand context</h2>
                <p className="mt-1 text-[11px] leading-5 text-[#66746e]">Choose the outcome before entering tiles so the scorer shows the right hand flow.</p>
                <div className="mt-3 space-y-3">
                  <label className={`flex items-center justify-between rounded-md bg-[#f4eddf] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] ${hasContext ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span>Hand is winner{hasContext && <span className="ml-1 font-normal text-[#7a7769]">(Set on game screen)</span>}</span>
                    <input
                      type="checkbox"
                      data-testid="mobile-checkbox-is-winner"
                      checked={isWinner}
                      disabled={hasContext}
                      aria-readonly={hasContext}
                      onChange={(e) => {
                        if (!hasContext) {
                          setIsWinner(e.target.checked);
                          if (e.target.checked && selectedSet === 'remaining-tiles') setSelectedSet(sets[0]?.id ?? '');
                          if (!e.target.checked) setWinningTileProvenance(undefined);
                        }
                      }}
                      className="h-4 w-4 accent-[#284d45] disabled:cursor-not-allowed"
                    />
                  </label>
                  {isWinner && (
                    <label className="block min-w-0">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[.15em] text-[#7a7769]">Winning method</span>
                      <select data-testid="mobile-select-winning-method" value={winningMethod} onChange={(e) => setWinningMethod(e.target.value as WinningMethod)} className="w-full min-w-0 rounded-md border border-[#cfc3aa] bg-[#fdfbf5] px-3 py-2.5 text-[12px] font-semibold text-[#284d45] focus:ring-2">
                        {availableWinningMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              </section>
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
                      {looseTiles.map((tile, index) => (
                        <TileFace
                          key={`${tileKey(tile)}-${index}`}
                          tile={tile}
                          actionLabel={`Remove ${tileName(tile)} from the irregular hand`}
                          actionTestId={`button-remove-loose-tile-${index}`}
                          onActivate={() => {
                            setWinningTileProvenance(undefined);
                            setLooseTiles((current) =>
                              current.filter((_, tileIndex) => tileIndex !== index),
                            );
                          }}
                        />
                      ))}
                      {looseTiles.length === 0 && (
                        <div className="w-full text-center text-[11px] text-[#9b988d]">
                          Add the {isWinner ? 14 : 13} tiles in the {isWinner ? 'completed' : 'one-tile-away'} special-hand layout.
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-[#7a7769]">
                      Use this for irregular layouts. When fishing, enter only
                      the tiles currently held; the scorer finds every legal
                      completing tile.
                    </p>
                    {renderMobileTilePicker('Special layout')}
                  </div>
                ) : (
                <>
                  <div className="space-y-3">
                    {sets.map((s, index) => (
                    <div key={s.id} data-testid={`card-set-${index + 1}`} className={`rounded-lg border p-3 transition ${selectedSet === s.id ? 'border-[#ae6249]/60 bg-[#f7f1e3]' : 'border-[#e2d9c7] bg-[#fdfbf5]'}`} onClick={() => setSelectedSet(s.id)}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#ae6249]">SET {String(index + 1).padStart(2, '0')}</span>
                           <select aria-label={`Set ${index + 1} type`} data-testid={`select-set-type-${index + 1}`} value={s.kind} onChange={(e) => updateSet(s.id, { kind: e.target.value as SetKind, tile: null })} className="cursor-pointer border-0 bg-transparent font-mono text-[10px] uppercase tracking-[.12em] text-[#284d45] outline-none">
                             <option value="pung">Pung</option><option value="chow" disabled={sets.some((other) => other.id !== s.id && other.kind === 'chow')}>Chow</option><option value="kong">Kong</option><option value="pair">Pair</option>
                          </select>
                          <select aria-label={`Set ${index + 1} visibility`} data-testid={`select-set-visibility-${index + 1}`} value={s.visibility} onChange={(e) => updateSet(s.id, { visibility: e.target.value as Visibility })} className="cursor-pointer border-0 bg-transparent font-mono text-[10px] uppercase tracking-[.12em] text-[#284d45] outline-none">
                            <option value="concealed">Concealed</option><option value="exposed">Exposed</option>
                          </select>
                        </div>
                        {sets.length > 1 && (
                          <button type="button" aria-label="Remove set" onClick={(e) => { e.stopPropagation(); removeSet(s.id); }} className="text-[#ae6249] transition hover:text-[#8a4d38] focus:ring-2"><X size={14}/></button>
                        )}
                      </div>
                      <div className="flex min-h-[76px] items-center gap-2 overflow-x-auto pb-1">
                        {s.tile ? expandedTiles(s as HandSet).map((t, i) => <TileFace key={`${tileKey(t)}-${i}`} tile={t} onRemove={() => updateSet(s.id, { tile: null })} />) : (
                          <div className="flex h-[62px] w-full items-center justify-center rounded-md border border-dashed border-[#d7cbb5] text-[11px] text-[#9b988d]">Select a tile below to define this set</div>
                        )}
                      </div>
                      {selectedSet === s.id && renderMobileTilePicker(`Adding to Set ${index + 1}`)}
                    </div>
                    ))}
                  </div>
                  <button type="button" data-testid="button-add-set" onClick={addSet} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#cdbfa7] py-2.5 text-[11px] font-semibold text-[#66746e] transition hover:border-[#ae6249] hover:text-[#284d45] focus:ring-2"><Plus size={14} /> Add another set</button>
                  {!isWinner && (
                    <section
                      data-testid="card-remaining-tiles"
                      className={`mt-4 rounded-lg border p-3 transition ${
                        selectedSet === 'remaining-tiles'
                          ? 'border-[#ae6249]/60 bg-[#f7f1e3]'
                          : 'border-[#e2d9c7] bg-[#fdfbf5]'
                      }`}
                    >
                      {score.evidenceCompleteness === 'partial' && (
                        <p data-testid="notice-partial-hand" className="mb-3 text-[10px] leading-4 text-[#66746e]">
                          <strong className="text-[#284d45]">Partial hand is OK.</strong> Add Remaining tiles for whole-hand patterns and fishing checks.
                        </p>
                      )}
                      <button
                        type="button"
                        data-testid="button-select-remaining-tiles"
                        onClick={() => setSelectedSet('remaining-tiles')}
                        className="mb-3 flex w-full items-start justify-between gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]"
                      >
                        <span>
                          <span className="block font-mono text-[10px] text-[#ae6249]">REMAINING TILES</span>
                          <span className="mt-1 block text-[11px] leading-5 text-[#7a7769]">
                            Add any other tiles you want included. They are optional for scoring entered completed groups, but all 13 are needed for whole-hand patterns and fishing.
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-[#66746e]">
                          {remainingTiles.length} entered
                        </span>
                      </button>
                      <p className="mb-2 text-[10px] font-semibold text-[#ae6249]">
                        Tap an entered tile to remove it.
                      </p>
                      <div className="flex min-h-[76px] flex-wrap items-center gap-2 rounded-md border border-dashed border-[#d7cbb5] bg-[#fdfbf5] p-2">
                        {remainingTiles.map((tile, index) => (
                          <TileFace
                            key={`${tileKey(tile)}-${index}`}
                            tile={tile}
                            actionLabel={`Remove ${tileName(tile)} from the remaining tiles`}
                            actionTestId={`button-remove-remaining-tile-${index}`}
                            onActivate={() =>
                              setRemainingTiles((current) =>
                                current.filter((_, tileIndex) => tileIndex !== index),
                              )
                            }
                          />
                        ))}
                        {remainingTiles.length === 0 && (
                          <div className="w-full text-center text-[11px] leading-5 text-[#9b988d]">
                            Select this area, then choose leftover tiles from the tile bank.
                            They do not need to form a group or be one tile from Mah Jong.
                          </div>
                        )}
                      </div>
                      {selectedSet === 'remaining-tiles' && renderMobileTilePicker('Remaining tiles')}
                    </section>
                  )}
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

              <section className="hidden animate-rise animate-rise-delay-2 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:block sm:p-6">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div><div className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-[#ae6249]">02 / tile bank</div><h2 className="mt-1 font-serif text-[22px] text-[#284d45]">Choose a tile</h2></div>
                  <div className="font-mono text-[10px] text-[#7a7769]">Adding to <span className="text-[#ae6249]">{layoutMode === 'special' ? `special layout (${looseTiles.length}/${isWinner ? 14 : 13})` : selectedSet === 'remaining-tiles' ? `Remaining tiles (${remainingTiles.length})` : activeSet ? `set ${sets.findIndex(s => s.id === selectedSet) + 1}` : '—'}</span></div>
                </div>
                <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b border-[#e2d9c7] pb-2">
                  {suitOrder.map((suit) => (
                    <button type="button" key={suit} data-testid={`button-suit-${suit}`} onClick={() => { setActiveSuit(suit); setShowAllTiles(false); }} className={`shrink-0 rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.12em] transition ${activeSuit === suit && !showAllTiles ? 'bg-[#284d45] text-[#f8f4e9]' : 'text-[#7a7769] hover:bg-[#eee6d5]'}`}>{suitNames[suit]}</button>
                  ))}
                  <button type="button" data-testid="button-show-all-tiles" onClick={() => setShowAllTiles(true)} className={`shrink-0 rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.12em] transition ${showAllTiles ? 'bg-[#ae6249] text-[#fff7e9]' : 'text-[#7a7769] hover:bg-[#eee6d5]'}`}>All</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleTiles.map((tile) => (
                    <button
                      type="button"
                      key={tileKey(tile)}
                      data-testid={`button-add-tile-${tileKey(tile)}`}
                      aria-label={`Add ${tileName(tile)}`}
                      onClick={() => addTile(tile)}
                      disabled={tileIsDisabled(tile)}
                      className="rounded-[7px] transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                    ><TileFace tile={tile} compact /></button>
                  ))}
                  {visibleTiles.length === 0 && <div className="text-[11px] text-[#7a7769] py-4">No valid tiles for this set type.</div>}
                </div>
                <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#7a7769]"><CircleHelp size={14} className="mt-0.5 shrink-0 text-[#ae6249]" /> {layoutMode === 'special' ? 'Choose each tile individually; duplicate physical tiles may be added up to four times.' : isWinner ? 'Select a set, then choose its representative tile (for a chow, pick the first tile 1-7).' : 'Select a completed set to define it, or select Remaining tiles to add each leftover tile individually.'}</div>
              </section>

              {isWinner && isStructureComplete && winningMethod !== 'initial-deal' && (
                <section className="animate-rise rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6">
                  <SectionLabel eyebrow="03 / completion" title="The winning tile" />
                  <p className="mb-4 text-[13px] text-[#66746e]">
                    Which tile completed Mah Jong?
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

              <section className="animate-rise animate-rise-delay-3 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6">
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
                          onToggle={() => toggleBonus(tile.family, tile.number)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="min-w-0 space-y-5">
              <section id="game-status-controls" className="animate-rise animate-rise-delay-1 min-w-0 rounded-xl border border-[#d8ceb8] bg-[#e8e1d1] p-5 sm:p-6">
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
                        disabled={hasContext}
                        aria-readonly={hasContext}
                        onChange={(e) => {
                           if (!hasContext) {
                             setIsWinner(e.target.checked);
                              if (e.target.checked) {
                                if (selectedSet === 'remaining-tiles') {
                                  setSelectedSet(sets[0]?.id ?? '');
                                }
                              } else {
                               setWinningTileProvenance(undefined);
                             }
                           }
                        }}
                        className="h-4 w-4 accent-[#284d45] disabled:cursor-not-allowed"
                      />
                    </label>
                    {isWinner && (
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
                        <option value={300}>300 points</option>
                        <option value={500}>500 points</option>
                        <option value={1000}>1,000 points</option>
                        <option value={2000}>2,000 points</option>
                      </select>
                    )}
                  </label>
                </div>
              </section>

              <section className="animate-rise animate-rise-delay-2 overflow-hidden rounded-xl bg-[#284d45] text-[#f8f4e9] shadow-[var(--shadow-lg)]">
                <div className="border-b border-[#55756c] px-5 pb-4 pt-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#d7a287]">Current score</div>
                      <div className="mt-2 font-serif text-[60px] leading-none">{score.finalScore}<span className="ml-2 text-[17px] text-[#b4c4bd]">pts</span></div>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#6e8d84] text-[#d7a287]"><Check size={22} /></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[.1em] text-[#b4c4bd]">
                    {score.scoringMode === 'standard' ? (
                      <>
                        <span><b className="text-[#f8f4e9]">{score.basePoints}</b> points</span>
                        <span><b className="text-[#f8f4e9]">{score.doubles}</b> doubles</span>
                      </>
                    ) : (
                      <span className="text-[#d7a287]">Special hand</span>
                    )}
                    {score.limitApplied && <span className="text-[#d7a287]">Limit applied ({limit})</span>}
                  </div>
                </div>
                
                <div className="p-5 sm:p-6">
                  <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.18em] text-[#b4c4bd]">Breakdown</span><button type="button" data-testid="button-copy-score" onClick={copyScore} className="flex items-center gap-1.5 text-[10px] font-semibold text-[#d7a287] transition hover:text-[#f8f4e9]">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy score'}</button></div>
                  
                  {score.validationErrors.length > 0 && (
                    <div className="mb-4 rounded-md border border-[#8a3c32] bg-[#3a201c] p-3 text-[11px] text-[#f0e9da]">
                      <div className="mb-2 flex items-center gap-1.5 font-semibold text-[#d7a287]"><AlertCircle size={14} /> Invalid hand</div>
                      <ul className="list-disc pl-4 space-y-1">
                        {score.validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1">
                    {score.pointRules.length > 0 && <div className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#b4c4bd]">Points</div>}
                    {score.pointRules.map((rule) => (
                      <div key={rule.id} className="border-b border-[#45665d] last:border-0">
                        <button type="button" data-testid={`button-rule-${rule.id}`} onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)} className="flex w-full items-center justify-between py-2 text-left text-[12px] text-[#f0e9da]">
                          <span>{rule.label}</span>
                          <span className="flex items-center gap-2 font-mono text-[11px] text-[#d7a287]">+{rule.amount}<ChevronDown size={13} className={`transition ${expandedRule === rule.id ? 'rotate-180' : ''}`} /></span>
                        </button>
                        {expandedRule === rule.id && <p className="pb-2 text-[11px] leading-5 text-[#b4c4bd]">{rule.description}</p>}
                      </div>
                    ))}
                    
                    {score.doubleRules.length > 0 && <div className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#b4c4bd]">Doubles</div>}
                    {score.doubleRules.map((rule) => (
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
                      <button type="button" data-testid="button-apply-score-mobile" disabled={!score.valid} onClick={applyScore} className="flex w-full items-center justify-center rounded-md bg-[#f3e8d4] px-4 py-3 text-[13px] font-bold text-[#284d45] disabled:cursor-not-allowed disabled:opacity-40">
                        Apply {score.finalScore} to {context.playerName}
                      </button>
                      <button type="button" onClick={leaveHand} className="mt-3 flex w-full items-center justify-center rounded-md border border-[#45665d] py-3 text-[13px] font-semibold text-[#c8d8d1]">
                        Back to game without applying a score
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={leaveHand} className="flex w-full items-center justify-center rounded-md border border-[#45665d] bg-[#284d45] py-3 text-[13px] font-semibold text-[#f8f4e9]">
                      {example ? 'Back to Special hands' : 'Leave hand and go home'}
                    </button>
                  )}
                </div>
              </section>

              {patterns.length > 0 && (
                <section className="animate-rise animate-rise-delay-3 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 shadow-[var(--shadow-sm)] sm:p-6" data-testid="detected-patterns">
                  <div className="mb-4 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#ae6249]">Detected patterns</div><h2 className="mt-1 font-serif text-[22px] text-[#284d45]">Why this hand scores</h2></div><Sparkles size={18} className="text-[#ae6249]" /></div>
                  <div className="space-y-2">
                    {patterns.map((pattern) => {
                      const referenceHref = patternReferenceHref(pattern);
                      return <div key={pattern.id} data-testid={`pattern-${pattern.id}`} className={`rounded-md border p-3 ${pattern.selected ? 'border-[#ae6249]/60 bg-[#fff4e8]' : 'border-[#b8cdbf] bg-[#edf3ed]'}`}>
                        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#284d45]"><Check size={14} className="text-[#477562]" />{referenceHref ? <a href={referenceHref} className="underline decoration-[#ae6249] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">{pattern.name}</a> : pattern.name}<span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-[#477562]">{pattern.effect}{pattern.selected ? ' · used' : ''}</span></div>
                        <p className="mt-1 pl-5 text-[10px] leading-4 text-[#7a7769]">{pattern.explanation}</p>
                      </div>;
                    })}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 border-t border-[#d8ceb8] px-5 py-5 lg:px-8"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#8c8a7f]">Local tool · no hand data leaves this device</p><p className="text-[11px] text-[#8c8a7f]">Built for the quiet moment before the next deal.</p></footer>
    </div>
  );
}

export default function App({ initialView = 'game', standaloneHand = false }: { initialView?: 'game' | 'hand'; standaloneHand?: boolean }) {
  const example = standaloneHand && typeof window !== 'undefined'
    ? specialHandExampleById(new URLSearchParams(window.location.search).get('example'))
    : undefined;
  const [view, setView] = useState<'game' | 'hand'>(initialView);
  const [scorerContext, setScorerContext] = useState<HandScorerContext | null>(null);
  const [returnedScore, setReturnedScore] = useState<
    HandScorerResult | null | undefined
  >(undefined);
  const [scorerSession, setScorerSession] = useState(0);

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
          <div className={view === 'game' ? 'block' : 'hidden'}>
            <GameScorer
              onOpenHandScorer={handleOpenHandScorer}
              returnedScore={returnedScore}
              onClearReturnedScore={() => setReturnedScore(undefined)}
            />
          </div>
          <div className={view === 'hand' ? 'block' : 'hidden'}>
            <HandScorer
              key={scorerSession}
              context={example ? exampleHandScorerContext(example) : scorerContext}
              onClose={handleCloseHandScorer}
              standaloneHand={standaloneHand}
              example={example}
            />
          </div>
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
