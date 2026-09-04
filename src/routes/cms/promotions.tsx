import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Tag, Plus, Trash2, Pencil, CheckCircle2, XCircle, PercentIcon } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth-guards";
import {
  listAllPromotions,
  upsertPromotion,
  deletePromotion,
  type Promotion,
} from "@/lib/promotions.functions";

export const Route = createFileRoute("/cms/promotions")({
  beforeLoad: async ({ location }) => {
    try {
      await requireSuperAdmin(location.href);
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: PromotionsManager,
  head: () => ({ meta: [{ title: "Promotions | CMS" }] }),
});

const EMPTY_FORM = {
  id: undefined as string | undefined,
  code: "",
  name: "",
  discount_type: "percentage" as "percentage" | "fixed_amount",
  discount_value: 10,
  applies_to_kinds: [] as string[],
  active_from: new Date().toISOString().slice(0, 16),
  active_until: "" as string,
  max_uses: "" as string,
  published: true,
};

function PromotionsManager() {
  const qc = useQueryClient();
  const fetchPromos = useServerFn(listAllPromotions);
  const savePromo = useServerFn(upsertPromotion);
  const removePromo = useServerFn(deletePromotion);

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["cms-promotions"],
    queryFn: () => fetchPromos(),
  });

  const saveMut = useMutation({
    mutationFn: savePromo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms-promotions"] });
      setForm(EMPTY_FORM);
      setEditing(false);
    },
  });

  const deleteMut = useMutation({
    mutationFn: removePromo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms-promotions"] }),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function startNew() {
    setForm(EMPTY_FORM);
    setEditing(true);
  }

  function startEdit(p: Promotion) {
    setForm({
      id: p.id,
      code: p.code,
      name: p.name,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      applies_to_kinds: p.applies_to_kinds,
      active_from: p.active_from.slice(0, 16),
      active_until: p.active_until ? p.active_until.slice(0, 16) : "",
      max_uses: p.max_uses !== null ? String(p.max_uses) : "",
      published: p.published,
    });
    setEditing(true);
  }

  function toggleKind(kind: string) {
    setForm((f) => ({
      ...f,
      applies_to_kinds: f.applies_to_kinds.includes(kind)
        ? f.applies_to_kinds.filter((k) => k !== kind)
        : [...f.applies_to_kinds, kind],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await saveMut.mutateAsync({
      data: {
        id: form.id,
        code: form.code,
        name: form.name,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        applies_to_kinds: form.applies_to_kinds,
        active_from: new Date(form.active_from).toISOString(),
        active_until: form.active_until ? new Date(form.active_until).toISOString() : null,
        max_uses: form.max_uses !== "" ? Number(form.max_uses) : null,
        published: form.published,
      },
    });
  }

  function fmt(cents: number, type: "percentage" | "fixed_amount") {
    return type === "percentage" ? `${cents}%` : `£${(cents / 100).toFixed(2)} off`;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
            <Tag className="h-6 w-6 text-primary" />
            Promotions & Discount Codes
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Create and manage discount codes applied at booking checkout.
          </p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Promo Code
        </button>
      </div>

      {/* Form */}
      {editing && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-5"
        >
          <h2 className="text-sm font-bold text-white/70">
            {form.id ? "Edit Promo Code" : "New Promo Code"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/50">Code (UPPERCASE)</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-mono text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Display Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Summer 20% Discount"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Discount Type</label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discount_type: e.target.value as "percentage" | "fixed_amount",
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-[oklch(0.12_0.04_250)] px-3 py-2 text-sm text-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount (pence)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Value (
                {form.discount_type === "percentage"
                  ? "e.g. 20 = 20%"
                  : "in pence, e.g. 1000 = £10"}
                )
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Active From</label>
              <input
                required
                type="datetime-local"
                value={form.active_from}
                onChange={(e) => setForm((f) => ({ ...f, active_from: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Expires (optional)</label>
              <input
                type="datetime-local"
                value={form.active_until}
                onChange={(e) => setForm((f) => ({ ...f, active_until: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">
                Max Uses (optional, blank = unlimited)
              </label>
              <input
                type="number"
                min={0}
                value={form.max_uses}
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="text-xs text-white/50">Published</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                className={`h-6 w-11 rounded-full transition-colors ${form.published ? "bg-primary" : "bg-white/10"}`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow transition-transform mx-1 ${form.published ? "translate-x-5" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Applies to kinds */}
          <div>
            <label className="mb-2 block text-xs text-white/50">
              Applies to (blank = all product types)
            </label>
            <div className="flex gap-2">
              {(["experience", "lesson", "self_hire"] as const).map((kind) => (
                <button
                  type="button"
                  key={kind}
                  onClick={() => toggleKind(kind)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    form.applies_to_kinds.includes(kind)
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {kind.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {saveMut.error && (
            <p className="text-xs text-red-400">{(saveMut.error as Error).message}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saveMut.isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:opacity-90"
            >
              {saveMut.isPending ? "Saving…" : form.id ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(EMPTY_FORM);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-white/40">Loading…</div>
        ) : promos.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="mx-auto mb-3 h-10 w-10 text-white/10" />
            <p className="text-sm text-white/40">No promo codes yet. Create one above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Active Until</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promos.map((p) => (
                <tr key={p.id} className="text-white hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{p.code}</td>
                  <td className="px-4 py-3 text-white/80">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <PercentIcon className="h-3 w-3 text-white/40" />
                      {fmt(p.discount_value, p.discount_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {p.uses_count}
                    {p.max_uses !== null ? ` / ${p.max_uses}` : " (∞)"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {p.active_until ? new Date(p.active_until).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/40">
                        <XCircle className="h-3 w-3" /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete promo code "${p.code}"?`)) {
                            deleteMut.mutate({ data: { id: p.id } });
                          }
                        }}
                        className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
