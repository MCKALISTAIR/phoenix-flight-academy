import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/cms/$")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    // Authenticated admin hit an unknown /cms/* URL — send to overview.
    throw redirect({ to: "/cms" });
  },
  component: () => null,
});