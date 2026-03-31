import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMyDeliveries } from "@/api/delivery";
import BackButton from "@/components/common/BackButton";
import { Delivery, DeliveryStatus } from "@/types/delivery";

type FilterType = "active" | "completed" | "all";

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("active");

  const loadDeliveries = async () => {
    try {
      const res = await getMyDeliveries(filter);
      setDeliveries(res.deliveries || []);
    } catch (error) {
      console.log("Error loading deliveries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDeliveries();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDeliveries();
  }, [filter]);

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case "assigned":
        return { bg: "bg-blue-100", text: "text-blue-600" };
      case "picked_up":
        return { bg: "bg-orange-100", text: "text-orange-600" };
      case "delivered":
        return { bg: "bg-green-100", text: "text-green-600" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-600" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
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

  const FilterButton = ({
    label,
    value,
  }: {
    label: string;
    value: FilterType;
  }) => (
    <TouchableOpacity
      onPress={() => setFilter(value)}
      className={`px-4 py-2 rounded-full mr-2 ${
        filter === value ? "bg-orange-500" : "bg-gray-100"
      }`}
    >
      <Text
        className={`font-medium ${
          filter === value ? "text-white" : "text-gray-600"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          My Deliveries
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row">
          <FilterButton label="Active" value="active" />
          <FilterButton label="Completed" value="completed" />
          <FilterButton label="All" value="all" />
        </View>
      </View>

      <FlatList
        data={deliveries}
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
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/delivery/active-delivery",
                  params: { deliveryId: item.id },
                })
              }
              className="bg-white rounded-xl mb-3 p-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-bold text-lg">Order #{item.order_id}</Text>
                  <Text className="text-gray-600">{item.restaurant_name}</Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {formatDate(item.created_at)}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
                  <Text className={`text-sm font-medium capitalize ${statusColor.text}`}>
                    {item.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-500 ml-1 flex-1" numberOfLines={1}>
                    {item.delivery_address_line1}, {item.delivery_city}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-gray-500">Total: Rs.{item.order_total}</Text>
                  <Text className="text-green-600 font-medium">
                    +Rs.{item.delivery_fee}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="cube-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">No deliveries found</Text>
            <Text className="text-gray-400 text-center mt-2">
              {filter === "active"
                ? "You have no active deliveries"
                : filter === "completed"
                ? "No completed deliveries yet"
                : "No deliveries to show"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
