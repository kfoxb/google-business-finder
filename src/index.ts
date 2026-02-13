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
  const filterParts = [
    config.businessType,
    config.keywords.length ? config.keywords.join(", ") : null,
  ].filter(Boolean).join(" | ") || "all businesses";
  console.log(
    `Searching for "${filterParts}" near ${config.zipCodes.join(", ")} (radius: ${config.searchRadiusMeters}m)`
  );

  initDb();

  // If no keywords, run one search per zip with no keyword
  const searchKeywords = config.keywords.length ? config.keywords : [undefined];

  for (const zipCode of config.zipCodes) {
    console.log(`\n--- Zip code: ${zipCode} ---`);

    // Geocode zip code
    console.log(`Geocoding ${zipCode}...`);
    const location = await geocodeZip(config.apiKey, zipCode);
    console.log(`Location: ${location.lat}, ${location.lng}`);

    for (const keyword of searchKeywords) {
      console.log(`Searching${keyword ? ` for "${keyword}"` : ""}...`);
      const results = await nearbySearch(
        config.apiKey,
        location,
        config.searchRadiusMeters,
        config.businessType,
        keyword
      );
      console.log(`Found ${results.length} businesses`);

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
          zip_code: zipCode,
        });
      }
    }
  }

  // Fetch details for businesses not yet enriched
  const unfetched = getUnfetchedBusinesses();
  console.log(`\nFetching details for ${unfetched.length} businesses...`);

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
