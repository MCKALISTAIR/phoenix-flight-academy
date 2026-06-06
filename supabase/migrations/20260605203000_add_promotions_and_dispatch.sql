-- =========================================================
-- booking_promotions
-- =========================================================

CREATE TABLE public.booking_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code = upper(code)),
  name text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value integer NOT NULL CHECK (discount_value >= 0),
  applies_to_kinds text[] NOT NULL DEFAULT '{}',
  active_from timestamptz NOT NULL DEFAULT now(),
  active_until timestamptz CHECK (active_until IS NULL OR active_until > active_from),
  max_uses integer CHECK (max_uses IS NULL OR max_uses >= 0),
  uses_count integer NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- bookings updates
-- =========================================================

ALTER TABLE public.bookings
  ADD COLUMN promo_code text,
  ADD COLUMN discount_applied_cents integer NOT NULL DEFAULT 0 CHECK (discount_applied_cents >= 0);

-- =========================================================
-- grants
-- =========================================================

GRANT SELECT ON public.booking_promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.booking_promotions TO authenticated;
GRANT ALL ON public.booking_promotions TO service_role;

-- =========================================================
-- policies
-- =========================================================

ALTER TABLE public.booking_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published booking promotions"
  ON public.booking_promotions FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins and admins manage booking promotions"
  ON public.booking_promotions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- trigger
-- =========================================================

CREATE TRIGGER set_booking_promotions_updated_at
  BEFORE UPDATE ON public.booking_promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
