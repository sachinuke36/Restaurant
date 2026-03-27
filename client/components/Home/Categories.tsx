import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import React, { SetStateAction } from "react";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Categories as CategoryType } from "@/types/app";

interface CategoriesProps {
  categories: CategoryType[];
  setSelectedCategory: React.Dispatch<SetStateAction<string | number>>;
  selectedCategory: string | number;
}

const Categories = ({
  categories,
  setSelectedCategory,
  selectedCategory,
}: CategoriesProps) => {
  return (
    <View className="mt-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-700 font-semibold">Categories</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-orange-500 mr-1">See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <View className="flex-row gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`flex-row items-center gap-2 px-3 py-2 rounded-full  ${isSelected ? "bg-orange-500" : "bg-white"
                  }`}

              >
                {cat.img_url ? (
                  <Image
                    source={{ uri: cat.img_url }}
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                ) : (
                  <View
                    className={`items-center justify-center ${isSelected ? "bg-orange-400" : "bg-white"
                      }`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                    }}
                  >
                    <Ionicons
                      name="apps-outline"
                      size={18}
                      color={isSelected ? "white" : "#6b7280"}
                    />
                  </View>
                )}

                <Text
                  className={`font-medium ${isSelected ? "text-white" : "text-gray-700"
                    }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Categories;