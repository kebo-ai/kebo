import { Platform } from "react-native";
import { colors } from "./colors";

type Theme = typeof colors.light | typeof colors.dark;

/**
 * Standard header (no large title).
 * iOS: transparent with blur effect.
 * Android: solid background.
 */
export function standardHeader(theme: Theme) {
  return {
    headerTintColor: colors.primary,
    headerTitleStyle: {
      fontFamily: "SFUIDisplaySemiBold",
      color: theme.headerTitle,
    },
    ...Platform.select({
      ios: {
        headerTransparent: true,
        headerBlurEffect: theme.blurEffect,
      },
      default: {
        headerStyle: { backgroundColor: theme.background },
      },
    }),
  };
}

/**
 * Large title header for tab roots and detail screens.
 * iOS: collapsible large title with transparent blur.
 * Android: standard header with solid background.
 */
export function largeTitleHeader(theme: Theme) {
  return {
    ...standardHeader(theme),
    ...Platform.select({
      ios: {
        headerLargeTitle: true,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerLargeTitleStyle: {
          fontFamily: "SFUIDisplayBold",
          color: theme.headerTitle,
          fontSize: 20,
        },
      },
      default: {},
    }),
  };
}
