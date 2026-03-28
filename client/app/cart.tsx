import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";

export default function CartScreen() {
  const { cart, loading, itemCount, addToCart, removeFromCart, clearCartItems } = useCart();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
          <TouchableOpacity
                            onPress={() => router.back()}
                            className="m-2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                          >
                            <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Your Cart</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={80} color="#d1d5db" />
          <Text className="text-gray-400 mt-4 text-lg">Your cart is empty</Text>
          <Text className="text-gray-400 mt-2 text-center">
            Add items from a restaurant to get started
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="mt-6 bg-orange-500 px-8 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleIncrement = async (menuItemId: number) => {
    await addToCart(menuItemId, cart.restaurant_id, 1);
  };

  const handleDecrement = async (menuItemId: number) => {
    await removeFromCart(menuItemId, 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
                          onPress={() => router.back()}
                          className="m-2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                        >
                          <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
        <View className="ml-4">
          <Text className="text-xl font-bold">Your Cart</Text>
          <Text className="text-gray-500 text-sm">{itemCount} items</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Restaurant Info */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl flex-row items-center">
          <Image
            source={{ uri: cart.restaurant_image }}
            className="w-14 h-14 rounded-lg"
          />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-lg">{cart.restaurant_name}</Text>
            <TouchableOpacity
              onPress={() => router.push(`/restaurant/${cart.restaurant_id}`)}
            >
              <Text className="text-orange-500 text-sm">View Menu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Items */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <Text className="font-bold text-lg mb-4">Items</Text>
          {cart.items.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-lg"
              />
              <View className="flex-1 ml-3">
                <Text className="font-semibold">{item.name}</Text>
                <Text className="text-gray-600 mt-1">₹{item.price}</Text>
              </View>
              <View className="flex-row items-center bg-orange-500 rounded-lg">
                <TouchableOpacity
                  onPress={() => handleDecrement(item.menu_item_id)}
                  className="px-3 py-2"
                >
                  <Ionicons name="remove" size={18} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-semibold px-2">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => handleIncrement(item.menu_item_id)}
                  className="px-3 py-2"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Bill Details */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl mb-4">
          <Text className="font-bold text-lg mb-4">Bill Details</Text>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Item Total</Text>
            <Text className="font-semibold">₹{cart.total}</Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-semibold text-green-600">FREE</Text>
          </View>
          <View className="border-t border-gray-200 mt-2 pt-3 flex-row justify-between">
            <Text className="font-bold text-lg">To Pay</Text>
            <Text className="font-bold text-lg">₹{cart.total}</Text>
          </View>
        </View>

        {/* Clear Cart */}
        <TouchableOpacity
          onPress={clearCartItems}
          className="mx-4 mb-6"
        >
          <Text className="text-red-500 text-center">Clear Cart</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Checkout Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-orange-500 py-4 rounded-xl flex-row items-center justify-center"
          onPress={() => {
            // Navigate to checkout
            router.push("/checkout");
          }}
        >
          <Text className="text-white font-bold text-lg">
            Proceed to Checkout • ₹{cart.total}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
