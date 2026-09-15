from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one match, found {count}: {old[:180]!r}")
    p.write_text(text.replace(old, new, 1))


game = "artifacts/mahjong-scorer/src/game/GameScorer.tsx"

replace_once(
    game,
    "export const gameWorkspaceStage = (\n  game: GameState,\n  presentation: ReturnType<typeof settlementPreviewPresentation>,\n) => {\n  if (game.isComplete) return 'complete' as const;\n  return presentation === 'awaiting-scores' ? 'entry' as const : 'settlement' as const;\n};\n\n",
    "export const gameWorkspaceStage = (\n  game: GameState,\n  presentation: ReturnType<typeof settlementPreviewPresentation>,\n  settlementReviewRequested = true,\n) => {\n  if (game.isComplete) return 'complete' as const;\n  if (presentation === 'awaiting-scores') return 'entry' as const;\n  return settlementReviewRequested ? 'settlement' as const : 'entry' as const;\n};\n\ntype GameWorkspaceStage = ReturnType<typeof gameWorkspaceStage>;\n\nexport const shouldKeepScoreEntryOpen = (stage: GameWorkspaceStage, editingHand: boolean) =>\n  stage === 'entry' || editingHand;\n\nexport const shouldShowEditCurrentHandSummary = (stage: GameWorkspaceStage, editingHand: boolean) =>\n  stage === 'settlement' && !editingHand;\n\n",
)

replace_once(
    game,
    "  const [editingHand, setEditingHand] = useState(false);\n  const tableScoresRef = useRef<HTMLDetailsElement>(null);",
    "  const [editingHand, setEditingHand] = useState(false);\n  const [settlementReviewRequested, setSettlementReviewRequested] = useState(false);\n  const tableScoresRef = useRef<HTMLDetailsElement>(null);",
)

replace_once(
    game,
    "      setScores(returned.draft.scores);\n      setScoreRecords(returned.draft.scoreRecords);\n      setError('');",
    "      setScores(returned.draft.scores);\n      setScoreRecords(returned.draft.scoreRecords);\n      setEditingHand(true);\n      setSettlementReviewRequested(false);\n      setError('');",
)

replace_once(
    game,
    "    setOutcomeType(nextOutcome.type);\n    if (nextOutcome.type === 'win') setWinnerId(nextOutcome.winnerId);\n    setError(",
    "    setOutcomeType(nextOutcome.type);\n    if (nextOutcome.type === 'win') setWinnerId(nextOutcome.winnerId);\n    setSettlementReviewRequested(nextOutcome.type === 'draw');\n    setError(",
)

replace_once(
    game,
    "  const workspaceStage = game ? gameWorkspaceStage(game, previewPresentation) : 'entry';\n\n  useEffect(() => {\n    if (workspaceStage !== 'entry') setEditingHand(false);\n  }, [workspaceStage]);\n\n",
    "  const settlementReadyForReview = previewPresentation !== 'awaiting-scores';\n  const workspaceStage = game\n    ? gameWorkspaceStage(\n        game,\n        previewPresentation,\n        settlementReviewRequested || outcomeType === 'draw',\n      )\n    : 'entry';\n\n",
)

replace_once(
    game,
    "    setIncidents([]);\n    setEditingHand(false);\n    setWinnerId(players[0].id);",
    "    setIncidents([]);\n    setEditingHand(false);\n    setSettlementReviewRequested(false);\n    setWinnerId(players[0].id);",
)

replace_once(
    game,
    "    setOutcomeType('win');\n    setEditingHand(false);\n    setError('');",
    "    setOutcomeType('win');\n    setEditingHand(false);\n    setSettlementReviewRequested(false);\n    setError('');",
)

replace_once(
    game,
    "    setScores({});\n    setScoreRecords({});\n    setIncidents([]);\n    const east = Object.entries(nextGame.seats).find(",
    "    setScores({});\n    setScoreRecords({});\n    setIncidents([]);\n    setEditingHand(false);\n    setSettlementReviewRequested(false);\n    const east = Object.entries(nextGame.seats).find(",
)

replace_once(
    game,
    "          {!game.isComplete && <details ref={tableScoresRef} data-testid=\"section-table-scores\" open={workspaceStage === 'entry' || editingHand} onToggle={(event) => {\n            if (workspaceStage === 'settlement') setEditingHand(event.currentTarget.open);\n          }} className=\"screen-only scroll-mt-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6\">\n            {workspaceStage === 'settlement' && <summary className=\"mb-5 cursor-pointer font-mono text-[10px] uppercase tracking-[.16em] text-[#ae6249]\">Edit current hand</summary>}",
    "          {!game.isComplete && <details ref={tableScoresRef} data-testid=\"section-table-scores\" open={shouldKeepScoreEntryOpen(workspaceStage, editingHand)} onToggle={(event) => {\n            if (workspaceStage === 'settlement') setEditingHand(event.currentTarget.open);\n          }} className=\"screen-only scroll-mt-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6\">\n            {shouldShowEditCurrentHandSummary(workspaceStage, editingHand) && <summary className=\"mb-5 cursor-pointer font-mono text-[10px] uppercase tracking-[.16em] text-[#ae6249]\">Edit current hand</summary>}",
)

