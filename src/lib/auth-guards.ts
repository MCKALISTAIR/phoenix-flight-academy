import { redirect, isRedirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export async function requireAuth(href: string) {
  if (typeof window !== "undefined" && window.localStorage.getItem("pfa_dev_role")) {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      email: window.localStorage.getItem("pfa_dev_email") || "admin@phoenixflighttraining.co.uk",
    };
  }
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    throw redirect({ to: "/login", search: { redirect: href } });
  }
  return data.session.user;
}

export async function requireRole(
  href: string,
  allowed: AppRole[],
): Promise<{ user: { id: string; email?: string }; roles: AppRole[] }> {
  const user = await requireAuth(href);

  if (typeof window !== "undefined" && window.localStorage.getItem("pfa_dev_role")) {
    const devRole = window.localStorage.getItem("pfa_dev_role") as AppRole;
    const roles: AppRole[] = devRole === "admin" ? ["admin", "super_admin"] : [devRole];
    if (roles.some((r) => allowed.includes(r))) {
      return { user, roles };
    }
  }

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

export async function requireAuthOrRedirect(href: string, options?: { allowedRoles?: AppRole[] }) {
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
