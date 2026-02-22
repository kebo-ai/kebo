import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";
import { useTheme } from "@/hooks/use-theme";
import logger from "@/utils/logger";

export default function AuthLayout() {
  const { theme } = useTheme();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setToken(session?.access_token ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (token) {
    return <Redirect href="/(authenticated)/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: theme.background,
        },
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    />
  );
}
