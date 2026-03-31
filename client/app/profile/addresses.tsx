import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAddress, deleteAddress, setDefaultAddress } from "@/api/user/address";
import { Address } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BackButton from "@/components/common/BackButton";

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAddresses = async () => {
    try {
      const res = await fetchAddress();
      if (res?.address) {
        setAddresses(res.address);
      }
    } catch (error) {
      console.log("Error loading addresses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAddresses();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(id);
              setAddresses((prev) => prev.filter((a) => a.id !== id));
            } catch (error) {
              Alert.alert("Error", "Failed to delete address");
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
    } catch (error) {
      Alert.alert("Error", "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
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
          <Text className="text-xl font-bold ml-4 text-orange-500">My Addresses</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/profile/add-address")}
          className="bg-orange-500 px-4 py-2 rounded-full flex-row items-center"
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white font-medium ml-1">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
            colors={["#f97316"]}
          />
        }
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={18} color="#f97316" />
                  <Text className="font-bold ml-2 text-base">{item.fullName}</Text>
                  {item.isDefault && (
                    <View className="bg-green-100 px-2 py-0.5 rounded ml-2">
                      <Text className="text-green-600 text-xs font-medium">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600">{item.addressLine1}</Text>
                {item.addressLine2 && (
                  <Text className="text-gray-600">{item.addressLine2}</Text>
                )}
                <Text className="text-gray-600">
                  {item.city}, {item.state} {item.postalCode}
                </Text>
                <Text className="text-gray-400 mt-1">{item.phone}</Text>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/profile/add-address",
                    params: { addressId: item.id },
                  })
                }
                className="flex-1 flex-row items-center justify-center py-2 mr-2"
              >
                <Ionicons name="create-outline" size={18} color="#374151" />
                <Text className="text-gray-700 ml-1">Edit</Text>
              </TouchableOpacity>

              {!item.isDefault && (
                <TouchableOpacity
                  onPress={() => handleSetDefault(item.id)}
                  className="flex-1 flex-row items-center justify-center py-2 mr-2"
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />
                  <Text className="text-green-600 ml-1">Set Default</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="flex-1 flex-row items-center justify-center py-2"
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-500 ml-1">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="location-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg">No addresses yet</Text>
            <Text className="text-gray-400 mt-2">Add an address for faster checkout</Text>
            <TouchableOpacity
              onPress={() => router.push("/profile/add-address")}
              className="mt-6 bg-orange-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Add Address</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
