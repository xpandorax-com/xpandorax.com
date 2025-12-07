-- Migration: Add security fields to users table
-- Run this against your D1 database

ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN password_reset_token TEXT;
ALTER TABLE users ADD COLUMN password_reset_expires INTEGER;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until INTEGER;
ALTER TABLE users ADD COLUMN last_login_at INTEGER;
ALTER TABLE users ADD COLUMN last_login_ip TEXT;
