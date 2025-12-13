-- Migration: Add watch history and bookmarks tables
-- Created: 2024-12-14

-- Watch History table - tracks which videos users have watched
CREATE TABLE IF NOT EXISTS watch_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL, -- Sanity video _id
  watched_at INTEGER NOT NULL, -- timestamp
  watch_duration INTEGER DEFAULT 0, -- seconds watched
  completed INTEGER DEFAULT 0, -- boolean: 1 if watched to end
  last_position INTEGER DEFAULT 0, -- resume position in seconds
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create index for efficient user history lookups
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_video_id ON watch_history(video_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_watch_history_user_video ON watch_history(user_id, video_id);

-- Bookmarks/Favorites table - user saved videos
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL, -- Sanity video _id
  created_at INTEGER NOT NULL
);

-- Create index for efficient bookmark lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_video_id ON bookmarks(video_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_user_video ON bookmarks(user_id, video_id);
