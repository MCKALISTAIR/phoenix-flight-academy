-- Auto-cancel unpaid bookings after a timeout (24h) so slots free up.
CREATE OR REPLACE FUNCTION public.cancel_stale_unpaid_bookings(p_hours integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.bookings
     SET status = 'cancelled',
         cancellation_reason = 'Automatically cancelled: payment not completed within ' || p_hours || ' hours',
         cancelled_at = now()
   WHERE payment_status = 'unpaid'
     AND status IN ('pending', 'confirmed')
     AND created_at < now() - make_interval(hours => p_hours);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Run hourly via pg_cron (extension available on this project).
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cancel-stale-unpaid-bookings') THEN
    PERFORM cron.schedule('cancel-stale-unpaid-bookings', '15 * * * *', 'SELECT public.cancel_stale_unpaid_bookings(24)');
  END IF;
END $$;