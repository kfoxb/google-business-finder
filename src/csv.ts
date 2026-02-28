import { initDb, getBusinessesWithoutWebsite } from "./db.js";

initDb();

const noWebsite = getBusinessesWithoutWebsite();

console.log("name,address,phone,rating,reviews,google_maps_url");
for (const biz of noWebsite) {
  const address = biz.formatted_address?.replace(/, USA$/, "") || "";
  const fields = [
    biz.name,
    address,
    biz.phone || "",
    biz.rating?.toString() ?? "",
    biz.user_ratings_total?.toString() ?? "",
    biz.google_maps_url || "",
  ].map((f) => `"${f.replace(/"/g, '""')}"`);
  console.log(fields.join(","));
}
