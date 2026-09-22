import { CONTACT_INFO } from "./constants";
import type {
  Client,
  Conversation,
  Deal,
  FaqItem,
  Inquiry,
  Property,
  SiteSettings,
  Testimonial,
  ViewingRequest,
} from "./types";

// Placeholder property photography (Unsplash). Swap via the images field
// once real Philippine property photos and/or Supabase Storage URLs are available.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;

const HOUSE_IMAGES = [
  img("photo-1568605114967-8130f3a36994"),
  img("photo-1512917774080-9991f1c4c750"),
  img("photo-1600596542815-ffad4c1539a9"),
  img("photo-1568084680786-a84f91d1153c"),
];
const CONDO_IMAGES = [
  img("photo-1570129477492-45c003edd2be"),
  img("photo-1580216643062-cf460548a66a"),
  img("photo-1600607687939-ce8a6c25118c"),
];
const TOWNHOUSE_IMAGES = [
  img("photo-1502672260266-1c1ef2d93688"),
  img("photo-1523217582562-09d0def993a6"),
];
const LAND_IMAGES = [
  img("photo-1500382017468-9049fed747ef"),
  img("photo-1500382017468-9049fed747ef"),
];
const COMMERCIAL_IMAGES = [
  img("photo-1497366216548-37526070297c"),
  img("photo-1497366811353-6870744d04b2"),
];
const SINGLE_ATTACHED_IMAGES = [
  img("photo-1523217582562-09d0def993a6"),
  img("photo-1494526585095-c41746248156"),
];

export const HERO_IMAGE = img("photo-1600585154340-be6161a56a0c");
export const ABOUT_PORTRAIT_PLACEHOLDER = "";

const PROPERTIES_BASE: Omit<
  Property,
  "listingType" | "condition" | "houseType" | "floors" | "carParkingSpaces" | "developer" | "subdivision" | "propertyAddress"
