import { observer } from "mobx-react-lite";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { colors } from "@/theme/colors";
import tw from "@/hooks/useTailwind";
import { translate } from "@/i18n";
import CustomHeaderSecondary from "@/components/common/CustomHeaderSecondary";
import { KeboSadIconSvg } from "@/components/icons/KeboSadIconSvg";
import { CategoriesListBudget } from "@/components/common/CategoriesListBudget";
import CustomBudgetCard from "@/components/common/CustomBudgetCard";
import { budgetService } from "@/services/BudgetService";
import { CategoryItem } from "@/components/common/CategoryItem";
import { BudgetResponse } from "@/types/transaction";
import { Category } from "@/models/category/category";
import { useStores } from "@/models";
import { showToast } from "@/components/ui/CustomToast";
import CustomAlert from "@/components/common/CustomAlert";
import * as Haptics from "expo-haptics";
import moment from "moment";
import "moment/locale/es";
import i18n from "@/i18n/i18n";
import { translateCategoryName } from "@/utils/categoryTranslations";
import logger from "@/utils/logger";

const ensureValidMomentLocale = () => {
  try {
    const currentLocale = i18n.language?.split("-")[0] || "en";
    if (!moment.localeData(currentLocale)) {
      moment.locale("en");
    } else {
      moment.locale(currentLocale);
    }
  } catch (error) {
    logger.warn("Error setting moment locale:", error);
    moment.locale("en");
  }
};

interface BudgetScreenProps {}

