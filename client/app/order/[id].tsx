import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getOrderDetails, cancelOrder } from "@/api/user/orders";
import BackButton from "@/components/common/BackButton";

type OrderStatus = "pending" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

const statusConfig: Record<OrderStatus, { color: string; bgColor: string; icon: string; label: string }> = {
  pending: { color: "#f97316", bgColor: "#fff7ed", icon: "time", label: "Order Placed" },
  preparing: { color: "#eab308", bgColor: "#fefce8", icon: "restaurant", label: "Preparing" },
  out_for_delivery: { color: "#3b82f6", bgColor: "#eff6ff", icon: "bicycle", label: "Out for Delivery" },
  delivered: { color: "#22c55e", bgColor: "#f0fdf4", icon: "checkmark-circle", label: "Delivered" },
  cancelled: { color: "#ef4444", bgColor: "#fef2f2", icon: "close-circle", label: "Cancelled" },
};

const statusSteps: OrderStatus[] = ["pending", "preparing", "out_for_delivery", "delivered"];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      const response = await getOrderDetails(Number(id));
      setOrder(response.order);
      setItems(response.items || []);
    } catch (error) {
      console.log("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelOrder(Number(id));
              loadOrderDetails();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel order");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Ionicons name="receipt-outline" size={60} color="#d1d5db" />
        <Text className="text-gray-400 mt-4">Order not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-orange-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const config = statusConfig[order.status as OrderStatus] || statusConfig.pending;
  const currentStepIndex = statusSteps.indexOf(order.status);
  const canCancel = order.status === "pending" || order.status === "preparing";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <BackButton />
        <View className="ml-4">
          <Text className="text-xl font-bold text-orange-500">Order #{order.id}</Text>
          <Text className="text-gray-500 text-sm">{formatDate(order.created_at)}</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Order Status */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <View className="flex-row items-center mb-4">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: config.bgColor }}
            >
              <Ionicons name={config.icon as any} size={24} color={config.color} />
            </View>
            <View className="ml-3">
              <Text className="font-bold text-lg">{config.label}</Text>
              <Text className="text-gray-500 text-sm">
                {order.status === "delivered"
                  ? "Your order has been delivered"
                  : order.status === "cancelled"
                  ? "This order was cancelled"
                  : "Your order is being processed"}
              </Text>
            </View>
          </View>

          {/* Progress Steps */}
          {order.status !== "cancelled" && (
            <View className="flex-row justify-between mt-2">
              {statusSteps.map((step, index) => {
                const stepConfig = statusConfig[step];
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <View key={step} className="items-center flex-1">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isCompleted ? "" : "bg-gray-200"
                      }`}
                      style={isCompleted ? { backgroundColor: stepConfig.color } : {}}
                    >
                      <Ionicons
                        name={stepConfig.icon as any}
                        size={16}
                        color={isCompleted ? "white" : "#9ca3af"}
                      />
                    </View>
                    <Text
                      className={`text-xs mt-1 text-center ${
                        isCurrent ? "font-bold" : ""
                      }`}
                      style={{ color: isCompleted ? stepConfig.color : "#9ca3af" }}
                    >
                      {stepConfig.label}
                    </Text>
                    {index < statusSteps.length - 1 && (
                      <View
                        className={`absolute top-4 left-[60%] w-[80%] h-0.5 ${
                          index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Restaurant Info */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <View className="flex-row items-center">
            <Image
              source={{ uri: order.restaurant_image }}
              className="w-14 h-14 rounded-lg"
            />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-lg">{order.restaurant_name}</Text>
              {order.restaurant_address && (
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                  {order.restaurant_address}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <Text className="font-bold text-lg mb-3">Order Items</Text>
          {items.map((item, index) => (
            <View
              key={item.id || index}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  className="w-12 h-12 rounded-lg"
                />
              )}
              <View className={`flex-1 ${item.image ? "ml-3" : ""}`}>
                <Text className="font-medium">{item.name || `Item #${item.menu_item_id}`}</Text>
                <Text className="text-gray-500 text-sm">
                  {item.quantity} x ₹{item.price}
                </Text>
              </View>
              <Text className="font-semibold">₹{item.total_price}</Text>
            </View>
          ))}
        </View>

        {/* Bill Details */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <Text className="font-bold text-lg mb-3">Bill Details</Text>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text>₹{order.subtotal}</Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text>₹{order.delivery_fee}</Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Taxes</Text>
            <Text>₹{order.tax}</Text>
          </View>
          {Number(order.discount) > 0 && (
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Discount</Text>
              <Text className="text-green-600">-₹{order.discount}</Text>
            </View>
          )}
          <View className="border-t border-gray-200 mt-2 pt-3 flex-row justify-between">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg">₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Cancel Order */}
        {canCancel && (
          <TouchableOpacity
            onPress={handleCancelOrder}
            disabled={cancelling}
            className="mx-4 mt-4 mb-6 py-3 border border-red-500 rounded-xl"
          >
            {cancelling ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text className="text-red-500 text-center font-semibold">
                Cancel Order
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Reorder */}
        {order.status === "delivered" && (
          <TouchableOpacity
            onPress={() => router.push(`/restaurant/${order.restaurant_id}`)}
            className="mx-4 mt-4 mb-6 py-4 bg-orange-500 rounded-xl"
          >
            <Text className="text-white text-center font-bold text-lg">
              Reorder
            </Text>
          </TouchableOpacity>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
