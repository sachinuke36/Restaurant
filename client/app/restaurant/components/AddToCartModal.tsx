import { Image, Modal, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { SetStateAction, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useCart } from '@/context/CartContext'

const AddToCartModal = ({
    modalVisible,
    selectedItem,
    setQuantity,
    quantity,
    setModalVisible,
    restaurantId
}:{
    modalVisible: boolean,
    selectedItem: any,
    setQuantity: React.Dispatch<SetStateAction<number>>,
    quantity: number,
    setModalVisible: React.Dispatch<SetStateAction<boolean>>,
    restaurantId: number
}) => {
  const { addToCart, cart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedItem) return;

    setAdding(true);
    const success = await addToCart(selectedItem.id, restaurantId, quantity);
    setAdding(false);

    if (success) {
      setModalVisible(false);
    }
  };

  // Check if adding from a different restaurant
  const isDifferentRestaurant = cart && cart.restaurant_id !== restaurantId && cart.items.length > 0;

  return (
    <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">

            {selectedItem && (
              <>
                <Image
                  source={{ uri: selectedItem.image }}
                  className="w-full h-40 rounded-xl"
                />

                <Text className="text-xl font-bold mt-4">
                  {selectedItem.name}
                </Text>

                <Text className="text-gray-600 mt-1">
                  ₹{selectedItem.price}
                </Text>

                {/* Quantity */}
                <View className="flex-row items-center justify-between mt-6">
                  <Text className="text-lg font-semibold">Quantity</Text>

                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Ionicons name="remove-circle" size={28} color="black" />
                    </TouchableOpacity>

                    <Text className="text-lg">{quantity}</Text>

                    <TouchableOpacity
                      onPress={() => setQuantity(quantity + 1)}
                    >
                      <Ionicons name="add-circle" size={28} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Different Restaurant Warning */}
                {isDifferentRestaurant && (
                  <View className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-4">
                    <Text className="text-orange-800 text-sm">
                      Your cart contains items from {cart.restaurant_name}. Adding this item will clear your current cart.
                    </Text>
                  </View>
                )}

                {/* Add To Cart */}
                <TouchableOpacity
                  className="bg-orange-500 py-3 rounded-xl mt-6 flex-row items-center justify-center"
                  onPress={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      {isDifferentRestaurant ? "Clear Cart & Add" : `Add ${quantity} to Cart`} • ₹{selectedItem.price * quantity}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Close */}
                <TouchableOpacity
                  className="mt-3"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-center text-gray-500">Cancel</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
  )
}

export default AddToCartModal