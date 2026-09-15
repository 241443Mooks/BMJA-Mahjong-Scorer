from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one match, found {count}: {old[:160]!r}")
    p.write_text(text.replace(old, new, 1))


game = "artifacts/mahjong-scorer/src/game/GameScorer.tsx"

replace_once(
    game,
    "export const gameWorkspaceStage = (\n  game: GameState,\n  presentation: ReturnType<typeof settlementPreviewPresentation>,\n) => {\n  if (game.isComplete) return 'complete' as const;\n  return presentation === 'awaiting-scores' ? 'entry' as const : 'settlement' as const;\n};\n\n",
    "export const gameWorkspaceStage = (\n  game: GameState,\n  presentation: ReturnType<typeof settlementPreviewPresentation>,\n) => {\n  if (game.isComplete) return 'complete' as const;\n  return presentation === 'awaiting-scores' ? 'entry' as const : 'settlement' as const;\n};\n\ntype GameWorkspaceStage = ReturnType<typeof gameWorkspaceStage>;\n\nexport const shouldKeepScoreEntryOpen = (stage: GameWorkspaceStage, editingHand: boolean) =>\n  stage === 'entry' || editingHand;\n\nexport const shouldShowEditCurrentHandSummary = (stage: GameWorkspaceStage, editingHand: boolean) =>\n  stage === 'settlement' && !editingHand;\n\n",
)

replace_once(
    game,
    "      setScores(returned.draft.scores);\n      setScoreRecords(returned.draft.scoreRecords);\n      setError('');",
    "      setScores(returned.draft.scores);\n      setScoreRecords(returned.draft.scoreRecords);\n      setEditingHand(true);\n      setError('');",
)

replace_once(
    game,
    "  useEffect(() => {\n    if (workspaceStage !== 'entry') setEditingHand(false);\n  }, [workspaceStage]);\n\n",
    "",
)

replace_once(
    game,
    "    setScores({});\n    setScoreRecords({});\n    setIncidents([]);\n    const east = Object.entries(nextGame.seats).find(",
    "    setScores({});\n    setScoreRecords({});\n    setIncidents([]);\n    setEditingHand(false);\n    const east = Object.entries(nextGame.seats).find(",
)

replace_once(
    game,
    "          {!game.isComplete && <details ref={tableScoresRef} data-testid=\"section-table-scores\" open={workspaceStage === 'entry' || editingHand} onToggle={(event) => {\n            if (workspaceStage === 'settlement') setEditingHand(event.currentTarget.open);\n          }} className=\"screen-only scroll-mt-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6\">\n            {workspaceStage === 'settlement' && <summary className=\"mb-5 cursor-pointer font-mono text-[10px] uppercase tracking-[.16em] text-[#ae6249]\">Edit current hand</summary>}",
    "          {!game.isComplete && <details ref={tableScoresRef} data-testid=\"section-table-scores\" open={shouldKeepScoreEntryOpen(workspaceStage, editingHand)} onToggle={(event) => {\n            if (workspaceStage === 'settlement') setEditingHand(event.currentTarget.open);\n          }} className=\"screen-only scroll-mt-4 rounded-xl border border-[#d8ceb8] bg-[#fbf8ed] p-5 sm:p-6\">\n            {workspaceStage === 'settlement' && <summary className={shouldShowEditCurrentHandSummary(workspaceStage, editingHand) ? 'mb-5 cursor-pointer font-mono text-[10px] uppercase tracking-[.16em] text-[#ae6249]' : 'sr-only'}>Edit current hand</summary>}",
)

replace_once(
    game,
    "                          data-testid={`input-score-${player.id}`}\n                          value={scores[player.id] === undefined ? '' : scores[player.id]}\n                           onChange={(event) => {",
    "                          data-testid={`input-score-${player.id}`}\n                          value={scores[player.id] === undefined ? '' : scores[player.id]}\n                          onFocus={() => setEditingHand(true)}\n                           onChange={(event) => {",
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
    "  it('keeps manual score entry structurally stable while the player is editing', () => {\n    expect(shouldKeepScoreEntryOpen('entry', false)).toBe(true);\n    expect(shouldKeepScoreEntryOpen('settlement', true)).toBe(true);\n    expect(shouldKeepScoreEntryOpen('settlement', false)).toBe(false);\n    expect(shouldShowEditCurrentHandSummary('settlement', true)).toBe(false);\n    expect(shouldShowEditCurrentHandSummary('settlement', false)).toBe(true);\n  });\n\n  it('uses one main workspace stage instead of showing settlement before it is useful', () => {",
)

changelog = "CHANGELOG.md"
replace_once(
    changelog,
    "### Fixed\n\n- Closed the manual WCAG audit findings",
    "### Fixed\n\n- Kept manual table-score entry open, focused and visually stable while typing or editing multi-digit values; settlement becomes available without changing the focused score field's layout, and progression still requires the explicit record-hand action. [#191](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/191)\n- Closed the manual WCAG audit findings",
)

print("Applied bounded #191 manual-entry stability patch")
