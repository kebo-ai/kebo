import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { PressableScale } from "pressto";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import type { NumberEntryType } from "@/hooks/useNumberEntry";

interface AmountDisplayProps {
  entryType: NumberEntryType;
  amountInCents: number;
  // Mode 2 display info
  wholePart: number;
  decimalSuffix: string;
  onBackspace?: () => void;
  shakeOffset?: SharedValue<number>;
}

export function AmountDisplay({
  entryType,
  amountInCents,
  wholePart,
  decimalSuffix,
  onBackspace,
  shakeOffset,
}: AmountDisplayProps) {
  const { theme } = useTheme();
  const { getSymbolCurrency, decimalSeparator, thousandsSeparator } =
    useCurrencyFormatter();

  const formatted = useMemo(() => {
    const formatWhole = (n: number) =>
      n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

    if (entryType === 1) {
      const whole = Math.floor(amountInCents / 100);
      const dec = String(amountInCents % 100).padStart(2, "0");
      return `${getSymbolCurrency} ${formatWhole(whole)}${decimalSeparator}${dec}`;
    }

    // Mode 2: dynamic decimals — replace "." in suffix with user's separator
    const localSuffix = decimalSuffix.replace(".", decimalSeparator);
    return `${getSymbolCurrency} ${formatWhole(wholePart)}${localSuffix}`;
  }, [
    entryType,
    amountInCents,
    wholePart,
    decimalSuffix,
    getSymbolCurrency,
    decimalSeparator,
    thousandsSeparator,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset?.value ?? 0 }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.amountRow}>
        <Text
          style={[styles.amount, { color: theme.textPrimary }]}
          weight="light"
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatted}
        </Text>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  amountRow: {
    position: "relative",
    alignItems: "center",
    width: "100%",
  },
  backspaceHit: {
    position: "absolute",
    right: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    width: "100%",
    fontSize: 54,
    lineHeight: 62,
    textAlign: "center",
  },
});
