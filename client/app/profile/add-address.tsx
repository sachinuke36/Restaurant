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
import * as Location from "expo-location";
import { addAddress, updateAddress, fetchAddress } from "@/api/user/address";
import BackButton from "@/components/common/BackButton";

export default function AddAddressScreen() {
  const { addressId } = useLocalSearchParams<{ addressId?: string }>();
  const isEditing = !!addressId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
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
    latitude: "",
    longitude: "",
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
          latitude: address.latitude || "",
          longitude: address.longitude || "",
        });
      }
    } catch (error) {
      console.log("Error loading address:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location permissions in your device settings to use this feature."
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        setForm((prev) => ({
          ...prev,
          addressLine1: [address.streetNumber, address.street]
            .filter(Boolean)
            .join(" ") || prev.addressLine1,
          addressLine2: address.district || address.subregion || prev.addressLine2,
          city: address.city || address.subregion || prev.city,
          state: address.region || prev.state,
          postalCode: address.postalCode || prev.postalCode,
          country: address.country || "India",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        Alert.alert("Success", "Location fetched! Please verify and complete the address.");
      }
    } catch (error) {
      console.log("Error getting location:", error);
      Alert.alert("Error", "Failed to get current location. Please try again.");
    } finally {
      setFetchingLocation(false);
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
        <Text className="text-xl font-bold ml-4 text-orange-500">
          {isEditing ? "Edit Address" : "Add Address"}
        </Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Use Current Location Button */}
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={fetchingLocation}
            className="flex-row items-center justify-center bg-orange-50 border border-orange-200 rounded-xl py-3 mb-4"
          >
            {fetchingLocation ? (
              <ActivityIndicator size="small" color="#f97316" />
            ) : (
              <>
                <Ionicons name="locate" size={20} color="#f97316" />
                <Text className="text-orange-500 font-medium ml-2">
                  Use My Current Location
                </Text>
              </>
            )}
          </TouchableOpacity>

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
