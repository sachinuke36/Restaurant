import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";
import { fetchAddress } from "@/api/user/address";
import { placeOrder, getMyOrders } from "@/api/user/orders";
import { createPaymentIntent } from "@/api/user/payments";
import { Address } from "@/types/user";
import BackButton from "@/components/common/BackButton";
import { useStripe } from "@stripe/stripe-react-native";

type PaymentMethod = "cash" | "card" | "upi";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollForNewOrder(
  previousOrderIds: Set<number>,
  maxAttempts = 10,
  intervalMs = 2000
): Promise<number | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await getMyOrders();
      const orders = response.orders || [];

      // Find an order that wasn't in the previous set
      const newOrder = orders.find((order: { id: number }) => !previousOrderIds.has(order.id));

      if (newOrder) {
        return newOrder.id;
      }
    } catch (error) {
      console.log("Polling attempt failed:", error);
    }

    // Wait before next attempt (skip wait on last attempt)
    if (attempt < maxAttempts - 1) {
      await sleep(intervalMs);
    }
  }

  return null;
}

export default function CheckoutScreen() {
  const { cart, clearLocalCart } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await fetchAddress();
      if (res?.address && res.address.length > 0) {
        setAddresses(res.address);
        // Select default address or first one
        const defaultAddr = res.address.find((a: Address) => a.isDefault);
        setSelectedAddress(defaultAddr || res.address[0]);
      }
    } catch (error) {
      console.log("Error loading addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    setPlacing(true);

    try {
      // Get existing order IDs before payment to detect new orders
      const existingOrdersResponse = await getMyOrders();
      const existingOrderIds = new Set<number>(
        (existingOrdersResponse.orders || []).map((o: { id: number }) => o.id)
      );

      // Step 1: Create payment intent
      const { clientSecret } = await createPaymentIntent(selectedAddress.id);

      // Step 2: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Restaurant App",
        defaultBillingDetails: {
          address: {
            country: "IN",
          },
        },
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setPlacing(false);
        return;
      }

      // Step 3: Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === "Canceled") {
          // User cancelled, do nothing
        } else {
          Alert.alert("Payment Failed", paymentError.message);
        }
        setPlacing(false);
        return;
      }

      // Step 4: Payment successful - webhook will create the order
      // Clear local cart
      clearLocalCart();

      // Poll for the new order created by webhook
      const newOrderId = await pollForNewOrder(existingOrderIds);

      if (newOrderId) {
        router.replace({
          pathname: "/order-confirmation",
          params: { orderId: newOrderId },
        });
      } else {
        // Order not found after polling - show message and navigate to orders
        Alert.alert(
          "Order Processing",
          "Your payment was successful! Your order is being processed and will appear in your orders shortly.",
          [
            {
              text: "View Orders",
              onPress: () => router.replace("/(tabs)/orders"),
            },
          ]
        );
      }

    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
      setPlacing(false);
    }
  };

  const handleCashPayment = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    setPlacing(true);

    try {
      // Place the order directly for COD
      const response = await placeOrder({ address_id: selectedAddress.id });

      if (response.order) {
        // Clear local cart state (backend already cleared the cart)
        clearLocalCart();

        // Navigate to order confirmation
        router.replace({
          pathname: "/order-confirmation",
          params: { orderId: response.order.id },
        });
      } else {
        Alert.alert("Error", response.message || "Failed to place order");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    if (!cart) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    if (paymentMethod === "card") {
      await handleCardPayment();
    } else if (paymentMethod === "upi") {
      // UPI can be added later with Stripe's UPI payment method
      Alert.alert(
        "Coming Soon",
        "UPI payment will be available soon. Please use Card or Cash on Delivery.",
        [{ text: "OK" }]
      );
    } else {
      await handleCashPayment();
    }
  };

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
          <BackButton />
          <Text className="text-xl font-bold ml-4 text-orange-500">Checkout</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={80} color="#d1d5db" />
          <Text className="text-gray-400 mt-4 text-lg">Your cart is empty</Text>
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

  const deliveryFee = 40;
  const tax = Math.round(cart.total * 0.05);
  const totalAmount = cart.total + deliveryFee + tax;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <BackButton />
        <Text className="text-xl font-bold ml-4 text-orange-500">Checkout</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Delivery Address */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-lg">Delivery Address</Text>
            <TouchableOpacity onPress={() => router.push("/profile/addresses")}>
              <Text className="text-orange-500">Change</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push("/profile/addresses")}
              className="flex-row items-center py-3"
            >
              <Ionicons name="add-circle-outline" size={24} color="#f97316" />
              <Text className="text-orange-500 ml-2">Add New Address</Text>
            </TouchableOpacity>
          ) : (
            <View>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  onPress={() => setSelectedAddress(address)}
                  className={`p-3 rounded-lg mb-2 border ${
                    selectedAddress?.id === address.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <View className="flex-row items-start">
                    <Ionicons
                      name={
                        selectedAddress?.id === address.id
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={20}
                      color={
                        selectedAddress?.id === address.id ? "#f97316" : "#9ca3af"
                      }
                    />
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold">{address.fullName}</Text>
                      <Text className="text-gray-600 text-sm mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {address.city}, {address.state} {address.postalCode}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1">
                        {address.phone}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <Text className="font-bold text-lg mb-3">Order Summary</Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="restaurant-outline" size={18} color="#6b7280" />
            <Text className="text-gray-600 ml-2">{cart.restaurant_name}</Text>
          </View>
          {cart.items.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between py-2 border-b border-gray-100"
            >
              <View className="flex-row flex-1">
                <Text className="text-gray-600">{item.quantity}x</Text>
                <Text className="text-gray-800 ml-2 flex-1" numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text className="text-gray-800">
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
          <Text className="font-bold text-lg mb-3">Payment Method</Text>
          {[
            { id: "cash", label: "Cash on Delivery", icon: "cash-outline" },
            { id: "card", label: "Credit/Debit Card", icon: "card-outline" },
            { id: "upi", label: "UPI", icon: "phone-portrait-outline" },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setPaymentMethod(method.id as PaymentMethod)}
              className={`flex-row items-center p-3 rounded-lg mb-2 border ${
                paymentMethod === method.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <Ionicons
                name={
                  paymentMethod === method.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={paymentMethod === method.id ? "#f97316" : "#9ca3af"}
              />
              <Ionicons
                name={method.icon as any}
                size={20}
                color="#374151"
                style={{ marginLeft: 12 }}
              />
              <Text className="ml-3 text-gray-800">{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill Details */}
        <View className="bg-white mx-4 mt-4 p-4 rounded-xl mb-4">
          <Text className="font-bold text-lg mb-3">Bill Details</Text>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Item Total</Text>
            <Text className="text-gray-800">₹{cart.total}</Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="text-gray-800">₹{deliveryFee}</Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-600">Taxes (5%)</Text>
            <Text className="text-gray-800">₹{tax}</Text>
          </View>
          <View className="border-t border-gray-200 mt-2 pt-3 flex-row justify-between">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg">₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            placing || !selectedAddress ? "bg-gray-300" : "bg-orange-500"
          }`}
          onPress={handlePlaceOrder}
          disabled={placing || !selectedAddress}
        >
          {placing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Place Order • ₹{totalAmount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
