import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { createRestaurant } from "@/api/admin";
import { router } from "expo-router";

export default function CreateRestaurant() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !address.trim() || !phone.trim() || !ownerId.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("address", address.trim());
      formData.append("description", description.trim());
      formData.append("phone", phone.trim());
      formData.append("owner_id", ownerId.trim());
      formData.append("file", {
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: image.fileName || "restaurant.jpg",
      } as any);

      const result = await createRestaurant(formData);

      if (result.error) {
        Alert.alert("Error", result.error);
      } else {
        Alert.alert("Success", "Restaurant created successfully");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create restaurant");
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
          {/* Image Picker */}
          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-48 bg-gray-100 rounded-2xl items-center justify-center mt-4"
          >
            {image ? (
              <Image
                source={{ uri: image.uri }}
                className="w-full h-full rounded-2xl"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-400 mt-2">Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name Input */}
          <Text className="text-gray-600 mt-6 mb-2">Restaurant Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. The Italian Kitchen"
            className="bg-gray-100 px-4 py-4 rounded-xl text-lg"
          />

          {/* Address Input */}
          <Text className="text-gray-600 mt-4 mb-2">Address *</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 123 Main Street, City"
            className="bg-gray-100 px-4 py-4 rounded-xl text-lg"
          />

          {/* Description Input */}
          <Text className="text-gray-600 mt-4 mb-2">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of the restaurant"
            multiline
            numberOfLines={3}
            className="bg-gray-100 px-4 py-4 rounded-xl text-lg"
            style={{ textAlignVertical: "top" }}
          />

          {/* Phone Input */}
          <Text className="text-gray-600 mt-4 mb-2">Phone *</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +1234567890"
            keyboardType="phone-pad"
            className="bg-gray-100 px-4 py-4 rounded-xl text-lg"
          />

          {/* Owner ID Input */}
          <Text className="text-gray-600 mt-4 mb-2">Owner ID *</Text>
          <TextInput
            value={ownerId}
            onChangeText={setOwnerId}
            placeholder="User ID of the restaurant owner"
            keyboardType="numeric"
            className="bg-gray-100 px-4 py-4 rounded-xl text-lg"
          />

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            className="bg-orange-500 py-4 rounded-xl mt-8 mb-8 items-center flex-row justify-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="add-circle" size={24} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Create Restaurant
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
