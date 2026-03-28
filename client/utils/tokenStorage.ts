import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

// Check if SecureStore is available (not available on some Android emulators)
const isSecureStoreAvailable = async (): Promise<boolean> => {
  try {
    await SecureStore.getItemAsync("__test__");
    return true;
  } catch {
    return false;
  }
};

export const saveToken = async (token: string) => {
  try {
    if (Platform.OS === "web" || !(await isSecureStoreAvailable())) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    console.log("Token saved successfully");
  } catch (error) {
    console.log("Error saving token to SecureStore, using AsyncStorage:", error);
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web" || !(await isSecureStoreAvailable())) {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.log("Error getting token from SecureStore, trying AsyncStorage:", error);
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
};

export const deleteToken = async () => {
  try {
    if (Platform.OS === "web" || !(await isSecureStoreAvailable())) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    // Also clear from AsyncStorage as fallback
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.log("Error deleting token:", error);
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};