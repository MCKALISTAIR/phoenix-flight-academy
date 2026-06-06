
-- Add 'customer' to the app_role enum (student/pilot remain but are deprecated).
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

-- customer_tier enum (mutually exclusive student vs pilot).
DO $$ BEGIN
  CREATE TYPE public.customer_tier AS ENUM ('student', 'pilot');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.customer_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.customer_tier,
  qualified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_profiles TO authenticated;
GRANT ALL ON public.customer_profiles TO service_role;

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own tier"
  ON public.customer_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff view all customer tiers"
  ON public.customer_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff manage customer tiers"
  ON public.customer_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enforce: pilot auto-stamps qualified_at; pilot cannot be downgraded.
CREATE OR REPLACE FUNCTION public.validate_customer_tier_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.tier = 'pilot' AND NEW.qualified_at IS NULL THEN
    NEW.qualified_at := now();
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.tier = 'pilot' AND NEW.tier IS DISTINCT FROM 'pilot' THEN
    RAISE EXCEPTION 'Cannot downgrade a pilot back to student or null';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER customer_profiles_validate_tier
  BEFORE INSERT OR UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_customer_tier_change();
