import React, { useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolateColor,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";

// fuse-home-tabs-transition-animation 🔽

interface TransactionTypeToggleProps {
  selected: string;
  onSelect: (type: string) => void;
  options: string[];
  activeIndex: Animated.SharedValue<number>;
  prevActiveIndex: Animated.SharedValue<number>;
}

const LABELS: Record<string, string> = {
  Expense: "homeScreen:expense",
  Income: "homeScreen:income",
  Transfer: "homeScreen:transfer",
};

const _sidePadding = 0;
const _gap = 0;
// Duration for indicator moves — snappy but noticeable
const _duration = 250;

export function TransactionTypeToggle({
  selected,
  onSelect,
  options,
  activeIndex,
  prevActiveIndex,
}: TransactionTypeToggleProps) {
  const { theme } = useTheme();

  // Measure each tab width and compute offsets dynamically
  const tabWidths = useSharedValue<number[]>(new Array(options.length).fill(0));
  const tabOffsets = useDerivedValue(() => {
    return tabWidths.value.reduce<number[]>((acc, _width, index) => {
      const previousX = index === 0 ? _sidePadding : acc[index - 1];
      const previousWidth = index === 0 ? 0 : tabWidths.value[index - 1];
      acc[index] = previousX + previousWidth + (index === 0 ? 0 : _gap);
      return acc;
    }, []);
  });

  const handleSelect = useCallback(
    (option: string, index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      prevActiveIndex.value = activeIndex.value;
      activeIndex.value = withTiming(index, { duration: _duration });
      setTimeout(() => {
        prevActiveIndex.value = index;
      }, 300);
      onSelect(option);
    },
    [onSelect, activeIndex, prevActiveIndex],
  );

  // Animated underline indicator — tracks active tab position and width
  const indicatorStyle = useAnimatedStyle(() => {
    const targetLeft = tabOffsets.value[Math.round(activeIndex.value)] ?? 0;
    const targetWidth = tabWidths.value[Math.round(activeIndex.value)] ?? 0;

    return {
      left: withTiming(targetLeft, { duration: _duration }),
      width: withTiming(targetWidth, { duration: _duration }),
      transform: [{ scaleX: 0.5 }],
    };
  });

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TabItem
          key={option}
          index={index}
          label={translate(LABELS[option] as any) || option}
          activeIndex={activeIndex}
          activeColor={theme.textPrimary}
          inactiveColor={theme.textTertiary}
          onPress={() => handleSelect(option, index)}
          onLayout={(width) => {
            tabWidths.modify((value) => {
              "worklet";
              value[index] = width;
              return value;
            });
          }}
        />
      ))}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: colors.primary },
          indicatorStyle,
        ]}
      />
    </View>
  );
}

// --- TabItem with color interpolation ---

interface TabItemProps {
  index: number;
  label: string;
  activeIndex: Animated.SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLayout: (width: number) => void;
}

function TabItem({
  index,
  label,
  activeIndex,
  activeColor,
  inactiveColor,
  onPress,
  onLayout,
}: TabItemProps) {
  // Three-point color interpolation: default → active → default
  const textStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        activeIndex.value,
        [index - 1, index, index + 1],
        [inactiveColor, activeColor, inactiveColor],
      ),
    };
  });

  return (
    <Pressable
      style={styles.option}
      onPress={onPress}
      onLayout={(e) => onLayout(e.nativeEvent.layout.width)}
    >
      <Animated.Text style={[styles.label, textStyle]} numberOfLines={1}>{label}</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "relative",
    paddingBottom: 8,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: "SFUIDisplayMedium",
    fontSize: 13,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    height: 2.5,
    borderRadius: 9999,
  },
});

// fuse-home-tabs-transition-animation 🔼
