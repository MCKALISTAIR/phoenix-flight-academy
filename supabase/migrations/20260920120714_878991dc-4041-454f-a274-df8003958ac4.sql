GRANT INSERT ON public.bookings TO anon;

CREATE POLICY "Public booking form creates pending bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND payment_status = 'unpaid'
  AND organization_id = '00000000-0000-0000-0000-000000000001'::uuid
  AND (user_id IS NULL OR user_id = auth.uid())
);