import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState, useCallback, useRef } from "react";
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
import { KeboSadIconSvg } from "@/components/icons/KeboSadIconSvg";
import CustomBudgetCard from "@/components/common/CustomBudgetCard";
import { budgetService } from "@/services/budget-service";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { showToast } from "@/components/ui/CustomToast";
import BudgetIntroSlider from "@/components/common/BudgetIntroSlider";
import { load, save } from "@/utils/storage/storage";
import { supabase } from "@/config/supabase";
import logger from "@/utils/logger";
import moment from "moment";
import { useAnalytics } from "@/hooks/use-analytics";

interface BudgetOption {
  id: string;
  custom_name: string;
  start_date: string;
  end_date: string;
  is_recurrent: boolean;
  budget_amount: number;
  user_id: string;
}

interface Budget {
  id: string;
  budget: BudgetOption;
  total_metrics: {
    total_amount: number;
    total_spent: number;
    total_remaining: number;
    total_budget: number;
    overall_progress_percentage: number;
  };
}

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
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showIntroSlider, setShowIntroSlider] = useState(false);
    const [isCheckingIntro, setIsCheckingIntro] = useState(true);
    const [userName, setUserName] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const swipeableRefs = useRef<Record<string, Swipeable | null>>({});

    useEffect(() => {
      const getUserData = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserName(user?.user_metadata.full_name || "");
      };
      getUserData();
    }, []);

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

    const parseDate = (dateString: string) => {
      return moment(dateString, "DD/MM/YYYY").toDate();
    };

    const checkAndLoadBudgets = useCallback(async () => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const budgetsList = await budgetService.listBudgets();

        const sortedBudgets = [...budgetsList].sort((a, b) => {
          const dateA = parseDate(a.budget.start_date);
          const dateB = parseDate(b.budget.start_date);

          if (dateA.getTime() === dateB.getTime()) {
            return b.budget.id.localeCompare(a.budget.id);
          }
          return dateB.getTime() - dateA.getTime();
        });

        const budgetsWithId = sortedBudgets.map((budget) => ({
          ...budget,
          id: budget.budget.id,
        }));

        setBudgets(budgetsWithId);
      } catch (error) {
        logger.error("Error checking/loading budgets:", error);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    }, [isInitialLoad]);

    useEffect(() => {
      checkAndLoadBudgets();
    }, [checkAndLoadBudgets]);

    useFocusEffect(
      useCallback(() => {
        checkAndLoadBudgets();
      }, [checkAndLoadBudgets])
    );

    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      await checkAndLoadBudgets();
      setIsRefreshing(false);
    }, [checkAndLoadBudgets]);

    const handleDelete = useCallback((budgetId: string) => {
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
                const success = await budgetService.deleteBudget(budgetId);
                if (success) {
                  showToast("success", translate("budgetScreen:budgetDeleted"));
                  await checkAndLoadBudgets();
                } else {
                  showToast("error", translate("budgetScreen:errorDeletingBudget"));
                }
              } catch (error) {
                logger.error("Error deleting budget:", error);
                showToast("error", translate("budgetScreen:errorDeletingBudget"));
              }
            },
          },
        ]
      );
    }, [checkAndLoadBudgets]);

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

    if (loading && budgets.length === 0) {
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
            {loading && budgets.length > 0 && (
              <View style={tw`py-2 items-center`}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            {budgets.length === 0 ? (
              <View style={tw`items-center mt-10`}>
                <KeboSadIconSvg width={50} height={50} />
                <Text color={theme.textSecondary} style={tw`text-center mt-2`}>
                  {translate("budgetScreen:noBudgets")}
                </Text>
              </View>
            ) : (
              <View style={tw`mt-2 mb-20 gap-3`}>
                {budgets.map((budgetData) => (
                  <Swipeable
                    key={budgetData.id}
                    ref={(ref) => { swipeableRefs.current[budgetData.id] = ref; }}
                    renderRightActions={(progress) =>
                      renderRightActions(progress, budgetData.budget.id)
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
                          params: { budgetId: budgetData.budget.id },
                        });
                      }}
                    >
                      <CustomBudgetCard
                        budget={budgetData}
                        onArrowPress={() => {
                          router.push({
                            pathname: "/(authenticated)/budget/[budgetId]",
                            params: { budgetId: budgetData.budget.id },
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
