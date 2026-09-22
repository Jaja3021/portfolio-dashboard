export type Region = "Luzon" | "Visayas" | "Mindanao";

export type PropertyType =
  | "House & Lot"
  | "Condominium"
  | "Townhouse"
  | "Lot & Land"
  | "Bungalow"
  | "Single Attached";

export type PropertyStatus = "RFO" | "Pre-selling" | "Accept Reservation";

export type ListingType = "For Sale" | "For Rent/Lease" | "Pasalo";

export type PropertyCondition = "New" | "Pre-owned";

export type PriceRangeKey =
  | "below-1m"
  | "1m-3m"
  | "3m-5m"
  | "5m-10m"
  | "10m-plus";

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  region: Region;
  province: string;
  city: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  lotArea: number | null;
  floorArea: number | null;
  status: PropertyStatus;
  featured: boolean;
  images: string[];
  features: string[];
  amenities: string[];
  nearbyLocations: string[];
  listingType: ListingType | null;
  condition: PropertyCondition | null;
  houseType: string | null;
  floors: number | null;
  carParkingSpaces: number | null;
  developer: string | null;
  subdivision: string | null;
  propertyAddress: string | null;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location?: string;
  rating?: number;
  message: string;
  enabled: boolean;
}

export type InquiryStatus = "New" | "Contacted" | "In Progress" | "Closed";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredProperty: string | null;
  preferredLocation: string | null;
  budget: string | null;
  message: string | null;
  status: InquiryStatus;
  createdAt: string;
}

export type ViewingRequestStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface ViewingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyText: string | null;
  preferredDate: string;
  preferredTime: string;
  message: string | null;
  status: ViewingRequestStatus;
  createdAt: string;
}

export type ClientStatus = "Lead" | "Contacted" | "Active" | "Closed";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string | null;
  status: ClientStatus;
  notes: string | null;
  nextFollowUp: string | null;
  createdAt: string;
}

export type DealStage = "Offer" | "Reservation" | "Financing" | "Closing" | "Completed" | "Cancelled";

export interface Deal {
  id: string;
  clientName: string;
  propertyTitle: string;
  stage: DealStage;
  amount: number | null;
  notes: string | null;
  createdAt: string;
}

export interface SiteSettings {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  notifyOnInquiry: boolean;
  notifyOnViewing: boolean;
}

export type MessageRole = "user" | "assistant" | "admin";

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  contactName: string | null;
  contactEmail: string | null;
  lastMessageAt: string;
  createdAt: string;
  humanTakeover: boolean;
  messages: ConversationMessage[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FilterState {
  search: string;
  propertyType: PropertyType | "all";
  region: Region | "all";
  province: string | "all";
  priceRange: PriceRangeKey | "all";
  bedrooms: number | "all";
  status: PropertyStatus | "all";
}

export interface InquiryFormData {
  fullName: string;
  email: string;
  phone: string;
  preferredProperty: string;
  preferredLocation: string;
  budget: string;
  message: string;
}

export interface ViewingFormData {
  name: string;
  email: string;
  phone: string;
  property: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: string;
  message: string;
}
