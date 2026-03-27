import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const settingsItems = [
    { icon: "notifications-outline", label: "Notifications" },
    { icon: "lock-closed-outline", label: "Privacy" },
    { icon: "help-circle-outline", label: "Help & Support" },
    { icon: "information-circle-outline", label: "About" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white px-5" edges={["bottom"]}>
      <View className="mt-4">
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <Ionicons name={item.icon as any} size={24} color="#374151" />
            <Text className="flex-1 ml-4 text-lg">{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
