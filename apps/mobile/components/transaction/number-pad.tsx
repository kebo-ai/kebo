import React from "react";
import { View, StyleSheet } from "react-native";
import { PressableScale } from "pressto";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import type { NumberEntryType } from "@/hooks/use-number-entry";

interface NumberPadProps {
  entryType: NumberEntryType;
  decimalSeparator?: string;
  onDigit: (digit: number) => void;
  onBackspace: () => void;
  onDecimal: () => void;
  onSubmit: () => void;
}

export function NumberPad({
  entryType,
  decimalSeparator = ".",
  onDigit,
  onBackspace,
  onDecimal,
  onSubmit,
}: NumberPadProps) {
  const { theme } = useTheme();
  const keyboardHeight = useKeyboardHeight();

  const renderDigit = (digit: number) => (
    <PressableScale
      key={digit}
      style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
      onPress={() => onDigit(digit)}
    >
      <Text type="xl" weight="medium" color={theme.textPrimary}>
        {digit}
      </Text>
    </PressableScale>
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: keyboardHeight,
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.row}>
        {renderDigit(1)}
        {renderDigit(2)}
        {renderDigit(3)}
      </View>
      <View style={styles.row}>
        {renderDigit(4)}
        {renderDigit(5)}
        {renderDigit(6)}
      </View>
      <View style={styles.row}>
        {renderDigit(7)}
        {renderDigit(8)}
        {renderDigit(9)}
      </View>
      <View style={[styles.row, { marginBottom: 0 }]}>
        {entryType === 2 ? (
          <PressableScale
            style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
            onPress={onDecimal}
          >
            <Text
              style={styles.decimalText}
              weight="medium"
              color={theme.textPrimary}
            >
              {decimalSeparator}
            </Text>
          </PressableScale>
        ) : (
          <PressableScale
            style={[styles.button, { backgroundColor: theme.surfaceSecondary }]}
            onPress={onBackspace}
          >
            <Ionicons
              name="backspace-outline"
              size={24}
              color={theme.textPrimary}
            />
          </PressableScale>
        )}
        {renderDigit(0)}
        <View style={styles.actionGroup}>
          <PressableScale
            style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={onBackspace}
          >
            <Ionicons name="backspace-outline" size={24} color={theme.textPrimary} />
          </PressableScale>
          <PressableScale
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={onSubmit}
          >
            <Ionicons name="checkmark" size={26} color="#FFFFFF" />
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    paddingTop: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionGroup: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  decimalText: {
    fontSize: 28,
    lineHeight: 34,
  },
});
