import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMyDeliveries, getEarnings } from "@/api/delivery";
import { useUser } from "@/context/UserContext";
import { deleteToken } from "@/utils/tokenStorage";
import { Delivery, EarningsData } from "@/types/delivery";

export default function DeliveryDashboard() {
  const { user, clearUser } = useUser();
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    totalDeliveries: 0,
    dailyBreakdown: [],
    period: "today",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [deliveriesRes, earningsRes] = await Promise.all([
        getMyDeliveries("active"),
        getEarnings("today"),
      ]);
      setActiveDeliveries(deliveriesRes.deliveries || []);
      setEarnings({
        totalEarnings: earningsRes.totalEarnings || 0,
        totalDeliveries: earningsRes.totalDeliveries || 0,
        dailyBreakdown: earningsRes.dailyBreakdown || [],
        period: earningsRes.period || "today",
      });
    } catch (error) {
      console.log("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await deleteToken();
          clearUser();
          router.replace("/(auth)/login");
        },
      },
    ]);
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
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Header */}
        <View className="bg-white p-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-orange-500">
              Hello, {user?.name}
            </Text>
            <Text className="text-gray-500 mt-1">Ready to deliver?</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 p-3 rounded-full"
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View className="flex-row p-4">
          <View className="flex-1 bg-white p-4 rounded-xl mr-2 shadow-sm">
            <Text className="text-gray-500 text-sm">Today's Earnings</Text>
            <Text className="text-2xl font-bold mt-1 text-green-600">
              Rs.{earnings.totalEarnings}
            </Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl ml-2 shadow-sm">
            <Text className="text-gray-500 text-sm">Deliveries Today</Text>
            <Text className="text-2xl font-bold mt-1">
              {earnings.totalDeliveries}
            </Text>
          </View>
        </View>

        {/* Active Delivery Alert */}
        {activeDeliveries.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/delivery/active-delivery",
                params: { deliveryId: activeDeliveries[0].id },
              })
            }
            className="mx-4 bg-orange-50 border border-orange-200 p-4 rounded-xl flex-row items-center"
          >
            <View className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="bicycle" size={20} color="white" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-orange-800">
                {activeDeliveries.length} Active{" "}
                {activeDeliveries.length === 1 ? "Delivery" : "Deliveries"}
              </Text>
              <Text className="text-orange-600 text-sm">
                Tap to view details
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#f97316" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View className="p-4">
          <Text className="text-lg font-bold mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap">
            <TouchableOpacity
              onPress={() => router.push("/delivery/available-orders")}
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center shadow-sm">
                <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="list-outline" size={24} color="#22c55e" />
                </View>
                <Text className="font-medium">Available Orders</Text>
                <Text className="text-gray-500 text-sm">Pick new orders</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/delivery/my-deliveries")}
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center shadow-sm">
                <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="cube-outline" size={24} color="#3b82f6" />
                </View>
                <Text className="font-medium">My Deliveries</Text>
                <Text className="text-gray-500 text-sm">View all deliveries</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/delivery/earnings")}
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center shadow-sm">
                <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="wallet-outline" size={24} color="#a855f7" />
                </View>
                <Text className="font-medium">Earnings</Text>
                <Text className="text-gray-500 text-sm">View earnings</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/delivery/history")}
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center shadow-sm">
                <View className="bg-gray-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="time-outline" size={24} color="#6b7280" />
                </View>
                <Text className="font-medium">History</Text>
                <Text className="text-gray-500 text-sm">Past deliveries</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {activeDeliveries.length > 0 && (
          <View className="p-4">
            <Text className="text-lg font-bold mb-3">Active Deliveries</Text>
            {activeDeliveries.map((delivery) => (
              <TouchableOpacity
                key={delivery.id}
                onPress={() =>
                  router.push({
                    pathname: "/delivery/active-delivery",
                    params: { deliveryId: delivery.id },
                  })
                }
                className="bg-white p-4 rounded-xl mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold">Order #{delivery.order_id}</Text>
                    <Text className="text-gray-500">{delivery.restaurant_name}</Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      delivery.status === "assigned"
                        ? "bg-blue-100"
                        : "bg-orange-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium capitalize ${
                        delivery.status === "assigned"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {delivery.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-500 ml-1 text-sm">
                    {delivery.delivery_address_line1}, {delivery.delivery_city}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
