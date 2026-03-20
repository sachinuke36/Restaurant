import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const WelcomePage = () => {
  return (
    <View>
      <View>
        <View><Text className='text-red-900'>Hi there!</Text></View>
        <Image className='w-2 h-2' source={
            require('../../assets/images/welcome.jpg')
        }/>
      </View>
    </View>
  )
}

export default WelcomePage

const styles = StyleSheet.create({})