import type { Property, FilterState } from "./types";
import { PRICE_RANGES } from "./constants";

export function formatPrice(price: number): string {
  return `₱${price.toLocaleString("en-PH")}`;
}

export function formatArea(area: number | null, unit: string): string | null {
  if (area === null) return null;
  return `${area.toLocaleString("en-PH")} ${unit}`;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  propertyType: "all",
  region: "all",
  province: "all",
  priceRange: "all",
  bedrooms: "all",
  status: "all",
};

export function filtersAreActive(filters: FilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.propertyType !== "all" ||
    filters.region !== "all" ||
    filters.province !== "all" ||
    filters.priceRange !== "all" ||
    filters.bedrooms !== "all" ||
    filters.status !== "all"
  );
}

export function filterProperties(properties: Property[], filters: FilterState): Property[] {
  const term = filters.search.trim().toLowerCase();

  return properties.filter((p) => {
    if (
      term &&
      !p.title.toLowerCase().includes(term) &&
      !p.city.toLowerCase().includes(term) &&
      !p.province.toLowerCase().includes(term)
    ) {
      return false;
    }
    if (filters.propertyType !== "all" && p.propertyType !== filters.propertyType) return false;
    if (filters.region !== "all" && p.region !== filters.region) return false;
    if (filters.province !== "all" && p.province !== filters.province) return false;
    if (filters.status !== "all" && p.status !== filters.status) return false;
    if (filters.bedrooms !== "all" && (p.bedrooms ?? 0) < filters.bedrooms) return false;
    if (filters.priceRange !== "all") {
      const range = PRICE_RANGES.find((r) => r.key === filters.priceRange);
      if (range && (p.price < range.min || p.price >= range.max)) return false;
    }
    return true;
  });
}
