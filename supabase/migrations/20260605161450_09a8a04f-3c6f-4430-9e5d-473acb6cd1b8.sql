-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE public.booking_product_kind AS ENUM ('experience', 'lesson', 'self_hire');
CREATE TYPE public.booking_payment_mode AS ENUM ('full', 'deposit', 'invoice');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE public.booking_payment_status AS ENUM ('unpaid', 'deposit_paid', 'paid', 'refunded', 'partial_refund');
CREATE TYPE public.booking_resource_kind AS ENUM ('aircraft', 'instructor');

-- =========================================================
-- booking_products
-- =========================================================

CREATE TABLE public.booking_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind public.booking_product_kind NOT NULL,
  name text NOT NULL,
  tagline text,
  description text,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  package_price_cents integer CHECK (package_price_cents IS NULL OR package_price_cents >= 0),
  instructor_fee_per_hour_cents integer CHECK (instructor_fee_per_hour_cents IS NULL OR instructor_fee_per_hour_cents >= 0),
  payment_mode public.booking_payment_mode NOT NULL DEFAULT 'full',
  deposit_pct integer NOT NULL DEFAULT 0 CHECK (deposit_pct BETWEEN 0 AND 100),
  requires_approval boolean NOT NULL DEFAULT false,
  cancellation_hours integer NOT NULL DEFAULT 48 CHECK (cancellation_hours >= 0),
  min_notice_hours integer NOT NULL DEFAULT 24 CHECK (min_notice_hours >= 0),
  max_advance_days integer NOT NULL DEFAULT 90 CHECK (max_advance_days > 0),
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.booking_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_products TO authenticated;
GRANT ALL ON public.booking_products TO service_role;

ALTER TABLE public.booking_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published booking products"
  ON public.booking_products FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins manage booking products"
  ON public.booking_products FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER set_booking_products_updated_at
  BEFORE UPDATE ON public.booking_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- booking_calendar_settings (single row)
-- =========================================================

CREATE TABLE public.booking_calendar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  open_time time NOT NULL DEFAULT '09:00',
  close_time time NOT NULL DEFAULT '17:00',
  slot_minutes integer NOT NULL DEFAULT 60 CHECK (slot_minutes > 0),
  buffer_minutes integer NOT NULL DEFAULT 15 CHECK (buffer_minutes >= 0),
  -- weekday_mask: 7 chars, Mon-Sun, 'Y' = open, 'N' = closed
  weekday_mask text NOT NULL DEFAULT 'YYYYYYY' CHECK (weekday_mask ~ '^[YN]{7}$'),
  timezone text NOT NULL DEFAULT 'Europe/London',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.booking_calendar_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_calendar_settings TO authenticated;
GRANT ALL ON public.booking_calendar_settings TO service_role;

ALTER TABLE public.booking_calendar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view calendar settings"
  ON public.booking_calendar_settings FOR SELECT
  USING (true);

CREATE POLICY "Super admins manage calendar settings"
  ON public.booking_calendar_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER set_calendar_settings_updated_at
  BEFORE UPDATE ON public.booking_calendar_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- booking_closed_dates
-- =========================================================

CREATE TABLE public.booking_closed_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_on >= starts_on)
);

GRANT SELECT ON public.booking_closed_dates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_closed_dates TO authenticated;
GRANT ALL ON public.booking_closed_dates TO service_role;

ALTER TABLE public.booking_closed_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view closed dates"
  ON public.booking_closed_dates FOR SELECT
  USING (true);

CREATE POLICY "Staff manage closed dates"
  ON public.booking_closed_dates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- booking_resource_blocks
-- =========================================================

