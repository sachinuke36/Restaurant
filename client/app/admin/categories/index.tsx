import React, { useEffect, useState, useCallback } from "react";
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
import { getCategories } from "@/api/admin";
import { Categories } from "@/types/app";

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.log("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
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
          onPress={() => router.push("/admin/categories/create")}
          className="flex-row items-center justify-center bg-orange-500 py-4 rounded-xl mt-4 mb-4"
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white font-semibold ml-2">Add Category</Text>
        </TouchableOpacity>

        {/* Categories List */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-3">
              <Image
                source={{ uri: item.img_url }}
                className="w-16 h-16 rounded-lg"
              />
              <View className="flex-1 ml-4">
                <Text className="font-bold text-lg">{item.name}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="grid-outline" size={60} color="#d1d5db" />
              <Text className="text-gray-400 mt-4">No categories yet</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
