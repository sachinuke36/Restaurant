import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAddress } from "@/api/user/address";
import { Address } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      }
    };
    loadAddresses();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-5" edges={["bottom"]}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <View className="p-4 bg-gray-50 rounded-xl mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={18} color="#f97316" />
              <Text className="font-bold ml-2">{item.fullName}</Text>
            </View>
            <Text className="text-gray-600">{item.addressLine1}</Text>
            {item.addressLine2 && (
              <Text className="text-gray-600">{item.addressLine2}</Text>
            )}
            <Text className="text-gray-600">
              {item.city}, {item.state} {item.postalCode}
            </Text>
            <Text className="text-gray-400 mt-1">{item.phone}</Text>
            {item.isDefault && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text className="text-green-500 ml-1 text-sm">Default</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="location-outline" size={60} color="#d1d5db" />
            <Text className="text-gray-400 mt-4">No addresses found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
