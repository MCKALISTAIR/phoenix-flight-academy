ALTER TABLE public.instructors ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS instructors_user_id_unique
  ON public.instructors(user_id) WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_instructor_user(_instructor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.instructors
     WHERE id = _instructor_id AND user_id = auth.uid()
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_instructor_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_instructor_user(uuid) TO authenticated, service_role;

CREATE POLICY "Instructors view their own record"
  ON public.instructors FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.instructor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  CONSTRAINT instructor_availability_time_order CHECK (end_time > start_time)
);

GRANT SELECT ON public.instructor_availability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instructor_availability TO authenticated;
GRANT ALL ON public.instructor_availability TO service_role;

ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instructor availability"
  ON public.instructor_availability FOR SELECT
  USING (true);

CREATE POLICY "Org staff manage instructor availability"
  ON public.instructor_availability FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_org_member(organization_id) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Instructors manage their own availability"
  ON public.instructor_availability FOR ALL TO authenticated
  USING (public.is_instructor_user(instructor_id))
  WITH CHECK (public.is_instructor_user(instructor_id));

CREATE INDEX instructor_availability_instructor_weekday_idx
  ON public.instructor_availability(instructor_id, weekday);

CREATE TRIGGER set_instructor_availability_updated_at
  BEFORE UPDATE ON public.instructor_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Instructors manage their own time off"
  ON public.booking_resource_blocks FOR ALL TO authenticated
  USING (instructor_id IS NOT NULL AND public.is_instructor_user(instructor_id))
  WITH CHECK (instructor_id IS NOT NULL AND public.is_instructor_user(instructor_id));

CREATE POLICY "Instructors view bookings assigned to them"
  ON public.bookings FOR SELECT TO authenticated
  USING (instructor_id IS NOT NULL AND public.is_instructor_user(instructor_id));