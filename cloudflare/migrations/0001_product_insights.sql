CREATE TABLE IF NOT EXISTS product_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'game_started',
      'game_completed',
      'game_recovered',
      'game_printed',
      'feedback_rating',
      'feedback_comment'
    )
  ),
  surface TEXT CHECK (surface IS NULL OR surface IN ('game_complete')),
  game_length TEXT NOT NULL CHECK (game_length IN ('one-round', 'full-game')),
  hand_count INTEGER CHECK (hand_count IS NULL OR hand_count >= 0),
  print_mode TEXT CHECK (print_mode IS NULL OR print_mode IN ('summary', 'full')),
  rating TEXT CHECK (rating IS NULL OR rating IN ('yes', 'no')),
  comment TEXT CHECK (comment IS NULL OR length(comment) <= 1000)
);

CREATE INDEX IF NOT EXISTS product_insights_event_created_at
  ON product_insights (event_type, created_at);
