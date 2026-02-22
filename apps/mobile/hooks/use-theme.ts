import { useColorScheme } from "react-native";
import { colors } from "@/theme/colors";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  return { isDark, theme: isDark ? colors.dark : colors.light, colors };
}
