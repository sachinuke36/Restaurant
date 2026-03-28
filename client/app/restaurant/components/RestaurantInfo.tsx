import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Restaurants } from '@/types/app'

const RestaurantInfo = ({restaurant}:{restaurant: Restaurants}) => {
  return (
    <View className="px-5 py-4">
          <Text className="text-2xl font-bold">{restaurant.name}</Text>

          <View className="flex-row items-center mt-1">
            <Ionicons name="star" size={16} color="orange" />
            <Text className="ml-1 text-gray-600">
              {restaurant.rating}
            </Text>
          </View>

          <Text className="text-gray-500 mt-1">
            {restaurant.address}
          </Text>
        </View>
  )
}

export default RestaurantInfo

const styles = StyleSheet.create({})