if (__DEV__) {
  require("../ReactotronConfig");
}

import { Stack } from "expo-router";
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary";
import moment from "moment";

import "moment/locale/es";
import "moment/locale/fr";
import "moment/locale/pt";
import "moment/locale/it";
import "moment/locale/hi";

import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import Config from "@/config";
import { customFontsToLoad } from "@/theme";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { initI18n } from "@/i18n";
import { loadDateFnsLocale } from "@/utils/formatDate";
import CustomToast from "@/components/ui/CustomToast";
import Loader from "@/components/ui/CustomLoader";
import i18n from "@/i18n/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import * as Notifications from "expo-notifications";
import { postHogClient } from "@/services/PostHogClient";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/theme/colors";
import * as Haptics from "expo-haptics";
import { PressablesConfig } from "pressto";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  useNotifications();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await postHogClient.initialize();

        await initI18n();
        setIsI18nInitialized(true);

        const currentLocale = i18n.language.split("-")[0];
        if (moment.localeData(currentLocale)) {
          moment.locale(currentLocale);
        } else {
          moment.locale(i18n.language.split("-")[0]);
        }

        await loadDateFnsLocale();
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);

  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <PressablesConfig
            globalHandlers={{
              onPress: () => {
                Haptics.selectionAsync();
              },
            }}
            config={{ minScale: 0.97 }}
          >
            <StatusBar style="dark" backgroundColor="transparent" translucent />
            <Stack
              screenOptions={{
                headerShown: false,
                navigationBarColor: colors.white,
                contentStyle: {
                  backgroundColor: colors.white,
                },
                animation: "slide_from_right",
                gestureEnabled: true,
                gestureDirection: "horizontal",
                animationDuration: 200,
              }}
            />
            <CustomToast />
            <Loader />
          </PressablesConfig>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
