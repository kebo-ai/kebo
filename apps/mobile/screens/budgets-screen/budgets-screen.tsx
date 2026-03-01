import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Text, Icon } from "@/components/ui";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/use-theme";
import tw from "@/hooks/use-tailwind";
import { Ionicons } from "@expo/vector-icons";
import { translate } from "@/i18n";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import CustomBudgetCard from "@/components/common/custom-budget-card";
import { useBudgets, useDeleteBudget } from "@/lib/api/hooks";
import { useProfile } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/keys";
import { Stack, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { showToast } from "@/components/ui/custom-toast";
import BudgetIntroSlider from "@/components/common/budget-intro-slider";
import { load, save } from "@/utils/storage/storage";
import logger from "@/utils/logger";
import moment from "moment";
import { useAnalytics } from "@/hooks/use-analytics";

interface Slide {
  key: string;
  title: string;
  text: string;
  image: any;
}

interface BudgetsScreenProps {}

export const BudgetsScreen: FC<BudgetsScreenProps> = observer(
  function BudgetsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const analytics = useAnalytics();
    const queryClient = useQueryClient();
    const { data: budgetsData, isLoading: loading } = useBudgets();
    const { data: profile } = useProfile();
    const deleteBudgetMutation = useDeleteBudget();
    const [showIntroSlider, setShowIntroSlider] = useState(false);
    const [isCheckingIntro, setIsCheckingIntro] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

    const userName = profile?.full_name || "";

    const budgets = useMemo(() => {
      if (!budgetsData) return [];
      return [...budgetsData].sort((a, b) => {
        const dateA = moment(a.start_date).valueOf();
        const dateB = moment(b.start_date).valueOf();
        return dateB - dateA;
      });
    }, [budgetsData]);

    const budgetItems = useMemo(() => {
      return budgets.map((b) => ({
        id: b.id,
        budget: {
          custom_name: b.custom_name || "",
          start_date: b.start_date,
          end_date: b.end_date,
        },
        total_metrics: {
          total_budget: Number(b.budget_amount),
          total_spent: Number(b.total_spent || 0),
          total_remaining: Number(b.total_remaining || 0),
          overall_progress_percentage: Number(b.progress_percentage || 0),
        },
      }));
    }, [budgets]);

    const TRANSLATIONS = {
      welcome: "budgetOnboarding:welcome" as const,
      slide1Text: "budgetOnboarding:slide1.text" as const,
      slide2Text: "budgetOnboarding:slide2.text" as const,
      buttonNext: "budgetOnboarding:buttons.next" as const,
      buttonDone: "budgetOnboarding:buttons.done" as const,
    };

    const introSlides: Slide[] = [
      {
        key: "budget-management",
        title: translate(TRANSLATIONS.welcome),
        text: translate(TRANSLATIONS.slide1Text),
        image: require("@/assets/images/budget-management.png"),
      },
      {
        key: "budget-goals",
        title: translate(TRANSLATIONS.welcome),
        text: translate(TRANSLATIONS.slide2Text),
        image: require("@/assets/images/budget-goals.png"),
      },
    ];

    const checkIntroShown = useCallback(async () => {
      try {
        const hasShownIntro = await load<boolean>("budget_intro_shown");
        setShowIntroSlider(!hasShownIntro);
      } catch (error) {
        logger.error("Error checking intro status:", error);
        setShowIntroSlider(false);
      } finally {
        setIsCheckingIntro(false);
      }
    }, []);

    const markIntroAsShown = useCallback(async () => {
      try {
        await save("budget_intro_shown", true);
        setShowIntroSlider(false);
      } catch (error) {
        logger.error("Error saving intro status:", error);
        setShowIntroSlider(false);
      }
    }, []);

    useEffect(() => {
      checkIntroShown();
    }, [checkIntroShown]);

    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      await queryClient.refetchQueries({ queryKey: queryKeys.budgets.all });
      setIsRefreshing(false);
    }, [queryClient]);

    const handleDelete = useCallback(
      (budgetId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        swipeableRefs.current[budgetId]?.close();
        Alert.alert(
          translate("budgetScreen:deleteBudget"),
          translate("budgetScreen:deleteConfirmationMessage"),
          [
            { text: translate("common:cancel"), style: "cancel" },
            {
              text: translate("common:delete"),
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteBudgetMutation.mutateAsync(budgetId);
                  showToast(
                    "success",
                    translate("budgetScreen:budgetDeleted")
                  );
                } catch (error) {
                  logger.error("Error deleting budget:", error);
                  showToast(
                    "error",
                    translate("budgetScreen:errorDeletingBudget")
                  );
                }
              },
            },
          ]
        );
      },
      [deleteBudgetMutation]
    );

    const renderRightActions = useCallback(
      (progress: Animated.AnimatedInterpolation<number>, budgetId: string) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [80, 0],
        });

        return (
          <Animated.View
            style={[
              tw`w-20 items-center justify-center rounded-r-3xl`,
              { backgroundColor: colors.secondary, transform: [{ translateX }] },
            ]}
          >
            <TouchableOpacity
              style={tw`flex-1 w-full items-center justify-center`}
              onPress={() => handleDelete(budgetId)}
            >
              <Icon symbol="trash" size={24} color={colors.white} />
              <Text type="xs" weight="medium" color="white" style={tw`mt-1`}>
                {translate("common:delete")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      },
      [handleDelete]
    );

    const handleAddBudgetPress = useCallback(() => {
      try {
        logger.debug("Analytics tracked for add budget button");
      } catch (error) {
        logger.debug("Analytics error:", error);
      }
      router.push("/(authenticated)/budget/new");
    }, [analytics, router]);

    if (isCheckingIntro) {
      return (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (showIntroSlider) {
      return (
        <BudgetIntroSlider
          slides={introSlides}
          onDone={markIntroAsShown}
          name={userName}
        />
      );
    }

    if (loading && budgetItems.length === 0) {
      return (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <>
        <Stack.Screen
          options={{
            title: translate("budgetScreen:budget"),
            headerRight: () => (
              <TouchableOpacity
                onPress={handleAddBudgetPress}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(105, 52, 210, 0.1)", borderRadius: 20 }}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
                <Text type="sm" weight="semibold" color={colors.primary}>
                  {translate("budgetScreen:addBudget")}
                </Text>
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={tw`px-4 py-4`}>
            {loading && budgetItems.length > 0 && (
              <View style={tw`py-2 items-center`}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            {budgetItems.length === 0 ? (
              <View style={tw`items-center mt-10`}>
                <KeboSadIconSvg width={50} height={50} />
                <Text color={theme.textSecondary} style={tw`text-center mt-2`}>
                  {translate("budgetScreen:noBudgets")}
                </Text>
              </View>
            ) : (
              <View style={tw`mt-2 mb-20 gap-3`}>
                {budgetItems.map((budgetData) => (
                  <Swipeable
                    key={budgetData.id}
                    ref={(ref) => { swipeableRefs.current[budgetData.id] = ref; }}
                    renderRightActions={(progress) =>
                      renderRightActions(progress, budgetData.id)
                    }
                    rightThreshold={40}
                    overshootRight={false}
                    onSwipeableWillOpen={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Close other open rows
                      Object.entries(swipeableRefs.current).forEach(([id, ref]) => {
                        if (id !== budgetData.id && ref) ref.close();
                      });
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push({
                          pathname: "/(authenticated)/budget/[budgetId]",
                          params: { budgetId: budgetData.id },
                        });
                      }}
                    >
                      <CustomBudgetCard
                        budget={budgetData}
                        onArrowPress={() => {
                          router.push({
                            pathname: "/(authenticated)/budget/[budgetId]",
                            params: { budgetId: budgetData.id },
                          });
                        }}
                      />
                    </TouchableOpacity>
                  </Swipeable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </>
    );
  }
);
