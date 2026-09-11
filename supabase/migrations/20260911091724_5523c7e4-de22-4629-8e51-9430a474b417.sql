CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_aircraft_overlap
  EXCLUDE USING gist (
    aircraft_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (aircraft_id IS NOT NULL AND status IN ('pending','confirmed'));

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_no_instructor_overlap
  EXCLUDE USING gist (
    instructor_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (instructor_id IS NOT NULL AND status IN ('pending','confirmed'));

CREATE OR REPLACE FUNCTION public.cancel_stale_unpaid_bookings(p_hours integer DEFAULT 24)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.bookings b
     SET status = 'cancelled',
         cancellation_reason = 'Automatically cancelled: payment not completed within ' || p_hours || ' hours',
         cancelled_at = now()
    FROM public.booking_products p
   WHERE p.id = b.product_id
     AND p.payment_mode <> 'invoice'
     AND b.payment_status = 'unpaid'
     AND b.status IN ('pending', 'confirmed')
     AND b.created_at < now() - make_interval(hours => p_hours);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;