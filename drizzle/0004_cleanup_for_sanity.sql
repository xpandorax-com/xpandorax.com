-- Migration: 0004_cleanup_for_sanity.sql
-- Cleanup: Remove content tables since Sanity is the CMS
-- Keep only user-related tables in D1

-- Drop content tables that are managed by Sanity CMS
DROP TABLE IF EXISTS video_actresses;
DROP TABLE IF EXISTS video_categories;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS actresses;
DROP TABLE IF EXISTS categories;

-- Now create video_interactions table (without foreign key to videos since videos are in Sanity)
CREATE TABLE IF NOT EXISTS video_interactions (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at INTEGER NOT NULL,
  UNIQUE(video_id, visitor_id)
);

-- Create indexes for video_interactions
CREATE INDEX IF NOT EXISTS idx_video_interactions_video_id ON video_interactions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_interactions_visitor_id ON video_interactions(visitor_id);

-- Create comments table (without foreign key to videos since videos are in Sanity)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  is_edited INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
