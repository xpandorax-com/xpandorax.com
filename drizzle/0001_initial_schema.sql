-- Migration: 0001_initial_schema
-- Created at: 2024-12-08

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  hashed_password TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  is_premium INTEGER NOT NULL DEFAULT 0,
  premium_expires_at INTEGER,
  lemon_squeezy_customer_id TEXT,
  lemon_squeezy_subscription_id TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Sessions table (for Lucia auth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  video_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Actresses table
CREATE TABLE IF NOT EXISTS actresses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  image TEXT,
  video_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  abyss_embed TEXT NOT NULL,
  thumbnail TEXT,
  duration INTEGER,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  is_premium INTEGER NOT NULL DEFAULT 0,
  actress_id TEXT REFERENCES actresses(id) ON DELETE SET NULL,
  is_published INTEGER NOT NULL DEFAULT 0,
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Video Categories junction table
CREATE TABLE IF NOT EXISTS video_categories (
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);

-- Video Actresses junction table
CREATE TABLE IF NOT EXISTS video_actresses (
  video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  actress_id TEXT NOT NULL REFERENCES actresses(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, actress_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lemon_squeezy_subscription_id TEXT NOT NULL UNIQUE,
  lemon_squeezy_order_id TEXT,
  lemon_squeezy_product_id TEXT,
  lemon_squeezy_variant_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused', 'past_due', 'unpaid', 'on_trial')),
  current_period_start INTEGER,
  current_period_end INTEGER,
  cancelled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_actress_id ON videos(actress_id);
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_premium ON videos(is_premium);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_actresses_slug ON actresses(slug);
CREATE INDEX IF NOT EXISTS idx_video_categories_video ON video_categories(video_id);
CREATE INDEX IF NOT EXISTS idx_video_categories_category ON video_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_video_actresses_video ON video_actresses(video_id);
CREATE INDEX IF NOT EXISTS idx_video_actresses_actress ON video_actresses(actress_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_video_categories_video ON video_categories(video_id);
CREATE INDEX IF NOT EXISTS idx_video_categories_category ON video_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
