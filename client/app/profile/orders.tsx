import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function OrdersScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={["bottom"]}>
      <Ionicons name="receipt-outline" size={60} color="#d1d5db" />
      <Text className="text-gray-400 mt-4">No orders yet</Text>
      <Text className="text-gray-300 mt-2">Your order history will appear here</Text>
    </SafeAreaView>
  );
}
