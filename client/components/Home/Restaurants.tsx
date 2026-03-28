import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Restaurants as RestaurantsType } from "@/types/app";
import { getAllRestaurants } from "@/api/appInfo/restaurants";
import { router } from "expo-router";

interface RestaurantsProps {
  selectedCategory?: string | number;
  categoryName?: string | null;
  search?: string;
  refreshKey?: number;
}

const Restaurants = ({
  selectedCategory = "all",
  categoryName = null,
  search = "",
  refreshKey = 0,
}: RestaurantsProps) => {
  const [restaurantsData, setRestaurantsData] = useState<RestaurantsType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await getAllRestaurants(selectedCategory);
        setRestaurantsData(data.restaurants || []);
      } catch (error) {
        console.log("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedCategory, refreshKey]);

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurantsData;

    if (search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.address.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [restaurantsData, search]);

  if (loading) {
    return (
      <View className="mt-10 items-center py-10">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View className="mt-8">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="font-bold text-xl text-gray-700">
          {search
            ? `Results for "${search}"`
            : categoryName
            ? `${categoryName} Restaurants`
            : "Open Restaurants"}
        </Text>

        <TouchableOpacity className="flex-row items-center">
          <Text className="text-orange-500 mr-1 font-medium">See all</Text>
          <Ionicons name="chevron-forward" size={16} color="#f97316" />
        </TouchableOpacity>
      </View>

      {filteredRestaurants.length === 0 ? (
        <View className="items-center py-10">
          <Ionicons name="restaurant-outline" size={50} color="#d1d5db" />
          <Text className="text-gray-400 mt-4">No restaurants found</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filteredRestaurants.map((restaurant) => (
            <View
              key={restaurant.id}
              style={{
                width: 220,
                marginRight: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push(`/restaurant/${restaurant.id}` as any)
                }
                className="bg-white rounded-2xl overflow-hidden"
              >
                {/* Image */}
                {restaurant.image_url ? (
                  <Image
                    source={{ uri: restaurant.image_url }}
                    style={{
                      width: "100%",
                      height: 140,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{ width: "100%", height: 140 }}
                    className="bg-gray-200 items-center justify-center"
                  >
                    <Ionicons name="restaurant" size={40} color="#9ca3af" />
                  </View>
                )}

                {/* Info */}
                <View className="p-3">
                  <Text
                    className="font-semibold text-base text-gray-800"
                    numberOfLines={1}
                  >
                    {restaurant.name}
                  </Text>

                  <Text
                    className="text-gray-400 text-sm mt-1"
                    numberOfLines={1}
                  >
                    {restaurant.address}
                  </Text>

                  {/* Rating + Time */}
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#f59e0b" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {restaurant.rating ?? "4.5"}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color="#9ca3af"
                      />
                      <Text className="text-gray-400 text-xs ml-1">
                        {restaurant.delivery_time
                          ? `${restaurant.delivery_time} min`
                          : "20-30 min"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Restaurants;