"use client";

import { PencilSimpleIcon as Pencil, PlusIcon as Plus, TrashIcon as Trash2 } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { PropertyFormModal, draftToPayload, type PropertyDraft } from "@/components/admin/PropertyFormModal";
import { PROPERTY_STATUSES } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Property, PropertyStatus } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const IMAGE_BUCKET = "property-images";

async function uploadPropertyImages(
  supabase: ReturnType<typeof createClient>,
  propertyId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const path = `${propertyId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

async function removePropertyImageFiles(supabase: ReturnType<typeof createClient>, propertyId: string) {
  const { data } = await supabase.storage.from(IMAGE_BUCKET).list(propertyId);
  if (data && data.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(data.map((f) => `${propertyId}/${f.name}`));
  }
}

export function PropertiesManager({ initialProperties }: { initialProperties: Property[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async (draft: PropertyDraft) => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to add or edit properties.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = draftToPayload(draft);

    try {
      if (editing) {
        const { error: updateError } = await supabase.from("properties").update(payload).eq("id", editing.id);
        if (updateError) throw updateError;

        const uploaded = await uploadPropertyImages(supabase, editing.id, draft.newImages);
        const images = [...draft.existingImages, ...uploaded];

        await supabase.from("property_images").delete().eq("property_id", editing.id);
        if (images.length > 0) {
          await supabase
            .from("property_images")
            .insert(images.map((image_url) => ({ property_id: editing.id, image_url })));
        }

        setProperties((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...mapPayloadToProperty(payload), images } : p))
        );
      } else {
        const { data, error: insertError } = await supabase.from("properties").insert(payload).select("id").single();
        if (insertError || !data) throw insertError ?? new Error("Failed to create property.");

        const images = await uploadPropertyImages(supabase, data.id, draft.newImages);
        if (images.length > 0) {
          await supabase.from("property_images").insert(images.map((image_url) => ({ property_id: data.id, image_url })));
        }

        setProperties((prev) => [{ id: data.id, ...mapPayloadToProperty(payload), images }, ...prev]);
      }

      setModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save property.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to delete properties.");
      return;
    }
    if (!window.confirm("Delete this property? This cannot be undone.")) return;

    setBusyId(id);
    const supabase = createClient();
    await removePropertyImageFiles(supabase, id);
    const { error: deleteError } = await supabase.from("properties").delete().eq("id", id);
    setBusyId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStatusChange = async (id: string, status: PropertyStatus) => {
    if (!isSupabaseConfigured) {
      setError("Connect Supabase to change property status.");
      return;
    }
    setBusyId(id);
    const { error: updateError } = await createClient().from("properties").update({ status }).eq("id", id);
    setBusyId(null);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
          <p className="mt-1 text-sm text-foreground/60">{properties.length} total listings</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs uppercase tracking-wide text-foreground/50">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {p.title}
                  {p.featured && <span className="ml-2 text-xs font-normal text-accent">★ Featured</span>}
                </td>
                <td className="px-4 py-3 text-foreground/70">{p.propertyType}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {p.city}, {p.province}
                </td>
                <td className="px-4 py-3 text-foreground/70">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <select
                    value={p.status}
                    disabled={busyId === p.id}
                    onChange={(e) => handleStatusChange(p.id, e.target.value as PropertyStatus)}
                    className="rounded-lg border border-border bg-white px-2 py-1.5 text-xs outline-none focus:border-accent"
                  >
                    {PROPERTY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="ml-2 hidden sm:inline">
                    <StatusBadge status={p.status} />
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      aria-label="Edit"
                      className="rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-accent cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      disabled={busyId === p.id}
                      aria-label="Delete"
                      className="rounded-lg p-2 text-foreground/50 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PropertyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        property={editing}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}

function mapPayloadToProperty(payload: ReturnType<typeof draftToPayload>): Omit<Property, "id" | "images"> {
  return {
    title: payload.title,
    description: payload.description,
    propertyType: payload.property_type,
    region: payload.region,
    province: payload.province,
    city: payload.city,
    price: payload.price,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    lotArea: payload.lot_area,
    floorArea: payload.floor_area,
    status: payload.status,
    featured: payload.featured,
    features: payload.features,
    amenities: payload.amenities,
    nearbyLocations: payload.nearby_locations,
    listingType: payload.listing_type,
    condition: payload.condition,
    houseType: payload.house_type,
    floors: payload.floors,
    carParkingSpaces: payload.car_parking_spaces,
    developer: payload.developer,
    subdivision: payload.subdivision,
    propertyAddress: payload.property_address,
    createdAt: new Date().toISOString(),
  };
}
