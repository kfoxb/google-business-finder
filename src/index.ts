import { loadConfig } from "./config.js";
import {
  initDb,
  upsertBusiness,
  getUnfetchedBusinesses,
  updateBusinessDetails,
} from "./db.js";
import { geocodeZip } from "./geocode.js";
import { nearbySearch, getPlaceDetails } from "./places.js";

async function main() {
  const config = loadConfig();
  const typeLabel = config.businessType ?? "all businesses";
  console.log(
    `Searching for "${typeLabel}" near ${config.zipCode} (radius: ${config.searchRadiusMeters}m)`
  );

  initDb();

  // Geocode zip code
  console.log(`Geocoding zip code ${config.zipCode}...`);
  const location = await geocodeZip(config.apiKey, config.zipCode);
  console.log(`Location: ${location.lat}, ${location.lng}`);

  // Nearby search
  console.log("Running nearby search...");
  const results = await nearbySearch(
    config.apiKey,
    location,
    config.searchRadiusMeters,
    config.businessType
  );
  console.log(`Found ${results.length} businesses`);

  // Upsert into database
  for (const result of results) {
    upsertBusiness({
      place_id: result.place_id,
      name: result.name,
      formatted_address: result.formatted_address,
      lat: result.lat,
      lng: result.lng,
      types: JSON.stringify(result.types),
      business_status: result.business_status || null,
      rating: result.rating ?? null,
      user_ratings_total: result.user_ratings_total ?? null,
      zip_code: config.zipCode,
    });
  }

  // Fetch details for businesses not yet enriched
  const unfetched = getUnfetchedBusinesses(config.zipCode);
  console.log(`Fetching details for ${unfetched.length} businesses...`);

  for (let i = 0; i < unfetched.length; i++) {
    const biz = unfetched[i];
    console.log(
      `  [${i + 1}/${unfetched.length}] ${biz.name}`
    );
    try {
      const details = await getPlaceDetails(config.apiKey, biz.place_id);
      updateBusinessDetails(biz.place_id, details.phone, details.website);
    } catch (err) {
      console.error(`    Error fetching details for ${biz.name}:`, err);
    }
  }

  console.log("\nDone. Run `npm run csv` to export businesses without websites.")
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
