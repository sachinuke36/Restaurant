import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { getRestaurants } from "@/api/admin";
import { Restaurants } from "@/types/app";

export default function RestaurantsManagement() {
  const [restaurants, setRestaurants] = useState<Restaurants[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(data?.restaurants || []);
    } catch (error) {
      console.log("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <View className="flex-1 px-5">
        {/* Add Button */}
        <TouchableOpacity
          onPress={() => router.push("/admin/restaurants/create")}
          className="flex-row items-center justify-center bg-orange-500 py-4 rounded-xl mt-4 mb-4"
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Add Restaurant</Text>
        </TouchableOpacity>

        {/* Restaurants List */}
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/admin/restaurants/${item.id}`)}
              className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-3"
            >
              <Image
                source={{ uri: item.image_url }}
                className="w-20 h-20 rounded-lg"
              />
              <View className="flex-1 ml-4">
                <Text className="font-bold text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                  {item.address}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {item.rating || "N/A"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="restaurant-outline" size={60} color="#d1d5db" />
              <Text className="text-gray-400 mt-4">No restaurants yet</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
