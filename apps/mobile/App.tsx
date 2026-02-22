if (__DEV__) {
  require("./ReactotronConfig");
}
import { AppNavigator } from "@/navigators";
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
import { loadDateFnsLocale } from "@/utils/format-date";
import CustomToast from "@/components/ui/CustomToast";
import Loader from "@/components/ui/CustomLoader";
import i18n from "@/i18n/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import * as Notifications from "expo-notifications";
import { postHogClient } from "@/services/PostHogClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
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
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null;
  }
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppNavigator />
        <CustomToast />
        <Loader />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
