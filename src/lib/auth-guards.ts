import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export async function requireAuth(href: string) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw redirect({ to: "/login", search: { redirect: href } });
  }
  return data.session;
}

export async function requireRole(href: string, allowed: AppRole[]) {
  const session = await requireAuth(href);
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id);
  const userRoles = (roles ?? []).map((r) => r.role as AppRole);
  if (!userRoles.some((r) => allowed.includes(r))) {
    throw redirect({ to: "/login", search: { redirect: href } });
  }
  return { session, roles: userRoles };
}
