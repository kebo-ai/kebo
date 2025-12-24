import { observer } from "mobx-react-lite";
import logger from "../../utils/logger";
import React, { FC, useCallback, useEffect, useState, useMemo } from "react";
import { AppStackScreenProps } from "../../navigators";
import { Screen } from "../../components/Screen";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  InteractionManager,
} from "react-native";
import { colors } from "../../theme/colors";
import tw from "../../utils/useTailwind";
import { translate } from "../../i18n";
import CustomHeaderSecondary from "../../components/custom/CustomHeaderSecondary";
import { KeboSadIconSvg } from "../../components/svg/KeboSadIconSvg";
import { budgetService } from "../../services/BudgetService";
import { useCurrencyFormatter } from "../../components/custom/CurrencyFormatter";
import { TransactionList } from "../../components/custom/TransactionsList";
import { SwipeableListWrapper } from "../../components";
import * as Haptics from "expo-haptics";
import CustomBudgetCategoryCard from "../../components/custom/CustomBudgetCategoryCard";
import { CategorySnapshotIn } from "../../models/category/category";
import { TransactionService } from "../../services/TransactionService";
import { showToast } from "../../components/ui/CustomToast";
import { useFocusEffect } from "@react-navigation/native";
import CustomAlert from "../../components/custom/CustomAlert";

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

export const BudgetDetailScreen: FC<AppStackScreenProps<"Budget">> = observer(
  function BudgetDetailScreen({
    navigation,
    route,
  }: AppStackScreenProps<"Budget">) {
    const budgetId = route.params?.budgetId;
    const categoryId = route.params?.categoryId;
    const [categoryDetails, setCategoryDetails] =
      useState<CategoryDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const { formatAmount } = useCurrencyFormatter();
    const [openRow, setOpenRow] = useState<string | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<
      string | null
    >(null);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);

    useEffect(() => {
      if (!budgetId || !categoryId) {
        logger.error("No budget ID or category ID provided");
        navigation.goBack();
        return;
      }
      loadCategoryDetails();
    }, [budgetId, categoryId]);

    const loadCategoryDetails = async () => {
      if (!budgetId || !categoryId) return;

      try {
        setLoading(true);
        const data = await budgetService.getBudgetCategoryDetails(
          budgetId,
          categoryId
        );
        if (!data || !data.category_metrics) {
          logger.error("Category details not found or invalid");
          navigation.goBack();
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
      } finally {
        setLoading(false);
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (budgetId && categoryId) {
          loadCategoryDetails();
        }
      }, [budgetId, categoryId])
    );

    const handleEditTransaction = useCallback(
      (transaction: Transaction) => {
        navigation.navigate("EditTransaction", {
          transactionId: transaction.id,
          transactionType: transaction.transaction_type,
          transaction: {
            ...transaction,
            category_icon_url:
              transaction.category_icon_url ||
              categoryDetails?.category_metrics?.icon_url ||
              categoryDetails?.category_metrics?.icon_emoji ||
              undefined,
          },
        });
      },
      [navigation, categoryDetails]
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

    if (loading) {
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
                onPress={() => {
                  navigation.navigate("Dashboard", {
                    screen: "Budgets",
                  });
                }}
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

    if (!categoryDetails) {
      return (
        <View style={tw`flex-1 items-center justify-center`}>
          <Text style={tw`text-[#606A84]`}>
            {translate("budgetScreen:budgetNotFound")}
          </Text>
        </View>
      );
    }

    const { category_metrics, transactions } = categoryDetails;

    return (
      <>
        <Screen
          safeAreaEdges={["top"]}
          preset="scroll"
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor="#FAFAFA"
          header={
            <CustomHeaderSecondary
              title={translate("budgetScreen:detailCategory")}
              onPress={() => navigation.goBack()}
            />
          }
        >
          <ScrollView style={tw`flex-1`}>
            <CustomBudgetCategoryCard
              category_metrics={category_metrics}
              navigation={navigation}
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

                navigation.navigate("CreateBudgetCategory", {
                  isEditing: true,
                  budgetId: budgetId,
                  categoryId: categoryId,
                  amount: category_metrics.budgeted_amount,
                  selectedCategory: categoryForEdit as any,
                });
              }}
            />

            <View style={tw`px-6 mt-2`}>
              <Text
                style={[tw`text-base`, { fontFamily: "SFUIDisplaySemiBold" }]}
              >
                {translate("homeScreen:titleTransaction")}
                <Text style={tw`text-base`}>💸👀</Text>
              </Text>
              <View
                style={tw`border border-[#EBEBEF] rounded-[18px] overflow-hidden bg-white mt-2`}
              >
                {transactions.length === 0 ? (
                  <View style={tw`py-8 items-center`}>
                    <KeboSadIconSvg width={50} height={50} />
                    <Text style={tw`text-[#606A84] text-center mt-2`}>
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
        </Screen>

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
      </>
    );
  }
);
