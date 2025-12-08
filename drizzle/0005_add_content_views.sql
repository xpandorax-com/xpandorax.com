-- Migration: 0005_add_content_views.sql
-- Add content_views table for tracking view counts for videos and pictures

CREATE TABLE IF NOT EXISTS content_views (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'picture', 'actress')),
  views INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(content_id, content_type)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_content_views_content_id ON content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content_type ON content_views(content_type);
CREATE INDEX IF NOT EXISTS idx_content_views_lookup ON content_views(content_id, content_type);
