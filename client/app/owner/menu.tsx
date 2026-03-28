import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  getMenuItems,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "@/api/owner/restaurant";
import BackButton from "@/components/common/BackButton";

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  img_url: string | null;
  is_available: boolean;
  category_id: number | null;
  category_name: string | null;
};

export default function MenuManagement() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const res = await getMenuItems(Number(restaurantId));
      setMenuItems(res.menuItems || []);
    } catch (error) {
      console.log("Error loading menu items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMenuItems();
  }, [restaurantId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMenuItems();
  }, [restaurantId]);

  const handleToggleAvailability = async (item: MenuItem) => {
    if (!restaurantId) return;

    // Optimistic update
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, is_available: !m.is_available } : m
      )
    );

    try {
      await toggleMenuItemAvailability(Number(restaurantId), item.id);
    } catch (error) {
      // Revert on error
      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, is_available: item.is_available } : m
        )
      );
      Alert.alert("Error", "Failed to update availability");
    }
  };

  const handleDelete = (id: number) => {
    if (!restaurantId) return;
    Alert.alert(
      "Delete Menu Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuItem(Number(restaurantId), id);
              setMenuItems((prev) => prev.filter((m) => m.id !== id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
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
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
        <View className="flex-row items-center">
          <BackButton />
          <Text className="text-xl font-bold ml-4">Menu Items</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/owner/add-menu-item",
              params: { restaurantId },
            })
          }
          className="bg-orange-500 px-4 py-2 rounded-full flex-row items-center"
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-medium ml-1">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menuItems}
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
          <View className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm">
            <View className="flex-row p-3">
              {item.img_url ? (
                <Image
                  source={{ uri: item.img_url }}
                  className="w-20 h-20 rounded-lg"
                />
              ) : (
                <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
                  <Ionicons name="fast-food" size={32} color="#9ca3af" />
                </View>
              )}

              <View className="flex-1 ml-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-base" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.category_name && (
                      <View className="bg-gray-100 px-2 py-0.5 rounded self-start mt-1">
                        <Text className="text-gray-600 text-xs">
                          {item.category_name}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-bold text-orange-500">
                    ₹{item.price}
                  </Text>
                </View>

                {item.description && (
                  <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* Availability Toggle */}
                <View className="flex-row items-center mt-2">
                  <Switch
                    value={item.is_available}
                    onValueChange={() => handleToggleAvailability(item)}
                    trackColor={{ false: "#d1d5db", true: "#bbf7d0" }}
                    thumbColor={item.is_available ? "#22c55e" : "#9ca3af"}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <Text
                    className={`text-sm ml-1 ${
                      item.is_available ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row border-t border-gray-100">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/owner/edit-menu-item",
                    params: { restaurantId, id: item.id },
                  })
                }
                className="flex-1 flex-row items-center justify-center py-3"
              >
                <Ionicons name="create-outline" size={18} color="#374151" />
                <Text className="text-gray-700 ml-1">Edit</Text>
              </TouchableOpacity>

              <View className="w-px bg-gray-100" />

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="flex-1 flex-row items-center justify-center py-3"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-500 ml-1">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="fast-food-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">No menu items yet</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/owner/add-menu-item",
                  params: { restaurantId },
                })
              }
              className="mt-6 bg-orange-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Add Menu Item</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
