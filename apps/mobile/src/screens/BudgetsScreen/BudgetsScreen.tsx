import { observer } from "mobx-react-lite";
import React, { FC, useEffect, useState, useCallback, useRef } from "react";
import { AppStackScreenProps } from "../../navigators";
import { Screen } from "../../components/Screen";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import tw from "../../utils/useTailwind";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { translate } from "../../i18n";
import CustomHeaderSecondary from "../../components/custom/CustomHeaderSecondary";
import { KeboSadIconSvg } from "../../components/svg/KeboSadIconSvg";
import CustomBudgetCard from "../../components/custom/CustomBudgetCard";
import { budgetService } from "../../services/BudgetService";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { SwipeableListWrapper } from "../../components";
import { RowMap } from "react-native-swipe-list-view";
import CustomAlert from "../../components/custom/CustomAlert";
import { showToast } from "../../components/ui/CustomToast";
import { InteractionManager } from "react-native";
import BudgetIntroSlider from "../../components/custom/BudgetIntroSlider";
import { load, save, remove } from "../../utils/storage/storage";
import { supabase } from "../../config/supabase";
import logger from "../../utils/logger";
import moment from "moment";
import { useAnalytics } from "../../hooks/useAnalytics";

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

interface BudgetsScreenProps extends AppStackScreenProps<"Budgets"> {}

