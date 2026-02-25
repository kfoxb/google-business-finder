import { loadConfig } from "./config.js";
import { initDb } from "./db.js";
import { getPlaceDetails } from "./places.js";

const config = loadConfig();
const db = initDb();

const rows = db
  .prepare(
    `SELECT place_id, name, formatted_address FROM businesses WHERE details_fetched = 1`
  )
  .all() as { place_id: string; name: string; formatted_address: string }[];

console.log(`Backfilling full addresses for ${rows.length} businesses...`);

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  console.log(`  [${i + 1}/${rows.length}] ${row.name}`);
  console.log(`    Current: ${row.formatted_address}`);
  try {
    const details = await getPlaceDetails(config.apiKey, row.place_id);
    if (details.formatted_address) {
      db.prepare(
        `UPDATE businesses SET formatted_address = ?, updated_at = datetime('now') WHERE place_id = ?`
      ).run(details.formatted_address, row.place_id);
      console.log(`    Updated: ${details.formatted_address}`);
    }
  } catch (err) {
    console.error(`    Error: ${err}`);
  }
}

console.log("Done.");
