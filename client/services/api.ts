import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

export const apiRequest = async (endpoint: string, options: RequestOptions = {}) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Don't set Content-Type for FormData - fetch will set it automatically with boundary
    if (!options.isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.isFormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.log("API Error:", error);
    throw error;
  }
};