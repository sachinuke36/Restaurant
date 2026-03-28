export type CartItem = {
  id: number;
  cart_id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
};

export type Cart = {
  id: number;
  user_id: number;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image: string;
  items: CartItem[];
  total: number;
};
