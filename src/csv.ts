import { initDb, getBusinessesWithoutWebsite } from "./db.js";

initDb();

const noWebsite = getBusinessesWithoutWebsite();

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
