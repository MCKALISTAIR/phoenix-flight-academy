-- Enhance contact_submissions for the Enquiries Inbox in CMS
ALTER TABLE public.contact_submissions 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);

-- Allow all staff (admin, super_admin, instructor) to view and manage contact enquiries
DROP POLICY IF EXISTS "Staff can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Staff can view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin() OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'instructor')
    )
  );

DROP POLICY IF EXISTS "Staff can update contact submissions" ON public.contact_submissions;
CREATE POLICY "Staff can update contact submissions" ON public.contact_submissions
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin() OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'instructor')
    )
  );
