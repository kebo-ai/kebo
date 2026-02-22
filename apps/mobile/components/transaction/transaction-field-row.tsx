import React from "react";
import { View, TextInput, Image, StyleSheet } from "react-native";
import { PressableScale } from "pressto";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  interpolateColor,
  type SharedValue,
} from "react-native-reanimated";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";

interface TransactionFieldRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  shakeOffset?: SharedValue<number>;
  // Note variant
  isNote?: boolean;
  noteValue?: string;
  onNoteChange?: (text: string) => void;
  // Emoji / icon display
  emoji?: string;
  // Image URL (e.g. bank logo)
  imageUrl?: string;
  // Highlight animation
  highlightProgress?: SharedValue<number>;
  highlightScale?: SharedValue<number>;
}

export function TransactionFieldRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  shakeOffset,
  isNote = false,
  noteValue,
  onNoteChange,
  emoji,
  imageUrl,
  highlightProgress,
  highlightScale,
}: TransactionFieldRowProps) {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeOffset?.value ?? 0 },
      { scale: highlightScale?.value ?? 1 },
    ],
  }));

  const rowAnimatedStyle = useAnimatedStyle(() => {
    if (!highlightProgress) return {};
    const borderColor = interpolateColor(
      highlightProgress.value,
      [0, 1],
      [theme.border, colors.primary],
    );
    return { borderColor };
  });

  const content = (
    <Animated.View
      style={[
        styles.row,
        {
          borderColor: theme.border,
          backgroundColor: theme.surface,
        },
        rowAnimatedStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        {imageUrl ? (
          <Image
            source={{
              uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${imageUrl}`,
            }}
            style={styles.bankImage}
            resizeMode="contain"
          />
        ) : emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : (
          <Ionicons name={icon} size={20} color={theme.textSecondary} />
        )}
      </View>

      {isNote ? (
        <TextInput
          style={[
            styles.noteInput,
            {
              color: theme.textPrimary,
              fontFamily: "SFUIDisplayLight",
            },
          ]}
          placeholder={label}
          placeholderTextColor={theme.textTertiary}
          value={noteValue}
          onChangeText={onNoteChange}
          returnKeyType="done"
        />
      ) : (
        <View style={styles.labelContainer}>
          <Text
            type="default"
            weight="light"
            color={value ? theme.textPrimary : theme.textTertiary}
            numberOfLines={1}
          >
            {value || label}
          </Text>
        </View>
      )}

      {showChevron && !isNote && (
        <Ionicons name="chevron-forward" size={18} color={theme.chevron} />
      )}
    </Animated.View>
  );

  if (isNote) {
    return <Animated.View style={animatedStyle}>{content}</Animated.View>;
  }

  return (
    <Animated.View style={animatedStyle}>
      <PressableScale onPress={onPress} style={styles.pressable}>
        {content}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  iconContainer: {
    width: 28,
    alignItems: "center",
    marginRight: 10,
  },
  emoji: {
    fontSize: 18,
  },
  bankImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  labelContainer: {
    flex: 1,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
});
