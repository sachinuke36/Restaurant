import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMyOrders } from "@/api/user/orders";

type OrderStatus = "pending" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

type Order = {
  id: number;
  status: OrderStatus;
  total_amount: string;
  created_at: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image: string;
};

const statusConfig: Record<OrderStatus, { color: string; bgColor: string; icon: string }> = {
  pending: { color: "#f97316", bgColor: "#fff7ed", icon: "time-outline" },
  preparing: { color: "#eab308", bgColor: "#fefce8", icon: "restaurant-outline" },
  out_for_delivery: { color: "#3b82f6", bgColor: "#eff6ff", icon: "bicycle-outline" },
  delivered: { color: "#22c55e", bgColor: "#f0fdf4", icon: "checkmark-circle-outline" },
  cancelled: { color: "#ef4444", bgColor: "#fef2f2", icon: "close-circle-outline" },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const response = await getMyOrders();
      setOrders(response.orders || []);
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

  const renderOrderItem = ({ item }: { item: Order }) => {
    const config = statusConfig[item.status] || statusConfig.pending;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/order/${item.id}`)}
        className="bg-white mx-4 mb-3 p-4 rounded-xl"
        style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 }}
      >
        <View className="flex-row">
          <Image
            source={{ uri: item.restaurant_image }}
            className="w-16 h-16 rounded-lg"
          />
          <View className="flex-1 ml-3">
            <Text className="font-bold text-base" numberOfLines={1}>
              {item.restaurant_name}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {formatDate(item.created_at)}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="font-bold">₹{item.total_amount}</Text>
              <View
                className="flex-row items-center px-2 py-1 rounded-full"
                style={{ backgroundColor: config.bgColor }}
              >
                <Ionicons name={config.icon as any} size={14} color={config.color} />
                <Text
                  className="text-xs font-medium ml-1"
                  style={{ color: config.color }}
                >
                  {formatStatus(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action buttons for active orders */}
        {(item.status === "pending" || item.status === "preparing" || item.status === "out_for_delivery") && (
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => router.push(`/order/${item.id}`)}
              className="flex-1 flex-row items-center justify-center py-2 bg-orange-50 rounded-lg mr-2"
            >
              <Ionicons name="location-outline" size={16} color="#f97316" />
              <Text className="text-orange-500 font-medium ml-1">Track Order</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {/* TODO: Contact support */}}
              className="flex-1 flex-row items-center justify-center py-2 bg-gray-50 rounded-lg"
            >
              <Ionicons name="call-outline" size={16} color="#374151" />
              <Text className="text-gray-700 font-medium ml-1">Help</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reorder button for delivered orders */}
        {item.status === "delivered" && (
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity
              onPress={() => router.push(`/restaurant/${item.restaurant_id}`)}
              className="flex-1 flex-row items-center justify-center py-2 bg-orange-500 rounded-lg"
            >
              <Ionicons name="refresh-outline" size={16} color="white" />
              <Text className="text-white font-medium ml-1">Reorder</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold">My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="receipt-outline" size={80} color="#d1d5db" />
          <Text className="text-gray-400 text-lg mt-4">No orders yet</Text>
          <Text className="text-gray-400 text-center mt-2">
            Your order history will appear here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="mt-6 bg-orange-500 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f97316"
              colors={["#f97316"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}