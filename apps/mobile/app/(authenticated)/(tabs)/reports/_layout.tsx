import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { largeTitleHeader } from "@/theme/header-options";

export default function ReportsLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={largeTitleHeader(theme)}>
      <Stack.Screen name="index" options={{ title: "Reports" }} />
    </Stack>
  );
}
