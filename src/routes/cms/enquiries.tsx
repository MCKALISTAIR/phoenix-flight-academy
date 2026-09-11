import { createFileRoute, redirect, isRedirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Inbox,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  UserCheck,
  Send,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { listContactEnquiries, updateContactEnquiry } from "@/lib/enquiries.functions";

export const Route = createFileRoute("/cms/enquiries")({
  beforeLoad: async ({ location }) => {
    try {
      await requireAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: EnquiriesAdminPage,
  head: () => ({
    meta: [
      { title: "Enquiries & Lead Management | CMS Console" },
      {
        name: "description",
        content: "Track, reply to, and convert prospective students and voucher customer enquiries.",
      },
    ],
  }),
});

const STATUS_FILTERS = ["all", "new", "contacted", "converted", "archived"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function EnquiriesAdminPage() {
  const qc = useQueryClient();
  const fetchEnquiries = useServerFn(listContactEnquiries);
  const updateEnquiry = useServerFn(updateContactEnquiry);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cms-enquiries"],
    queryFn: () => fetchEnquiries(),
    refetchInterval: 30_000,
  });

  const updateMut = useMutation({
    mutationFn: updateEnquiry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-enquiries"] });
      setEditingNotesId(null);
    },
  });

  const enquiries = data?.enquiries ?? [];
  const newCount = enquiries.filter((e) => e.status === "new").length;
  const contactedCount = enquiries.filter((e) => e.status === "contacted").length;
  const convertedCount = enquiries.filter((e) => e.status === "converted").length;

  const filtered = enquiries.filter((item) => {
    const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  function handleStatusChange(id: string, newStatus: "new" | "contacted" | "converted" | "archived") {
    updateMut.mutate({ data: { id, status: newStatus } });
  }

  function handleSaveNotes(id: string) {
    const currentStatus = (enquiries.find((e) => e.id === id)?.status as any) || "contacted";
    updateMut.mutate({
      data: {
        id,
        status: currentStatus === "new" ? "contacted" : currentStatus,
        notes: noteDraft.trim() || null,
      },
    });
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Inbox className="h-6 w-6 text-primary" />
              Customer Enquiries &amp; Leads
            </h1>
            {newCount > 0 && (
              <span className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-xs font-bold text-primary animate-pulse">
                {newCount} New
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/50">
            Messages and flight training enquiries submitted from the public contact desk at Cumbernauld.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">New Inquiries</span>
            <Inbox className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-black tabular-nums text-primary">{newCount}</p>
          <span className="text-[11px] text-white/40">Awaiting initial reply</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-black tabular-nums text-amber-400">{contactedCount}</p>
          <span className="text-[11px] text-white/40">Contacted / briefing</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">Converted</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-black tabular-nums text-emerald-400">{convertedCount}</p>
          <span className="text-[11px] text-white/40">Students / booked</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Received</span>
            <MessageSquare className="h-4 w-4 text-white/40" />
          </div>
          <p className="mt-3 text-3xl font-black tabular-nums text-white">{enquiries.length}</p>
          <span className="text-[11px] text-white/40">All-time website leads</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all uppercase tracking-wider ${
                statusFilter === tab
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {tab}
              {tab === "new" && newCount > 0 && ` (${newCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enquiries, email, text..."
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Enquiries List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-white/40">Loading enquiries…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-white/40">
            No enquiries found matching this view.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              const isEditingNotes = editingNotesId === item.id;

              return (
                <div key={item.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Customer & Category info */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-base">{item.name}</span>
                        <SubjectBadge subject={item.subject} />
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                        <a
                          href={`mailto:${item.email}?subject=Re: Phoenix Flight Training Enquiry (${item.subject})`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {item.email}
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                        className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="archived">Archived</option>
                      </select>

                      <a
                        href={`mailto:${item.email}?subject=Re: Phoenix Flight Training Enquiry (${item.subject})`}
                        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white flex items-center gap-1.5"
                      >
                        <Send className="h-3 w-3 text-primary" />
                        Reply
                      </a>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        title={isExpanded ? "Collapse" : "Expand message"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Message Preview or Full Expanded View */}
                  <div className="mt-3">
                    {isExpanded ? (
                      <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-1">
                            Message Content:
                          </p>
                          <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                            {item.message}
                          </p>
                        </div>

                        {/* Internal Ops Notes */}
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              Operations &amp; Follow-up Notes:
                            </span>
                            {!isEditingNotes && (
                              <button
                                onClick={() => {
                                  setEditingNotesId(item.id);
                                  setNoteDraft(item.notes || "");
                                }}
                                className="text-xs text-primary hover:underline"
                              >
                                {item.notes ? "Edit note" : "+ Add note"}
                              </button>
                            )}
                          </div>

                          {isEditingNotes ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Add follow-up details (e.g., 'Spoke on phone, sent trial flight info, scheduled callback for Friday')..."
                                rows={3}
                                className="w-full rounded-lg border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/60 hover:bg-white/10"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNotes(item.id)}
                                  className="rounded-md bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary/90"
                                >
                                  Save Note
                                </button>
                              </div>
                            </div>
                          ) : item.notes ? (
                            <p className="text-xs text-white/70 italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                              "{item.notes}"
                            </p>
                          ) : (
                            <p className="text-xs text-white/30 italic">No notes recorded yet.</p>
                          )}
                        </div>

                        {/* Quick Jump Actions */}
                        <div className="pt-2 flex flex-wrap gap-2">
                          <Link
                            to="/cms/students"
                            className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 flex items-center gap-1.5"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Enrol as Student
                          </Link>
                          <Link
                            to="/cms/bookings"
                            className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 flex items-center gap-1.5"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Create Booking
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SubjectBadge({ subject }: { subject: string }) {
  const isPpl = subject.toLowerCase().includes("ppl");
  const isVoucher = subject.toLowerCase().includes("voucher") || subject.toLowerCase().includes("experience");
  const isSelfHire = subject.toLowerCase().includes("hire") || subject.toLowerCase().includes("rental");

  let badgeColor = "bg-white/10 text-white/80 border-white/10";
  if (isPpl) badgeColor = "bg-primary/15 text-primary border-primary/30";
  else if (isVoucher) badgeColor = "bg-purple-500/15 text-purple-300 border-purple-500/30";
  else if (isSelfHire) badgeColor = "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}
    >
      {subject}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "new":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
          <Clock className="h-2.5 w-2.5" /> New
        </span>
      );
    case "contacted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
          <Clock className="h-2.5 w-2.5" /> Contacted
        </span>
      );
    case "converted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
          <CheckCircle2 className="h-2.5 w-2.5" /> Converted
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50 uppercase tracking-wider">
          <Archive className="h-2.5 w-2.5" /> Archived
        </span>
      );
    default:
      return null;
  }
}
