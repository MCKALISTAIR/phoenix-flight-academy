-- 1. Enquiries: status / notes / updated_at
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_status_check
  CHECK (status IN ('new','contacted','converted','archived'));

CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON public.contact_submissions (status, created_at DESC);

DROP TRIGGER IF EXISTS set_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER set_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Super admins view contact submissions" ON public.contact_submissions;
CREATE POLICY "Staff view contact submissions"
  ON public.contact_submissions FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'instructor')
  );

CREATE POLICY "Staff update contact submissions"
  ON public.contact_submissions FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'instructor')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'instructor')
  );

-- 2. Profiles: no more reading everyone's phone number
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users view own profile, staff view all"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'instructor')
  );

-- 3. Site content: hide unpublished drafts from anonymous visitors
REVOKE SELECT ON public.site_content FROM anon;
GRANT SELECT (id, section_key, data, updated_by, created_at, updated_at, organization_id)
  ON public.site_content TO anon;

-- 4. Payments ledger
DO $$ BEGIN
  CREATE TYPE public.payment_method_kind AS ENUM ('card_online','card_terminal','cash','bacs','voucher','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_direction AS ENUM ('payment','refund');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.booking_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
    REFERENCES public.organizations(id),
  direction public.payment_direction NOT NULL DEFAULT 'payment',
  method public.payment_method_kind NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  reference text,
  notes text,
  recorded_by uuid,
  received_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.booking_payments TO authenticated;
GRANT ALL ON public.booking_payments TO service_role;

ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view booking payments"
  ON public.booking_payments FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Staff record booking payments"
  ON public.booking_payments FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Staff amend booking payments"
  ON public.booking_payments FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS booking_payments_booking_idx ON public.booking_payments (booking_id, received_at DESC);
CREATE INDEX IF NOT EXISTS booking_payments_org_idx ON public.booking_payments (organization_id, received_at DESC);

DROP TRIGGER IF EXISTS set_booking_payments_updated_at ON public.booking_payments;
CREATE TRIGGER set_booking_payments_updated_at
  BEFORE UPDATE ON public.booking_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Stop the same online payment being counted twice
CREATE UNIQUE INDEX IF NOT EXISTS bookings_stripe_session_unique
  ON public.bookings (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_stripe_payment_intent_unique
  ON public.bookings (stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- 6. Self-hire approvals: allow re-approval after revocation, keep history
ALTER TABLE public.self_hire_approvals DROP CONSTRAINT IF EXISTS self_hire_approvals_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS self_hire_approvals_one_active_per_user
  ON public.self_hire_approvals (user_id) WHERE revoked_at IS NULL;

-- 7. Only super admins create organisations
DROP POLICY IF EXISTS "Authenticated users create organizations" ON public.organizations;
CREATE POLICY "Super admins create organizations"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 8. Missing foreign-key indexes
CREATE INDEX IF NOT EXISTS bookings_product_id_idx ON public.bookings (product_id);
CREATE INDEX IF NOT EXISTS flight_log_entries_aircraft_id_idx ON public.flight_log_entries (aircraft_id);
CREATE INDEX IF NOT EXISTS organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS organization_members_invited_by_idx ON public.organization_members (invited_by);
CREATE INDEX IF NOT EXISTS organization_invites_organization_id_idx ON public.organization_invites (organization_id);
CREATE INDEX IF NOT EXISTS organization_invites_invited_by_idx ON public.organization_invites (invited_by);
