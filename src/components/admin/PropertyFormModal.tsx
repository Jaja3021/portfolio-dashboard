"use client";

import { XIcon as X } from "@phosphor-icons/react/ssr";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/FormField";
import {
  AMENITIES_LIST,
  CONDO_UNIT_TYPES,
  FEATURES_LIST,
  HOUSE_TYPES,
  LISTING_TYPES,
  NEARBY_ESTABLISHMENT_TYPES,
  PROPERTY_CONDITIONS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  REGIONS,
} from "@/lib/constants";
import type { ListingType, Property, PropertyCondition, PropertyStatus, PropertyType, Region } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DESCRIPTION_CHARS = 5000;
const AI_MAX_DIMENSION = 1024;
const AI_MAX_IMAGES = 10;
const KNOWN_AMENITIES = AMENITIES_LIST as readonly string[];
const KNOWN_FEATURES = FEATURES_LIST as readonly string[];
const NEARBY_TYPES = NEARBY_ESTABLISHMENT_TYPES as readonly string[];

type Stage = "quick" | "form";

interface NearbyEstablishment {
  type: string;
  name: string;
}

export interface PropertyDraft {
  rawText: string;
  generatedDescription: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType | "";
  condition: PropertyCondition | "";
  status: PropertyStatus;
  houseType: string;
  region: Region;
  province: string;
  city: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  lotArea: string;
  floorArea: string;
  floors: string;
  carParkingSpaces: string;
  featured: boolean;
  features: string[];
  featuresOther: string;
  amenities: string[];
  amenitiesOther: string;
  nearbyEstablishments: NearbyEstablishment[];
  developer: string;
  subdivision: string;
  propertyAddress: string;
  existingImages: string[];
  newImages: File[];
}

interface AiAutofillResult {
  title?: string | null;
  propertyType?: string | null;
  listingType?: string | null;
  condition?: string | null;
  newCondition?: string | null;
  houseType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floorAreaSqm?: number | null;
  lotAreaSqm?: number | null;
  floors?: number | null;
  carParkingSpaces?: number | null;
  amenities?: string[];
  otherAmenities?: string[];
  features?: string[];
  otherFeatures?: string[];
  region?: string | null;
  province?: string | null;
  cityTownProvince?: string | null;
  description?: string | null;
  developer?: string | null;
  subdivisionOrVillage?: string | null;
  propertyAddress?: string | null;
  price?: number | null;
  nearbyEstablishments?: { type?: string; name?: string }[];
}

const list = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);

function splitKnown(items: string[], known: readonly string[]) {
  return {
    known: items.filter((i) => known.includes(i)),
    other: items.filter((i) => !known.includes(i)).join(", "),
  };
}

function parseNearby(items: string[]): NearbyEstablishment[] {
  return items.map((s) => {
    const idx = s.indexOf(": ");
    if (idx === -1) return { type: "", name: s };
    const type = s.slice(0, idx);
    const name = s.slice(idx + 2);
    return NEARBY_TYPES.includes(type) ? { type, name } : { type: "", name: s };
  });
}

