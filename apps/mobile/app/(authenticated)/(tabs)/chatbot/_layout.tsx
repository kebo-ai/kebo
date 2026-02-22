import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { standardHeader } from "@/theme/headerOptions";

export default function ChatbotLayout() {
  const { theme } = useTheme();

  return (
    <Stack screenOptions={standardHeader(theme)}>
      <Stack.Screen name="index" options={{ title: "Kebo Wise" }} />
    </Stack>
  );
}
