-- ============================================================
-- Migration: Fix organization_id column defaults, user triggers, and storage buckets
-- ============================================================

-- 1. Set default organization_id on tables with NOT NULL constraints
ALTER TABLE public.customer_profiles
  ALTER COLUMN organization_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

ALTER TABLE public.self_hire_approvals
  ALTER COLUMN organization_id SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;

-- 2. Update handle_new_user() trigger to safely include organization_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
  -- Create base profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;

  -- Default app role is customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Customer profile with default org id
  INSERT INTO public.customer_profiles (user_id, tier, organization_id)
  VALUES (NEW.id, NULL, v_org_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Update handle_pilot_verification_approval() trigger to supply organization_id
CREATE OR REPLACE FUNCTION public.handle_pilot_verification_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid := COALESCE(NEW.organization_id, '00000000-0000-0000-0000-000000000001'::uuid);
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Stamp reviewer fields if not already set
    IF NEW.reviewed_at IS NULL THEN
      NEW.reviewed_at := now();
    END IF;
    IF NEW.reviewed_by IS NULL THEN
      NEW.reviewed_by := auth.uid();
    END IF;

    -- Promote tier to pilot (insert if missing)
    INSERT INTO public.customer_profiles (user_id, tier, qualified_at, organization_id)
    VALUES (NEW.user_id, 'pilot'::customer_tier, now(), v_org_id)
    ON CONFLICT (user_id) DO UPDATE
      SET tier = 'pilot'::customer_tier,
          qualified_at = COALESCE(public.customer_profiles.qualified_at, now()),
          updated_at = now();

    -- Grant self-hire approval if none active
    IF NOT EXISTS (
      SELECT 1 FROM public.self_hire_approvals
       WHERE user_id = NEW.user_id AND revoked_at IS NULL
    ) THEN
      INSERT INTO public.self_hire_approvals (user_id, approved_by, notes, organization_id)
      VALUES (
        NEW.user_id,
        COALESCE(NEW.reviewed_by, auth.uid()),
        'Auto-granted from pilot verification ' || NEW.id::text,
        v_org_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Ensure storage bucket for pilot documents exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('pilot-documents', 'pilot-documents', false)
ON CONFLICT (id) DO NOTHING;