CREATE TABLE public.booking_resource_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_kind public.booking_resource_kind NOT NULL,
  aircraft_id uuid REFERENCES public.aircraft(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES public.instructors(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (
    (resource_kind = 'aircraft'   AND aircraft_id IS NOT NULL AND instructor_id IS NULL) OR
    (resource_kind = 'instructor' AND instructor_id IS NOT NULL AND aircraft_id IS NULL)
  )
);

CREATE INDEX idx_booking_resource_blocks_aircraft ON public.booking_resource_blocks(aircraft_id, starts_at, ends_at);
CREATE INDEX idx_booking_resource_blocks_instructor ON public.booking_resource_blocks(instructor_id, starts_at, ends_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_resource_blocks TO authenticated;
GRANT ALL ON public.booking_resource_blocks TO service_role;

ALTER TABLE public.booking_resource_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view resource blocks"
  ON public.booking_resource_blocks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "Staff manage resource blocks"
  ON public.booking_resource_blocks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- bookings
-- =========================================================

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.booking_products(id) ON DELETE RESTRICT,
  aircraft_id uuid REFERENCES public.aircraft(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES public.instructors(id) ON DELETE SET NULL,
  user_id uuid, -- nullable: guest experience bookings
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.booking_payment_status NOT NULL DEFAULT 'unpaid',
  price_total_cents integer NOT NULL DEFAULT 0 CHECK (price_total_cents >= 0),
  amount_paid_cents integer NOT NULL DEFAULT 0 CHECK (amount_paid_cents >= 0),
  deposit_due_cents integer NOT NULL DEFAULT 0 CHECK (deposit_due_cents >= 0),
  stripe_session_id text,
  stripe_payment_intent_id text,
  approved_at timestamptz,
  approved_by uuid,
  cancelled_at timestamptz,
  cancellation_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_bookings_aircraft_time ON public.bookings(aircraft_id, starts_at, ends_at) WHERE status IN ('pending', 'confirmed');
CREATE INDEX idx_bookings_instructor_time ON public.bookings(instructor_id, starts_at, ends_at) WHERE status IN ('pending', 'confirmed');
CREATE INDEX idx_bookings_starts_at ON public.bookings(starts_at);

GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
-- Guest experience bookings created via server fn (service_role)
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "Users view their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff manage bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "Users cancel their own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff insert bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "Authenticated users create their own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- self_hire_approvals
-- =========================================================

CREATE TABLE public.self_hire_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  approved_by uuid NOT NULL,
  approved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_self_hire_approvals_user ON public.self_hire_approvals(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.self_hire_approvals TO authenticated;
GRANT ALL ON public.self_hire_approvals TO service_role;

ALTER TABLE public.self_hire_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own self-hire approval"
  ON public.self_hire_approvals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff view self-hire approvals"
  ON public.self_hire_approvals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins manage self-hire approvals"
  ON public.self_hire_approvals FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_self_hire_approvals_updated_at
  BEFORE UPDATE ON public.self_hire_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- SEED DATA
-- =========================================================

INSERT INTO public.booking_calendar_settings (open_time, close_time, slot_minutes, buffer_minutes, weekday_mask, timezone)
VALUES ('09:00', '17:00', 60, 15, 'YYYYYYY', 'Europe/London');

INSERT INTO public.booking_products (slug, kind, name, tagline, description, duration_minutes, package_price_cents, instructor_fee_per_hour_cents, payment_mode, deposit_pct, requires_approval, cancellation_hours, min_notice_hours, max_advance_days, display_order)
VALUES
  ('trial-flight-30', 'experience', '30-Minute Trial Flight', 'A taste of the sky over central Scotland', 'Take the controls of a Cessna 172 for 30 minutes with a qualified instructor. Perfect introduction to flying.', 30, 14900, NULL, 'full', 100, false, 48, 24, 90, 1),
  ('ppl-lesson', 'lesson', 'PPL Training Lesson', 'Towards your Private Pilot Licence', 'A one-hour training lesson with your instructor as part of your PPL syllabus. Billed at aircraft wet rate plus instructor fee.', 60, NULL, 5500, 'invoice', 0, true, 24, 12, 60, 2),
  ('self-hire-block', 'self_hire', 'Self-Hire Aircraft', 'Wet hire for qualified pilots', 'Reserve a club aircraft for a flight block. Wet rate applies. 20% deposit secures your booking.', 60, NULL, NULL, 'deposit', 20, true, 24, 12, 30, 3);