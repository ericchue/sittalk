-- ============================================================
-- SITTALK — 003 Daily Story Expiry
-- ============================================================

-- Add 'expired' status to stories check constraint
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_status_check;
ALTER TABLE stories ADD CONSTRAINT stories_status_check
  CHECK (status IN ('active', 'completed', 'expired'));

-- Function: expire yesterday's active stories
CREATE OR REPLACE FUNCTION expire_old_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stories
  SET status = 'expired'
  WHERE status = 'active'
    AND DATE(created_at AT TIME ZONE 'Asia/Seoul') < CURRENT_DATE AT TIME ZONE 'Asia/Seoul';
END;
$$;

REVOKE EXECUTE ON FUNCTION expire_old_stories() FROM public, anon;

-- Schedule daily expiry at midnight KST (15:00 UTC)
-- Requires pg_cron extension (available on Supabase Pro)
-- If on free tier, run expire_old_stories() manually or via Edge Function cron
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'sittalk-daily-expiry',
      '0 15 * * *',  -- 00:00 KST = 15:00 UTC
      'SELECT expire_old_stories();'
    );
  END IF;
END $$;

-- Grant authenticated users to call expire function via RPC (for Edge Function trigger)
GRANT EXECUTE ON FUNCTION expire_old_stories() TO service_role;
