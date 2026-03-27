import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const BackButton = () => {
  return (
     <SafeAreaView className="absolute top-0 left-0 right-0">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="m-4 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
                >
                  <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
              </SafeAreaView>
  )
}

export default BackButton

const styles = StyleSheet.create({})