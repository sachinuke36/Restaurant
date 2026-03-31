import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { getAllUsers } from "@/api/admin";
import { User } from "@/types/user";

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "#ef4444";
    case "owner":
      return "#f59e0b";
    case "delivery_person":
      return "#3b82f6";
    default:
      return "#10b981";
  }
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data?.users || []);
    } catch (error) {
      console.log("Error loading users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, []);

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
        {/* Stats */}
        <View className="flex-row justify-around py-4 bg-gray-50 rounded-xl mt-4 mb-4">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-800">
              {users.length}
            </Text>
            <Text className="text-gray-500 text-sm">Total</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-500">
              {users.filter((u) => u.role === "customer").length}
            </Text>
            <Text className="text-gray-500 text-sm">Customers</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-orange-500">
              {users.filter((u) => u.role === "owner").length}
            </Text>
            <Text className="text-gray-500 text-sm">Owners</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-500">
              {users.filter((u) => u.role === "delivery_person").length}
            </Text>
            <Text className="text-gray-500 text-sm">Delivery</Text>
          </View>
        </View>

        {/* Add Delivery Partner Button */}
        <TouchableOpacity
          onPress={() => router.push("/admin/add-delivery-partner")}
          className="flex-row items-center justify-center bg-orange-500 py-3 rounded-xl mb-4"
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white font-bold text-base ml-2">
            Add Delivery Partner
          </Text>
        </TouchableOpacity>

        {/* Users List */}
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f97316"
            />
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-gray-50 p-4 rounded-xl mb-3">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
                <Ionicons name="person" size={24} color="#f97316" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-bold text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.email}</Text>
                <Text className="text-gray-400 text-sm">{item.phone}</Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${getRoleColor(item.role)}20` }}
              >
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: getRoleColor(item.role) }}
                >
                  {item.role.replace("_", " ")}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="people-outline" size={60} color="#d1d5db" />
              <Text className="text-gray-400 mt-4">No users found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
