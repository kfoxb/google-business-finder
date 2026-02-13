export interface Config {
  apiKey: string;
  zipCode: string;
  searchRadiusMeters: number;
  businessType?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Business {
  place_id: string;
  name: string;
  formatted_address: string;
  lat: number;
  lng: number;
  phone: string | null;
  website: string | null;
  types: string; // JSON array as text
  business_status: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  zip_code: string;
  details_fetched: number; // 0 or 1
  created_at: string;
  updated_at: string;
}
