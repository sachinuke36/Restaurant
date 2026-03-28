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
import { addMenuItem, getCategories } from "@/api/owner/restaurant";
import BackButton from "@/components/common/BackButton";

type Category = {
  id: number;
  name: string;
};

export default function AddMenuItemScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.categories || []);
    } catch (error) {
      console.log("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!restaurantId) return;

    if (!form.name.trim()) {
      Alert.alert("Error", "Please enter item name");
      return;
    }
    if (!form.price.trim() || isNaN(Number(form.price))) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }
    if (!form.category_id) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category_id", form.category_id);

      if (image) {
        const filename = image.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        formData.append("file", {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      await addMenuItem(Number(restaurantId), formData);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add menu item");
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
        <Text className="text-xl font-bold ml-4">Add Menu Item</Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Image Picker */}
          <TouchableOpacity
            onPress={pickImage}
            className="bg-white border border-gray-200 rounded-xl p-4 items-center mb-4"
          >
            {image ? (
              <View className="relative">
                <Image
                  source={{ uri: image }}
                  className="w-32 h-32 rounded-xl"
                />
                <TouchableOpacity
                  onPress={() => setImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="bg-gray-100 w-20 h-20 rounded-full items-center justify-center mb-2">
                  <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                </View>
                <Text className="text-gray-500">Add Image</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Item Name *</Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Enter item name"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Enter description (optional)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 min-h-[100px]"
            />
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Price (₹) *</Text>
            <TextInput
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
              placeholder="Enter price"
              keyboardType="numeric"
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            />
          </View>

          {/* Category */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Category *</Text>
            <View className="flex-row flex-wrap">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() =>
                    setForm({ ...form, category_id: cat.id.toString() })
                  }
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                    form.category_id === cat.id.toString()
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={
                      form.category_id === cat.id.toString()
                        ? "text-white font-medium"
                        : "text-gray-700"
                    }
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {categories.length === 0 && (
              <Text className="text-gray-400 text-sm">
                No categories available. Please contact admin.
              </Text>
            )}
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
              Add Menu Item
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
