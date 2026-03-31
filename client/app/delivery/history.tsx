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
import { getDeliveryHistory } from "@/api/delivery";
import BackButton from "@/components/common/BackButton";
import { DeliveryHistoryItem } from "@/types/delivery";

export default function History() {
  const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadHistory = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const res = await getDeliveryHistory(pageNum, LIMIT);
      const newDeliveries = res.deliveries || [];

      if (append) {
        setDeliveries((prev) => [...prev, ...newDeliveries]);
      } else {
        setDeliveries(newDeliveries);
      }

      setHasMore(newDeliveries.length === LIMIT);
      setPage(pageNum);
    } catch (error) {
      console.log("Error loading history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory(1, false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadHistory(page + 1, true);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
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
          Delivery History
        </Text>
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/delivery/active-delivery",
                params: { deliveryId: item.id },
              })
            }
            className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm"
          >
            <View className="p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-bold text-lg">Order #{item.order_id}</Text>
                  <Text className="text-gray-600">{item.restaurant_name}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-green-600 font-bold">
                    +Rs.{item.delivery_fee}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    {formatTime(item.delivered_at || item.created_at)}
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
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm ml-1">
                      {formatDate(item.delivered_at || item.created_at)}
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      item.status === "delivered" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium capitalize ${
                        item.status === "delivered" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator color="#f97316" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="time-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">No delivery history</Text>
            <Text className="text-gray-400 text-center mt-2">
              Your completed deliveries will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
