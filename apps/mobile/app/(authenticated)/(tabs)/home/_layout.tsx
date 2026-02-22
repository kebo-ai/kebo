import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { largeTitleHeader } from "@/theme/header-options";

export default function HomeLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={largeTitleHeader(theme)}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