export const BudgetScreen: FC<BudgetScreenProps> = observer(
  function BudgetScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
      budgetId: string;
      categoryId?: string;
    }>();

    const budgetId = params.budgetId;
    const [budgetData, setBudgetData] = useState<BudgetResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { categoryStoreModel } = useStores();
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
      null
    );
    const [openRow, setOpenRow] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
      ensureValidMomentLocale();
    }, []);

    useEffect(() => {
      if (!budgetId) {
        logger.error("No budget ID provided");
        router.back();
        return;
      }
      loadBudget(true);
    }, [budgetId]);

    const loadBudget = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
        ensureValidMomentLocale();

        const data = await budgetService.getBudgetById(budgetId);
        if (!data) {
          logger.error("Budget not found");
          router.back();
          return;
        }
        setBudgetData(data);
        hasLoadedRef.current = true;
      } catch (error) {
        logger.error("Error loading budget:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      categoryStoreModel.getCategories();
    }, []);

    useFocusEffect(
      useCallback(() => {
        categoryStoreModel.getCategories();
        if (hasLoadedRef.current) {
          loadBudget(false);
        }
      }, [budgetId])
    );

    const handleCategorySelect = useCallback(
      (category: Category) => {
        const isAlreadyAdded = budgetData?.budget_lines.some(
          (line) => line.category_id === category.id
        );
        if (isAlreadyAdded) {
          showToast("warning", translate("budgetScreen:categoryAlreadyAdded"));
          return;
        }
        router.push({
          pathname: "/(authenticated)/create-budget-category/[budgetId]",
          params: {
            budgetId: budgetId,
            selectedCategory: JSON.stringify(category),
          },
        });
      },
      [budgetData, budgetId, router]
    );

    const navigateToNewCategory = useCallback(() => {
      router.push({
        pathname: "/(authenticated)/new-category",
        params: {
          previousScreen: "Budget",
        },
      });
    }, [router]);

    const handleDeleteCategory = useCallback(
      async (categoryId: string) => {
        try {
          const success = await budgetService.removeBudgetCategory(
            budgetId,
            categoryId
          );
          if (success) {
            showToast("success", translate("budgetScreen:categoryRemoved"));
            loadBudget(false);
          } else {
            showToast("error", translate("budgetScreen:errorRemovingCategory"));
          }
        } catch (error) {
          logger.error("Error deleting category:", error);
          showToast("error", translate("budgetScreen:errorRemovingCategory"));
        }
      },
      [budgetId]
    );

    const handleConfirmDelete = useCallback(async () => {
      if (categoryToDelete) {
        await handleDeleteCategory(categoryToDelete);
      } else {
      }
      setIsDeleteAlertVisible(false);
      setCategoryToDelete(null);
    }, [categoryToDelete, handleDeleteCategory]);

    const handleConfirmDeleteCategory = useCallback((categoryId: string) => {
      setCategoryToDelete(categoryId);
      setIsDeleteAlertVisible(true);
    }, []);

    const onRowClose = useCallback(() => setOpenRow(null), []);

    const onRowOpen = useCallback((rowKey: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setOpenRow(rowKey);
    }, []);

    const navigateToBudgetsTab = useCallback(() => {
      router.push("/(authenticated)/(tabs)/budgets");
    }, [router]);

    const handleCategoryPress = useCallback((categoryId: string) => {
      router.push({
        pathname: "/(authenticated)/budget-detail/[budgetId]",
        params: {
          budgetId,
          categoryId,
        },
      });
    }, [router, budgetId]);

    const handleEditPress = useCallback(() => {
      router.push({
        pathname: "/(authenticated)/budget/new",
        params: {
          isEditing: "true",
          budgetId: budgetId,
          budgetData: JSON.stringify({
            custom_name: budgetData?.budget.custom_name,
            start_date: parseDate(
              budgetData?.budget.start_date || ""
            ).toISOString(),
            end_date: parseDate(
              budgetData?.budget.end_date || ""
            ).toISOString(),
          }),
        },
      });
    }, [router, budgetId, budgetData]);

    if (isLoading) {
      return (
        <>
          <Screen
            safeAreaEdges={["top"]}
            preset="scroll"
            backgroundColor="#FAFAFA"
            statusBarBackgroundColor="#FAFAFA"
            header={
              <CustomHeaderSecondary
                title={translate("budgetScreen:detailBudget")}
                onPress={navigateToBudgetsTab}
              />
            }
          >
            <View style={tw`px-6 py-4`}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </Screen>
        </>
      );
    }

    if (isRefreshing) {
      return (
        <>
          <Screen
            safeAreaEdges={["top"]}
            preset="scroll"
            backgroundColor="#FAFAFA"
            statusBarBackgroundColor="#FAFAFA"
            header={
              <CustomHeaderSecondary
                title={translate("budgetScreen:detailBudget")}
                onPress={navigateToBudgetsTab}
              />
            }
          >
            <View style={tw`px-6 py-4`}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </Screen>
        </>
      );
    }

    if (!budgetData) {
      return (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-[#606A84]`}>
            {translate("budgetScreen:budgetNotFound")}
          </Text>
        </View>
      );
    }

    const availableCategories = categoryStoreModel.categories.filter(
      (category) =>
        category.type === "Expense" &&
        !budgetData.budget_lines.some(
          (line) => line.category_id === category.id
        )
    );

    const parseDate = (dateString: string) => {
      try {
        ensureValidMomentLocale();

        const parsedDate = moment(dateString, "DD/MM/YYYY");
        if (parsedDate.isValid()) {
          return parsedDate.toDate();
        }

        const isoDate = moment(dateString);
        if (isoDate.isValid()) {
          return isoDate.toDate();
        }

        logger.warn("Invalid date format:", dateString);
        return new Date();
      } catch (error) {
        logger.warn("Error parsing date:", error);
        return new Date();
      }
    };

    return (
      <>
        <Screen
          safeAreaEdges={["top"]}
          preset="scroll"
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor="#FAFAFA"
          header={
            <CustomHeaderSecondary
              title={translate("budgetScreen:detailBudget")}
              onPress={navigateToBudgetsTab}
            />
          }
        >
          <View style={tw`px-6 mb-4`}>
            <CustomBudgetCard
              budget={{
                budget: {
                  custom_name: budgetData.budget.custom_name,
                  start_date: parseDate(
                    budgetData.budget.start_date
                  ).toISOString(),
                  end_date: parseDate(budgetData.budget.end_date).toISOString(),
                },
                total_metrics: budgetData.total_metrics,
              }}
              onEditPress={handleEditPress}
            />
            <View style={tw`mt-4`}>
              <Text
                style={[
                  tw`text-black text-base`,
                  { fontFamily: "SFUIDisplayMedium" },
                ]}
              >
                {translate("budgetScreen:subtitle")}
              </Text>
            </View>
            <View style={tw`mt-2`}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={tw`flex-1`}
                contentContainerStyle={tw`gap-1`}
              >
                {availableCategories.map( (category) => (
                  <View key={category.id} style={tw`items-center`}>
                    <TouchableOpacity
                      style={tw`rounded-lg`}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <CategoryItem
                        item={{
                          ...category,
                          name: translateCategoryName(category.name),
                        }}
                        onSelect={() => handleCategorySelect(category)}
                        showActions={false}
                        setShowActions={() => {}}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={tw`items-center justify-center w-[70px]`}
                  onPress={navigateToNewCategory}
                >
                  <View
                    style={tw`mt-2 w-[42px] h-[42px] bg-[#6934D2] rounded-lg items-center justify-center`}
                  >
                    <Text style={tw`text-white text-2xl`}>+</Text>
                  </View>
                  <Text style={tw`text-xs mt-2 text-[#606A84] text-center `}>
                    {translate("components:categoryModal.add")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            <View
              style={tw`py-2 bg-white border border-[#EBEBEF] rounded-[20px] mt-4`}
            >
              {budgetData.budget_lines.length === 0 ? (
                <View style={tw`items-center py-8`}>
                  <KeboSadIconSvg width={50} height={50} />
                  <Text style={tw`text-[#606A84] text-center mt-2`}>
                    {translate("budgetScreen:noCategory")}
                  </Text>
                </View>
              ) : (
                <View>
                  <CategoriesListBudget
                    data={budgetData.budget_lines.sort((a, b) => {
                      return b.id.localeCompare(a.id);
                    })}
                    onCategoryPress={handleCategoryPress}
                    onConfirmDelete={handleConfirmDeleteCategory}
                    onRowOpen={onRowOpen}
                    onRowClose={onRowClose}
                  />
                </View>
              )}
            </View>
          </View>
        </Screen>
        <CustomAlert
          visible={isDeleteAlertVisible}
          title={translate("budgetScreen:deleteCategory")}
          message={translate("budgetScreen:deleteCategoryConfirmationMessage")}
          onConfirm={() => {
            handleConfirmDelete();
          }}
          onCancel={() => {
            setIsDeleteAlertVisible(false);
            setCategoryToDelete(null);
          }}
          type="danger"
          confirmText={translate("common:delete")}
          cancelText={translate("common:cancel")}
        />
      </>
    );
  }
);
