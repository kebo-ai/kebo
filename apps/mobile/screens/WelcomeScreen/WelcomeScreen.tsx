import { View } from "react-native";
import { Text } from "@/components/ui";
import * as WebBrowser from "expo-web-browser";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { Screen } from "@/components/screen";
import AuthButtons from "@/components/auth-button";
import { translate } from "@/i18n";
import { ImageCustom } from "@/components/assets/Image";
import tw from "twrnc";
import { useTheme } from "@/hooks/use-theme";
import { useAnalytics } from "@/hooks/use-analytics";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

interface WelcomeScreenProps {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(
  function WelcomeScreen() {
    const { isDark, theme } = useTheme();
    const analytics = useAnalytics();

    useEffect(() => {
      analytics.trackWelcomeScreen();
      analytics.trackScreen("Welcome");
    }, [analytics]);

    return (
      <Screen
        safeAreaEdges={["top"]}
        preset="scroll"
        statusBarStyle={isDark ? "light" : "dark"}
        backgroundColor={theme.background}
      >
        <View style={tw`px-6`}>
          <View style={tw`mt-6`}>
            <ImageCustom
              icon={isDark ? "keboLogoHeaderDark" : "keboLogoHeader"}
              size={{ width: 130, height: 58 }}
            />
          </View>
          <View style={tw`mt-[111px]`}>
            <Text
              type="title"
              color={theme.textPrimary}
            >
              {translate("welcomeScreen:title")}
            </Text>
            <View style={tw`h-4`} />
            <Text
              style={tw`text-base`}
              weight="light"
              color={theme.textSecondary}
            >
              {translate("welcomeScreen:subtitle")}
            </Text>
          </View>
          <View style={tw`mt-[62px]`}>
            <AuthButtons />
          </View>
        </View>
      </Screen>
    );
  }
);
