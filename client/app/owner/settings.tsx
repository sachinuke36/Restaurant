import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getRestaurant, updateRestaurant } from "@/api/owner/restaurant";
import BackButton from "@/components/common/BackButton";

export default function OwnerSettings() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    delivery_time: "",
    delivery_fee: "",
  });

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      const res = await getRestaurant(Number(restaurantId));
      const restaurant = res.restaurant;
      if (restaurant) {
        setForm({
          name: restaurant.name || "",
          description: restaurant.description || "",
          address: restaurant.address || "",
          phone: restaurant.phone || "",
          delivery_time: restaurant.delivery_time?.toString() || "",
          delivery_fee: restaurant.delivery_fee?.toString() || "",
        });
        setImage(restaurant.image_url || null);
      }
    } catch (error) {
      console.log("Error loading restaurant:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!restaurantId) return;

    if (!form.name.trim()) {
      Alert.alert("Error", "Restaurant name is required");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("address", form.address);
      formData.append("phone", form.phone);
      formData.append("delivery_time", form.delivery_time);
      formData.append("delivery_fee", form.delivery_fee);

      if (newImage) {
        const filename = newImage.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("file", {
          uri: newImage,
          name: filename,
          type,
        } as any);
      }

      await updateRestaurant(Number(restaurantId), formData);
      Alert.alert("Success", "Restaurant updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update restaurant");
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
        <Text className="text-xl font-bold ml-4">Restaurant Settings</Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Image Picker */}
          <TouchableOpacity
            onPress={pickImage}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4"
          >
            {newImage || image ? (
              <View className="relative">
                <Image
                  source={{ uri: newImage || image! }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 bg-black/50 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="camera" size={16} color="white" />
                  <Text className="text-white ml-1 text-sm">Change</Text>
                </View>
              </View>
            ) : (
              <View className="h-48 items-center justify-center">
                <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-2">
                  <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-500">Add Restaurant Image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Restaurant Name *
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Enter restaurant name"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-h-[100px]"
            />
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Address</Text>
            <TextInput
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
              placeholder="Enter address"
              multiline
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Phone */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Phone</Text>
            <TextInput
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Delivery Time and Fee */}
          <View className="flex-row mb-6">
            <View className="flex-1 mr-2">
              <Text className="text-gray-700 font-medium mb-2">
                Delivery Time (min)
              </Text>
              <TextInput
                value={form.delivery_time}
                onChangeText={(text) =>
                  setForm({ ...form, delivery_time: text })
                }
                placeholder="e.g., 30"
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-700 font-medium mb-2">
                Delivery Fee (₹)
              </Text>
              <TextInput
                value={form.delivery_fee}
                onChangeText={(text) => setForm({ ...form, delivery_fee: text })}
                placeholder="e.g., 30"
                keyboardType="numeric"
                className="bg-white border border-gray-200 rounded-xl px-4 py-3"
              />
            </View>
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
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
