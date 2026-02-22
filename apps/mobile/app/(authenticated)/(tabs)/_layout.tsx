import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
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
        <Label>{translate("navigator:home")}</Label>
        <Icon src={tabIcons.home} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="budgets">
        <Label>{translate("navigator:budget")}</Label>
        <Icon src={tabIcons.budget} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chatbot">
        <Label>{translate("navigator:chatbot")}</Label>
        <Icon src={tabIcons.chatbot} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Label>{translate("navigator:reports")}</Label>
        <Icon src={tabIcons.reports} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transaction-button">
        <Label>{translate("navigator:newTransaction")}</Label>
        <Icon src={tabIcons.plus} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
