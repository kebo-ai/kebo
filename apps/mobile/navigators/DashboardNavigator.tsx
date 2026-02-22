import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useNavigation } from "@react-navigation/native";
import {
  Text,
  TouchableOpacity,
  View,
  GestureResponderEvent,
  Keyboard,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppStackParamList, AppStackScreenProps } from "@/navigators/AppNavigator";
import { TransactionType } from "@/types/transaction";
import { BudgetsScreen } from "@/screens/budgets-screen/budgets-screen";
import { HomeScreen } from "@/screens/home-screen/home-screen";
import { ReportsScreen } from "@/screens/reports-screen/reports-screen";
import { ChatbotScreen } from "@/screens/chatbot-screen/chatbot-screen";
import { colors } from "@/theme/colors";
import { HomeIconSvg } from "@/components/icons/home-svg";
import { BudgetIconSvg } from "@/components/icons/budget-svg";
import { PlusIconSvg } from "@/components/icons/plus-svg";
import { ReportsIconSvg } from "@/components/icons/reports-svg";
import { translate } from "@/i18n";
import { ChatbotIconSvg } from "@/components/icons/chat-bot-svg";
import tw from "@/hooks/use-tailwind";
import { TransactionScreen } from "@/screens/transaction-screen/transaction-screen";
import { useStores } from "@/models/helpers/use-stores";
import { useCallback, useEffect } from "react";
import * as Haptics from "expo-haptics";
import React from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { registerAnalyticsService } from "@/navigators/navigationUtilities";
import logger from "@/utils/logger";

export type DashboardTabParamList = {
  Home: undefined;
  Budgets: undefined;
  Transaction: {
    transactionType?: "Expense" | "Income" | "Transfer";
  };
  Chatbot: {
    initialQuestion?: string;
  };
  Reports: undefined;
  NewCategoy: undefined;
  Profile: undefined;
};

export type DemoTabScreenProps<T extends keyof DashboardTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<DashboardTabParamList, T>,
    AppStackScreenProps<keyof AppStackParamList>
  >;

const Tab = createBottomTabNavigator<DashboardTabParamList>();

export function DashboardNavigator() {
  const { bottom } = useSafeAreaInsets();
  const { transactionModel } = useStores() as RootStore;
  const navigation = useNavigation<any>();
  const analytics = useAnalytics();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [currentTab, setCurrentTab] = React.useState<string>("Home");

  const getTabBarHeight = () => {
    const baseHeight = 83;
    if (Platform.OS === 'android') {
      return baseHeight + bottom + (bottom > 0 ? 10 : 20);
    }
    return baseHeight + bottom;
  };

  const getTabBarPaddingBottom = () => {
    if (Platform.OS === 'android') {
      return bottom + (bottom > 0 ? 15 : 25);
    }
    return bottom + 17.55;
  };

  React.useEffect(() => {
    if (analytics) {
      registerAnalyticsService(analytics);
    }
  }, [analytics]);

  const isAnalyticsAvailable = React.useMemo(() => {
    return analytics && typeof analytics.trackTabClick === "function";
  }, [analytics]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAddButtonPress = useCallback(
    (e: GestureResponderEvent) => {
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

      navigation.navigate("Transaction", {
        transactionType: TransactionType.EXPENSE,
      });
    },
    [navigation, transactionModel, analytics]
  );

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
    <Tab.Navigator
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
          elevation: Platform.OS === 'android' ? 8 : 0,
          zIndex: Platform.OS === 'android' ? 1000 : 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
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
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabPress("Home");
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
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
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabPress("Budgets");
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionScreen as any}
        options={{
          tabBarButton: (props) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <TouchableOpacity
                {...props}
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
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
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
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabPress("Chatbot");
                props.onPress?.(e);
              }}
            />
          ),
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
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
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={(e) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabPress("Reports");
                props.onPress?.(e);
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

interface RootStore {
  transactionModel: {
    resetForNewTransaction: (type: TransactionType) => void;
  };
}
