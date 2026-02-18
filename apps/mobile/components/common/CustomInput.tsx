import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import tw from "@/hooks/useTailwind";
import { useTheme } from "@/hooks/useTheme";

interface CustomInputProps extends TextInputProps {
  label: string;
  type?: "text" | "numeric" | "email" | "password" | "date";
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  type = "text",
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(type === "password");
  const { theme } = useTheme();

  return (
    <View style={tw`mb-4 w-full`}>
      <Text style={[tw`text-sm font-light mb-1`, { color: theme.textTertiary }]}>{label}</Text>
      <View
        style={tw`flex-row items-center border border-[${theme.border}] bg-[${theme.surface}] rounded-xl px-4`}
      >
        <TextInput
          style={[tw`flex-1 h-14`, { color: theme.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={isSecure}
          keyboardType={
            type === "email"
              ? "email-address"
              : type === "numeric"
              ? "numeric"
              : type === "date"
              ? "numeric"
              : "default"
          }
          autoCapitalize={type === "email" ? "none" : "sentences"}
          {...props}
        />
        {type === "password" && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
            {isSecure ? (
              <></>
            ) : (
              //   <EyeOff size={20} color="#7E22CE" />
              //   <Eye size={20} color="#7E22CE" />
              <></>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
