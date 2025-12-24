import React from "react";
import { TouchableOpacity, Text } from "react-native";
import tw from "twrnc";

interface CustomButtonDisabledProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

const CustomButtonDisabled: React.FC<CustomButtonDisabledProps> = ({
  label,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={tw`mt-4 py-3 rounded-full ${disabled ? "bg-[rgba(105,52,210,0.05)]" : "bg-primary"}`}
    >
      <Text style={tw`text-center text-[#6934D2] font-medium`}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomButtonDisabled;