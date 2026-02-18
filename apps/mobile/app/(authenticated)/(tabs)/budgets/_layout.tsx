import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function BudgetsLayout() {
  const { theme, colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect: theme.blurEffect,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerLargeTitleStyle: {
          fontFamily: "SFUIDisplayBold",
          color: theme.headerTitle,
          fontSize: 20,
        },
        headerTitleStyle: {
          fontFamily: "SFUIDisplaySemiBold",
          color: theme.headerTitle,
        },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Budgets" }} />
    </Stack>
  );
}
