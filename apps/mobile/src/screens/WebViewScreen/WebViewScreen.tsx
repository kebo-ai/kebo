import logger from "../../utils/logger";
import React, { FC, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import { Screen } from "../../components";
import { AppStackScreenProps } from "../../navigators/AppNavigator";
import { observer } from "mobx-react-lite";
import tw from "twrnc";
import { BackBlackSvg } from "../../components/svg/BackBlackSvg";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "moti";
import { StatusBar, StatusBarProps, StatusBarStyle } from "expo-status-bar";
interface WebViewScreenProps extends AppStackScreenProps<"WebView"> {}

export const WebViewScreen: FC<WebViewScreenProps> = observer(
  function WebViewScreen({ navigation, route }) {
    const { url, title } = route.params;
    const [isLoading, setIsLoading] = useState(true);

    // Check if it's a WhatsApp URL
    const isWhatsApp = url.includes("wa.me");

    // If it's WhatsApp, redirect and go back
    React.useEffect(() => {
      if (isWhatsApp) {
        Linking.openURL(url);
        navigation.goBack();
      }
    }, [isWhatsApp, url]);

    const renderHeader = () => {
      return (
        <View style={tw`justify-between flex-row items-center`}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
          >
            <BackBlackSvg width={15} height={15} />
          </TouchableOpacity>

          <View style={tw`flex-1 items-center`}>
            <Text
              style={[
                tw`text-black text-lg text-center font-medium`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {}
            </Text>
          </View>
          <View style={tw`w-12`} />
        </View>
      );
    };

    if (isWhatsApp) {
      return null; // Don't render anything for WhatsApp as it will redirect
    }

    return (
      <>
        <SafeAreaView style={{ backgroundColor: "white" }}>
          <View
            style={{
              height: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
              backgroundColor: "white",
            }}
          />
          <StatusBar
            style={"dark"}
            backgroundColor={"transparent"}
            translucent={true}
          />
          {renderHeader()}
        </SafeAreaView>
        {isLoading && (
          <View
            style={tw`absolute inset-0 justify-center items-center bg-white z-10`}
          >
            <ActivityIndicator size="large" color="#6934D2" />
          </View>
        )}
        <WebView
          source={{ uri: url }}
          style={tw`flex-1 px-4`}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoadStart={() => {
            logger.debug("Loading URL:", url);
            setIsLoading(true);
          }}
          onLoadEnd={() => {
            logger.debug("Finished loading");
            setIsLoading(false);
          }}
          onError={(syntheticEvent) => {
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            setIsLoading(false);
          }}
        />
      </>
    );
  }
);
