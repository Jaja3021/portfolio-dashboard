import { NextResponse, type NextRequest } from "next/server";
import { AMENITIES_LIST, CONDO_UNIT_TYPES, FEATURES_LIST, HOUSE_TYPES, PROPERTY_STATUSES, PROPERTY_TYPES, REGIONS } from "@/lib/constants";

export const runtime = "nodejs";

interface AutofillImage {
  base64: string;
  mediaType?: string;
}

interface AutofillRequestBody {
  description?: string;
  images?: AutofillImage[];
}

const MAX_DESCRIPTION_CHARS = 5000;
const MAX_IMAGES = 10;
// Rough ceiling on a single image's base64 payload (client-side compression should keep it well under this).
const MAX_IMAGE_BASE64_CHARS = 4_000_000;

function buildPrompt(description: string) {
  return `You are helping fill out a real estate property listing form from raw, unstructured text and photos pasted by an agent in the Philippines.
Analyze the attached photos (if any) and the pasted text below, and extract everything you can.
Return ONLY a JSON object (no markdown fences, no commentary) with these fields (use null, or an empty array for list fields, for anything you cannot confidently determine — never guess a price):

{
  "title": string | null,
  "propertyType": ${PROPERTY_TYPES.map((t) => `"${t}"`).join(" | ")} | null,
  "listingType": "For Sale" | "For Rent/Lease" | "Pasalo" | null, // "Pasalo" = the buyer assumes/takes over the seller's existing mortgage/loan balance
  "condition": "New" | "Pre-owned" | null,
  "newCondition": ${PROPERTY_STATUSES.map((s) => `"${s}"`).join(" | ")} | null,
  "houseType": string | null, // if propertyType is "Condominium", use a unit type like ${CONDO_UNIT_TYPES.map((t) => `"${t}"`).join(", ")}; otherwise a house type like ${HOUSE_TYPES.map((t) => `"${t}"`).join(", ")}
  "bedrooms": number | null,
  "bathrooms": number | null,
  "floorAreaSqm": number | null,
  "lotAreaSqm": number | null,
  "floors": number | null,
  "carParkingSpaces": number | null,
  "amenities": string[],
  "otherAmenities": string[],
  "features": string[],
  "otherFeatures": string[],
  "region": ${REGIONS.map((r) => `"${r}"`).join(" | ")} | null,
  "province": string | null,
  "cityTownProvince": string | null,
  "description": string,
  "developer": string | null,
  "subdivisionOrVillage": string | null,
  "propertyAddress": string | null,
  "price": number | null,
  "nearbyEstablishments": [{"type": string, "name": string}]
}

For "amenities", only include items from this fixed list if you can see or infer them: ${AMENITIES_LIST.map((a) => `"${a}"`).join(", ")}. Anything amenity-like but not on that list goes in "otherAmenities" instead.
For "features", only include items from this fixed list if you can see or infer them: ${FEATURES_LIST.map((f) => `"${f}"`).join(", ")}. Anything feature-like but not on that list goes in "otherFeatures" instead.
Use both the pasted text and the photos (visual cues like pools, courts, gyms, security booths, greenery, parking) to infer amenities and features even if not explicitly mentioned in the text.
"description" should be a cleaned-up, well-written rewrite of the pasted text (not left null/empty even if short).
"cityTownProvince" is a single human-readable "City, Province" style string; also split it into "region" and "province" when you can tell.

Pasted text: "${description || "(none provided)"}"`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI autofill is not configured on this server." }, { status: 500 });
  }

  let body: AutofillRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const description = (body.description ?? "").trim().slice(0, MAX_DESCRIPTION_CHARS);
  const images = Array.isArray(body.images) ? body.images.slice(0, MAX_IMAGES) : [];

  if (!description && images.length === 0) {
    return NextResponse.json({ error: "Provide a photo or a description." }, { status: 400 });
  }
  if (images.some((img) => typeof img.base64 !== "string" || img.base64.length > MAX_IMAGE_BASE64_CHARS)) {
    return NextResponse.json({ error: "One of the images is too large." }, { status: 413 });
  }

  const parts: Array<Record<string, unknown>> = [{ text: buildPrompt(description) }];
  for (const img of images) {
    parts.push({
      inline_data: { mime_type: img.mediaType === "image/png" ? "image/png" : "image/jpeg", data: img.base64 },
    });
  }

  const GEMINI_BODY = JSON.stringify({
    contents: [{ role: "user", parts }],
    generationConfig: { responseMimeType: "application/json" },
  });
  // Gemini's flash tier returns 503 "overloaded" fairly often under normal
  // load — retry with backoff, then fall back to a second model, before
  // surfacing a failure to the user.
  const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
  const RETRY_DELAYS_MS = [800, 2000];

  let response: Response | undefined;
  outer: for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: GEMINI_BODY,
        });
      } catch (error) {
        console.warn("AI autofill request failed:", error);
        return NextResponse.json({ error: "Couldn't reach the AI service." }, { status: 502 });
      }

      if (response.ok) break outer;
      // 503 (overloaded), 404 (model retired/renamed), and 429 (this model's
      // free-tier quota exhausted) are all worth trying the next model for;
      // anything else (bad request, auth, etc.) won't be fixed by that.
      if (response.status !== 503 && response.status !== 404 && response.status !== 429) break outer;
      if (response.status === 503 && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      } else {
        break;
      }
    }
  }

  if (!response!.ok) {
    const text = await response!.text().catch(() => "");
    console.warn("Gemini API error:", response!.status, text);
    const message =
      response!.status === 429
        ? "AI autofill has hit today's free-tier request limit. Please try again later, or enter details manually."
        : "The AI service returned an error. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  response = response!;

  const data = await response.json();
  const textBlock: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof textBlock !== "string") {
    return NextResponse.json({ error: "Couldn't parse the AI response." }, { status: 502 });
  }

  const jsonMatch = textBlock.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Couldn't parse the AI response." }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result: parsed });
  } catch (error) {
    console.error("Failed to parse AI JSON:", error, textBlock);
    return NextResponse.json({ error: "Couldn't parse the AI response." }, { status: 502 });
  }
}
