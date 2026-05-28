
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.license_sought AS ENUM ('PPL','LAPL','NPPL','CPL','IR','Other');
CREATE TYPE public.student_status AS ENUM ('active','paused','completed','withdrawn');
CREATE TYPE public.flight_capacity AS ENUM ('dual','pic','put','picus','instructor','examiner');
CREATE TYPE public.exercise_grade AS ENUM ('intro','practiced','competent','review');
CREATE TYPE public.document_type AS ENUM ('medical_class1','medical_class2','medical_lapl','student_pilot_license','ppl','lapl','rt_license','passport','photo_id','language_proficiency','other');
CREATE TYPE public.endorsement_type AS ENUM ('first_solo','solo_circuits','solo_local','solo_nav','solo_cross_country','type_endorsement','night_rating','differences_training','other');
CREATE TYPE public.exam_result AS ENUM ('pass','fail','pending');

-- ============================================================
-- syllabus_exercises (reference)
-- ============================================================
CREATE TABLE public.syllabus_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.syllabus_exercises TO authenticated;
GRANT ALL ON public.syllabus_exercises TO service_role;
ALTER TABLE public.syllabus_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view syllabus" ON public.syllabus_exercises
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admins manage syllabus" ON public.syllabus_exercises
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ============================================================
-- students
-- ============================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  license_sought public.license_sought NOT NULL DEFAULT 'PPL',
  start_date DATE,
  primary_instructor_id UUID,
  status public.student_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view all students" ON public.students
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Students view own record" ON public.students
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff insert students" ON public.students
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Staff update students" ON public.students
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Admins delete students" ON public.students
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin')
  );

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- flight_log_entries (UK CAA logbook fields)
-- ============================================================
CREATE TABLE public.flight_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  aircraft_id UUID REFERENCES public.aircraft(id) ON DELETE SET NULL,
  -- Snapshot fields (in case aircraft row changes/deleted)
  aircraft_registration TEXT NOT NULL,
  aircraft_model TEXT NOT NULL,
  -- Flight date & route
  flight_date DATE NOT NULL,
  departure_aerodrome TEXT NOT NULL,
  arrival_aerodrome TEXT NOT NULL,
  off_blocks_at TIMESTAMPTZ NOT NULL,
  on_blocks_at TIMESTAMPTZ NOT NULL,
  total_minutes INTEGER NOT NULL,
  -- Crew & capacity
  pic_name TEXT NOT NULL,
  instructor_user_id UUID,
  capacity public.flight_capacity NOT NULL,
  -- Landings
  landings_day INTEGER NOT NULL DEFAULT 0,
  landings_night INTEGER NOT NULL DEFAULT 0,
  -- Conditions
  night_minutes INTEGER NOT NULL DEFAULT 0,
  ifr_minutes INTEGER NOT NULL DEFAULT 0,
  -- Function-time breakdown (CAA)
  single_pilot_se_minutes INTEGER NOT NULL DEFAULT 0,
  single_pilot_me_minutes INTEGER NOT NULL DEFAULT 0,
  multi_pilot_minutes INTEGER NOT NULL DEFAULT 0,
  dual_received_minutes INTEGER NOT NULL DEFAULT 0,
  instructor_given_minutes INTEGER NOT NULL DEFAULT 0,
  -- FSTD (simulator)
  fstd_type TEXT,
  fstd_minutes INTEGER NOT NULL DEFAULT 0,
  -- Remarks & signature
  remarks TEXT,
  signed_by_user_id UUID,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flight_log_student ON public.flight_log_entries(student_id, flight_date DESC);
CREATE INDEX idx_flight_log_date ON public.flight_log_entries(flight_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flight_log_entries TO authenticated;
GRANT ALL ON public.flight_log_entries TO service_role;
ALTER TABLE public.flight_log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view all flights" ON public.flight_log_entries
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Students view own flights" ON public.flight_log_entries
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Staff insert flights" ON public.flight_log_entries
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Staff update flights" ON public.flight_log_entries
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Admins delete flights" ON public.flight_log_entries
  FOR DELETE TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin')
  );

CREATE TRIGGER flight_log_entries_updated_at
  BEFORE UPDATE ON public.flight_log_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- flight_log_exercises (many-to-many)
-- ============================================================
CREATE TABLE public.flight_log_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_log_entry_id UUID NOT NULL REFERENCES public.flight_log_entries(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.syllabus_exercises(id) ON DELETE RESTRICT,
  grade public.exercise_grade NOT NULL DEFAULT 'intro',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (flight_log_entry_id, exercise_id)
);
CREATE INDEX idx_fle_flight ON public.flight_log_exercises(flight_log_entry_id);
CREATE INDEX idx_fle_exercise ON public.flight_log_exercises(exercise_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.flight_log_exercises TO authenticated;
GRANT ALL ON public.flight_log_exercises TO service_role;
ALTER TABLE public.flight_log_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view all flight exercises" ON public.flight_log_exercises
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Students view own flight exercises" ON public.flight_log_exercises
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.flight_log_entries f
      JOIN public.students s ON s.id = f.student_id
      WHERE f.id = flight_log_entry_id AND s.user_id = auth.uid()
    )
  );
