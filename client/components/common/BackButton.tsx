import { TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

type BackButtonProps = {
  absolute?: boolean;
};

const BackButton = ({ absolute = false }: BackButtonProps) => {
  if (absolute) {
    return (
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
      >
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
    >
      <Ionicons name="arrow-back" size={22} color="#374151" />
    </TouchableOpacity>
  );
}

export default BackButton