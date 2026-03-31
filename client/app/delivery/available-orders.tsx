import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getAvailableOrders, pickOrder } from "@/api/delivery";
import BackButton from "@/components/common/BackButton";
import { AvailableOrder } from "@/types/delivery";

export default function AvailableOrders() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [picking, setPicking] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      const res = await getAvailableOrders();
      setOrders(res.orders || []);
    } catch (error) {
      console.log("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, []);

  const handlePickOrder = (order: AvailableOrder) => {
    Alert.alert(
      "Pick Order",
      `Do you want to pick order #${order.id} from ${order.restaurant_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pick Order",
          onPress: async () => {
            setPicking(order.id);
            try {
              await pickOrder(order.id);
              Alert.alert("Success", "Order assigned to you!");
              // Remove from list
              setOrders((prev) => prev.filter((o) => o.id !== order.id));
              // Navigate to my deliveries
              router.push("/delivery/my-deliveries");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to pick order");
            } finally {
              setPicking(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <BackButton />
        <Text className="text-xl font-bold ml-4 text-orange-500">
          Available Orders
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm">
            {/* Restaurant Info */}
            <View className="flex-row p-4 border-b border-gray-100">
              {item.restaurant_image ? (
                <Image
                  source={{ uri: item.restaurant_image }}
                  className="w-14 h-14 rounded-xl"
                />
              ) : (
                <View className="w-14 h-14 rounded-xl bg-gray-200 items-center justify-center">
                  <Ionicons name="restaurant" size={24} color="#9ca3af" />
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text className="font-bold text-lg">Order #{item.id}</Text>
                <Text className="text-gray-600">{item.restaurant_name}</Text>
                <Text className="text-gray-400 text-sm">
                  {formatDate(item.created_at)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-lg">
                  Rs.{item.total_amount}
                </Text>
                <Text className="text-green-600 text-sm">
                  +Rs.{item.delivery_fee}
                </Text>
              </View>
            </View>

            {/* Pickup & Delivery Info */}
            <View className="p-4">
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center">
                  <Ionicons name="restaurant" size={14} color="#22c55e" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-500 text-xs">PICKUP FROM</Text>
                  <Text className="font-medium">{item.restaurant_address}</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center">
                  <Ionicons name="location" size={14} color="#f97316" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-500 text-xs">DELIVER TO</Text>
                  <Text className="font-medium">
                    {item.delivery_address_line1}, {item.delivery_city}
                  </Text>
                  <Text className="text-gray-600">{item.customer_name}</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={() => handlePickOrder(item)}
              disabled={picking === item.id}
              className="bg-orange-500 p-4"
            >
              {picking === item.id ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Pick This Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="cube-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">
              No orders available
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Pull down to refresh
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
