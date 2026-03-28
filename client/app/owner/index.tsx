import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getMyRestaurants } from "@/api/owner/restaurant";

type Restaurant = {
  id: number;
  name: string;
  address: string;
  image_url: string | null;
  is_open: boolean;
  rating: string | null;
};

export default function OwnerRestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRestaurants = async () => {
    try {
      const res = await getMyRestaurants();
      setRestaurants(res.restaurants || []);
    } catch (error) {
      console.log("Error loading restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRestaurants();
  }, []);

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
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold">My Restaurants</Text>
            <Text className="text-gray-500 mt-1">
              Select a restaurant to manage
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="home-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={restaurants}
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
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/owner/dashboard",
                params: { restaurantId: item.id },
              })
            }
            className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm"
          >
            <View className="flex-row">
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  className="w-28 h-28"
                />
              ) : (
                <View className="w-28 h-28 bg-gray-200 items-center justify-center">
                  <Ionicons name="restaurant" size={40} color="#9ca3af" />
                </View>
              )}

              <View className="flex-1 p-4 justify-center">
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-lg flex-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View
                    className={`w-3 h-3 rounded-full ml-2 ${
                      item.is_open ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </View>

                <Text className="text-gray-500 mt-1" numberOfLines={2}>
                  {item.address}
                </Text>

                {item.rating && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="star" size={14} color="#f97316" />
                    <Text className="text-gray-600 ml-1">{item.rating}</Text>
                  </View>
                )}

                <View className="flex-row items-center mt-2">
                  <Text
                    className={`text-sm ${
                      item.is_open ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {item.is_open ? "Open" : "Closed"}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#9ca3af"
                    style={{ marginLeft: "auto" }}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="storefront-outline" size={80} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg text-center">
              No restaurants found
            </Text>
            <Text className="text-gray-400 mt-2 text-center px-8">
              Contact admin to add a restaurant to your account
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
