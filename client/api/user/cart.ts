import { apiRequest } from "../../services/api";

export const getCartDetails = () => {
  return apiRequest("/api/users/cart");
};

export const addItemToCart = (cartData: {
  menu_item_id: number;
  restaurant_id: number;
  quantity: number;
}) => {
  return apiRequest("/api/users/cart/add-item", {
    method: "POST",
    body: cartData,
  });
};

export const removeItemFromCart = (cartData: {
  menu_item_id: number;
  restaurant_id: number;
  quantity: number;
}) => {
  return apiRequest("/api/users/cart/remove-item", {
    method: "POST",
    body: cartData,
  });
};

export const clearCart = () => {
  return apiRequest("/api/users/cart/clear", {
    method: "DELETE",
  });
};