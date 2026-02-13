import dotenv from "dotenv";
import { Config } from "./types.js";

dotenv.config();

export function loadConfig(): Config {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is required in .env");
  }

  const zipCode = process.env.ZIP_CODE;
  if (!zipCode) {
    throw new Error("ZIP_CODE is required in .env");
  }

  const searchRadiusMeters = parseInt(
    process.env.SEARCH_RADIUS_METERS || "5000",
    10
  );
  const businessType = process.env.BUSINESS_TYPE || "restaurant";

  return { apiKey, zipCode, searchRadiusMeters, businessType };
}