function toDraft(p?: Property): PropertyDraft {
  if (!p) {
    return {
      rawText: "",
      generatedDescription: "",
      title: "",
      description: "",
      propertyType: "House & Lot",
      listingType: "",
      condition: "",
      status: "RFO",
      houseType: "",
      region: "Luzon",
      province: "",
      city: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      lotArea: "",
      floorArea: "",
      floors: "",
      carParkingSpaces: "",
      featured: false,
      features: [],
      featuresOther: "",
      amenities: [],
      amenitiesOther: "",
      nearbyEstablishments: [],
      developer: "",
      subdivision: "",
      propertyAddress: "",
      existingImages: [],
      newImages: [],
    };
  }
  const { known: knownAmenities, other: otherAmenities } = splitKnown(p.amenities, KNOWN_AMENITIES);
  const { known: knownFeatures, other: otherFeatures } = splitKnown(p.features, KNOWN_FEATURES);
  return {
    rawText: p.description,
    generatedDescription: "",
    title: p.title,
    description: p.description,
    propertyType: p.propertyType,
    listingType: p.listingType ?? "",
    condition: p.condition ?? "",
    status: p.status,
    houseType: p.houseType ?? "",
    region: p.region,
    province: p.province,
    city: p.city,
    price: String(p.price),
    bedrooms: p.bedrooms?.toString() ?? "",
    bathrooms: p.bathrooms?.toString() ?? "",
    lotArea: p.lotArea?.toString() ?? "",
    floorArea: p.floorArea?.toString() ?? "",
    floors: p.floors?.toString() ?? "",
    carParkingSpaces: p.carParkingSpaces?.toString() ?? "",
    featured: p.featured,
    features: knownFeatures,
    featuresOther: otherFeatures,
    amenities: knownAmenities,
    amenitiesOther: otherAmenities,
    nearbyEstablishments: parseNearby(p.nearbyLocations),
    developer: p.developer ?? "",
    subdivision: p.subdivision ?? "",
    propertyAddress: p.propertyAddress ?? "",
    existingImages: p.images,
    newImages: [],
  };
}

export function draftToPayload(d: PropertyDraft) {
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
    features: [...d.features, ...list(d.featuresOther)],
    amenities: [...d.amenities, ...list(d.amenitiesOther)],
    nearby_locations: d.nearbyEstablishments
      .filter((e) => e.name.trim())
      .map((e) => (e.type ? `${e.type}: ${e.name.trim()}` : e.name.trim())),
    listing_type: d.listingType || null,
    condition: d.condition || null,
    house_type: d.houseType.trim() || null,
    floors: d.floors === "" ? null : Number(d.floors),
    car_parking_spaces: d.carParkingSpaces === "" ? null : Number(d.carParkingSpaces),
    developer: d.developer.trim() || null,
    subdivision: d.subdivision.trim() || null,
    property_address: d.propertyAddress.trim() || null,
  };
}

