import { Client } from "@googlemaps/google-maps-services-js";
import { LatLng } from "./types.js";

const client = new Client({});

export async function geocodeZip(
  apiKey: string,
  zipCode: string
): Promise<LatLng> {
  const response = await client.geocode({
    params: {
      address: zipCode,
      key: apiKey,
    },
  });

  const results = response.data.results;
  if (!results.length) {
    throw new Error(`No geocoding results for zip code: ${zipCode}`);
  }

  const { lat, lng } = results[0].geometry.location;
  return { lat, lng };
}
