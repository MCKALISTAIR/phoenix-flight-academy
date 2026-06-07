
-- 1. Extend handle_new_user to grant 'customer' role + empty customer_profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.customer_profiles (user_id, tier)
  VALUES (NEW.id, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: any existing auth user without a role/customer_profile
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'customer'::app_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.customer_profiles (user_id, tier)
SELECT u.id, NULL
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.customer_profiles cp WHERE cp.user_id = u.id);

-- 2. Self-service: customer can set their OWN tier to student only (not pilot)
CREATE OR REPLACE FUNCTION public.set_self_as_student()
RETURNS public.customer_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.customer_profiles;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Pilots can't downgrade themselves; trigger would block this anyway
  SELECT * INTO v_row FROM public.customer_profiles WHERE user_id = v_uid;
  IF v_row.tier = 'pilot' THEN
    RAISE EXCEPTION 'Pilots cannot switch to student tier';
  END IF;

  UPDATE public.customer_profiles
     SET tier = 'student'::customer_tier,
         updated_at = now()
   WHERE user_id = v_uid
   RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.set_self_as_student() FROM public;
GRANT EXECUTE ON FUNCTION public.set_self_as_student() TO authenticated;

-- 3. Pilot verification requests
CREATE TYPE public.pilot_verification_status AS ENUM ('pending','approved','rejected','withdrawn');

CREATE TABLE public.pilot_verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  licence_number text NOT NULL,
  issuing_authority text NOT NULL,
  licence_expiry date,
  medical_expiry date,
  ratings text,
  document_path text, -- storage key in pilot-documents bucket
  medical_document_path text,
  status public.pilot_verification_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.pilot_verification_requests TO authenticated;
GRANT ALL ON public.pilot_verification_requests TO service_role;

ALTER TABLE public.pilot_verification_requests ENABLE ROW LEVEL SECURITY;

-- Customers can view their own requests
CREATE POLICY "Customers view own pilot verification requests"
  ON public.pilot_verification_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Customers can submit their own (only as pending, for themselves)
CREATE POLICY "Customers submit own pilot verification requests"
  ON public.pilot_verification_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Customers can withdraw their own pending requests
CREATE POLICY "Customers withdraw own pending requests"
  ON public.pilot_verification_requests
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status IN ('pending','withdrawn'));

-- Staff view all
CREATE POLICY "Staff view all pilot verification requests"
  ON public.pilot_verification_requests
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Staff manage (approve/reject)
CREATE POLICY "Staff manage pilot verification requests"
  ON public.pilot_verification_requests
  FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Super admins delete pilot verification requests"
  ON public.pilot_verification_requests
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- updated_at trigger
CREATE TRIGGER set_pilot_verification_requests_updated_at
  BEFORE UPDATE ON public.pilot_verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. On approval: flip tier to pilot + create self_hire_approval
CREATE OR REPLACE FUNCTION public.handle_pilot_verification_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    INSERT INTO public.customer_profiles (user_id, tier, qualified_at)
    VALUES (NEW.user_id, 'pilot'::customer_tier, now())
    ON CONFLICT (user_id) DO UPDATE
      SET tier = 'pilot'::customer_tier,
          qualified_at = COALESCE(public.customer_profiles.qualified_at, now()),
          updated_at = now();

    -- Grant self-hire approval if none active
    IF NOT EXISTS (
      SELECT 1 FROM public.self_hire_approvals
       WHERE user_id = NEW.user_id AND revoked_at IS NULL
    ) THEN
      INSERT INTO public.self_hire_approvals (user_id, approved_by, notes)
      VALUES (
        NEW.user_id,
        COALESCE(NEW.reviewed_by, auth.uid()),
        'Auto-granted from pilot verification ' || NEW.id::text
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_pilot_verification_approved
  BEFORE UPDATE ON public.pilot_verification_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_pilot_verification_approval();

-- 5. Storage policies for pilot-documents bucket
-- Convention: files keyed under '{user_id}/...' so we can enforce ownership

CREATE POLICY "Customers upload own pilot documents"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pilot-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Customers read own pilot documents"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pilot-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Customers replace own pilot documents"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'pilot-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Customers delete own pilot documents"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pilot-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  );