async function compressImageToBase64(file: File): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read the image."));
      el.src = objectUrl;
    });

    const scale = Math.min(1, AI_MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process the image.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    return { base64, mediaType: "image/jpeg" };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
  const [stage, setStage] = useState<Stage>("quick");
  const [draft, setDraft] = useState<PropertyDraft>(() => toDraft(property));
  const [imageError, setImageError] = useState<string | null>(null);
  const [imagesDragOver, setImagesDragOver] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [descGenerating, setDescGenerating] = useState(false);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [nearbyType, setNearbyType] = useState<string>(NEARBY_ESTABLISHMENT_TYPES[0]);
  const [nearbyName, setNearbyName] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(toDraft(property));
      setStage(property ? "form" : "quick");
      setImageError(null);
      setAiError(null);
      setAiLoading(false);
      setHighlighted(new Set());
      setToast(null);
      setSubmitAttempted(false);
      setNearbyName("");
      setNearbyType(NEARBY_ESTABLISHMENT_TYPES[0]);
    }
  }, [open, property]);

  useEffect(() => {
    const urls = draft.newImages.map((f) => URL.createObjectURL(f));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [draft.newImages]);

  useEffect(() => {
    if (!toast) return;
    toastTimer.current = setTimeout(() => setToast(null), 4500);
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toast]);

  const set = <K extends keyof PropertyDraft>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setDraft((d) => ({ ...d, [key]: value }) as PropertyDraft);
  };

  const hl = (key: string) => (highlighted.has(key) ? " ring-2 ring-accent ring-offset-1" : "");

  const acceptFiles = (files: File[]) => {
    if (files.length === 0) return;
    const rejected = files.filter((f) => !f.type.startsWith("image/") || f.size > MAX_IMAGE_BYTES);
    setImageError(rejected.length > 0 ? "Only image files under 5MB are allowed — some files were skipped." : null);
    const accepted = files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_IMAGE_BYTES);
    if (accepted.length > 0) setDraft((d) => ({ ...d, newImages: [...d.newImages, ...accepted] }));
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    acceptFiles(files);
  };

  const onDropImages = (e: React.DragEvent) => {
    e.preventDefault();
    setImagesDragOver(false);
    acceptFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const onPasteImages = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData?.items ?? [])
      .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
      .map((it) => it.getAsFile())
      .filter((f): f is File => Boolean(f));
    if (files.length === 0) return;
    e.preventDefault();
    acceptFiles(files);
  };

  const removeExisting = (url: string) => {
    setDraft((d) => ({ ...d, existingImages: d.existingImages.filter((u) => u !== url) }));
  };

  const removeNew = (index: number) => {
    setDraft((d) => ({ ...d, newImages: d.newImages.filter((_, i) => i !== index) }));
  };

  const moveExisting = (index: number, dir: -1 | 1) => {
    setDraft((d) => {
      const arr = [...d.existingImages];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...d, existingImages: arr };
    });
  };

  const moveNew = (index: number, dir: -1 | 1) => {
    setDraft((d) => {
      const arr = [...d.newImages];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return { ...d, newImages: arr };
    });
  };

  const toggleAmenity = (amenity: string) => {
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(amenity) ? d.amenities.filter((a) => a !== amenity) : [...d.amenities, amenity],
    }));
  };

  const toggleFeature = (feature: string) => {
    setDraft((d) => ({
      ...d,
      features: d.features.includes(feature) ? d.features.filter((f) => f !== feature) : [...d.features, feature],
    }));
  };

  const allAmenitiesChecked = draft.amenities.length === AMENITIES_LIST.length;
  const allFeaturesChecked = draft.features.length === FEATURES_LIST.length;

  const addNearby = () => {
    if (!nearbyName.trim()) return;
    setDraft((d) => ({ ...d, nearbyEstablishments: [...d.nearbyEstablishments, { type: nearbyType, name: nearbyName.trim() }] }));
    setNearbyName("");
  };

  const removeNearby = (index: number) => {
    setDraft((d) => ({ ...d, nearbyEstablishments: d.nearbyEstablishments.filter((_, i) => i !== index) }));
  };

  const applyAiResult = (result: AiAutofillResult): number => {
    const filled = new Set<string>();
    setDraft((d) => {
      const next = { ...d };
      if (result.title) {
        next.title = result.title;
        filled.add("title");
      }
      if (result.price != null) {
        next.price = String(result.price);
        filled.add("price");
      }
      if (result.propertyType && (PROPERTY_TYPES as readonly string[]).includes(result.propertyType)) {
        next.propertyType = result.propertyType as PropertyType;
        filled.add("propertyType");
      }
      if (result.listingType && (LISTING_TYPES as readonly string[]).includes(result.listingType)) {
        next.listingType = result.listingType as ListingType;
        filled.add("listingType");
      }
      if (result.condition && (PROPERTY_CONDITIONS as readonly string[]).includes(result.condition)) {
        next.condition = result.condition as PropertyCondition;
        filled.add("condition");
      }
      if (result.newCondition && (PROPERTY_STATUSES as readonly string[]).includes(result.newCondition)) {
        next.status = result.newCondition as PropertyStatus;
        filled.add("status");
      }
      if (result.houseType) {
        next.houseType = result.houseType;
        filled.add("houseType");
      }
      if (result.region && (REGIONS as readonly string[]).includes(result.region)) {
        next.region = result.region as Region;
        filled.add("region");
      }
      if (result.province) {
        next.province = result.province;
        filled.add("province");
      }
      if (result.cityTownProvince) {
        const [cityPart, provincePart] = result.cityTownProvince.split(",").map((s) => s.trim());
        if (cityPart && !next.city) {
          next.city = cityPart;
          filled.add("city");
        }
        if (provincePart && !next.province) {
          next.province = provincePart;
          filled.add("province");
        }
      }
      if (result.bedrooms != null) {
        next.bedrooms = String(result.bedrooms);
        filled.add("bedrooms");
      }
      if (result.bathrooms != null) {
        next.bathrooms = String(result.bathrooms);
        filled.add("bathrooms");
      }
      if (result.lotAreaSqm != null) {
        next.lotArea = String(result.lotAreaSqm);
        filled.add("lotArea");
      }
      if (result.floorAreaSqm != null) {
        next.floorArea = String(result.floorAreaSqm);
        filled.add("floorArea");
      }
      if (result.floors != null) {
        next.floors = String(result.floors);
        filled.add("floors");
      }
      if (result.carParkingSpaces != null) {
        next.carParkingSpaces = String(result.carParkingSpaces);
        filled.add("carParkingSpaces");
      }
      if (result.description) {
        next.generatedDescription = result.description;
        next.description = result.description;
        filled.add("description");
      }
      if (result.developer) {
        next.developer = result.developer;
        filled.add("developer");
      }
      if (result.subdivisionOrVillage) {
        next.subdivision = result.subdivisionOrVillage;
        filled.add("subdivision");
      }
      if (result.propertyAddress) {
        next.propertyAddress = result.propertyAddress;
        filled.add("propertyAddress");
      }
      if (result.features?.length) {
        const known = result.features.filter((f) => KNOWN_FEATURES.includes(f));
        next.features = Array.from(new Set([...d.features, ...known]));
        if (known.length) filled.add("features");
      }
      if (result.otherFeatures?.length) {
        next.featuresOther = Array.from(new Set([...list(d.featuresOther), ...result.otherFeatures])).join(", ");
        filled.add("features");
      }
      if (result.amenities?.length) {
        const known = result.amenities.filter((a) => KNOWN_AMENITIES.includes(a));
        next.amenities = Array.from(new Set([...d.amenities, ...known]));
        if (known.length) filled.add("amenities");
      }
      if (result.otherAmenities?.length) {
        next.amenitiesOther = Array.from(new Set([...list(d.amenitiesOther), ...result.otherAmenities])).join(", ");
        filled.add("amenities");
      }
      if (result.nearbyEstablishments?.length) {
        const additions = result.nearbyEstablishments
          .filter((e): e is { type?: string; name: string } => Boolean(e?.name))
          .map((e) => ({ type: e.type && NEARBY_TYPES.includes(e.type) ? e.type : "", name: e.name as string }));
        if (additions.length) {
          next.nearbyEstablishments = [...d.nearbyEstablishments, ...additions];
          filled.add("nearbyEstablishments");
        }
      }
      return next;
    });
    setHighlighted(filled);
    return filled.size;
  };

  const handleGenerate = async () => {
    setAiError(null);
    setAiLoading(true);
    try {
      const imagesToSend = draft.newImages.slice(0, AI_MAX_IMAGES);
      const images = await Promise.all(imagesToSend.map((f) => compressImageToBase64(f)));

      const res = await fetch("/api/ai-autofill", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: draft.rawText.trim(), images }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.result) {
        throw new Error(json?.error ?? "AI request failed.");
      }

      const filledCount = applyAiResult(json.result as AiAutofillResult);
      setStage("form");
      requestAnimationFrame(() => formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      setToast(
        filledCount > 0
          ? "Auto-filled from AI — review the highlighted fields."
          : "AI couldn't confidently fill any fields — please enter details manually."
      );
    } catch (e) {
      // console.warn (not .error) — this failure is already handled and shown
      // to the user via the toast/retry UI below, so it shouldn't trigger
      // Next's dev error overlay as if it were an unhandled crash.
      console.warn("AI autofill failed:", e);
      setAiError(e instanceof Error ? e.message : "Couldn't auto-fill — please enter details manually.");
      setToast("Couldn't auto-fill — please enter details manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleManual = () => {
    setDraft((d) => ({ ...d, description: d.rawText }));
    setStage("form");
  };

  // Rewrites just the description via AI, using the current description text
  // (and any uploaded photos) as input — used from the Edit form, where there's
  // no Stage 1 quick-entry step to have generated one already. Leaves every
  // other field untouched.
  const handleGenerateDescription = async () => {
    setAiError(null);
    setDescGenerating(true);
    try {
      const inputText = (draft.description || draft.rawText).trim();
      const imagesToSend = draft.newImages.slice(0, AI_MAX_IMAGES);
      const images = await Promise.all(imagesToSend.map((f) => compressImageToBase64(f)));

      const res = await fetch("/api/ai-autofill", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: inputText, images }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.result?.description) {
        throw new Error(json?.error ?? "AI request failed.");
      }

      const generated = json.result.description as string;
      setDraft((d) => ({ ...d, generatedDescription: generated, description: generated }));
      setHighlighted((prev) => new Set(prev).add("description"));
      setToast("Generated a new description — review it below.");
    } catch (e) {
      console.warn("Description generation failed:", e);
      setAiError(e instanceof Error ? e.message : "Couldn't generate a description.");
      setToast("Couldn't generate a description — please write one manually.");
    } finally {
      setDescGenerating(false);
    }
  };

  const renderImageThumbnails = () => (
    <>
      {draft.existingImages.map((url, i) => (
        <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border">
          {/* Arbitrary remote URLs from the DB — plain <img> avoids next/image domain config in this admin-only preview. */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          {i === 0 && (
            <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[9px] font-semibold text-white">Primary</span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={() => moveExisting(i, -1)} aria-label="Move left" className="px-1 text-[11px] text-white cursor-pointer">
              ‹
            </button>
            <button type="button" onClick={() => removeExisting(url)} aria-label="Remove image" className="px-1 text-[11px] text-white cursor-pointer">
              <X className="h-3 w-3" />
            </button>
            <button type="button" onClick={() => moveExisting(i, 1)} aria-label="Move right" className="px-1 text-[11px] text-white cursor-pointer">
              ›
            </button>
          </div>
        </div>
      ))}
      {draft.newImages.map((file, i) => (
        <div key={file.name + i} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-accent">
          {previews[i] && <img src={previews[i]} alt="" className="h-full w-full object-cover" />}
          {draft.existingImages.length === 0 && i === 0 && (
            <span className="absolute left-1 top-1 rounded bg-accent px-1 text-[9px] font-semibold text-white">Primary</span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={() => moveNew(i, -1)} aria-label="Move left" className="px-1 text-[11px] text-white cursor-pointer">
              ‹
            </button>
            <button type="button" onClick={() => removeNew(i)} aria-label="Remove image" className="px-1 text-[11px] text-white cursor-pointer">
              <X className="h-3 w-3" />
            </button>
            <button type="button" onClick={() => moveNew(i, 1)} aria-label="Move right" className="px-1 text-[11px] text-white cursor-pointer">
              ›
            </button>
          </div>
        </div>
      ))}
    </>
  );

  const hasImages = draft.existingImages.length > 0 || draft.newImages.length > 0;

  return (
    <Modal open={open} onClose={onClose} labelledBy="property-form-title">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitAttempted(true);
          if (!draft.price.trim()) return;
          onSave(draft);
        }}
        className="p-6 sm:p-8"
      >
        {stage === "quick" ? (
          <div>
            <h2 id="property-form-title" className="mb-1 text-xl font-semibold text-foreground">
              Post my listing
            </h2>
            <p className="mb-6 text-sm text-foreground/60">
              Submit all property details and automatically fill out our listing form in under a minute.
            </p>

            <Field label="All about the property">
              <textarea
                rows={6}
                maxLength={MAX_DESCRIPTION_CHARS}
                placeholder="Copy/Paste or enter all text about the property..."
                value={draft.rawText}
                onChange={(e) => setDraft((d) => ({ ...d, rawText: e.target.value }))}
                onPaste={onPasteImages}
                className={inputClass(false)}
              />
            </Field>
            <p className="mt-1 text-xs text-foreground/50">
              Remaining characters ({MAX_DESCRIPTION_CHARS - draft.rawText.length})
            </p>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground/80">Photos of the property</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setImagesDragOver(true);
                }}
                onDragLeave={() => setImagesDragOver(false)}
                onDrop={onDropImages}
                onPaste={onPasteImages}
                tabIndex={0}
                className={`flex min-h-[7rem] flex-wrap items-center justify-center gap-3 rounded-lg border border-dashed p-4 outline-none ${
                  imagesDragOver ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                {!hasImages ? (
                  <label className="flex cursor-pointer flex-col items-center gap-1 text-center text-sm text-foreground/50 hover:text-accent">
                    Click here, drag and drop or paste photos (ctrl+v/⌘+v) to upload
                    <input type="file" accept="image/*" multiple onChange={onPickFiles} className="hidden" />
                  </label>
                ) : (
                  <>
                    {renderImageThumbnails()}
                    <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-[11px] text-foreground/50 hover:border-accent hover:text-accent">
                      + Add
                      <input type="file" accept="image/*" multiple onChange={onPickFiles} className="hidden" />
                    </label>
                  </>
                )}
              </div>
              {imageError && <p className="mt-2 text-xs text-red-500">{imageError}</p>}
            </div>

            {aiError && (
              <p className="mt-4 text-sm text-red-500">
                {aiError}{" "}
                <button type="button" onClick={handleGenerate} className="underline cursor-pointer">
                  Retry
                </button>
              </p>
            )}

            <div className="mt-6 flex flex-col items-center gap-3">
              <Button
                type="button"
                className="w-full"
                disabled={aiLoading || (!draft.rawText.trim() && !hasImages)}
                onClick={handleGenerate}
              >
                {aiLoading ? "Analyzing..." : "Auto-fill Property Details"}
              </Button>
              <button
                type="button"
                onClick={handleManual}
                className="text-sm font-medium text-accent hover:underline cursor-pointer"
              >
                Fill Out Property Details Manually
              </button>
            </div>
          </div>
        ) : (
          <div ref={formTopRef}>
            <h2 id="property-form-title" className="mb-6 text-xl font-semibold text-foreground">
              {property ? "Edit Property" : "Add Property"}
            </h2>

            {/* 1. Upload Photos */}
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">1. Upload Photos</h3>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setImagesDragOver(true);
                }}
                onDragLeave={() => setImagesDragOver(false)}
                onDrop={onDropImages}
                className={`flex flex-wrap gap-3 rounded-lg border border-dashed p-3 ${
                  imagesDragOver ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                {renderImageThumbnails()}
                <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-center text-[11px] text-foreground/50 hover:border-accent hover:text-accent">
                  + Add
                  <input type="file" accept="image/*" multiple onChange={onPickFiles} className="hidden" />
                </label>
              </div>
              {imageError && <p className="mt-2 text-xs text-red-500">{imageError}</p>}
            </section>

            {/* 2. Select Property Type */}
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">2. Select Property Type</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Property Type">
                  <select value={draft.propertyType} onChange={set("propertyType")} className={inputClass(false) + hl("propertyType")}>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Listing Type (optional)">
                  <select
                    value={draft.listingType}
                    onChange={(e) => setDraft((d) => ({ ...d, listingType: e.target.value as ListingType | "" }))}
                    className={inputClass(false) + hl("listingType")}
                  >
                    <option value="">N/A</option>
                    {LISTING_TYPES.map((lt) => (
                      <option key={lt} value={lt}>
                        {lt}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Property Condition">
                  <select
                    value={draft.condition}
                    onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value as PropertyCondition | "" }))}
                    className={inputClass(false) + hl("condition")}
                  >
                    <option value="">Unspecified</option>
                    {PROPERTY_CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                {draft.condition === "New" ? (
                  <Field label="New Condition">
                    <select value={draft.status} onChange={set("status")} className={inputClass(false) + hl("status")}>
                      {PROPERTY_STATUSES.filter((s) => s !== "Accept Reservation").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <Field label="Status">
                    <select value={draft.status} onChange={set("status")} className={inputClass(false) + hl("status")}>
                      {PROPERTY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label={draft.propertyType === "Condominium" ? "Unit Type" : "House Type"}>
                  <input
                    list="house-type-options"
                    value={draft.houseType}
                    onChange={set("houseType")}
                    className={inputClass(false) + hl("houseType")}
                  />
                  <datalist id="house-type-options">
                    {(draft.propertyType === "Condominium" ? CONDO_UNIT_TYPES : HOUSE_TYPES).map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Region">
                  <select value={draft.region} onChange={set("region")} className={inputClass(false) + hl("region")}>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Bedrooms">
                  <input type="number" min={0} value={draft.bedrooms} onChange={set("bedrooms")} className={inputClass(false) + hl("bedrooms")} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" min={0} value={draft.bathrooms} onChange={set("bathrooms")} className={inputClass(false) + hl("bathrooms")} />
                </Field>

                <Field label="House Floor Area (sqm)">
                  <input type="number" min={0} value={draft.floorArea} onChange={set("floorArea")} className={inputClass(false) + hl("floorArea")} />
                </Field>
                <Field label="Lot Area (sqm)">
                  <input type="number" min={0} value={draft.lotArea} onChange={set("lotArea")} className={inputClass(false) + hl("lotArea")} />
                </Field>

                <Field label="Number of Floors">
                  <input type="number" min={0} value={draft.floors} onChange={set("floors")} className={inputClass(false) + hl("floors")} />
                </Field>
                <Field label="Number of Car Parking Spaces (optional)">
                  <input
                    type="number"
                    min={0}
                    value={draft.carParkingSpaces}
                    onChange={set("carParkingSpaces")}
                    className={inputClass(false) + hl("carParkingSpaces")}
                  />
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
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/80">Amenities</span>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, amenities: allAmenitiesChecked ? [] : [...AMENITIES_LIST] }))}
                    className="text-xs font-medium text-accent hover:underline cursor-pointer"
                  >
                    {allAmenitiesChecked ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className={`rounded-xl border p-3 ${highlighted.has("amenities") ? "ring-2 ring-accent ring-offset-1 border-border" : "border-border"}`}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {AMENITIES_LIST.map((a) => (
                      <label key={a} className="flex items-center gap-2 text-sm text-foreground/80">
                        <input type="checkbox" checked={draft.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="h-4 w-4 rounded border-border accent-accent" />
                        {a}
                      </label>
                    ))}
                  </div>
                  <input
                    placeholder="Add More Amenities (comma-separated)"
                    value={draft.amenitiesOther}
                    onChange={set("amenitiesOther")}
                    className={`${inputClass(false)} mt-3`}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/80">Features</span>
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, features: allFeaturesChecked ? [] : [...FEATURES_LIST] }))}
                    className="text-xs font-medium text-accent hover:underline cursor-pointer"
                  >
                    {allFeaturesChecked ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className={`rounded-xl border p-3 ${highlighted.has("features") ? "ring-2 ring-accent ring-offset-1 border-border" : "border-border"}`}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {FEATURES_LIST.map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                        <input type="checkbox" checked={draft.features.includes(f)} onChange={() => toggleFeature(f)} className="h-4 w-4 rounded border-border accent-accent" />
                        {f}
                      </label>
                    ))}
                  </div>
                  <input
                    placeholder="Add More Features (comma-separated)"
                    value={draft.featuresOther}
                    onChange={set("featuresOther")}
                    className={`${inputClass(false)} mt-3`}
                  />
                </div>
              </div>
            </section>

            {/* 3. Enter Property Description */}
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">3. Enter Property Description</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Region">
                  <select value={draft.region} onChange={set("region")} className={inputClass(false) + hl("region")}>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Province">
                  <input required value={draft.province} onChange={set("province")} className={inputClass(false) + hl("province")} />
                </Field>
                <Field label="City / Municipality">
                  <input required value={draft.city} onChange={set("city")} className={inputClass(false) + hl("city")} />
                </Field>
                <Field label="What are you selling?">
                  <input required value={draft.title} onChange={set("title")} className={inputClass(false) + hl("title")} />
                </Field>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground/80">Description</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!draft.rawText}
                      onClick={() => setDraft((d) => ({ ...d, description: d.rawText }))}
                      className={`rounded-full border px-3 py-1 text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${
                        draft.description === draft.rawText && draft.rawText ? "border-accent text-accent" : "border-border text-foreground/60"
                      }`}
                    >
                      Use original
                    </button>
                    <button
                      type="button"
                      disabled={!draft.generatedDescription}
                      onClick={() => setDraft((d) => ({ ...d, description: d.generatedDescription }))}
                      className={`rounded-full border px-3 py-1 text-xs disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${
                        draft.description === draft.generatedDescription && draft.generatedDescription
                          ? "border-accent text-accent"
                          : "border-border text-foreground/60"
                      }`}
                    >
                      Use generated
                    </button>
                    <button
                      type="button"
                      disabled={descGenerating || !draft.description.trim()}
                      onClick={handleGenerateDescription}
                      className="rounded-full border border-accent px-3 py-1 text-xs text-accent disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {descGenerating ? "Generating..." : "Generate with AI"}
                    </button>
                  </div>
                </div>
                <textarea rows={5} value={draft.description} onChange={set("description")} className={inputClass(false) + hl("description")} />
                {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Developer (optional)">
                  <input value={draft.developer} onChange={set("developer")} className={inputClass(false) + hl("developer")} />
                </Field>
                <Field label="Name of Subdivision or Village (optional)">
                  <input value={draft.subdivision} onChange={set("subdivision")} className={inputClass(false) + hl("subdivision")} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Property Address (optional)">
                  <input value={draft.propertyAddress} onChange={set("propertyAddress")} className={inputClass(false) + hl("propertyAddress")} />
                </Field>
              </div>
            </section>

            {/* 4. Set Property Price */}
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">4. Set Property Price</h3>
              <Field label="Total Contract Price (₱)" error={submitAttempted && !draft.price.trim() ? "Price is required." : undefined}>
                <input
                  required
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={set("price")}
                  className={inputClass(submitAttempted && !draft.price.trim()) + hl("price")}
                />
              </Field>
            </section>

            {/* 5. Add Other Optional Details */}
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground">5. Add Other Optional Details</h3>
              <Field label="Nearby Establishments">
                <div className={`rounded-xl border p-3 ${highlighted.has("nearbyEstablishments") ? "ring-2 ring-accent ring-offset-1 border-border" : "border-border"}`}>
                  <div className="flex flex-wrap gap-2">
                    <select value={nearbyType} onChange={(e) => setNearbyType(e.target.value)} className={`${inputClass(false)} w-auto`}>
                      {NEARBY_ESTABLISHMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      value={nearbyName}
                      onChange={(e) => setNearbyName(e.target.value)}
                      placeholder="Name of establishment"
                      className={`${inputClass(false)} flex-1`}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addNearby}>
                      Add
                    </Button>
                  </div>
                  {draft.nearbyEstablishments.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {draft.nearbyEstablishments.map((e, i) => (
                        <li key={`${e.type}-${e.name}-${i}`} className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground/80">
                          <span>
                            {e.type ? `${e.type}: ` : ""}
                            {e.name}
                          </span>
                          <button type="button" onClick={() => removeNearby(i)} aria-label="Remove" className="text-foreground/50 hover:text-red-500 cursor-pointer">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>
            </section>

            {/* 6. Review and Submit */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-foreground">6. Review and Submit</h3>
              <div className="flex flex-wrap gap-3">{renderImageThumbnails()}</div>
            </section>

            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit Listing"}
              </Button>
            </div>
          </div>
        )}
      </form>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
    </Modal>
  );
}
