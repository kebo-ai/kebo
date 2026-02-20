import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { supabase } from "@/config/supabase";
import { useTheme } from "@/hooks/useTheme";
import { colors } from "@/theme/colors";
import logger from "@/utils/logger";

const AuthenticatedLayout = observer(function AuthenticatedLayout() {
  const { theme } = useTheme();
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
          backgroundColor: theme.background,
        },
        gestureEnabled: true,
        gestureDirection: "horizontal",
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="selection-sheet"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5],
        }}
      />
      <Stack.Screen
        name="category-picker"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.65, 0.9],
        }}
      />
      <Stack.Screen
        name="bank-picker"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 0.75],
        }}
      />
      <Stack.Screen
        name="transaction"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="edit-transaction/[transactionId]"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="new-category"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.75, 1.0],
        }}
      />
      <Stack.Screen
        name="reports-income"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
        }}
      />
      <Stack.Screen
        name="reports-category"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
        }}
      />
      <Stack.Screen
        name="webview"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
        }}
      />
      <Stack.Screen
        name="budget/[budgetId]"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
        }}
      />
      <Stack.Screen
        name="budget-detail/[budgetId]"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
        }}
      />
      <Stack.Screen
        name="budget/new"
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
        }}
      />
    </Stack>
  );
});

export default AuthenticatedLayout;
