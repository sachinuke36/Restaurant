import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CartFooterProps {
  restaurantId: number;
}

const CartFooter = ({ restaurantId }: CartFooterProps) => {
  const { cart, itemCount } = useCart();
  const insets = useSafeAreaInsets();

  // Only show if cart has items and it's from this restaurant
  if (!cart || cart.items.length === 0 || cart.restaurant_id !== restaurantId) {
    return null;
  }

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-orange-500 px-4"
      style={{ paddingBottom: insets.bottom + 8, paddingTop: 12 }}
    >
      <TouchableOpacity
        onPress={() => router.push("/cart")}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="bg-white/20 rounded-full p-2 mr-3">
            <Ionicons name="cart" size={20} color="white" />
          </View>
          <View>
            <Text className="text-white font-bold">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
            <Text className="text-white/80 text-sm">₹{cart.total}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="text-white font-bold mr-2">View Cart</Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CartFooter;
