
-- ============================================================
-- PHASE 1: Multi-tenancy foundation
-- ============================================================

-- 1. Enum for org-level roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'staff');
CREATE TYPE public.org_subscription_tier AS ENUM ('trial', 'starter', 'pro', 'enterprise');

-- 2. organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icao_code text,
  timezone text NOT NULL DEFAULT 'UTC',
  currency text NOT NULL DEFAULT 'USD',
  subscription_tier org_subscription_tier NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_organizations_updated
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. organization_members
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'staff',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_organization_members_updated
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. organization_invites
CREATE TABLE public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role org_role NOT NULL DEFAULT 'staff',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_invites TO authenticated;
GRANT ALL ON public.organization_invites TO service_role;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_organization_invites_updated
  BEFORE UPDATE ON public.organization_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Security-definer helpers
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(_org_id uuid, _role org_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid() AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.user_orgs(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = _user_id
$$;

-- 6. RLS on org tables themselves
CREATE POLICY "Members view their organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owners update their organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_org_role(id, 'owner') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_org_role(id, 'owner') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated users create organizations"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins delete organizations"
  ON public.organizations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members view org member list"
  ON public.organization_members FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage members"
  ON public.organization_members FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage invites"
  ON public.organization_invites FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ============================================================
-- 7. Add organization_id to all tenant-scoped tables (nullable, backfill, then NOT NULL)
-- ============================================================

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'aircraft','instructors','students','bookings','booking_products','booking_promotions',
    'booking_calendar_settings','booking_closed_dates','booking_resource_blocks',
    'customer_profiles','pilot_verification_requests','self_hire_approvals',
    'flight_log_entries','flight_log_exercises','flying_status','student_documents',
    'student_endorsements','theory_exam_results','syllabus_exercises','site_content',
    'site_content_revisions','admin_requests'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE', t);
    EXECUTE format('CREATE INDEX %I ON public.%I (organization_id)', 'idx_' || t || '_org', t);
  END LOOP;
END $$;

-- ============================================================
-- 8. BACKFILL: create default org, stamp all rows, make super_admins owners
-- ============================================================

INSERT INTO public.organizations (id, name, slug, icao_code, timezone, currency, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Phoenix Flight Academy',
  'phoenix',
  NULL,
  'UTC',
  'USD',
  'enterprise'
);

DO $$
DECLARE
  t text;
  default_org uuid := '00000000-0000-0000-0000-000000000001';
  tables text[] := ARRAY[
    'aircraft','instructors','students','bookings','booking_products','booking_promotions',
    'booking_calendar_settings','booking_closed_dates','booking_resource_blocks',
    'customer_profiles','pilot_verification_requests','self_hire_approvals',
    'flight_log_entries','flight_log_exercises','flying_status','student_documents',
    'student_endorsements','theory_exam_results','syllabus_exercises','site_content',
    'site_content_revisions','admin_requests'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('UPDATE public.%I SET organization_id = $1 WHERE organization_id IS NULL', t) USING default_org;
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN organization_id SET NOT NULL', t);
  END LOOP;
END $$;

-- Make existing super_admins and admins owners of the default org
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT '00000000-0000-0000-0000-000000000001', ur.user_id, 'owner'::org_role
FROM public.user_roles ur
WHERE ur.role IN ('super_admin'::app_role, 'admin'::app_role)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ============================================================
-- 9. REWRITE RLS POLICIES on tenant-scoped tables to use org scoping
--    Strategy: keep "public-facing" published-content visibility unchanged
--    (still single-tenant front-end for now), but staff write/manage
--    policies now require org membership/role.
-- ============================================================

-- ---------- aircraft ----------
DROP POLICY IF EXISTS "Super admins can delete aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Super admins can insert aircraft" ON public.aircraft;
DROP POLICY IF EXISTS "Super admins can update aircraft" ON public.aircraft;
CREATE POLICY "Org admins manage aircraft" ON public.aircraft FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- instructors ----------
DROP POLICY IF EXISTS "Super admins can delete instructors" ON public.instructors;
DROP POLICY IF EXISTS "Super admins can insert instructors" ON public.instructors;
DROP POLICY IF EXISTS "Super admins can update instructors" ON public.instructors;
CREATE POLICY "Org admins manage instructors" ON public.instructors FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- students ----------
DROP POLICY IF EXISTS "Staff manage students" ON public.students;
DROP POLICY IF EXISTS "Staff view all students" ON public.students;
DROP POLICY IF EXISTS "Students view own record" ON public.students;
DROP POLICY IF EXISTS "Super admins delete students" ON public.students;
CREATE POLICY "Org staff view students" ON public.students FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff manage students" ON public.students FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- bookings ----------
DROP POLICY IF EXISTS "Staff insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff view all bookings" ON public.bookings;
CREATE POLICY "Org staff view bookings" ON public.bookings FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff insert bookings" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- booking_products / booking_promotions / booking_calendar_settings / booking_closed_dates / booking_resource_blocks ----------
DROP POLICY IF EXISTS "Super admins manage booking products" ON public.booking_products;
CREATE POLICY "Org admins manage booking products" ON public.booking_products FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins and admins manage booking promotions" ON public.booking_promotions;
CREATE POLICY "Org admins manage booking promotions" ON public.booking_promotions FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins manage calendar settings" ON public.booking_calendar_settings;
CREATE POLICY "Org admins manage calendar settings" ON public.booking_calendar_settings FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Staff manage closed dates" ON public.booking_closed_dates;
CREATE POLICY "Org staff manage closed dates" ON public.booking_closed_dates FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Staff manage resource blocks" ON public.booking_resource_blocks;
DROP POLICY IF EXISTS "Staff view resource blocks" ON public.booking_resource_blocks;
CREATE POLICY "Org staff manage resource blocks" ON public.booking_resource_blocks FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- customer_profiles ----------
DROP POLICY IF EXISTS "Staff manage customer tiers" ON public.customer_profiles;
DROP POLICY IF EXISTS "Staff view all customer tiers" ON public.customer_profiles;
CREATE POLICY "Org staff view customer tiers" ON public.customer_profiles FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff manage customer tiers" ON public.customer_profiles FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- pilot_verification_requests ----------
DROP POLICY IF EXISTS "Staff manage pilot verification requests" ON public.pilot_verification_requests;
DROP POLICY IF EXISTS "Staff view all pilot verification requests" ON public.pilot_verification_requests;
DROP POLICY IF EXISTS "Super admins delete pilot verification requests" ON public.pilot_verification_requests;
CREATE POLICY "Org staff view verifications" ON public.pilot_verification_requests FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org admins manage verifications" ON public.pilot_verification_requests FOR UPDATE TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org admins delete verifications" ON public.pilot_verification_requests FOR DELETE TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- self_hire_approvals ----------
DROP POLICY IF EXISTS "Staff view self-hire approvals" ON public.self_hire_approvals;
DROP POLICY IF EXISTS "Super admins manage self-hire approvals" ON public.self_hire_approvals;
CREATE POLICY "Org staff view self-hire approvals" ON public.self_hire_approvals FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org admins manage self-hire approvals" ON public.self_hire_approvals FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- flight_log_entries ----------
DROP POLICY IF EXISTS "Admins delete flights" ON public.flight_log_entries;
DROP POLICY IF EXISTS "Staff insert flights" ON public.flight_log_entries;
DROP POLICY IF EXISTS "Staff update flights" ON public.flight_log_entries;
DROP POLICY IF EXISTS "Staff view all flights" ON public.flight_log_entries;
CREATE POLICY "Org staff view flights" ON public.flight_log_entries FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff insert flights" ON public.flight_log_entries FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff update flights" ON public.flight_log_entries FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org admins delete flights" ON public.flight_log_entries FOR DELETE TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- flight_log_exercises ----------
DROP POLICY IF EXISTS "Staff manage flight exercises" ON public.flight_log_exercises;
DROP POLICY IF EXISTS "Staff view all flight exercises" ON public.flight_log_exercises;
CREATE POLICY "Org staff view flight exercises" ON public.flight_log_exercises FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff manage flight exercises" ON public.flight_log_exercises FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- flying_status ----------
DROP POLICY IF EXISTS "Admins can insert flying status" ON public.flying_status;
DROP POLICY IF EXISTS "Admins can update flying status" ON public.flying_status;
CREATE POLICY "Org admins manage flying status" ON public.flying_status FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- student_documents ----------
DROP POLICY IF EXISTS "Staff manage docs" ON public.student_documents;
DROP POLICY IF EXISTS "Staff view all docs" ON public.student_documents;
CREATE POLICY "Org staff view student docs" ON public.student_documents FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org staff manage student docs" ON public.student_documents FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- student_endorsements ----------
DROP POLICY IF EXISTS "Staff manage endorsements" ON public.student_endorsements;
DROP POLICY IF EXISTS "Staff view all endorsements" ON public.student_endorsements;
DROP POLICY IF EXISTS "Students view own endorsements" ON public.student_endorsements;
CREATE POLICY "Org staff view endorsements" ON public.student_endorsements FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_endorsements.student_id AND s.user_id = auth.uid()));
CREATE POLICY "Org staff manage endorsements" ON public.student_endorsements FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- theory_exam_results ----------
DROP POLICY IF EXISTS "Staff manage theory results" ON public.theory_exam_results;
DROP POLICY IF EXISTS "Staff view all theory results" ON public.theory_exam_results;
DROP POLICY IF EXISTS "Students view own theory results" ON public.theory_exam_results;
CREATE POLICY "Org staff view theory results" ON public.theory_exam_results FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = theory_exam_results.student_id AND s.user_id = auth.uid()));
CREATE POLICY "Org staff manage theory results" ON public.theory_exam_results FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- syllabus_exercises ----------
DROP POLICY IF EXISTS "Staff manage syllabus" ON public.syllabus_exercises;
CREATE POLICY "Org admins manage syllabus" ON public.syllabus_exercises FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- site_content ----------
DROP POLICY IF EXISTS "Super admins can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Super admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Super admins can update site content" ON public.site_content;
CREATE POLICY "Org admins manage site content" ON public.site_content FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- site_content_revisions ----------
DROP POLICY IF EXISTS "Super admins can delete revisions" ON public.site_content_revisions;
DROP POLICY IF EXISTS "Super admins can insert revisions" ON public.site_content_revisions;
DROP POLICY IF EXISTS "Super admins can view revisions" ON public.site_content_revisions;
CREATE POLICY "Org admins view revisions" ON public.site_content_revisions FOR SELECT TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org admins manage revisions" ON public.site_content_revisions FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ---------- admin_requests ----------
DROP POLICY IF EXISTS "Super admins can delete admin requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Super admins can update admin requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Super admins can view admin requests" ON public.admin_requests;
CREATE POLICY "Org admins view admin requests" ON public.admin_requests FOR SELECT TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Org admins manage admin requests" ON public.admin_requests FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_admin(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

-- ============================================================
-- 10. contact_submissions (for Phase 2 marketing site contact form)
-- ============================================================
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  message text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Super admins view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
