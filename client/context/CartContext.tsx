import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCartDetails, addItemToCart, removeItemFromCart, clearCart } from "@/api/user/cart";
import { Cart } from "@/types/cart";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (menuItemId: number, restaurantId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (menuItemId: number, quantity: number) => Promise<boolean>;
  clearCartItems: () => Promise<boolean>;
  clearLocalCart: () => void;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartDetails();
      setCart(data.cart || null);
    } catch (error) {
      console.log("Error fetching cart:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItemId: number, restaurantId: number, quantity: number): Promise<boolean> => {
    // Optimistic update
    setCart((prevCart) => {
      if (!prevCart || prevCart.restaurant_id !== restaurantId) {
        // Will be replaced by server response
        return prevCart;
      }

      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.menu_item_id === menuItemId
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // New item - will be updated by server response
        return prevCart;
      }

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return { ...prevCart, items: newItems, total: newTotal };
    });

    // Sync with server in background
    try {
      const response = await addItemToCart({
        menu_item_id: menuItemId,
        restaurant_id: restaurantId,
        quantity,
      });
      if (response.cart) {
        setCart(response.cart);
      }
      return true;
    } catch (error) {
      console.log("Error adding to cart:", error);
      // Revert on error
      refetchCart();
      return false;
    }
  };

  const removeFromCart = async (menuItemId: number, quantity: number): Promise<boolean> => {
    if (!cart) return false;

    // Optimistic update
    const prevCart = cart;
    setCart((currentCart) => {
      if (!currentCart) return null;

      const existingItem = currentCart.items.find(
        (item) => item.menu_item_id === menuItemId
      );

      if (!existingItem) return currentCart;

      const newQuantity = existingItem.quantity - quantity;

      let newItems;
      if (newQuantity <= 0) {
        newItems = currentCart.items.filter(
          (item) => item.menu_item_id !== menuItemId
        );
      } else {
        newItems = currentCart.items.map((item) =>
          item.menu_item_id === menuItemId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      if (newItems.length === 0) {
        return null;
      }

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return { ...currentCart, items: newItems, total: newTotal };
    });

    // Sync with server in background
    try {
      const response = await removeItemFromCart({
        menu_item_id: menuItemId,
        restaurant_id: prevCart.restaurant_id,
        quantity,
      });
      if (response.cart) {
        setCart(response.cart);
      } else {
        setCart(null);
      }
      return true;
    } catch (error) {
      console.log("Error removing from cart:", error);
      // Revert on error
      setCart(prevCart);
      return false;
    }
  };

  const clearLocalCart = () => {
    setCart(null);
  };

  const clearCartItems = async (): Promise<boolean> => {
    try {
      await clearCart();
      setCart(null);
      return true;
    } catch (error) {
      console.log("Error clearing cart:", error);
      setCart(null); // Clear locally even if API fails
      return false;
    }
  };

  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    refetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        removeFromCart,
        clearCartItems,
        clearLocalCart,
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
