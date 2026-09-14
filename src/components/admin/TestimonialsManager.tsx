"use client";

import {
  PencilSimpleIcon as Pencil,
  PlusIcon as Plus,
  StarIcon as Star,
  TrashIcon as Trash2,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, inputClass } from "@/components/ui/FormField";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Testimonial } from "@/lib/types";

export function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | undefined>(undefined);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(undefined);
    setName("");
    setLocation("");
    setRating(5);
    setMessage("");
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setName(t.name);
    setLocation(t.location ?? "");
    setRating(t.rating ?? 5);
    setMessage(t.message);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to add or edit testimonials.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    if (editing) {
      const { error: updateError } = await supabase
        .from("testimonials")
        .update({ name, location: location || null, rating, message })
        .eq("id", editing.id);
      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === editing.id ? { ...t, name, location: location || undefined, rating, message } : t
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("testimonials")
        .insert({ name, location: location || null, rating, message, enabled: true })
        .select("id")
        .single();
      setSaving(false);
      if (insertError || !data) {
        setError(insertError?.message ?? "Failed to add testimonial.");
        return;
      }
      setTestimonials((prev) => [
        { id: data.id, name, location: location || undefined, rating, message, enabled: true },
        ...prev,
      ]);
    }

    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to delete testimonials.");
      return;
    }
    if (!window.confirm("Delete this testimonial?")) return;

    setBusyId(id);
    const { error: deleteError } = await createClient().from("testimonials").delete().eq("id", id);
    setBusyId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggle = async (t: Testimonial) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to enable or disable testimonials.");
      return;
    }
    setBusyId(t.id);
    const { error: updateError } = await createClient()
      .from("testimonials")
      .update({ enabled: !t.enabled })
      .eq("id", t.id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setTestimonials((prev) => prev.map((x) => (x.id === t.id ? { ...x, enabled: !x.enabled } : x)));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Testimonials</h1>
          <p className="mt-1 text-sm text-foreground/60">{testimonials.length} entries</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-white p-5">
            <div>
              <p className="font-semibold text-foreground">{t.name}</p>
              {t.location && <p className="text-xs text-foreground/50">{t.location}</p>}
              <div className="mt-1 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" fill={i < (t.rating ?? 5) ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="mt-1 text-sm text-foreground/70">&ldquo;{t.message}&rdquo;</p>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  t.enabled ? "bg-accent-light text-accent-dark" : "bg-gray-100 text-gray-500"
                }`}
              >
                {t.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleToggle(t)}
                disabled={busyId === t.id}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-accent hover:text-accent cursor-pointer"
              >
                {t.enabled ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={() => openEdit(t)}
                aria-label="Edit"
                className="rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-accent cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={busyId === t.id}
                aria-label="Delete"
                className="rounded-lg p-2 text-foreground/50 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} labelledBy="testimonial-form-title">
        <form onSubmit={handleSave} className="p-6 sm:p-8">
          <h2 id="testimonial-form-title" className="mb-6 text-xl font-semibold text-foreground">
            {editing ? "Edit Testimonial" : "Add Testimonial"}
          </h2>
          <div className="flex flex-col gap-4">
            <Field label="Client Name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass(false)} />
            </Field>
            <Field label="Property / Location">
              <input
                placeholder="e.g. Liora Homes, Naic"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass(false)}
              />
            </Field>
            <Field label="Rating">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      className="cursor-pointer text-amber-400"
                    >
                      <Star className="h-6 w-6" fill={value <= rating ? "currentColor" : "none"} />
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Message">
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={inputClass(false)}
              />
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
