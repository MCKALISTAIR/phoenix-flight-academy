import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import {
  listAllBookingProducts,
  upsertBookingProduct,
  deleteBookingProduct,
} from "@/lib/booking-products.functions";

export const Route = createFileRoute("/cms/booking-products")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (e) {
      if (isRedirect(e)) throw e;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: ProductsAdmin,
});

type ProductForm = {
  id?: string;
  slug: string;
  kind: "experience" | "lesson" | "self_hire";
  name: string;
  tagline: string;
  description: string;
  duration_minutes: number;
  package_price_cents: number | null;
  instructor_fee_per_hour_cents: number | null;
  payment_mode: "full" | "deposit" | "invoice";
  deposit_pct: number;
  requires_approval: boolean;
  cancellation_hours: number;
  min_notice_hours: number;
  max_advance_days: number;
  display_order: number;
  published: boolean;
};

const blank: ProductForm = {
  slug: "",
  kind: "experience",
  name: "",
  tagline: "",
  description: "",
  duration_minutes: 60,
  package_price_cents: null,
  instructor_fee_per_hour_cents: null,
  payment_mode: "full",
  deposit_pct: 0,
  requires_approval: false,
  cancellation_hours: 48,
  min_notice_hours: 24,
  max_advance_days: 90,
  display_order: 0,
  published: true,
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const fetchAll = useServerFn(listAllBookingProducts);
  const upsert = useServerFn(upsertBookingProduct);
  const del = useServerFn(deleteBookingProduct);
  const { data } = useQuery({ queryKey: ["cms-products"], queryFn: () => fetchAll() });
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const upsertMut = useMutation({
    mutationFn: upsert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-products"] });
      setEditing(null);
      setErr(null);
    },
    onError: (e: unknown) => setErr(e instanceof Error ? e.message : "Failed"),
  });
  const delMut = useMutation({
    mutationFn: del,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-products"] }),
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Booking Products</h1>
          <p className="mt-1 text-sm text-white/50">
            What customers can book — pricing, duration, payment.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing({ ...blank });
            setErr(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Pricing</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Approval</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-b border-white/5 text-white">
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-white/40">{p.slug}</p>
                </td>
                <td className="px-4 py-3 capitalize text-white/70">{p.kind.replace("_", "-")}</td>
                <td className="px-4 py-3 text-white/70">{p.duration_minutes} min</td>
                <td className="px-4 py-3 text-white/70">
                  {p.package_price_cents
                    ? `£${(p.package_price_cents / 100).toFixed(2)}`
                    : p.instructor_fee_per_hour_cents
                      ? `£${(p.instructor_fee_per_hour_cents / 100).toFixed(2)}/hr + aircraft`
                      : "Aircraft wet rate"}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {p.payment_mode === "deposit" ? `${p.deposit_pct}% deposit` : p.payment_mode}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {p.requires_approval ? "Required" : "Auto"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() =>
                        setEditing({
                          id: p.id,
                          slug: p.slug,
                          kind: p.kind,
                          name: p.name,
                          tagline: p.tagline ?? "",
                          description: p.description ?? "",
                          duration_minutes: p.duration_minutes,
                          package_price_cents: p.package_price_cents,
                          instructor_fee_per_hour_cents: p.instructor_fee_per_hour_cents,
                          payment_mode: p.payment_mode,
                          deposit_pct: p.deposit_pct,
                          requires_approval: p.requires_approval,
                          cancellation_hours: p.cancellation_hours,
                          min_notice_hours: p.min_notice_hours,
                          max_advance_days: p.max_advance_days,
                          display_order: p.display_order,
                          published: p.published,
                        })
                      }
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"?`))
                          delMut.mutate({ data: { id: p.id } });
                      }}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-[oklch(0.12_0.04_250)] p-6">
            <h2 className="text-lg font-bold text-white">
              {editing.id ? "Edit product" : "New product"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const payload = {
                  ...editing,
                  tagline: editing.tagline || null,
                  description: editing.description || null,
                };
                upsertMut.mutate({ data: payload });
              }}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <Field label="Slug" req>
                <input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Kind" req>
                <select
                  value={editing.kind}
                  onChange={(e) =>
                    setEditing({ ...editing, kind: e.target.value as ProductForm["kind"] })
                  }
                  className={inputCls}
                >
                  <option value="experience">Experience</option>
                  <option value="lesson">Lesson</option>
                  <option value="self_hire">Self-hire</option>
                </select>
              </Field>
              <Field label="Name" req full>
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Tagline" full>
                <input
                  value={editing.tagline}
                  onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Description" full>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className={inputCls}
                  rows={2}
                />
              </Field>
              <Field label="Duration (min)" req>
                <input
                  type="number"
                  value={editing.duration_minutes}
                  onChange={(e) =>
                    setEditing({ ...editing, duration_minutes: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Package price (£)">
                <input
                  type="number"
                  step="0.01"
                  value={
                    editing.package_price_cents != null ? editing.package_price_cents / 100 : ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      package_price_cents: e.target.value
                        ? Math.round(Number(e.target.value) * 100)
                        : null,
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Instructor fee (£/hr)">
                <input
                  type="number"
                  step="0.01"
                  value={
                    editing.instructor_fee_per_hour_cents != null
                      ? editing.instructor_fee_per_hour_cents / 100
                      : ""
                  }
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      instructor_fee_per_hour_cents: e.target.value
                        ? Math.round(Number(e.target.value) * 100)
                        : null,
                    })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Payment mode" req>
                <select
                  value={editing.payment_mode}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      payment_mode: e.target.value as ProductForm["payment_mode"],
                    })
                  }
                  className={inputCls}
                >
                  <option value="full">Full payment</option>
                  <option value="deposit">Deposit</option>
                  <option value="invoice">Invoice (no card)</option>
                </select>
              </Field>
              <Field label="Deposit %">
                <input
                  type="number"
                  value={editing.deposit_pct}
                  onChange={(e) => setEditing({ ...editing, deposit_pct: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
              <Field label="Cancellation window (hrs)">
                <input
                  type="number"
                  value={editing.cancellation_hours}
                  onChange={(e) =>
                    setEditing({ ...editing, cancellation_hours: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Min notice (hrs)">
                <input
                  type="number"
                  value={editing.min_notice_hours}
                  onChange={(e) =>
                    setEditing({ ...editing, min_notice_hours: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Max advance (days)">
                <input
                  type="number"
                  value={editing.max_advance_days}
                  onChange={(e) =>
                    setEditing({ ...editing, max_advance_days: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Display order">
                <input
                  type="number"
                  value={editing.display_order}
                  onChange={(e) =>
                    setEditing({ ...editing, display_order: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Requires staff approval" full>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={editing.requires_approval}
                    onChange={(e) =>
                      setEditing({ ...editing, requires_approval: e.target.checked })
                    }
                  />
                  Yes, hold pending until staff approve
                </label>
              </Field>
              <Field label="Published" full>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={editing.published}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  />
                  Visible to customers
                </label>
              </Field>

              {err && <p className="sm:col-span-2 text-sm text-red-400">{err}</p>}

              <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upsertMut.isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white";
function Field({
  label,
  children,
  req,
  full,
}: {
  label: string;
  children: React.ReactNode;
  req?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs text-white/50">
        {label} {req && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
