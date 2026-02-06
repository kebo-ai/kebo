import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { supabase } from "@/config/supabase";
import { colors } from "@/theme/colors";
import logger from "@/utils/logger";

const AuthenticatedLayout = observer(function AuthenticatedLayout() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) logger.error("Error getting session:", error);
      setToken(data.session?.access_token || null);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setToken(session?.access_token || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Still loading
  if (loading || token === undefined) {
    return null;
  }

  // Not authenticated, redirect to welcome
  if (!token) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: colors.white,
        },
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animationDuration: 200,
      }}
    />
  );
});

export default AuthenticatedLayout;
