import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { addAddress, updateAddress, fetchAddress } from "@/api/user/address";
import BackButton from "@/components/common/BackButton";

export default function AddAddressScreen() {
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const isEditing = !!addressId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    if (isEditing) {
      loadAddress();
    }
  }, [addressId]);

  const loadAddress = async () => {
    try {
      const res = await fetchAddress();
      const address = res?.address?.find((a: any) => a.id === Number(addressId));
      if (address) {
        setForm({
          fullName: address.fullName || "",
          phone: address.phone || "",
          addressLine1: address.addressLine1 || "",
          addressLine2: address.addressLine2 || "",
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country || "India",
          isDefault: address.isDefault || false,
        });
      }
    } catch (error) {
      console.log("Error loading address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!form.fullName.trim()) {
      Alert.alert("Error", "Please enter full name");
      return;
    }
    if (!form.phone.trim() || form.phone.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }
    if (!form.addressLine1.trim()) {
      Alert.alert("Error", "Please enter address");
      return;
    }
    if (!form.city.trim()) {
      Alert.alert("Error", "Please enter city");
      return;
    }
    if (!form.state.trim()) {
      Alert.alert("Error", "Please enter state");
      return;
    }
    if (!form.postalCode.trim() || form.postalCode.length < 6) {
      Alert.alert("Error", "Please enter a valid postal code");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateAddress(Number(addressId), form);
      } else {
        await addAddress(form);
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <BackButton />
        <Text className="text-xl font-bold ml-4">
          {isEditing ? "Edit Address" : "Add Address"}
        </Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Full Name *</Text>
            <TextInput
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              placeholder="Enter full name"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Phone Number *</Text>
            <TextInput
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              maxLength={10}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Address Line 1 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Address Line 1 *</Text>
            <TextInput
              value={form.addressLine1}
              onChangeText={(text) => setForm({ ...form, addressLine1: text })}
              placeholder="House/Flat No., Building Name"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Address Line 2 */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Address Line 2</Text>
            <TextInput
              value={form.addressLine2}
              onChangeText={(text) => setForm({ ...form, addressLine2: text })}
              placeholder="Street, Area, Landmark (Optional)"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* City and State */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 font-medium mb-2">City *</Text>
              <TextInput
                value={form.city}
                onChangeText={(text) => setForm({ ...form, city: text })}
                placeholder="City"
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 font-medium mb-2">State *</Text>
              <TextInput
                value={form.state}
                onChangeText={(text) => setForm({ ...form, state: text })}
                placeholder="State"
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              />
            </View>
          </View>

          {/* Postal Code and Country */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 font-medium mb-2">Postal Code *</Text>
              <TextInput
                value={form.postalCode}
                onChangeText={(text) => setForm({ ...form, postalCode: text })}
                placeholder="PIN Code"
                keyboardType="number-pad"
                maxLength={6}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 font-medium mb-2">Country</Text>
              <TextInput
                value={form.country}
                onChangeText={(text) => setForm({ ...form, country: text })}
                placeholder="Country"
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              />
            </View>
          </View>

          {/* Set as Default */}
          <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6">
            <Text className="text-gray-700 font-medium">Set as default address</Text>
            <Switch
              value={form.isDefault}
              onValueChange={(value) => setForm({ ...form, isDefault: value })}
              trackColor={{ false: "#d1d5db", true: "#fed7aa" }}
              thumbColor={form.isDefault ? "#f97316" : "#f4f4f5"}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`py-4 rounded-xl ${saving ? "bg-gray-300" : "bg-orange-500"}`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-center text-lg">
              {isEditing ? "Update Address" : "Save Address"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
