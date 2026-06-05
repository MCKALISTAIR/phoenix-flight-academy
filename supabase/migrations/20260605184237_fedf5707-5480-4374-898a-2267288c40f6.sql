
-- Authenticated users: full RLS-gated access on app tables
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.admin_requests,
  public.aircraft,
  public.booking_calendar_settings,
  public.booking_closed_dates,
  public.booking_products,
  public.booking_resource_blocks,
  public.bookings,
  public.flight_log_entries,
  public.flight_log_exercises,
  public.flying_status,
  public.instructors,
  public.profiles,
  public.self_hire_approvals,
  public.site_content,
  public.site_content_revisions,
  public.student_documents,
  public.student_endorsements,
  public.students,
  public.syllabus_exercises,
  public.theory_exam_results,
  public.user_roles
TO authenticated;

-- Public (anon) reads where policy already allows
GRANT SELECT ON
  public.aircraft,
  public.booking_calendar_settings,
  public.booking_closed_dates,
  public.booking_products,
  public.flying_status,
  public.instructors,
  public.site_content
TO anon;

-- Service role: full access for server functions
GRANT ALL ON
  public.admin_requests,
  public.aircraft,
  public.booking_calendar_settings,
  public.booking_closed_dates,
  public.booking_products,
  public.booking_resource_blocks,
  public.bookings,
  public.flight_log_entries,
  public.flight_log_exercises,
  public.flying_status,
  public.instructors,
  public.profiles,
  public.self_hire_approvals,
  public.site_content,
  public.site_content_revisions,
  public.student_documents,
  public.student_endorsements,
  public.students,
  public.syllabus_exercises,
  public.theory_exam_results,
  public.user_roles
TO service_role;
