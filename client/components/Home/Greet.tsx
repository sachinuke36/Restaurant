import { Text, View } from "react-native";
import React from "react";
import { getGreetings } from "@/utils/getGreetings";
import { useUser } from "@/context/UserContext";

const Greet = () => {
  const { user } = useUser();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <View className="mt-4">
      <Text className="text-lg text-gray-500">
        Hey {firstName},{" "}
        <Text className="font-bold text-gray-700">{getGreetings()}!</Text>
      </Text>
    </View>
  );
};

export default Greet;