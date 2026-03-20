
export type Users =  {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    created_at: Date;
    updated_at: Date;
    role: "customer" | "owner" | "delivery_person" | "admin";
}

export type Restaurant = {
    id: number;
    name: string;
    address: string;
    owner_id: number;

    description?: string;
    image_url?: string;
    rating: number;
    phone: string;
    created_at: Date;
    updated_at: Date;
}

export type CartItem = {
    id: number;
    customer_id: number;
    menu_item_id: number;
    restaurant_id: number;
    quantity: number;
    created_at: Date;
    updated_at: Date;
}


export type Owner ={
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export type MenuItem = {
    id: number;
    restaurant_id: number;
    img_url?: string;
    name: string;
    description: string;
    price: number;
    created_at: Date;
    updated_at: Date;
}

export type Order = {
    id: number;
    customer_id: number;
    restaurant_id: number;
    total_price: number;
    status: OrderStatus;
    created_at: Date;
    updated_at: Date;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderItem = {
    id: number;
    order_id: number;
    menu_item_id: number;
    restaurant_id: number;
    quantity: number;
    price: number;
    created_at: Date;
    updated_at: Date;
}

export type Review = {
    id: number;
    customer_id: number;
    restaurant_id: number;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    created_at: Date;
    updated_at: Date;
}

export type Favorite = {
    id: number;
    customer_id: number;
    restaurant_id: number;
    created_at: Date;
    updated_at: Date;
}

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "delivered"
  | "cancelled";

export type Delivery = {
    id: number;
    order_id: number;
    delivery_person_id: number;
    status: DeliveryStatus;
    created_at: Date;
    updated_at: Date;
}

export type DeliveryPerson = {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export type PaymentMethod =
  | "card"
  | "upi"
  | "cash"
  | "wallet";

  export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export type Payment = {
    id: number;
    order_id: number;
    amount: number;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    created_at: Date;
    updated_at: Date;
}
export type Admin = {
    id: number;
    role: "super_admin" | "support";
    name: string;
    email: string;
    phone: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}
export type Category = {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
}

export type MenuItemCategory = {
    id: number;
    menu_item_id: number;
    category_id: number;
    img_url?: string;
    created_at: Date;
    updated_at: Date;
}

export type RestaurantCategory = {
    id: number;
    restaurant_id: number;
    category_id: number;
    created_at: Date;
    updated_at: Date;
}
