import { type ReactNode } from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  useColorScheme,
} from "react-native";
import { colors } from "@/theme/colors";

export type TextType =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "xl"
  | "2xl"
  | "title"
  | "subtitle"
  | "body"
  | "caption";

export type TextWeight =
  | "light"
  | "normal"
  | "medium"
  | "semibold"
  | "bold";

const FONT_FAMILY_MAP: Record<TextWeight, string> = {
  light: "SFUIDisplayLight",
  normal: "SFUIDisplayRegular",
  medium: "SFUIDisplayMedium",
  semibold: "SFUIDisplaySemiBold",
  bold: "SFUIDisplayBold",
};

export type TextProps = RNTextProps & {
  children?: ReactNode;
  type?: TextType;
  weight?: TextWeight;
  color?: string;
};

export function Text({
  style,
  type = "default",
  weight,
  color,
  ...rest
}: TextProps) {
  const colorScheme = useColorScheme();
  const textColor = color ?? (colorScheme === "dark" ? "#FFFFFF" : colors.black);
  const sizeStyle = sizeStyles[type];
  const fontFamilyStyle = weight
    ? { fontFamily: FONT_FAMILY_MAP[weight] }
    : undefined;

  return (
    <RNText
      style={[{ color: textColor }, sizeStyle, fontFamilyStyle, style]}
      {...rest}
    />
  );
}

const sizeStyles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  title: { fontSize: 32, lineHeight: 38, fontFamily: "SFUIDisplayBold" },
  subtitle: { fontSize: 20, lineHeight: 28, fontFamily: "SFUIDisplaySemiBold" },
  body: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
});
