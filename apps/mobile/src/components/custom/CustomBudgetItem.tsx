import React from "react";
import { TouchableOpacity, Text, View, Image, TextInput } from "react-native";
import { observer } from "mobx-react-lite";
import tw from "twrnc";
import { ChevronRightIconSvg } from "../svg/RecurrenceSvg copy";
import { colors } from "../../theme/colors";
import { SvgUri } from "react-native-svg";

interface CustomBudgetItemProps {
  icon?: any;
  label: string;
  value?: string;
  onPress: () => void;
  iconSize?: number;
  iconColor?: string;
  showChevron?: boolean;
  inputValue?: string;
  setInputValue?: (value: string) => void;
  isImage?: boolean;
}

const CustomBudgetItem: React.FC<CustomBudgetItemProps> = observer(
  ({
    icon,
    label,
    onPress,
    value,
    showChevron = true,
    inputValue,
    setInputValue,
    isImage = false,
  }) => {
    const renderIcon = () => {
      if (!icon) return null;

      const iconUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}${icon}`;

      if (isImage) {
        return <Image source={{ uri: iconUrl }} style={tw`w-7 h-7`} />;
      }

      return <SvgUri width={28} height={28} uri={iconUrl || ""} />;
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        style={tw`flex-row items-center py-3 border-b border-gray-200`}
        activeOpacity={0.8}
      >
        {icon && (
          <View style={tw`mr-3 bg-[#6934D226] rounded-lg p-2`}>
            {renderIcon()}
          </View>
        )}

        <View style={tw`flex-1`}>
          <Text style={tw`text-[${colors.textGray}] text-base font-light`}>
            {label}
          </Text>
        </View>

        {setInputValue ? (
          <TextInput
            style={tw`bg-gray-100 text-gray-700 px-3 py-2 rounded-lg w-20 text-right`}
            keyboardType="numeric"
            placeholder="$0"
            value={inputValue}
            onChangeText={setInputValue}
          />
        ) : (
          <Text style={tw`text-gray-400 text-base text-right`}>{value}</Text>
        )}

        {showChevron && (
          <View style={tw`ml-3`}>
            <ChevronRightIconSvg width={14} height={14} />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

export default CustomBudgetItem;
