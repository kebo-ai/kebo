import { Platform, StyleSheet, type ViewStyle } from "react-native";
import type { UISize } from "./types";

// Only import SymbolView on iOS where SF Symbols are available
let SymbolView: any = null;
let SFSymbolType: any = null;
if (Platform.OS === "ios") {
  try {
    const symbols = require("expo-symbols");
    SymbolView = symbols.SymbolView;
    SFSymbolType = symbols.SFSymbol;
  } catch {}
}

// Re-export the SFSymbol type for consumers
export type { SFSymbol } from "expo-symbols";

interface IconProps {
  symbol: string;
  size?: UISize | number;
  color?: string;
  style?: ViewStyle;
  type?: "monochrome" | "hierarchical" | "palette" | "multicolor";
}

const sizeMap: Record<UISize, number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 30,
};

export function Icon({
  symbol,
  size = "md",
  color,
  style,
  type = "hierarchical",
}: IconProps) {
  if (Platform.OS !== "ios" || !SymbolView) {
    return null;
  }

  const iconSize = typeof size === "string" ? sizeMap[size] : size;

  return (
    <SymbolView
      name={symbol}
      style={[styles.symbol, { width: iconSize, height: iconSize }, style]}
      tintColor={color}
      type={type}
      resizeMode="scaleAspectFit"
    />
  );
}

const styles = StyleSheet.create({
  symbol: {
    width: 24,
    height: 24,
  },
});
