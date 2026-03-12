import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { largeTitleHeader } from "@/theme/header-options";
import { translate } from "@/i18n";

export default function BudgetsLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={largeTitleHeader(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: translate("navigator:budget"),
          headerBackTitle: translate("common:back"),
        }}
      />
    </Stack>
  );
}
