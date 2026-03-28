import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getOrderDetails } from "@/api/user/orders";
import LottieView from "lottie-react-native";

export default function OrderConfirmationScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const response = await getOrderDetails(Number(orderId));
      setOrder(response.order);
    } catch (error) {
      console.log("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-32 h-32 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        </View>

        <Text className="text-2xl font-bold text-gray-800 text-center">
          Order Placed Successfully!
        </Text>

        <Text className="text-gray-500 text-center mt-3">
          Your order has been placed and is being prepared.
        </Text>

        {order && (
          <View className="bg-gray-50 rounded-xl p-4 mt-6 w-full">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Order ID</Text>
              <Text className="font-semibold">#{order.id}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Status</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                <Text className="font-semibold capitalize">{order.status}</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Amount</Text>
              <Text className="font-bold text-lg">₹{order.total_amount}</Text>
            </View>
          </View>
        )}

        <View className="w-full mt-8">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/orders")}
            className="bg-orange-500 py-4 rounded-xl mb-3"
          >
            <Text className="text-white font-bold text-center text-lg">
              Track Order
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="py-4 rounded-xl border border-gray-200"
          >
            <Text className="text-gray-700 font-semibold text-center">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
