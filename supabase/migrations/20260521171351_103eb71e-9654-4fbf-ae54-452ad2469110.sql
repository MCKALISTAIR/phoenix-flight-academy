
-- ============ ENUMS ============
CREATE TYPE public.aircraft_status AS ENUM ('serviceable', 'maintenance', 'inspection', 'retired');

-- ============ AIRCRAFT ============
CREATE TABLE public.aircraft (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  image_url TEXT,
  engine TEXT,
  cruise_speed TEXT,
  max_seats TEXT,
  fuel_burn TEXT,
  avionics TEXT[] NOT NULL DEFAULT '{}',
  rate_wet NUMERIC(10,2),
  hours NUMERIC(10,1) NOT NULL DEFAULT 0,
  next_annual DATE,
  next_50hr NUMERIC(10,1),
  status public.aircraft_status NOT NULL DEFAULT 'serviceable',
  display_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published aircraft"
  ON public.aircraft FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can insert aircraft"
  ON public.aircraft FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update aircraft"
  ON public.aircraft FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete aircraft"
  ON public.aircraft FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_aircraft_updated_at
  BEFORE UPDATE ON public.aircraft
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ INSTRUCTORS ============
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  hours TEXT,
  bio TEXT,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published instructors"
  ON public.instructors FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can insert instructors"
  ON public.instructors FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update instructors"
  ON public.instructors FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete instructors"
  ON public.instructors FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE_CONTENT (key/value JSON sections) ============
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Super admins can insert site content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update site content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete site content"
  ON public.site_content FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FLYING_STATUS (singleton row) ============
CREATE TABLE public.flying_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_open BOOLEAN NOT NULL DEFAULT true,
  message TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.flying_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flying status"
  ON public.flying_status FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert flying status"
  ON public.flying_status FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update flying status"
  ON public.flying_status FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_flying_status_updated_at
  BEFORE UPDATE ON public.flying_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED INITIAL DATA ============
INSERT INTO public.flying_status (is_open, message)
  VALUES (true, 'Airfield open — normal operations');

INSERT INTO public.aircraft (registration, model, tagline, description, image_url, engine, cruise_speed, max_seats, fuel_burn, avionics, rate_wet, hours, next_annual, next_50hr, status, display_order)
VALUES
  ('G-PHNX', 'Cessna 172 Skyhawk', 'The World''s Most Trusted Flight Trainer',
   'The Cessna 172 is the gold standard of flight education. Incredibly stable, forgiving, and predictable. Our aircraft (G-PHNX) is exceptionally maintained and serves as both our primary PPL navigation platform and solo-hire cruiser.',
   '/cessna172.png',
   'Lycoming O-320 (160 HP)', '105 kts (120 mph)', '4 (1 Pilot + 3 Pax)', 'Approx. 30L / hour',
   ARRAY['Garmin GNS 430 WAAS GPS','Traditional Steam Gauges','Trig Mode S Transponder','Century II Autopilot','8.33kHz Compliant Radio','Dual Altimeters (IFR)'],
   165, 4820.5, '2026-10-15', 4850.0, 'serviceable', 1),
  ('G-BCDF', 'Piper PA28 Cherokee', 'High-Performance Low-Wing Cruiser',
   'A low-wing alternative providing fantastic cruising visibility and responsive handling. Extremely popular for qualified pilots doing cross-country building across Scotland due to its high load carrying capacity and spacious cabin layout.',
   'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=900&auto=format&fit=crop',
   'Lycoming O-360 (180 HP)', '115 kts (132 mph)', '4 (1 Pilot + 3 Pax)', 'Approx. 34L / hour',
   ARRAY['Traditional Steam Gauges Panel','Trig Mode S Transponder','8.33kHz Radio','Spacious Low-Wing Setup','Dual VOR / ILS Nav Indicators'],
   180, 3125.8, '2026-08-20', 3150.0, 'serviceable', 2);

INSERT INTO public.instructors (name, role, hours, bio, image_url, display_order)
VALUES
  ('Captain Andrew McKay', 'CFI • Chief Flying Instructor', '4,500+ Hours',
   'Ex-commercial pilot with over 15 years teaching at Cumbernauld Airport. Andrew specialises in high-latitude cross-country navigation and advanced pilot training checkout safety.',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop&crop=face', 1),
  ('Captain Sarah Jenkins', 'Senior Flight Instructor', '2,800+ Hours',
   'Sarah is a specialist in solo-flight preparation, PPL ground-school instruction, and confidence-building training blocks. Her deep background is in flight deck meteorology.',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop&crop=face', 2),
  ('Captain David Smith', 'Line Flight Instructor', '1,200+ Hours',
   'An expert on Piper low-wing ratings, cockpit avionics mapping, and trial lessons. David brings an enthusiastic, energetic, and checklist-driven approach to every flight hour.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop&crop=face', 3);

INSERT INTO public.site_content (section_key, data) VALUES
  ('home', '{"hero_headline":"Learn to fly at\nCumbernauld Airport","hero_subtext":"Start your aviation journey with friendly instructors and unforgettable experiences. Explore the breathtaking skies of Scotland from your local flying school.","cta_primary":"Access Flight Portal","cta_secondary":"Discover Syllabus"}'::jsonb),
  ('about', '{"school_description":"Professional general aviation mentorship based at Cumbernauld Airport, committed to forging confident, skilled, and safe pilots.","value_1_title":"Safety First","value_1_desc":"Our primary, non-negotiable metric. We train pilots to be risk-aware, checklist-focused, and operationally rigorous.","value_2_title":"Patience & Empathy","value_2_desc":"Flight training is highly demanding. We believe that learning flows from supportive, constructive flight deck instruction.","value_3_title":"Cumbernauld Focus","value_3_desc":"Based at Cumbernauld, we leverage local Scottish terrain, coastal winds, and uncontrolled airspace to build resilient airmen."}'::jsonb),
  ('pricing', '{"c172_dual":"£210","pa28_dual":"£210","c172_solo":"£175","pa28_solo":"£175","ground_exam":"£45","membership":"£120","checkout_flight":"£60","budget_range":"£9,450 – £11,200"}'::jsonb),
  ('experience', '{"pkg1_title":"30-Minute Trial Lesson","pkg1_price":"£125","pkg1_desc":"Perfect introduction to pilot training. Includes pre-flight brief, 30 minutes in the air, and hands-on control time.","pkg2_title":"60-Minute Scenic Cruiser","pkg2_price":"£215","pkg2_desc":"Spend a full hour flying over Cumbernauld, Glasgow, and the spectacular Scottish Lochs.","pkg3_title":"Land-Away Highland Tour","pkg3_price":"£395","pkg3_desc":"An ultimate flying adventure. Pilot the aircraft from Cumbernauld, land away at a scenic Scottish airfield for lunch, and fly back."}'::jsonb),
  ('contact', '{"phone":"07769 690041","email":"info@phoenixflighttraining.co.uk","address":"Phoenix Flight Training, Main Runway Terminal Building, Cumbernauld Airport, G68 0PR"}'::jsonb);
