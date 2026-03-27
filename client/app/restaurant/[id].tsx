import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { getRestaurantFullInfo } from "@/api/appInfo/restaurants";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/common/BackButton";

export default function RestaurantPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantFullInfo(id);

        if (!data) return;

        setRestaurant(data.restaurant || null);
        setCategories(data.categories || []);
        setMenuItems(data.menuItems || []);

        if (data.categories?.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      } catch (error) {
        console.log("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRestaurant();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="restaurant-outline" size={60} color="#d1d5db" />
        <Text className="text-gray-400 mt-4">Restaurant not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const filteredItems = menuItems.filter(
    (item: any) => item.category_id === selectedCategory
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Restaurant Image with Back Button */}
        <View className="relative">
          <Image
            source={{ uri: restaurant.image_url }}
            className="w-full h-60"
          />
          {/* Back Button */}
          <BackButton/>
        </View>

        {/* Restaurant Info */}
        <View className="px-5 py-4">
          <Text className="text-2xl font-bold">{restaurant.name}</Text>

          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={16} color="orange" />
            <Text className="ml-1 text-gray-600">
              {restaurant.rating}
            </Text>
          </View>

          <Text className="text-gray-500 mt-1">
            {restaurant.address}
          </Text>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
        >
          <View className="flex-row gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full ${
                    isSelected ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Menu Items */}
        <View className="px-5 mt-6 gap-4">
          {filteredItems.map((item: any) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center bg-gray-100 p-3 rounded-xl"
            >
              <View className="flex-1">
                <Text className="font-bold text-lg">{item.name}</Text>

                <Text className="text-gray-600 mt-1">
                  ₹{item.price}
                </Text>
              </View>

              <Image
                source={{ uri: item.image }}
                className="w-20 h-20 rounded-lg"
              />
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}