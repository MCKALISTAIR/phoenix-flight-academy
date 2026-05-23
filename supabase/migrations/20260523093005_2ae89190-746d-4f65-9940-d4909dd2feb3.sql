
CREATE TABLE public.site_content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,
  data jsonb NOT NULL,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_content_revisions_section_created
  ON public.site_content_revisions (section_key, created_at DESC);

ALTER TABLE public.site_content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view revisions"
  ON public.site_content_revisions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can insert revisions"
  ON public.site_content_revisions FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete revisions"
  ON public.site_content_revisions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Capture a snapshot of the PREVIOUS data on every update
CREATE OR REPLACE FUNCTION public.snapshot_site_content_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.data IS DISTINCT FROM NEW.data THEN
    INSERT INTO public.site_content_revisions (section_key, data, updated_by)
    VALUES (OLD.section_key, OLD.data, OLD.updated_by);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_site_content_snapshot
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.snapshot_site_content_revision();
