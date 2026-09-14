from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one match, found {count}")
    p.write_text(text.replace(old, new, 1))


app = "artifacts/mahjong-scorer/src/App.tsx"
replace_once(
    app,
    '''                  <p className="mb-4 text-[13px] text-[#66746e]">
                    Which tile completed Mah Jong?
                  </p>''',
    '''                  <p className="mb-4 text-[13px] text-[#66746e]">
                    Which tile completed Mah Jong? <a href="/help#winning-tile" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Why this matters</a>
                  </p>''',
)
replace_once(
    app,
    '<strong className="text-[#284d45]">Partial evidence</strong> — add Remaining tiles only for whole-hand pattern or fishing checks.</p>',
    '<strong className="text-[#284d45]">Partial evidence</strong> — add Remaining tiles only for whole-hand pattern or fishing checks. <a href="/help#partial-losing-hand" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Partial-hand help</a></p>',
)

game = "artifacts/mahjong-scorer/src/game/GameScorer.tsx"
replace_once(
    game,
    '''              browser so you can continue after a refresh.
            </p>''',
    '''              browser so you can continue after a refresh. <a href="/help#refresh-game" className="font-semibold text-[#284d45] underline decoration-[#cfa58f] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">How recovery works</a>
            </p>''',
)
replace_once(
    game,
    '''              <div className="mt-2 font-serif text-[27px]">
                {game.isComplete ? 'Game Complete' : outcomeType === 'draw' ? 'No payments this hand' : 'Who pays whom'}
              </div>''',
    '''              <div className="mt-2 font-serif text-[27px]">
                {game.isComplete ? 'Game Complete' : outcomeType === 'draw' ? 'No payments this hand' : 'Who pays whom'}
              </div>
              {!game.isComplete && <a href="/help#settlement" className="mt-2 inline-flex text-[11px] font-semibold text-[#e8eee9] underline decoration-[#d7a287] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7a287]">How settlement works</a>}''',
)
replace_once(
    game,
    '''              <Undo2 size={14} /> Undo last hand
            </button>
            <button''',
    '''              <Undo2 size={14} /> Undo last hand
            </button>
            <a href="/help#correct-hand" className="rounded-md px-3 py-2 text-[11px] font-semibold text-[#477562] underline decoration-[#cfc3aa] underline-offset-4 hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Help correcting a hand</a>
            <button''',
)
replace_once(
    game,
    '''                <button type="button" data-testid="button-print-summary" onClick={() => printGame('summary')} className="rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]">Print / Save game summary</button>''',
    '''                <button type="button" data-testid="button-print-summary" onClick={() => printGame('summary')} className="rounded-md px-3 py-2 text-left text-[11px] font-semibold text-[#284d45] hover:bg-[#efe8da]">Print / Save game summary</button>
                <a href="/help#save-game" className="rounded-md px-3 py-2 text-[11px] font-semibold text-[#477562] underline decoration-[#cfc3aa] underline-offset-4 hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249]">Saving / printing help</a>''',
)

# Guard the intended stable help anchors.
for path, anchors in {
    app: ["/help#winning-tile", "/help#partial-losing-hand"],
    game: ["/help#refresh-game", "/help#settlement", "/help#correct-hand", "/help#save-game"],
}.items():
    text = Path(path).read_text()
    for anchor in anchors:
        if text.count(anchor) != 1:
            raise SystemExit(f"{path}: expected one {anchor}, found {text.count(anchor)}")
