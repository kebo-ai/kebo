import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { translate, type TxKeyPath } from "@/i18n";
import { colors } from "@/theme/colors";

type IconSource = { default: number; selected: number };

// Route name -> icon assets + i18n label key. Uses the same PNGs that
// NativeTabs uses on iOS so both platforms stay visually in sync.
const TAB_CONFIG: Record<string, { icon: IconSource; labelKey: TxKeyPath }> = {
  home: {
    icon: {
      default: require("@/assets/tab-icons/home.png"),
      selected: require("@/assets/tab-icons/home-active.png"),
    },
    labelKey: "navigator:home",
  },
  budgets: {
    icon: {
      default: require("@/assets/tab-icons/budget.png"),
      selected: require("@/assets/tab-icons/budget-active.png"),
    },
    labelKey: "navigator:budget",
  },
  chatbot: {
    icon: {
      default: require("@/assets/tab-icons/chatbot.png"),
      selected: require("@/assets/tab-icons/chatbot-active.png"),
    },
    labelKey: "navigator:chatbot",
  },
  reports: {
    icon: {
      default: require("@/assets/tab-icons/reports.png"),
      selected: require("@/assets/tab-icons/reports-active.png"),
    },
    labelKey: "navigator:reports",
  },
  "transaction-button": {
    icon: {
      default: require("@/assets/tab-icons/plus.png"),
      selected: require("@/assets/tab-icons/plus-active.png"),
    },
    labelKey: "navigator:newTransaction",
  },
};

export function AndroidTabBar({ state, navigation }: BottomTabBarProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const inactiveColor = isDark ? theme.textSecondary : colors.textGray;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.navigationBar,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isFocused = state.index === index;
        const label = translate(config.labelKey);

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            android_ripple={{ borderless: true, color: colors.primaryBg }}
            style={styles.tab}
          >
            <Image
              source={isFocused ? config.icon.selected : config.icon.default}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text
              weight={isFocused ? "semibold" : "medium"}
              color={isFocused ? colors.primary : inactiveColor}
              style={styles.label}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  icon: {
    width: 26,
    height: 26,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
  },
});
