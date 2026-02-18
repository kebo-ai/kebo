import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function ChatbotLayout() {
  const { theme, colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: true,
        headerBlurEffect: theme.blurEffect,
        headerTitleStyle: {
          fontFamily: "SFUIDisplaySemiBold",
          color: theme.headerTitle,
        },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Kebo Wise" }} />
    </Stack>
  );
}
