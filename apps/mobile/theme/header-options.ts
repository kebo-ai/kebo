import { Platform } from "react-native";
import { AndroidHeader } from "@/components/navigation/android-header";
import { colors } from "./colors";

type Theme = typeof colors.light | typeof colors.dark;

/**
 * Standard header (no large title).
 * iOS: transparent with blur effect (native stack header).
 * Android: JS header via `@react-navigation/elements` — bypasses the
 *   native-stack toolbar's inconsistent top-inset handling in edge-to-edge
 *   mode so the system status bar icons never overlap the header content.
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
        header: AndroidHeader,
        headerStyle: { backgroundColor: theme.background },
        headerShadowVisible: false,
      },
    }),
  };
}

/**
 * Large title header for tab roots and detail screens.
 * iOS: collapsible large title with transparent blur.
 * Android: standard JS header with solid background (no large title — that
 *   is iOS-only).
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
