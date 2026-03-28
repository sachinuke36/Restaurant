import { Image, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AddToCartModal from "./AddToCartModal";

const MenuItems = ({ filteredItems, restaurantId }: { filteredItems: any; restaurantId: number }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const openModal = (item: any) => {
    setSelectedItem(item);
    setQuantity(1);
    setModalVisible(true);
  };

  return (
    <>
      <View className="px-5 mt-6 gap-4">
        {filteredItems.map((item: any) => (
          <View
            key={item.id}
            className="flex-row justify-between items-center bg-gray-100 p-3 rounded-xl"
          >
            <View className="flex-1">
              <Text className="font-bold text-lg">{item.name}</Text>
              <Text className="text-gray-600 mt-1">₹{item.price}</Text>
            </View>

            <View className="relative">
              <Image source={{ uri: item.image }} className="w-20 h-20 rounded-lg" />

              <TouchableOpacity
                onPress={() => openModal(item)}
                className="bg-amber-800 rounded-md flex-row items-center justify-center absolute bottom-0 left-2 w-[80%] py-1"
              >
                <Text className="text-white">Add </Text>
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* MODAL */}
      <AddToCartModal
        selectedItem={selectedItem}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        quantity={quantity}
        setQuantity={setQuantity}
        restaurantId={restaurantId}/>
    </>
  );
};

export default MenuItems;