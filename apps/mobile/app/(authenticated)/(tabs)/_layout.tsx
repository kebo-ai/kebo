import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@/theme/colors";
import { translate } from "@/i18n";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { registerAnalyticsService } from "@/navigators/navigationUtilities";

const tabIcons = {
  home: {
    default: require("@/assets/tab-icons/home.png"),
    selected: require("@/assets/tab-icons/home-active.png"),
  },
  budget: {
    default: require("@/assets/tab-icons/budget.png"),
    selected: require("@/assets/tab-icons/budget-active.png"),
  },
  plus: {
    default: require("@/assets/tab-icons/plus.png"),
    selected: require("@/assets/tab-icons/plus-active.png"),
  },
  chatbot: {
    default: require("@/assets/tab-icons/chatbot.png"),
    selected: require("@/assets/tab-icons/chatbot-active.png"),
  },
  reports: {
    default: require("@/assets/tab-icons/reports.png"),
    selected: require("@/assets/tab-icons/reports-active.png"),
  },
};

export default function TabsLayout() {
  const analytics = useAnalytics();

  useEffect(() => {
    if (analytics) {
      registerAnalyticsService(analytics);
    }
  }, [analytics]);

  return (
    <NativeTabs
      tintColor={colors.primary}
      minimizeBehavior="onScrollDown"
      disableTransparentOnScrollEdge={true}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>{translate("navigator:home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={tabIcons.home} renderingMode="original" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budgets">
        <NativeTabs.Trigger.Label>{translate("navigator:budget")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={tabIcons.budget} renderingMode="original" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chatbot">
        <NativeTabs.Trigger.Label>{translate("navigator:chatbot")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={tabIcons.chatbot} renderingMode="original" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Label>{translate("navigator:reports")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={tabIcons.reports} renderingMode="original" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transaction-button">
        <NativeTabs.Trigger.Label>{translate("navigator:newTransaction")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={tabIcons.plus} renderingMode="original" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
