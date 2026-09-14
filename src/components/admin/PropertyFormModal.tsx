"use client";

import { XIcon as X } from "@phosphor-icons/react/ssr";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/FormField";
import { PROPERTY_STATUSES, PROPERTY_TYPES, REGIONS } from "@/lib/constants";
import type { Property, PropertyStatus, PropertyType, Region } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface PropertyDraft {
  title: string;
  description: string;
  propertyType: PropertyType;
  region: Region;
  province: string;
  city: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  lotArea: string;
  floorArea: string;
  status: PropertyStatus;
  featured: boolean;
  features: string;
  amenities: string;
  nearbyLocations: string;
  existingImages: string[];
  newImages: File[];
}

function toDraft(p?: Property): PropertyDraft {
  if (!p) {
    return {
      title: "",
      description: "",
      propertyType: "House & Lot",
      region: "Luzon",
      province: "",
      city: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      lotArea: "",
      floorArea: "",
      status: "RFO",
      featured: false,
      features: "",
      amenities: "",
      nearbyLocations: "",
      existingImages: [],
      newImages: [],
    };
  }
  return {
    title: p.title,
    description: p.description,
    propertyType: p.propertyType,
    region: p.region,
    province: p.province,
    city: p.city,
    price: String(p.price),
    bedrooms: p.bedrooms?.toString() ?? "",
    bathrooms: p.bathrooms?.toString() ?? "",
    lotArea: p.lotArea?.toString() ?? "",
    floorArea: p.floorArea?.toString() ?? "",
    status: p.status,
    featured: p.featured,
    features: p.features.join(", "),
    amenities: p.amenities.join(", "),
    nearbyLocations: p.nearbyLocations.join(", "),
    existingImages: p.images,
    newImages: [],
  };
}

export function draftToPayload(d: PropertyDraft) {
  const list = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);
  return {
    title: d.title.trim(),
    description: d.description.trim(),
    property_type: d.propertyType,
    region: d.region,
    province: d.province.trim(),
    city: d.city.trim(),
    price: Number(d.price) || 0,
    bedrooms: d.bedrooms === "" ? null : Number(d.bedrooms),
    bathrooms: d.bathrooms === "" ? null : Number(d.bathrooms),
    lot_area: d.lotArea === "" ? null : Number(d.lotArea),
    floor_area: d.floorArea === "" ? null : Number(d.floorArea),
    status: d.status,
    featured: d.featured,
    features: list(d.features),
    amenities: list(d.amenities),
    nearby_locations: list(d.nearbyLocations),
  };
}

export function PropertyFormModal({
  open,
  onClose,
  property,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  property?: Property;
  onSave: (draft: PropertyDraft) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<PropertyDraft>(() => toDraft(property));
  const [imageError, setImageError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // The modal component instance is reused across Add/Edit opens (only `open`
    // toggles), so the draft must be reset explicitly each time it opens —
    // otherwise the next "Add Property" would show the last edited property's data.
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(toDraft(property));
      setImageError(null);
    }
  }, [open, property]);

  useEffect(() => {
    // Object URLs must be created/revoked alongside the file list they preview,
    // which requires an effect (not a render-time memo) so revocation runs on cleanup.
    const urls = draft.newImages.map((f) => URL.createObjectURL(f));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [draft.newImages]);

  const set = <K extends keyof PropertyDraft>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setDraft((d) => ({ ...d, [key]: value }) as PropertyDraft);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const rejected = files.filter((f) => !f.type.startsWith("image/") || f.size > MAX_IMAGE_BYTES);
    if (rejected.length > 0) {
      setImageError("Only image files under 5MB are allowed — some files were skipped.");
    } else {
      setImageError(null);
    }

    const accepted = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES);
    setDraft((d) => ({ ...d, newImages: [...d.newImages, ...accepted] }));
  };

  const removeExisting = (url: string) => {
    setDraft((d) => ({ ...d, existingImages: d.existingImages.filter((u) => u !== url) }));
  };

  const removeNew = (index: number) => {
    setDraft((d) => ({ ...d, newImages: d.newImages.filter((_, i) => i !== index) }));
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="property-form-title">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="p-6 sm:p-8"
      >
        <h2 id="property-form-title" className="mb-6 text-xl font-semibold text-foreground">
          {property ? "Edit Property" : "Add Property"}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input required value={draft.title} onChange={set("title")} className={inputClass(false)} />
          </Field>
          <Field label="Price (₱)">
            <input
              required
              type="number"
              min={0}
              value={draft.price}
              onChange={set("price")}
              className={inputClass(false)}
            />
          </Field>

          <Field label="Property Type">
            <select value={draft.propertyType} onChange={set("propertyType")} className={inputClass(false)}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={draft.status} onChange={set("status")} className={inputClass(false)}>
              {PROPERTY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Region">
            <select value={draft.region} onChange={set("region")} className={inputClass(false)}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Province">
            <input required value={draft.province} onChange={set("province")} className={inputClass(false)} />
          </Field>

          <Field label="City / Municipality">
            <input required value={draft.city} onChange={set("city")} className={inputClass(false)} />
          </Field>
          <Field label="Featured">
            <select
              value={draft.featured ? "yes" : "no"}
              onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.value === "yes" }))}
              className={inputClass(false)}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>

          <Field label="Bedrooms">
            <input type="number" min={0} value={draft.bedrooms} onChange={set("bedrooms")} className={inputClass(false)} />
          </Field>
          <Field label="Bathrooms">
            <input type="number" min={0} value={draft.bathrooms} onChange={set("bathrooms")} className={inputClass(false)} />
          </Field>

          <Field label="Lot Area (sqm)">
            <input type="number" min={0} value={draft.lotArea} onChange={set("lotArea")} className={inputClass(false)} />
          </Field>
          <Field label="Floor Area (sqm)">
            <input type="number" min={0} value={draft.floorArea} onChange={set("floorArea")} className={inputClass(false)} />
          </Field>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Field label="Description">
            <textarea rows={3} value={draft.description} onChange={set("description")} className={inputClass(false)} />
          </Field>
          <Field label="Features (comma-separated)">
            <input value={draft.features} onChange={set("features")} className={inputClass(false)} />
          </Field>
          <Field label="Amenities (comma-separated)">
            <input value={draft.amenities} onChange={set("amenities")} className={inputClass(false)} />
          </Field>
          <Field label="Nearby Locations (comma-separated)">
            <input value={draft.nearbyLocations} onChange={set("nearbyLocations")} className={inputClass(false)} />
          </Field>
          <Field label="Property Images">
            <div className="flex flex-wrap gap-3">
              {draft.existingImages.map((url) => (
                <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                  {/* Arbitrary remote URLs from the DB — plain <img> avoids next/image domain config in this admin-only preview. */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {draft.newImages.map((file, i) => (
                <div key={file.name + i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-accent">
                  {previews[i] && <img src={previews[i]} alt="" className="h-full w-full object-cover" />}
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-foreground/50 hover:border-accent hover:text-accent">
                + Add
                <input type="file" accept="image/*" multiple onChange={onPickFiles} className="hidden" />
              </label>
            </div>
            {imageError && <p className="mt-2 text-xs text-red-500">{imageError}</p>}
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Property"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
