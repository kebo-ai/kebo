import { observer } from "mobx-react-lite";
import logger from "@/utils/logger";
import React, { FC, useCallback, useEffect, useState } from "react";
import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  View,
  ScrollView,
  InteractionManager,
  RefreshControl,
} from "react-native";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import { useTheme } from "@/hooks/use-theme";
import tw from "@/hooks/use-tailwind";
import { translate } from "@/i18n";
import { KeboSadIconSvg } from "@/components/icons/kebo-sad-icon-svg";
import { budgetService } from "@/services/budget-service";
import { useCurrencyFormatter } from "@/components/common/CurrencyFormatter";
import { TransactionList } from "@/components/common/TransactionsList";
import { SwipeableListWrapper } from "@/components";
import * as Haptics from "expo-haptics";
import CustomBudgetCategoryCard from "@/components/common/CustomBudgetCategoryCard";
import { CategorySnapshotIn } from "@/models/category/category";
import { TransactionService } from "@/services/transaction-service";
import { showToast } from "@/components/ui/custom-toast";
import CustomAlert from "@/components/common/CustomAlert";

interface CategoryMetrics {
  budget_line_id: string;
  category_id: string;
  category_name: string;
  icon_url: string;
  icon_emoji: string | null;
  color_id: string | null;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category_name: string;
  category_id: string;
  category_icon_url?: string;
  subcategory: string;
  formatted_date: string;
  account_name: string;
  bank_name: string;
  bank_url?: string;
  transaction_type: "Income" | "Expense" | "Transfer";
  account_id: string;
  is_recurring: boolean;
}

interface CategoryDetails {
  category_metrics: CategoryMetrics;
  transactions: Transaction[];
}

interface BudgetDetailScreenProps {}

