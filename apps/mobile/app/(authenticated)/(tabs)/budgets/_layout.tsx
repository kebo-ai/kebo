import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { largeTitleHeader } from "@/theme/header-options";

export default function BudgetsLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={largeTitleHeader(theme)}>
      <Stack.Screen name="index" options={{ title: "Budgets" }} />
    </Stack>
  );
}
