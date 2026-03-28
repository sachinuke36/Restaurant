import { View, Text, TextInput, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { register } from "@/api/auth";
import { saveToken } from "@/utils/tokenStorage";
import { router } from "expo-router";

const Auth = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      const data = await register({ name, email, password, phone: Number(phone) });
      console.log(data);

      if (!data.token) {
        throw new Error(data.message || "Registration failed. No token received.");
      }

      await saveToken(data.token);
      const successMessage = data.message || "Registration successful!";
      setMessage(successMessage);
      alert(successMessage);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error?.message || "Registration failed. Please try again.";
      setMessage(errorMessage);
      alert(errorMessage);
    }
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-lime-600">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top */}
        <View className="flex-row justify-between items-center px-6 pt-16">
          <Ionicons onPress={()=>router.back()} name="chevron-back" size={24} color="white" />
          <Text className="text-white">Need some help?</Text>
        </View>

        {/* Card */}
        <View className="flex-1 bg-white mt-10 rounded-t-[40px] px-8 pt-8">

          <Text className="text-3xl font-bold">Getting started</Text>
          <Text className="text-gray-400 mt-2">
            Create account to continue!
          </Text>

          {/* Name */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-4 mt-8">
            <Ionicons name="person-outline" size={20} color="gray" />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              className="ml-3 flex-1"
            />
          </View>

          {/* Email */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-4 mt-5">
            <Ionicons name="mail-outline" size={20} color="gray" />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              className="ml-3 flex-1"
            />
          </View>

          {/* Phone */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-4 mt-5">
            <Ionicons name="call-outline" size={20} color="gray" />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="ml-3 flex-1"
            />
          </View>

          {/* Password */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-4 mt-5">
            <Ionicons name="lock-closed-outline" size={20} color="gray" />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="ml-3 flex-1"
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>



          {/* Button */}
          <TouchableOpacity
            onPress={handleSignup}
            className="bg-amber-400 py-4 rounded-full mt-8 items-center"
          >
            <Text className="text-white font-semibold text-lg">
              SIGN UP
            </Text>
          </TouchableOpacity>

          {/* Bottom */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400">Already have an account? </Text>
            <Text onPress={()=>router.push('/(auth)/login')} className="text-amber-500 font-semibold">Sign in</Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Auth;