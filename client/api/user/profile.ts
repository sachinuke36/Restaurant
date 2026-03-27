import * as SecureStore from "expo-secure-store";

export const fetchUserProfile = async () => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/profile`,
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
    console.log("Error fetching user profile:", error);
    throw error;
  }
};
