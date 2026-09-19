import { createFileRoute, redirect, isRedirect, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth-guards";
import { InstructorScheduleEditor } from "@/components/InstructorScheduleEditor";
import { getMyInstructorRecord } from "@/lib/instructor-schedule.functions";

export const Route = createFileRoute("/instructor/schedule")({
  beforeLoad: async ({ location }) => {
    try {
      await requireRole(location.href, ["instructor", "admin", "super_admin"]);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: MySchedulePage,
  head: () => ({
    meta: [
      { title: "My Availability | Phoenix Flight Training" },
      {
        name: "description",
        content: "Set the days and times you are available to instruct, and book time off.",
      },
    ],
  }),
});

function MySchedulePage() {
  const fetchMe = useServerFn(getMyInstructorRecord);
  const meQ = useQuery({ queryKey: ["my-instructor-record"], queryFn: () => fetchMe() });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-white">My Availability</h1>
      </div>
      <p className="mt-2 text-sm text-white/50">
        Students can only book you inside the hours you set here. Anything you leave blank stays
        unbookable.
      </p>

      <div className="mt-10">
        {meQ.isLoading && (
          <p className="flex items-center gap-2 text-sm text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your diary…
          </p>
        )}
        {!meQ.isLoading && !meQ.data && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm text-amber-100">
            Your account isn&apos;t linked to an instructor profile yet. Ask the school office to
            link it, then this page will show your diary.
            <div className="mt-3">
              <Link to="/contact" className="font-bold underline">
                Contact the office
              </Link>
            </div>
          </div>
        )}
        {meQ.data && (
          <InstructorScheduleEditor instructorId={meQ.data.id} instructorName={meQ.data.name} />
        )}
      </div>
    </div>
  );
}
