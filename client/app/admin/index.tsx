import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";
import { deleteToken } from "@/utils/tokenStorage";

export default function AdminPanel() {
  const { user, clearUser } = useUser();

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

  const adminMenuItems = [
    {
      icon: "stats-chart",
      label: "Dashboard",
      description: "View app statistics",
      route: "/admin/dashboard",
      color: "#3b82f6",
    },
    {
      icon: "grid",
      label: "Categories",
      description: "Manage food categories",
      route: "/admin/categories",
      color: "#10b981",
    },
    {
      icon: "restaurant",
      label: "Restaurants",
      description: "Manage restaurants",
      route: "/admin/restaurants",
      color: "#f59e0b",
    },
    {
      icon: "people",
      label: "Users",
      description: "Manage users & delivery partners",
      route: "/admin/users",
      color: "#8b5cf6",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5">
        {/* Header */}
        <View className="mt-6 mb-8 flex-row items-start justify-between">
          <View>
            <Text className="text-3xl font-bold text-orange-500">Admin Panel</Text>
            <Text className="text-gray-500 mt-1">Welcome, {user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 p-3 rounded-full"
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Admin Menu Grid */}
        <View className="flex-row flex-wrap justify-between">
          {adminMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route as any)}
              className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm"
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text className="font-semibold text-lg">{item.label}</Text>
              <Text className="text-gray-400 text-sm mt-1">{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
