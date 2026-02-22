import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { supabase } from "@/config/supabase";
import { useTheme } from "@/hooks/use-theme";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import logger from "@/utils/logger";
import { translate } from "@/i18n";

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

  if (loading || token === undefined) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Shared native header style for screens using Stack.Screen options
  const nativeHeader = {
    headerShown: true,
    ...standardHeader(theme),
    headerBackTitle: translate("common:back"),
    headerStyle: { backgroundColor: theme.background },
    contentStyle: { backgroundColor: theme.background },
  };

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
      {/* ── Tabs ── */}
      <Stack.Screen name="(tabs)" />

      {/* ── Full-screen modals (own header + close button) ── */}
      <Stack.Screen
        name="transaction"
        options={{
          presentation: "card",
          animation: "slide_from_bottom",
          animationDuration: 80,
          gestureEnabled: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
      <Stack.Screen
        name="edit-transaction/[transactionId]"
        options={{
          presentation: "card",
          animation: "slide_from_bottom",
          animationDuration: 80,
          gestureEnabled: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />

      {/* ── Native sheets ── */}
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
        name="new-category"
        options={{
          presentation: "formSheet",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [1.0],
        }}
      />

      {/* ── Screens with native header (use Stack.Screen in component) ── */}
      <Stack.Screen name="accounts" options={nativeHeader} />
      <Stack.Screen name="edit-account/[accountId]" options={nativeHeader} />
      <Stack.Screen name="language" options={nativeHeader} />
      <Stack.Screen name="country" options={nativeHeader} />
      <Stack.Screen name="number-format" options={nativeHeader} />
      <Stack.Screen name="profile" options={nativeHeader} />
      <Stack.Screen name="banner-features" options={nativeHeader} />
      <Stack.Screen name="reports-income" options={nativeHeader} />
      <Stack.Screen name="reports-category" options={nativeHeader} />
      <Stack.Screen name="webview" options={nativeHeader} />
      <Stack.Screen name="budget/[budgetId]" options={nativeHeader} />
      <Stack.Screen name="budget-detail/[budgetId]" options={nativeHeader} />
      <Stack.Screen name="budget/new" options={nativeHeader} />

      <Stack.Screen name="select-bank" options={nativeHeader} />
      <Stack.Screen name="account-balance" options={nativeHeader} />
      <Stack.Screen name="select-bank-type/[bankId]" options={nativeHeader} />

      {/* ── Screens with custom headers (headerShown: false, registered for routing) ── */}
      <Stack.Screen
        name="transactions"
        options={{ contentStyle: { backgroundColor: theme.background } }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ contentStyle: { backgroundColor: theme.background } }}
      />
      <Stack.Screen
        name="create-budget-category/[budgetId]"
        options={{ contentStyle: { backgroundColor: theme.background } }}
      />
    </Stack>
  );
});

export default AuthenticatedLayout;
