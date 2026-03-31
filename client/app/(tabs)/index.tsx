import { getAllCategories } from "@/api/appInfo/categories";
import Categories from "@/components/Home/Categories";
import Greet from "@/components/Home/Greet";
import Restaurants from "@/components/Home/Restaurants";
import SearchBar from "@/components/Home/SearchBar";
import TopBar from "@/components/Home/TopBar";
import { useUser } from "@/context/UserContext";
import { Categories as CategoriesType } from "@/types/app";
import { Redirect } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user, loading } = useUser();
  const [categories, setCategories] = useState<CategoriesType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
  const [search, setSearch] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect non-customer users to their respective dashboards
  if (!loading && user) {
    if (user.role === "admin") {
      return <Redirect href="/admin" />;
    }
    if (user.role === "owner") {
      return <Redirect href="/owner" />;
    }
    if (user.role === "delivery_person") {
      return <Redirect href="/delivery" />;
    }
  }

  const fetchCategories = async () => {
    try {
      const cat = await getAllCategories();
      setCategories([
        { id: "all", name: "All", img_url: "" } as CategoriesType,
        ...(cat || []),
      ]);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshKey((prev) => prev + 1);
    setRefreshing(false);
  };

  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return null;
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat?.name || null;
  }, [selectedCategory, categories]);

  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
            colors={["#f97316"]}
          />
        }
      >
        {/* Top bar */}
        <TopBar refreshKey={refreshKey} />

        {/* Greeting */}
        <Greet />

        {/* Search Bar */}
        <SearchBar search={search} setSearch={setSearch} />

        {/* Categories */}
        <Categories
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />

        {/* Restaurants */}
        <Restaurants
          selectedCategory={selectedCategory}
          categoryName={selectedCategoryName}
          search={search}
          refreshKey={refreshKey}
        />
      </ScrollView>
    </SafeAreaView>
  );
}