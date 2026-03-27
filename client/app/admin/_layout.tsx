import { Stack } from "expo-router";

export default function AdminLayout() {
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
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="categories/index" options={{ title: "Categories" }} />
      <Stack.Screen
        name="categories/create"
        options={{ title: "Create Category" }}
      />
      <Stack.Screen
        name="restaurants/index"
        options={{ title: "Restaurants" }}
      />
      <Stack.Screen
        name="restaurants/create"
        options={{ title: "Create Restaurant" }}
      />
      <Stack.Screen
        name="restaurants/[id]"
        options={{ title: "Edit Restaurant" }}
      />
      <Stack.Screen name="users" options={{ title: "Users" }} />
    </Stack>
  );
}
