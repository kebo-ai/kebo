import { Tabs, useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { HomeIconSvg } from "@/components/icons/HomeSvg";
import { BudgetIconSvg } from "@/components/icons/BudgetSvg";
import { PlusIconSvg } from "@/components/icons/PlusSvg";
import { ReportsIconSvg } from "@/components/icons/ReportsSvg";
import { ChatbotIconSvg } from "@/components/icons/ChatBotSvg";
import { translate } from "@/i18n";
import tw from "@/hooks/useTailwind";
import { useStores } from "@/models/helpers/useStores";
import { useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import React from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { registerAnalyticsService } from "@/navigators/navigationUtilities";
import logger from "@/utils/logger";
import { TransactionType } from "@/types/transaction";

interface RootStore {
  transactionModel: {
    resetForNewTransaction: (type: TransactionType) => void;
  };
}

export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();
  const { transactionModel } = useStores() as RootStore;
  const router = useRouter();
  const analytics = useAnalytics();
  const [currentTab, setCurrentTab] = React.useState<string>("home");

  const getTabBarHeight = () => {
    const baseHeight = 60;
    if (Platform.OS === "android") {
      return baseHeight + bottom + (bottom > 0 ? 5 : 10);
    }
    return baseHeight + bottom;
  };

  const getTabBarPaddingBottom = () => {
    if (Platform.OS === "android") {
      return bottom + (bottom > 0 ? 8 : 12);
    }
    return bottom + 8;
  };

  useEffect(() => {
    if (analytics) {
      registerAnalyticsService(analytics);
    }
  }, [analytics]);

  const isAnalyticsAvailable = React.useMemo(() => {
    return analytics && typeof analytics.trackTabClick === "function";
  }, [analytics]);

  const handleAddButtonPress = useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      logger.debug(
        "Add transaction button pressed, analytics available:",
        isAnalyticsAvailable
      );
    } catch (error) {
      logger.debug("Analytics error:", error);
    }

    router.push({
      pathname: "/(authenticated)/transaction",
      params: { transactionType: TransactionType.EXPENSE },
    });
  }, [router, transactionModel, analytics, isAnalyticsAvailable]);

  const handleTabPress = useCallback(
    (tabName: string) => {
      try {
        logger.debug(
          "Tab pressed:",
          tabName,
          "Current tab:",
          currentTab,
          "Analytics available:",
          isAnalyticsAvailable
        );
        if (currentTab !== tabName && isAnalyticsAvailable) {
          logger.debug(
            "Analytics tracked for tab switch:",
            currentTab,
            "->",
            tabName
          );
        }
        setCurrentTab(tabName);
      } catch (error) {
        logger.debug("Analytics error:", error);
      }
    },
    [analytics, currentTab, isAnalyticsAvailable]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: getTabBarHeight(),
          backgroundColor: colors.white,
          borderTopWidth: 0.33,
          borderTopColor: "rgba(0, 0, 0, 0.3)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          shadowColor: "rgba(0, 0, 0, 0.15)",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          paddingBottom: getTabBarPaddingBottom(),
          justifyContent: "center",
          alignItems: "center",
          elevation: Platform.OS === "android" ? 8 : 0,
          zIndex: Platform.OS === "android" ? 1000 : 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                tw`${focused ? "text-primary" : "text-gray"} text-[10px]`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {translate("navigator:home")}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={tw`items-center gap-1`}>
              <HomeIconSvg isPressed={focused} />
            </View>
          ),
          tabBarButton: (props) => {
            const { delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                delayLongPress={delayLongPress ?? undefined}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleTabPress("home");
                  props.onPress?.(e);
                }}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                tw`${focused ? "text-primary" : "text-gray"} text-[10px]`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {translate("navigator:budget")}
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <View style={tw`items-center gap-1`}>
              <BudgetIconSvg isPressed={focused} />
            </View>
          ),
          tabBarButton: (props) => {
            const { delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                delayLongPress={delayLongPress ?? undefined}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleTabPress("budgets");
                  props.onPress?.(e);
                }}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="transaction-button"
        options={{
          tabBarButton: () => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                }}
                onPress={handleAddButtonPress}
              >
                <PlusIconSvg width={24} height={24} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                tw`${focused ? "text-primary" : "text-gray"} text-[10px]`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {translate("navigator:chatbot")}
            </Text>
          ),
          tabBarIcon: ({ focused }) => <ChatbotIconSvg isPressed={focused} />,
          tabBarButton: (props) => {
            const { delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                delayLongPress={delayLongPress ?? undefined}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleTabPress("chatbot");
                  props.onPress?.(e);
                }}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={tw`${
                focused ? "text-primary" : "text-gray"
              } text-[10px] font-sfu700`}
            >
              {translate("navigator:reports")}
            </Text>
          ),
          tabBarIcon: ({ focused }) => <ReportsIconSvg isPressed={focused} />,
          tabBarButton: (props) => {
            const { delayLongPress, ...restProps } = props as any;
            return (
              <TouchableOpacity
                {...restProps}
                delayLongPress={delayLongPress ?? undefined}
                onPress={(e) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleTabPress("reports");
                  props.onPress?.(e);
                }}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
