/** Normalized place shape across providers. */
export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance_m: number;
  rating?: number;
  price?: string;
  open_now?: boolean;
  provider: "geoapify" | "yelp" | "foursquare" | "google" | "opentripmap";
  url?: string;
  address?: string;
  categories?: string[];
}

/** Request from client. */
export interface NearbyQuery {
  lat: number;
  lon: number;
  radius_m?: number; // default 1500
  limit?: number;    // default 20
}

/** Response from places API */
export interface PlacesResponse {
  places: Place[];
  source: string;
  cached?: boolean;
}