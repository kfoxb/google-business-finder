import { loadConfig } from "./config.js";
import { initDb, getBusinessesWithoutWebsite } from "./db.js";

const config = loadConfig();
initDb();

const noWebsite = getBusinessesWithoutWebsite(config.zipCode);

console.log("name,address,phone,rating,reviews");
for (const biz of noWebsite) {
  const fields = [
    biz.name,
    biz.formatted_address,
    biz.phone || "",
    biz.rating?.toString() ?? "",
    biz.user_ratings_total?.toString() ?? "",
  ].map((f) => `"${f.replace(/"/g, '""')}"`);
  console.log(fields.join(","));
}
