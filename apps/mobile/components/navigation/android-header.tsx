import { Ionicons } from "@expo/vector-icons";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";

const HEADER_HEIGHT = 56;
// Material spec: 16dp breathing room from each screen edge.
const HORIZONTAL_PADDING = 16;

/**
 * JS-based header for Android.
 *
 * Why this exists instead of the native-stack toolbar or
 * `@react-navigation/elements`' `Header`:
 *
 * 1. The native `react-native-screens` toolbar does not reliably apply the
 *    top status-bar inset under edge-to-edge mode on every device / SDK
 *    level, so the system bar icons overlap the header content.
 * 2. `@react-navigation/elements`' `Header` fixes the top inset but lays
 *    out its right container with `marginEnd: insets.right` — which is 0
 *    in portrait on Android — so `headerRight` elements end up flush
 *    against the right screen edge, losing the 16dp Material breathing
 *    room.
 *
 * Rolling our own gives us explicit, Material-spec padding (16dp on each
 * side) plus guaranteed `insets.top` handling via `useSafeAreaInsets`.
 *
 * iOS is unaffected — this component is only wired in via the Android
 * branch of `theme/header-options.ts`; iOS keeps the native transparent
 * blurred stack header.
 */
export function AndroidHeader({
  options,
  route,
  back,
  navigation,
}: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const title =
    typeof options.headerTitle === "string"
      ? options.headerTitle
      : (options.title ?? route.name);

  const HeaderLeft = options.headerLeft;
  const HeaderRight = options.headerRight;
  const customHeaderTitle =
    typeof options.headerTitle === "function" ? options.headerTitle : null;

  const backgroundColor =
    (options.headerStyle as { backgroundColor?: string } | undefined)
      ?.backgroundColor ?? theme.background;

  const showShadow = options.headerShadowVisible !== false;

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor,
        borderBottomWidth: showShadow ? StyleSheet.hairlineWidth : 0,
        borderBottomColor: theme.border,
      }}
    >
      <View style={styles.row}>
        <View style={styles.side}>
          {HeaderLeft ? (
            <HeaderLeft canGoBack={Boolean(back)} tintColor={colors.primary} />
          ) : back ? (
            <Pressable
              onPress={navigation.goBack}
              hitSlop={12}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.titleWrapper}>
          {customHeaderTitle ? (
            customHeaderTitle({
              children: title,
              tintColor: theme.headerTitle,
            })
          ) : (
            <Text
              weight="semibold"
              color={theme.headerTitle}
              style={styles.titleText}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>
        <View style={[styles.side, styles.rightSide]}>
          {HeaderRight ? (
            <HeaderRight
              canGoBack={Boolean(back)}
              tintColor={colors.primary}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  side: {
    // Intrinsic width — empty side collapses to 0 so the title uses the
    // full remaining space.
    justifyContent: "center",
    alignItems: "flex-start",
  },
  rightSide: {
    alignItems: "flex-end",
  },
  backButton: {
    // Visually align the chevron's optical center at 16dp from the screen
    // edge, matching Material navigation icon placement.
    marginLeft: -6,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: "center",
    // Gap between title and side content (only takes effect when side
    // containers have content).
    paddingHorizontal: 4,
  },
  titleText: {
    fontSize: 18,
  },
});
