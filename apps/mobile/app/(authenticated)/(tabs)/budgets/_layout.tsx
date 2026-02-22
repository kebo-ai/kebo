import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { largeTitleHeader } from "@/theme/headerOptions";

export default function BudgetsLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={largeTitleHeader(theme)}>
      <Stack.Screen name="index" options={{ title: "Budgets" }} />
    </Stack>
  );
}
