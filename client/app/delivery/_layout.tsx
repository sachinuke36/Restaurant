import { Stack } from "expo-router";

export default function DeliveryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="available-orders" />
      <Stack.Screen name="my-deliveries" />
      <Stack.Screen name="active-delivery" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