>[] = [
  {
    id: "p1",
    title: "Modern Family Home",
    description:
      "A bright, modern family home with clean architectural lines, a landscaped garden, and a private driveway — designed for comfortable everyday living.",
    propertyType: "House & Lot",
    region: "Luzon",
    province: "Cavite",
    city: "Dasmariñas",
    price: 5_800_000,
    bedrooms: 3,
    bathrooms: 2,
    lotArea: 120,
    floorArea: 85,
    status: "RFO",
    featured: true,
    images: HOUSE_IMAGES,
    features: ["Two-car garage", "Landscaped garden", "Covered porch", "Maid's room"],
    amenities: ["Gated subdivision", "24/7 security", "Clubhouse access"],
    nearbyLocations: ["SM Dasmariñas", "De La Salle University Dasmariñas", "CAVITEX access"],
    createdAt: "2026-06-01",
  },
  {
    id: "p2",
    title: "Skyline Residences Unit",
    description:
      "A well-appointed condominium unit ideal for city living or as a rental investment, with easy access to major business districts.",
    propertyType: "Condominium",
    region: "Luzon",
    province: "Metro Manila",
    city: "Taguig",
    price: 8_200_000,
    bedrooms: 2,
    bathrooms: 1,
    lotArea: null,
    floorArea: 52,
    status: "RFO",
    featured: true,
    images: CONDO_IMAGES,
    features: ["Balcony", "Floor-to-ceiling windows", "Parking slot included"],
    amenities: ["Swimming pool", "Fitness center", "24/7 concierge"],
    nearbyLocations: ["Bonifacio Global City", "SM Aura", "Market! Market!"],
    createdAt: "2026-05-20",
  },
  {
    id: "p3",
    title: "Greenview Townhouse",
    description:
      "A practical and affordable townhouse in a quiet, established community — a solid option for growing families.",
    propertyType: "Townhouse",
    region: "Luzon",
    province: "Laguna",
    city: "Santa Rosa",
    price: 4_200_000,
    bedrooms: 3,
    bathrooms: 2,
    lotArea: 60,
    floorArea: 70,
    status: "RFO",
    featured: true,
    images: TOWNHOUSE_IMAGES,
    features: ["Private carport", "Balcony", "Provision for aircon"],
    amenities: ["Community park", "Perimeter fence", "Guarded entrance"],
    nearbyLocations: ["Nuvali", "Santa Rosa exit", "Paseo de Santa Rosa"],
    createdAt: "2026-05-10",
  },
  {
    id: "p4",
    title: "Riverside Residential Lot",
    description:
      "A quiet residential lot suited for a custom-built home or long-term land investment.",
    propertyType: "Lot & Land",
    region: "Luzon",
    province: "Batangas",
    city: "Lipa",
    price: 2_500_000,
    bedrooms: null,
    bathrooms: null,
    lotArea: 300,
    floorArea: null,
    status: "RFO",
    featured: false,
    images: LAND_IMAGES,
    features: ["Corner lot", "Titled property", "Road access"],
    amenities: ["Near main highway"],
    nearbyLocations: ["Lipa City proper", "STAR Tollway"],
    createdAt: "2026-04-28",
  },
  {
    id: "p5",
    title: "Downtown Commercial Space",
    description:
      "A versatile commercial space suited for retail, office, or business use in a high-traffic area.",
    propertyType: "Bungalow",
    region: "Visayas",
    province: "Cebu",
    city: "Cebu City",
    price: 12_500_000,
    bedrooms: null,
    bathrooms: 2,
    lotArea: 150,
    floorArea: 200,
    status: "RFO",
    featured: true,
    images: COMMERCIAL_IMAGES,
    features: ["Ground floor frontage", "Ample parking", "High foot traffic"],
    amenities: ["Near business district"],
    nearbyLocations: ["Ayala Center Cebu", "Cebu IT Park"],
    createdAt: "2026-06-10",
  },
  {
    id: "p6",
    title: "Highland Single Attached Home",
    description:
      "A single-attached home offering more privacy than a townhouse at a practical price point, set in a growing highland community.",
    propertyType: "Single Attached",
    region: "Mindanao",
    province: "Bukidnon",
    city: "Malaybalay",
    price: 3_600_000,
    bedrooms: 3,
    bathrooms: 2,
    lotArea: 90,
    floorArea: 72,
    status: "RFO",
    featured: false,
    images: SINGLE_ATTACHED_IMAGES,
    features: ["Private side yard", "Carport", "One shared wall"],
    amenities: ["Road access", "Near town proper"],
    nearbyLocations: ["Malaybalay City proper"],
    createdAt: "2026-03-15",
  },
  {
    id: "p7",
    title: "Seaside Bungalow",
    description:
      "A cozy single-storey home a short drive from the coast, ideal as a primary residence or vacation property.",
    propertyType: "House & Lot",
    region: "Visayas",
    province: "Iloilo",
    city: "Iloilo City",
    price: 3_900_000,
    bedrooms: 2,
    bathrooms: 1,
    lotArea: 100,
    floorArea: 65,
    status: "Accept Reservation",
    featured: false,
    images: HOUSE_IMAGES,
    features: ["Garden space", "Covered patio"],
    amenities: ["Near coastal road"],
    nearbyLocations: ["Iloilo Business Park"],
    createdAt: "2026-02-22",
  },
  {
    id: "p8",
    title: "Uptown Condo Suite",
    description: "A compact, efficient condo suite well-suited to young professionals or investors.",
    propertyType: "Condominium",
    region: "Mindanao",
    province: "Davao",
    city: "Davao City",
    price: 3_400_000,
    bedrooms: 1,
    bathrooms: 1,
    lotArea: null,
    floorArea: 30,
    status: "RFO",
    featured: true,
    images: CONDO_IMAGES,
    features: ["City view", "Built-in cabinetry"],
    amenities: ["Rooftop deck", "Function room"],
    nearbyLocations: ["Abreeza Mall", "Davao International Airport"],
    createdAt: "2026-06-18",
  },
  {
    id: "p9",
    title: "Parkview Family Townhouse",
    description: "A modern townhouse unit close to schools and commercial centers.",
    propertyType: "Townhouse",
    region: "Luzon",
    province: "Rizal",
    city: "Antipolo",
    price: 4_800_000,
    bedrooms: 3,
    bathrooms: 2,
    lotArea: 65,
    floorArea: 78,
    status: "RFO",
    featured: false,
    images: TOWNHOUSE_IMAGES,
    features: ["Balcony", "Carport"],
    amenities: ["Playground", "Guarded entrance"],
    nearbyLocations: ["Robinsons Antipolo", "Antipolo Cathedral"],
    createdAt: "2026-05-02",
  },
  {
    id: "p10",
    title: "Executive Family Estate",
    description: "A spacious executive home with generous outdoor space, suited for large families.",
    propertyType: "House & Lot",
    region: "Luzon",
    province: "Pampanga",
    city: "Angeles",
    price: 9_500_000,
    bedrooms: 4,
    bathrooms: 3,
    lotArea: 200,
    floorArea: 180,
    status: "RFO",
    featured: false,
    images: HOUSE_IMAGES,
    features: ["Two-car garage", "Home office space", "Landscaped garden"],
    amenities: ["Gated community", "Clubhouse", "Swimming pool access"],
    nearbyLocations: ["Clark Freeport Zone", "SM City Clark"],
    createdAt: "2026-04-05",
  },
  {
    id: "p11",
    title: "Investment Lot Near Highway",
    description: "A strategically located lot suited for commercial or investment purposes.",
    propertyType: "Lot & Land",
    region: "Visayas",
    province: "Bacolod",
    city: "Bacolod City",
    price: 1_800_000,
    bedrooms: null,
    bathrooms: null,
    lotArea: 250,
    floorArea: null,
    status: "Pre-selling",
    featured: false,
    images: LAND_IMAGES,
    features: ["Titled property", "Level terrain"],
    amenities: [],
    nearbyLocations: ["Bacolod-Silay Highway"],
    createdAt: "2026-01-30",
  },
  {
    id: "p12",
    title: "Cabanatuan Single Attached Home",
    description: "A compact single-attached home in a developing residential corridor, well suited for first-time buyers.",
    propertyType: "Single Attached",
    region: "Luzon",
    province: "Nueva Ecija",
    city: "Cabanatuan",
    price: 2_800_000,
    bedrooms: 2,
    bathrooms: 1,
    lotArea: 70,
    floorArea: 55,
    status: "RFO",
    featured: false,
    images: SINGLE_ATTACHED_IMAGES,
    features: ["Provision for carport", "One shared wall"],
    amenities: ["Near main road"],
    nearbyLocations: ["Cabanatuan City proper"],
    createdAt: "2026-03-01",
  },
];

