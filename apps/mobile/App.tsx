if (__DEV__) {
  require("./ReactotronConfig");
}
import { AppNavigator } from "./src/navigators";
import { ErrorBoundary } from "./src/screens/ErrorScreen/ErrorBoundary";
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
import Config from "./src/config";
import { customFontsToLoad } from "./src/theme";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { initI18n } from "./src/i18n";
import { loadDateFnsLocale } from "./src/utils/formatDate";
import CustomToast from "./src/components/ui/CustomToast";
import Loader from "./src/components/ui/CustomLoader";
import i18n from "./src/i18n/i18n";
import { useNotifications } from "./src/hooks/useNotifications";
import * as Notifications from "expo-notifications";
import { postHogClient } from "./src/services/PostHogClient";

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
