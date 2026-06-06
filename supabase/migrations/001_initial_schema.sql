-- ============================================================
-- SITTALK — 001 Initial Schema
-- ============================================================

-- Emotion enum
CREATE TYPE emotion AS ENUM ('happy', 'sad', 'tired', 'stressed', 'hopeful');

-- ──────────────────────────────────────────────────────────────
-- profiles
-- ──────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  nickname    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

GRANT SELECT, INSERT, UPDATE ON profiles TO anon, authenticated;

-- ──────────────────────────────────────────────────────────────
-- stories
-- ──────────────────────────────────────────────────────────────
CREATE TABLE stories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name  text NOT NULL,
  emotion        emotion NOT NULL,
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  like_count     integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_select_all" ON stories
  FOR SELECT USING (true);

CREATE POLICY "stories_insert_auth" ON stories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "stories_update_auth" ON stories
  FOR UPDATE USING (auth.uid() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE ON stories TO authenticated;
GRANT SELECT ON stories TO anon;

-- ──────────────────────────────────────────────────────────────
-- story_entries
-- ──────────────────────────────────────────────────────────────
CREATE TABLE story_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id     uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname     text NOT NULL,
  content      text NOT NULL CHECK (char_length(content) <= 300),
  order_index  integer NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, order_index)
);

ALTER TABLE story_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entries_select_all" ON story_entries
  FOR SELECT USING (true);

CREATE POLICY "entries_insert_own" ON story_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No UPDATE / DELETE policies → entries are immutable

GRANT SELECT, INSERT ON story_entries TO authenticated;
GRANT SELECT ON story_entries TO anon;

-- ──────────────────────────────────────────────────────────────
-- story_likes
-- ──────────────────────────────────────────────────────────────
CREATE TABLE story_likes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, user_id)
);

ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all" ON story_likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON story_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete_own" ON story_likes
  FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON story_likes TO authenticated;
GRANT SELECT ON story_likes TO anon;
