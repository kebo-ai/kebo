import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { colors } from "@/theme";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

const FilterButton = ({
    icon,
    label,
    selectedCount = 0,
    onPress,
    isActive = false,
    style = "",
    onClear,
  }: {
    icon: React.ReactNode;
    label: string;
    selectedCount?: number;
    onPress: () => void;
    isActive?: boolean;
    style?: string;
    onClear?: (() => void) | undefined;
  }) => (
    <TouchableOpacity
      style={tw`
        flex-1 flex-row items-center justify-between px-2 py-0.5 bg-white rounded-lg
        ${isActive ? `border-2 border-[${colors.primary}]` : "border border-[#E5E5EA]"}
        ${style}
      `}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View>{icon}</View>
      <Text style={tw`flex-1 text-center text-xs text-black`}>{label}</Text>
      {onClear && selectedCount > 0 ? (
        <TouchableOpacity onPress={onClear} style={tw`ml-2`} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Ionicons name="close" size={16} color={colors.primary} />
        </TouchableOpacity>
      ) : selectedCount > 0 ? (
        <View style={tw`bg-[${colors.primary}] rounded-full px-2 py-0.5 ml-2 min-w-[18px] min-h-[18px] items-center justify-center`}>
          <Text style={tw`text-white text-xs`}>{selectedCount}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-down" size={16} color={colors.primary} style={tw`ml-2`} />
      )}
    </TouchableOpacity>
  );

export default FilterButton;