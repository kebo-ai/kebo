import React, { FC, useCallback, useMemo, useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import { useTheme } from "@/hooks/use-theme";
import tw from "@/hooks/use-tailwind";
import { translate } from "@/i18n";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import { CategoriesListBudget } from "@/components/common/categories-list-budget";
import CustomBudgetCard from "@/components/common/custom-budget-card";
import { CategoryItem } from "@/components/common/category-item";
import type { Category } from "@/lib/api/types";
import { useBudget, useCategories, useRemoveBudgetLine } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/keys";
import { showToast } from "@/components/ui/custom-toast";
import * as Haptics from "expo-haptics";
import { translateCategoryName } from "@/utils/category-translations";
import logger from "@/utils/logger";

interface BudgetScreenProps {}

export const BudgetScreen: FC<BudgetScreenProps> =
  function BudgetScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<{
      budgetId: string;
      categoryId?: string;
    }>();

    const budgetId = params.budgetId;
    const { data, isLoading } = useBudget(budgetId);
    const { data: categories = [] } = useCategories();
    const removeLineMutation = useRemoveBudgetLine();
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      await queryClient.refetchQueries({ queryKey: queryKeys.budgets.detail(budgetId) });
      setIsRefreshing(false);
    }, [budgetId, queryClient]);

    const handleCategorySelect = useCallback(
      (category: Category) => {
        const isAlreadyAdded = data?.budget_lines.some(
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
      [data, budgetId, router]
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
        if (!data) return;
        try {
          await removeLineMutation.mutateAsync({
            budgetId,
            categoryId,
            currentBudget: data,
          });
          showToast("success", translate("budgetScreen:categoryRemoved"));
        } catch (error) {
          logger.error("Error deleting category:", error);
          showToast("error", translate("budgetScreen:errorRemovingCategory"));
        }
      },
      [budgetId, data, removeLineMutation]
    );

    const handleConfirmDeleteCategory = useCallback((categoryId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert(
        translate("budgetScreen:deleteCategory"),
        translate("budgetScreen:deleteCategoryConfirmationMessage"),
        [
          { text: translate("common:cancel"), style: "cancel" },
          {
            text: translate("common:delete"),
            style: "destructive",
            onPress: () => {
              handleDeleteCategory(categoryId);
            },
          },
        ]
      );
    }, [handleDeleteCategory]);

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
      if (!data) return;
      router.push({
        pathname: "/(authenticated)/budget/new",
        params: {
          isEditing: "true",
          budgetId: budgetId,
          budgetData: JSON.stringify({
            custom_name: data.custom_name,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString(),
          }),
        },
      });
    }, [router, budgetId, data]);

    const budgetCard = useMemo(() => {
      if (!data) return null;
      return {
        budget: {
          custom_name: data.custom_name || "",
          start_date: data.start_date,
          end_date: data.end_date,
        },
        total_metrics: {
          total_budget: Number(data.total_metrics.total_budget),
          total_spent: Number(data.total_metrics.total_spent),
          total_remaining: Number(data.total_metrics.total_remaining),
          overall_progress_percentage: Number(data.total_metrics.overall_progress_percentage),
        },
      };
    }, [data]);

    const budgetLines = useMemo(() => {
      if (!data) return [];
      return data.budget_lines
        .map((line) => ({
          id: line.id,
          category_id: line.category_id,
          category_name: line.category_name || "",
          icon_url: line.icon_url || "",
          icon_emoji: line.icon_emoji || null,
          color_id: line.color_id || null,
          amount: Number(line.amount),
          spent_amount: Number(line.spent_amount || 0),
          remaining_amount: Number(line.remaining_amount || 0),
          progress_percentage: Number(line.progress_percentage || 0),
        }))
        .sort((a, b) => b.id.localeCompare(a.id));
    }, [data]);

    const headerOptions = {
      ...standardHeader(theme),
      headerShown: true,
      title: translate("budgetScreen:detailBudget"),
      headerBackTitle: translate("budgetScreen:budget"),
    };

    const availableCategories = data
      ? categories.filter(
          (category) =>
            category.type === "Expense" &&
            !data.budget_lines.some(
              (line) => line.category_id === category.id
            )
        )
      : [];

    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack.Screen options={headerOptions} />
        {isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !data ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <KeboSadIconSvg width={50} height={50} />
            <Text color={theme.textSecondary} style={tw`mt-2`}>
              {translate("budgetScreen:budgetNotFound")}
            </Text>
          </View>
        ) : (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={tw`px-4 py-4`}>
            <CustomBudgetCard
              budget={budgetCard!}
              onEditPress={handleEditPress}
            />
            <View style={tw`mt-4`}>
              <Text weight="medium" color={theme.textPrimary}>
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
                {availableCategories.map((category) => (
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
                    style={tw`mt-2 w-[42px] h-[42px] bg-[${colors.primary}] rounded-lg items-center justify-center`}
                  >
                    <Text style={tw`text-white text-2xl`}>+</Text>
                  </View>
                  <Text type="xs" color={theme.textSecondary} style={tw`mt-2 text-center`}>
                    {translate("components:categoryModal.add")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            <View
              style={tw`py-2 bg-[${theme.surface}] border border-[${theme.border}] rounded-[20px] mt-4`}
            >
              {budgetLines.length === 0 ? (
                <View style={tw`items-center py-8`}>
                  <KeboSadIconSvg width={50} height={50} />
                  <Text color={theme.textSecondary} style={tw`text-center mt-2`}>
                    {translate("budgetScreen:noCategory")}
                  </Text>
                </View>
              ) : (
                <View>
                  <CategoriesListBudget
                    data={budgetLines}
                    onCategoryPress={handleCategoryPress}
                    onConfirmDelete={handleConfirmDeleteCategory}
                    onRowOpen={onRowOpen}
                    onRowClose={onRowClose}
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        )}
      </View>
    );
  };