CREATE POLICY "Staff manage flight exercises" ON public.flight_log_exercises
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );

-- ============================================================
-- student_documents
-- ============================================================
CREATE TABLE public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  document_number TEXT,
  issued_on DATE,
  expires_on DATE,
  issuing_authority TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_student_docs_student ON public.student_documents(student_id);
CREATE INDEX idx_student_docs_expires ON public.student_documents(expires_on);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_documents TO authenticated;
GRANT ALL ON public.student_documents TO service_role;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view all docs" ON public.student_documents
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Students view own docs" ON public.student_documents
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Staff manage docs" ON public.student_documents
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );

CREATE TRIGGER student_documents_updated_at
  BEFORE UPDATE ON public.student_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- student_endorsements
-- ============================================================
CREATE TABLE public.student_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  endorsement_type public.endorsement_type NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  signed_by_user_id UUID NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_endorsements_student ON public.student_endorsements(student_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_endorsements TO authenticated;
GRANT ALL ON public.student_endorsements TO service_role;
ALTER TABLE public.student_endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view endorsements" ON public.student_endorsements
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Students view own endorsements" ON public.student_endorsements
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Staff manage endorsements" ON public.student_endorsements
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );

-- ============================================================
-- theory_exam_results
-- ============================================================
CREATE TABLE public.theory_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  result public.exam_result NOT NULL DEFAULT 'pending',
  score NUMERIC,
  taken_on DATE,
  notes TEXT,
  recorded_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_theory_student ON public.theory_exam_results(student_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.theory_exam_results TO authenticated;
GRANT ALL ON public.theory_exam_results TO service_role;
ALTER TABLE public.theory_exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff view theory" ON public.theory_exam_results
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );
CREATE POLICY "Students view own theory" ON public.theory_exam_results
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid())
  );
CREATE POLICY "Staff manage theory" ON public.theory_exam_results
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  )
  WITH CHECK (
    public.has_role(auth.uid(),'super_admin') OR
    public.has_role(auth.uid(),'admin') OR
    public.has_role(auth.uid(),'instructor')
  );

CREATE TRIGGER theory_exam_results_updated_at
  BEFORE UPDATE ON public.theory_exam_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED: PPL syllabus exercises Ex 1 – Ex 19 (UK CAA standard)
-- ============================================================
INSERT INTO public.syllabus_exercises (exercise_number, title, category, description, display_order) VALUES
(1, 'Aircraft Familiarisation', 'Ground', 'Characteristics of the aircraft, cockpit layout, systems, checklists, drills.', 1),
(2, 'Preparation for and Action after Flight', 'Ground', 'Authorisation, weather, NOTAMs, mass and balance, pre/post-flight inspection.', 2),
(3, 'Air Experience', 'Air', 'Familiarisation flight.', 3),
(4, 'Effects of Controls', 'Air', 'Primary and secondary effects of controls; use of trim and power.', 4),
(5, 'Taxiing', 'Air', 'Taxi technique, control during taxi, marshalling signals, emergency.', 5),
(6, 'Straight and Level Flight', 'Air', 'Maintaining heading, altitude and balance at various speeds and power.', 6),
(7, 'Climbing', 'Air', 'Entry, maintenance and levelling off; cruise, max-rate and max-angle climbs.', 7),
(8, 'Descending', 'Air', 'Powered, glide and cruise descents; level-off.', 8),
(9, 'Turning', 'Air', 'Medium, climbing and descending turns; rolling out on a heading.', 9),
(10, 'Slow Flight & Stalling', 'Air', 'Slow flight handling, stall recognition, recovery clean and in configuration.', 10),
(11, 'Spin Avoidance', 'Air', 'Recognition and recovery from incipient spin.', 11),
(12, 'Take-off & Climb to Downwind', 'Air', 'Normal, crosswind, short-field and soft-field departures.', 12),
(13, 'Circuit, Approach & Landing', 'Air', 'Normal, glide, flapless, short-field, soft-field, crosswind approaches and landings.', 13),
(14, 'First Solo', 'Air', 'First solo circuit consolidation.', 14),
(15, 'Advanced Turning', 'Air', 'Steep turns up to 45 deg bank; recovery from unusual attitudes.', 15),
(16, 'Forced Landings without Power', 'Air', 'PFLs from cruise and circuit; field selection and approach.', 16),
(17, 'Precautionary Landings', 'Air', 'Precautionary search and landing with power.', 17),
(18, 'Navigation', 'Air', 'Cross-country planning, map reading, diversions, lost procedures, radio nav.', 18),
(19, 'Basic Instrument Flight', 'Air', 'Basic IF: full panel, limited panel, recoveries from unusual attitudes.', 19);

-- A template "no student attached" theory seed pattern: instead of inserting blank results,
-- we just rely on the application to create per-student theory rows on demand.
-- The standard PPL theory subjects are documented in the app for the "Theory" tab to use.
