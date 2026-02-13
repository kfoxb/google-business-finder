import { Client } from "@googlemaps/google-maps-services-js";
import { LatLng } from "./types.js";

const client = new Client({});

export interface NearbyResult {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  types: string[];
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
}

export async function nearbySearch(
  apiKey: string,
  location: LatLng,
  radius: number,
  type?: string
): Promise<NearbyResult[]> {
  const allResults: NearbyResult[] = [];
  let pageToken: string | undefined;

  do {
    const response = await client.placesNearby({
      params: {
        location,
        radius,
        ...(type ? { type } : {}),
        pagetoken: pageToken,
        key: apiKey,
      },
    });

    const results = response.data.results || [];
    for (const place of results) {
      if (!place.place_id || !place.name) continue;
      allResults.push({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.vicinity || "",
        lat: place.geometry?.location.lat || 0,
        lng: place.geometry?.location.lng || 0,
        types: place.types || [],
        business_status: place.business_status,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
      });
    }

    pageToken = response.data.next_page_token;

    // Google requires a short delay before using next_page_token
    if (pageToken) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } while (pageToken);

  return allResults;
}

export async function getPlaceDetails(
  apiKey: string,
  placeId: string
): Promise<{ phone: string | null; website: string | null }> {
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      fields: ["formatted_phone_number", "website"],
      key: apiKey,
    },
  });

  const result = response.data.result;
  return {
    phone: result?.formatted_phone_number || null,
    website: result?.website || null,
  };
}
