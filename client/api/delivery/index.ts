import { apiRequest } from "../../services/api";

// Get available orders for pickup
export const getAvailableOrders = () => {
  return apiRequest("/api/delivery/available-orders");
};

// Pick/assign an order
export const pickOrder = (orderId: number) => {
  return apiRequest(`/api/delivery/orders/${orderId}/pick`, {
    method: "POST",
  });
};

// Get my deliveries (with optional status filter)
export const getMyDeliveries = (status?: 'active' | 'completed' | 'all') => {
  const query = status ? `?status=${status}` : '';
  return apiRequest(`/api/delivery/my-deliveries${query}`);
};

// Get delivery details
export const getDeliveryDetails = (deliveryId: number) => {
  return apiRequest(`/api/delivery/deliveries/${deliveryId}`);
};

// Update delivery status
export const updateDeliveryStatus = (deliveryId: number, status: string) => {
  return apiRequest(`/api/delivery/deliveries/${deliveryId}/status`, {
    method: "PATCH",
    body: { status },
  });
};

// Get earnings
export const getEarnings = (period?: 'today' | 'week' | 'month' | 'all') => {
  const query = period ? `?period=${period}` : '';
  return apiRequest(`/api/delivery/earnings${query}`);
};

// Get delivery history
export const getDeliveryHistory = (page: number = 1, limit: number = 20) => {
  return apiRequest(`/api/delivery/history?page=${page}&limit=${limit}`);
};
