import { Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "@/types/user";
import { fetchAddress } from "@/api/user/address";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";

const TopBar = () => {
  const [address, setAddress] = useState<Address | null>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    const getAddress = async () => {
      try {
        const res = await fetchAddress();
        if (res?.address && res.address.length > 0) {
          // Find default address or use first one
          const defaultAddr = res.address.find((a: Address) => a.isDefault);
          setAddress(defaultAddr || res.address[0]);
        }
      } catch (error) {
        console.log("Error fetching address:", error);
      }
    };

    getAddress();
  }, []);

  return (
    <View className="flex-row justify-between items-center py-2 mt-10">
      {/* Location */}
      <TouchableOpacity
        onPress={() => router.push("/profile/addresses")}
        className="flex-row items-center flex-1"
      >
        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
          <Ionicons name="location" size={20} color="#f97316" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-xs text-gray-400 uppercase">Deliver to</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-700 font-semibold" numberOfLines={1}>
              {address?.addressLine1 || "Add address"}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#9ca3af" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Cart */}
      <TouchableOpacity
        onPress={() => router.push("/cart")}
        className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
      >
        <Ionicons name="cart-outline" size={24} color="#374151" />
        {itemCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {itemCount > 9 ? "9+" : itemCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;