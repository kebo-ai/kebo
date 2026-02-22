import logger from "@/utils/logger";
import React, { useState, useEffect, useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardEvent,
  View,
} from "react-native";
import tw from "twrnc";
import { colors } from "@/theme";
import { useAnalytics } from "@/hooks/use-analytics";
import { useTheme } from "@/hooks/use-theme";

type CustomButtonProps = {
  variant?: "primary" | "secondary";
  isEnabled: boolean;
  onPress: () => void;
  title: string;
  adaptToKeyboard?: boolean;
  containerStyle?: any;
  analyticsEvent?: string;
  analyticsProperties?: Record<string, any>;
  enableAnalytics?: boolean;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "primary",
  isEnabled,
  onPress,
  title,
  adaptToKeyboard = false,
  containerStyle,
  analyticsEvent,
  analyticsProperties = {},
  enableAnalytics = false,
}) => {
  const analytics = useAnalytics();
  const { theme } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!adaptToKeyboard) return;

    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [adaptToKeyboard]);

  const buttonContainerStyle = useMemo(() => {
    if (!adaptToKeyboard) return containerStyle;

    const basePadding = { paddingBottom: Platform.OS === "ios" ? 30 : 20 };

    if (isKeyboardVisible) {
      const marginAboveKeyboard = 10;
      if (Platform.OS === "ios") {
        return {
          ...tw`px-6`,
          paddingBottom: marginAboveKeyboard,
          position: "absolute" as "absolute",
          bottom: keyboardHeight,
          left: 0,
          right: 0,
          backgroundColor: theme.background,
          paddingTop: 10,
          ...containerStyle,
        };
      } else {
        return {
          ...tw`px-6`,
          paddingBottom: marginAboveKeyboard + 10,
          backgroundColor: theme.background,
          ...containerStyle,
        };
      }
    }

    return {
      ...tw`px-6`,
      ...basePadding,
      ...containerStyle,
    };
  }, [isKeyboardVisible, keyboardHeight, adaptToKeyboard, containerStyle]);

  const handlePress = useMemo(() => {
    return () => {
      if (isEnabled) {
        if (enableAnalytics && analyticsEvent && analytics) {
          try {
            // const eventProperties = {
            //   screen_name: "CustomButton",
            //   action_type: "click",
            //   interaction_type: "button",
            //   button_title: title,
            //   button_variant: variant,
            //   ...analyticsProperties,
            // };
            // analytics.trackEvent(analyticsEvent, eventProperties);
            logger.debug(
              "Analytics tracked for button:",
              analyticsEvent
              // eventProperties
            );
          } catch (error) {
            logger.debug("Analytics error in CustomButton:", error);
          }
        }
        onPress();
      }
    };
  }, [
    isEnabled,
    enableAnalytics,
    analyticsEvent,
    analytics,
    title,
    variant,
    analyticsProperties,
    onPress,
  ]);

  const Button = (
    <TouchableOpacity
      style={[
        tw`h-[44px] gap-[3px] p-[4px] px-[10px] rounded-[40px] justify-center items-center`,
        variant === "primary" ? tw`bg-[${colors.primary}]` : styles.secondaryBg,
        !isEnabled && tw`opacity-50`,
      ]}
      onPress={handlePress}
      disabled={!isEnabled}
    >
      <Text
        style={tw`${
          variant === "primary" ? "text-white font-sfu700" : "text-primary"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (adaptToKeyboard) {
    return <View style={buttonContainerStyle}>{Button}</View>;
  }

  return Button;
};

const styles = StyleSheet.create({
  secondaryBg: {
    backgroundColor: "rgba(105, 52, 210, 0.05)",
  },
});

export default CustomButton;
