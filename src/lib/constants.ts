import type { ClientStatus, DealStage, ListingType, PriceRangeKey, PropertyCondition, PropertyType, Region } from "./types";

export const REGIONS: Region[] = ["Luzon", "Visayas", "Mindanao"];

export const PROPERTY_TYPES: PropertyType[] = [
  "House & Lot",
  "Condominium",
  "Townhouse",
  "Lot & Land",
  "Bungalow",
  "Single Attached",
];

export const PROPERTY_STATUSES = ["RFO", "Pre-selling", "Accept Reservation"] as const;

export const AMENITIES_LIST = [
  "Basketball Court",
  "Badminton Court",
  "Billiard Room",
  "Church",
  "Cinema / Hall",
  "Clubhouse",
  "Commercial Center",
  "Function Room/Hall",
  "Garden",
  "Gym",
  "Kiddie Pool",
  "Party Hall",
  "Play Area/Playground",
  "Swimming Pool",
  "Walking/Jogging Trail",
] as const;

export const FEATURES_LIST = [
  "24-Hour Maintenance",
  "24-Hour Security",
  "Air-Conditioning",
  "Balcony",
  "CCTV",
  "Car Parking/Garage",
  "Elevator",
  "Fire Alarm",
  "Fully Furnished",
  "Intercom",
  "Maid's Room",
  "Overlooking View",
  "Storage Room",
  "Water Heater",
] as const;

export const LISTING_TYPES: ListingType[] = ["For Sale", "For Rent/Lease", "Pasalo"];

export const PROPERTY_CONDITIONS: PropertyCondition[] = ["New", "Pre-owned"];

export const HOUSE_TYPES = [
  "Single Attached",
  "Single Detached",
  "Duplex",
  "Townhouse",
  "Bungalow",
] as const;

export const CONDO_UNIT_TYPES = [
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "Loft",
  "Penthouse",
] as const;

export const NEARBY_ESTABLISHMENT_TYPES = ["Restaurant", "Mall", "Hospital", "School", "Grocery", "Road"] as const;

export const CLIENT_STATUSES: ClientStatus[] = ["Lead", "Contacted", "Active", "Closed"];

export const DEAL_STAGES: DealStage[] = [
  "Offer",
  "Reservation",
  "Financing",
  "Closing",
  "Completed",
  "Cancelled",
];

export const PRICE_RANGES: { key: PriceRangeKey; label: string; min: number; max: number }[] = [
  { key: "below-1m", label: "Below ₱1M", min: 0, max: 1_000_000 },
  { key: "1m-3m", label: "₱1M – ₱3M", min: 1_000_000, max: 3_000_000 },
  { key: "3m-5m", label: "₱3M – ₱5M", min: 3_000_000, max: 5_000_000 },
  { key: "5m-10m", label: "₱5M – ₱10M", min: 5_000_000, max: 10_000_000 },
  { key: "10m-plus", label: "₱10M+", min: 10_000_000, max: Infinity },
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export const MONTHLY_BUDGET_RANGES = [
  "Under ₱10,000/month",
  "₱10,000 - ₱15,000/month",
  "₱15,000 - ₱25,000/month",
  "₱25,000 - ₱35,000/month",
  "Above ₱35,000/month",
  "Not applicable",
];

export interface LocationGroup {
  region: Region;
  description: string;
  provinces: string[];
}

export const PH_LOCATIONS: LocationGroup[] = [
  {
    region: "Luzon",
    description: "Residential, commercial, and investment opportunities across Luzon.",
    provinces: [
      "Metro Manila",
      "Cavite",
      "Laguna",
      "Batangas",
      "Rizal",
      "Bulacan",
      "Pampanga",
      "Baguio",
      "Pangasinan",
      "Quezon",
      "Nueva Ecija",
      "Palawan",
      "Bicol",
    ],
  },
  {
    region: "Visayas",
    description: "Discover growing cities and investment opportunities in the Visayas.",
    provinces: ["Cebu", "Iloilo", "Bacolod", "Bohol", "Leyte", "Samar", "Dumaguete"],
  },
  {
    region: "Mindanao",
    description: "Explore residential and investment properties in Mindanao.",
    provinces: [
      "Davao",
      "Cagayan de Oro",
      "General Santos",
      "Zamboanga",
      "Bukidnon",
      "Iligan",
      "Surigao",
    ],
  },
];

export const ALL_PROVINCES = PH_LOCATIONS.flatMap((g) => g.provinces);

export const CONTACT_INFO = {
  phone: "0916 633 5485",
  phoneHref: "+639166335485",
  email: "noldfadri@gmail.com",
  location: "Philippines",
  facebook: "https://www.facebook.com/arnold.fadriquila.5",
  instagram: "https://www.instagram.com/nold_fadri/",
  tiktok: "https://www.tiktok.com/@noldfadri?lang=en",
  youtube: "https://www.youtube.com/@murangbahaytv9512",
};
