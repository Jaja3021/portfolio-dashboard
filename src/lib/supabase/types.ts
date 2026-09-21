import type {
  ClientStatus,
  DealStage,
  InquiryStatus,
  PropertyStatus,
  PropertyType,
  Region,
  ViewingRequestStatus,
} from "@/lib/types";

export interface PropertyRow {
  id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  region: Region;
  province: string;
  city: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  lot_area: number | null;
  floor_area: number | null;
  status: PropertyStatus;
  featured: boolean;
  features: string[];
  amenities: string[];
  nearby_locations: string[];
  created_at: string;
  property_images: { image_url: string }[] | null;
}

export interface TestimonialRow {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  message: string;
  enabled: boolean;
  created_at: string;
}

export interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferred_property: string | null;
  preferred_location: string | null;
  budget: string | null;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
}

export interface ViewingRequestRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_text: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: ViewingRequestStatus;
  created_at: string;
}

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string | null;
  status: ClientStatus;
  notes: string | null;
  next_follow_up: string | null;
  created_at: string;
}

export interface DealRow {
  id: string;
  client_name: string;
  property_title: string;
  stage: DealStage;
  amount: number | null;
  notes: string | null;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "admin";
  content: string;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  session_id: string;
  contact_name: string | null;
  contact_email: string | null;
  last_message_at: string;
  created_at: string;
  human_takeover: boolean;
  messages: MessageRow[] | null;
}

export interface PageViewRow {
  id: string;
  path: string;
  session_id: string | null;
  referrer: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface SiteSettingsRow {
  id: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  notify_on_inquiry: boolean;
  notify_on_viewing: boolean;
  updated_at: string;
}