export const BudgetDetailScreen: FC<BudgetDetailScreenProps> = observer(
  function BudgetDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const params = useLocalSearchParams<{
      budgetId: string;
      categoryId: string;
    }>();
    const budgetId = params.budgetId;
    const categoryId = params.categoryId;
    const [categoryDetails, setCategoryDetails] =
      useState<CategoryDetails | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { formatAmount } = useCurrencyFormatter();
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<
      string | null
    >(null);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

    useEffect(() => {
      if (!budgetId || !categoryId) {
        router.back();
        return;
      }
    }, [budgetId, categoryId]);

    const loadCategoryDetails = async () => {
      if (!budgetId || !categoryId) return;

      try {
        const data = await budgetService.getBudgetCategoryDetails(
          budgetId,
          categoryId
        );

        if (!data || !data.category_metrics) {
          logger.error("Category details not found or invalid");
          router.back();
          return;
        }

        const enhancedTransactions = data.transactions.map(
          (transaction: Transaction) => ({
            ...transaction,
            category_icon_url:
              data.category_metrics?.icon_url ||
              data.category_metrics?.icon_emoji ||
              transaction.category_icon_url,
            category_id:
              data.category_metrics?.category_id || transaction.category_id,
            bank_url:
              transaction.bank_url ||
              `/storage/banks/${transaction.bank_name
                ?.toLowerCase()
                .replace(/\s+/g, "-")}.svg`,
          })
        );

        setCategoryDetails({
          ...data,
          transactions: enhancedTransactions,
        });
      } catch (error) {
        logger.error("Error loading category details:", error);
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (budgetId && categoryId) {
          loadCategoryDetails();
        }
      }, [budgetId, categoryId])
    );

    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      await loadCategoryDetails();
      setIsRefreshing(false);
    }, [budgetId, categoryId]);

    const handleEditTransaction = useCallback(
      (transaction: Transaction) => {
        router.push({
          pathname: "/(authenticated)/edit-transaction/[transactionId]",
          params: {
            transactionId: transaction.id,
            transactionType: transaction.transaction_type,
            transaction: JSON.stringify({
              ...transaction,
              category_icon_url:
                transaction.category_icon_url ||
                categoryDetails?.category_metrics?.icon_url ||
                categoryDetails?.category_metrics?.icon_emoji ||
                undefined,
            }),
          },
        });
      },
      [router, categoryDetails]
    );

    const renderTransactionItem = useCallback(
      (transaction: Transaction) => {
        const index = categoryDetails?.transactions.indexOf(transaction) ?? -1;
        return (
          <TransactionList
            key={transaction.id}
            transaction={{
              ...transaction,
              category_icon_url:
                transaction.category_icon_url ||
                categoryDetails?.category_metrics?.icon_url ||
                categoryDetails?.category_metrics?.icon_emoji ||
                undefined,
              category_id:
                transaction.category_id ||
                categoryDetails?.category_metrics?.category_id,
            }}
            handleEditTransaction={handleEditTransaction}
            index={index}
            transactions={categoryDetails?.transactions ?? []}
          />
        );
      },
      [handleEditTransaction, categoryDetails]
    );

    const handleDelete = useCallback((transactionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTransactionToDelete(transactionId);
      setIsDeleteAlertVisible(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
      if (!transactionToDelete) return;

      setIsDeleting(true);
      try {
        await TransactionService.deleteTransaction(transactionToDelete);
        showToast("success", translate("transactionScreen:deleteTransaction"));

        await loadCategoryDetails();
      } catch (error) {
        logger.error("Error deleting transaction:", error);
        showToast(
          "error",
          translate("transactionScreen:errorMessageTransaction")
        );
      } finally {
        setIsDeleting(false);
        setIsDeleteAlertVisible(false);
        setTransactionToDelete(null);
      }
    }, [transactionToDelete]);

    const handleCancelDelete = useCallback(() => {
      setIsDeleteAlertVisible(false);
      setTransactionToDelete(null);
    }, []);

    const headerOptions = {
      ...standardHeader(theme),
      headerShown: true,
      title: translate("budgetScreen:detailCategory"),
      headerBackTitle: translate("budgetScreen:detailBudget"),
    };

    const { category_metrics, transactions } = categoryDetails ?? {};

    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack.Screen options={headerOptions} />
        {!categoryDetails ? (
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
          <CustomBudgetCategoryCard
            category_metrics={category_metrics}
            router={router}
            editCategory={() => {
              const categoryForEdit: CategorySnapshotIn = {
                id: category_metrics.category_id,
                category_id: category_metrics.category_id,
                name: category_metrics.category_name,
                icon_url:
                  category_metrics.icon_url ||
                  category_metrics.icon_emoji ||
                  "",
                icon_emoji: category_metrics.icon_emoji,
                color_id: category_metrics.color_id,
                type: "Expense",
                user_id: "",
                is_visible: true,
              };

              router.push({
                pathname: "/(authenticated)/create-budget-category/[budgetId]",
                params: {
                  budgetId: budgetId,
                  isEditing: "true",
                  categoryId: categoryId,
                  amount: String(category_metrics.budgeted_amount),
                  selectedCategory: JSON.stringify(categoryForEdit),
                },
              });
            }}
          />

          <View style={tw`px-4 mt-2`}>
            <Text weight="semibold" color={theme.textPrimary}>
              {translate("homeScreen:titleTransaction")}
              <Text>💸👀</Text>
            </Text>
            <View
              style={tw`border border-[${theme.border}] rounded-[18px] overflow-hidden bg-[${theme.surface}] mt-2`}
            >
              {transactions.length === 0 ? (
                <View style={tw`py-8 items-center`}>
                  <KeboSadIconSvg width={50} height={50} />
                  <Text color={theme.textSecondary} style={tw`text-center mt-2`}>
                    {translate("transactionScreen:noTransaction")}
                  </Text>
                </View>
              ) : (
                <SwipeableListWrapper
                  data={transactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id}
                  onRowOpen={(rowKey) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setOpenRow(rowKey);
                  }}
                  onRowClose={() => setOpenRow(null)}
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
                />
              )}
            </View>
          </View>
        </ScrollView>
        )}
        <CustomAlert
          visible={isDeleteAlertVisible}
          title={translate("common:delete")}
          message={translate("transactionScreen:confirmDeleteTransaction")}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText={translate("common:delete")}
          cancelText={translate("common:cancel")}
          type="danger"
        />
      </View>
    );
  }
);
