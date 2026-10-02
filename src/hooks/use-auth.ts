import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const devRole = window.localStorage.getItem("pfa_dev_role");
      const devEmail = window.localStorage.getItem("pfa_dev_email");
      if (devRole) {
        setUser({
          id: "00000000-0000-0000-0000-000000000001",
          email:
            devEmail ||
            (devRole === "admin"
              ? "admin@phoenixflighttraining.co.uk"
              : "e2e-user@test.lovable.dev"),
          user_metadata: {
            display_name: devRole === "admin" ? "Chief Admin" : "Alex Student",
          },
          app_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User);
        setLoading(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) setUser(s.user);
    });
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        if (data.session?.user) {
          setUser(data.session.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("pfa_dev_role")) {
      const devRole = window.localStorage.getItem("pfa_dev_role");
      setRoles(devRole === "admin" ? ["admin", "super_admin"] : [devRole as AppRole]);
      setLoading(false);
      return;
    }

    if (authLoading) return;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setRoles((data ?? []).map((r) => r.role as AppRole));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const hasAnyRole = (rs: AppRole[]) => rs.some((r) => roles.includes(r));

  return { roles, hasRole, hasAnyRole, loading: loading || authLoading, user };
}
