import Database from "better-sqlite3";
import path from "path";
import { Business } from "./types.js";

const DB_PATH = path.resolve("businesses.db");

let db: Database.Database;

export function initDb(): Database.Database {
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      place_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      formatted_address TEXT,
      lat REAL,
      lng REAL,
      phone TEXT,
      website TEXT,
      types TEXT,
      business_status TEXT,
      rating REAL,
      user_ratings_total INTEGER,
      zip_code TEXT,
      details_fetched INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  return db;
}

export function upsertBusiness(business: {
  place_id: string;
  name: string;
  formatted_address: string | null;
  lat: number;
  lng: number;
  types: string;
  business_status: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  zip_code: string;
}): void {
  const stmt = db.prepare(`
    INSERT INTO businesses (place_id, name, formatted_address, lat, lng, types, business_status, rating, user_ratings_total, zip_code)
    VALUES (@place_id, @name, @formatted_address, @lat, @lng, @types, @business_status, @rating, @user_ratings_total, @zip_code)
    ON CONFLICT(place_id) DO UPDATE SET
      name = excluded.name,
      formatted_address = excluded.formatted_address,
      lat = excluded.lat,
      lng = excluded.lng,
      types = excluded.types,
      business_status = excluded.business_status,
      rating = excluded.rating,
      user_ratings_total = excluded.user_ratings_total,
      updated_at = datetime('now')
  `);
  stmt.run(business);
}

export function getUnfetchedBusinesses(): Business[] {
  const stmt = db.prepare(
    `SELECT * FROM businesses WHERE details_fetched = 0`
  );
  return stmt.all() as Business[];
}

export function updateBusinessDetails(
  placeId: string,
  phone: string | null,
  website: string | null
): void {
  const stmt = db.prepare(`
    UPDATE businesses
    SET phone = ?, website = ?, details_fetched = 1, updated_at = datetime('now')
    WHERE place_id = ?
  `);
  stmt.run(phone, website, placeId);
}

export function getBusinessesWithoutWebsite(): Business[] {
  const stmt = db.prepare(
    `SELECT * FROM businesses WHERE details_fetched = 1 AND website IS NULL`
  );
  return stmt.all() as Business[];
}
