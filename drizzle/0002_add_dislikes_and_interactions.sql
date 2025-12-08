-- Add dislikes column and video_interactions table
-- Migration: 0002_add_dislikes_and_interactions.sql

-- Add dislikes column to videos table
ALTER TABLE videos ADD COLUMN dislikes INTEGER NOT NULL DEFAULT 0;

-- Create video_interactions table for tracking user likes/dislikes
CREATE TABLE IF NOT EXISTS video_interactions (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'dislike')),
  created_at INTEGER NOT NULL,
  UNIQUE(video_id, visitor_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_interactions_video_id ON video_interactions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_interactions_visitor_id ON video_interactions(visitor_id);
