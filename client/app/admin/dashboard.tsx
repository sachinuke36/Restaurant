import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getCategories, getRestaurants, getAllUsers } from "@/api/admin";

export default function Dashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    restaurants: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [catsRes, restsRes, usersRes] = await Promise.all([
          getCategories(),
          getRestaurants(),
          getAllUsers(),
        ]);
        setStats({
          categories: catsRes?.length || 0,
          restaurants: restsRes?.restaurants?.length || 0,
          users: usersRes?.users?.length || 0,
        });
      } catch (error) {
        console.log("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  const statCards = [
    {
      label: "Categories",
      value: stats.categories,
      color: "#10b981",
      icon: "grid",
    },
    {
      label: "Restaurants",
      value: stats.restaurants,
      color: "#f59e0b",
      icon: "restaurant",
    },
    {
      label: "Users",
      value: stats.users,
      color: "#8b5cf6",
      icon: "people",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <ScrollView className="flex-1 px-5">
        <Text className="text-2xl font-bold mt-4 mb-6">Overview</Text>

        <View className="flex-row flex-wrap justify-between">
          {statCards.map((stat, index) => (
            <View key={index} className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500">{stat.label}</Text>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
              </View>
              <Text
                className="text-3xl font-bold mt-2"
                style={{ color: stat.color }}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-white p-5 rounded-2xl mt-4 shadow-sm">
          <Text className="text-lg font-bold mb-3">Quick Actions</Text>
          <Text className="text-gray-500">
            Use the admin menu to manage categories, restaurants, and users.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