export const BudgetsScreen: FC<BudgetsScreenProps> = observer(
  function BudgetsScreen({ navigation }: BudgetsScreenProps) {
    const analytics = useAnalytics();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showIntroSlider, setShowIntroSlider] = useState(false);
    const [isCheckingIntro, setIsCheckingIntro] = useState(true);
    const [userName, setUserName] = useState("");

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
        image: require("../../assets/images/budget-management.png"),
      },
      {
        key: "budget-goals",
        title: translate(TRANSLATIONS.welcome),
        text: translate(TRANSLATIONS.slide2Text),
        image: require("../../assets/images/budget-goals.png"),
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
    }, [navigation, isInitialLoad]);

    useEffect(() => {
      checkAndLoadBudgets();
    }, [checkAndLoadBudgets]);

    useFocusEffect(
      useCallback(() => {
        checkAndLoadBudgets();
      }, [checkAndLoadBudgets])
    );

    const handleDelete = useCallback((budgetId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setBudgetToDelete(budgetId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!budgetToDelete) return;

      setIsDeleting(true);
      try {
        const success = await budgetService.deleteBudget(budgetToDelete);
        if (success) {
          showToast("success", translate("budgetScreen:budgetDeleted"));
          await checkAndLoadBudgets();
        } else {
          showToast("error", translate("budgetScreen:errorDeletingBudget"));
        }
      } catch (error) {
        logger.error("Error deleting budget:", error);
        showToast("error", translate("budgetScreen:errorDeletingBudget"));
      } finally {
        setIsDeleting(false);
        setIsDeleteAlertVisible(false);
        setBudgetToDelete(null);
      }
    }, [budgetToDelete, checkAndLoadBudgets]);

    const onRowClose = useCallback(() => setOpenRow(null), []);

    const handleScroll = useCallback(() => {
      if (openRow) {
        setOpenRow(null);
      }
    }, [openRow]);

    const handleAddBudgetPress = useCallback(() => {
      try {
        // analytics.trackEvent("budget_add_button_clicked", {
        //   screen_name: "BudgetsScreen",
        //   action_type: "click",
        //   interaction_type: "button",
        //   action: "add_budget",
        // });
        logger.debug("Analytics tracked for add budget button");
      } catch (error) {
        logger.debug("Analytics error:", error);
      }
      navigation.navigate("NewBudget");
    }, [analytics, navigation]);

    useFocusEffect(
      useCallback(() => {
        return () => {
          setOpenRow(null);
        };
      }, [])
    );

    const parseDate = (dateString: string) => {
      return moment(dateString, "DD/MM/YYYY").toDate();
    };

    const renderBudgetItem = useCallback(
      (budgetData: Budget) => (
        <View style={tw`py-1 bg-[#FAFAFA]`}>
          <TouchableOpacity
            style={tw`bg-[#FAFAFA]`}
            onPress={() => {
              navigation.navigate("Budget", {
                budgetId: budgetData.budget.id,
              });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <CustomBudgetCard
              budget={budgetData}
              isSwipeOpen={openRow === budgetData.id}
              onArrowPress={() => {
                navigation.navigate("Budget", {
                  budgetId: budgetData.budget.id,
                });
              }}
            />
          </TouchableOpacity>
        </View>
      ),
      [navigation, openRow]
    );

    const renderHiddenItem = useCallback(
      (data: { item: Budget }, rowMap: RowMap<Budget>) => (
        <View
          style={[
            tw`flex-1 flex-row justify-end items-stretch py-1`,
            {
              backgroundColor: "#FAFAFA",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              tw`bg-[${colors.secondary}] w-20 justify-center items-center rounded-r-3xl`,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setTimeout(() => {
                handleDelete(data.item.budget.id);
              }, 100);
            }}
          >
            <MaterialIcons name="delete" size={28} color={colors.white} />
            <Text
              style={[
                tw`text-xs mt-1 text-white`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {translate("common:delete")}
            </Text>
          </TouchableOpacity>
        </View>
      ),
      [handleDelete]
    );

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
      <Screen
        safeAreaEdges={["top"]}
        preset="scroll"
        backgroundColor="#FAFAFA"
        statusBarBackgroundColor="#FAFAFA"
        header={
          <CustomHeaderSecondary
            title={translate("budgetScreen:budget")}
            showPrimaryIcon={false}
          />
        }
      >
        <ScrollView
          style={tw`flex-1 px-6`}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={true}
          bounces={true}
          overScrollMode="always"
        >
          {loading && budgets.length > 0 && (
            <View style={tw`py-2 items-center`}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
          <TouchableOpacity
            style={tw`mt-4 flex-row bg-white items-center justify-center rounded-full py-2 border border-[${colors.primary}]`}
            onPress={handleAddBudgetPress}
          >
            <View
              style={tw`bg-[#C4A8FF] h-[28px] w-[28px] rounded-lg items-center justify-center`}
            >
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text
              style={[
                tw`text-[${colors.primary}] ml-2 text-sm ml-4`,
                { fontFamily: "SFUIDisplaySemiBold" },
              ]}
            >
              {translate("budgetScreen:addBudget")}
            </Text>
          </TouchableOpacity>
          {budgets.length === 0 ? (
            <View style={tw`items-center mt-10`}>
              <KeboSadIconSvg width={50} height={50} />
              <Text style={tw`text-[#606A84] text-center mt-2`}>
                {translate("budgetScreen:noBudgets")}
              </Text>
            </View>
          ) : (
            <View style={tw`mt-4 mb-20`}>
              <SwipeableListWrapper
                data={budgets}
                renderItem={renderBudgetItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-80}
                disableRightSwipe
                keyExtractor={(item) => item.id}
                onRowOpen={(rowKey) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setOpenRow(rowKey);
                }}
                onRowClose={onRowClose}
                useNativeDriver={true}
                onSwipeStart={() => {
                  InteractionManager.runAfterInteractions(() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  });
                }}
                onSwipeEnd={() => {}}
                onDelete={handleDelete}
                rightThreshold={70}
                deleteButtonStyle={`bg-[${colors.secondary}]`}
                containerStyle="bg-[#FAFAFA]"
              />
            </View>
          )}
        </ScrollView>
        <CustomAlert
          visible={isDeleteAlertVisible}
          title={translate("budgetScreen:deleteBudget")}
          message={translate("budgetScreen:deleteConfirmationMessage")}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteAlertVisible(false);
            setBudgetToDelete(null);
          }}
          type="danger"
          confirmText={translate("common:delete")}
          cancelText={translate("common:cancel")}
        />
      </Screen>
    );
  }
);
