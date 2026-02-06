import { Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { Screen } from "@/components/Screen";
import AuthButtons from "@/components/AuthButton";
import { translate } from "@/i18n";
import { ImageCustom } from "@/components/assets/Image";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

interface WelcomeScreenProps {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(
  function WelcomeScreen() {
    const analytics = useAnalytics();

    useEffect(() => {
      analytics.trackWelcomeScreen();
      analytics.trackScreen("Welcome");
    }, [analytics]);

    return (
      <Screen safeAreaEdges={["top"]} preset="scroll" statusBarStyle={"dark"}>
        <View style={tw`px-6`}>
          <View style={tw`mt-6`}>
            <ImageCustom
              icon={"keboLogoHeader"}
              size={{ width: 130, height: 58 }}
            />
          </View>
          <View style={tw`mt-[111px]`}>
            <Text
              style={[
                tw`text-[32px] text-[${colors.secondary}]`,
                { fontFamily: "SFUIDisplayBold" },
              ]}
            >
              {translate("welcomeScreen:title")}
            </Text>
            <View style={tw`h-4`} />
            <Text
              style={[
                tw`text-base text-black`,
                { fontFamily: "SFUIDisplayLight" },
              ]}
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