replace_once(
    game,
    "                          data-testid={`input-score-${player.id}`}\n                          value={scores[player.id] === undefined ? '' : scores[player.id]}\n                           onChange={(event) => {",
    "                          data-testid={`input-score-${player.id}`}\n                          value={scores[player.id] === undefined ? '' : scores[player.id]}\n                          onFocus={() => setEditingHand(true)}\n                           onChange={(event) => {",
)

replace_once(
    game,
    "                             setScores(next.scores);\n                             setScoreRecords(next.scoreRecords);\n                           }}",
    "                             setScores(next.scores);\n                             setScoreRecords(next.scoreRecords);\n                             setSettlementReviewRequested(false);\n                           }}",
)

replace_once(
    game,
    "                  </section>\n                )}\n              </>\n            )}\n          </details>}",
    "                  </section>\n                )}\n                {outcomeType === 'win' && settlementReadyForReview && workspaceStage === 'entry' && (\n                  <div className=\"mt-5 flex justify-end\">\n                    <button\n                      type=\"button\"\n                      data-testid=\"button-review-settlement\"\n                      onClick={() => setSettlementReviewRequested(true)}\n                      className=\"inline-flex min-h-11 items-center gap-2 rounded-md bg-[#284d45] px-4 py-2 text-[12px] font-semibold text-[#f8f4e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2\"\n                    >\n                      Review settlement <ArrowRight size={15} aria-hidden=\"true\" />\n                    </button>\n                  </div>\n                )}\n              </>\n            )}\n          </details>}",
)

test = "artifacts/mahjong-scorer/src/game/GameScorer.test.ts"
replace_once(
    test,
    "import { gameRecordRulesLabel, gameWorkspaceStage, getRoundSettlementPreview, previewRoundSettlement, recoveredGameConflictsWithRoute, settlementPreviewPresentation, shouldShowBritishSetupHelper } from './GameScorer';",
    "import { gameRecordRulesLabel, gameWorkspaceStage, getRoundSettlementPreview, previewRoundSettlement, recoveredGameConflictsWithRoute, settlementPreviewPresentation, shouldKeepScoreEntryOpen, shouldShowBritishSetupHelper, shouldShowEditCurrentHandSummary } from './GameScorer';",
)
replace_once(
    test,
    "  it('uses one main workspace stage instead of showing settlement before it is useful', () => {",
    "  it('keeps manual score entry structurally stable until settlement is deliberately reviewed', () => {\n    expect(shouldKeepScoreEntryOpen('entry', false)).toBe(true);\n    expect(shouldKeepScoreEntryOpen('settlement', true)).toBe(true);\n    expect(shouldKeepScoreEntryOpen('settlement', false)).toBe(false);\n    expect(shouldShowEditCurrentHandSummary('settlement', true)).toBe(false);\n    expect(shouldShowEditCurrentHandSummary('settlement', false)).toBe(true);\n  });\n\n  it('uses a deliberate settlement-review boundary instead of changing context on score input', () => {",
)
replace_once(
    test,
    "    expect(gameWorkspaceStage(game, 'awaiting-scores')).toBe('entry');\n    expect(gameWorkspaceStage(game, 'transactions')).toBe('settlement');\n    expect(gameWorkspaceStage(game, 'no-payments')).toBe('settlement');\n\n    expect(gameWorkspaceStage({ ...game, isComplete: true }, 'awaiting-scores')).toBe('complete');",
    "    expect(gameWorkspaceStage(game, 'awaiting-scores', false)).toBe('entry');\n    expect(gameWorkspaceStage(game, 'transactions', false)).toBe('entry');\n    expect(gameWorkspaceStage(game, 'transactions', true)).toBe('settlement');\n    expect(gameWorkspaceStage(game, 'no-payments', true)).toBe('settlement');\n\n    expect(gameWorkspaceStage({ ...game, isComplete: true }, 'awaiting-scores', false)).toBe('complete');",
)

changelog = "CHANGELOG.md"
replace_once(
    changelog,
    "### Fixed\n\n- Closed the manual WCAG audit findings",
    "### Fixed\n\n- Kept manual table-score entry calm while typing or editing multi-digit values by requiring an explicit **Review settlement** action before the settlement workspace appears; progression still requires **Record hand and advance**. [#191](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/191)\n- Closed the manual WCAG audit findings",
)

print("Applied bounded #191 deliberate-review patch")
