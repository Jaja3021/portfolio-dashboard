"use client";

import { PencilSimpleIcon as Pencil, PlusIcon as Plus, TrashIcon as Trash2 } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, inputClass } from "@/components/ui/FormField";
import { DEAL_STAGES } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Deal, DealStage } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const stageStyles: Record<DealStage, string> = {
  Offer: "bg-blue-50 text-blue-700",
  Reservation: "bg-amber-50 text-amber-700",
  Financing: "bg-purple-50 text-purple-700",
  Closing: "bg-accent-light text-accent-dark",
  Completed: "bg-gray-100 text-gray-500",
  Cancelled: "bg-red-50 text-red-600",
};

const EMPTY = { clientName: "", propertyTitle: "", amount: "", notes: "" };

export function DealsManager({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | undefined>(undefined);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openAdd = () => {
    setEditing(undefined);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({
      clientName: d.clientName,
      propertyTitle: d.propertyTitle,
      amount: d.amount !== null ? String(d.amount) : "",
      notes: d.notes ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to add or edit deals.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const amount = form.amount ? Number(form.amount) : null;
    const payload = {
      client_name: form.clientName,
      property_title: form.propertyTitle,
      amount,
      notes: form.notes || null,
    };

    if (editing) {
      const { error: updateError } = await supabase.from("deals").update(payload).eq("id", editing.id);
      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDeals((prev) =>
        prev.map((d) =>
          d.id === editing.id
            ? { ...d, clientName: form.clientName, propertyTitle: form.propertyTitle, amount, notes: form.notes || null }
            : d
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("deals")
        .insert({ ...payload, stage: "Offer" })
        .select("id, created_at")
        .single();
      setSaving(false);
      if (insertError || !data) {
        setError(insertError?.message ?? "Failed to add deal.");
        return;
      }
      setDeals((prev) => [
        {
          id: data.id,
          clientName: form.clientName,
          propertyTitle: form.propertyTitle,
          stage: "Offer",
          amount,
          notes: form.notes || null,
          createdAt: data.created_at,
        },
        ...prev,
      ]);
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to delete deals.");
      return;
    }
    if (!window.confirm("Delete this deal?")) return;

    setBusyId(id);
    const { error: deleteError } = await createClient().from("deals").delete().eq("id", id);
    setBusyId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  const handleStageChange = async (id: string, stage: DealStage) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to update deal stage.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient().from("deals").update({ stage }).eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage } : d)));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions / Deals</h1>
          <p className="mt-1 text-sm text-foreground/60">{deals.length} in progress or closed</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {deals.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-foreground/50">
          No deals yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {deals.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">{d.clientName}</p>
                  <p className="text-sm text-foreground/60">{d.propertyTitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  {d.amount !== null && (
                    <span className="text-sm font-semibold text-foreground">{formatPrice(d.amount)}</span>
                  )}
                  <select
                    value={d.stage}
                    disabled={busyId === d.id}
                    onChange={(e) => handleStageChange(d.id, e.target.value as DealStage)}
                    className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none disabled:opacity-50 ${stageStyles[d.stage]}`}
                  >
                    {DEAL_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openEdit(d)}
                    aria-label="Edit"
                    className="rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-accent cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    disabled={busyId === d.id}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-foreground/50 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {d.notes && <p className="mt-3 text-sm text-foreground/70">{d.notes}</p>}

              <p className="mt-3 text-xs text-foreground/40">
                Opened {new Date(d.createdAt).toLocaleDateString("en-PH")}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} labelledBy="deal-form-title">
        <form onSubmit={handleSave} className="p-6 sm:p-8">
          <h2 id="deal-form-title" className="mb-6 text-xl font-semibold text-foreground">
            {editing ? "Edit Deal" : "Add Deal"}
          </h2>
          <div className="flex flex-col gap-4">
            <Field label="Client Name">
              <input required value={form.clientName} onChange={set("clientName")} className={inputClass(false)} />
            </Field>
            <Field label="Property">
              <input required value={form.propertyTitle} onChange={set("propertyTitle")} className={inputClass(false)} />
            </Field>
            <Field label="Amount (₱)">
              <input type="number" min="0" value={form.amount} onChange={set("amount")} className={inputClass(false)} />
            </Field>
            <Field label="Notes">
              <textarea rows={3} value={form.notes} onChange={set("notes")} className={inputClass(false)} />
            </Field>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
