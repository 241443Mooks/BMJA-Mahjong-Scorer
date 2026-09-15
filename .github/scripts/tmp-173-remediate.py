from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one match, found {count}: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))


site = "artifacts/mahjong-scorer/src/components/SiteHeader.tsx"
replace_once(
    site,
    "import { useEffect, useId, useState, type MouseEvent } from 'react';",
    "import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';",
)
replace_once(
    site,
    "  const menuId = useId();\n\n  useEffect(() => {\n    const onKeyDown = (event: KeyboardEvent) => {\n      if (event.key === 'Escape') {\n        setOpen(false);\n        setOpenGroup(null);\n      }\n    };\n    document.addEventListener('keydown', onKeyDown);\n    return () => document.removeEventListener('keydown', onKeyDown);\n  }, []);",
    "  const menuId = useId();\n  const mobileTriggerRef = useRef<HTMLButtonElement>(null);\n  const groupTriggerRefs = useRef(new Map<string, HTMLButtonElement>());\n\n  useEffect(() => {\n    const onKeyDown = (event: KeyboardEvent) => {\n      if (event.key !== 'Escape') return;\n      const activeElement = document.activeElement;\n\n      if (open) {\n        const menu = document.getElementById(menuId);\n        const restoreMobileFocus = !!activeElement && !!menu?.contains(activeElement);\n        setOpen(false);\n        if (restoreMobileFocus) {\n          window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());\n        }\n      }\n\n      if (openGroup) {\n        const trigger = groupTriggerRefs.current.get(openGroup);\n        const wrapper = trigger?.parentElement;\n        const restoreGroupFocus = !!activeElement && !!wrapper?.contains(activeElement) && activeElement !== trigger;\n        setOpenGroup(null);\n        if (restoreGroupFocus) {\n          window.requestAnimationFrame(() => trigger?.focus());\n        }\n      }\n    };\n    document.addEventListener('keydown', onKeyDown);\n    return () => document.removeEventListener('keydown', onKeyDown);\n  }, [menuId, open, openGroup]);",
)
replace_once(
    site,
    "              <button type=\"button\" aria-expanded={openGroup === group.label} onClick={() => setOpenGroup((current) => current === group.label ? null : group.label)} className=\"flex min-h-11 items-center gap-1 rounded-md px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]\">",
    "              <button ref={(element) => { if (element) groupTriggerRefs.current.set(group.label, element); else groupTriggerRefs.current.delete(group.label); }} type=\"button\" aria-expanded={openGroup === group.label} onClick={() => setOpenGroup((current) => current === group.label ? null : group.label)} className=\"flex min-h-11 items-center gap-1 rounded-md px-3 text-[15px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]\">",
)
replace_once(
    site,
    "            <button type=\"button\" aria-expanded={openGroup === 'More'} onClick={() => setOpenGroup((current) => current === 'More' ? null : 'More')} className=\"flex min-h-11 items-center gap-1 rounded-md px-3 text-[14px] font-semibold text-[#66746e] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]\">",
    "            <button ref={(element) => { if (element) groupTriggerRefs.current.set('More', element); else groupTriggerRefs.current.delete('More'); }} type=\"button\" aria-expanded={openGroup === 'More'} onClick={() => setOpenGroup((current) => current === 'More' ? null : 'More')} className=\"flex min-h-11 items-center gap-1 rounded-md px-3 text-[14px] font-semibold text-[#66746e] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]\">",
)
replace_once(
    site,
    "          <button type=\"button\" aria-label={open ? 'Close site navigation' : 'Open site navigation'} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((current) => !current)} className=\"flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#cfc3aa] bg-[#fbf8ed] text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]\" >",
    "          <button ref={mobileTriggerRef} type=\"button\" aria-label={open ? 'Close site navigation' : 'Open site navigation'} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((current) => !current)} className=\"flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#cfc3aa] bg-[#fbf8ed] text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]\" >",
)

