import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  inputRef: React.RefObject<TextInput | null>;
}

const LoadingPulse = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[tw`h-3 w-3 bg-white rounded-sm`, animatedStyle]}
    />
  );
};

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  inputValue,
  setInputValue,
  inputRef,
}) => {
  const { theme } = useTheme();
  const [inputHeight, setInputHeight] = useState(40);
  const hasText = inputValue.trim().length > 0;

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  useEffect(() => {
    if (!inputValue) {
      setInputHeight(40);
    }
  }, [inputValue]);

  return (
    <View
      style={tw`px-4 pb-${Platform.OS === "ios" ? "3" : "3"} bg-[${theme.background}]`}
    >
      <View
        style={[
          tw`flex-row border border-[${theme.border}] rounded-3xl px-4 py-2 bg-[${theme.surface}]`,
          { alignItems: "flex-end" },
        ]}
      >
        <TextInput
          placeholder={translate("chatbotScreen:textInput")}
          placeholderTextColor={theme.textTertiary}
          value={inputValue}
          onChangeText={setInputValue}
          textAlignVertical="center"
          style={[
            tw`flex-1 text-base`,
            {
              fontFamily: "SFUIDisplayLight",
              height: Math.max(40, inputHeight),
              paddingVertical: 10,
              color: theme.textPrimary,
            },
          ]}
          multiline
          onContentSizeChange={(e) =>
            setInputHeight(e.nativeEvent.contentSize.height)
          }
          returnKeyType="done"
          onSubmitEditing={handleSend}
          editable={!isLoading}
          ref={inputRef}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!hasText || isLoading}
          style={tw`items-center justify-end pb-1`}
        >
          {isLoading ? (
            <View
              style={tw`h-8 w-8 rounded-full bg-[${colors.primary}] items-center justify-center`}
            >
              <LoadingPulse />
            </View>
          ) : (
            <View
              style={tw`h-8 w-8 rounded-full bg-[${hasText ? colors.primary : theme.border}] items-center justify-center`}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={hasText ? "#FFFFFF" : theme.textTertiary}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
