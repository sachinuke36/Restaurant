import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { getRestaurantOrders, updateOrderStatus } from "@/api/owner/restaurant";
import BackButton from "@/components/common/BackButton";

type Order = {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "preparing", label: "Preparing", color: "purple" },
  { value: "ready", label: "Ready", color: "green" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "orange" },
  { value: "delivered", label: "Delivered", color: "gray" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

export default function OwnerOrders() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const loadOrders = async () => {
    if (!restaurantId) return;
    try {
      const res = await getRestaurantOrders(Number(restaurantId));
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
  }, [restaurantId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [restaurantId]);

  const handleUpdateStatus = (order: Order) => {
    if (!restaurantId) return;

    const currentIndex = STATUS_OPTIONS.findIndex(
      (s) => s.value === order.status
    );
    const availableOptions = STATUS_OPTIONS.filter(
      (_, i) => i > currentIndex || _.value === "cancelled"
    );

    if (availableOptions.length === 0) {
      Alert.alert("Info", "Order is already in final state");
      return;
    }

    Alert.alert(
      "Update Order Status",
      "Select new status:",
      [
        { text: "Cancel", style: "cancel" },
        ...availableOptions.map((option) => ({
          text: option.label,
          onPress: async () => {
            // Optimistic update
            const previousStatus = order.status;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: option.value } : o
              )
            );

            try {
              await updateOrderStatus(Number(restaurantId), order.id, option.value);
            } catch (error) {
              // Revert on error
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === order.id ? { ...o, status: previousStatus } : o
                )
              );
              Alert.alert("Error", "Failed to update status");
            }
          },
        })),
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status);
    switch (option?.color) {
      case "yellow":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "blue":
        return { bg: "bg-blue-100", text: "text-blue-700" };
      case "purple":
        return { bg: "bg-purple-100", text: "text-purple-700" };
      case "green":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "orange":
        return { bg: "bg-orange-100", text: "text-orange-700" };
      case "gray":
        return { bg: "bg-gray-100", text: "text-gray-700" };
      case "red":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

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
        <Text className="text-xl font-bold ml-4">Orders</Text>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-2 py-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ value: "all", label: "All" }, ...STATUS_OPTIONS]}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const count =
              item.value === "all"
                ? orders.length
                : orders.filter((o) => o.status === item.value).length;
            return (
              <TouchableOpacity
                onPress={() => setFilter(item.value)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  filter === item.value ? "bg-orange-500" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`font-medium ${
                    filter === item.value ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
        renderItem={({ item }) => {
          const statusColor = getStatusColor(item.status);
          return (
            <View className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm">
              <View className="p-4">
                <View className="flex-row items-start justify-between">
                  <View>
                    <Text className="font-bold text-lg">Order #{item.id}</Text>
                    <Text className="text-gray-500 text-sm">
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
                    <Text className={`font-medium capitalize ${statusColor.text}`}>
                      {item.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row items-center">
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">
                    {item.customer_name || "Customer"}
                  </Text>
                </View>

                {item.customer_phone && (
                  <View className="mt-1 flex-row items-center">
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">{item.customer_phone}</Text>
                  </View>
                )}

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-lg font-bold">
                    ₹{item.total_amount}
                  </Text>

                  {item.status !== "delivered" && item.status !== "cancelled" && (
                    <TouchableOpacity
                      onPress={() => handleUpdateStatus(item)}
                      className="bg-orange-500 px-4 py-2 rounded-lg flex-row items-center"
                    >
                      <Ionicons name="refresh" size={16} color="white" />
                      <Text className="text-white font-medium ml-1">
                        Update Status
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="receipt-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">No orders found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
