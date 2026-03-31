import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createDeliveryPerson } from "@/api/admin";

export default function AddDeliveryPartner() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter the name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter the email");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Error", "Please enter the phone number");
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createDeliveryPerson({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      Alert.alert("Success", "Delivery partner account created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create delivery partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5">
          <View className="mt-4 mb-6">
            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center self-center mb-4">
              <Ionicons name="bicycle" size={40} color="#f97316" />
            </View>
            <Text className="text-center text-gray-500">
              Create a new delivery partner account. They will be able to log in
              and start accepting deliveries.
            </Text>
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <Ionicons name="person-outline" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <Ionicons name="mail-outline" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <Ionicons name="call-outline" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-base"
                placeholder="Enter password (min 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-4 rounded-xl mb-6 ${
              loading ? "bg-orange-300" : "bg-orange-500"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Create Delivery Partner
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
