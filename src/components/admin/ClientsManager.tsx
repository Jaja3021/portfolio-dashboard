"use client";

import {
  ClockIcon as CalendarClock,
  EnvelopeIcon as Mail,
  PencilSimpleIcon as Pencil,
  PhoneIcon as Phone,
  PlusIcon as Plus,
  TrashIcon as Trash2,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, inputClass } from "@/components/ui/FormField";
import { CLIENT_STATUSES } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Client, ClientStatus } from "@/lib/types";

const statusStyles: Record<ClientStatus, string> = {
  Lead: "bg-blue-50 text-blue-700",
  Contacted: "bg-amber-50 text-amber-700",
  Active: "bg-accent-light text-accent-dark",
  Closed: "bg-gray-100 text-gray-500",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return [parts[0]?.[0], parts[parts.length - 1]?.[0]].filter(Boolean).join("").toUpperCase();
}

const EMPTY = { name: "", email: "", phone: "", source: "", notes: "", nextFollowUp: "" };

export function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>(undefined);
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

  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      source: c.source ?? "",
      notes: c.notes ?? "",
      nextFollowUp: c.nextFollowUp ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to add or edit clients.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      source: form.source || null,
      notes: form.notes || null,
      next_follow_up: form.nextFollowUp || null,
    };

    if (editing) {
      const { error: updateError } = await supabase.from("clients").update(payload).eq("id", editing.id);
      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setClients((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                name: form.name,
                email: form.email,
                phone: form.phone,
                source: form.source || null,
                notes: form.notes || null,
                nextFollowUp: form.nextFollowUp || null,
              }
            : c
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("clients")
        .insert({ ...payload, status: "Lead" })
        .select("id, created_at")
        .single();
      setSaving(false);
      if (insertError || !data) {
        setError(insertError?.message ?? "Failed to add client.");
        return;
      }
      setClients((prev) => [
        {
          id: data.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          source: form.source || null,
          status: "Lead",
          notes: form.notes || null,
          nextFollowUp: form.nextFollowUp || null,
          createdAt: data.created_at,
        },
        ...prev,
      ]);
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to delete clients.");
      return;
    }
    if (!window.confirm("Delete this client?")) return;

    setBusyId(id);
    const { error: deleteError } = await createClient().from("clients").delete().eq("id", id);
    setBusyId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStatusChange = async (id: string, status: ClientStatus) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to update client status.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient().from("clients").update({ status }).eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clients / Leads</h1>
          <p className="mt-1 text-sm text-foreground/60">{clients.length} tracked</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {clients.length === 0 ? (
        <p className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-foreground/50">
          No clients yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {clients.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent-dark">
                    {initials(c.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/60">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {c.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={c.status}
                    disabled={busyId === c.id}
                    onChange={(e) => handleStatusChange(c.id, e.target.value as ClientStatus)}
                    className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none disabled:opacity-50 ${statusStyles[c.status]}`}
                  >
                    {CLIENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    aria-label="Edit"
                    className="rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-accent cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    disabled={busyId === c.id}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-foreground/50 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {c.source && (
                  <span className="rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                    Source: <span className="font-medium text-foreground">{c.source}</span>
                  </span>
                )}
                {c.nextFollowUp && (
                  <span className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/70">
                    <CalendarClock className="h-3 w-3" />
                    Follow-up: <span className="font-medium text-foreground">{c.nextFollowUp}</span>
                  </span>
                )}
              </div>

              {c.notes && <p className="mt-3 text-sm text-foreground/70">{c.notes}</p>}

              <p className="mt-3 text-xs text-foreground/40">
                Added {new Date(c.createdAt).toLocaleDateString("en-PH")}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} labelledBy="client-form-title">
        <form onSubmit={handleSave} className="p-6 sm:p-8">
          <h2 id="client-form-title" className="mb-6 text-xl font-semibold text-foreground">
            {editing ? "Edit Client" : "Add Client"}
          </h2>
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <input required value={form.name} onChange={set("name")} className={inputClass(false)} />
            </Field>
            <Field label="Email">
              <input type="email" required value={form.email} onChange={set("email")} className={inputClass(false)} />
            </Field>
            <Field label="Phone">
              <input required value={form.phone} onChange={set("phone")} className={inputClass(false)} />
            </Field>
            <Field label="Source">
              <input
                placeholder="e.g. Website Inquiry, Referral, Facebook"
                value={form.source}
                onChange={set("source")}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Next Follow-up">
              <input type="date" value={form.nextFollowUp} onChange={set("nextFollowUp")} className={inputClass(false)} />
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
