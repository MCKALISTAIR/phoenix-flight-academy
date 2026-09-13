-- Move btree_gist out of the public schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;

-- Trigger/cron-only functions: never callable via the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_pilot_verification_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.snapshot_site_content_revision() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_stale_unpaid_bookings(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_stale_unpaid_bookings(integer) TO service_role;

-- Role/org helpers and the self-service RPC: signed-in users only, not anon.
-- (has_role stays callable by anon because public read policies reference it.)
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, org_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_orgs(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_self_as_student() FROM PUBLIC, anon;