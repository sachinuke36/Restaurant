import { Stack } from "expo-router";
import "./global.css";
import { useEffect, useState } from "react";
import { deleteToken, getToken } from "@/utils/tokenStorage";
import { isTokenExpired } from "@/utils/checktoken";
import { View, ActivityIndicator } from "react-native";
import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();

        if (!token || isTokenExpired(token)) {
          await deleteToken();
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isLoggedIn === null) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <UserProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="restaurant/[id]" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="order-confirmation" />
              <Stack.Screen name="order/[id]" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="owner" />
              <Stack.Screen name="admin" />
              <Stack.Screen name="delivery" />
            </>
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
      </CartProvider>
    </UserProvider>
  );
}