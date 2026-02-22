if (__DEV__) {
  require("../ReactotronConfig");
}

import { Stack } from "expo-router";
import { ErrorBoundary } from "@/screens/error-screen/error-boundary";
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
import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import tw from "twrnc";
import { useDeviceContext } from "twrnc";
import { initI18n } from "@/i18n";
import { loadDateFnsLocale } from "@/utils/format-date";
import CustomToast from "@/components/ui/custom-toast";
import Loader from "@/components/ui/custom-loader";
import i18n from "@/i18n/i18n";
import { useNotifications } from "@/hooks/use-notifications";
import * as Notifications from "expo-notifications";
import { postHogClient } from "@/services/post-hog-client";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/theme/colors";
import * as Haptics from "expo-haptics";
import { PressablesConfig } from "pressto";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useDeviceContext(tw);
  const colorScheme = useColorScheme();
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

  const navigationTheme = colorScheme === "dark"
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.dark.background,
          card: colors.dark.navigationBar,
        },
      }
    : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <KeyboardProvider>
              <PressablesConfig
                globalHandlers={{
                  onPress: () => {
                    Haptics.selectionAsync();
                  },
                }}
                config={{ minScale: 0.97 }}
              >
                <StatusBar style={colorScheme === "dark" ? "light" : "dark"} backgroundColor="transparent" translucent />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    navigationBarColor: colorScheme === "dark" ? colors.dark.navigationBar : colors.white,
                    contentStyle: {
                      backgroundColor: colorScheme === "dark" ? colors.dark.background : colors.white,
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
            </KeyboardProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
