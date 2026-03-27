import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#f97316",
        headerStyle: {
          backgroundColor: "white",
        },
      }}
    >
      <Stack.Screen name="addresses" options={{ title: "My Addresses" }} />
      <Stack.Screen name="orders" options={{ title: "Order History" }} />
      <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
