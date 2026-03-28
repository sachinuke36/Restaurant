import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { SetStateAction } from 'react'
import { Categories } from '@/types/app';

const CategoriesComp = ({categories, selectedCategory, setSelectedCategory }:{categories: Categories[], selectedCategory: number | null, setSelectedCategory: React.Dispatch<SetStateAction<number | null>>}) => {
  return (
    <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4"
        >
          <View className="flex-row gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === Number(cat.id);

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(Number(cat.id))}
                  className={`px-4 py-2 rounded-full ${
                    isSelected ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      isSelected ? "text-white" : "text-black"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
  )
}

export default CategoriesComp

const styles = StyleSheet.create({})