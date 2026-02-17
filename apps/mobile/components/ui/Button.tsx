import * as Haptics from "expo-haptics";
import { PressableScale } from "pressto";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, type ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { Icon } from "./Icon";
import { Text } from "./Text";
import {
  type ButtonVariant,
  type ButtonColor,
  type UISize,
  type UIRadius,
  type ColorConfig,
  RADIUS_VALUES,
} from "./types";

function getColorMap(isDark: boolean): Record<ButtonColor, string> {
  return {
    primary: colors.primary,
    secondary: colors.gray,
    danger: "#EF4444",
    neutral: isDark ? "#FFFFFF" : colors.black,
  };
}

function getVariantConfig(
  color: ButtonColor,
  variant: ButtonVariant,
  isDark: boolean,
): ColorConfig {
  const colorMap = getColorMap(isDark);
  const baseColor = colorMap[color];

  switch (variant) {
    case "solid":
      return {
        backgroundColor: baseColor,
        borderColor: baseColor,
        textColor: "#FFFFFF",
        borderWidth: 1,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: baseColor,
        textColor: baseColor,
        borderWidth: 1,
      };
    case "soft":
      return {
        backgroundColor: `${baseColor}15`,
        borderColor: "transparent",
        textColor: baseColor,
        borderWidth: 0,
      };
    case "link":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: baseColor,
        borderWidth: 0,
      };
  }
}

interface ButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: Extract<UISize, "sm" | "md" | "lg">;
  radius?: UIRadius;
  style?: ViewStyle;
  symbol?: string;
  haptic?: boolean;
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "solid",
  color = "primary",
  size = "md",
  radius = "md",
  style,
  symbol,
  haptic = false,
}: ButtonProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    } else {
      spinValue.stopAnimation();
    }
  }, [loading, spinValue]);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const variantConfig = useMemo(
    () => getVariantConfig(color, variant, isDark),
    [color, variant, isDark],
  );

  const isDisabled = disabled || loading;

  const buttonStyles = useMemo(() => {
    const baseStyles: ViewStyle = {
      ...styles.button,
      ...SIZE_STYLES[size],
      backgroundColor: variantConfig.backgroundColor,
      borderColor: variantConfig.borderColor,
      borderWidth: variantConfig.borderWidth,
      borderRadius: RADIUS_VALUES[radius],
      opacity: isDisabled ? 0.5 : 1,
    };
    return [baseStyles, style];
  }, [size, variantConfig, style, radius, isDisabled]);

  const displayIcon = loading ? "arrow.2.circlepath" : symbol;

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <PressableScale
      style={buttonStyles}
      onPress={handlePress}
    >
      {displayIcon &&
        (loading ? (
          <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
            <Icon
              symbol={displayIcon}
              size={ICON_SIZE_MAP[size]}
              color={variantConfig.textColor}
            />
          </Animated.View>
        ) : (
          <Icon
            symbol={displayIcon}
            size={ICON_SIZE_MAP[size]}
            color={variantConfig.textColor}
          />
        ))}
      {title && (
        <Text
          weight="semibold"
          style={[TEXT_SIZE_STYLES[size], { color: variantConfig.textColor }]}
        >
          {title}
        </Text>
      )}
    </PressableScale>
  );
}

const ICON_SIZE_MAP: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  },
  sm: { height: 36 },
  md: { height: 48 },
  lg: { height: 56 },
});

const SIZE_STYLES = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

const TEXT_SIZE_STYLES = StyleSheet.create({
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
});
