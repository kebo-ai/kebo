import React, { useState } from "react";
import { Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "../../theme";

interface CustomCheckboxProps {
  text: string;
  onChange?: (checked: boolean) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ text, onChange }) => {
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
    if (onChange) onChange(!isChecked);
  };

  return (
    <Pressable onPress={toggleCheckbox} style={tw`flex-row items-center`}>
      <MaterialIcons
        name={isChecked ? "check-box" : "check-box-outline-blank"}
        size={24}
        color={colors.primary}
      />
      <Text style={tw`ml-2 text-base`}>{text}</Text>
    </Pressable>
  );
};

export default CustomCheckbox;
