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
import { Restaurants } from "@/types/app";
import RestaurantInfo from "./components/RestaurantInfo";
import MenuItems from "./components/MenuItems";
import CategoriesComp from "./components/Categories";
import CartFooter from "./components/CartFooter";

export default function RestaurantPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<Restaurants| null>(null);
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
          {restaurant.image_url ? (
            <Image
              source={{ uri: restaurant.image_url }}
              className="w-full h-60"
            />
          ) : (
            <View className="w-full h-60 bg-gray-200 items-center justify-center">
              <Ionicons name="restaurant" size={60} color="#9ca3af" />
            </View>
          )}
          {/* Back Button */}
          <BackButton absolute />
        </View>

        {/* Restaurant Info */}
        <RestaurantInfo
          restaurant={restaurant}
          />

        {/* Categories */}
          <CategoriesComp
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}/>

        {/* Menu Items */}
        <MenuItems
          filteredItems={filteredItems}
          restaurantId={Number(id)}
          />

        {/* Bottom padding for cart footer */}
        <View className="h-24" />
      </ScrollView>

      {/* Cart Footer */}
      <CartFooter restaurantId={Number(id)} />
    </View>
  );
}