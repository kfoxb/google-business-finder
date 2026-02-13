import dotenv from "dotenv";
import { Config } from "./types.js";

dotenv.config();

export function loadConfig(): Config {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is required in .env");
  }

  const zipCodesRaw = process.env.ZIP_CODES || process.env.ZIP_CODE;
  if (!zipCodesRaw) {
    throw new Error("ZIP_CODES (or ZIP_CODE) is required in .env");
  }
  const zipCodes = zipCodesRaw.split(",").map((z) => z.trim()).filter(Boolean);

  const searchRadiusMeters = parseInt(
    process.env.SEARCH_RADIUS_METERS || "5000",
    10
  );
  const businessType = process.env.BUSINESS_TYPE || undefined;
  const keywordsRaw = process.env.KEYWORDS || process.env.KEYWORD || "";
  const keywords = keywordsRaw.split(",").map((k) => k.trim()).filter(Boolean);

  return { apiKey, zipCodes, searchRadiusMeters, businessType, keywords };
}
