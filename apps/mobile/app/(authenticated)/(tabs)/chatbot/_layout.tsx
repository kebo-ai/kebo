import { Stack } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { standardHeader } from "@/theme/header-options";

export default function ChatbotLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={standardHeader(theme)}>
      <Stack.Screen name="index" options={{ title: "Kebo Wise" }} />
    </Stack>
  );
}
