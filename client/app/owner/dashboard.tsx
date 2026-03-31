import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getRestaurant, getRestaurantOrders, updateRestaurant } from "@/api/owner/restaurant";
import BackButton from "@/components/common/BackButton";

type Restaurant = {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  image_url: string | null;
  is_open: boolean;
  delivery_time: string | null;
  delivery_fee: string | null;
  rating: string | null;
};

type Order = {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  customer_name: string | null;
};

export default function OwnerDashboard() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!restaurantId) return;
    try {
      const [restaurantRes, ordersRes] = await Promise.all([
        getRestaurant(Number(restaurantId)),
        getRestaurantOrders(Number(restaurantId)),
      ]);
      setRestaurant(restaurantRes.restaurant);
      setOrders(ordersRes.orders || []);
    } catch (error) {
      console.log("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [restaurantId]);

  const toggleRestaurantOpen = async () => {
    if (!restaurant || !restaurantId) return;

    const previousState = restaurant.is_open;

    // Optimistic update
    setRestaurant({ ...restaurant, is_open: !previousState });

    try {
      const formData = new FormData();
      formData.append("is_open", (!previousState).toString());
      await updateRestaurant(Number(restaurantId), formData);
    } catch (error) {
      console.log("Error toggling restaurant:", error);
      setRestaurant({ ...restaurant, is_open: previousState });
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.created_at).toDateString();
    return orderDate === new Date().toDateString();
  });
  const todayRevenue = todayOrders.reduce(
    (sum, o) => sum + parseFloat(o.total_amount),
    0
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Ionicons name="storefront-outline" size={80} color="#d1d5db" />
        <Text className="text-gray-500 text-lg mt-4 text-center">
          Restaurant not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
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
        <View className="bg-white p-4">
          <View className="flex-row items-center">
            <BackButton />
            {restaurant.image_url ? (
              <Image
                source={{ uri: restaurant.image_url }}
                className="w-14 h-14 rounded-xl ml-3"
              />
            ) : (
              <View className="w-14 h-14 rounded-xl bg-gray-200 items-center justify-center ml-3">
                <Ionicons name="restaurant" size={28} color="#9ca3af" />
              </View>
            )}
            <View className="flex-1 ml-3">
              <Text className="text-xl font-bold text-orange-500" numberOfLines={1}>{restaurant.name}</Text>
              <Text className="text-gray-500 text-sm" numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/owner/settings",
                  params: { restaurantId },
                })
              }
              className="p-2"
            >
              <Ionicons name="settings-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Open/Close Toggle */}
          <View className="flex-row items-center justify-between mt-4 bg-gray-50 p-4 rounded-xl">
            <View className="flex-row items-center">
              <View
                className={`w-3 h-3 rounded-full mr-2 ${
                  restaurant.is_open ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Text className="font-semibold text-base">
                {restaurant.is_open ? "Restaurant Open" : "Restaurant Closed"}
              </Text>
            </View>
            <Switch
              value={restaurant.is_open}
              onValueChange={toggleRestaurantOpen}
              trackColor={{ false: "#d1d5db", true: "#bbf7d0" }}
              thumbColor={restaurant.is_open ? "#22c55e" : "#9ca3af"}
            />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row p-4">
          <View className="flex-1 bg-white p-4 rounded-xl mr-2">
            <Text className="text-gray-500 text-sm">Today's Orders</Text>
            <Text className="text-2xl font-bold mt-1">{todayOrders.length}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl ml-2">
            <Text className="text-gray-500 text-sm">Today's Revenue</Text>
            <Text className="text-2xl font-bold mt-1 text-green-600">
              ₹{todayRevenue.toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Pending Orders Alert */}
        {(pendingOrders > 0 || preparingOrders > 0) && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/owner/orders",
                params: { restaurantId },
              })
            }
            className="mx-4 bg-orange-50 border border-orange-200 p-4 rounded-xl flex-row items-center"
          >
            <View className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="alert" size={20} color="white" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-orange-800">
                {pendingOrders} pending, {preparingOrders} preparing
              </Text>
              <Text className="text-orange-600 text-sm">
                Tap to manage orders
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
              onPress={() =>
                router.push({
                  pathname: "/owner/orders",
                  params: { restaurantId },
                })
              }
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center">
                <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="receipt-outline" size={24} color="#3b82f6" />
                </View>
                <Text className="font-medium">Orders</Text>
                <Text className="text-gray-500 text-sm">{orders.length} total</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/owner/menu",
                  params: { restaurantId },
                })
              }
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center">
                <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="fast-food-outline" size={24} color="#22c55e" />
                </View>
                <Text className="font-medium">Menu Items</Text>
                <Text className="text-gray-500 text-sm">Manage menu</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/owner/add-menu-item",
                  params: { restaurantId },
                })
              }
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center">
                <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="add-circle-outline" size={24} color="#a855f7" />
                </View>
                <Text className="font-medium">Add Item</Text>
                <Text className="text-gray-500 text-sm">New menu item</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/owner/settings",
                  params: { restaurantId },
                })
              }
              className="w-1/2 p-2"
            >
              <View className="bg-white p-4 rounded-xl items-center">
                <View className="bg-gray-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                  <Ionicons name="settings-outline" size={24} color="#6b7280" />
                </View>
                <Text className="font-medium">Settings</Text>
                <Text className="text-gray-500 text-sm">Restaurant info</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders */}
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold">Recent Orders</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/owner/orders",
                  params: { restaurantId },
                })
              }
            >
              <Text className="text-orange-500 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {orders.slice(0, 5).map((order) => (
            <View
              key={order.id}
              className="bg-white p-4 rounded-xl mb-2 flex-row items-center justify-between"
            >
              <View>
                <Text className="font-semibold">Order #{order.id}</Text>
                <Text className="text-gray-500 text-sm">
                  {order.customer_name || "Customer"}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-bold">₹{order.total_amount}</Text>
                <View
                  className={`px-2 py-1 rounded mt-1 ${
                    order.status === "pending"
                      ? "bg-yellow-100"
                      : order.status === "preparing"
                      ? "bg-blue-100"
                      : order.status === "ready"
                      ? "bg-green-100"
                      : order.status === "delivered"
                      ? "bg-gray-100"
                      : "bg-red-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      order.status === "pending"
                        ? "text-yellow-700"
                        : order.status === "preparing"
                        ? "text-blue-700"
                        : order.status === "ready"
                        ? "text-green-700"
                        : order.status === "delivered"
                        ? "text-gray-700"
                        : "text-red-700"
                    }`}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {orders.length === 0 && (
            <View className="bg-white p-6 rounded-xl items-center">
              <Ionicons name="receipt-outline" size={40} color="#d1d5db" />
              <Text className="text-gray-400 mt-2">No orders yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