export const PROPERTIES: Property[] = PROPERTIES_BASE.map((p) => ({
  ...p,
  listingType: "For Sale",
  condition: null,
  houseType: null,
  floors: null,
  carParkingSpaces: null,
  developer: null,
  subdivision: null,
  propertyAddress: null,
}));

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "The Dela Cruz Family",
    location: "Liora Homes, Naic",
    rating: 5,
    message:
      "Arnold made the entire process so easy. He explained everything clearly — from Pag-IBIG requirements to monthly amortization. Now we have our own home in Liora!",
    enabled: true,
  },
  {
    id: "t2",
    name: "Mark & Jen Villamor",
    location: "Pagsibol Village, Pampanga",
    rating: 5,
    message:
      "What we love about Arnold is he's not just an agent — he genuinely cares. He followed up on our application and even checked in with us during turnover.",
    enabled: true,
  },
  {
    id: "t3",
    name: "Jomari Salazar",
    location: "Masaito Homes, Imus",
    rating: 5,
    message:
      "I discovered Arnold through his property listings online. His content and follow-through convinced us Masaito Homes was the right developer for our family.",
    enabled: true,
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "f1",
    question: "What types of properties do you offer?",
    answer:
      "House & lot, condominiums, townhouses, single attached homes, lots & land, and commercial spaces across the Philippines.",
  },
  {
    id: "f2",
    question: "Do you have properties outside Metro Manila?",
    answer:
      "Yes. Property opportunities are available across Luzon, Visayas, and Mindanao, not just Metro Manila.",
  },
  {
    id: "f3",
    question: "Can I schedule a property viewing?",
    answer:
      "Yes, you can request a property viewing appointment directly through the website and Arnold's team will confirm the schedule with you.",
  },
  {
    id: "f4",
    question: "Can I inquire about a property online?",
    answer: "Yes, you can send an inquiry for any listed property directly through the website.",
  },
  {
    id: "f5",
    question: "Do you assist property buyers?",
    answer:
      "Yes, assistance is available for buyers from property selection through the transaction process.",
  },
  {
    id: "f6",
    question: "Do you offer investment properties?",
    answer:
      "Yes, including lots, land, and commercial properties suited for long-term investment purposes.",
  },
];

// Sample admin-dashboard data shown only while Supabase isn't connected (see
// src/lib/data.ts) — read-only preview, not real submissions.
export const MOCK_INQUIRIES: Inquiry[] = [];

export const MOCK_CONVERSATIONS: Conversation[] = [];

export const MOCK_VIEWING_REQUESTS: ViewingRequest[] = [];

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_DEALS: Deal[] = [];

export const MOCK_SETTINGS: SiteSettings = {
  phone: CONTACT_INFO.phone,
  email: CONTACT_INFO.email,
  facebook: CONTACT_INFO.facebook,
  instagram: CONTACT_INFO.instagram,
  tiktok: CONTACT_INFO.tiktok,
  youtube: CONTACT_INFO.youtube,
  notifyOnInquiry: true,
  notifyOnViewing: true,
};
