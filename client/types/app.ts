export type Categories = {
    id: string;
    name: string;
    img_url: string;
    created_at: string;
    updated_at: string
}

export type Restaurants = {
   id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  owner_id: string;
  description: string;
  image_url:string;
  rating: number;
  phone: number;
  created_at: string;
  updated_at: string;
}