import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getDeliveryDetails, updateDeliveryStatus } from "@/api/delivery";
import BackButton from "@/components/common/BackButton";
import { DeliveryDetails, DeliveryStatus, OrderItem } from "@/types/delivery";

export default function ActiveDelivery() {
  const { deliveryId } = useLocalSearchParams<{ deliveryId: string }>();
  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadDelivery = async () => {
    if (!deliveryId) return;
    try {
      const res = await getDeliveryDetails(Number(deliveryId));
      setDelivery(res.delivery);
      setItems(res.items || []);
    } catch (error) {
      console.log("Error loading delivery:", error);
      Alert.alert("Error", "Failed to load delivery details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDelivery();
  }, [deliveryId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDelivery();
  }, [deliveryId]);

  const handleUpdateStatus = async (newStatus: DeliveryStatus) => {
    if (!delivery) return;

    const statusMessages: Record<DeliveryStatus, string> = {
      pending: "Mark as pending?",
      assigned: "Mark as assigned?",
      picked_up: "Confirm you've picked up the order from the restaurant?",
      delivered: "Confirm the order has been delivered to the customer?",
      cancelled: "Cancel this delivery?",
    };

    Alert.alert("Update Status", statusMessages[newStatus], [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setUpdating(true);
          try {
            await updateDeliveryStatus(delivery.id, newStatus);
            setDelivery((prev) => (prev ? { ...prev, status: newStatus } : null));

            if (newStatus === "delivered") {
              Alert.alert("Success", "Delivery completed!", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } else {
              Alert.alert("Success", "Status updated!");
            }
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update status");
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const handleCallCustomer = () => {
    if (!delivery?.customer_phone) {
      Alert.alert("Error", "Customer phone not available");
      return;
    }
    Linking.openURL(`tel:${delivery.customer_phone}`);
  };

  const handleNavigateToRestaurant = () => {
    if (!delivery?.restaurant_address) {
      Alert.alert("Error", "Restaurant address not available");
      return;
    }
    const address = encodeURIComponent(delivery.restaurant_address);
    const url = Platform.select({
      ios: `maps:?daddr=${address}`,
      android: `google.navigation:q=${address}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleNavigateToCustomer = () => {
    if (!delivery?.delivery_address_line1) {
      Alert.alert("Error", "Delivery address not available");
      return;
    }
    const address = encodeURIComponent(
      `${delivery.delivery_address_line1}, ${delivery.delivery_city}`
    );
    const url = Platform.select({
      ios: `maps:?daddr=${address}`,
      android: `google.navigation:q=${address}`,
    });
    if (url) Linking.openURL(url);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-600";
      case "picked_up":
        return "bg-orange-100 text-orange-600";
      case "delivered":
        return "bg-green-100 text-green-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!delivery) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
          <BackButton />
          <Text className="text-xl font-bold ml-4 text-orange-500">
            Delivery Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Delivery not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <BackButton />
        <Text className="text-xl font-bold ml-4 text-orange-500">
          Order #{delivery.order_id}
        </Text>
        <View className="ml-auto">
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(delivery.status).split(" ")[0]}`}
          >
            <Text
              className={`text-sm font-medium capitalize ${getStatusColor(delivery.status).split(" ")[1]}`}
            >
              {delivery.status.replace("_", " ")}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Restaurant Info */}
        <View className="bg-white m-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
              <Ionicons name="restaurant" size={16} color="#22c55e" />
            </View>
            <Text className="ml-2 font-bold text-lg">Pickup Location</Text>
          </View>
          <Text className="font-semibold text-lg">{delivery.restaurant_name}</Text>
          <Text className="text-gray-600 mt-1">{delivery.restaurant_address}</Text>
          <TouchableOpacity
            onPress={handleNavigateToRestaurant}
            className="flex-row items-center mt-3 bg-green-50 p-3 rounded-lg"
          >
            <Ionicons name="navigate" size={20} color="#22c55e" />
            <Text className="ml-2 text-green-600 font-medium">
              Navigate to Restaurant
            </Text>
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
              <Ionicons name="location" size={16} color="#f97316" />
            </View>
            <Text className="ml-2 font-bold text-lg">Delivery Location</Text>
          </View>
          <Text className="font-semibold text-lg">{delivery.customer_name}</Text>
          <Text className="text-gray-600 mt-1">
            {delivery.delivery_address_line1}
          </Text>
          {delivery.delivery_address_line2 && (
            <Text className="text-gray-600">{delivery.delivery_address_line2}</Text>
          )}
          <Text className="text-gray-600">
            {delivery.delivery_city}, {delivery.delivery_state} - {delivery.delivery_pincode}
          </Text>

          <View className="flex-row mt-3">
            <TouchableOpacity
              onPress={handleCallCustomer}
              className="flex-1 flex-row items-center justify-center bg-blue-50 p-3 rounded-lg mr-2"
            >
              <Ionicons name="call" size={20} color="#3b82f6" />
              <Text className="ml-2 text-blue-600 font-medium">Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNavigateToCustomer}
              className="flex-1 flex-row items-center justify-center bg-orange-50 p-3 rounded-lg ml-2"
            >
              <Ionicons name="navigate" size={20} color="#f97316" />
              <Text className="ml-2 text-orange-600 font-medium">Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white mx-4 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="font-bold text-lg mb-3">Order Items</Text>
          {items.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <View className="flex-row items-center flex-1">
                <Text className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                  {item.quantity}x
                </Text>
                <Text className="ml-2 flex-1">{item.name}</Text>
              </View>
              <Text className="font-medium">Rs.{item.price * item.quantity}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-200">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold text-lg">Rs.{delivery.order_total}</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-green-600">Your Earnings</Text>
            <Text className="font-bold text-green-600">+Rs.{delivery.order_delivery_fee}</Text>
          </View>
        </View>

        {/* Status Update Actions */}
        {delivery.status !== "delivered" && delivery.status !== "cancelled" && (
          <View className="mx-4 mb-6">
            {delivery.status === "assigned" && (
              <TouchableOpacity
                onPress={() => handleUpdateStatus("picked_up")}
                disabled={updating}
                className="bg-orange-500 p-4 rounded-xl flex-row items-center justify-center"
              >
                {updating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="bag-check" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Mark as Picked Up
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {delivery.status === "picked_up" && (
              <TouchableOpacity
                onPress={() => handleUpdateStatus("delivered")}
                disabled={updating}
                className="bg-green-500 p-4 rounded-xl flex-row items-center justify-center"
              >
                {updating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Mark as Delivered
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Completed Message */}
        {delivery.status === "delivered" && (
          <View className="mx-4 mb-6 bg-green-50 p-4 rounded-xl flex-row items-center">
            <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
            <View className="ml-3">
              <Text className="font-bold text-green-800">Delivery Completed</Text>
              <Text className="text-green-600 text-sm">
                Thank you for the delivery!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
