import type { ResponsiveInstructionProps } from '../components/ResponsiveInstruction';

export const phaseOneHelpInstructions: Record<string, ResponsiveInstructionProps> = {
  'start-game': {
    steps: [
      'Open Score a game and choose the game length you want to play.',
      'Enter the four players in their starting East, South, West and North seats.',
      'Select Start game. The scorer keeps the seat assignments and prevailing Wind with the game.',
    ],
    images: {
      mobile: '/help/screenshots/game-setup-mobile.png',
      tablet: '/help/screenshots/game-setup-tablet.png',
      desktop: '/help/screenshots/game-setup-desktop.png',
    },
    alt: 'New game setup with Alex, Beth, Chris and Dee entered in the four starting Wind seats and the Start game button ready.',
    tip: 'Use the players’ starting seats here. The game handles later seat and prevailing-Wind progression for you.',
  },
  'mix-score-entry': {
    steps: [
      'Choose whether the current hand ended in Mah Jong or a draw, and select the winner when needed.',
      'Type a score directly for any player whose score you already know.',
      'Use Calculate beside a player when you want the detailed hand scorer to work the score out from the tiles.',
    ],
    images: {
      mobile: '/help/screenshots/game-table-score-entry-mobile.png',
      tablet: '/help/screenshots/game-table-score-entry-tablet.png',
      desktop: '/help/screenshots/game-table-score-entry-desktop.png',
    },
    alt: 'Current game hand showing the winner selector, player score fields and Calculate buttons for detailed hand scoring.',
    tip: 'Manual and calculated scores can be used together in the same hand. The game record keeps the difference visible.',
  },
  'ordinary-hand': {
    steps: [
      'Set whether the hand won before arranging the tiles, because winner status changes the hand-entry flow.',
      'Choose Pung, Chow, Kong or Pair for each completed group, then mark it exposed or concealed where relevant.',
      'Select a tile to define each group. Add another set until the hand structure you know is represented.',
    ],
    images: {
      mobile: '/help/screenshots/hand-builder-ordinary-mobile.png',
      tablet: '/help/screenshots/hand-builder-ordinary-tablet.png',
      desktop: '/help/screenshots/hand-builder-ordinary-desktop.png',
    },
    alt: 'Ordinary hand builder showing completed Chow, Pung and pair groups with exposed and concealed controls.',
    tip: 'You are describing the groups on the table, not translating them into scoring notation first.',
  },
  'partial-losing-hand': {
    steps: [
      'Leave Hand is winner off, then add the completed scoring sets or pair you can see.',
      'Add any Flowers or Seasons that belong to the hand.',
      'Use Remaining tiles for loose tiles you want recorded. You can stop before all 13 structural tiles are entered.',
    ],
    images: {
      mobile: '/help/screenshots/partial-losing-hand-mobile.png',
      tablet: '/help/screenshots/partial-losing-hand-tablet.png',
      desktop: '/help/screenshots/partial-losing-hand-desktop.png',
    },
    alt: 'Partial losing hand in the scorer showing completed sets, Remaining tiles and partial-hand guidance.',
    tip: 'Partial does not mean invalid. Complete evidence is only needed for conclusions that depend on the whole hand, such as whole-hand patterns and fishing.',
  },
  'winning-tile': {
    steps: [
      'Enter the completed winning hand and its winning method.',
      'When the winning-tile question appears, choose the tile that actually completed Mah Jong.',
      'Use I’m not sure if you cannot reliably identify it; the scorer will leave tile-sensitive conclusions unsupported rather than guess.',
    ],
    images: {
      mobile: '/help/screenshots/hand-winning-tile-mobile.png',
      tablet: '/help/screenshots/hand-winning-tile-tablet.png',
      desktop: '/help/screenshots/hand-winning-tile-desktop.png',
    },
    alt: 'Winning-tile question showing the entered hand tiles available to select and the I’m not sure option.',
    tip: 'The final 14-tile layout is not always enough to prove which scoring exception applies; the actual completing tile can matter.',
  },
  disagreement: {
    steps: [
      'Read the final score together with the points and doubles shown directly beneath it.',
      'Open the Breakdown entries to see which scoring components were applied.',
      'Check Why this hand scores for contextual patterns the scorer detected from the entered evidence.',
    ],
    images: {
      mobile: '/help/screenshots/hand-score-breakdown-mobile.png',
      tablet: '/help/screenshots/hand-score-breakdown-tablet.png',
      desktop: '/help/screenshots/hand-score-breakdown-desktop.png',
    },
    alt: 'Hand score panel showing the final score, points and doubles breakdown, followed by detected pattern explanations.',
    tip: 'If your table gets a different answer, this is the useful comparison point: entered evidence, scoring components and the rule interpretation are all visible.',
  },
  settlement: {
    steps: [
      'After a hand is confirmed, open its entry in the Game ledger.',
      'Read each player’s hand score, change for that hand and running total.',
      'Use the transaction lines to see exactly who paid whom and why, rather than relying only on the net totals.',
    ],
    images: {
      mobile: '/help/screenshots/game-ledger-settlement-mobile.png',
      tablet: '/help/screenshots/game-ledger-settlement-tablet.png',
      desktop: '/help/screenshots/game-ledger-settlement-desktop.png',
    },
    alt: 'Expanded Game ledger entry showing two confirmed hands, player running totals and the settlement transactions for the latest hand.',
    tip: 'The ledger is the canonical game history. Running balances, correction and the saved game record all derive from the confirmed hands here.',
  },
  'save-game': {
    steps: [
      'Open Print / Save game above the game ledger.',
      'Choose Full game record for the detailed evidence that was captured, or Game summary for a compact hand-by-hand record.',
      'Use the browser print destination to print the record or save it as a PDF.',
    ],
    images: {
      mobile: '/help/screenshots/print-save-mobile.png',
      tablet: '/help/screenshots/print-save-tablet.png',
      desktop: '/help/screenshots/print-save-desktop.png',
    },
    alt: 'Game ledger with the Print / Save game menu open, showing Full game record and Game summary choices.',
    tip: 'Both choices come from the same confirmed game ledger; the summary simply leaves out the detailed tile and scoring-evidence cards.',
  },
};
