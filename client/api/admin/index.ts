import * as SecureStore from "expo-secure-store";

// Categories
export const getCategories = async () => {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/category`
    );
    return await res.json();
  } catch (error) {
    console.log("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (formData: FormData) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/category`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    return await res.json();
  } catch (error) {
    console.log("Error creating category:", error);
    throw error;
  }
};

// Restaurants
export const getRestaurants = async () => {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/app/restaurants`
    );
    return await res.json();
  } catch (error) {
    console.log("Error fetching restaurants:", error);
    throw error;
  }
};

export const createRestaurant = async (formData: FormData) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/app/restaurant`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    return await res.json();
  } catch (error) {
    console.log("Error creating restaurant:", error);
    throw error;
  }
};

export const updateRestaurant = async (id: number, formData: FormData) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/app/restaurant/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    return await res.json();
  } catch (error) {
    console.log("Error updating restaurant:", error);
    throw error;
  }
};

// Users
export const getAllUsers = async () => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await res.json();
  } catch (error) {
    console.log("Error fetching users:", error);
    throw error;
  }
};

export const createDeliveryPerson = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/admin/users/delivery-person`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Failed to create delivery person");
    }
    return result;
  } catch (error) {
    console.log("Error creating delivery person:", error);
    throw error;
  }
};
