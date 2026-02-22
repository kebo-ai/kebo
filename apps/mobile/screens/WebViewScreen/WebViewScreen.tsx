import logger from "@/utils/logger";
import React, { FC, useState } from "react";
import {
  View,
  ActivityIndicator,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import tw from "twrnc";
import { useTheme } from "@/hooks/useTheme";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/headerOptions";
import { translate } from "@/i18n";

interface WebViewScreenProps {}

const DARK_MODE_CSS = `
  @media (prefers-color-scheme: dark) {
    html, body {
      background-color: #000 !important;
      color: #e0e0e0 !important;
    }
  }
`;

const FORCE_DARK_JS = `
  (function() {
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    meta.content = 'SCHEME';

    var style = document.createElement('style');
    style.textContent = \`${DARK_MODE_CSS}\`;
    document.head.appendChild(style);
  })();
  true;
`;

export const WebViewScreen: FC<WebViewScreenProps> = observer(
  function WebViewScreen() {
    const router = useRouter();
    const { isDark, theme } = useTheme();
    const params = useLocalSearchParams<{ url: string; title: string }>();
    const url = params.url || "";
    const title = params.title || "";
    const [isLoading, setIsLoading] = useState(true);

    const isWhatsApp = url.includes("wa.me");

    React.useEffect(() => {
      if (isWhatsApp) {
        Linking.openURL(url);
        router.back();
      }
    }, [isWhatsApp, url]);

    if (isWhatsApp) {
      return null;
    }

    const injectedJS = FORCE_DARK_JS.replace(
      "SCHEME",
      isDark ? "dark" : "light"
    );

    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack.Screen
          options={{
            ...standardHeader(theme),
            headerShown: true,
            title,
            headerBackTitle: translate("navigator:reports"),
          }}
        />
        {isLoading && (
          <View
            style={[
              tw`absolute inset-0 justify-center items-center z-10`,
              { backgroundColor: theme.background },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <WebView
          source={{ uri: url }}
          style={{ flex: 1, backgroundColor: theme.background }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          injectedJavaScript={injectedJS}
          forceDarkOn={isDark}
          onLoadStart={() => {
            logger.debug("Loading URL:", url);
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            logger.debug("Finished loading");
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
          }}
          onHttpError={() => {
            setIsLoading(false);
          }}
        />
      </View>
    );
  }
);
