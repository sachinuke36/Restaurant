import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";

export default function AdminPanel() {
  const { user } = useUser();

  if (user?.role !== "admin") {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Ionicons name="lock-closed" size={60} color="#ef4444" />
        <Text className="text-red-500 text-xl mt-4">Access Denied</Text>
        <Text className="text-gray-400 mt-2">
          You don't have admin privileges
        </Text>
      </SafeAreaView>
    );
  }

  const adminMenuItems = [
    {
      icon: "stats-chart",
      label: "Dashboard",
      route: "/admin/dashboard",
      color: "#3b82f6",
    },
    {
      icon: "grid",
      label: "Categories",
      route: "/admin/categories",
      color: "#10b981",
    },
    {
      icon: "restaurant",
      label: "Restaurants",
      route: "/admin/restaurants",
      color: "#f59e0b",
    },
    {
      icon: "people",
      label: "Users",
      route: "/admin/users",
      color: "#8b5cf6",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5">
        {/* Header */}
        <View className="mt-6 mb-8">
          <Text className="text-3xl font-bold">Admin Panel</Text>
          <Text className="text-gray-500 mt-1">Manage your application</Text>
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
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
