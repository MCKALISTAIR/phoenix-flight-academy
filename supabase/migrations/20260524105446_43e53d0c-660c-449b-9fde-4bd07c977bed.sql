ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS draft_data jsonb,
  ADD COLUMN IF NOT EXISTS draft_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS draft_updated_by uuid;