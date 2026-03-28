export type Categories = {
  id: number | string;
  name: string;
  img_url: string;
  created_at?: string;
  updated_at?: string;
}

export type Restaurants = {
  id: number | string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  owner_id: number | string;
  description?: string | null;
  image_url?: string | null;
  rating?: number | null;
  phone: string;
  is_open?: boolean;
  is_active?: boolean;
  delivery_time?: number | null;
  delivery_fee?: string | null;
  created_at: string;
  updated_at: string;
}