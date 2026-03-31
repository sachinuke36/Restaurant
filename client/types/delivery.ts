export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';

export type AvailableOrder = {
  id: number;
  status: string;
  total_amount: string;
  delivery_fee: string;
  created_at: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_image: string | null;
  restaurant_phone: string;
  customer_name: string;
  customer_phone: string;
  delivery_address_line1: string;
  delivery_address_line2: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
};

export type Delivery = {
  id: number;
  order_id: number;
  status: DeliveryStatus;
  picked_at: string | null;
  delivered_at: string | null;
  created_at: string;
  order_status: string;
  order_total: string;
  delivery_fee: string;
  order_created: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_image: string | null;
  restaurant_phone: string;
  customer_name: string;
  customer_phone: string;
  delivery_address_line1: string;
  delivery_address_line2: string | null;
  delivery_city: string;
  delivery_postal_code: string;
};

export type DeliveryDetails = {
  id: number;
  order_id: number;
  status: DeliveryStatus;
  picked_at: string | null;
  delivered_at: string | null;
  created_at: string;
  order_status: string;
  order_total: string;
  order_subtotal: string;
  order_delivery_fee: string;
  order_tax: string;
  order_created: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_image: string | null;
  restaurant_phone: string;
  restaurant_latitude: string | null;
  restaurant_longitude: string | null;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address_id: number;
  delivery_full_name: string;
  delivery_phone: string;
  delivery_address_line1: string;
  delivery_address_line2: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
  delivery_latitude: string | null;
  delivery_longitude: string | null;
};

export type OrderItem = {
  id: number;
  quantity: number;
  price: string;
  name: string;
};

export type EarningsData = {
  totalEarnings: number;
  totalDeliveries: number;
  dailyBreakdown: Array<{
    date: string;
    count: number;
    earnings: number;
  }>;
  period: string;
};

export type DeliveryHistoryItem = {
  id: number;
  order_id: number;
  status: DeliveryStatus;
  delivered_at: string;
  created_at: string;
  order_total: string;
  delivery_fee: string;
  restaurant_name: string;
  customer_name: string;
  delivery_city: string;
};
