import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { deleteToken } from "@/utils/tokenStorage";
import { router } from "expo-router";

export default function Profile() {
  const { user, loading, clearUser } = useUser();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await deleteToken();
          clearUser();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      icon: "location-outline",
      label: "My Addresses",
      route: "/profile/addresses",
    },
    {
      icon: "receipt-outline",
      label: "Order History",
      route: "/profile/orders",
    },
    { icon: "heart-outline", label: "Favorites", route: "/profile/favorites" },
    { icon: "settings-outline", label: "Settings", route: "/profile/settings" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5">
        {/* Header */}
        <View className="items-center mt-8">
          <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center">
            <Ionicons name="person" size={50} color="#f97316" />
          </View>
          <Text className="text-2xl font-bold mt-4">{user?.name}</Text>
          <Text className="text-gray-500">{user?.email}</Text>
          <Text className="text-gray-400">{user?.phone}</Text>
          <View className="mt-2 px-3 py-1 bg-orange-100 rounded-full">
            <Text className="text-orange-600 capitalize">{user?.role}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-8">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <Ionicons name={item.icon as any} size={24} color="#374151" />
              <Text className="flex-1 ml-4 text-lg">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-4 mt-4"
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text className="ml-4 text-lg text-red-500">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
