import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
  head: () => ({
    meta: [{ title: "Unauthorized | Phoenix Flight Training" }],
  }),
});

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mx-auto">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to access this page. If you believe this is an error, contact your administrator.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            to="/booking/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