game = "artifacts/mahjong-scorer/src/game/GameScorer.tsx"
replace_once(
    game,
    "const startOver = () => {\n    if (typeof window !== 'undefined') clearGameRecovery(window.localStorage);",
    "const startOver = () => {\n    if (typeof window !== 'undefined' && !window.confirm('Start over? Your current saved game will be discarded.')) return;\n    if (typeof window !== 'undefined') clearGameRecovery(window.localStorage);",
)
replace_once(
    game,
    "${recoveredProfileConflictsWithRoute ? 'text-[#9a4d3a]' : 'text-[#477562]'}",
    "${recoveredProfileConflictsWithRoute ? 'text-[#9a4d3a]' : 'text-[#3f6556]'}",
)
replace_once(
    game,
    "              <p className=\"mt-4 text-[12px] font-semibold text-[#9a4d3a]\">\n                {error}\n              </p>",
    "              <p role=\"alert\" className=\"mt-4 text-[12px] font-semibold text-[#9a4d3a]\">\n                {error}\n              </p>",
)
replace_once(
    game,
    "                    type=\"button\"\n                    data-testid=\"button-outcome-win\"\n                    onClick={() =>",
    "                    type=\"button\"\n                    data-testid=\"button-outcome-win\"\n                    aria-pressed={outcomeType === 'win'}\n                    onClick={() =>",
)
replace_once(
    game,
    "                    className={`rounded-md px-4 py-2 text-[11px] font-semibold ${",
    "                    className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[11px] font-semibold ${",
)
replace_once(
    game,
    "                  >\n                    Mah Jong\n                  </button>\n                  <button\n                    type=\"button\"\n                    data-testid=\"button-outcome-draw\"",
    "                  >\n                    {outcomeType === 'win' && <Check size={13} aria-hidden=\"true\" />}\n                    Mah Jong\n                  </button>\n                  <button\n                    type=\"button\"\n                    data-testid=\"button-outcome-draw\"\n                    aria-pressed={outcomeType === 'draw'}",
)
replace_once(
    game,
    "                    className={`rounded-md px-4 py-2 text-[11px] font-semibold ${\n                      outcomeType === 'draw'",
    "                    className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[11px] font-semibold ${\n                      outcomeType === 'draw'",
)
replace_once(
    game,
    "                  >\n                    Draw / wash-out\n                  </button>",
    "                  >\n                    {outcomeType === 'draw' && <Check size={13} aria-hidden=\"true\" />}\n                    Draw / wash-out\n                  </button>",
)
replace_once(
    game,
    "                  <p data-testid=\"preview-domain-error\" className=\"mt-3 rounded-md bg-[#6b3a36] px-3 py-2 text-[11px] font-semibold leading-5 text-[#ffe5db]\">",
    "                  <p role=\"alert\" data-testid=\"preview-domain-error\" className=\"mt-3 rounded-md bg-[#6b3a36] px-3 py-2 text-[11px] font-semibold leading-5 text-[#ffe5db]\">",
)
replace_once(
    game,
    "                  <p className=\"mt-3 text-[11px] font-semibold text-[#e6a48d]\">\n                    {error}\n                  </p>",
    "                  <p role=\"alert\" className=\"mt-3 text-[11px] font-semibold text-[#e6a48d]\">\n                    {error}\n                  </p>",
)

hand = "artifacts/mahjong-scorer/src/game/HandRecord.tsx"
replace_once(
    hand,
    "    <div\n      className={`relative h-12 w-9 shrink-0 rounded-[5px] sm:h-[60px] sm:w-[45px] ${winning ? \"ring-2 ring-[#ae6249] ring-offset-1\" : \"\"}`}\n      aria-label={winning ? `${artwork.label}, winning tile` : artwork.label}\n    >\n      <img\n        src={tileAssetUrl(artwork.asset)}\n        alt=\"\"",
    "    <div\n      className={`relative h-12 w-9 shrink-0 rounded-[5px] sm:h-[60px] sm:w-[45px] ${winning ? \"ring-2 ring-[#ae6249] ring-offset-1\" : \"\"}`}\n    >\n      <img\n        src={tileAssetUrl(artwork.asset)}\n        alt={winning ? `${artwork.label}, winning tile` : artwork.label}",
)

hand_test = "artifacts/mahjong-scorer/src/game/HandRecord.test.ts"
replace_once(
    hand_test,
    "    expect(complete).toContain(\"Flowers and Seasons\");\n    expect(partial).toContain(\"Bob · Partial recorded hand\");",
    "    expect(complete).toContain(\"Flowers and Seasons\");\n    expect(complete).toMatch(/<img[^>]+alt=\\\"[^\\\"]+\\\"/);\n    expect(complete).toContain(\"winning tile\");\n    expect(complete).not.toMatch(/<div[^>]+aria-label=/);\n    expect(partial).toContain(\"Bob · Partial recorded hand\");",
)

changelog = "CHANGELOG.md"
replace_once(
    changelog,
    "_No unreleased product changes._",
    "### Fixed\n\n- Closed the manual WCAG audit findings around Escape focus restoration, recovered-game status contrast, recorded-tile semantics, live error announcements, outcome selected state and confirmation before discarding a recoverable game. [#194](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/194) [#195](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/195) [#196](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/196) [#197](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/197) [#198](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/198) [#199](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/199)",
)

print("Applied bounded #194-#199 remediation patch")
