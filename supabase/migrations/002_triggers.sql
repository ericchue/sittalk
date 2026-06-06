-- ============================================================
-- SITTALK — 002 Triggers & Functions
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Auto-create profile on signup
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM public, anon;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 2. Sync like_count on stories
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_story_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.stories SET like_count = like_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.stories SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_story_like_count() FROM public, anon;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON story_likes
  FOR EACH ROW EXECUTE FUNCTION update_story_like_count();

-- ──────────────────────────────────────────────────────────────
-- 3. Auto-complete story when 5 entries reached
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_story_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry_count integer;
BEGIN
  SELECT COUNT(*) INTO entry_count
  FROM public.story_entries
  WHERE story_id = NEW.story_id;

  IF entry_count >= 5 THEN
    UPDATE public.stories
    SET status = 'completed', completed_at = now()
    WHERE id = NEW.story_id AND status = 'active';
  END IF;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION check_story_completion() FROM public, anon;

CREATE TRIGGER on_entry_inserted
  AFTER INSERT ON story_entries
  FOR EACH ROW EXECUTE FUNCTION check_story_completion();

-- ──────────────────────────────────────────────────────────────
-- 4. Prevent consecutive entries by same user
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION prevent_consecutive_entries()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_user_id uuid;
BEGIN
  SELECT user_id INTO last_user_id
  FROM public.story_entries
  WHERE story_id = NEW.story_id
  ORDER BY order_index DESC
  LIMIT 1;

  IF last_user_id IS NOT NULL AND last_user_id = NEW.user_id THEN
    RAISE EXCEPTION '연속으로 이어쓸 수 없습니다. 다른 사람이 먼저 참여해야 합니다.';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION prevent_consecutive_entries() FROM public, anon;

CREATE TRIGGER before_entry_insert
  BEFORE INSERT ON story_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_consecutive_entries();
