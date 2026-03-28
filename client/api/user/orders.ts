import { apiRequest } from "../../services/api";

export const placeOrder = (data: { address_id: number }) => {
  return apiRequest("/api/users/orders/place", {
    method: "POST",
    body: data,
  });
};

export const getMyOrders = () => {
  return apiRequest("/api/users/orders");
};

export const getOrderDetails = (orderId: number) => {
  return apiRequest(`/api/users/orders/${orderId}`);
};

export const cancelOrder = (orderId: number) => {
  return apiRequest(`/api/users/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
};
