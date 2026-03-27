import React, { useState, useEffect } from "react";
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
import { updateRestaurant } from "@/api/admin";
import { getRestaurantFullInfo } from "@/api/appInfo/restaurants";
import { router, useLocalSearchParams } from "expo-router";

export default function EditRestaurant() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await getRestaurantFullInfo(id);
        if (data?.restaurant) {
          const r = data.restaurant;
          setName(r.name || "");
          setAddress(r.address || "");
          setDescription(r.description || "");
          setPhone(r.phone?.toString() || "");
          setOwnerId(r.owner_id?.toString() || "");
          setCurrentImageUrl(r.image_url || "");
        }
      } catch (error) {
        console.log("Error loading restaurant:", error);
        Alert.alert("Error", "Failed to load restaurant data");
      } finally {
        setFetching(false);
      }
    };
    loadRestaurant();
  }, [id]);

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

  const handleUpdate = async () => {
    if (!name.trim() || !address.trim() || !phone.trim() || !ownerId.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
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

      if (image) {
        formData.append("file", {
          uri: image.uri,
          type: image.mimeType || "image/jpeg",
          name: image.fileName || "restaurant.jpg",
        } as any);
      }

      const result = await updateRestaurant(parseInt(id), formData);

      if (result.error) {
        Alert.alert("Error", result.error);
      } else {
        Alert.alert("Success", "Restaurant updated successfully");
        router.back();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update restaurant");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

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
            className="w-full h-48 bg-gray-100 rounded-2xl items-center justify-center mt-4 overflow-hidden"
          >
            {image ? (
              <Image
                source={{ uri: image.uri }}
                className="w-full h-full rounded-2xl"
              />
            ) : currentImageUrl ? (
              <Image
                source={{ uri: currentImageUrl }}
                className="w-full h-full rounded-2xl"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-400 mt-2">Tap to change image</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-400 text-center mt-2 text-sm">
            Tap image to change
          </Text>

          {/* Name Input */}
          <Text className="text-gray-600 mt-4 mb-2">Restaurant Name *</Text>
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

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={loading}
            className="bg-orange-500 py-4 rounded-xl mt-8 mb-8 items-center flex-row justify-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="save" size={24} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Update Restaurant
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
