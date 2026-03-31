import { View, Text, TextInput, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { login, register } from "@/api/auth";
import { saveToken } from "@/utils/tokenStorage";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";

const Auth = () => {
  const { refetchUser } = useUser();
  const { refetchCart } = useCart();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    console.log({ email, password });
    try {
      const data = await login({ email, password });
      console.log(data);

      if (!data.token) {
        throw new Error(data.message || "Login failed. No token received.");
      }

      await saveToken(data.token);

      // Refetch user and cart data now that we have a valid token
      await Promise.all([refetchUser(), refetchCart()]);

      const successMessage = data.message || "Login successful!";
      setMessage(successMessage);
      alert(successMessage);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error?.message || "Login failed. Please try again.";
      setMessage(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
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

          <Text className="text-3xl font-bold">Welcome back!</Text>
          <Text className="text-gray-400 mt-2">
            Login to your account to continue!
          </Text>

          

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
            onPress={handleLogin}
            disabled={loading}
            className={`py-4 rounded-full mt-8 items-center ${loading ? 'bg-amber-300' : 'bg-amber-400'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                SIGN IN
              </Text>
            )}
          </TouchableOpacity>

          {/* Bottom */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400">Don't have an account? </Text>
            <Text onPress={()=>router.push('/(auth)/signup')} className="text-amber-500 font-semibold">Sign Up</Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Auth;