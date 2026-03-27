import { TextInput, View, TouchableOpacity } from "react-native";
import React, { SetStateAction } from "react";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  search: string;
  setSearch: React.Dispatch<SetStateAction<string>>;
}

const SearchBar = ({ search, setSearch }: SearchBarProps) => {
  return (
    <View className="mt-4">
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          placeholder="Search restaurants..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          className="ml-3 flex-1 text-base"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;