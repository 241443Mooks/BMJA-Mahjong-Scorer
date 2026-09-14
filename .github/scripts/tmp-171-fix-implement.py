from pathlib import Path

path = Path('.github/scripts/tmp-171-implement.py')
text = path.read_text()
old = """changelog = ROOT / 'CHANGELOG.md'\nreplace_once(\n    changelog,\n    '### Changed\\n\\n',\n    '### Changed\\n\\n- Aligned final public SEO and crawl output with the settled Table Companion route model, including real prerendered route content, rules-aware product metadata and task-led internal links. [#171](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/171)\\n',\n)\n"""
new = """changelog = ROOT / 'CHANGELOG.md'\nchangelog_text = changelog.read_text()\nmarker = '### Changed\\n\\n'\nif marker not in changelog_text:\n    raise RuntimeError('CHANGELOG.md: Unreleased Changed marker not found')\nentry = '- Aligned final public SEO and crawl output with the settled Table Companion route model, including real prerendered route content, rules-aware product metadata and task-led internal links. [#171](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/171)\\n'\nchangelog.write_text(changelog_text.replace(marker, marker + entry, 1))\n"""
if text.count(old) != 1:
    raise RuntimeError(f'Expected one changelog implementation block; found {text.count(old)}')
path.write_text(text.replace(old, new))
print('Tightened #171 changelog insertion guard.')
