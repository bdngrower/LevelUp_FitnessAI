-- Migration: Add phone column to profiles table
-- Date: 2026-02-14
-- Author: LevelUp Agent

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
