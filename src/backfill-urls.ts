import { loadConfig } from "./config.js";
import { initDb } from "./db.js";
import { getPlaceDetails } from "./places.js";

const config = loadConfig();
const db = initDb();

const rows = db
  .prepare(
    `SELECT place_id, name FROM businesses WHERE details_fetched = 1 AND website IS NULL AND google_maps_url IS NULL`
  )
  .all() as { place_id: string; name: string }[];

console.log(`Backfilling Google Maps URLs for ${rows.length} businesses...`);

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  console.log(`  [${i + 1}/${rows.length}] ${row.name}`);
  try {
    const details = await getPlaceDetails(config.apiKey, row.place_id);
    db.prepare(
      `UPDATE businesses SET google_maps_url = ?, updated_at = datetime('now') WHERE place_id = ?`
    ).run(details.google_maps_url, row.place_id);
  } catch (err) {
    console.error(`    Error: ${err}`);
  }
}

console.log("Done.");
