import { apiRequest } from "../../services/api";

// Get all owner's restaurants
export const getMyRestaurants = () => {
  return apiRequest("/api/owner/restaurants");
};

// Get specific restaurant
export const getRestaurant = (restaurantId: number) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}`);
};

// Update restaurant details
export const updateRestaurant = (restaurantId: number, data: FormData) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}`, {
    method: "PUT",
    body: data,
    isFormData: true,
  });
};

// Get menu items
export const getMenuItems = (restaurantId: number) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/menu-items`);
};

// Add menu item
export const addMenuItem = (restaurantId: number, data: FormData) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/menu-items`, {
    method: "POST",
    body: data,
    isFormData: true,
  });
};

// Update menu item
export const updateMenuItem = (restaurantId: number, id: number, data: FormData) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/menu-items/${id}`, {
    method: "PUT",
    body: data,
    isFormData: true,
  });
};

// Delete menu item
export const deleteMenuItem = (restaurantId: number, id: number) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/menu-items/${id}`, {
    method: "DELETE",
  });
};

// Toggle menu item availability
export const toggleMenuItemAvailability = (restaurantId: number, id: number) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/menu-items/${id}/toggle`, {
    method: "PATCH",
  });
};

// Get restaurant orders
export const getRestaurantOrders = (restaurantId: number) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/orders`);
};

// Update order status
export const updateOrderStatus = (restaurantId: number, id: number, status: string) => {
  return apiRequest(`/api/owner/restaurants/${restaurantId}/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
};

// Get categories
export const getCategories = () => {
  return apiRequest("/api/owner/categories");
};
