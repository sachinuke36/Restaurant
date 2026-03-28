import { getToken, deleteToken } from "@/utils/tokenStorage";

export const fetchUserProfile = async () => {
  const token = await getToken();

  // No token stored - user not logged in
  if (!token) {
    throw new Error("No auth token found");
  }

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

  const data = await res.json();

  // If unauthorized, clear the invalid token
  if (res.status === 401) {
    await deleteToken();
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
};
