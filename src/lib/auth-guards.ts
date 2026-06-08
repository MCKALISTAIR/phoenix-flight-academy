import { redirect, isRedirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export async function requireAuth(href: string) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    throw redirect({ to: "/login", search: { redirect: href } });
  }
  return data.session.user;
}

export async function requireRole(
  href: string,
  allowed: AppRole[]
): Promise<{ user: { id: string; email?: string }; roles: AppRole[] }> {
  const user = await requireAuth(href);

  const { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError) {
    throw redirect({ to: "/login", search: { redirect: href } });
  }

  const userRoles = (rolesData ?? []).map((r) => r.role as AppRole);

  if (!userRoles.some((r) => allowed.includes(r))) {
    throw redirect({ to: "/unauthorized", search: { redirect: href } });
  }

  return { user, roles: userRoles };
}

export async function requireSuperAdmin(href: string) {
  return requireRole(href, ["super_admin"]);
}

export async function requireAdmin(href: string) {
  return requireRole(href, ["admin", "super_admin"]);
}

export async function requireAuthOrRedirect(
  href: string,
  options?: { allowedRoles?: AppRole[] }
) {
  try {
    const user = await requireAuth(href);
    if (!options?.allowedRoles?.length) {
      return { user, roles: [] as AppRole[] };
    }
    return await requireRole(href, options.allowedRoles);
  } catch (error) {
    if (isRedirect(error)) throw error;
    throw redirect({ to: "/login", search: { redirect: href } });
  }
}
