import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getEarnings } from "@/api/delivery";
import BackButton from "@/components/common/BackButton";
import { EarningsData } from "@/types/delivery";

type PeriodType = "today" | "week" | "month";

export default function Earnings() {
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    totalDeliveries: 0,
    dailyBreakdown: [],
    period: "today",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("today");

  const loadEarnings = async () => {
    try {
      const res = await getEarnings(period);
      setEarnings({
        totalEarnings: res.totalEarnings || 0,
        totalDeliveries: res.totalDeliveries || 0,
        dailyBreakdown: res.dailyBreakdown || [],
        period: res.period || period,
      });
    } catch (error) {
      console.log("Error loading earnings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadEarnings();
  }, [period]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEarnings();
  }, [period]);

  const PeriodButton = ({
    label,
    value,
  }: {
    label: string;
    value: PeriodType;
  }) => (
    <TouchableOpacity
      onPress={() => setPeriod(value)}
      className={`flex-1 py-3 rounded-xl mx-1 ${
        period === value ? "bg-orange-500" : "bg-white"
      }`}
    >
      <Text
        className={`text-center font-medium ${
          period === value ? "text-white" : "text-gray-600"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <BackButton />
        <Text className="text-xl font-bold ml-4 text-orange-500">Earnings</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Period Filter */}
        <View className="flex-row p-4">
          <PeriodButton label="Today" value="today" />
          <PeriodButton label="This Week" value="week" />
          <PeriodButton label="This Month" value="month" />
        </View>

        {/* Total Earnings Card */}
        <View className="mx-4 mb-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg">
          <View className="bg-orange-500 rounded-2xl p-6">
            <Text className="text-orange-100 text-lg">
              {period === "today"
                ? "Today's Earnings"
                : period === "week"
                ? "This Week's Earnings"
                : "This Month's Earnings"}
            </Text>
            <Text className="text-white text-4xl font-bold mt-2">
              Rs.{earnings.totalEarnings}
            </Text>
            <View className="flex-row items-center mt-4">
              <Ionicons name="bicycle" size={20} color="rgba(255,255,255,0.8)" />
              <Text className="text-orange-100 ml-2">
                {earnings.totalDeliveries} deliveries completed
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-4 mb-4">
          <View className="flex-1 bg-white p-4 rounded-xl mr-2 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mb-2">
              <Ionicons name="wallet" size={20} color="#22c55e" />
            </View>
            <Text className="text-gray-500 text-sm">Avg. per Delivery</Text>
            <Text className="text-xl font-bold mt-1">
              Rs.
              {earnings.totalDeliveries > 0
                ? Math.round(earnings.totalEarnings / earnings.totalDeliveries)
                : 0}
            </Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl ml-2 shadow-sm">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-2">
              <Ionicons name="cube" size={20} color="#3b82f6" />
            </View>
            <Text className="text-gray-500 text-sm">Total Deliveries</Text>
            <Text className="text-xl font-bold mt-1">{earnings.totalDeliveries}</Text>
          </View>
        </View>

        {/* Daily Breakdown */}
        {earnings.dailyBreakdown.length > 0 && (
          <View className="mx-4 mb-6">
            <Text className="text-lg font-bold mb-3">Daily Breakdown</Text>
            <View className="bg-white rounded-xl shadow-sm overflow-hidden">
              {earnings.dailyBreakdown.map((day, index) => (
                <View
                  key={day.date}
                  className={`flex-row justify-between items-center p-4 ${
                    index < earnings.dailyBreakdown.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <View>
                    <Text className="font-medium">{formatDate(day.date)}</Text>
                    <Text className="text-gray-500 text-sm">
                      {day.deliveries} deliveries
                    </Text>
                  </View>
                  <Text className="font-bold text-green-600 text-lg">
                    Rs.{day.earnings}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {earnings.totalDeliveries === 0 && (
          <View className="items-center mt-10">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons name="wallet-outline" size={40} color="#d1d5db" />
            </View>
            <Text className="text-gray-400 text-lg">No earnings yet</Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Complete deliveries to start earning!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
