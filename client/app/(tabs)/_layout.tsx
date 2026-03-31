import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user, loading } = useUser();

  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner";
  const isDeliveryPerson = user?.role === "delivery_person";
  const isCustomer = user?.role === "customer" || (!isAdmin && !isOwner && !isDeliveryPerson);

  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f97316",
        tabBarInactiveTintColor: "#9ca3af",

        tabBarStyle: {
          backgroundColor: "white",
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 10,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* Customer tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          href: !loading && isCustomer ? "/" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          href: !loading && isCustomer ? "/orders" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Profile tab - visible to all */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Delivery person tab */}
      <Tabs.Screen
        name="delivery"
        options={{
          title: "Deliveries",
          href: !loading && isDeliveryPerson ? "/delivery" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Owner tab */}
      <Tabs.Screen
        name="owner"
        options={{
          title: "My Restaurant",
          href: !loading && isOwner ? "/owner" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Admin tab */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          href: !loading && isAdmin ? "/admin" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}